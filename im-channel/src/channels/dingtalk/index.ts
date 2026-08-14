/**
 * DingTalk channel: official dingtalk-stream SDK (Stream Mode, WebSocket,
 * no public IP). A group custom robot with "Stream 模式" checked yields
 * clientId/clientSecret. Inbound robot messages arrive on topic
 * /v1.0/im/bot/messages/get; replies use the per-message sessionWebhook.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { DWClient, TOPIC_ROBOT, type DWClientDownStream } from 'dingtalk-stream'
import type { ImChannel, ImUserId, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts'

/** Channel credentials persisted at ~/.dsh/im-channel/credentials/dingtalk.json. */
export interface DingtalkCredentials {
  clientId: string
  clientSecret: string
}

function credentialsPath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'credentials', 'dingtalk.json')
}

export function loadDingtalkCredentials(): DingtalkCredentials | undefined {
  const path = credentialsPath()
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as DingtalkCredentials
}

export function saveDingtalkCredentials(credentials: DingtalkCredentials): void {
  const path = credentialsPath()
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

interface RobotMessageData {
  text?: { content?: string }
  senderStaffId?: string
  senderNick?: string
  conversationId?: string
  sessionId?: string
  sessionWebhook?: string
  msgId?: string
  isAt?: boolean
}

export class DingtalkChannel implements ImChannel {
  readonly kind = 'dingtalk' as const
  readonly label = '钉钉'

  private handler: ((message: InboundMessage) => void) | undefined
  private client: DWClient | undefined
  /** sessionWebhook per sender, refreshed on every inbound message. */
  private readonly sessionWebhooks = new Map<string, string>()

  isConfigured(): boolean {
    return loadDingtalkCredentials() !== undefined
  }

  async connect(): Promise<void> {
    const credentials = loadDingtalkCredentials()
    if (credentials === undefined) throw new Error('钉钉通道未配置：在群内创建自定义机器人（勾选 Stream 模式）并保存 clientId/clientSecret')
    this.client = new DWClient({ clientId: credentials.clientId, clientSecret: credentials.clientSecret })
    this.client.registerCallbackListener(TOPIC_ROBOT, (downstream: DWClientDownStream) => {
      this.dispatch(downstream)
    })
    await this.client.connect()
  }

  onMessage(handler: (message: InboundMessage) => void): void {
    this.handler = handler
  }

  async send(target: ReplyTarget, message: OutboundMessage): Promise<void> {
    // ReplyTarget.targetId is the sender's staffId; the live sessionWebhook
    // captured from their last inbound message is the actual send endpoint.
    const webhook = this.sessionWebhooks.get(target.targetId)
    if (webhook === undefined) throw new Error('钉钉通道：该用户没有可用的 sessionWebhook（用户需先发一条消息）')
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: { title: 'reply', text: message.text },
        at: { atUserIds: [target.targetId] },
      }),
    })
    if (!response.ok) throw new Error(`dingtalk send ${response.status}: ${await response.text()}`)
  }

  async stop(): Promise<void> {
    this.client?.disconnect()
  }

  private dispatch(downstream: DWClientDownStream): void {
    let data: RobotMessageData
    try {
      data = JSON.parse(downstream.data) as RobotMessageData
    } catch {
      return
    }
    const staffId = data.senderStaffId
    const text = data.text?.content?.trim() ?? ''
    if (staffId === undefined || text.length === 0) return
    if (data.sessionWebhook !== undefined) this.sessionWebhooks.set(staffId, data.sessionWebhook)
    const message: {
      from: InboundMessage['from']
      text: string
      messageId: string
      chatId?: string
      mentioned?: boolean
    } = {
      from: { kind: 'dingtalk', userId: staffId as ImUserId },
      text,
      messageId: data.msgId ?? `${staffId}:${downstream.headers.messageId}`,
    }
    if (data.conversationId !== undefined) message.chatId = data.conversationId
    if (data.isAt !== undefined) message.mentioned = data.isAt
    this.handler?.(message)
  }
}
