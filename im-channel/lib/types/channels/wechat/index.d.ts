/**
 * WeChat personal-account bot via the official Tencent iLink protocol
 * (ilinkai.weixin.qq.com), transplanted from Tencent/openclaw-weixin (MIT).
 * Text messaging only in this first cut; media/CDN upload stays upstream.
 *
 * MIT license notice: portions Copyright (C) 2026 Tencent. All rights reserved.
 */
import type { ImChannel, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts';
declare const DEFAULT_ILINK_BOT_TYPE = "3";
export { DEFAULT_ILINK_BOT_TYPE };
/** Channel credentials persisted at ~/.dsh/im-channel/credentials/wechat.json. */
export interface WechatCredentials {
    botToken: string;
    /** The bot's own id (ilink_bot_id). */
    accountId: string;
    /** API base URL returned at login; overrides the fixed base. */
    baseUrl?: string;
}
export declare function loadWechatCredentials(): WechatCredentials | undefined;
export declare function saveWechatCredentials(credentials: WechatCredentials): void;
export declare function apiFetch(params: {
    endpoint: string;
    body?: string;
    token?: string;
    timeoutMs?: number;
}): Promise<string>;
export interface WechatChannelOptions {
    /** Called with the terminal-side login QR URL when credentials are missing. */
    onLoginRequest?: () => Promise<void>;
    /** Diagnostic sink for inbound messages (wired to the plugin logger). */
    ctxLog?: (line: string) => void;
}
export declare class WechatChannel implements ImChannel {
    private readonly options;
    readonly kind: "wechat";
    readonly label = "\u5FAE\u4FE1";
    private handler;
    private abort;
    /** context_token per user; must be echoed on every outbound send. */
    private readonly contextTokens;
    /** Recently seen message ids; the server redelivers on cursor re-sync. */
    private readonly seenMessageIds;
    /** from|text → last-seen timestamp; 30s window backstop against redelivery. */
    private readonly recentFingerprints;
    private static readonly SEEN_LIMIT;
    constructor(options?: WechatChannelOptions);
    private ctxLog;
    isConfigured(): boolean;
    connect(): Promise<void>;
    onMessage(handler: (message: InboundMessage) => void): void;
    send(_target: ReplyTarget, message: OutboundMessage): Promise<void>;
    stop(): Promise<void>;
    /** Long-poll loop modeled on upstream monitorWeixinProvider. */
    private monitorLoop;
}
