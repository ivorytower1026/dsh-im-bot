/**
 * WeChat QR login bridged to the browser login session: fetches the QR from
 * the iLink endpoint, publishes its URL on the session record, then polls to
 * confirmation and persists credentials. Terminal output stays for the
 * no-browser path; the bridge itself never writes to stdout.
 */
import type { QrLoginBridge } from '../../plugin/login-api.ts';
/**
 * Run the browser-driven WeChat login: publish the QR URL on the session,
 * poll until confirmed, save credentials. Verify-code steps surface as an
 * error prompting the terminal path (the iLink verify code is typed in the
 * WeChat mobile app, not this browser).
 */
export declare function beginWechatQrLogin(session: QrLoginBridge): Promise<void>;
