/**
 * WeChat QR login bridged to the browser login session: fetches the QR from
 * the iLink endpoint, publishes its URL on the session record, then polls to
 * confirmation and persists credentials. Terminal output stays for the
 * no-browser path; the bridge itself never writes to stdout.
 */

import type { QrLoginBridge } from '../../plugin/login-api.ts'
import { apiFetch, DEFAULT_ILINK_BOT_TYPE, loadWechatCredentials, saveWechatCredentials } from './index.ts'

const QR_POLL_INTERVAL_MS = 1000
const QR_LONG_POLL_TIMEOUT_MS = 35_000
const LOGIN_WINDOW_MS = 8 * 60_000

interface QrStatusResp {
  status: 'wait' | 'scaned' | 'confirmed' | 'expired' | 'scaned_but_redirect' | 'need_verifycode' | 'verify_code_blocked' | 'binded_redirect'
  bot_token?: string
  ilink_bot_id?: string
  baseurl?: string
  redirect_host?: string
}

async function fetchQr(): Promise<{ qrcode: string; url: string }> {
  const raw = await apiFetch({
    endpoint: `ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(DEFAULT_ILINK_BOT_TYPE)}`,
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

/**
 * Run the browser-driven WeChat login: publish the QR URL on the session,
 * poll until confirmed, save credentials. Verify-code steps surface as an
 * error prompting the terminal path (the iLink verify code is typed in the
 * WeChat mobile app, not this browser).
 */
export async function beginWechatQrLogin(session: QrLoginBridge): Promise<void> {
  let { qrcode, url } = await fetchQr()
  session.qrUrl = url
  const startedAt = Date.now()
  while (Date.now() - startedAt < LOGIN_WINDOW_MS) {
    const status = await pollQrStatus(qrcode)
    switch (status.status) {
      case 'wait':
        break
      case 'scaned':
        break
      case 'expired':
      case 'verify_code_blocked': {
        const fresh = await fetchQr()
        qrcode = fresh.qrcode
        session.qrUrl = fresh.url
        break
      }
      case 'need_verifycode':
        throw new Error('微信要求输入验证码：请改用终端登录流程（在启动 harness 的终端中运行 im-channel 登录）')
      case 'binded_redirect':
        if (loadWechatCredentials() !== undefined) return
        throw new Error('该微信机器人已绑定其他实例，请在原实例解绑后重试')
      case 'confirmed': {
        if (status.bot_token === undefined || status.ilink_bot_id === undefined) {
          throw new Error('登录确认但服务器未返回完整凭证')
        }
        saveWechatCredentials({
          botToken: status.bot_token,
          accountId: status.ilink_bot_id,
          baseUrl: status.baseurl ?? 'https://ilinkai.weixin.qq.com',
        })
        return
      }
      default:
        break
    }
    await new Promise(resolve => setTimeout(resolve, QR_POLL_INTERVAL_MS))
  }
  throw new Error('登录超时，请重试')
}
