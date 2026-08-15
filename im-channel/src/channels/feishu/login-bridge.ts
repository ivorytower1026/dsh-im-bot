/**
 * Feishu QR login bridged to the browser login session: the official Node
 * SDK's registerApp (OAuth 2.0 Device Authorization Grant, RFC 8628) — QR URL
 * via onQRCodeReady, credentials persisted on completion.
 */

import * as Lark from '@larksuiteoapi/node-sdk'
import type { QrLoginBridge } from '../../plugin/login-api.ts'
import { saveFeishuCredentials } from './index.ts'

/** Run the browser-driven Feishu login; resolves once credentials are saved. */
export async function beginFeishuQrLogin(session: QrLoginBridge): Promise<void> {
  const result = await Lark.registerApp({
    onQRCodeReady(info) {
      session.qrUrl = info.url
    },
  })
  saveFeishuCredentials({ appId: result.client_id, appSecret: result.client_secret })
}
