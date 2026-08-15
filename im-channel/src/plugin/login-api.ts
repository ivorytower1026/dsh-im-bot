/**
 * Browser-facing login surface: one webServer route pair per boot that starts
 * a QR login for any of the four platforms and reports its status. The QR
 * image renders in the browser from the URL the platform returns; the host
 * only brokers the credential exchange.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the webServer Context merge declared by dsh-host-webserver.
import type {} from '@deepseek-ai/dsh-host-webserver'

type LoginKind = 'wechat' | 'qq' | 'feishu' | 'dingtalk'
const KINDS: readonly LoginKind[] = ['wechat', 'qq', 'feishu', 'dingtalk']

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
      // Some platform bridges (notably QQ) poll forever without timing out;
      // cap the session so the UI stops waiting after the TTL.
      setTimeout(() => {
        if (this.session === session && session.status === 'pending') {
          session.status = 'error'
          session.error = 'login timed out'
        }
      }, SESSION_TTL_MS).unref()
      // The QR URL arrives asynchronously from the platform; poll status.
      respondJson(res, 200, { ok: true })
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
        case 'qq': {
          const { beginQqQrLogin } = await import('../channels/qq/login-bridge.ts')
          await beginQqQrLogin(session)
          break
        }
        case 'feishu': {
          const { beginFeishuQrLogin } = await import('../channels/feishu/login-bridge.ts')
          await beginFeishuQrLogin(session)
          break
        }
        case 'dingtalk': {
          const { beginDingtalkQrLogin } = await import('../channels/dingtalk/login-bridge.ts')
          await beginDingtalkQrLogin(session)
          break
        }
      }
      session.status = 'confirmed'
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
