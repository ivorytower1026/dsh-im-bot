/**
 * Browser-facing login surface: one webServer route pair per boot that starts
 * a QR login for any supported platform and reports its status. The QR
 * image renders in the browser from the URL the platform returns; the host
 * only brokers the credential exchange.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Session record the platform login bridges write the QR URL onto. */
export interface QrLoginBridge {
    qrUrl: string | undefined;
}
export declare class LoginApi {
    private readonly ctx;
    private session;
    constructor(ctx: Context);
    /** Register the /im-channel/login/* routes on the web server. */
    register(): void;
    private handleBindingRemove;
    /**
     * Auto-create a channel instance in settings once a platform login is
     * confirmed so the router (re)starts without manual configuration. One
     * instance per platform: the wechat protocol allows exactly one poll
     * session per bot token, and duplicate instances multiply every reply.
     */
    private ensureChannelInstance;
    private handleBindings;
    private readBindings;
    private handleStart;
    private runLogin;
    private handleStatus;
}
