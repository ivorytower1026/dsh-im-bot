import type { ImChannel, InboundMessage } from './channel.ts';
/**
 * Harness-side conversation driver implemented by the plugin glue that
 * talks to the agent services. Channels never see this; the router owns it.
 */
export interface AgentDriver {
    /** Create a new session (or resume) and return its id. */
    startSession(options?: SessionOptions): Promise<string>;
    /** Send a user message into a session and await the assistant's final reply. */
    prompt(sessionId: string, text: string, options?: {
        verbosity?: string;
    }): Promise<string>;
    /** Optional progress sink for long-running turns (tool calls, partial output). */
    onProgress?(sessionId: string, update: string): void;
}
/** Per-session knobs a /新建 or /bind session can carry. */
export interface SessionOptions {
    provider?: string;
    model?: string;
    cwd?: string;
}
/** Status facts the /状态 command renders. */
export interface RouterStatus {
    cwd: string;
    provider: string;
    model: string;
    reasoningEffort?: string;
}
/** One selectable workspace for /项目. */
export interface WorkspaceChoice {
    path: string;
    title: string;
}
/** One selectable model for /模型. */
export interface ModelChoice {
    provider: string;
    model: string;
    label: string;
}
/** Router configuration knobs. */
export interface RouterConfig {
    /** Slash command prefix; inbound text starting with it routes to commands. */
    commandPrefix: string;
}
export interface RouterDeps {
    readonly channels: readonly ImChannel[];
    readonly driver: AgentDriver;
    readonly store: BindStoreLike;
    readonly config?: Partial<RouterConfig>;
    /** Live status facts for /状态; absent falls back to a minimal reply. */
    readonly status?: () => RouterStatus;
    /** List selectable workspaces for /项目; absent lists nothing. */
    readonly workspaces?: () => WorkspaceChoice[];
    /** List selectable models for /模型; absent lists nothing. */
    readonly models?: () => ModelChoice[] | Promise<ModelChoice[]>;
    /** Cancel the in-flight turn for a session (/停止); optional. */
    readonly cancel?: (sessionId: string) => boolean;
    /** Change the harness-wide default model (/模型, /思考); absent = read-only. */
    readonly setDefaultModel?: (patch: {
        provider?: string;
        model?: string;
        reasoningEffort?: string;
    }) => Promise<void>;
    /** Effort levels the current model supports (/思考); absent or empty = only raw ids. */
    readonly efforts?: () => Array<{
        id: string;
        name: string;
    }> | Promise<Array<{
        id: string;
        name: string;
    }>>;
}
/** BindStore surface the router needs (subset of BindStore for testing). */
export interface BindStoreLike {
    bind(ref: InboundMessage['from'], sessionId: string): void;
    sessionIdFor(ref: InboundMessage['from']): string | undefined;
    unbind(ref: InboundMessage['from']): boolean;
    /** Cycle the per-user reply verbosity (/回复); optional. */
    cycleVerbosity?(ref: InboundMessage['from']): string | undefined;
    /** Read the per-user reply verbosity; optional (defaults to 标准). */
    verbosityFor?(ref: InboundMessage['from']): string | undefined;
    /** Set the per-user reply verbosity directly; optional. */
    setVerbosity?(ref: InboundMessage['from'], level: '简洁' | '标准' | '详细'): void;
    /** Remember the user's chosen workspace path (/项目 N); optional. */
    selectWorkspace?(ref: InboundMessage['from'], path: string): void;
    /** The user's chosen workspace path, if any; optional. */
    workspaceFor?(ref: InboundMessage['from']): string | undefined;
}
export declare class Router {
    private readonly deps;
    private readonly commandPrefix;
    /** Start a session honoring the user's stored workspace, if any. */
    private startUserSession;
    /** The wired channels (readonly view for topology reconciliation). */
    readonly channels: readonly ImChannel[];
    constructor(deps: RouterDeps);
    /** Wire all channels' inbound handlers to routeMessage and connect them. */
    start(): Promise<void>;
    stop(): Promise<void>;
    /** Route one inbound message: commands first, then bound-session chat. */
    private routeMessage;
    /** Handle slash commands (Chinese primary, English aliases). */
    private runCommand;
}
