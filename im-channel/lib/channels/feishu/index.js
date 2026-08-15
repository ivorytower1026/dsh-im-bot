/**
 * Feishu/Lark channel: official @larksuiteoapi/node-sdk WebSocket long
 * connection (WSClient). A self-built app with bot capability provides
 * appId/appSecret; im.message.receive_v1 feeds the router; replies go
 * through the REST message API via the SDK client.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as Lark from '@larksuiteoapi/node-sdk';
function credentialsPath() {
    return join(homedir(), '.dsh', 'im-channel', 'credentials', 'feishu.json');
}
export function loadFeishuCredentials() {
    const path = credentialsPath();
    if (!existsSync(path))
        return undefined;
    return JSON.parse(readFileSync(path, 'utf8'));
}
export function saveFeishuCredentials(credentials) {
    const path = credentialsPath();
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
}
export class FeishuChannel {
    kind = 'feishu';
    label = '飞书';
    handler;
    client;
    wsClient;
    isConfigured() {
        return loadFeishuCredentials() !== undefined;
    }
    async connect() {
        const credentials = loadFeishuCredentials();
        if (credentials === undefined)
            throw new Error('飞书通道未配置：先创建自建应用并保存 appId/appSecret');
        try {
            this.client = new Lark.Client({ appId: credentials.appId, appSecret: credentials.appSecret });
            this.wsClient = new Lark.WSClient({
                appId: credentials.appId,
                appSecret: credentials.appSecret,
                loggerLevel: Lark.LoggerLevel.warn,
            });
            await this.wsClient.start({
                eventDispatcher: new Lark.EventDispatcher({}).register({
                    'im.message.receive_v1': (data) => {
                        this.dispatch(data);
                        return Promise.resolve();
                    },
                }),
            });
            process.stdout.write('[im-channel] feishu 长连接已建立\n');
        }
        catch (error) {
            process.stdout.write(`[im-channel] feishu connect FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
            throw error;
        }
    }
    onMessage(handler) {
        this.handler = handler;
    }
    async send(target, message) {
        if (this.client === undefined)
            throw new Error('飞书通道未连接');
        await this.client.im.v1.message.create({
            params: { receive_id_type: 'chat_id' },
            data: {
                receive_id: target.targetId,
                content: JSON.stringify({ text: message.text }),
                msg_type: 'text',
            },
        });
    }
    async stop() {
        this.wsClient?.close();
    }
    dispatch(event) {
        const message = event.message;
        const openId = event.sender?.sender_id?.open_id;
        if (message?.chat_id === undefined || openId === undefined || message.message_id === undefined)
            return;
        if (message.message_type !== 'text')
            return;
        let text = '';
        try {
            text = JSON.parse(message.content ?? '{}').text ?? '';
        }
        catch {
            return;
        }
        if (text.length === 0)
            return;
        this.handler?.({
            from: { kind: 'feishu', userId: openId },
            text,
            messageId: message.message_id,
            chatId: message.chat_id,
        });
    }
}
