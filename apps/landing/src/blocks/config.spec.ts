/**
 * MCP setup snippets name an exact `@dzup-ui/mcp` version (UI-DZUP-UI-SEC-M-02).
 *
 * Every snippet runs `npx -y`, which installs and executes without a prompt. An
 * unpinned package name runs whatever the registry serves under it, so each
 * generated config — and every snippet in the package README that the npm page
 * shows — must pin the version `packages/mcp/package.json` declares.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  DZUP_MCP_COMMAND,
  DZUP_MCP_PACKAGE,
  DZUP_MCP_VERSION,
  dzupMcpClaudeCliCommand,
  dzupMcpConfig,
  dzupMcpVscodeConfig,
} from './config.ts'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const mcpPackage = JSON.parse(readFileSync(resolve(REPO_ROOT, 'packages/mcp/package.json'), 'utf8')) as {
  name: string
  version: string
}
const pinned = `${mcpPackage.name}@${mcpPackage.version}`

/** Every `@dzup-ui/mcp` reference that is something npx would be told to run. */
function runnableRefs(text: string): string[] {
  return [...text.matchAll(/@dzup-ui\/mcp(?:@[\w.+-]+)?(?=["'\s`]|$)/gm)].map(m => m[0])
}

describe('mCP setup snippets pin the published version', () => {
  it('pins the version packages/mcp/package.json declares', () => {
    expect(DZUP_MCP_PACKAGE).toBe(mcpPackage.name)
    expect(DZUP_MCP_VERSION).toBe(mcpPackage.version)
    expect(DZUP_MCP_VERSION).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/)
    expect(DZUP_MCP_COMMAND).toEqual(['npx', '-y', pinned])
  })

  it.each([
    ['mcpServers config', dzupMcpConfig()],
    ['VS Code config', dzupMcpVscodeConfig()],
    ['Claude Code CLI command', dzupMcpClaudeCliCommand()],
  ])('the %s runs the pinned package', (_name, snippet) => {
    const refs = runnableRefs(snippet)
    expect(refs.length).toBeGreaterThan(0)
    expect(refs.every(ref => ref === pinned)).toBe(true)
  })

  it('every npx snippet in the packages/mcp README is pinned to the same version', () => {
    const readme = readFileSync(resolve(REPO_ROOT, 'packages/mcp/README.md'), 'utf8')
    const npxLines = readme.split('\n').filter(line =>
      /npx\b/.test(line) || /"args":/.test(line),
    ).filter(line => line.includes('@dzup-ui/mcp'))
    expect(npxLines.length).toBeGreaterThan(0)
    for (const line of npxLines) {
      const refs = runnableRefs(line)
      expect(refs, line).not.toHaveLength(0)
      for (const ref of refs)
        expect(ref, line).toBe(pinned)
    }
  })
})
