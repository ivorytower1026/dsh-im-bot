#!/usr/bin/env node
/**
 * dsh-im-bot one-command installer.
 *
 *   curl -fsSL https://raw.githubusercontent.com/ivorytower1026/dsh-im-bot/main/install.mjs | node
 *
 * Idempotent: safe to re-run (e.g. to update). Edits the dsh web profile
 * manifest, then runs pnpm install in the profile directory.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const REPO = 'git+https://github.com/ivorytower1026/dsh-im-bot.git#main'
const PKGS = [
  { name: '@dsh-extra/im-channel', path: '/im-channel' },
  { name: '@dsh-extra/dsh-client-ui-settings-im', path: '/ui-settings-im' },
]
const BASE_BUNDLES = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']

const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const profileDir = join(home, 'profiles', 'web')
mkdirSync(profileDir, { recursive: true })

const manifestPath = join(profileDir, 'package.json')
let manifest = {
  name: 'dsh-profile-web',
  private: true,
  dependencies: {},
  dsh: { profile: { bundles: [...BASE_BUNDLES] } },
}
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    console.error(`[dsh-im-bot] 无法解析 ${manifestPath}：${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}
manifest.name ??= 'dsh-profile-web'
manifest.private ??= true
manifest.dependencies ??= {}
manifest.dsh ??= {}
manifest.dsh.profile ??= {}
manifest.dsh.profile.bundles = [...new Set([...(manifest.dsh.profile.bundles ?? []), ...BASE_BUNDLES])]
for (const pkg of PKGS) manifest.dependencies[pkg.name] = `${REPO}&path:${pkg.path}`
manifest.dsh.profile.bundles = [...new Set([...manifest.dsh.profile.bundles, ...PKGS.map(p => p.name)])]
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const wsPath = join(profileDir, 'pnpm-workspace.yaml')
if (!existsSync(wsPath)) {
  writeFileSync(wsPath, 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n')
}

console.log('[dsh-im-bot] profile 已更新，开始安装依赖…')
spawnSync('pnpm', ['install'], {
  cwd: profileDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
// Verify by presence: pnpm exits non-zero on advisory policy warnings
// (e.g. unapproved build scripts), which do not affect a working install.
const installed = PKGS.every(pkg =>
  existsSync(join(profileDir, 'node_modules', ...pkg.name.split('/'), 'package.json')))
if (!installed) {
  console.error('[dsh-im-bot] 安装失败，请检查上方输出。')
  process.exit(1)
}
console.log('[dsh-im-bot] 安装完成！重启 dsh web 后：设置 → 插件 → 手机连接，扫码即可使用。')
