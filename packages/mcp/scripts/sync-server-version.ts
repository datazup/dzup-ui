/**
 * Copy `packages/mcp/package.json#version` into `server.json` — both its
 * top-level `version` and `packages[0].version` (owner decision N5-01-D1).
 *
 * WHY. `changeset version` bumps package.json and writes the CHANGELOG, and
 * knows nothing about server.json. Release PR #3 proved the cost: mcp went to
 * 0.2.1 while server.json — which ships in the tarball and is what an MCP
 * registry reads — still said 0.2.0, and `yarn validate:mcp` failed on a tree
 * no CI had run. `yarn version-packages` now runs this, then
 * `yarn generate:mcp-surface`, so the release PR carries one version everywhere.
 *
 * The two `"version": "…"` values are replaced in place rather than by
 * re-serialising the JSON, so the file keeps its hand formatting. Exactly two
 * must exist; anything else is refused instead of guessed.
 *
 * Usage:
 *   tsx packages/mcp/scripts/sync-server-version.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function syncServerVersion(serverJson: string, version: string): string {
  const pattern = /("version"\s*:\s*)"[^"]*"/g
  const found = serverJson.match(pattern)?.length ?? 0
  if (found !== 2) {
    throw new Error(`server.json has ${found} "version" fields; expected exactly 2 (version, packages[0].version).`)
  }
  const next = serverJson.replace(pattern, (_, key: string) => `${key}${JSON.stringify(version)}`)
  const parsed = JSON.parse(next) as { version?: string, packages?: Array<{ version?: string }> }
  if (parsed.version !== version || parsed.packages?.[0]?.version !== version)
    throw new Error('server.json "version" fields are not where they were expected (version, packages[0].version).')
  return next
}

function main(): void {
  const { version } = JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf8')) as { version: string }
  const path = resolve(PKG_ROOT, 'server.json')
  const before = readFileSync(path, 'utf8')
  const after = syncServerVersion(before, version)
  if (after !== before)
    writeFileSync(path, after, 'utf8')
  console.warn(`server.json version ${after === before ? 'already' : 'now'} ${version}`)
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main()
