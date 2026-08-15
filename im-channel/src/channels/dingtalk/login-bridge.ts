/**
 * DingTalk QR login bridged to the browser login session: the device-code
 * app-registration protocol (init → begin → poll) transplanted from
 * DingTalk-Real-AI/dingtalk-openclaw-connector (MIT, official DingTalk).
 * The verification_uri_complete URL is the QR content; polling returns
 * clientId/clientSecret on SUCCESS.
 */

import type { QrLoginBridge } from '../../plugin/login-api.ts'
import { saveDingtalkCredentials } from './index.ts'

/** MIT notice: protocol transplanted from DingTalk-Real-AI/dingtalk-openclaw-connector, Copyright DingTalk Real AI. */
const REGISTRATION_BASE = 'https://oapi.dingtalk.com'
const REGISTRATION_SOURCE = 'DING_DWS_CLAW'
const POLL_INTERVAL_MS = 5_000
const LOGIN_WINDOW_MS = 8 * 60_000

interface RegistrationResponse<T> extends Record<string, unknown> {
  errcode?: number
  errmsg?: string
}

interface BeginResponse extends RegistrationResponse<never> {
  device_code?: string
  verification_uri_complete?: string
  expires_in?: number
  interval?: number
}

interface PollResponse extends RegistrationResponse<never> {
  status?: string
  client_id?: string
  client_secret?: string
  fail_reason?: string
}

async function post<T extends Record<string, unknown>>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${REGISTRATION_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`dingtalk registration ${path} ${response.status}: ${await response.text()}`)
  return JSON.parse(await response.text()) as T
}

/** Run the browser-driven DingTalk login; resolves once credentials are saved. */
export async function beginDingtalkQrLogin(session: QrLoginBridge): Promise<void> {
  const init = await post<RegistrationResponse<{ nonce?: string }>>('/app/registration/init', { source: REGISTRATION_SOURCE })
  if (init.errcode !== 0) throw new Error(`钉钉 init 失败: ${init.errmsg ?? init.errcode}`)
  const nonce = String(init.nonce ?? '').trim()
  if (nonce === '') throw new Error('钉钉 init 未返回 nonce')

  const begin = await post<BeginResponse>('/app/registration/begin', { nonce })
  if (begin.errcode !== 0) throw new Error(`钉钉 begin 失败: ${begin.errmsg ?? begin.errcode}`)
  const deviceCode = String(begin.device_code ?? '').trim()
  const qrUrl = String(begin.verification_uri_complete ?? '').trim()
  if (deviceCode === '' || qrUrl === '') throw new Error('钉钉 begin 未返回完整授权信息')
  session.qrUrl = qrUrl

  const intervalSeconds = Number(begin.interval)
  const intervalMs = Number.isFinite(intervalSeconds) && intervalSeconds > 0 ? intervalSeconds * 1000 : POLL_INTERVAL_MS
  const startedAt = Date.now()
  while (Date.now() - startedAt < LOGIN_WINDOW_MS) {
    await new Promise(resolve => setTimeout(resolve, intervalMs))
    const poll = await post<PollResponse>('/app/registration/poll', { device_code: deviceCode })
    if (poll.errcode !== 0) throw new Error(`钉钉 poll 失败: ${poll.errmsg ?? poll.errcode}`)
    const status = String(poll.status ?? '').trim().toUpperCase()
    if (status === 'WAITING') continue
    if (status === 'SUCCESS') {
      const clientId = String(poll.client_id ?? '').trim()
      const clientSecret = String(poll.client_secret ?? '').trim()
      if (clientId === '' || clientSecret === '') throw new Error('授权成功但凭证缺失')
      saveDingtalkCredentials({ clientId, clientSecret })
      return
    }
    if (status === 'EXPIRED') throw new Error('授权已过期，请重试')
    if (status === 'FAIL') throw new Error(poll.fail_reason ?? '授权失败')
  }
  throw new Error('登录超时，请重试')
}
