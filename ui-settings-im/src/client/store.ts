/**
 * IM channels settings store: one snapshot joining the `im-channel` settings
 * namespace. Rows are the declared channel instances (dict keys); mutations
 * are path ops (`channels.<name>`) written through `settings.mutate`, and the
 * page re-renders from the next describe, pushed or refetched.
 */

import type { IApiClient, SettingsNamespaceView } from '@deepseek-ai/dsh-api-remotes/client'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import { getPath } from '@deepseek-ai/dsh-client-schema-form'

export const IM_NS = 'im-channel'

/** The four supported platform kinds. */
export const KINDS = ['feishu', 'wechat', 'qq', 'dingtalk'] as const
export type Kind = typeof KINDS[number]

/** One declared channel instance row. */
export interface ChannelRow {
  name: string
  kind: Kind
  enabled: boolean
  displayName: string
  /** Present in the user layer (removable); absent means base-composed. */
  removable: boolean
}

/** Page snapshot. */
export interface ImSettingsState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  writable: boolean
  rows: readonly ChannelRow[]
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Read the instance dict out of a namespace view. */
function rowsFrom(namespace: SettingsNamespaceView | undefined): ChannelRow[] {
  if (namespace === undefined) return []
  const channels = getPath(namespace.value, ['channels'])
  if (typeof channels !== 'object' || channels === null) return []
  const userChannels = getPath(namespace.user, ['channels'])
  const userKeys = typeof userChannels === 'object' && userChannels !== null
    ? new Set(Object.keys(userChannels))
    : new Set<string>()
  const rows: ChannelRow[] = []
  for (const [name, value] of Object.entries(channels)) {
    if (typeof value !== 'object' || value === null) continue
    const instance = value as { kind?: unknown; enabled?: unknown; displayName?: unknown }
    if (typeof instance.kind !== 'string' || !KINDS.includes(instance.kind as Kind)) continue
    rows.push({
      name,
      kind: instance.kind as Kind,
      enabled: instance.enabled !== false,
      displayName: typeof instance.displayName === 'string' ? instance.displayName : '',
      removable: userKeys.has(name),
    })
  }
  return rows
}

/** The IM channels settings page controller. */
export class ImSettingsStore {
  readonly store: SnapshotStore<ImSettingsState> = createSnapshotStore<ImSettingsState>({
    status: 'idle', error: null, writable: false, rows: [],
  })

  private generation = 0

  constructor(private readonly api: Pick<IApiClient, 'settings'>) {}

  async load(): Promise<void> {
    const generation = ++this.generation
    this.store.update((s: ImSettingsState) => { s.status = 'loading'; s.error = null })
    try {
      const response = await this.api.settings.describe({})
      if (!response.result.ok) throw new Error(response.result.error.message)
      if (generation !== this.generation) return
      const namespace = response.result.value.namespaces.find((view: SettingsNamespaceView) => view.ns === IM_NS)
      this.store.update((s: ImSettingsState) => {
        s.status = 'ready'
        s.writable = response.result.value.writable
        s.rows = rowsFrom(namespace)
      })
    } catch (error) {
      if (generation !== this.generation) return
      this.store.update((s) => {
        s.status = 'error'
        s.error = messageOf(error)
      })
    }
  }

  /** Add an instance; fails with the server's message on a taken name. */
  async add(name: string, kind: Kind): Promise<string | undefined> {
    try {
      const response = await this.api.settings.mutate({
        ns: IM_NS,
        ops: [{ op: 'set', path: ['channels', name], value: { kind, enabled: true, displayName: '' } }],
      })
      if (!response.result.ok) return response.result.error.message
    } catch (error) {
      return messageOf(error)
    }
    await this.load()
    return undefined
  }

  /** Toggle an instance's enabled flag. */
  async setEnabled(name: string, enabled: boolean): Promise<string | undefined> {
    try {
      const response = await this.api.settings.mutate({
        ns: IM_NS,
        ops: [{ op: 'set', path: ['channels', name, 'enabled'], value: enabled }],
      })
      if (!response.result.ok) return response.result.error.message
    } catch (error) {
      return messageOf(error)
    }
    await this.load()
    return undefined
  }

  /** Rename an instance's display label. */
  async setDisplayName(name: string, displayName: string): Promise<string | undefined> {
    try {
      const response = await this.api.settings.mutate({
        ns: IM_NS,
        ops: [{ op: 'set', path: ['channels', name, 'displayName'], value: displayName }],
      })
      if (!response.result.ok) return response.result.error.message
    } catch (error) {
      return messageOf(error)
    }
    await this.load()
    return undefined
  }

  /** Remove an instance (unset the whole dict entry). */
  async remove(name: string): Promise<string | undefined> {
    try {
      const response = await this.api.settings.mutate({
        ns: IM_NS,
        ops: [{ op: 'unset', path: ['channels', name] }],
      })
      if (!response.result.ok) return response.result.error.message
    } catch (error) {
      return messageOf(error)
    }
    await this.load()
    return undefined
  }
}
