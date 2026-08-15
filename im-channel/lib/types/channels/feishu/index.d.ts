/**
 * Feishu/Lark channel: official @larksuiteoapi/node-sdk WebSocket long
 * connection (WSClient). A self-built app with bot capability provides
 * appId/appSecret; im.message.receive_v1 feeds the router; replies go
 * through the REST message API via the SDK client.
 */
import type { ImChannel, InboundMessage, OutboundMessage, ReplyTarget } from '../../core/channel.ts';
/** Channel credentials persisted at ~/.dsh/im-channel/credentials/feishu.json. */
export interface FeishuCredentials {
    appId: string;
    appSecret: string;
}
export declare function loadFeishuCredentials(): FeishuCredentials | undefined;
export declare function saveFeishuCredentials(credentials: FeishuCredentials): void;
export declare class FeishuChannel implements ImChannel {
    readonly kind: "feishu";
    readonly label = "\u98DE\u4E66";
    private handler;
    private client;
    private wsClient;
    isConfigured(): boolean;
    connect(): Promise<void>;
    onMessage(handler: (message: InboundMessage) => void): void;
    send(target: ReplyTarget, message: OutboundMessage): Promise<void>;
    stop(): Promise<void>;
    private dispatch;
}
