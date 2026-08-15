/**
 * QQ QR login bridged to the browser login session: drives
 * @tencent-connect/qqbot-connector's callback-style connect, publishing the
 * QR URL on the session record and persisting credentials on success.
 */

import type { QrLoginBridge } from '../../plugin/login-api.ts'
import { saveQqCredentials } from './index.ts'

/** Run the browser-driven QQ login; resolves once credentials are saved. */
export async function beginQqQrLogin(session: QrLoginBridge): Promise<void> {
  const { startQrConnect } = await import('@tencent-connect/qqbot-connector')
  await new Promise<void>((resolve, reject) => {
    startQrConnect(
      {
        onSuccess(credentials) {
          const first = credentials[0]
          if (first === undefined) {
            reject(new Error('扫码成功但未返回凭据'))
            return
          }
          saveQqCredentials({ appId: first.appId, appSecret: first.appSecret })
          resolve()
        },
        onFailure(error) {
          reject(error)
        },
        onQrDisplayed(url) {
          session.qrUrl = url
        },
      },
      { source: 'dsh-im-channel', displayQrCodeToConsole: false },
    )
  })
}
