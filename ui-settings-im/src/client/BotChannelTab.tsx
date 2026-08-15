/**
 * Bot Channel tab content: four platform cards. Selecting a card starts a QR
 * login for that platform via the im-channel host routes, renders the QR
 * image, and polls the login status until confirmed.
 */

import { useEffect, useRef, useState } from 'react'
import type { Kind } from './store.ts'

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

const POLL_INTERVAL_MS = 1500

export function BotChannelTab(props: BotChannelTabProps) {
  const t = props.t
  if (t === undefined) return null
  const [selected, setSelected] = useState<Kind | undefined>(undefined)
  const [login, setLogin] = useState<LoginStatus | undefined>(undefined)
  const [startError, setStartError] = useState<string | undefined>(undefined)
  const pollTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => () => { if (pollTimer.current !== undefined) clearInterval(pollTimer.current) }, [])

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
      const body = await response.json() as { ok: boolean; error?: string }
      if (!body.ok) {
        setStartError(body.error ?? 'login start failed')
        return
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
      if (body.session.status === 'confirmed' || body.session.status === 'error') stopPolling()
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

  return (
    <div>
      <p>{t('intro')}</p>
      <div role="radiogroup" aria-label={t('cards')} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {cards.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected === kind}
            onClick={() => selectCard(kind)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '20px 12px', borderRadius: 8, cursor: 'pointer',
              border: selected === kind ? '2px solid var(--accent, #4a6cf7)' : '1px solid rgba(128,128,128,.35)',
            }}
          >
            <strong>{label}</strong>
            <span style={{ opacity: 0.65, fontSize: '0.85em' }}>{kind}</span>
          </button>
        ))}
      </div>

      {selected !== undefined && (
        <div style={{ marginTop: 16 }}>
          {startError !== undefined && <p role="alert" style={{ color: '#c0392b' }}>{startError}</p>}
          {login === undefined && <p>{t('qr.waiting')}</p>}
          {login?.qrUrl !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(login.qrUrl)}`}
                alt={t('qr.alt')}
                width={240}
                height={240}
              />
              <span style={{ wordBreak: 'break-all', maxWidth: 360, opacity: 0.6, fontSize: '0.8em' }}>{login.qrUrl}</span>
            </div>
          )}
          {login?.status === 'confirmed' && <p style={{ color: '#27ae60' }}>{t('qr.confirmed')}</p>}
          {login?.status === 'error' && <p role="alert" style={{ color: '#c0392b' }}>{login.error}</p>}
        </div>
      )}
    </div>
  )
}
