/**
 * Browser-facing login surface: one webServer route pair per boot that starts
 * a QR login for any supported platform and reports its status. The QR
 * image renders in the browser from the URL the platform returns; the host
 * only brokers the credential exchange.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the webServer Context merge declared by dsh-host-webserver.
import type {} from '@deepseek-ai/dsh-host-webserver'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

type LoginKind = 'wechat' | 'feishu'
const KINDS: readonly LoginKind[] = ['wechat', 'feishu']

const KIND_LABELS: Record<LoginKind, string> = {
  wechat: '微信',
  feishu: '飞书',
}

const NS = settingsNamespace('im-channel')

/** Session record the platform login bridges write the QR URL onto. */
export interface QrLoginBridge {
  qrUrl: string | undefined
}

interface QrLoginSession extends QrLoginBridge {
  kind: LoginKind
  startedAt: number
  status: 'pending' | 'confirmed' | 'error'
  error: string | undefined
}

const SESSION_TTL_MS = 8 * 60_000

export class LoginApi {
  private session: QrLoginSession | undefined

  constructor(private readonly ctx: Context) {}

  /** Register the /im-channel/login/* routes on the web server. */
  register(): void {
    this.ctx.webServer.register({
      kind: 'exact',
      path: '/im-channel/login/start',
      handler: (req: IncomingMessage, res: ServerResponse) => void this.handleStart(req, res),
    })
    this.ctx.webServer.register({
      kind: 'exact',
      path: '/im-channel/login/status',
      handler: (req: IncomingMessage, res: ServerResponse) => this.handleStatus(res),
    })
    this.ctx.webServer.register({
      kind: 'exact',
      path: '/im-channel/bindings',
      handler: (_req: IncomingMessage, res: ServerResponse) => this.handleBindings(res),
    })
    this.ctx.webServer.register({
      kind: 'exact',
      path: '/im-channel/bindings/remove',
      handler: (req: IncomingMessage, res: ServerResponse) => void this.handleBindingRemove(req, res),
    })
  }

  private async handleBindingRemove(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await readJsonBody(req) as { kind?: string; userId?: string; sessionId?: string }
      const { removeBinding } = await import('../core/bind-store.ts')
      const match: { kind?: string; userId?: string; sessionId?: string } = {}
      if (typeof body.kind === 'string') match.kind = body.kind
      if (typeof body.userId === 'string') match.userId = body.userId
      if (typeof body.sessionId === 'string') match.sessionId = body.sessionId
      const removed = removeBinding(match)
      respondJson(res, 200, { ok: true, removed })
    } catch (error) {
      respondJson(res, 500, { ok: false, error: messageOf(error) })
    }
  }

  /**
   * Auto-create a channel instance in settings once a platform login is
   * confirmed so the router (re)starts without manual configuration. One
   * instance per platform: the wechat protocol allows exactly one poll
   * session per bot token, and duplicate instances multiply every reply.
   */
  private async ensureChannelInstance(kind: LoginKind): Promise<void> {
    try {
      this.ctx.inject(['settings'], async sctx => {
        const section = sctx.settings.get(NS) as { channels?: Record<string, { kind: LoginKind }> } | undefined
        const channels = section?.channels ?? {}
        const exists = Object.values(channels).some(v => v.kind === kind)
        if (exists) return
        await sctx.settings.update(NS, {
          channels: {
            [`${kind}-1`]: { kind, enabled: true, displayName: `${KIND_LABELS[kind]}机器人 1` },
          },
        })
      })
    } catch (error) {
      this.ctx.logger.warn(`im-channel: 自动创建 ${kind} 实例失败: ${messageOf(error)}`)
    }
  }

  private handleBindings(res: ServerResponse): void {
    // Read the persisted binding rows directly; each /bind adds one
    // user-to-session row per platform bot.
    void this.readBindings().then(rows => {
      respondJson(res, 200, {
        ok: true,
        bindings: rows,
        count: rows.length,
      })
    })
  }

  private async readBindings(): Promise<Array<{ kind: string; boundAt: string; sessionId: string }>> {
    try {
      const { listBindings } = await import('../core/bind-store.ts')
      return listBindings()
    } catch {
      return []
    }
  }

  private async handleStart(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await readJsonBody(req) as { kind?: string }
      const kind = body.kind
      if (typeof kind !== 'string' || !KINDS.includes(kind as LoginKind)) {
        respondJson(res, 400, { ok: false, error: `kind must be one of ${KINDS.join(', ')}` })
        return
      }
      const loginKind: LoginKind = kind as LoginKind
      // A new card click is explicit intent to switch: retire any prior
      // pending session instead of rejecting the new login.
      const prior = this.session
      if (prior !== undefined && prior.status === 'pending') {
        prior.status = 'error'
        prior.error = 'superseded by a new login'
      }
      const session: QrLoginSession = { kind: loginKind, startedAt: Date.now(), qrUrl: undefined, status: 'pending', error: undefined }
      this.session = session
      // Start the platform login out-of-band; the QR URL and terminal state
      // land on the session record for status polling.
      void this.runLogin(loginKind, session)
      // Hold the start response briefly until the platform returns the QR
      // URL so the client can paint it immediately instead of waiting for
      // its first status poll.
      for (let waited = 0; waited < 100 && session.qrUrl === undefined && session.status === 'pending'; waited++) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      // Some platform bridges poll forever without timing out; cap the
      // session so the UI stops waiting after the TTL.
      setTimeout(() => {
        if (this.session === session && session.status === 'pending') {
          session.status = 'error'
          session.error = 'login timed out'
        }
      }, SESSION_TTL_MS).unref()
      // The QR URL arrives asynchronously from the platform; poll status.
      respondJson(res, 200, { ok: true, qrUrl: session.qrUrl })
    } catch (error) {
      respondJson(res, 500, { ok: false, error: messageOf(error) })
    }
  }

  private async runLogin(kind: LoginKind, session: QrLoginSession): Promise<void> {
    try {
      switch (kind) {
        case 'wechat': {
          const { beginWechatQrLogin } = await import('../channels/wechat/login-bridge.ts')
          await beginWechatQrLogin(session)
          break
        }
        case 'feishu': {
          const { beginFeishuQrLogin } = await import('../channels/feishu/login-bridge.ts')
          await beginFeishuQrLogin(session)
          break
        }
      }
      session.status = 'confirmed'
      await this.ensureChannelInstance(kind)
    } catch (error) {
      session.status = 'error'
      session.error = messageOf(error)
    }
  }

  private handleStatus(res: ServerResponse): void {
    const session = this.session
    if (session === undefined || Date.now() - session.startedAt > SESSION_TTL_MS) {
      respondJson(res, 200, { ok: true, session: null })
      return
    }
    respondJson(res, 200, {
      ok: true,
      session: {
        kind: session.kind,
        status: session.status,
        qrUrl: session.qrUrl,
        error: session.error,
        elapsedMs: Date.now() - session.startedAt,
      },
    })
  }
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk })
    req.on('end', () => {
      try {
        resolve(data.length === 0 ? {} : JSON.parse(data))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function respondJson(res: ServerResponse, code: number, body: unknown): void {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
