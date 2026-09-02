/**
 * `yarn validate:component-meta` (TASK-N2-A2).
 *
 * The freshness gate for `packages/core/docs/component-meta.json`, plus the
 * extraction-debt ratchets.
 *
 * Five clause groups:
 *
 *   1. **freshness** — the committed artifact equals a fresh extraction of the
 *      sources. Same pattern as `validate:ownership` / `validate:capability-matrix`:
 *      re-derive, serialize through the generator's own serializer, compare
 *      bytes with `sourceCommit` stripped. A source change that nobody
 *      regenerated for turns this red.
 *   2. **coverage** — every `public-component` in the ownership manifest has a
 *      record. This is the packet's success criterion held as a gate rather
 *      than as a sentence in a report.
 *   3. **schema** — every record carries the fields a consumer is told it can
 *      rely on, and every published description carries a `descriptionSource`.
 *      D1 renders from this; a silently-missing field would render as a silently
 *      empty prop table.
 *   4. **ratchets** — nine downward-only extraction-debt numbers
 *      (`component-meta-ceilings.json`). Each fails when it rises AND when it
 *      falls without the ceiling being lowered, so progress is recorded rather
 *      than absorbed.
 *   5. **reachability** — the deployed site must serve the artifact at
 *      `/r/component-meta.json`, because that is the site path
 *      `@dzup-ui/mcp`'s `RegistryClient` reads in HTTP mode. Asserted against
 *      `apps/landing/scripts/build-registry.ts`, which owns `/r/*`. Without
 *      this clause the three new MCP tools work locally and 404 in production —
 *      exactly the class of defect A1's F-1 was.
 *
 * This validator does **not** import `@dzup-ui/mcp` or any other `@dzup-ui/*`
 * package: `packages/tooling` may not depend on them (README §3 `<packages>`).
 *
 * Usage:
 *   tsx packages/tooling/src/validators/component-meta.ts
 *   tsx packages/tooling/src/validators/component-meta.ts --all
 *
 * Exit code 1 if a hard clause fails.
 *
 * @module @dzup-ui/tooling/validators/component-meta
 */

import type { ComponentMetaArtifact } from '../meta/component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { serializeComponentMeta, stripProvenance } from '../meta/component-meta.ts'
import {
  buildComponentMeta,
  COMPONENT_META_PATH,
  COMPONENT_META_SITE_PATH,
} from '../meta/generate-component-meta.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

export interface MetaViolation {
  rule: 'freshness' | 'coverage' | 'schema' | 'ratchet' | 'reachability'
  level: 'error' | 'report'
  message: string
}

export interface Ceilings {
  [key: string]: { ceiling: number } | string
}

const CEILINGS_PATH = join(ROOT, 'packages/tooling/src/validators/component-meta-ceilings.json')
const BUILD_REGISTRY_PATH = join(ROOT, 'apps/landing/scripts/build-registry.ts')

/** Read the ceilings file. Exported so the specs can drive it with a fabricated one. */
export function readCeilings(path: string = CEILINGS_PATH): Record<string, number> {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Ceilings
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (key === '//' || typeof value === 'string')
      continue
    out[key] = value.ceiling
  }
  return out
}

/** The nine measured debt numbers, derived from the artifact. */
export function measure(artifact: ComponentMetaArtifact, publicSymbols: Set<string>): Record<string, number> {
  const t = artifact.totals
  const recorded = new Set(artifact.components.map(c => c.name))
  const publicRecords = artifact.components.filter(c => c.kind === 'public-component')
  return {
    unclassifiable: t.unclassifiable,
    unresolvedTypes: t.unresolvedTypes,
    publicComponentsWithoutRecord: [...publicSymbols].filter(s => !recorded.has(s)).length,
    propsWithoutDescription: t.props - t.propsWithDescription,
    slotsWithoutDescription: t.slots - t.slotsWithDescription,
    eventsWithoutDescription: t.events - t.eventsWithDescription,
    exposedWithoutDescription: t.exposed - t.exposedWithDescription,
    publicComponentsWithoutExample: publicRecords.filter(c => c.stories.primary === undefined).length,
    componentsWithoutStaticTemplate: artifact.components.filter(
      c => c.stories.primary?.template === undefined,
    ).length,
  }
}

/**
 * Clause group 1 — **freshness**, on its own so more than one gate can run it.
 *
 * Lifted out of the CLI block verbatim by TASK-N2-D1, which needs the identical
 * comparison before it writes 208 documentation pages: a docs site rendered
 * from a stale artifact publishes API facts the source no longer has, which is
 * precisely the drift this artifact exists to prevent. Extracting it is what
 * "reuse `validate:component-meta`" means — the alternative is a second
 * freshness implementation, i.e. constraint **B9**'s failure mode wearing a
 * different hat.
 *
 * `fresh` must be the artifact returned by `buildComponentMeta()` — a real
 * re-extraction from source, not the committed file.
 *
 * @param fresh - A fresh extraction to compare the committed file against.
 * @param committedPath - The committed artifact. Defaults to the canonical path.
 */
export function checkFreshness(
  fresh: ComponentMetaArtifact,
  committedPath: string = COMPONENT_META_PATH,
): MetaViolation[] {
  if (!existsSync(committedPath)) {
    return [{
      rule: 'freshness',
      level: 'error',
      message: 'packages/core/docs/component-meta.json does not exist. Run `yarn generate:component-meta`.',
    }]
  }
  const committed = readFileSync(committedPath, 'utf8')
  if (stripProvenance(committed) === stripProvenance(serializeComponentMeta(fresh)))
    return []
  return [{
    rule: 'freshness',
    level: 'error',
    message: 'packages/core/docs/component-meta.json is STALE — it disagrees with a fresh '
      + 'extraction of the sources. Run `yarn generate:component-meta` and commit the result.',
  }]
}

/**
 * The content clauses. Pure — this is what the unit tests drive with fabricated
 * artifacts, so every clause below is reachable without touching the repo.
 */
export function checkComponentMeta(
  artifact: ComponentMetaArtifact,
  publicSymbols: Set<string>,
  ceilings: Record<string, number>,
  buildRegistrySource: string | null,
): MetaViolation[] {
  const violations: MetaViolation[] = []

  // ── 2. coverage ────────────────────────────────────────────────────────────
  const recorded = new Set(artifact.components.map(c => c.name))
  const missing = [...publicSymbols].filter(s => !recorded.has(s)).sort()
  if (missing.length > 0) {
    violations.push({
      rule: 'coverage',
      level: 'error',
      message: `${missing.length} public component(s) have no metadata record: ${missing.join(', ')}. `
        + `Every consumer surface reads this artifact, so a missing record is a component that `
        + `does not exist as far as the docs site, llms.txt and every MCP client are concerned.`,
    })
  }

  // ── 3. schema ──────────────────────────────────────────────────────────────
  for (const c of artifact.components) {
    if (c.extractionError !== undefined) {
      // Reported, not failed, at this level: the `unclassifiable` ratchet is the
      // gate. Naming the component and its error here is what makes that number
      // actionable instead of a bare count.
      violations.push({
        rule: 'schema',
        level: 'report',
        message: `${c.name}: vue-component-meta could not process it — ${c.extractionError}`,
      })
      continue
    }
    if (typeof c.family !== 'string' || c.family === '' || c.family === 'unknown') {
      violations.push({
        rule: 'schema',
        level: 'error',
        message: `${c.name} has no resolved family. A prop table cannot be filed under a family that does not exist.`,
      })
    }
    if (!Array.isArray(c.props) || !Array.isArray(c.events) || !Array.isArray(c.slots)) {
      violations.push({
        rule: 'schema',
        level: 'error',
        message: `${c.name} is missing one of props/events/slots. D1 renders all three.`,
      })
      continue
    }
    for (const p of c.props) {
      const described = p.description !== ''
      const claimed = p.descriptionSource !== 'none'
      if (described !== claimed) {
        violations.push({
          rule: 'schema',
          level: 'error',
          message: `${c.name}.${p.name}: description and descriptionSource disagree `
            + `(description ${described ? 'present' : 'empty'}, source "${p.descriptionSource}"). `
            + `A renderer trusts descriptionSource to say which prose it is showing.`,
        })
      }
    }
    for (const e of c.events) {
      const described = e.description !== ''
      const claimed = e.descriptionSource !== 'none'
      if (described !== claimed) {
        violations.push({
          rule: 'schema',
          level: 'error',
          message: `${c.name} event ${e.name}: description and descriptionSource disagree.`,
        })
      }
    }
    if (c.stories.primary !== undefined && c.stories.primary.source.trim() === '') {
      violations.push({
        rule: 'schema',
        level: 'error',
        message: `${c.name}: the primary example has an empty source slice. An example must be `
          + `real story source; an empty one is worse than an absent one.`,
      })
    }
  }

  // ── 4. ratchets ────────────────────────────────────────────────────────────
  const measured = measure(artifact, publicSymbols)
  for (const [key, value] of Object.entries(measured)) {
    const ceiling = ceilings[key]
    if (ceiling === undefined) {
      violations.push({
        rule: 'ratchet',
        level: 'error',
        message: `no ceiling declared for \`${key}\` (measured ${value}). Add it to `
          + `packages/tooling/src/validators/component-meta-ceilings.json with a reason.`,
      })
      continue
    }
    if (value > ceiling) {
      violations.push({
        rule: 'ratchet',
        level: 'error',
        message: `\`${key}\` is ${value}, above the ceiling of ${ceiling}. Ratchets move one way only.`,
      })
    }
    else if (value < ceiling) {
      violations.push({
        rule: 'ratchet',
        level: 'error',
        message: `\`${key}\` fell to ${value} (ceiling ${ceiling}). Lower \`${key}.ceiling\` in `
          + `packages/tooling/src/validators/component-meta-ceilings.json to ${value} so the `
          + `progress is recorded and cannot be given back.`,
      })
    }
  }

  // ── 5. reachability ────────────────────────────────────────────────────────
  if (buildRegistrySource === null) {
    violations.push({
      rule: 'reachability',
      level: 'report',
      message: `apps/landing/scripts/build-registry.ts is absent — cannot verify that the `
        + `deployed site serves ${COMPONENT_META_SITE_PATH}.`,
    })
  }
  // Matching the CALL, not the string. The first version of this clause looked
  // for the substring `component-meta.json`, and the seeded run that deleted the
  // copy stayed GREEN: the path constant and its comment still mentioned the
  // filename. A reachability clause satisfied by a comment is not a clause.
  else if (!/await\s+copyFile\(\s*COMPONENT_META_SRC\b/.test(buildRegistrySource)
    || !/resolve\(\s*OUT_DIR\s*,\s*'component-meta\.json'\s*\)/.test(buildRegistrySource)) {
    violations.push({
      rule: 'reachability',
      level: 'error',
      message: `apps/landing/scripts/build-registry.ts does not copy component-meta.json into /r/. `
        + `It wipes and rewrites that directory on every build, so without the copy the deployed `
        + `site 404s on ${COMPONENT_META_SITE_PATH} and every MCP client loses search_components, `
        + `get_component_metadata and get_component_example in production while they keep working locally.`,
    })
  }

  return violations
}

/** The `public-component` symbols the ownership manifest declares. */
export function readPublicSymbols(): Set<string> {
  const path = join(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
  if (!existsSync(path))
    return new Set()
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as {
    entries: { symbol: string, kind: string }[]
  }
  return new Set(manifest.entries.filter(e => e.kind === 'public-component').map(e => e.symbol))
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const { artifact: fresh, warnings } = buildComponentMeta()
  const publicSymbols = readPublicSymbols()
  const ceilings = readCeilings()
  const buildRegistrySource = existsSync(BUILD_REGISTRY_PATH)
    ? readFileSync(BUILD_REGISTRY_PATH, 'utf8')
    : null

  const violations = [
    ...checkComponentMeta(fresh, publicSymbols, ceilings, buildRegistrySource),
    ...checkFreshness(fresh),
  ]

  for (const w of warnings)
    console.warn(`  ! ${w}`)

  const t = fresh.totals
  const measured = measure(fresh, publicSymbols)
  console.warn('Component metadata — TASK-N2-A2\n')
  console.warn(`  ${t.components} components: ${t.publicComponents} public-component, `
    + `${t.compoundParts} compound-part; ${t.unclassifiable} unclassifiable`)
  console.warn(`  extractor: ${fresh.extractor}`)
  console.warn('')
  console.warn('  field      total  described  source')
  console.warn(`  props     ${String(t.props).padStart(6)}${String(t.propsWithDescription).padStart(11)}  vue-component-meta`)
  console.warn(`  events    ${String(t.events).padStart(6)}${String(t.eventsWithDescription).padStart(11)}  `
    + `${t.eventsFromExtractor} extractor + ${t.eventsFromEmitsInterface} emits-interface`)
  console.warn(`  slots     ${String(t.slots).padStart(6)}${String(t.slotsWithDescription).padStart(11)}  vue-component-meta`)
  console.warn(`  exposed   ${String(t.exposed).padStart(6)}${String(t.exposedWithDescription).padStart(11)}  none exist in source`)
  console.warn('')
  console.warn(`  examples: ${t.componentsWithPrimaryExample}/${t.components} have a real story source; `
    + `${t.componentsWithStaticTemplate} also yield a paste-ready template`)

  const reports = violations.filter(v => v.level === 'report')
  for (const v of reports)
    console.warn(`  ! ${v.message}`)

  const errors = violations.filter(v => v.level === 'error')
  if (errors.length === 0) {
    console.warn(`\n  ratchets: ${Object.entries(measured).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
    console.warn('\n✓ component-meta: fresh, complete for all '
      + `${t.publicComponents} public components, and every debt number at its ceiling.`)
    process.exit(0)
  }

  console.error('')
  const shown = showAll ? errors : errors.slice(0, 40)
  for (const v of shown)
    console.error(`✗ [${v.rule}] ${v.message}`)
  if (shown.length < errors.length)
    console.error(`  … and ${errors.length - shown.length} more (run with --all).`)
  console.error(`\n${errors.length} component-meta violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
