import type { Context } from '@deepseek-ai/cordis'
import { BindStore } from '../core/bind-store.ts'
import { Router } from '../core/router.ts'
import { HarnessDriver } from './driver.ts'
import { WechatChannel } from '../channels/wechat/index.ts'
import { QqChannel } from '../channels/qq/index.ts'
import { FeishuChannel } from '../channels/feishu/index.ts'
import { DingtalkChannel } from '../channels/dingtalk/index.ts'
import type { ImChannel } from '../core/channel.ts'

export const name = 'im-channel'
export const inject = ['agents']

export interface ImChannelConfig {
  channels?: {
    wechat?: { enabled?: boolean }
    qq?: { enabled?: boolean }
    feishu?: { enabled?: boolean }
    dingtalk?: { enabled?: boolean }
  }
  commandPrefix?: string
  cwd?: string
}

export function apply(ctx: Context, config: ImChannelConfig): void {
  const enabled = config.channels ?? {}
  const channels: ImChannel[] = []
  if (enabled.wechat?.enabled !== false) channels.push(new WechatChannel())
  if (enabled.qq?.enabled !== false) channels.push(new QqChannel())
  if (enabled.feishu?.enabled !== false) channels.push(new FeishuChannel())
  if (enabled.dingtalk?.enabled !== false) channels.push(new DingtalkChannel())

  const store = new BindStore()
  const driverOptions: { cwd?: string } = {}
  if (config.cwd !== undefined) driverOptions.cwd = config.cwd
  const driver = new HarnessDriver(ctx, driverOptions)
  const routerConfig: { commandPrefix?: string } = {}
  if (config.commandPrefix !== undefined) routerConfig.commandPrefix = config.commandPrefix
  const router = new Router({ channels, driver, store, config: routerConfig })

  // The one-time binding passphrase for this boot; shown in the terminal and
  // claimable from any channel via /bind.
  const passphrase = store.issuePassphrase()
  process.stdout.write(`\n[im-channel] 手机绑定口令（10 分钟内有效）：${passphrase}\n[im-channel] 在 IM 上发送 /bind ${passphrase} 完成绑定\n\n`)

  void ctx.effect(async function* () {
    await router.start()
    yield () => router.stop()
  }, 'im-channel.router')
}
