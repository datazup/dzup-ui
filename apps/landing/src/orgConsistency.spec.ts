/**
 * GitHub-org consistency gate (TASK-FREE-11).
 *
 * The two apps used to disagree about which org owns this project — the
 * landing config used a `dzup-ui` org while the footer badges, the Storybook
 * manager and the README said `datazup/dzup-ui`. The git remote settles it:
 * **datazup** is the real org. This spec walks every hand-written
 * source/docs file in both apps (plus the README and the MCP package manifest)
 * and fails if the dead org string ever reappears, so the repo can never again
 * ship two identities.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = resolve(__dirname, '..', '..', '..')

/** The one true org (the git remote). */
const ORG = 'datazup'
/**
 * The dead variant that must never ship again (composed so this spec's own
 *  source never matches itself).
 */
const WRONG_ORG_URL = ['github.com', 'dzup-ui'].join('/')

/** Hand-written trees that carry GitHub references. */
const SCAN_ROOTS = ['apps/landing/src', 'apps/storybook/stories', 'apps/storybook/.storybook']
/** Single files outside those trees. */
const SCAN_FILES = ['README.md', 'packages/mcp/server.json', 'packages/mcp/package.json']

const SCAN_EXTENSIONS = new Set(['.ts', '.mts', '.vue', '.mdx', '.md', '.json', '.html'])
/** Generated dirs are rebuilt from source — scanning them only double-reports. */
const SKIP_DIRS = new Set(['node_modules', 'generated', 'dist', 'storybook-static', '_data'])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name))
        walk(full, out)
    }
    else if (SCAN_EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) {
      out.push(full)
    }
  }
  return out
}

const files = [
  ...SCAN_ROOTS.flatMap(root => walk(resolve(REPO_ROOT, root))),
  ...SCAN_FILES.map(file => resolve(REPO_ROOT, file)),
]

describe('gitHub org consistency', () => {
  it('scans a plausible number of files', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it(`no file references the dead "${WRONG_ORG_URL}" org`, () => {
    const self = resolve(__dirname, 'orgConsistency.spec.ts')
    const offenders = files
      .filter(file => file !== self && readFileSync(file, 'utf8').includes(WRONG_ORG_URL))
      .map(file => relative(REPO_ROOT, file))
    expect(offenders, `dead GitHub org in: ${offenders.join(', ')}`).toEqual([])
  })

  it(`every github.com repo reference uses the "${ORG}" org`, () => {
    const offenders: string[] = []
    const pattern = /github\.com\/([A-Za-z0-9-]+)\/dzup-ui/g
    const self = resolve(__dirname, 'orgConsistency.spec.ts')
    for (const file of files) {
      if (file === self)
        continue
      const content = readFileSync(file, 'utf8')
      for (const match of content.matchAll(pattern)) {
        if (match[1] !== ORG)
          offenders.push(`${relative(REPO_ROOT, file)} → ${match[0]}`)
      }
    }
    expect(offenders, `non-canonical org references: ${offenders.join('; ')}`).toEqual([])
  })
})
