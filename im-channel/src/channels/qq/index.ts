/**
 * QQ official bot channel: WebSocket gateway (wss://api.bot.qq.com/websocket)
 * with the open-platform opcode protocol, plus scan-code login via
 * @tencent-connect/qqbot-connector. C2C (direct message) and group @-mention
 * events (intents 1 << 25) feed the router; replies go through the REST API.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import WebSocket from 'ws'
import type { ImChannel, ImUserId, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts'

const API_BASE = 'https://api.bot.qq.com'
const GATEWAY = 'wss://api.bot.qq.com/websocket/'
/** GROUP_AND_C2C_EVENT: C2C_MESSAGE_CREATE + GROUP_AT_MESSAGE_CREATE + friend/group lifecycle. */
const INTENTS_GROUP_AND_C2C = 1 << 25
const TOKEN_REFRESH_MARGIN_MS = 5 * 60_000
const RECONNECT_DELAY_MS = 5_000

/** Channel credentials persisted at ~/.dsh/im-channel/credentials/qq.json. */
export interface QqCredentials {
  appId: string
  appSecret: string
}

function credentialsPath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'credentials', 'qq.json')
}

export function loadQqCredentials(): QqCredentials | undefined {
  const path = credentialsPath()
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as QqCredentials
}

export function saveQqCredentials(credentials: QqCredentials): void {
  const path = credentialsPath()
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

/** Interactive scan-code login: terminal QR, resolves with persisted credentials. */
export async function loginQq(): Promise<QqCredentials> {
  const { startQrConnect } = await import('@tencent-connect/qqbot-connector')
  return new Promise<QqCredentials>((resolve, reject) => {
    startQrConnect(
      {
        onSuccess(credentials) {
          const first = credentials[0]
          if (first === undefined) {
            reject(new Error('扫码成功但未返回凭据'))
            return
          }
          const saved: QqCredentials = { appId: first.appId, appSecret: first.appSecret }
          saveQqCredentials(saved)
          resolve(saved)
        },
        onFailure(error) {
          reject(error)
        },
      },
      { source: 'dsh-im-channel' },
    )
  })
}

// ---------------------------------------------------------------------------
// Access token (POST /app/getAppAccessToken, ~2h TTL)
// ---------------------------------------------------------------------------

interface AccessTokenState {
  token: string
  expiresAt: number
}

async function fetchAccessToken(credentials: QqCredentials): Promise<AccessTokenState> {
  const response = await fetch(`${API_BASE}/app/getAppAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: credentials.appId, clientSecret: credentials.appSecret }),
  })
  if (!response.ok) throw new Error(`qq getAppAccessToken ${response.status}: ${await response.text()}`)
  const parsed = (await response.json()) as { access_token: string; expires_in: string }
  return { token: parsed.access_token, expiresAt: Date.now() + Number(parsed.expires_in) * 1000 }
}

// ---------------------------------------------------------------------------
// Inbound event payloads
// ---------------------------------------------------------------------------

interface C2cMessageEvent {
  id: string
  content: string
  timestamp: string
  author?: { id?: string; open_id?: string; member_openid?: string }
}

interface GroupAtMessageEvent {
  id: string
  content: string
  group_openid: string
  timestamp: string
  author?: { member_openid?: string; id?: string; open_id?: string }
}

// ---------------------------------------------------------------------------
// Channel
// ---------------------------------------------------------------------------

interface GatewayPayload {
  op?: number
  s?: number
  t?: string
  d?: unknown
}

export class QqChannel implements ImChannel {
  readonly kind = 'qq' as const
  readonly label = 'QQ'

  private handler: ((message: InboundMessage) => void) | undefined
  private stopped = false
  private socket: WebSocket | undefined
  private heartbeatTimer: ReturnType<typeof setInterval> | undefined
  private lastSeq: number | null = null
  private accessToken: AccessTokenState | undefined
  /** msg_id for replying within the proactive-message window. */
  private readonly replyMsgIds = new Map<string, string>()

  isConfigured(): boolean {
    return loadQqCredentials() !== undefined
  }

  async connect(): Promise<void> {
    const credentials = loadQqCredentials()
    if (credentials === undefined) throw new Error('QQ 通道未登录：运行 im-channel 登录流程（终端扫码）')
    this.stopped = false
    this.accessToken = await fetchAccessToken(credentials)
    await this.openGateway(credentials)
  }

  onMessage(handler: (message: InboundMessage) => void): void {
    this.handler = handler
  }

  async send(target: ReplyTarget, message: OutboundMessage): Promise<void> {
    const credentials = loadQqCredentials()
    if (credentials === undefined || this.accessToken === undefined) throw new Error('QQ 通道未就绪')
    if (this.accessToken.expiresAt - Date.now() < TOKEN_REFRESH_MARGIN_MS) {
      this.accessToken = await fetchAccessToken(credentials)
    }
    const isGroup = target.targetId.startsWith('group:')
    const endpoint = isGroup ? '/v2/groups/group_openid/messages' : '/v2/users/openid/messages'
    const receiveId = isGroup ? target.targetId.slice('group:'.length) : target.targetId
    const msgId = this.replyMsgIds.get(target.targetId)
    const body: Record<string, unknown> = {
      content: message.text,
      msg_type: 0,
      timestamp: String(Math.floor(Date.now() / 1000)),
    }
    if (msgId !== undefined) body.msg_id = msgId
    const response = await fetch(`${API_BASE}${endpoint.replace('group_openid', receiveId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `QQBot ${this.accessToken.token}`,
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`qq send ${response.status}: ${await response.text()}`)
  }

  async stop(): Promise<void> {
    this.stopped = true
    if (this.heartbeatTimer !== undefined) clearInterval(this.heartbeatTimer)
    this.socket?.close(1000)
  }

  private async openGateway(credentials: QqCredentials): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(GATEWAY)
      this.socket = socket
      socket.on('message', (raw: WebSocket.RawData) => {
        const payload = JSON.parse(String(raw)) as GatewayPayload
        void this.handleGateway(payload, credentials).catch(reject)
      })
      socket.on('open', () => resolve())
      socket.on('error', reject)
      socket.on('close', () => {
        if (this.heartbeatTimer !== undefined) clearInterval(this.heartbeatTimer)
        if (!this.stopped) {
          void delay(RECONNECT_DELAY_MS).then(() => {
            if (!this.stopped) void this.reconnect(credentials)
          })
        }
      })
    })
  }

  private async reconnect(credentials: QqCredentials): Promise<void> {
    try {
      if (this.accessToken === undefined || this.accessToken.expiresAt - Date.now() < TOKEN_REFRESH_MARGIN_MS) {
        this.accessToken = await fetchAccessToken(credentials)
      }
      await this.openGateway(credentials)
    } catch {
      await delay(RECONNECT_DELAY_MS)
      if (!this.stopped) await this.reconnect(credentials)
    }
  }

  private async handleGateway(payload: GatewayPayload, credentials: QqCredentials): Promise<void> {
    const socket = this.socket
    if (socket === undefined) return
    if (payload.s !== undefined) this.lastSeq = payload.s
    switch (payload.op) {
      case 10: {
        // Hello: identify with the fresh access token, then start heartbeats.
        const interval = (payload.d as { heartbeat_interval?: number }).heartbeat_interval ?? 45_000
        socket.send(JSON.stringify({
          op: 2,
          d: {
            token: `QQBot ${this.accessToken?.token ?? ''}`,
            intents: INTENTS_GROUP_AND_C2C,
            shard: [0, 1],
            properties: { $os: process.platform, $browser: 'dsh-im-channel', $device: 'dsh-im-channel' },
          },
        }))
        this.heartbeatTimer = setInterval(() => {
          socket.send(JSON.stringify({ op: 1, d: this.lastSeq }))
        }, interval)
        return
      }
      case 11:
        return
      case 0:
        this.dispatchEvent(payload.t, payload.d)
        return
      default:
        return
    }
  }

  private dispatchEvent(type: string | undefined, data: unknown): void {
    if (type === 'C2C_MESSAGE_CREATE') {
      const event = data as C2cMessageEvent
      const userId = event.author?.open_id ?? ''
      if (userId === '') return
      this.replyMsgIds.set(userId, event.id)
      this.handler?.({
        from: { kind: 'qq', userId: userId as ImUserId },
        text: stripMention(event.content),
        messageId: event.id,
      })
    } else if (type === 'GROUP_AT_MESSAGE_CREATE') {
      const event = data as GroupAtMessageEvent
      const groupId = event.group_openid
      const userId = event.author?.member_openid ?? ''
      if (groupId === '' || userId === '') return
      this.replyMsgIds.set(`group:${groupId}`, event.id)
      this.handler?.({
        from: { kind: 'qq', userId: userId as ImUserId },
        text: stripMention(event.content),
        messageId: event.id,
        chatId: groupId,
        mentioned: true,
      })
    }
  }
}

/** Remove the leading @bot mention residue the platform may leave in content. */
function stripMention(content: string): string {
  return content.replace(/^<@!\d+>\s*/, '').trim()
}
