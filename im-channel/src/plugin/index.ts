import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { BindStore } from '../core/bind-store.ts'
import { Router } from '../core/router.ts'
import { HarnessDriver } from './driver.ts'
import { WechatChannel, loadWechatCredentials } from '../channels/wechat/index.ts'
import { QqChannel, loadQqCredentials } from '../channels/qq/index.ts'
import { FeishuChannel, loadFeishuCredentials } from '../channels/feishu/index.ts'
import { DingtalkChannel, loadDingtalkCredentials } from '../channels/dingtalk/index.ts'
import { LoginApi } from './login-api.ts'
import type { ChannelKind, ImChannel } from '../core/channel.ts'

export const name = 'im-channel'
export const inject = ['agents']

const NS = settingsNamespace('im-channel')

/** One user-declared channel instance; key in the dict is the instance name. */
export interface ChannelInstanceConfig {
  kind: ChannelKind
  enabled: boolean
  displayName?: string
}

/** Resolved section shape persisted to ~/.dsh/settings.yaml under `im-channel:`. */
export interface ImChannelSection {
  channels: Record<string, ChannelInstanceConfig>
  commandPrefix: string
}

const KindUnion = z.union(['feishu', 'wechat', 'qq', 'dingtalk'])

const InstanceSchema = z.object({
  kind: KindUnion,
  enabled: z.boolean().default(true),
  displayName: z.string().default(''),
})

export const Config = z.object({
  channels: z.dict(InstanceSchema).default({}),
  commandPrefix: z.string().default('/'),
}) as unknown as z<ImChannelSection>

function isCredentialled(kind: ChannelKind): boolean {
  switch (kind) {
    case 'wechat': return loadWechatCredentials() !== undefined
    case 'qq': return loadQqCredentials() !== undefined
    case 'feishu': return loadFeishuCredentials() !== undefined
    case 'dingtalk': return loadDingtalkCredentials() !== undefined
  }
}

/** Build one channel instance from its declared config. */
function buildChannel(kind: ChannelKind): ImChannel {
  switch (kind) {
    case 'wechat': return new WechatChannel()
    case 'qq': return new QqChannel()
    case 'feishu': return new FeishuChannel()
    case 'dingtalk': return new DingtalkChannel()
  }
}

export function apply(ctx: Context, config: ImChannelSection): void {
  // Browser-facing login routes: /im-channel/login/start and /status.
  ctx.inject(['webServer'], (wctx: Context) => {
    new LoginApi(wctx).register()
  })

  let current: ImChannelSection = config
  let router: Router | undefined
  let disposeRouter: (() => void) | undefined

  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => { current = source() },
    onChange: () => {
      // Reconcile the live router against the declared instances: a changed
      // set, kind, or enabled flag restarts the router wholesale — channel
      // connections are cheap to re-establish relative to config edits.
      const next = current
      if (router !== undefined && sameTopology(router, next)) return
      disposeRouter?.()
      router = undefined
      const channels: ImChannel[] = []
      for (const [name, instance] of Object.entries(next.channels)) {
        if (!instance.enabled) continue
        if (!isCredentialled(instance.kind)) {
          ctx.logger.warn(`im-channel: 实例 ${name}（${instance.kind}）缺少登录凭证，跳过；请先完成该平台的登录/配置`)
          continue
        }
        const channel = buildChannel(instance.kind)
        channels.push(channel)
      }
      if (channels.length === 0) return
      const store = new BindStore()
      const driver = new HarnessDriver(ctx, {})
      router = new Router({ channels, driver, store, config: { commandPrefix: next.commandPrefix } })
      const passphrase = store.issuePassphrase()
      process.stdout.write(`\n[im-channel] 手机绑定口令（10 分钟内有效）：${passphrase}\n[im-channel] 在 IM 上发送 /bind ${passphrase} 完成绑定\n\n`)
      void ctx.effect(async function* () {
        await router?.start()
        yield () => { void router?.stop() }
      }, 'im-channel.router')
      disposeRouter = () => { void router?.stop(); router = undefined }
    },
  })
}

/** Whether the live router already serves exactly this topology. */
function sameTopology(router: Router, next: ImChannelSection): boolean {
  const live = router.channels
  const wanted = Object.entries(next.channels)
    .filter(([, instance]) => instance.enabled)
    .map(([, instance]) => instance.kind)
    .sort()
  const liveKinds = live.map(channel => channel.kind).sort()
  return liveKinds.length === wanted.length && liveKinds.every((kind, index) => kind === wanted[index])
}
