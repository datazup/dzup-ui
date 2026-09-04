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
  'packages/contracts/README.md',
  'packages/core/README.md',
  'packages/nuxt/README.md',
  'packages/tokens/README.md',
]

/** The versioning policy statement (TASK-N5-01), relative to the repository root. */
export const VERSIONING_POLICY = 'packages/contracts/VERSIONING.md'

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

/**
 * The versioning line (TASK-N5-01).
 *
 * Generated rather than typed because it is a claim about *every* published
 * package's version, and that is exactly the class of sentence the packages
 * table was wrong about for five of its six rows. If one package crosses 1.0
 * the sentence stops saying "all", and the policy's own scope clause
 * (`VERSIONING.md` §1, gated by `yarn validate:release-policy` R6) fires.
 */
export function renderVersioning(packages: PackageFacts[], link: string): string {
  const zero = packages.filter(p => /^0\./.test(p.version))
  const scope = zero.length === packages.length
    ? `All ${packages.length} published \`@dzup-ui/*\` packages are \`0.x\`.`
    : `${zero.length} of ${packages.length} published \`@dzup-ui/*\` packages are \`0.x\`; `
      + `${packages.filter(p => !/^0\./.test(p.version)).map(p => `\`${p.name}\``).join(', ')} `
      + 'passed 1.0, so the pre-1.0 mapping below no longer covers the whole workspace.'

  return `${scope} Under the [0.x versioning policy](${link}): a **minor** bump is a `
    + '**breaking change**, a **patch** is additive or a fix, and `major` is not used before '
    + '1.0 — a major bump *is* the 1.0 release. The breaking surface is defined there: '
    + 'manifest-recorded public symbols, the ADR-19 parts/states/`ui` contract, the `--dz-*` '
    + 'token ABI and its resolved values, the package `exports` map, and the ADR-20 provider '
    + 'contract.'
}

/** `@dzup-ui/core`'s declared Vue peer range, or `?` when it cannot be read. */
export function readPeerVue(): string {
  const path = resolve(ROOT, 'packages/core/package.json')
  if (!existsSync(path))
    return '?'
  const json = JSON.parse(readFileSync(path, 'utf8')) as { peerDependencies?: Record<string, string> }
  return json.peerDependencies?.vue ?? '?'
}

/** The forward-compat lane's declaration, or an empty one when the file is absent. */
export function readVaporLane(): { channel?: string, resolutions?: Record<string, string> } {
  const path = resolve(ROOT, 'packages/tooling/scripts/vue-next-lane.json')
  if (!existsSync(path))
    return {}
  return JSON.parse(readFileSync(path, 'utf8')) as { channel?: string, resolutions?: Record<string, string> }
}

/** The Vapor-interop lane's inputs, so the README cannot state a version the lane does not pin. */
export const VAPOR_SPEC = 'packages/core/tests/vapor-interop.spec.ts'
export const VAPOR_LANE_CONFIG = 'packages/tooling/scripts/vue-next-lane.json'
export const VAPOR_VERIFY_COMMAND = 'yarn test:vue-next:vapor'

/**
 * The Vapor-interop compatibility statement (TASK-N5-03).
 *
 * **Generated, not typed, because it is a compatibility claim** — the one class
 * of sentence this whole generator exists for. Three of its four facts are read
 * off disk rather than remembered:
 *
 *   - the peer range comes from `packages/core/package.json`, so it cannot
 *     disagree with what the package actually declares;
 *   - the pinned Vue and its channel come from `vue-next-lane.json`, so when
 *     the lane moves to `3.6.0` stable the README moves with it;
 *   - the evidence path is asserted to EXIST. Delete
 *     `vapor-interop.spec.ts` and this block changes to say the claim is
 *     unbacked, `yarn validate:readme-facts` goes red, and the README stops
 *     claiming something nothing tests. That is the property a hand-typed
 *     paragraph cannot have, and TASK-N5-03 finding F8 is about exactly this
 *     failure mode.
 *
 * What it deliberately does NOT generate is the word "verified" as a bare
 * fact. A generator can see that the evidence exists; it cannot see that
 * anybody ran it. So the block names the spec and the command, and the run
 * record lives in the handoff where a date and a machine can be attached to it.
 */
export function renderVapor(peerRange: string, lane: { channel?: string, resolutions?: Record<string, string> }): string {
  const pinned = lane.resolutions?.vue
  const channel = lane.channel
  const backed = existsSync(resolve(ROOT, VAPOR_SPEC))

  const evidence = backed
    ? `Backed by [\`${VAPOR_SPEC}\`](../../${VAPOR_SPEC}), run by \`${VAPOR_VERIFY_COMMAND}\`. `
    + 'It mounts a real Vapor application, installs the plugin, renders `DzButton` inside it, '
    + 'and asserts the rendered `<button>` and its `data-tone` attribute. On a Vue without '
    + 'Vapor it reports **unverified by name** rather than passing — an unrun check and a '
    + 'passing check must not look the same.'
    : `**UNBACKED.** \`${VAPOR_SPEC}\` does not exist, so nothing in this repository tests `
      + 'the statement above. Treat it as a claim, not as evidence.'

  const lanePin = pinned === undefined
    ? `No Vue version is pinned in \`${VAPOR_LANE_CONFIG}\`, so the lane has nothing to run against.`
    : `The forward-compatibility lane pins **\`vue@${pinned}\`**${
      channel === undefined ? '' : ` (\`${channel}\` channel)`
    }, which is **not** the version this library is built and tested against — the declared `
    + `peer range is \`vue@${peerRange}\`. The lane is advisory until Vue 3.6 is stable.`

  return `${evidence}

${lanePin}`
}

/**
 * The body of each named region.
 *
 * Takes the document it is rendering for, because one region — `versioning` —
 * carries a link, and a link is only correct relative to the file it sits in.
 */
export function renderRegions(document: string = 'README.md'): Record<string, string> {
  const packages = collectPackages()
  const catalog = collectCatalog()

  const from = resolve(ROOT, dirname(document))
  const link = relative(from, resolve(ROOT, VERSIONING_POLICY)).replace(/\\/g, '/')

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

  const corePeer = readPeerVue()
  const lane = readVaporLane()

  return {
    packages: table,
    families,
    catalog: catalogLine,
    versioning: renderVersioning(packages, link),
    vapor: renderVapor(corePeer, lane),
  }
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
  const results: FactsResult[] = []

  for (const relativePath of FACT_DOCUMENTS) {
    const full = resolve(ROOT, relativePath)
    if (!existsSync(full))
      continue

    const regions = renderRegions(relativePath)
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
