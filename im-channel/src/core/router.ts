import type { ImChannel, InboundMessage } from './channel.ts'

/**
 * Harness-side conversation driver implemented by the plugin glue that
 * talks to the agent services. Channels never see this; the router owns it.
 */
export interface AgentDriver {
  /** Create a new session (or resume) and return its id. */
  startSession(options?: SessionOptions): Promise<string>
  /** Send a user message into a session and await the assistant's final reply. */
  prompt(sessionId: string, text: string, options?: { verbosity?: string }): Promise<string>
  /** Optional progress sink for long-running turns (tool calls, partial output). */
  onProgress?(sessionId: string, update: string): void
}

/** Per-session knobs a /新建 or /bind session can carry. */
export interface SessionOptions {
  provider?: string
  model?: string
  cwd?: string
}

/** Status facts the /状态 command renders. */
export interface RouterStatus {
  cwd: string
  provider: string
  model: string
  reasoningEffort?: string
}

/** One selectable workspace for /项目. */
export interface WorkspaceChoice {
  path: string
  title: string
}

/** One selectable model for /模型. */
export interface ModelChoice {
  provider: string
  model: string
  label: string
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
  /** Live status facts for /状态; absent falls back to a minimal reply. */
  readonly status?: () => RouterStatus
  /** List selectable workspaces for /项目; absent lists nothing. */
  readonly workspaces?: () => WorkspaceChoice[]
  /** List selectable models for /模型; absent lists nothing. */
  readonly models?: () => ModelChoice[] | Promise<ModelChoice[]>
  /** Cancel the in-flight turn for a session (/停止); optional. */
  readonly cancel?: (sessionId: string) => boolean
  /** Change the harness-wide default model (/模型, /思考); absent = read-only. */
  readonly setDefaultModel?: (patch: { provider?: string; model?: string; reasoningEffort?: string }) => Promise<void>
  /** Effort levels the current model supports (/思考); absent or empty = only raw ids. */
  readonly efforts?: () => Array<{ id: string; name: string }> | Promise<Array<{ id: string; name: string }>>
}

/** BindStore surface the router needs (subset of BindStore for testing). */
export interface BindStoreLike {
  bind(ref: InboundMessage['from'], sessionId: string): void
  sessionIdFor(ref: InboundMessage['from']): string | undefined
  unbind(ref: InboundMessage['from']): boolean
  /** Cycle the per-user reply verbosity (/回复); optional. */
  cycleVerbosity?(ref: InboundMessage['from']): string | undefined
  /** Read the per-user reply verbosity; optional (defaults to 标准). */
  verbosityFor?(ref: InboundMessage['from']): string | undefined
  /** Set the per-user reply verbosity directly; optional. */
  setVerbosity?(ref: InboundMessage['from'], level: '简洁' | '标准' | '详细'): void
  /** Remember the user's chosen workspace path (/项目 N); optional. */
  selectWorkspace?(ref: InboundMessage['from'], path: string): void
  /** The user's chosen workspace path, if any; optional. */
  workspaceFor?(ref: InboundMessage['from']): string | undefined
}

export class Router {
  private readonly commandPrefix: string

  /** Start a session honoring the user's stored workspace, if any. */
  private startUserSession(from: InboundMessage['from']): Promise<string> {
    const options: SessionOptions = {}
    const cwd = this.deps.store.workspaceFor?.(from)
    if (cwd !== undefined) options.cwd = cwd
    return this.deps.driver.startSession(options)
  }

  /** The wired channels (readonly view for topology reconciliation). */
  readonly channels: readonly ImChannel[]

  constructor(private readonly deps: RouterDeps) {
    this.commandPrefix = deps.config?.commandPrefix ?? '/'
    this.channels = deps.channels
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
        text: '🔗 还未绑定会话。先发送 /bind 绑定当前聊天，然后发送 /项目 选择工作区，即可开始对话。\n\n机器人命令：\n/bind — 绑定当前聊天\n/项目 — 选择项目工作区\n/帮助 — 查看全部命令',
      })
      return
    }
    if (this.deps.store.workspaceFor?.(message.from) === undefined) {
      await channel.send(target, {
        text: '📁 已绑定但还没选择项目。发送 /项目 查看并选择工作区后，再发消息开始对话。',
      })
      return
    }
    // Fire-and-forget ack; the prompt resolves with the final reply.
    try {
      const promptOptions: { verbosity?: string } = {}
      const verbosity = this.deps.store.verbosityFor?.(message.from)
      if (verbosity !== undefined) promptOptions.verbosity = verbosity
      const reply = await this.deps.driver.prompt(sessionId, message.text, promptOptions)
      await channel.send(target, { text: reply, markdown: true })
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      await channel.send(target, { text: `⚠️ ${text}` })
    }
  }

  /** Handle slash commands (Chinese primary, English aliases). */
  private async runCommand(channel: ImChannel, target: { kind: ImChannel['kind']; targetId: string }, message: InboundMessage): Promise<void> {
    const [rawCommand, ...args] = message.text.slice(this.commandPrefix.length).trim().split(/\s+/)
    const command = COMMAND_ALIASES[rawCommand] ?? rawCommand
    switch (command) {
      case 'bind': {
        // Bind this chat to a harness session directly (no passphrase).
        const sessionId = await this.startUserSession(message.from)
        this.deps.store.bind(message.from, sessionId)
        const workspace = this.deps.store.workspaceFor?.(message.from)
        const lead = workspace === undefined
          ? '✅ 绑定成功。请先发送 /项目 选择工作区，再发消息与智能体对话。'
          : `✅ 绑定成功。当前项目：${workspace}。直接发消息即可与智能体对话。`
        await channel.send(target, { text: `${lead}\n\n${COMMAND_LIST}` })
        return
      }
      case 'unbind': {
        const removed = this.deps.store.unbind(message.from)
        await channel.send(target, { text: removed ? '已解绑。' : '当前没有绑定。' })
        return
      }
      case 'help': {
        await channel.send(target, { text: COMMAND_LIST })
        return
      }
      case 'status': {
        const sessionId = this.deps.store.sessionIdFor(message.from)
        if (sessionId === undefined) {
          await channel.send(target, { text: '未绑定会话。发送 /bind 绑定。' })
          return
        }
        const facts = this.deps.status?.()
        const lines = ['📊 当前状态', '──────────────────']
        if (facts !== undefined) {
          lines.push(`工作区：${facts.cwd}`)
          lines.push(`模型：${facts.model}（${facts.provider}）`)
          if (facts.reasoningEffort !== undefined) lines.push(`思考：${facts.reasoningEffort}`)
        }
        lines.push(`会话：${sessionId.slice(0, 8)}…`)
        await channel.send(target, { text: lines.join('\n') })
        return
      }
      case 'new': {
        if (this.deps.store.sessionIdFor(message.from) === undefined) {
          await channel.send(target, { text: '还没有绑定。先发送 /bind。' })
          return
        }
        const sessionId = await this.startUserSession(message.from)
        this.deps.store.bind(message.from, sessionId)
        await channel.send(target, { text: `🆕 已开始新会话 ${sessionId.slice(0, 8)}…。上下文已清空，直接发消息开始新任务。` })
        return
      }
      case 'model': {
        const facts = this.deps.status
        if (facts === undefined || this.deps.setDefaultModel === undefined) {
          await channel.send(target, { text: '当前模型切换不可用。' })
          return
        }
        const current = facts()
        if (args.length === 0) {
          const list = await this.deps.models?.() ?? []
          if (list.length === 0) {
            await channel.send(target, { text: `🤖 当前模型：${current.model}（${current.provider}）\n──────────────────\n发送 /模型 <模型id> 或 /模型 <provider>/<模型id> 切换。` })
            return
          }
          const lines = [`🤖 当前模型：${current.model}（${current.provider}）`, '──────────────────', '可选模型：']
          list.forEach((m, i) => { lines.push(`${i + 1}. ${m.label}${m.model === current.model ? ' ⬅ 当前' : ''}`) })
          lines.push('──────────────────')
          lines.push('发送 /模型 N 选择。')
          await channel.send(target, { text: lines.join('\n') })
          return
        }
        const list = await this.deps.models?.() ?? []
        const choice = Number.parseInt(args[0] ?? '', 10)
        const picked = Number.isInteger(choice) && choice >= 1 && choice <= list.length
          ? list[choice - 1]
          : args[0].includes('/')
            ? (() => { const [provider, model] = args[0].split('/'); return { provider, model, label: model } })()
            : { provider: current.provider, model: args[0], label: args[0] }
        await this.deps.setDefaultModel({ provider: picked.provider, model: picked.model })
        await channel.send(target, { text: `✅ 模型已切换：${picked.model}（${picked.provider}）。发送 /新建 后生效。` })
        return
      }
      case 'stop': {
        const sessionId = this.deps.store.sessionIdFor(message.from)
        if (sessionId === undefined) {
          await channel.send(target, { text: '当前没有绑定会话。' })
          return
        }
        const stopped = this.deps.cancel?.(sessionId) ?? false
        await channel.send(target, { text: stopped ? '⏹ 已停止当前任务。' : '当前没有正在执行的任务。' })
        return
      }
      case 'think': {
        const facts = this.deps.status
        if (facts === undefined || this.deps.setDefaultModel === undefined) {
          await channel.send(target, { text: '思考级别切换不可用。' })
          return
        }
        const current = facts()
        const levels = await this.deps.efforts?.() ?? []
        if (levels.length === 0) {
          await channel.send(target, { text: '当前模型不支持思考级别切换。' })
          return
        }
        const currentName = levels.find(l => l.id === current.reasoningEffort)?.name ?? current.reasoningEffort ?? '默认'
        const header = `🧠 思考级别：${currentName}`
        const list = levels.map((l, i) => {
          const mark = l.id === current.reasoningEffort ? ' ⬅ 当前' : ''
          return `${i + 1}. ${l.name}${mark}`
        })
        if (args.length === 0) {
          await channel.send(target, { text: [header, '──────────────────', ...list, '──────────────────', '发送 /思考 N 选择。'].join('\n') })
          return
        }
        const choice = Number.parseInt(args[0] ?? '', 10)
        const picked = Number.isInteger(choice) && choice >= 1 && choice <= levels.length
          ? levels[choice - 1]
          : levels.find(l => l.id === args[0] || l.name.toLowerCase() === args[0].toLowerCase())
        if (picked === undefined) {
          await channel.send(target, { text: [header, '──────────────────', ...list, '──────────────────', `无效选择 ${args[0]}。发送 /思考 N 选择。`].join('\n') })
          return
        }
        await this.deps.setDefaultModel({ reasoningEffort: picked.id })
        await channel.send(target, { text: `✅ 思考级别已切换：${picked.name}` })
        return
      }
      case 'project': {
        const facts = this.deps.status?.()
        const list = this.deps.workspaces?.() ?? []
        if (args.length === 0) {
          if (list.length === 0) {
            await channel.send(target, { text: `📁 当前工作区：${facts?.cwd ?? process.cwd()}\n──────────────────\n暂无其他可选项目。` })
            return
          }
          const lines = [`📁 当前工作区：${facts?.cwd ?? process.cwd()}`, '──────────────────', '可选项目：']
          list.forEach((w, i) => { lines.push(`${i + 1}. ${w.title || w.path}`) })
          lines.push('──────────────────')
          lines.push('发送 /项目 N 切换（将开启新线程）。')
          await channel.send(target, { text: lines.join('\n') })
          return
        }
        const choice = Number.parseInt(args[0] ?? '', 10)
        const picked = Number.isInteger(choice) && choice >= 1 && choice <= list.length
          ? list[choice - 1]
          : list.find(w => w.path === args[0] || w.title === args.slice(0).join(' '))
        if (picked === undefined) {
          await channel.send(target, { text: `无效选择。发送 /项目 查看列表。` })
          return
        }
        this.deps.store.selectWorkspace?.(message.from, picked.path)
        const sessionId = await this.deps.driver.startSession({ cwd: picked.path })
        this.deps.store.bind(message.from, sessionId)
        await channel.send(target, { text: `✅ 已切换项目：${picked.title || picked.path}\n🆕 新线程已开启，直接发消息开始。` })
        return
      }
      case 'mode': {
        await channel.send(target, { text: '模式切换即将上线。' })
        return
      }
      case 'reply': {
        const levels = ['简洁', '标准', '详细'] as const
        const descriptions: Record<string, string> = {
          简洁: '只发最后一条 AI 消息',
          标准: '发送全部 AI 文字消息',
          详细: '工具调用过程 + 全部 AI 消息',
        }
        const current = this.deps.store.verbosityFor?.(message.from) ?? '标准'
        const list = levels.map((name, i) => {
          const mark = name === current ? ' ⬅ 当前' : ''
          return `${i + 1}. ${name} — ${descriptions[name]}${mark}`
        })
        const requested = args[0]
        const asNumber = Number.parseInt(requested ?? '', 10)
        let picked: (typeof levels)[number] | undefined
        if (requested !== undefined && (levels as readonly string[]).includes(requested)) {
          picked = requested as (typeof levels)[number]
        } else if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= levels.length) {
          picked = levels[asNumber - 1]
        }
        if (picked !== undefined) {
          this.deps.store.setVerbosity?.(message.from, picked)
        } else if (requested !== undefined) {
          await channel.send(target, { text: [`💬 回复详细程度`, '──────────────────', ...list, '──────────────────', `无效选择 ${requested}。发送 /回复 N 或 /回复 <级别名> 设置。`].join('\n') })
          return
        } else {
          picked = levels[(levels.indexOf(current as (typeof levels)[number]) + 1) % levels.length] ?? '标准'
          this.deps.store.setVerbosity?.(message.from, picked)
        }
        await channel.send(target, {
          text: `✅ 回复详细程度：${picked}\n（${descriptions[picked]}）\n──────────────────\n${list.join('\n')}\n──────────────────\n发送 /回复 N 直接指定，不带参数则轮换切换。`,
        })
        return
      }
      default:
        await channel.send(target, { text: `⚠️ 未知命令 /${rawCommand}。\n\n${COMMAND_LIST}` })
    }
  }
}

/** Chinese command names mapped to their canonical handlers. */
const COMMAND_ALIASES: Record<string, string> = {
  帮助: 'help',
  状态: 'status',
  新建: 'new',
  clear: 'new',
  项目: 'project',
  模型: 'model',
  模式: 'mode',
  思考: 'think',
  回复: 'reply',
  停止: 'stop',
  cancel: 'stop',
}

const COMMAND_LIST = `机器人命令：
/项目 — 选择项目工作区（推荐先选再对话）
/帮助 — 查看这份说明
/状态 — 查看工作区、模型和状态
/新建 或 /clear — 开始新任务
/模型 — 查看 / 切换模型
/思考 — 切换思考级别
/停止 — 停止正在执行的任务
/回复 — 切换回复详细程度
/bind — 绑定当前聊天
/unbind — 解绑当前聊天`
