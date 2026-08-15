/**
 * Feishu QR login bridged to the browser login session: the official Node
 * SDK's registerApp (OAuth 2.0 Device Authorization Grant, RFC 8628) — QR URL
 * via onQRCodeReady, credentials persisted on completion.
 */
import type { QrLoginBridge } from '../../plugin/login-api.ts';
/** Run the browser-driven Feishu login; resolves once credentials are saved. */
export declare function beginFeishuQrLogin(session: QrLoginBridge): Promise<void>;
