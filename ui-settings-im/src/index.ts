/**
 * IM channels settings plugin. Node half: registers the locale dictionary
 * namespace; the browser half (src/client) registers the settings section.
 */
import { en, zh } from './client/locales.ts'

export const name = 'ui-settings-im'

const NS = 'settings.im'

export function apply(ctx: object & { locale?: { register: (ns: string, dict: object) => unknown } }): void {
  ctx.locale?.register(NS, { zh, en })
}

export { en, zh } from './client/locales.ts'
