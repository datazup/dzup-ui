/**
 * Registry client + parser specs.
 *
 * Renamed from `registry.test.ts` by TASK-N2-A1: the root `vitest.config.ts`
 * includes only `.spec.ts` files under each package's `src` directory, so under
 * its old name this file — the
 * package's ONLY test — matched nothing in `yarn test`, nothing in
 * `yarn test:coverage`, and nothing in CI (`.github/workflows/` contains no
 * occurrence of `mcp`). Every assertion below is the original one; what changed
 * is the name, and what the integration block does when the artifacts it reads
 * are absent.
 *
 * The pure parsers run against fixture strings. The integration block reads the
 * REAL generated artifacts from the repo's public dirs — but
 * `apps/storybook/public/llms.txt(-full)` are GIT-IGNORED build outputs
 * (`apps/storybook/.gitignore:14-15`), so on a clean checkout they do not exist.
 * The original file asserted against them unconditionally and would have failed;
 * it never had the chance, because it never ran. Those cases now SKIP with a
 * named reason, which keeps an unrun cell visible instead of turning it into
 * either a red build or a silent pass.
 */

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  createReader,
  extractComponentSection,
  isRegistryId,
  normalizeComponentName,
  parseComponentIndex,
  REGISTRY_ID_MAX_LENGTH,
  RegistryClient,
} from './registry.js'
import { getBlock, getInstallCommand, listBlocks, listComponents, listTokens } from './tools.js'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

/** A client that reads the real, generated artifacts from the monorepo public dirs. */
function localClient(): RegistryClient {
  return new RegistryClient({ base: REPO_ROOT, reader: createReader(REPO_ROOT) })
}

/** Site path → whether the artifact behind it is present in this checkout. */
function hasArtifact(rel: string): boolean {
  return existsSync(resolve(REPO_ROOT, rel))
}

const HAS_BLOCKS = hasArtifact('apps/landing/public/r/registry.json')
const HAS_TOKENS = hasArtifact('apps/landing/public/r/tokens.json')
/**
 * The component-API docs. Since TASK-N2-A3 the source of truth is COMMITTED at
 * `packages/core/docs/llms.txt` (rendered by `yarn generate:llms` from the
 * metadata artifact), and `createReader` resolves `/storybook/llms.txt` to it
 * when the git-ignored copy in `apps/storybook/public/` has not been built.
 * So on a clean checkout this is now true, and the cases below RUN rather than
 * skip — one fewer permanently-unrun cell.
 */
const HAS_COMPONENT_DOCS = hasArtifact('packages/core/docs/llms.txt')
  || hasArtifact('apps/storybook/public/llms.txt')

describe('parseComponentIndex', () => {
  const md = [
    '## Conventions',
    '- **Import** — everything is a named export.',
    '',
    '## Buttons',
    '',
    '- **DzButton** — Primary button component.',
    '  - props: `variant`, `size`, `tone`',
    '  - variant: `solid` `outline` · size: `md`',
    '- **DzIconButton** — Icon-only button component.',
    '  - props: `icon`, `ariaLabel`',
    '',
    '## Cards',
    '- **DzCard** — Surface container.',
  ].join('\n')

  it('groups components under their family and skips Conventions', () => {
    const rows = parseComponentIndex(md)
    expect(rows.map(r => r.name)).toEqual(['DzButton', 'DzIconButton', 'DzCard'])
    expect(rows.find(r => r.name === 'DzButton')?.family).toBe('Buttons')
    expect(rows.find(r => r.name === 'DzCard')?.family).toBe('Cards')
  })

  it('captures the description and folds detail lines into details', () => {
    const btn = parseComponentIndex(md).find(r => r.name === 'DzButton')!
    expect(btn.description).toBe('Primary button component.')
    expect(btn.details).toContain('props: `variant`, `size`, `tone`')
    expect(btn.details).toContain('variant: `solid`')
  })

  it('returns nothing for an index with no family sections', () => {
    expect(parseComponentIndex('# Title\n\nprose only\n')).toEqual([])
  })
})

describe('extractComponentSection', () => {
  const md = [
    '## Buttons',
    '### DzButton',
    'Primary button.',
    '| Prop | Type |',
    '### DzIconButton',
    'Icon button.',
  ].join('\n')

  it('slices exactly one component section', () => {
    const section = extractComponentSection(md, 'DzButton')
    expect(section).toContain('### DzButton')
    expect(section).toContain('Primary button.')
    expect(section).not.toContain('DzIconButton')
  })

  it('is Dz-prefix and case tolerant', () => {
    expect(extractComponentSection(md, 'button')).toContain('### DzButton')
    expect(extractComponentSection(md, 'iconbutton')).toContain('Icon button.')
  })

  it('returns null for an unknown component', () => {
    expect(extractComponentSection(md, 'DzNope')).toBeNull()
  })

  it('runs the last section to the end of the document', () => {
    expect(extractComponentSection(md, 'DzIconButton')).toContain('Icon button.')
  })
})

describe('normalizeComponentName', () => {
  it('canonicalizes to lowercase Dz-prefixed form', () => {
    expect(normalizeComponentName('DzButton')).toBe('dzbutton')
    expect(normalizeComponentName('button')).toBe('dzbutton')
    expect(normalizeComponentName('BUTTON')).toBe('dzbutton')
  })
})

describe('isRegistryId', () => {
  it('accepts every id shape the generated catalog actually uses', () => {
    for (const id of ['hero-centered', 'pricing-3', 'analytics-dashboard', 'a', 'a1-b2-c3'])
      expect(isRegistryId(id), id).toBe(true)
  })

  it('rejects everything that is not one', () => {
    const bad = [
      '',
      ' ',
      '-lead',
      'trail-',
      'double--hyphen',
      'Upper',
      'under_score',
      'dot.json',
      'with space',
      '../traversal',
      'unicode-héro',
      'a'.repeat(REGISTRY_ID_MAX_LENGTH + 1),
      null,
      undefined,
      42,
      {},
    ]
    for (const v of bad) expect(isRegistryId(v), JSON.stringify(v)).toBe(false)
  })
})

describe('registryClient against the real artifacts', () => {
  it.skipIf(!HAS_BLOCKS)('reads the blocks index and lists real blocks', async () => {
    const client = localClient()
    const index = await client.blocksIndex()
    expect(index.items.length).toBeGreaterThan(50)
    const out = await listBlocks(client, { query: 'hero' })
    expect(out.text).toMatch(/hero-centered/)
  })

  it.skipIf(!HAS_BLOCKS)('fetches a block with inlined source + install command', async () => {
    const client = localClient()
    const out = await getBlock(client, { name: 'hero-centered' })
    expect(out.isError).toBeFalsy()
    expect(out.text).toContain('shadcn@latest add')
    expect(out.text).toContain('/r/hero-centered.json')
    expect(out.text).toContain('<template>')
    expect(out.text).toMatch(/@dzup-ui\/core/)
  })

  it.skipIf(!HAS_BLOCKS)('errors cleanly for an unknown block', async () => {
    const out = await getBlock(localClient(), { name: 'does-not-exist' })
    expect(out.isError).toBe(true)
    expect(out.text).toMatch(/not found/i)
  })

  it.skipIf(!HAS_COMPONENT_DOCS)('parses the component index from the storybook llms docs', async () => {
    const client = localClient()
    const rows = await client.components()
    expect(rows.length).toBeGreaterThan(100)
    expect(rows.some(r => r.name === 'DzButton')).toBe(true)
    const out = await listComponents(client, { family: 'Buttons' })
    expect(out.text).toContain('DzButton')
  })

  /**
   * The regression test for TASK-N2-A1's finding F1. `DzRating`, `DzAppShell`
   * and `DzCalendar` are three of the 43 `public-component` symbols
   * `public-api.manifest.json` omits; while `llms.txt` was rendered from that
   * manifest, `list_components` and `get_component` could not see any of them.
   * `GovernanceBadge` is one of the two public components that carry no `Dz`
   * prefix (TASK-N2-A2 finding F-5) — present in the document but unparseable
   * until the name pattern was widened.
   */
  it.skipIf(!HAS_COMPONENT_DOCS)('sees the components the stale manifest omitted', async () => {
    const client = localClient()
    const names = new Set((await client.components()).map(r => r.name))
    for (const name of ['DzRating', 'DzAppShell', 'DzCalendar', 'GovernanceBadge'])
      expect(names, `${name} must be discoverable through list_components`).toContain(name)

    for (const name of ['DzRating', 'GovernanceBadge']) {
      const section = await client.component(name)
      expect(section, `${name} must have a get_component section`).not.toBeNull()
      expect(section).toContain(`### ${name}`)
    }
  })

  it.skipIf(!HAS_TOKENS)('lists design tokens filtered by query', async () => {
    const out = await listTokens(localClient(), { theme: 'light', query: 'primary' })
    expect(out.text).toContain('--dz-colors-primary-500')
  })

  it.skipIf(!HAS_BLOCKS)('builds a package-manager-specific install command', async () => {
    const out = await getInstallCommand(localClient(), { name: 'pricing-3', packageManager: 'pnpm' })
    expect(out.text).toContain('pnpm dlx shadcn@latest add')
    expect(out.text).toContain('/r/pricing-3.json')
    expect(out.text).toContain('pnpm add @dzup-ui/core @dzup-ui/tokens')
  })

  it('records which real artifacts this checkout has, so a skip is never silent', () => {
    // Not an assertion about the catalog — an assertion that the suite KNOWS
    // what it did not run. `expect` on the booleans keeps them in the report.
    expect(typeof HAS_BLOCKS).toBe('boolean')
    expect(typeof HAS_TOKENS).toBe('boolean')
    expect(typeof HAS_COMPONENT_DOCS).toBe('boolean')
    if (!HAS_COMPONENT_DOCS) {
      console.warn(
        '[mcp] neither packages/core/docs/llms.txt (committed) nor '
        + 'apps/storybook/public/llms.txt (git-ignored copy) is present — '
        + 'the component-index integration cases were SKIPPED, not passed. '
        + 'Run `yarn generate:llms`.',
      )
    }
  })
})
