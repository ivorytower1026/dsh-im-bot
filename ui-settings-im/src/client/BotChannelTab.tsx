/**
 * Bot Channel tab content: four platform cards in one row, each with its
 * brand mark. Selecting a card starts a QR login via the im-channel host
 * routes; the detail area below splits into the QR (left) and the
 * platform-specific operation steps (right).
 */

import { useEffect, useRef, useState } from 'react'
import type { Kind } from './store.ts'
import { DingtalkMark, FeishuMark, QqMark, WechatMark } from './platform-marks.tsx'
import { qrSvgDataUrl } from './qr.ts'
import css from './BotChannelTab.module.css'

/** Injected dependencies (slot `inject`). */
export interface BotChannelTabInjected {
  t: (key: string) => string
}

/** Props delivered by the slot outlet. */
export type BotChannelTabProps = Partial<BotChannelTabInjected>

interface LoginStatus {
  kind: Kind
  status: 'pending' | 'confirmed' | 'error'
  qrUrl: string | undefined
  error: string | undefined
}

interface BindingRow {
  kind: Kind
  boundAt: string
  sessionId: string
}

const POLL_INTERVAL_MS = 1500

const KIND_LABELS: Record<Kind, string> = {
  wechat: '微信',
  qq: 'QQ',
  feishu: '飞书',
  dingtalk: '钉钉',
}

const CARD_MARKS = {
  wechat: WechatMark,
  qq: QqMark,
  feishu: FeishuMark,
  dingtalk: DingtalkMark,
} as const

export function BotChannelTab(props: BotChannelTabProps) {
  const t = props.t
  if (t === undefined) return null
  const [selected, setSelected] = useState<Kind | undefined>(undefined)
  const [login, setLogin] = useState<LoginStatus | undefined>(undefined)
  const [startError, setStartError] = useState<string | undefined>(undefined)
  const [bindings, setBindings] = useState<BindingRow[]>([])
  const [passphrase, setPassphrase] = useState<string | undefined>(undefined)
  const [copied, setCopied] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const refreshBindings = async (): Promise<void> => {
    try {
      const response = await fetch('/im-channel/bindings')
      const body = await response.json() as { ok: boolean; bindings: BindingRow[]; passphrase?: string }
      if (body.ok) {
        setBindings(body.bindings)
        setPassphrase(body.passphrase)
      }
    } catch {
      // Transient fetch failure: keep the last list.
    }
  }

  const removeBinding = async (row: BindingRow): Promise<void> => {
    try {
      await fetch('/im-channel/bindings/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: row.sessionId }),
      })
      await refreshBindings()
    } catch {
      // Keep the list as-is on transient failure.
    }
  }

  const copyBindCommand = (): void => {
    if (passphrase === undefined) return
    void navigator.clipboard.writeText(`/bind ${passphrase}`).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 1500)
    })
  }

  useEffect(() => {
    void refreshBindings()
    return () => { if (pollTimer.current !== undefined) clearInterval(pollTimer.current) }
  }, [])

  const stopPolling = (): void => {
    if (pollTimer.current !== undefined) {
      clearInterval(pollTimer.current)
      pollTimer.current = undefined
    }
  }

  const selectCard = (kind: Kind): void => {
    stopPolling()
    setSelected(kind)
    setLogin(undefined)
    setStartError(undefined)
    void startLogin(kind)
  }

  const startLogin = async (kind: Kind): Promise<void> => {
    try {
      const response = await fetch('/im-channel/login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      })
      const body = await response.json() as { ok: boolean; qrUrl?: string; error?: string }
      if (!body.ok) {
        setStartError(body.error ?? 'login start failed')
        return
      }
      if (body.qrUrl !== undefined) {
        setLogin({ kind, status: 'pending', qrUrl: body.qrUrl, error: undefined })
      }
    } catch (error) {
      setStartError(error instanceof Error ? error.message : String(error))
      return
    }
    pollTimer.current = setInterval(() => { void pollStatus() }, POLL_INTERVAL_MS)
  }

  const pollStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/im-channel/login/status')
      const body = await response.json() as { ok: boolean; session: LoginStatus | null }
      if (!body.ok || body.session === null) return
      setLogin(body.session)
      if (body.session.status === 'confirmed' || body.session.status === 'error') {
        stopPolling()
        void refreshBindings()
      }
    } catch {
      // Transient fetch failure: keep polling; the TTL on the host side ends it.
    }
  }

  const cards: Array<{ kind: Kind; label: string }> = [
    { kind: 'wechat', label: t('card.wechat') },
    { kind: 'qq', label: t('card.qq') },
    { kind: 'feishu', label: t('card.feishu') },
    { kind: 'dingtalk', label: t('card.dingtalk') },
  ]

  const stepKeys: Array<`step.${Kind}.${1 | 2 | 3 | 4}` | `note.${Kind}.${1 | 2 | 3 | 4}`> = selected === undefined
    ? []
    : (['1', '2', '3', '4'] as const).flatMap(n => [`step.${selected}.${n}`, `note.${selected}.${n}`] as Array<`step.${Kind}.${typeof n}` | `note.${Kind}.${typeof n}`>)

  return (
    <div className={css.section}>
      <p className={css.intro}>{t('intro')}</p>
      <div role="radiogroup" aria-label={t('cards')} className={css.cards}>
        {cards.map(({ kind, label }) => {
          const Mark = CARD_MARKS[kind]
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={selected === kind}
              data-selected={selected === kind ? 'true' : undefined}
              className={css.card}
              onClick={() => selectCard(kind)}
            >
              <span className={css.cardIcon}><Mark /></span>
              <span className={css.cardName}>{label}</span>
            </button>
          )
        })}
      </div>

      {selected !== undefined && (
        <div className={css.detail}>
          <div className={css.qrPanel} data-state={login?.status ?? (startError !== undefined ? 'error' : 'pending')}>
            {startError !== undefined && <p role="alert" className={css.qrError}>{startError}</p>}
            {startError === undefined && login?.qrUrl === undefined && (
              <div className={css.qrSpinner}>
                <span className={css.qrSpinnerRing} />
                <span>{t('qr.waiting')}</span>
              </div>
            )}
            {login?.qrUrl !== undefined && (
              <>
                <img
                  className={css.qrImage}
                  src={qrSvgDataUrl(login.qrUrl)}
                  alt={t('qr.alt')}
                  width={240}
                  height={240}
                />
              </>
            )}
            {login?.status === 'confirmed' && <p className={css.qrOk}>{t('qr.confirmed')}</p>}
            {login?.status === 'error' && <p role="alert" className={css.qrError}>{login.error}</p>}
          </div>

          <div className={css.stepsPanel}>
            <h3 className={css.stepsTitle}>{t(`steps.title.${selected}`)}</h3>
            <ol className={css.steps}>
              {stepKeys.length > 0 && stepKeys.map(key => key.startsWith('step.')
                ? (
                    <li key={key} className={css.step}>
                      <span className={css.stepNumber} aria-hidden="true" />
                      <span className={css.stepBody}>
                        <span className={css.stepText}>{t(key)}</span>
                      </span>
                    </li>
                  )
                : null)}
            </ol>
            {selected === 'wechat' && <p className={css.stepNote}>{t('note.wechat.verifycode')}</p>}
          </div>
        </div>
      )}
      {passphrase !== undefined && (
        <div className={css.passphraseCard}>
          <span className={css.passphraseTitle}>{t('passphrase.title')}</span>
          <span className={css.passphraseHint}>{t('passphrase.hint')}</span>
          <code
            className={css.passphraseCommand}
            role="button"
            tabIndex={0}
            onClick={copyBindCommand}
            onKeyDown={e => { if (e.key === 'Enter') copyBindCommand() }}
          >
            /bind {passphrase}
          </code>
          <span className={css.passphraseCopied}>{copied ? '✓' : ''}</span>
        </div>
      )}

      <div className={css.bindings}>
        <h3 className={css.bindingsTitle}>{t('bindings.title')}（{bindings.length}）</h3>
        {bindings.length === 0 && <p className={css.bindingsEmpty}>{t('bindings.empty')}</p>}
        {bindings.length > 0 && (
          <table className={css.bindingsTable}>
            <thead>
              <tr>
                <th>{t('bindings.kind')}</th>
                <th>{t('bindings.session')}</th>
                <th>{t('bindings.boundAt')}</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {bindings.map((row, index) => (
                <tr key={`${row.kind}:${row.sessionId}:${index}`}>
                  <td><span className={css.bindingKind}>{KIND_LABELS[row.kind] ?? row.kind}</span></td>
                  <td className={css.bindingSession}>{row.sessionId}</td>
                  <td>{row.boundAt.replace('T', ' ').slice(0, 19)}</td>
                  <td>
                    <button type="button" className={css.bindingRemove} onClick={() => { void removeBinding(row) }}>
                      {t('bindings.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
