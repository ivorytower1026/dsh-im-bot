import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentRegistry } from '@deepseek-ai/dsh-agent'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { SessionId } from '@deepseek-ai/dsh-brand'
import type { AgentDriver } from '../core/router.ts'

interface InflightTurn {
  resolve: (reply: string) => void
  reject: (error: Error) => void
  messageId: string
  turn: number | undefined
  /** Text blocks collected from assistant/message events for this turn. */
  chunks: string[]
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
  private readonly owned = new Map<string, { agent: Agent; inflight?: InflightTurn }>()

  constructor(private readonly ctx: Context, private readonly options: { cwd?: string; agentOptions?: unknown } = {}) {
    this.agents = ctx.agents
    ctx.on('session/event', (session, event: SessionEvent) => {
      const record = this.owned.get(session.header.id)
      if (record === undefined || record.agent.session !== session) return
      const inflight = record.inflight
      if (inflight === undefined) return
      if (event.type === 'assistant/message') {
        for (const block of event.data.message.content) {
          if (block.type === 'text' && block.text.length > 0) inflight.chunks.push(block.text)
        }
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

  async startSession(): Promise<string> {
    const handle = await this.agents.create({
      sessionId: SessionId(crypto.randomUUID()),
      meta: { cwd: this.options.cwd ?? process.cwd() },
      agentOptions: this.options.agentOptions,
    })
    const dispose = handle.dispose
    this.owned.set(handle.agent.id, { agent: handle.agent })
    this.ctx.effect(() => {
      void dispose()
      this.owned.delete(handle.agent.id)
    }, 'im-channel.agent')
    return handle.agent.id
  }

  prompt(sessionId: string, text: string): Promise<string> {
    const record = this.owned.get(sessionId)
    if (record === undefined) return Promise.reject(new Error(`session ${sessionId} is not owned by this driver`))
    if (record.inflight !== undefined) {
      return Promise.reject(new Error('a prompt is already in flight for this session'))
    }
    const message = createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
    return new Promise<string>((resolve, reject) => {
      const inflight: InflightTurn = { resolve, reject, messageId: message.id, turn: undefined, chunks: [] }
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
        inflight.resolve(inflight.chunks.join(''))
      })
    })
  }
}
