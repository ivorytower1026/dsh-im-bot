/**
 * WeChat personal-account bot via the official Tencent iLink protocol
 * (ilinkai.weixin.qq.com), transplanted from Tencent/openclaw-weixin (MIT).
 * Text messaging only in this first cut; media/CDN upload stays upstream.
 *
 * MIT license notice: portions Copyright (C) 2026 Tencent. All rights reserved.
 */

import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { ImChannel, ImUserId, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts'

const FIXED_BASE_URL = 'https://ilinkai.weixin.qq.com'
const DEFAULT_ILINK_BOT_TYPE = '3'
export { DEFAULT_ILINK_BOT_TYPE }
const QR_LONG_POLL_TIMEOUT_MS = 35_000
const ACTIVE_LOGIN_TTL_MS = 5 * 60_000
const MAX_QR_REFRESH_COUNT = 3
const UPDATES_LONG_POLL_TIMEOUT_MS = 35_000
const MAX_CONSECUTIVE_FAILURES = 3
const BACKOFF_DELAY_MS = 30_000
const RETRY_DELAY_MS = 2_000

/** Channel credentials persisted at ~/.dsh/im-channel/credentials/wechat.json. */
export interface WechatCredentials {
  botToken: string
  /** The bot's own id (ilink_bot_id). */
  accountId: string
  /** API base URL returned at login; overrides the fixed base. */
  baseUrl?: string
}

// ---------------------------------------------------------------------------
// Credential storage
// ---------------------------------------------------------------------------

function credentialsPath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'credentials', 'wechat.json')
}

export function loadWechatCredentials(): WechatCredentials | undefined {
  const path = credentialsPath()
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as WechatCredentials
}

export function saveWechatCredentials(credentials: WechatCredentials): void {
  const path = credentialsPath()
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
}

// ---------------------------------------------------------------------------
// Raw API (subset of upstream api/api.ts: getupdates / sendmessage / qrcode)
// ---------------------------------------------------------------------------

interface IlinkMessageItem {
  type?: number
  text_item?: { text?: string }
  voice_item?: { text?: string }
}

interface IlinkMessage {
  message_id?: string | number
  from_user_id?: string
  create_time_ms?: number
  context_token?: string
  item_list?: IlinkMessageItem[]
}

interface GetUpdatesResp {
  ret?: number
  errcode?: number
  errmsg?: string
  msgs?: IlinkMessage[]
  get_updates_buf?: string
  longpolling_timeout_ms?: number
}

// iLink app identity headers required by every request (upstream
// openclaw-weixin package.json ilink_appid + encoded client version).
const ILINK_APP_ID = 'bot'
/** 2.4.6 -> (2<<16)|(4<<8)|6 */
const ILINK_APP_CLIENT_VERSION = String((2 << 16) | (4 << 8) | 6)

function randomWechatUin(): string {
  const uint32 = randomUUID().slice(0, 8)
  const num = Number.parseInt(uint32, 16) >>> 0
  return Buffer.from(String(num), 'utf8').toString('base64')
}

function buildBaseInfo(): Record<string, string> {
  return { channel_version: '2.4.6', bot_agent: 'dsh-im-channel' }
}

/** Persisted getupdates cursor — restart must not replay old messages. */
function cursorPath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'state', 'wechat-cursor.txt')
}

function loadCursor(): string {
  try {
    return readFileSync(cursorPath(), 'utf8').trim()
  } catch {
    return ''
  }
}

function saveCursor(buf: string): void {
  try {
    mkdirSync(join(cursorPath(), '..'), { recursive: true })
    writeFileSync(cursorPath(), buf, 'utf8')
  } catch {
    // Best-effort persistence.
  }
}

export async function apiFetch(params: {
  endpoint: string
  body?: string
  token?: string
  timeoutMs?: number
}): Promise<string> {  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), params.timeoutMs ?? 15_000)
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'iLink-App-Id': ILINK_APP_ID,
      'iLink-App-ClientVersion': ILINK_APP_CLIENT_VERSION,
    }
    if (params.token?.trim()) {
      headers.Authorization = `Bearer ${params.token.trim()}`
      headers.AuthorizationType = 'ilink_bot_token'
      headers['X-WECHAT-UIN'] = randomWechatUin()
    }
    const init: RequestInit = {
      method: params.body === undefined ? 'GET' : 'POST',
      headers,
      signal: controller.signal,
    }
    if (params.body !== undefined) init.body = params.body
    const response = await fetch(`${FIXED_BASE_URL}/${params.endpoint}`, init)
    const text = await response.text()
    if (!response.ok) throw new Error(`wechat api ${response.status}: ${text}`)
    return text
  } finally {
    clearTimeout(timer)
  }
}

async function getUpdates(params: { buf: string; token: string; timeoutMs: number; signal: AbortSignal }): Promise<GetUpdatesResp> {
  try {
    const raw = await apiFetch({
      endpoint: 'ilink/bot/getupdates',
      body: JSON.stringify({ get_updates_buf: params.buf, base_info: { channel_version: '0.0.1', bot_agent: 'dsh-im-channel' } }),
      token: params.token,
      timeoutMs: params.timeoutMs,
    })
    return JSON.parse(raw) as GetUpdatesResp
  } catch (error) {
    // Long-poll client timeout is a normal control-flow exit: empty retry.
    if (error instanceof Error && error.name === 'AbortError') return { ret: 0, msgs: [] }
    throw error
  }
}

// ---------------------------------------------------------------------------
// QR login (subset of upstream auth/login-qr.ts)
// ---------------------------------------------------------------------------

interface QrStatusResp {
  status: 'wait' | 'scaned' | 'confirmed' | 'expired' | 'scaned_but_redirect' | 'need_verifycode' | 'verify_code_blocked' | 'binded_redirect'
  bot_token?: string
  ilink_bot_id?: string
  baseurl?: string
  ilink_user_id?: string
  redirect_host?: string
}

async function fetchQrCode(botType: string): Promise<{ qrcode: string; url: string }> {
  const raw = await apiFetch({
    endpoint: `ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(botType)}`,
    body: JSON.stringify({ local_token_list: [] }),
  })
  const parsed = JSON.parse(raw) as { qrcode: string; qrcode_img_content: string }
  return { qrcode: parsed.qrcode, url: parsed.qrcode_img_content }
}

async function pollQrStatus(qrcode: string, verifyCode?: string): Promise<QrStatusResp> {
  let endpoint = `ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`
  if (verifyCode !== undefined) endpoint += `&verify_code=${encodeURIComponent(verifyCode)}`
  try {
    const raw = await apiFetch({ endpoint, timeoutMs: QR_LONG_POLL_TIMEOUT_MS })
    return JSON.parse(raw) as QrStatusResp
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return { status: 'wait' }
    throw error
  }
}

/** Render the login QR into the terminal via qrcode-terminal (fallback: URL). */
async function displayQr(url: string): Promise<void> {
  try {
    const qrterm = await import('qrcode-terminal')
    qrterm.default.generate(url, { small: true })
  } catch {
    process.stdout.write('(install qrcode-terminal for in-terminal QR)\n')
  }
  process.stdout.write(`若二维码无法显示，访问此链接继续：\n${url}\n`)
}

export interface WechatLoginResult {
  credentials: WechatCredentials
  scannerUserId: string
}

/**
 * Interactive terminal QR login: display QR, poll status, refresh on expiry
 * (max 3), surface verify-code prompts via the callback. Resolves with the
 * persisted credentials on confirmation.
 */
export async function loginWechat(options: { onVerifyCode: () => Promise<string> }): Promise<WechatLoginResult> {
  let { qrcode, url } = await fetchQrCode(DEFAULT_ILINK_BOT_TYPE)
  await displayQr(url)
  let refreshCount = 1
  let pollBase = FIXED_BASE_URL
  let pendingVerifyCode: string | undefined
  const startedAt = Date.now()
  while (Date.now() - startedAt < 8 * 60_000) {
    // pollQrStatus always targets the fixed host; IDC redirect handling from
    // upstream is intentionally deferred until a redirect is observed in use.
    const status = await pollQrStatus(qrcode, pendingVerifyCode)
    switch (status.status) {
      case 'wait':
        break
      case 'scaned':
        pendingVerifyCode = undefined
        process.stdout.write('\n已扫码，正在验证…\n')
        break
      case 'need_verifycode': {
        pendingVerifyCode = await options.onVerifyCode()
        continue
      }
      case 'expired':
      case 'verify_code_blocked': {
        refreshCount += 1
        if (refreshCount > MAX_QR_REFRESH_COUNT) throw new Error('二维码多次失效，登录流程已停止')
        const fresh = await fetchQrCode(DEFAULT_ILINK_BOT_TYPE)
        qrcode = fresh.qrcode
        url = fresh.url
        await displayQr(url)
        break
      }
      case 'scaned_but_redirect':
        if (status.redirect_host !== undefined) pollBase = `https://${status.redirect_host}`
        break
      case 'binded_redirect':
        throw new Error('该微信机器人已绑定过其他实例，请在原实例解绑后重试')
      case 'confirmed': {
        if (status.bot_token === undefined || status.ilink_bot_id === undefined) {
          throw new Error('登录确认但服务器未返回完整凭证')
        }
        const credentials: WechatCredentials = {
          botToken: status.bot_token,
          accountId: status.ilink_bot_id,
          baseUrl: status.baseurl ?? FIXED_BASE_URL,
        }
        saveWechatCredentials(credentials)
        return { credentials, scannerUserId: status.ilink_user_id ?? '' }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error('登录超时，请重试')
}

// ---------------------------------------------------------------------------
// Channel
// ---------------------------------------------------------------------------

/** Text body extraction from an inbound item list (upstream bodyFromItemList, simplified). */
function textFromItems(items: IlinkMessageItem[] | undefined): string {
  if (items === undefined) return ''
  for (const item of items) {
    if (item.type === 1 && item.text_item?.text != null) return String(item.text_item.text)
    if (item.type === 4 && item.voice_item?.text != null) return item.voice_item.text
  }
  return ''
}

/** The iLink protocol's item type enum values (upstream MessageItemType). */
const ITEM_TEXT = 1
const ITEM_VOICE = 4

export interface WechatChannelOptions {
  /** Called with the terminal-side login QR URL when credentials are missing. */
  onLoginRequest?: () => Promise<void>
  /** Diagnostic sink for inbound messages (wired to the plugin logger). */
  ctxLog?: (line: string) => void
}

export class WechatChannel implements ImChannel {
  readonly kind = 'wechat' as const
  readonly label = '微信'

  private handler: ((message: InboundMessage) => void) | undefined
  private abort: AbortController | undefined
  /** context_token per user; must be echoed on every outbound send. */
  private readonly contextTokens = new Map<string, string>()
  /** Recently seen message ids; the server redelivers on cursor re-sync. */
  private readonly seenMessageIds = new Set<string>()
  /** from|text → last-seen timestamp; 30s window backstop against redelivery. */
  private readonly recentFingerprints = new Map<string, number>()
  private static readonly SEEN_LIMIT = 500

  constructor(private readonly options: WechatChannelOptions = {}) {}

  private ctxLog(line: string): void {
    this.options.ctxLog?.(line)
  }

  isConfigured(): boolean {
    return loadWechatCredentials() !== undefined
  }

  async connect(): Promise<void> {
    const credentials = loadWechatCredentials()
    if (credentials === undefined) throw new Error('微信通道未登录：运行 im-channel 登录流程（终端二维码扫码）')
    this.abort = new AbortController()
    // Server expects an explicit session start; without it long-polls are not
    // held and the account can be rate-limited into errcode=-14.
    try {
      await apiFetch({ endpoint: 'ilink/bot/msg/notifystart', body: JSON.stringify({ base_info: buildBaseInfo() }), token: credentials.botToken, timeoutMs: 10_000 })
    } catch (error) {
      this.ctxLog(`wechat notifystart failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    void this.monitorLoop(credentials)
  }

  onMessage(handler: (message: InboundMessage) => void): void {
    this.handler = handler
  }

  async send(_target: ReplyTarget, message: OutboundMessage): Promise<void> {
    const credentials = loadWechatCredentials()
    if (credentials === undefined) throw new Error('微信通道未登录')
    const to = _target.targetId
    const clientId = randomUUID()
    const body = JSON.stringify({
      msg: {
        from_user_id: '',
        to_user_id: to,
        client_id: clientId,
        message_type: 2,
        message_state: 2,
        item_list: message.text.length > 0 ? [{ type: ITEM_TEXT, text_item: { text: message.text } }] : undefined,
        context_token: this.contextTokens.get(to),
        run_id: undefined,
      },
      base_info: buildBaseInfo(),
    })
    try {
      await apiFetch({
        endpoint: 'ilink/bot/sendmessage',
        body,
        token: credentials.botToken,
      })
      this.ctxLog(`wechat send ok to=${to.slice(0, 12)}… ${message.text.length} chars`)
    } catch (error) {
      this.ctxLog(`wechat send FAILED to=${to.slice(0, 12)}…: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  async stop(): Promise<void> {
    const credentials = loadWechatCredentials()
    if (credentials !== undefined) {
      try {
        await apiFetch({ endpoint: 'ilink/bot/msg/notifystop', body: JSON.stringify({ base_info: buildBaseInfo() }), token: credentials.botToken, timeoutMs: 10_000 })
      } catch {
        // Best-effort: the process may be exiting.
      }
    }
    this.abort?.abort()
  }

  /** Long-poll loop modeled on upstream monitorWeixinProvider. */
  private async monitorLoop(credentials: WechatCredentials): Promise<void> {
    const signal = this.abort?.signal
    if (signal === undefined) return
    let buf = loadCursor()
    let failures = 0
    while (!signal.aborted) {
      try {
        const resp = await getUpdates({ buf, token: credentials.botToken, timeoutMs: UPDATES_LONG_POLL_TIMEOUT_MS, signal })
        this.ctxLog(`wechat getupdates ret=${resp.ret} errcode=${resp.errcode} msgs=${resp.msgs?.length ?? 0} bufLen=${resp.get_updates_buf?.length ?? 0}`)
        // errcode=-14: stale/invalidated bot token. Upstream pauses the whole
        // account for an hour; hammering the endpoint escalates rate-limiting.
        if (resp.errcode === -14 || resp.ret === -14) {
          this.ctxLog('wechat token stale (errcode=-14) — 需要重新扫码登录，暂停轮询')
          return
        }
        const isApiError = (resp.ret !== undefined && resp.ret !== 0) || (resp.errcode !== undefined && resp.errcode !== 0)
        if (isApiError) {
          failures += 1
          if (failures >= MAX_CONSECUTIVE_FAILURES) {
            failures = 0
            await sleep(BACKOFF_DELAY_MS, signal)
          } else {
            await sleep(RETRY_DELAY_MS, signal)
          }
          continue
        }
        failures = 0
        if (resp.get_updates_buf !== undefined && resp.get_updates_buf !== '') {
          buf = resp.get_updates_buf
          saveCursor(buf)
        }
        for (const message of resp.msgs ?? []) {
          const from = message.from_user_id ?? ''
          if (from === '') continue
          if (message.context_token !== undefined) this.contextTokens.set(from, message.context_token)
          const text = textFromItems(message.item_list)
          if (text.length === 0) continue
          const messageId = `${from}:${message.message_id ?? message.create_time_ms ?? Date.now()}`
          if (this.seenMessageIds.has(messageId)) continue
          this.seenMessageIds.add(messageId)
          if (this.seenMessageIds.size > WechatChannel.SEEN_LIMIT) {
            const first = this.seenMessageIds.values().next().value
            if (first !== undefined) this.seenMessageIds.delete(first)
          }
          // Server-side redelivery can mint fresh message ids; the cursor is
          // the primary guard, this windowed fingerprint is the backstop.
          const fingerprint = `${from}|${text}`
          const lastAt = this.recentFingerprints.get(fingerprint)
          if (lastAt !== undefined && Date.now() - lastAt < 30_000) continue
          this.recentFingerprints.set(fingerprint, Date.now())
          this.ctxLog(`wechat inbound at=${new Date().toISOString().slice(11, 19)} id=${message.message_id ?? '?'} from=${from} text=${text.slice(0, 40)}`)
          this.handler?.({
            from: { kind: 'wechat', userId: from as ImUserId },
            text,
            messageId,
          })
        }
      } catch (error) {
        if (signal.aborted) return
        failures += 1
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
          failures = 0
          await sleep(BACKOFF_DELAY_MS, signal)
        } else {
          await sleep(RETRY_DELAY_MS, signal)
        }
      }
    }
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('aborted'))
    }, { once: true })
  })
}
