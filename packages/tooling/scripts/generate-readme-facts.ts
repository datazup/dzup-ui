/**
 * Generated README facts (TASK-OSS-P2-02).
 *
 * Versions and counts stated in prose are promises, and when they drift they
 * undermine every other claim on the page. The root README's package table
 * claimed `@dzup-ui/core` was `0.1.0-alpha.0` while the package was `0.2.0` —
 * **five of its six rows were wrong**, and it omitted two publishable packages
 * entirely.
 *
 * So the facts are written between markers, from the packages themselves:
 *
 *     <!-- facts:packages:start -->
 *     …generated…
 *     <!-- facts:packages:end -->
 *
 * MDX uses the JSX comment form, `{…}` around a block comment, because it
 * cannot carry HTML comments.
 *
 * `yarn validate:readme-facts` regenerates into memory and fails on any
 * difference, so a hand edit is caught rather than merged.
 *
 * This complements, and does not replace, `apps/landing/scripts/build-counts.ts`,
 * which owns the `claims:generated` region of the same README. That one states
 * product claims from the landing's evidence; this one states package facts from
 * `package.json` and the ownership manifest.
 *
 * Usage:
 *   tsx packages/tooling/scripts/generate-readme-facts.ts           # write
 *   tsx packages/tooling/scripts/generate-readme-facts.ts --check   # report only
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

/** Documents that may carry generated fact regions. */
export const FACT_DOCUMENTS = [
  'README.md',
  'packages/core/README.md',
  'packages/nuxt/README.md',
  'packages/tokens/README.md',
]

interface PackageFacts {
  name: string
  version: string
  description: string
  directory: string
}

interface OwnershipEntry {
  symbol: string
  kind: string
}

/** Locale-independent, so two machines produce the same file. */
function byName(a: string, b: string): number {
  return a === b ? 0 : a < b ? -1 : 1
}

/** Every publishable workspace package, sorted. `tooling` is private and excluded. */
export function collectPackages(): PackageFacts[] {
  const dir = resolve(ROOT, 'packages')
  return readdirSync(dir)
    .filter(entry => existsSync(join(dir, entry, 'package.json')))
    .map((entry) => {
      const manifest = JSON.parse(
        readFileSync(join(dir, entry, 'package.json'), 'utf8'),
      ) as { name: string, version: string, description?: string, private?: boolean }
      return { manifest, entry }
    })
    .filter(({ manifest }) => manifest.private !== true)
    .map(({ manifest, entry }) => ({
      name: manifest.name,
      version: manifest.version,
      description: manifest.description ?? '',
      directory: `./packages/${entry}`,
    }))
    .sort((a, b) => byName(a.name, b.name))
}

/** Component families, from the directories that hold components. */
export function collectFamilies(): string[] {
  const dir = resolve(ROOT, 'packages/core/src/components')
  if (!existsSync(dir))
    return []
  return readdirSync(dir)
    .filter(entry => statSync(join(dir, entry)).isDirectory())
    .sort(byName)
}

export interface CatalogFacts {
  publicComponents: number
  compoundParts: number
  stories: number
  families: string[]
}

function countStories(dir: string): number {
  if (!existsSync(dir))
    return 0
  return readdirSync(dir).reduce((total, entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory())
      return total + countStories(full)
    return total + (entry.endsWith('.stories.ts') ? 1 : 0)
  }, 0)
}

/**
 * Catalog counts.
 *
 * Components come from the generated ownership manifest rather than a glob:
 * the manifest already distinguishes a public component from a compound part,
 * and a glob would count `DzCardBody` as a component in its own right.
 */
export function collectCatalog(): CatalogFacts {
  const manifestPath = resolve(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
  const entries = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as { entries: OwnershipEntry[] }).entries
    : []

  return {
    publicComponents: entries.filter(entry => entry.kind === 'public-component').length,
    compoundParts: entries.filter(entry => entry.kind === 'compound-part').length,
    stories: countStories(resolve(ROOT, 'packages/core/stories')),
    families: collectFamilies(),
  }
}

/** The body of each named region. */
export function renderRegions(): Record<string, string> {
  const packages = collectPackages()
  const catalog = collectCatalog()

  const table = [
    '| Package | Version | Description |',
    '|---|---|---|',
    ...packages.map(p => `| [\`${p.name}\`](${p.directory}) | ${p.version} | ${p.description} |`),
  ].join('\n')

  const families = catalog.families
    .map(family => family.charAt(0).toUpperCase() + family.slice(1))
    .join(' · ')

  const catalogLine = `**${catalog.publicComponents} public components** across `
    + `**${catalog.families.length} families**, plus ${catalog.compoundParts} compound parts, `
    + `documented by ${catalog.stories} story files.`

  return { packages: table, families, catalog: catalogLine }
}

/** `<!-- facts:name:start -->` … `<!-- facts:name:end -->`, or the MDX form. */
function regionPattern(name: string): RegExp {
  const marker = (edge: string): string => `(?:<!--|\\{/\\*)\\s*facts:${name}:${edge}\\s*(?:-->|\\*/\\})`
  return new RegExp(`(${marker('start')})[\\s\\S]*?(${marker('end')})`)
}

/** Apply every region this document declares. Documents with no markers are untouched. */
export function applyRegions(source: string, regions: Record<string, string>): string {
  let next = source
  for (const [name, body] of Object.entries(regions)) {
    const pattern = regionPattern(name)
    next = next.replace(pattern, (_match, start: string, end: string) => `${start}\n\n${body}\n\n${end}`)
  }
  return next
}

export interface FactsResult {
  file: string
  changed: boolean
  markers: number
}

export function generateFacts(write: boolean): FactsResult[] {
  const regions = renderRegions()
  const results: FactsResult[] = []

  for (const relativePath of FACT_DOCUMENTS) {
    const full = resolve(ROOT, relativePath)
    if (!existsSync(full))
      continue

    const current = readFileSync(full, 'utf8')
    const markers = Object.keys(regions).filter(name => regionPattern(name).test(current)).length
    if (markers === 0) {
      results.push({ file: relativePath, changed: false, markers: 0 })
      continue
    }

    const next = applyRegions(current, regions)
    if (next !== current && write)
      writeFileSync(full, next, 'utf8')

    results.push({ file: relativePath, changed: next !== current, markers })
  }

  return results
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const check = process.argv.includes('--check')
  const results = generateFacts(!check)

  for (const result of results) {
    const state = result.markers === 0
      ? 'no fact markers'
      : result.changed ? (check ? 'STALE' : 'rewritten') : 'already current'
    console.warn(`  ${result.file}: ${state} (${result.markers} region(s))`)
  }

  const stale = results.filter(result => result.changed)
  if (check && stale.length > 0) {
    console.error(`\n${stale.length} document(s) carry stale facts. Run \`yarn generate:readme-facts\`.`)
    process.exit(1)
  }

  console.warn(`✓ readme-facts: ${results.reduce((n, r) => n + r.markers, 0)} generated region(s) across `
    + `${relative(ROOT, ROOT) || 'the repository'}`)
}
/* c8 ignore stop */
