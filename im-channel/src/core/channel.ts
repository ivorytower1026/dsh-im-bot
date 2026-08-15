/**
 * Brand for opaque IM user ids (Feishu open_id, WeChat ilink_user_id) that
 * cross the channel boundary into binding and routing. Never a bare string.
 */
declare const IM_USER_ID_BRAND: unique symbol
export type ImUserId = string & { readonly [IM_USER_ID_BRAND]: true }

/** Identifies which platform a message/binding came from. */
export type ChannelKind = 'feishu' | 'wechat'

/** A (platform, user) pair; unique key for the binding store. */
export interface ImUserRef {
  readonly kind: ChannelKind
  readonly userId: ImUserId
}

/**
 * One normalized inbound message from any IM platform. Channels parse
 * platform-specific payloads into this shape before routing.
 */
export interface InboundMessage {
  readonly from: ImUserRef
  readonly text: string
  /** Platform message id, used for idempotent dedup on retry/redelivery. */
  readonly messageId: string
  /** Chat id (Feishu chat_id, ...) when the message is not a 1:1 DM. */
  readonly chatId?: string
  /** True when the message mentioned/at-ed the bot in a group chat. */
  readonly mentioned?: boolean
}

/** Outbound reply payload; channels render to platform formats. */
export interface OutboundMessage {
  readonly text: string
  /** Markdown flag lets platforms with markdown support render richly. */
  readonly markdown?: boolean
  /** Reply-to message id when the platform supports threading. */
  readonly replyTo?: string
}

/**
 * A channel's own conversation target: everything needed to send a reply
 * back to the origin of a message. Captured per inbound message and stored
 * alongside the binding for proactive sends.
 */
export interface ReplyTarget {
  readonly kind: ChannelKind
  /** Platform-specific send target (chat_id / user id / session id). */
  readonly targetId: string
}

/**
 * One IM platform adapter. A capability-seam style interface: each platform
 * implements connect/onMessage/send/login; routing and binding are shared
 * core and never live in a channel.
 */
export interface ImChannel {
  readonly kind: ChannelKind
  /** Human label for logs and terminal output. */
  readonly label: string
  /** Whether credentials exist and the channel can start. */
  isConfigured(): boolean
  /** Establish the platform connection (WebSocket / long-poll). Resolves when listening. */
  connect(): Promise<void>
  /** Register the inbound-message handler. Must be called before connect(). */
  onMessage(handler: (message: InboundMessage) => void): void
  /** Send a reply to a captured target. */
  send(target: ReplyTarget, message: OutboundMessage): Promise<void>
  /** Release the connection; no further handler invocations after resolve. */
  stop(): Promise<void>
}
