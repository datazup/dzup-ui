/**
 * The bin entry point (TASK-N2-A4).
 *
 * `@dzup-ui/mcp` is invoked as `npx -y @dzup-ui/mcp`, which runs the `bin` npm
 * installs — and npm installs it as a SYMLINK named after the bin key, not as
 * `index.js`. The guard that decides whether to start the stdio server tested
 * the invoked file's NAME, so on that path it was false, `main()` never ran, and
 * the process exited 0 with no output — which every MCP client reports as
 * `connection closed: calling "initialize": … EOF`. Nothing in the repo could
 * see it: the package's own specs import the module, `scripts/e2e-smoke.mjs`
 * spawned `dist/index.js` directly, and `validate:mcp` only compared `bin` to
 * the `files` list.
 *
 * The layout below is the real one — `node_modules/.bin/<name>` is a relative
 * symlink into the package — so this spec fails against the name-based guard and
 * passes against a resolved-path one. The temp tree is a filesystem fact, not a
 * mock: path resolution is the behaviour under test.
 */

import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { isDirectInvocation } from './index.js'

const ROOT = mkdtempSync(join(tmpdir(), 'dzup-ui-mcp-entry-'))
const DIST = join(ROOT, 'dist')
const BIN_DIR = join(ROOT, 'node_modules', '.bin')
const BIN = join(BIN_DIR, 'dzup-ui-mcp')

mkdirSync(DIST, { recursive: true })
mkdirSync(BIN_DIR, { recursive: true })
writeFileSync(join(DIST, 'index.js'), '// built entry\n')
writeFileSync(join(DIST, 'index.ts'), '// source entry\n')
writeFileSync(join(DIST, 'registry.js'), '// a sibling module\n')
symlinkSync(join('..', '..', 'dist', 'index.js'), BIN)

afterAll(() => {
  rmSync(ROOT, { recursive: true, force: true })
})

describe('isDirectInvocation', () => {
  it('accepts the built entry invoked by its own path', () => {
    expect(isDirectInvocation(join(DIST, 'index.js'), DIST)).toBe(true)
  })

  it('accepts the source entry, so `yarn dev` (tsx src/index.ts) still starts the server', () => {
    expect(isDirectInvocation(join(DIST, 'index.ts'), DIST)).toBe(true)
  })

  it('accepts the installed bin, which npm names after the bin key, not `index.js`', () => {
    expect(basename(BIN)).toBe('dzup-ui-mcp')
    expect(isDirectInvocation(BIN, DIST)).toBe(true)
  })

  it('rejects a sibling module imported by the entry', () => {
    expect(isDirectInvocation(join(DIST, 'registry.js'), DIST)).toBe(false)
  })

  it('rejects an absent entry rather than throwing', () => {
    expect(isDirectInvocation(join(DIST, 'missing.js'), DIST)).toBe(false)
    expect(isDirectInvocation(undefined, DIST)).toBe(false)
  })

  it('rejects a same-named entry that is not this module', () => {
    const other = join(ROOT, 'elsewhere')
    mkdirSync(other, { recursive: true })
    writeFileSync(join(other, 'index.js'), '// a different index.js\n')
    expect(isDirectInvocation(join(other, 'index.js'), DIST)).toBe(false)
  })
})
