/**
 * Registry client + parser tests. The pure parsers run against fixture strings;
 * the client integration tests read the REAL generated artifacts from the repo's
 * public dirs via the local-path reader, proving the MCP surface stays in lockstep
 * with what the website ships.
 */

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  createReader,
  extractComponentSection,
  normalizeComponentName,
  parseComponentIndex,
  RegistryClient,
} from './registry.js'
import { getBlock, getInstallCommand, listBlocks, listComponents, listTokens } from './tools.js'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

/** A client that reads the real, committed artifacts from the monorepo public dirs. */
function localClient(): RegistryClient {
  return new RegistryClient({ base: REPO_ROOT, reader: createReader(REPO_ROOT) })
}

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
})

describe('normalizeComponentName', () => {
  it('canonicalizes to lowercase Dz-prefixed form', () => {
    expect(normalizeComponentName('DzButton')).toBe('dzbutton')
    expect(normalizeComponentName('button')).toBe('dzbutton')
    expect(normalizeComponentName('BUTTON')).toBe('dzbutton')
  })
})

describe('registryClient against the real artifacts', () => {
  it('reads the blocks index and lists real blocks', async () => {
    const client = localClient()
    const index = await client.blocksIndex()
    expect(index.items.length).toBeGreaterThan(50)
    const out = await listBlocks(client, { query: 'hero' })
    expect(out.text).toMatch(/hero-centered/)
  })

  it('fetches a block with inlined source + install command', async () => {
    const client = localClient()
    const out = await getBlock(client, { name: 'hero-centered' })
    expect(out.isError).toBeFalsy()
    expect(out.text).toContain('shadcn@latest add')
    expect(out.text).toContain('/r/hero-centered.json')
    expect(out.text).toContain('<template>')
    expect(out.text).toMatch(/@dzup-ui\/core/)
  })

  it('errors cleanly for an unknown block', async () => {
    const out = await getBlock(localClient(), { name: 'does-not-exist' })
    expect(out.isError).toBe(true)
    expect(out.text).toMatch(/not found/i)
  })

  it('parses the component index from the storybook llms docs', async () => {
    const client = localClient()
    const rows = await client.components()
    expect(rows.length).toBeGreaterThan(100)
    expect(rows.some(r => r.name === 'DzButton')).toBe(true)
    const out = await listComponents(client, { family: 'Buttons' })
    expect(out.text).toContain('DzButton')
  })

  it('lists design tokens filtered by query', async () => {
    const out = await listTokens(localClient(), { theme: 'light', query: 'primary' })
    expect(out.text).toContain('--dz-colors-primary-500')
  })

  it('builds a package-manager-specific install command', async () => {
    const out = await getInstallCommand(localClient(), { name: 'pricing-3', packageManager: 'pnpm' })
    expect(out.text).toContain('pnpm dlx shadcn@latest add')
    expect(out.text).toContain('/r/pricing-3.json')
    expect(out.text).toContain('pnpm add @dzup-ui/core @dzup-ui/tokens')
  })
})
