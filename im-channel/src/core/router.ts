import type { ImChannel, InboundMessage, OutboundMessage } from './channel.ts'

/**
 * Harness-side conversation driver implemented by the plugin glue that
 * talks to the agent services. Channels never see this; the router owns it.
 */
export interface AgentDriver {
  /** Create a new session (or resume) and return its id. */
  startSession(): Promise<string>
  /** Send a user message into a session and await the assistant's final reply. */
  prompt(sessionId: string, text: string): Promise<string>
  /** Optional progress sink for long-running turns (tool calls, partial output). */
  onProgress?(sessionId: string, update: string): void
}

/** Router configuration knobs. */
export interface RouterConfig {
  /** Slash command prefix; inbound text starting with it routes to commands. */
  commandPrefix: string
}

export interface RouterDeps {
  readonly channels: readonly ImChannel[]
  readonly driver: AgentDriver
  readonly store: BindStoreLike
  readonly config?: Partial<RouterConfig>
}

/** BindStore surface the router needs (subset of BindStore for testing). */
export interface BindStoreLike {
  claimPassphrase(value: string, now?: number): boolean
  bind(ref: InboundMessage['from'], sessionId: string): void
  sessionIdFor(ref: InboundMessage['from']): string | undefined
  unbind(ref: InboundMessage['from']): boolean
}

export class Router {
  private readonly commandPrefix: string

  constructor(private readonly deps: RouterDeps) {
    this.commandPrefix = deps.config?.commandPrefix ?? '/'
  }

  /** Wire all channels' inbound handlers to routeMessage and connect them. */
  async start(): Promise<void> {
    for (const channel of this.deps.channels) {
      if (!channel.isConfigured()) continue
      channel.onMessage(message => {
        void this.routeMessage(channel, message)
      })
      await channel.connect()
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.deps.channels.map(async channel => channel.stop()))
  }

  /** Route one inbound message: commands first, then bound-session chat. */
  private async routeMessage(channel: ImChannel, message: InboundMessage): Promise<void> {
    const target = { kind: channel.kind, targetId: message.chatId ?? message.from.userId }
    if (message.text.startsWith(this.commandPrefix)) {
      await this.runCommand(channel, target, message)
      return
    }
    const sessionId = this.deps.store.sessionIdFor(message.from)
    if (sessionId === undefined) {
      await channel.send(target, {
        text: '尚未绑定会话。请发送 /bind 加启动时显示的口令完成绑定，例如：/bind BIND-3F2A',
      })
      return
    }
    // Fire-and-forget ack; the prompt resolves with the final reply.
    const reply = await this.deps.driver.prompt(sessionId, message.text)
    await channel.send(target, { text: reply, markdown: true })
  }

  /** Handle /bind, /unbind, /status slash commands. */
  private async runCommand(channel: ImChannel, target: { kind: ImChannel['kind']; targetId: string }, message: InboundMessage): Promise<void> {
    const [command, ...args] = message.text.slice(this.commandPrefix.length).trim().split(/\s+/)
    switch (command) {
      case 'bind': {
        const passphrase = args[0] ?? ''
        if (this.deps.store.claimPassphrase(passphrase)) {
          const sessionId = await this.deps.driver.startSession()
          this.deps.store.bind(message.from, sessionId)
          await channel.send(target, { text: '绑定成功，开始对话吧。' })
        } else {
          await channel.send(target, { text: '口令无效或已过期。口令在启动 harness 的终端显示，10 分钟内有效。' })
        }
        return
      }
      case 'unbind': {
        const removed = this.deps.store.unbind(message.from)
        await channel.send(target, { text: removed ? '已解绑。' : '当前没有绑定。' })
        return
      }
      case 'status': {
        const sessionId = this.deps.store.sessionIdFor(message.from)
        await channel.send(target, {
          text: sessionId === undefined ? '未绑定会话。' : `已绑定会话 ${sessionId}。`,
        })
        return
      }
      default:
        await channel.send(target, { text: `未知命令 ${command}。可用：/bind <口令>、/unbind、/status。` })
    }
  }
}
