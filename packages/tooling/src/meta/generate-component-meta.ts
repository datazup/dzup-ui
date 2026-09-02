/**
 * `yarn generate:component-meta` (TASK-N2-A2).
 *
 * Extracts every component's API with `vue-component-meta` and joins it to what
 * this program already generates — the ownership manifest (the authoritative
 * component list), the capability matrix (family / tier / anatomy / evidence
 * state) and the stories files (real usage examples) — into ONE artifact that
 * every consumer surface reads.
 *
 * **Why the ownership manifest and not `public-api.manifest.json`.**
 * TASK-N2-A1 measured the latter as stale by exactly 43 symbols that the
 * ownership manifest classifies `public-component` — `DzRating`, `DzCalendar`,
 * `DzAppShell` and 40 more. Generating from it would have handed the docs site
 * (D1), `llms.txt` (A3) and the MCP tools the same 43-component blind spot that
 * already makes 30 % of the catalog invisible to every AI client. The ownership
 * manifest is the generated authority for "what is a public component"; this
 * generator reads it, and inherits its 144, not the stale 101.
 *
 * Usage:
 *   tsx packages/tooling/src/meta/generate-component-meta.ts
 *   tsx packages/tooling/src/meta/generate-component-meta.ts --check
 *
 * @module @dzup-ui/tooling/meta/generate-component-meta
 */

import type {
  AnatomyJoin,
  CapabilityJoin,
  CatalogExtractionQuality,
  ComponentMetaArtifact,
  ComponentMetaRecord,
  MetaInput,
} from './component-meta.ts'
import type { ExtractTarget } from './extract-component-meta.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { readAnatomyFor } from '../ownership/anatomy-source.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  COMPONENT_META_SCHEMA_VERSION,
  serializeComponentMeta,
  stripProvenance,
} from './component-meta.ts'
import {
  componentDescription,
  contractTaxonomies,
  createComponentChecker,
  extractComponent,
  extractorId,
  isUnresolvedType,
  storiesJoin,
} from './extract-component-meta.ts'

/** The one artifact. Lives beside `capability-matrix.json` — the generated-truth home. */
export const COMPONENT_META_PATH = join(ROOT, 'packages/core/docs/component-meta.json')

/** Site path the MCP server reads it by. See `packages/mcp/src/registry.ts`. */
export const COMPONENT_META_SITE_PATH = '/r/component-meta.json'

const OWNERSHIP_PATH = join(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
const CAPABILITY_PATH = join(ROOT, 'packages/core/docs/capability-matrix.json')

interface OwnershipEntry {
  symbol: string
  kind: string
  status?: string
  parentComponent?: string
  subpaths?: string[]
  evidence: string[]
}

interface CapabilityRowLite {
  component: string
  family: string
  tier: string
  pattern: string
  securityBoundary: string
  traits: string[]
  anatomy: string
  source: string
  componentCommit: string
  cells: { kind: string, state: string }[]
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path))
    return null
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

/**
 * The commit this artifact was generated at.
 *
 * Constraint **B1** records that existing generators stamp their landing
 * commit's *parent* by construction. That is a property of when a generator is
 * run relative to the commit that lands it, not of the command — `git rev-parse
 * HEAD` is correct for the checkout it runs in, which is what provenance means.
 * The field is excluded from the freshness comparison (`stripProvenance`), so
 * nothing gates on it either way.
 */
function headCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
  }
  catch {
    return 'unknown'
  }
}

/**
 * Family from the component's own path — the directory it lives in.
 *
 * The second alternative is not defensive padding: `DzProvider` and
 * `DzThemeProvider` (the ADR-20 provider contract) live in
 * `packages/core/src/providers/`, outside the 11 `components/{family}/`
 * directories `CLAUDE.md` documents. The capability matrix already files them
 * under a 12th family, `providers`; this keeps the two agreeing.
 */
function familyFromSource(source: string): string {
  const inComponents = /packages\/core\/src\/components\/([^/]+)\//.exec(source)
  if (inComponents)
    return inComponents[1]!
  const inSrc = /packages\/core\/src\/([^/]+)\//.exec(source)
  return inSrc?.[1] ?? 'unknown'
}

/** The extraction targets, in a deterministic order, from the ownership manifest. */
export function collectTargets(): { targets: ExtractTarget[], warnings: string[] } {
  const manifest = readJson<{ entries: OwnershipEntry[] }>(OWNERSHIP_PATH)
  const warnings: string[] = []
  if (!manifest) {
    return {
      targets: [],
      warnings: [`${OWNERSHIP_PATH} is absent. Run \`yarn generate:ownership\`.`],
    }
  }
  const targets: ExtractTarget[] = []
  for (const entry of manifest.entries) {
    if (entry.kind !== 'public-component' && entry.kind !== 'compound-part')
      continue
    const vue = entry.evidence.find(p => p.endsWith('.vue'))
    if (vue === undefined) {
      warnings.push(`${entry.symbol} is ${entry.kind} but the ownership manifest records no .vue evidence.`)
      continue
    }
    const declaredStories = entry.evidence.find(p => p.endsWith('.stories.ts'))
    targets.push({
      name: entry.symbol,
      kind: entry.kind,
      ...(entry.parentComponent === undefined ? {} : { parentComponent: entry.parentComponent }),
      family: familyFromSource(vue),
      ...(entry.status === undefined ? {} : { status: entry.status }),
      subpaths: [...(entry.subpaths ?? [])].sort(),
      source: vue,
      ...(declaredStories === undefined ? {} : { storiesFile: declaredStories }),
    })
  }
  targets.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return { targets, warnings }
}

function anatomyJoin(sourceAbs: string): AnatomyJoin {
  const read = readAnatomyFor(sourceAbs)
  if (!read.anatomy)
    return { state: 'absent', parts: [] }
  const parts = read.anatomy.parts === 'none' ? [] : [...read.anatomy.parts].sort()
  return {
    state: 'declared',
    parts,
    ...(read.file === undefined ? {} : { source: read.file.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, '') }),
  }
}

function capabilityJoin(row: CapabilityRowLite | undefined): CapabilityJoin | undefined {
  if (!row)
    return undefined
  const cells: Record<string, number> = {}
  const unrun: string[] = []
  const stale: string[] = []
  for (const cell of row.cells) {
    cells[cell.state] = (cells[cell.state] ?? 0) + 1
    if (cell.state === 'unrun')
      unrun.push(cell.kind)
    if (cell.state === 'stale')
      stale.push(cell.kind)
  }
  const ordered: Record<string, number> = {}
  for (const k of Object.keys(cells).sort())
    ordered[k] = cells[k]!
  return {
    tier: row.tier,
    pattern: row.pattern,
    securityBoundary: row.securityBoundary,
    traits: [...row.traits].sort(),
    cells: ordered,
    unrun: [...unrun].sort(),
    stale: [...stale].sort(),
  }
}

function emptyTotals(): CatalogExtractionQuality {
  return {
    components: 0,
    publicComponents: 0,
    compoundParts: 0,
    unclassifiable: 0,
    props: 0,
    propsWithDescription: 0,
    propsWithDeclaredDefault: 0,
    propsWithLiteralUndefinedDefault: 0,
    events: 0,
    eventsWithDescription: 0,
    eventsFromExtractor: 0,
    eventsFromEmitsInterface: 0,
    eventsModelDerived: 0,
    slots: 0,
    slotsWithDescription: 0,
    slotsWithPayload: 0,
    exposed: 0,
    exposedWithDescription: 0,
    unresolvedTypes: 0,
    componentsWithStories: 0,
    componentsWithPrimaryExample: 0,
    componentsWithStaticTemplate: 0,
  }
}

/** Build the artifact. Pure apart from reading the repository. */
export function buildComponentMeta(): { artifact: ComponentMetaArtifact, warnings: string[] } {
  const { targets, warnings } = collectTargets()

  const capability = readJson<{ rows: CapabilityRowLite[] }>(CAPABILITY_PATH)
  const capabilityByName = new Map<string, CapabilityRowLite>(
    (capability?.rows ?? []).map(r => [r.component, r]),
  )

  const inputs: Record<string, MetaInput> = {
    ownershipManifest: {
      path: 'packages/core/manifests/component-ownership.manifest.json',
      available: existsSync(OWNERSHIP_PATH),
    },
    capabilityMatrix: {
      path: 'packages/core/docs/capability-matrix.json',
      available: existsSync(CAPABILITY_PATH),
    },
    stories: {
      path: 'packages/core/stories/{family}/Dz{Name}.stories.ts',
      available: existsSync(join(ROOT, 'packages/core/stories')),
    },
  }

  const checker = createComponentChecker()
  const totals = emptyTotals()
  const components: ComponentMetaRecord[] = []

  for (const target of targets) {
    const sourceAbs = join(ROOT, target.source)
    const typesRel = target.source.replace(/\.vue$/, '.types.ts')
    const members = extractComponent(checker, target)
    const stories = storiesJoin(target.name, target.family, target.storiesFile)
    const row = capabilityByName.get(target.name)

    const unresolvedTypes = [
      ...members.props.filter(p => isUnresolvedType(p.type)).map(p => `prop ${p.name}: ${p.type}`),
      ...members.events.filter(e => isUnresolvedType(e.type)).map(e => `event ${e.name}: ${e.type}`),
      ...members.exposed.filter(x => isUnresolvedType(x.type)).map(x => `exposed ${x.name}: ${x.type}`),
    ].sort()

    const record: ComponentMetaRecord = {
      name: target.name,
      kind: target.kind,
      ...(target.parentComponent === undefined ? {} : { parentComponent: target.parentComponent }),
      ...componentDescription(sourceAbs, target.name),
      family: target.family,
      ...(target.status === undefined ? {} : { status: target.status }),
      subpaths: target.subpaths,
      source: target.source,
      ...(existsSync(join(ROOT, typesRel)) ? { typesSource: typesRel } : {}),
      componentCommit: row?.componentCommit ?? 'unknown',
      componentType: members.componentType,
      ...(row?.tier === undefined ? {} : { tier: row.tier }),
      anatomy: anatomyJoin(sourceAbs),
      ...(capabilityJoin(row) === undefined ? {} : { capability: capabilityJoin(row)! }),
      props: members.props,
      globalPropCount: members.globalPropCount,
      events: members.events,
      slots: members.slots,
      exposed: members.exposed,
      stories,
      extraction: {
        props: members.props.length,
        propsWithDescription: members.props.filter(p => p.description !== '').length,
        propsWithDeclaredDefault: members.props.filter(p => p.default !== null && p.default !== 'undefined').length,
        events: members.events.length,
        eventsWithDescription: members.events.filter(e => e.description !== '').length,
        eventsModelDerived: members.events.filter(e => e.modelDerived).length,
        slots: members.slots.length,
        slotsWithDescription: members.slots.filter(s => s.description !== '').length,
        slotsWithPayload: members.slots.filter(s => s.hasPayload).length,
        exposed: members.exposed.length,
        exposedWithDescription: members.exposed.filter(x => x.description !== '').length,
        unresolvedTypes,
      },
      ...(members.error === undefined ? {} : { extractionError: members.error }),
    }
    components.push(record)

    totals.components++
    if (target.kind === 'public-component')
      totals.publicComponents++
    else totals.compoundParts++
    if (members.error !== undefined)
      totals.unclassifiable++
    totals.props += record.extraction.props
    totals.propsWithDescription += record.extraction.propsWithDescription
    totals.propsWithDeclaredDefault += record.extraction.propsWithDeclaredDefault
    totals.propsWithLiteralUndefinedDefault += members.props.filter(p => p.default === 'undefined').length
    totals.events += record.extraction.events
    totals.eventsWithDescription += record.extraction.eventsWithDescription
    totals.eventsFromExtractor += members.events.filter(e => e.descriptionSource === 'vue-component-meta').length
    totals.eventsFromEmitsInterface += members.events.filter(e => e.descriptionSource === 'emits-interface').length
    totals.eventsModelDerived += record.extraction.eventsModelDerived
    totals.slots += record.extraction.slots
    totals.slotsWithDescription += record.extraction.slotsWithDescription
    totals.slotsWithPayload += record.extraction.slotsWithPayload
    totals.exposed += record.extraction.exposed
    totals.exposedWithDescription += record.extraction.exposedWithDescription
    totals.unresolvedTypes += unresolvedTypes.length
    if (stories.file !== undefined)
      totals.componentsWithStories++
    if (stories.primary !== undefined)
      totals.componentsWithPrimaryExample++
    if (stories.primary?.template !== undefined)
      totals.componentsWithStaticTemplate++
  }

  const artifact: ComponentMetaArtifact = {
    schemaVersion: COMPONENT_META_SCHEMA_VERSION,
    sourceCommit: headCommit(),
    extractor: extractorId(),
    generatedFrom: [
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/core/docs/capability-matrix.json',
      'packages/core/src/components/*/Dz*.vue',
      'packages/core/src/components/*/Dz*.types.ts',
      'packages/core/src/components/*/Dz*.anatomy.ts',
      'packages/core/stories/*/Dz*.stories.ts',
    ],
    inputs,
    taxonomies: (() => {
      const program = checker.getProgram()
      return program ? contractTaxonomies(program) : {}
    })(),
    totals,
    components,
  }
  return { artifact, warnings }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const checkOnly = process.argv.includes('--check')
  const { artifact, warnings } = buildComponentMeta()
  const serialized = serializeComponentMeta(artifact)

  for (const w of warnings)
    console.warn(`  ! ${w}`)

  if (checkOnly) {
    if (!existsSync(COMPONENT_META_PATH)) {
      console.error('✗ packages/core/docs/component-meta.json does not exist. Run `yarn generate:component-meta`.')
      process.exit(1)
    }
    const committed = readFileSync(COMPONENT_META_PATH, 'utf8')
    if (stripProvenance(committed) !== stripProvenance(serialized)) {
      console.error('✗ packages/core/docs/component-meta.json is STALE — it disagrees with a fresh '
        + 'extraction of the sources. Run `yarn generate:component-meta`.')
      process.exit(1)
    }
    console.warn('✓ component-meta is fresh.')
    process.exit(0)
  }

  writeFileSync(COMPONENT_META_PATH, serialized, 'utf8')
  const t = artifact.totals
  console.warn(`▸ component-meta: ${t.components} components (${t.publicComponents} public, `
    + `${t.compoundParts} compound parts), ${t.unclassifiable} unclassifiable`)
  console.warn(`  props ${t.propsWithDescription}/${t.props} described · `
    + `events ${t.eventsWithDescription}/${t.events} described `
    + `(${t.eventsFromExtractor} extractor, ${t.eventsFromEmitsInterface} emits-interface) · `
    + `slots ${t.slotsWithDescription}/${t.slots} described · `
    + `exposed ${t.exposedWithDescription}/${t.exposed} described`)
  console.warn(`  unresolved types ${t.unresolvedTypes} · `
    + `examples ${t.componentsWithPrimaryExample}/${t.components} `
    + `(${t.componentsWithStaticTemplate} with a static template)`)
  console.warn(`  → ${COMPONENT_META_PATH.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, '')}`)
}
/* c8 ignore stop */
