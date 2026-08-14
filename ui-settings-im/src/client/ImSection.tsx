/**
 * IM channels settings section: declared instance rows with per-row enable
 * toggle and remove (confirm first), plus one add card creating an instance
 * (name + one of the four platform kinds). Every mutation writes through
 * `settings.mutate` path ops; the section re-renders from pushed
 * invalidations or the post-apply reload.
 */

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client'
import { Button, IconPlusOutline16, Input, Modal, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-web-react'
import { KINDS, type Kind, type ImSettingsState, type ImSettingsStore } from './store.ts'
import type { ImKey } from './locales.ts'

/** Injected dependencies (slot `inject`). */
export interface ImSectionInjected {
  controller: ImSettingsStore
  useSnapshot: SnapshotSelectorHook<ImSettingsState>
  api: Pick<IApiClient, 'settings'>
  t: (key: ImKey) => string
}

/** Props delivered by the slot outlet: the inject face spread flat. */
export type ImSectionProps = Partial<ImSectionInjected>

const KIND_LABELS: Record<Kind, string> = {
  feishu: '飞书',
  wechat: '微信',
  qq: 'QQ',
  dingtalk: '钉钉',
}

/** Instance-name pattern: lowercase identifier, readable in settings.yaml. */
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/

export function ImSection(props: ImSectionProps) {
  const { t } = props
  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftKind, setDraftKind] = useState<Kind>('wechat')
  const [addError, setAddError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState<string | undefined>(undefined)
  const [confirmRemove, setConfirmRemove] = useState<string | undefined>(undefined)

  const controller = props.controller
  const useSnapshot = props.useSnapshot
  if (controller === undefined || useSnapshot === undefined || t === undefined) return null
  const state = useSnapshot(s => s)

  useEffect(() => {
    if (state.status === 'idle') void controller.load()
  }, [controller, state.status])
  if (state.status === 'error') {
    return <div>{state.error}</div>
  }

  const rows = state.rows
  const nameTaken = rows.some(row => row.name === draftName)

  const add = async (): Promise<void> => {
    if (!NAME_PATTERN.test(draftName)) {
      setAddError(t('nameInvalid'))
      return
    }
    if (nameTaken) {
      setAddError(t('nameTaken'))
      return
    }
    const error = await controller.add(draftName, draftKind)
    if (error !== undefined) {
      setAddError(error)
      return
    }
    setAdding(false)
    setDraftName('')
    setAddError(undefined)
  }

  return (
    <div>
      <p>{t('intro')}</p>
      {rows.length === 0 && <p>{t('empty')}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rows.map(row => (
          <li key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <StateDot state={row.enabled ? 'done' : 'error'} />
            <strong>{row.displayName !== '' ? row.displayName : row.name}</strong>
            <span>{KIND_LABELS[row.kind]}</span>
            <span style={{ opacity: 0.6 }}>{row.name}</span>
            <span style={{ flex: 1 }} />
            <Button
              size="sm"
              onClick={() => { setPending(row.name); void controller.setEnabled(row.name, !row.enabled).then(() => setPending(undefined)) }}
              disabled={!state.writable || pending === row.name}
            >
              {row.enabled ? t('disable') : t('enable')}
            </Button>
            <Button size="sm" onClick={() => setConfirmRemove(row.name)} disabled={!state.writable || !row.removable}>
              {t('remove')}
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="primary" onClick={() => { setAdding(true); setAddError(undefined) }} disabled={!state.writable}>
        <IconPlusOutline16 size={16} /> {t('add')}
      </Button>

      {adding && (
        <Modal open title={t('addTitle')} onClose={() => setAdding(false)}>
          <label>
            {t('name')}
            <Input value={draftName} onChange={(event: ChangeEvent<HTMLInputElement>) => { setDraftName(event.target.value); setAddError(undefined) }} />
          </label>
          <div role="radiogroup" aria-label={t('kind')} style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
            {KINDS.map(kind => (
              <Button
                key={kind}
                variant={draftKind === kind ? 'primary' : 'outline'}
                size="sm"
                aria-pressed={draftKind === kind}
                onClick={() => setDraftKind(kind)}
              >
                {KIND_LABELS[kind]}
              </Button>
            ))}
          </div>
          {addError !== undefined && <p role="alert">{addError}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setAdding(false)}>{t('cancel')}</Button>
            <Button variant="primary" onClick={() => { void add() }}>{t('create')}</Button>
          </div>
        </Modal>
      )}

      {confirmRemove !== undefined && (
        <Modal open title={t('removeTitle')} onClose={() => setConfirmRemove(undefined)}>
          <p>{t('removeConfirm').replace('{name}', confirmRemove)}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setConfirmRemove(undefined)}>{t('cancel')}</Button>
            <Button
              variant="primary"
              onClick={() => {
                const name = confirmRemove
                setConfirmRemove(undefined)
                void controller.remove(name)
              }}
            >
              {t('remove')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
