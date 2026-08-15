import type { Context } from '@deepseek-ai/cordis';
import type { AgentOptions } from '@deepseek-ai/dsh-agent';
import type { AgentDriver } from '../core/router.ts';
/**
 * AgentDriver over the in-process harness services: one agent per bound IM
 * user, prompt via followup + whenIdle, replies assembled from
 * assistant/message events on the owned session. Modeled on the ACP bridge's
 * inflight-slot pattern (packages/acp/acp/src/index.ts).
 */
export declare class HarnessDriver implements AgentDriver {
    private readonly ctx;
    private readonly options;
    private readonly agents;
    /** Agents created by this driver, keyed by session id. */
    private readonly owned;
    private static nextInstanceId;
    private readonly instanceId;
    constructor(ctx: Context, options?: {
        cwd?: string;
        agentOptions?: AgentOptions;
    });
    startSession(options?: {
        cwd?: string;
    }): Promise<string>;
    /** Cancel the in-flight turn of a session; false when idle or unknown. */
    cancel(sessionId: string): boolean;
    prompt(sessionId: string, text: string, options?: {
        verbosity?: string;
    }): Promise<string>;
}
