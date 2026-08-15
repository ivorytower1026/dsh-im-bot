/**
 * WeChat personal-account bot via the official Tencent iLink protocol
 * (ilinkai.weixin.qq.com), transplanted from Tencent/openclaw-weixin (MIT).
 * Text messaging only in this first cut; media/CDN upload stays upstream.
 *
 * MIT license notice: portions Copyright (C) 2026 Tencent. All rights reserved.
 */
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
const FIXED_BASE_URL = 'https://ilinkai.weixin.qq.com';
const DEFAULT_ILINK_BOT_TYPE = '3';
export { DEFAULT_ILINK_BOT_TYPE };
const ACTIVE_LOGIN_TTL_MS = 5 * 60_000;
const UPDATES_LONG_POLL_TIMEOUT_MS = 35_000;
const MAX_CONSECUTIVE_FAILURES = 3;
const BACKOFF_DELAY_MS = 30_000;
const RETRY_DELAY_MS = 2_000;
// ---------------------------------------------------------------------------
// Credential storage
// ---------------------------------------------------------------------------
function credentialsPath() {
    return join(homedir(), '.dsh', 'im-channel', 'credentials', 'wechat.json');
}
export function loadWechatCredentials() {
    const path = credentialsPath();
    if (!existsSync(path))
        return undefined;
    return JSON.parse(readFileSync(path, 'utf8'));
}
export function saveWechatCredentials(credentials) {
    const path = credentialsPath();
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
}
// iLink app identity headers required by every request (upstream
// openclaw-weixin package.json ilink_appid + encoded client version).
const ILINK_APP_ID = 'bot';
/** 2.4.6 -> (2<<16)|(4<<8)|6 */
const ILINK_APP_CLIENT_VERSION = String((2 << 16) | (4 << 8) | 6);
function randomWechatUin() {
    const uint32 = randomUUID().slice(0, 8);
    const num = Number.parseInt(uint32, 16) >>> 0;
    return Buffer.from(String(num), 'utf8').toString('base64');
}
function buildBaseInfo() {
    return { channel_version: '2.4.6', bot_agent: 'dsh-im-channel' };
}
/** Persisted getupdates cursor — restart must not replay old messages. */
function cursorPath() {
    return join(homedir(), '.dsh', 'im-channel', 'state', 'wechat-cursor.txt');
}
function loadCursor() {
    try {
        return readFileSync(cursorPath(), 'utf8').trim();
    }
    catch {
        return '';
    }
}
function saveCursor(buf) {
    try {
        mkdirSync(join(cursorPath(), '..'), { recursive: true });
        writeFileSync(cursorPath(), buf, 'utf8');
    }
    catch {
        // Best-effort persistence.
    }
}
export async function apiFetch(params) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), params.timeoutMs ?? 15_000);
    try {
        const headers = {
            'Content-Type': 'application/json',
            'iLink-App-Id': ILINK_APP_ID,
            'iLink-App-ClientVersion': ILINK_APP_CLIENT_VERSION,
        };
        if (params.token?.trim()) {
            headers.Authorization = `Bearer ${params.token.trim()}`;
            headers.AuthorizationType = 'ilink_bot_token';
            headers['X-WECHAT-UIN'] = randomWechatUin();
        }
        const init = {
            method: params.body === undefined ? 'GET' : 'POST',
            headers,
            signal: controller.signal,
        };
        if (params.body !== undefined)
            init.body = params.body;
        const response = await fetch(`${FIXED_BASE_URL}/${params.endpoint}`, init);
        const text = await response.text();
        if (!response.ok)
            throw new Error(`wechat api ${response.status}: ${text}`);
        return text;
    }
    finally {
        clearTimeout(timer);
    }
}
async function getUpdates(params) {
    try {
        const raw = await apiFetch({
            endpoint: 'ilink/bot/getupdates',
            body: JSON.stringify({ get_updates_buf: params.buf, base_info: { channel_version: '0.0.1', bot_agent: 'dsh-im-channel' } }),
            token: params.token,
            timeoutMs: params.timeoutMs,
        });
        return JSON.parse(raw);
    }
    catch (error) {
        // Long-poll client timeout is a normal control-flow exit: empty retry.
        if (error instanceof Error && error.name === 'AbortError')
            return { ret: 0, msgs: [] };
        throw error;
    }
}
// ---------------------------------------------------------------------------
// Channel
// ---------------------------------------------------------------------------
/** Text body extraction from an inbound item list (upstream bodyFromItemList, simplified). */
function textFromItems(items) {
    if (items === undefined)
        return '';
    for (const item of items) {
        if (item.type === 1 && item.text_item?.text != null)
            return String(item.text_item.text);
        if (item.type === 4 && item.voice_item?.text != null)
            return item.voice_item.text;
    }
    return '';
}
/** The iLink protocol's item type enum values (upstream MessageItemType). */
const ITEM_TEXT = 1;
const ITEM_VOICE = 4;
export class WechatChannel {
    options;
    kind = 'wechat';
    label = '微信';
    handler;
    abort;
    /** context_token per user; must be echoed on every outbound send. */
    contextTokens = new Map();
    /** Recently seen message ids; the server redelivers on cursor re-sync. */
    seenMessageIds = new Set();
    /** from|text → last-seen timestamp; 30s window backstop against redelivery. */
    recentFingerprints = new Map();
    static SEEN_LIMIT = 500;
    constructor(options = {}) {
        this.options = options;
    }
    ctxLog(line) {
        this.options.ctxLog?.(line);
    }
    isConfigured() {
        return loadWechatCredentials() !== undefined;
    }
    async connect() {
        const credentials = loadWechatCredentials();
        if (credentials === undefined)
            throw new Error('微信通道未登录：运行 im-channel 登录流程（终端二维码扫码）');
        this.abort = new AbortController();
        // Server expects an explicit session start; without it long-polls are not
        // held and the account can be rate-limited into errcode=-14.
        try {
            await apiFetch({ endpoint: 'ilink/bot/msg/notifystart', body: JSON.stringify({ base_info: buildBaseInfo() }), token: credentials.botToken, timeoutMs: 10_000 });
        }
        catch (error) {
            this.ctxLog(`wechat notifystart failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        void this.monitorLoop(credentials);
    }
    onMessage(handler) {
        this.handler = handler;
    }
    async send(_target, message) {
        const credentials = loadWechatCredentials();
        if (credentials === undefined)
            throw new Error('微信通道未登录');
        const to = _target.targetId;
        const clientId = randomUUID();
        const body = JSON.stringify({
            msg: {
                from_user_id: '',
                to_user_id: to,
                client_id: clientId,
                message_type: 2,
                message_state: 2,
                item_list: message.text.length > 0 ? [{ type: ITEM_TEXT, text_item: { text: message.text } }] : undefined,
                context_token: this.contextTokens.get(to),
                run_id: undefined,
            },
            base_info: buildBaseInfo(),
        });
        try {
            await apiFetch({
                endpoint: 'ilink/bot/sendmessage',
                body,
                token: credentials.botToken,
            });
            this.ctxLog(`wechat send ok to=${to.slice(0, 12)}… ${message.text.length} chars`);
        }
        catch (error) {
            this.ctxLog(`wechat send FAILED to=${to.slice(0, 12)}…: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async stop() {
        const credentials = loadWechatCredentials();
        if (credentials !== undefined) {
            try {
                await apiFetch({ endpoint: 'ilink/bot/msg/notifystop', body: JSON.stringify({ base_info: buildBaseInfo() }), token: credentials.botToken, timeoutMs: 10_000 });
            }
            catch {
                // Best-effort: the process may be exiting.
            }
        }
        this.abort?.abort();
    }
    /** Long-poll loop modeled on upstream monitorWeixinProvider. */
    async monitorLoop(credentials) {
        const signal = this.abort?.signal;
        if (signal === undefined)
            return;
        let buf = loadCursor();
        let failures = 0;
        while (!signal.aborted) {
            try {
                const resp = await getUpdates({ buf, token: credentials.botToken, timeoutMs: UPDATES_LONG_POLL_TIMEOUT_MS, signal });
                this.ctxLog(`wechat getupdates ret=${resp.ret} errcode=${resp.errcode} msgs=${resp.msgs?.length ?? 0} bufLen=${resp.get_updates_buf?.length ?? 0}`);
                // errcode=-14: stale/invalidated bot token. Upstream pauses the whole
                // account for an hour; hammering the endpoint escalates rate-limiting.
                if (resp.errcode === -14 || resp.ret === -14) {
                    this.ctxLog('wechat token stale (errcode=-14) — 需要重新扫码登录，暂停轮询');
                    return;
                }
                const isApiError = (resp.ret !== undefined && resp.ret !== 0) || (resp.errcode !== undefined && resp.errcode !== 0);
                if (isApiError) {
                    failures += 1;
                    if (failures >= MAX_CONSECUTIVE_FAILURES) {
                        failures = 0;
                        await sleep(BACKOFF_DELAY_MS, signal);
                    }
                    else {
                        await sleep(RETRY_DELAY_MS, signal);
                    }
                    continue;
                }
                failures = 0;
                if (resp.get_updates_buf !== undefined && resp.get_updates_buf !== '') {
                    buf = resp.get_updates_buf;
                    saveCursor(buf);
                }
                for (const message of resp.msgs ?? []) {
                    const from = message.from_user_id ?? '';
                    if (from === '')
                        continue;
                    if (message.context_token !== undefined)
                        this.contextTokens.set(from, message.context_token);
                    const text = textFromItems(message.item_list);
                    if (text.length === 0)
                        continue;
                    const messageId = `${from}:${message.message_id ?? message.create_time_ms ?? Date.now()}`;
                    if (this.seenMessageIds.has(messageId))
                        continue;
                    this.seenMessageIds.add(messageId);
                    if (this.seenMessageIds.size > WechatChannel.SEEN_LIMIT) {
                        const first = this.seenMessageIds.values().next().value;
                        if (first !== undefined)
                            this.seenMessageIds.delete(first);
                    }
                    // Server-side redelivery can mint fresh message ids; the cursor is
                    // the primary guard, this windowed fingerprint is the backstop.
                    const fingerprint = `${from}|${text}`;
                    const lastAt = this.recentFingerprints.get(fingerprint);
                    if (lastAt !== undefined && Date.now() - lastAt < 30_000)
                        continue;
                    this.recentFingerprints.set(fingerprint, Date.now());
                    this.ctxLog(`wechat inbound at=${new Date().toISOString().slice(11, 19)} id=${message.message_id ?? '?'} from=${from} text=${text.slice(0, 40)}`);
                    this.handler?.({
                        from: { kind: 'wechat', userId: from },
                        text,
                        messageId,
                    });
                }
            }
            catch (error) {
                if (signal.aborted)
                    return;
                failures += 1;
                if (failures >= MAX_CONSECUTIVE_FAILURES) {
                    failures = 0;
                    await sleep(BACKOFF_DELAY_MS, signal);
                }
                else {
                    await sleep(RETRY_DELAY_MS, signal);
                }
            }
        }
    }
}
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('aborted'));
        }, { once: true });
    });
}
