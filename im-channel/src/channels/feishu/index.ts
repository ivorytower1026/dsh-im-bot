/**
 * Feishu/Lark channel: official @larksuiteoapi/node-sdk WebSocket long
 * connection (WSClient). A self-built app with bot capability provides
 * appId/appSecret; im.message.receive_v1 feeds the router; replies go
 * through the REST message API via the SDK client.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import * as Lark from '@larksuiteoapi/node-sdk'
import type { ImChannel, ImUserId, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts'

/** Channel credentials persisted at ~/.dsh/im-channel/credentials/feishu.json. */
export interface FeishuCredentials {
  appId: string
  appSecret: string
}

function credentialsPath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'credentials', 'feishu.json')
}

export function loadFeishuCredentials(): FeishuCredentials | undefined {
  const path = credentialsPath()
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as FeishuCredentials
}

export function saveFeishuCredentials(credentials: FeishuCredentials): void {
  const path = credentialsPath()
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

interface ReceiveMessageEvent {
  message?: {
    chat_id?: string
    message_id?: string
    message_type?: string
    content?: string
  }
  sender?: { sender_id?: { open_id?: string } }
}

export class FeishuChannel implements ImChannel {
  readonly kind = 'feishu' as const
  readonly label = '飞书'

  private handler: ((message: InboundMessage) => void) | undefined
  private client: Lark.Client | undefined
  private wsClient: Lark.WSClient | undefined

  isConfigured(): boolean {
    return loadFeishuCredentials() !== undefined
  }

  async connect(): Promise<void> {
    const credentials = loadFeishuCredentials()
    if (credentials === undefined) throw new Error('飞书通道未配置：先创建自建应用并保存 appId/appSecret')
    try {
      this.client = new Lark.Client({ appId: credentials.appId, appSecret: credentials.appSecret })
      this.wsClient = new Lark.WSClient({
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        loggerLevel: Lark.LoggerLevel.warn,
      })
      await this.wsClient.start({
        eventDispatcher: new Lark.EventDispatcher({}).register({
          'im.message.receive_v1': (data) => {
            this.dispatch(data as ReceiveMessageEvent)
            return Promise.resolve()
          },
        }),
      } as Parameters<Lark.WSClient['start']>[0])
      process.stdout.write('[im-channel] feishu 长连接已建立\n')
    } catch (error) {
      process.stdout.write(`[im-channel] feishu connect FAILED: ${error instanceof Error ? error.message : String(error)}\n`)
      throw error
    }
  }

  onMessage(handler: (message: InboundMessage) => void): void {
    this.handler = handler
  }

  async send(target: ReplyTarget, message: OutboundMessage): Promise<void> {
    if (this.client === undefined) throw new Error('飞书通道未连接')
    await this.client.im.v1.message.create({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: target.targetId,
        content: JSON.stringify({ text: message.text }),
        msg_type: 'text',
      },
    })
  }

  async stop(): Promise<void> {
    this.wsClient?.close()
  }

  private dispatch(event: ReceiveMessageEvent): void {
    const message = event.message
    const openId = event.sender?.sender_id?.open_id
    if (message?.chat_id === undefined || openId === undefined || message.message_id === undefined) return
    if (message.message_type !== 'text') return
    let text = ''
    try {
      text = (JSON.parse(message.content ?? '{}') as { text?: string }).text ?? ''
    } catch {
      return
    }
    if (text.length === 0) return
    this.handler?.({
      from: { kind: 'feishu', userId: openId as ImUserId },
      text,
      messageId: message.message_id,
      chatId: message.chat_id,
    })
  }
}
