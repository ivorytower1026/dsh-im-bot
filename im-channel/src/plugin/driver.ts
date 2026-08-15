import type { Context } from '@deepseek-ai/cordis'
import { isAbsolute, resolve } from 'node:path'
import type { Agent, AgentOptions, AgentRegistry } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import type { AgentDriver } from '../core/router.ts'

interface InflightTurn {
  resolve: (reply: string) => void
  reject: (error: Error) => void
  messageId: string
  turn: number | undefined
  /** Each assistant/message's text, one entry per message (verbosity 裁剪用). */
  messages: string[]
  /** Tool-call summaries in order (详细 verbosity). */
  toolLines: string[]
}

/**
 * AgentDriver over the in-process harness services: one agent per bound IM
 * user, prompt via followup + whenIdle, replies assembled from
 * assistant/message events on the owned session. Modeled on the ACP bridge's
 * inflight-slot pattern (packages/acp/acp/src/index.ts).
 */
export class HarnessDriver implements AgentDriver {
  private readonly agents: AgentRegistry
  /** Agents created by this driver, keyed by session id. */
  private readonly owned = new Map<string, { agent: Agent; inflight: InflightTurn | undefined }>()

  private static nextInstanceId = 0
  private readonly instanceId = ++HarnessDriver.nextInstanceId

  constructor(private readonly ctx: Context, private readonly options: { cwd?: string; agentOptions?: AgentOptions } = {}) {
    this.agents = ctx.agents
    // One plugin-lifetime teardown for all owned agents. Registering per
    // session via ctx.effect inside async callbacks attached the disposers to
    // whatever fiber was running the callback (e.g. a router rebuild's
    // fiber), so a router restart silently wiped every bound session.
    ctx.effect(() => {
      const disposers = this.owned
      return () => {
        for (const [, record] of disposers) void record.agent.ctx.fiber.dispose()
        disposers.clear()
      }
    }, 'im-channel.agents')
    ctx.on('session/event', (session, event: SessionEvent) => {
      const record = this.owned.get(session.header.id)
      if (record === undefined || record.agent.session !== session) return
      const inflight = record.inflight
      if (inflight === undefined) return
      if (event.type === 'assistant/message') {
        const text = event.data.message.content
          .filter(block => block.type === 'text')
          .map(block => block.type === 'text' ? block.text : '')
          .join('')
        if (text.length > 0) inflight.messages.push(text)
      } else if (event.type === 'tool/call') {
        inflight.toolLines.push(`🔧 ${event.data.name}`)
      } else if (event.type === 'tool/result') {
        const content = event.data.message.content
        const brief = (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object' && content[0] !== null && 'text' in content[0]
          ? String((content[0] as { text?: string }).text ?? '')
          : '').split('\n')[0]?.slice(0, 80) ?? ''
        const failed = event.data.error !== undefined
        inflight.toolLines.push(`   ${failed ? '✗' : '✓'} ${brief}`)
      } else if (event.type === 'turn/end' && inflight.turn === event.data.turn) {
        if (event.data.reason.kind === 'error') {
          record.inflight = undefined
          inflight.reject(new Error(`turn failed: ${JSON.stringify(event.data.reason)}`))
        }
      }
    })
    ctx.on('agent/inbox/claimed', ({ agent, message, turn }) => {
      const record = this.owned.get(agent.id)
      const inflight = record?.inflight
      if (inflight !== undefined && inflight.messageId === message.id) inflight.turn = turn
    })
  }

  async startSession(options: { cwd?: string } = {}): Promise<string> {
    const rawCwd = options.cwd ?? this.options.cwd ?? process.cwd()
    // Normalize separators/case (e.g. 'D:/x' vs 'D:\x') so the workspace
    // registry's canonical-cwd index groups the session under its project
    // instead of "ungrouped".
    const cwd = isAbsolute(rawCwd) ? resolve(rawCwd) : rawCwd
    const createOptions: { sessionId: ReturnType<typeof SessionId>; meta: { cwd: string }; agentOptions?: AgentOptions } = {
      sessionId: SessionId(crypto.randomUUID()),
      meta: { cwd },
    }
    // The API gateway applies agentDefaultModel for web sessions; agents
    // created directly need the route spelled out or persona rendering fails
    // on {{model}}.
    const defaults = this.ctx.get('agentDefaultModel')
    if (defaults !== undefined) {
      const selection = defaults.currentSelection() as { provider: string; model: string; reasoningEffort?: string }
      if (selection.provider !== '' && selection.model !== '') {
        createOptions.agentOptions = { provider: selection.provider, model: selection.model }
      }
    } else if (this.options.agentOptions !== undefined) {
      createOptions.agentOptions = this.options.agentOptions
    }
    // The API gateway composes agents through agentPresets.mount() — that is
    // what attaches tools (bash/fs/editor/…), the full system prompt, and
    // permission policies. Agents created without the setup run bare: the
    // model gets zero tools and a stub persona, and any tool-shaped reply
    // fails. Mirror the gateway composition here.
    const presets = this.ctx.get('agentPresets')
    const resolvedPreset = presets === undefined ? undefined : await presets.resolve(undefined)
    const handle = await this.agents.create({
      sessionId: createOptions.sessionId,
      meta: {
        cwd,
        ...resolvedPreset === undefined ? {} : { agentPreset: resolvedPreset.id },
      },
      ...createOptions.agentOptions === undefined ? {} : { agentOptions: createOptions.agentOptions },
      setup: async agentCtx => {
        if (presets !== undefined) await presets.mount(agentCtx, undefined)
      },
    })
    this.owned.set(handle.agent.id, { agent: handle.agent, inflight: undefined })
    process.stdout.write(`[im-channel] startSession ${handle.agent.id.slice(0, 8)} cwd=${createOptions.meta.cwd} model=${createOptions.agentOptions?.model ?? '?'} owned=${this.owned.size} (driver ${this.instanceId})\n`)
    return handle.agent.id
  }

  /** Cancel the in-flight turn of a session; false when idle or unknown. */
  cancel(sessionId: string): boolean {
    const record = this.owned.get(sessionId)
    if (record === undefined || record.inflight === undefined) return false
    record.agent.cancel({ kind: 'user' })
    return true
  }

  prompt(sessionId: string, text: string, options: { verbosity?: string } = {}): Promise<string> {
    const verbosity = options.verbosity
    const record = this.owned.get(sessionId)
    process.stdout.write(`[im-channel] prompt ${sessionId.slice(0, 8)} owned=${this.owned.size} found=${record !== undefined} (driver ${this.instanceId})\n`)
    if (record === undefined) {
      // A binding persisted across a harness restart points at a session this
      // driver never created — tell the router instead of crashing the host.
      return Promise.reject(new Error(`会话 ${sessionId.slice(0, 8)} 已失效（服务重启过）。请发送 /bind 重新绑定。`))
    }
    if (record.inflight !== undefined) {
      return Promise.reject(new Error('a prompt is already in flight for this session'))
    }
    const message = createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
    return new Promise<string>((resolve, reject) => {
      const inflight: InflightTurn = { resolve, reject, messageId: message.id, turn: undefined, messages: [], toolLines: [] }
      record.inflight = inflight
      try {
        record.agent.followup(message)
      } catch (error: unknown) {
        record.inflight = undefined
        reject(error instanceof Error ? error : new Error(String(error)))
        return
      }
      void record.agent.whenIdle().then(() => {
        if (record.inflight !== inflight) return
        record.inflight = undefined
        inflight.resolve(renderTurn(inflight, verbosity))
      })
    })
  }
}

/**
 * Render one finished turn's collected output at the user's verbosity level:
 * 简洁 = only the LAST assistant text message; 标准 = every assistant text
 * message; 详细 = tool calls/results plus every assistant text message.
 */
function renderTurn(inflight: InflightTurn, verbosity: string | undefined): string {
  if (verbosity === '简洁') return inflight.messages.at(-1) ?? ''
  if (verbosity === '详细') {
    const parts: string[] = []
    if (inflight.toolLines.length > 0) parts.push(inflight.toolLines.join('\n'), '──────────')
    parts.push(...inflight.messages)
    return parts.join('\n')
  }
  return inflight.messages.join('\n\n')
}
