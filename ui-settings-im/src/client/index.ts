/**
 * IM channels settings plugin, browser half. Registers the "IM 通道" section
 * in the settings dialog: declared channel instances (Feishu/WeChat/QQ/
 * DingTalk) with add/enable/rename/remove, all writing through the
 * `im-channel` settings namespace.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
// Type-only: pulls the shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: ctx.remote merge and forwarded-event key face.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { ImSection } from './ImSection.tsx'
import type { ImSectionInjected } from './ImSection.tsx'
import { ImSettingsStore, IM_NS } from './store.ts'
import type { ImSettingsState } from './store.ts'
import { en, zh, type ImKey } from './locales.ts'

export type { ImSectionInjected, ImSectionProps } from './ImSection.tsx'
export { ImSettingsStore, IM_NS, KINDS } from './store.ts'
export type { ImSettingsState, ChannelRow, Kind } from './store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The IM channels settings section copy. */
    'settings.im': ImKey
  }
}

export const inject = ['slots', 'locale', 'connection', 'remote']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register('settings.im', { zh, en }), 'ui-settings-im: copy dictionaries')

  const connection = ctx.get('connection') as ConnectionHandle
  const controller = new ImSettingsStore(connection.api)
  const useSnapshot = bindSnapshotSelector<ImSettingsState>(controller.store)
  const t = ctx.locale.bind('settings.im') as ImSectionInjected['t']
  const injected = (): ImSectionInjected => ({ controller, useSnapshot, api: connection.api, t })

  const refreshIfLoaded = (): void => {
    if (controller.store.getSnapshot().status === 'idle') return
    void controller.load()
  }
  ctx.effect(() => {
    const disposers = [
      ctx.remote.$on('settings/document-updated', (ns: string) => {
        if (ns === IM_NS) refreshIfLoaded()
      }),
      ctx.on('connection/reset', refreshIfLoaded),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'ui-settings-im: pushed invalidations')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'im-channels',
    order: 20,
    label: () => t('nav'),
    inject: injected,
  }, ImSection))
}
