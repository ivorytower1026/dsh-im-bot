import type { ImUserRef } from './channel.ts';
/** Mapping row: one IM user bound to one harness session id. */
export interface Binding {
    readonly kind: ImUserRef['kind'];
    readonly userId: string;
    /** Harness session id the IM user chats through. */
    sessionId: string;
    boundAt: string;
    /** Reply verbosity preference (/回复): '简洁' | '标准' | '详细'. */
    verbosity?: '简洁' | '标准' | '详细';
    /** Workspace path chosen via /项目; new sessions start here. */
    workspace?: string;
}
export declare class BindStore {
    /** Bind an IM user to a harness session. Rebinding replaces the old row. */
    bind(ref: ImUserRef, sessionId: string): void;
    /** Look up the bound session id for an IM user. */
    sessionIdFor(ref: ImUserRef): string | undefined;
    /** Remove a binding. Returns true when a row was removed. */
    unbind(ref: ImUserRef): boolean;
    /** Cycle the per-user reply verbosity 简洁 → 标准 → 详细 → 简洁. */
    cycleVerbosity(ref: ImUserRef): string;
    /** Read the user's current reply verbosity (default 标准). */
    verbosityFor(ref: ImUserRef): string;
    /** Set the user's reply verbosity directly (/回复 详细). */
    setVerbosity(ref: ImUserRef, level: '简洁' | '标准' | '详细'): void;
    /** Remember the user's workspace choice for future sessions. */
    selectWorkspace(ref: ImUserRef, path: string): void;
    /** The user's chosen workspace path, if any. */
    workspaceFor(ref: ImUserRef): string | undefined;
}
/** List all persisted binding rows (for status surfaces). */
export declare function listBindings(): Array<{
    kind: string;
    boundAt: string;
    sessionId: string;
}>;
/** Remove a binding by loose match (kind+userId, or sessionId alone). Returns true when a row was removed. */
export declare function removeBinding(match: {
    kind?: string;
    userId?: string;
    sessionId?: string;
}): boolean;
