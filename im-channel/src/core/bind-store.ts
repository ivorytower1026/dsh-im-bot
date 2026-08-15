import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { ImUserRef } from './channel.ts'

/** Mapping row: one IM user bound to one harness session id. */
export interface Binding {
  readonly kind: ImUserRef['kind']
  readonly userId: string
  /** Harness session id the IM user chats through. */
  sessionId: string
  boundAt: string
  /** Reply verbosity preference (/回复): '简洁' | '标准' | '详细'. */
  verbosity?: '简洁' | '标准' | '详细'
  /** Workspace path chosen via /项目; new sessions start here. */
  workspace?: string
}

/** Store shape persisted at ~/.dsh/im-channel/bindings.json. */
interface BindStoreFile {
  bindings: Binding[]
}

function storePath(): string {
  return join(homedir(), '.dsh', 'im-channel', 'bindings.json')
}

function readStore(): BindStoreFile {
  const path = storePath()
  if (!existsSync(path)) return { bindings: [] }
  return JSON.parse(readFileSync(path, 'utf8')) as BindStoreFile
}

function writeStore(store: BindStoreFile): void {
  const path = storePath()
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

export class BindStore {
  /** Bind an IM user to a harness session. Rebinding replaces the old row. */
  bind(ref: ImUserRef, sessionId: string): void {
    const store = readStore()
    const existing = store.bindings.find(row => row.kind === ref.kind && row.userId === ref.userId)
    if (existing !== undefined) {
      existing.sessionId = sessionId
      existing.boundAt = new Date().toISOString()
    } else {
      store.bindings.push({
        kind: ref.kind,
        userId: ref.userId,
        sessionId,
        boundAt: new Date().toISOString(),
      })
    }
    writeStore(store)
  }

  /** Look up the bound session id for an IM user. */
  sessionIdFor(ref: ImUserRef): string | undefined {
    return readStore().bindings.find(row => row.kind === ref.kind && row.userId === ref.userId)?.sessionId
  }

  /** Remove a binding. Returns true when a row was removed. */
  unbind(ref: ImUserRef): boolean {
    const store = readStore()
    const index = store.bindings.findIndex(row => row.kind === ref.kind && row.userId === ref.userId)
    if (index < 0) return false
    store.bindings.splice(index, 1)
    writeStore(store)
    return true
  }

  /** Cycle the per-user reply verbosity 简洁 → 标准 → 详细 → 简洁. */
  cycleVerbosity(ref: ImUserRef): string {
    const order: Array<Binding['verbosity']> = ['简洁', '标准', '详细']
    const store = readStore()
    const row = store.bindings.find(r => r.kind === ref.kind && r.userId === ref.userId)
    const current = order.indexOf(row?.verbosity ?? '标准')
    const next = order[(current + 1) % order.length] ?? '标准'
    if (row !== undefined) {
      row.verbosity = next
      writeStore(store)
    }
    return next
  }

  /** Read the user's current reply verbosity (default 标准). */
  verbosityFor(ref: ImUserRef): string {
    return readStore().bindings.find(r => r.kind === ref.kind && r.userId === ref.userId)?.verbosity ?? '标准'
  }

  /** Set the user's reply verbosity directly (/回复 详细). */
  setVerbosity(ref: ImUserRef, level: '简洁' | '标准' | '详细'): void {
    const store = readStore()
    const row = store.bindings.find(r => r.kind === ref.kind && r.userId === ref.userId)
    if (row === undefined) return
    row.verbosity = level
    writeStore(store)
  }

  /** Remember the user's workspace choice for future sessions. */
  selectWorkspace(ref: ImUserRef, path: string): void {
    const store = readStore()
    const row = store.bindings.find(r => r.kind === ref.kind && r.userId === ref.userId)
    if (row === undefined) return
    row.workspace = path
    writeStore(store)
  }

  /** The user's chosen workspace path, if any. */
  workspaceFor(ref: ImUserRef): string | undefined {
    return readStore().bindings.find(r => r.kind === ref.kind && r.userId === ref.userId)?.workspace
  }
}

/** List all persisted binding rows (for status surfaces). */
export function listBindings(): Array<{ kind: string; boundAt: string; sessionId: string }> {
  return readStore().bindings.map(row => ({ kind: row.kind, boundAt: row.boundAt, sessionId: row.sessionId }))
}

/** Remove a binding by loose match (kind+userId, or sessionId alone). Returns true when a row was removed. */
export function removeBinding(match: { kind?: string; userId?: string; sessionId?: string }): boolean {
  const store = readStore()
  const index = store.bindings.findIndex(row =>
    (match.kind !== undefined && match.userId !== undefined && row.kind === match.kind && row.userId === match.userId)
    || (match.sessionId !== undefined && row.sessionId === match.sessionId))
  if (index < 0) return false
  store.bindings.splice(index, 1)
  writeStore(store)
  return true
}
