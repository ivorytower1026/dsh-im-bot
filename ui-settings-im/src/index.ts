/**
 * Mobile Connect settings plugin. Node half: empty apply — this package
 * exists for its `dsh.client` browser bundle (the Plugins-section "手机连接"
 * tab); the loader row exists only so the client-modules scanner sees it.
 */
export const name = 'ui-settings-im'

export function apply(): void {}

export { en, zh } from './client/locales.ts'
