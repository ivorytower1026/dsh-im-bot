import { createHash, randomBytes } from 'node:crypto'
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
}

/** Store shape persisted at ~/.dsh/im-channel/bindings.json. */
interface BindStoreFile {
  bindings: Binding[]
}

/** One-time passphrase valid for a single claim. */
interface Passphrase {
  value: string
  createdAt: number
  expiresMs: number
}

const PASSPHRASE_TTL_MS = 10 * 60 * 1000
const PASSPHRASE_PREFIX = 'BIND'

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
  private pending: Passphrase | undefined

  /** Generate a fresh one-time passphrase (invalidates any previous). */
  issuePassphrase(now = Date.now()): string {
    const body = randomBytes(3).toString('hex').toUpperCase()
    this.pending = {
      value: `${PASSPHRASE_PREFIX}-${body}`,
      createdAt: now,
      expiresMs: PASSPHRASE_TTL_MS,
    }
    return this.pending.value
  }

  /** Try to consume a passphrase: true when valid, consumed, and unused after. */
  claimPassphrase(value: string, now = Date.now()): boolean {
    const pending = this.pending
    if (pending === undefined) return false
    if (now - pending.createdAt > pending.expiresMs) {
      this.pending = undefined
      return false
    }
    // Constant-time compare before consuming.
    const a = createHash('sha256').update(value).digest()
    const b = createHash('sha256').update(pending.value).digest()
    const matches = a.equals(b)
    if (matches) this.pending = undefined
    return matches
  }

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
}
