/**
 * `yarn validate:provider-defaults` (TASK-R5-O3, owner decisions D32(a) and
 * D33(a)).
 *
 * ADR-20 §6 says every component resolves its `size` / `tone` / `variant`
 * through one precedence chain — instance → per-component default → shared
 * axis → literal — "so no component invents its own order". The provider has
 * implemented that chain since TASK-OSS-P4-02. Adopting it is the hard part,
 * and it has two failure modes this gate turns into facts a build can see.
 *
 * ## Clause 1 — every adopter has an audit row (D32(a))
 *
 * Adopting `useDzDefaults` means moving each axis's literal out of
 * `withDefaults` so `props.x` can be `undefined`. Every `data-*` binding, `v-if`
 * branch, lookup map or forwarded prop still reading the RAW prop then silently
 * loses its value the moment a host configures the axis — no type error, no
 * failing render. TASK-R5-O3's third session measured it: 13 of 18 adopters hid
 * such a reader, and the per-component suites asserted none of them.
 *
 * The mitigation is the table-driven raw-binding audit in
 * `packages/core/src/composables/provider/provider-adoption.spec.ts`
 * (`adoptionCases`), which asserts each axis twice: the pre-adoption literal
 * with no provider, and the configured value under one. A table only protects
 * the components that are in it, so this clause makes a row **mandatory**: every
 * `useDzDefaults` consumer in the GENERATED `component-meta.json` (its
 * `providerHooks`, re-derived from source by `validate:component-meta`, the link
 * before this one) must be mounted by a row that can fail (a non-empty
 * `configured` map, a `classToken` or an `appearsWhenConfigured`), a row naming
 * a component that no longer consumes the context is stale, and the table must
 * still be executed by a `describe.each(adoptionCases)`. The consumer list is
 * read from the artifact, never hand-kept.
 *
 * ## Clause 2 — the unadopted residual is a downward-only ratchet (D33(a))
 *
 * "Components declaring a canonical axis that do not resolve through
 * `useDzDefaults`" was 79 of 101 when TASK-R5-O3 last measured it by hand. A
 * hand-measured number goes stale the day after it is written (D27's hand-typed
 * 19 had already undercounted by four times), so this clause measures it from the
 * artifact on every run and holds it under a ceiling that fails when it RISES
 * and when it FALLS without the ceiling being lowered — the same rule
 * `component-meta-ceilings.json` and `page-contract-ceilings.json` run on.
 *
 * Some components declare an axis that must NOT resolve through the provider.
 * Those are listed in the ceilings file with a reason and the decision that
 * argued it; an exclusion with no reason is refused, and an exclusion that no
 * longer matches the artifact (the component resolves now, or no longer declares
 * the axis) is stale and fails. An exclusion is an argument, not an exemption
 * list.
 *
 * ### What counts as a canonical axis
 *
 * A prop named `size`, `tone` or `variant` whose declared type, with `undefined`
 * removed, is neither empty nor numeric. That excludes two shapes that are not
 * a design-system axis at all: `DzQRCode.size` is a pixel count (`number`), and
 * the `variant?: never` that `@dzup-ui/contracts` stamps on controls with no
 * variant family extracts as a bare `undefined`. Everything else counts —
 * including component-specific unions such as `TextSize` or `DialogContentSize`,
 * because ADR-20 §6's per-component map (`defaults.DzText.size`) reaches those
 * too.
 *
 * Provider writers (`packages/core/src/providers/`) are not consumers of the
 * context they write and are never counted by either clause.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/provider-defaults.ts
 *   tsx packages/tooling/src/validators/provider-defaults.ts --all   # list the residual
 *
 * Exit code 1 on any violation.
 *
 * @module @dzup-ui/tooling/validators/provider-defaults
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { COMPONENT_META_PATH } from '../meta/generate-component-meta.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** The ceilings and exclusions. Data, not code — the shape every other ratchet uses. */
export const PROVIDER_DEFAULTS_CEILINGS_PATH = join(ROOT, 'packages/tooling/src/validators/provider-defaults-ceilings.json')

/** The spec that carries the raw-binding audit table (D32). */
export const ADOPTION_SPEC_PATH = join(ROOT, 'packages/core/src/composables/provider/provider-adoption.spec.ts')

/** The published reader whose consumers this gate governs. */
export const DEFAULTS_HOOK = 'useDzDefaults'

/** Where the provider writers live. A writer is not a consumer. */
const WRITER_DIR = 'packages/core/src/providers/'

export const CANONICAL_AXES = ['size', 'tone', 'variant'] as const
export type CanonicalAxis = typeof CANONICAL_AXES[number]

/** One argued exclusion from the residual. */
export interface DefaultsExclusion {
  component: string
  axes: CanonicalAxis[]
  /** Why resolving this axis through the provider would be wrong. Required. */
  reason: string
  /** The owner decision that argued it, e.g. `D31`. */
  decision?: string
}

/** The ceilings file's shape. `//` keys are prose and are ignored. */
export interface ProviderDefaultsCeilings {
  residual: { ceiling: number }
  exclusions: DefaultsExclusion[]
}

export interface ProviderDefaultsViolation {
  rule: 'audit-row' | 'audit-row-stale' | 'audit-table' | 'ratchet' | 'exclusion'
  message: string
}

/** Read the ceilings file. Exported so the specs can drive the checks with a fabricated one. */
export function readProviderDefaultsCeilings(path: string = PROVIDER_DEFAULTS_CEILINGS_PATH): ProviderDefaultsCeilings {
  return JSON.parse(readFileSync(path, 'utf8')) as ProviderDefaultsCeilings
}

/** True for `DzProvider` and anything else that WRITES the provider contexts. */
export function isProviderWriter(record: Pick<ComponentMetaRecord, 'source'>): boolean {
  return record.source.replace(/\\/g, '/').startsWith(WRITER_DIR)
}

/** The components that call `useDzDefaults`, read from the artifact, sorted. */
export function defaultsConsumers(artifact: ComponentMetaArtifact): string[] {
  return artifact.components
    .filter(r => !isProviderWriter(r) && (r.providerHooks ?? []).includes(DEFAULTS_HOOK))
    .map(r => r.name)
    .sort()
}

/**
 * The canonical axes one record declares.
 *
 * `undefined` is stripped from the type first; what is left must be non-empty
 * and must not name `number` (see the module header for the two shapes this
 * rules out).
 */
export function canonicalAxes(record: Pick<ComponentMetaRecord, 'props'>): CanonicalAxis[] {
  const out: CanonicalAxis[] = []
  for (const axis of CANONICAL_AXES) {
    const prop = record.props.find(p => p.name === axis)
    if (prop === undefined)
      continue
    const members = prop.type
      .split('|')
      .map(part => part.trim())
      .filter(part => part !== '' && part !== 'undefined')
    if (members.length === 0 || members.some(part => /\bnumber\b/.test(part)))
      continue
    out.push(axis)
  }
  return out
}

/** What the audit table in `provider-adoption.spec.ts` covers. */
export interface AuditTable {
  /** Distinct components mounted by at least one row that ASSERTS something, sorted. */
  rows: string[]
  /** Components whose every row asserts nothing (empty `configured`, no `classToken`, no `appearsWhenConfigured`), sorted. */
  vacuous: string[]
  /** Whether a `describe.each(adoptionCases)` actually executes the table. */
  executed: boolean
}

/**
 * Read the `adoptionCases` table out of the spec source.
 *
 * Source text, not an import: `packages/tooling` may not depend on
 * `@dzup-ui/*`, and importing a spec would execute it. The table is the
 * top-level `const adoptionCases… = [` literal, which the repository's lint
 * formatting closes with a `]` at column 0 and whose rows open with a `{` at
 * two spaces; each row names what it mounts in a `component: DzName` field.
 * Test titles are deliberately NOT read — a row titled
 * `DzProgress (circular geometry)` mounts `DzProgress`, and the mount is what
 * the audit is about.
 *
 * A row only counts when it can fail: it needs a non-empty `configured` map, a
 * `classToken` pair or an `appearsWhenConfigured` selector. A row with none of
 * the three mounts the component and asserts nothing, which would satisfy a
 * presence check while auditing nothing.
 *
 * Returns `null` when the table is absent altogether.
 */
export function readAuditTable(specSource: string): AuditTable | null {
  const start = specSource.search(/^const adoptionCases\b[^=]*=\s*\[/m)
  if (start === -1)
    return null
  const rest = specSource.slice(start)
  const end = rest.search(/^\]/m)
  const body = end === -1 ? rest : rest.slice(0, end)

  const asserting = new Set<string>()
  const mounted = new Set<string>()
  for (const chunk of body.split(/^ {2}\{\s*$/m)) {
    const component = /\bcomponent:\s*(Dz\w+)\b/.exec(chunk)?.[1]
    if (component === undefined)
      continue
    mounted.add(component)
    const asserts = /\bclassToken:\s*\[/.test(chunk)
      || /\bappearsWhenConfigured:\s*['"`]/.test(chunk)
      || /\bconfigured:\s*\{\s*[^}\s]/.test(chunk)
    if (asserts)
      asserting.add(component)
  }
  return {
    rows: [...asserting].sort(),
    vacuous: [...mounted].filter(c => !asserting.has(c)).sort(),
    executed: /\bdescribe\.each\(\s*adoptionCases\s*\)/.test(specSource),
  }
}

/** The residual, measured. Every list is sorted component names. */
export interface ResidualMeasurement {
  /** Components declaring at least one canonical axis. */
  axisBearing: string[]
  /** …of which call `useDzDefaults`. */
  resolving: string[]
  /** …of which do not. The number D33 quoted by hand. */
  unresolved: string[]
  /** Unresolved components every one of whose axes is excluded with a reason. */
  excluded: string[]
  /** `unresolved` minus `excluded` — the ratcheted number. */
  residual: string[]
}

/**
 * Measure the ADR-20 §6 residual from the artifact.
 *
 * Exclusion is per axis: a component is excluded only when EVERY canonical
 * axis it declares is covered by an exclusion. Excluding a component's `tone`
 * because it is per-item data must not quietly excuse its `size`.
 */
export function measureResidual(
  artifact: ComponentMetaArtifact,
  exclusions: readonly DefaultsExclusion[],
): ResidualMeasurement {
  const excludedAxes = new Map<string, Set<CanonicalAxis>>()
  for (const e of exclusions)
    excludedAxes.set(e.component, new Set([...(excludedAxes.get(e.component) ?? []), ...e.axes]))

  const axisBearing: string[] = []
  const resolving: string[] = []
  const unresolved: string[] = []
  const excluded: string[] = []
  const residual: string[] = []

  for (const record of artifact.components) {
    if (isProviderWriter(record))
      continue
    const axes = canonicalAxes(record)
    if (axes.length === 0)
      continue
    axisBearing.push(record.name)
    if ((record.providerHooks ?? []).includes(DEFAULTS_HOOK)) {
      resolving.push(record.name)
      continue
    }
    unresolved.push(record.name)
    const covered = excludedAxes.get(record.name)
    if (covered !== undefined && axes.every(axis => covered.has(axis)))
      excluded.push(record.name)
    else
      residual.push(record.name)
  }

  const sort = (list: string[]): string[] => list.sort()
  return {
    axisBearing: sort(axisBearing),
    resolving: sort(resolving),
    unresolved: sort(unresolved),
    excluded: sort(excluded),
    residual: sort(residual),
  }
}

/**
 * Every violation. Pure — the specs drive each clause with fabricated inputs.
 *
 * @param artifact the generated component metadata (freshness is `validate:component-meta`'s job)
 * @param specSource the source of `provider-adoption.spec.ts`, or `null` when the file is absent
 * @param ceilings the residual ceiling and the argued exclusions
 */
export function checkProviderDefaults(
  artifact: ComponentMetaArtifact,
  specSource: string | null,
  ceilings: ProviderDefaultsCeilings,
): ProviderDefaultsViolation[] {
  const violations: ProviderDefaultsViolation[] = []
  const specPath = 'packages/core/src/composables/provider/provider-adoption.spec.ts'
  const ceilingsPath = 'packages/tooling/src/validators/provider-defaults-ceilings.json'

  // ── 1. D32(a): every useDzDefaults consumer has a raw-binding audit row ────
  const consumers = defaultsConsumers(artifact)
  const table = specSource === null ? null : readAuditTable(specSource)
  if (table === null) {
    violations.push({
      rule: 'audit-table',
      message: `${specSource === null ? `${specPath} does not exist` : `${specPath} has no \`adoptionCases\` table`}, `
        + `so none of the ${consumers.length} \`${DEFAULTS_HOOK}\` consumers is audited. The table is what `
        + 'catches a `data-*` binding, `v-if` branch or forwarded prop left on the raw prop (TASK-R5-O3 D32).',
    })
  }
  else {
    if (!table.executed) {
      violations.push({
        rule: 'audit-table',
        message: `${specPath} declares \`adoptionCases\` but no \`describe.each(adoptionCases)\` runs it. `
          + 'A table nothing executes audits nothing.',
      })
    }
    const rows = new Set(table.rows)
    const vacuous = new Set(table.vacuous)
    for (const name of consumers.filter(c => !rows.has(c))) {
      violations.push({
        rule: 'audit-row',
        message: vacuous.has(name)
          ? `${name}'s raw-binding audit row asserts nothing: its \`configured\` map is empty and it has no `
          + '`classToken` or `appearsWhenConfigured`, so it mounts the component and cannot fail. Assert the '
          + 'configured value of every reader of every adopted axis.'
          : `${name} calls \`${DEFAULTS_HOOK}\` (component-meta.json providerHooks) and has no row in the `
            + `raw-binding audit (\`adoptionCases\` in ${specPath}). Add one that mounts it with no provider `
            + '(the pre-adoption literal) and under a per-component default (the configured value) for every '
            + 'reader of every adopted axis — the root attributes, and any `v-if`, lookup map, class ladder, '
            + 'provided ref or forwarded prop no root attribute can see.',
      })
    }
    const consumerSet = new Set(consumers)
    for (const name of [...table.rows, ...table.vacuous].sort().filter(r => !consumerSet.has(r))) {
      violations.push({
        rule: 'audit-row-stale',
        message: `The raw-binding audit mounts ${name}, which does not call \`${DEFAULTS_HOOK}\` according to `
          + 'component-meta.json. Either the adoption was reverted (restore it) or the row is stale (delete it).',
      })
    }
  }

  // ── 2. D33(a): exclusions are argued and current ───────────────────────────
  const byName = new Map(artifact.components.map(r => [r.name, r]))
  const seen = new Set<string>()
  for (const e of ceilings.exclusions) {
    const label = `exclusion \`${e.component}\` (${e.axes.join(', ')})`
    if (seen.has(e.component)) {
      violations.push({ rule: 'exclusion', message: `${label} is listed twice. One entry per component.` })
      continue
    }
    seen.add(e.component)
    if (typeof e.reason !== 'string' || e.reason.trim().length < 20) {
      violations.push({
        rule: 'exclusion',
        message: `${label} carries no reason. An exclusion is an argument for why the provider must NOT reach `
          + 'that axis; without one it is a place work goes to be forgotten.',
      })
    }
    if (e.axes.length === 0 || e.axes.some(axis => !(CANONICAL_AXES as readonly string[]).includes(axis))) {
      violations.push({
        rule: 'exclusion',
        message: `${label} must name at least one of ${CANONICAL_AXES.join(' / ')}.`,
      })
      continue
    }
    const record = byName.get(e.component)
    if (record === undefined) {
      violations.push({
        rule: 'exclusion',
        message: `${label} is stale: component-meta.json has no record named ${e.component}. Delete the entry.`,
      })
      continue
    }
    if ((record.providerHooks ?? []).includes(DEFAULTS_HOOK)) {
      violations.push({
        rule: 'exclusion',
        message: `${label} is stale: ${e.component} now calls \`${DEFAULTS_HOOK}\`. Delete the entry — or, if `
          + 'the adoption contradicts the argument recorded in it, revert the adoption.',
      })
    }
    const declared = canonicalAxes(record)
    const undeclared = e.axes.filter(axis => !declared.includes(axis))
    if (undeclared.length > 0) {
      violations.push({
        rule: 'exclusion',
        message: `${label} is stale: ${e.component} no longer declares ${undeclared.join(', ')} as a canonical `
          + 'axis. Remove it from the entry.',
      })
    }
  }

  // ── 3. D33(a): the residual ratchet ────────────────────────────────────────
  const measured = measureResidual(artifact, ceilings.exclusions)
  const now = measured.residual.length
  const ceiling = ceilings.residual?.ceiling
  if (typeof ceiling !== 'number') {
    violations.push({
      rule: 'ratchet',
      message: `No residual ceiling is recorded (measured ${now}). Add \`residual.ceiling\` to ${ceilingsPath}.`,
    })
  }
  else if (now > ceiling) {
    violations.push({
      rule: 'ratchet',
      message: `The ADR-20 §6 residual ROSE ${ceiling} → ${now}: a component declares a canonical axis and does not `
        + `resolve it through \`${DEFAULTS_HOOK}\`. Adopt it (see the D27 pattern in the TASK-R5-O3 handoff), or `
        + `argue an exclusion in ${ceilingsPath}. Ratchets move one way only — do not raise the ceiling. `
        + 'Run with --all to list the residual.',
    })
  }
  else if (now < ceiling) {
    violations.push({
      rule: 'ratchet',
      message: `The ADR-20 §6 residual FELL ${ceiling} → ${now}. Lower \`residual.ceiling\` in ${ceilingsPath} `
        + `to ${now} so the progress is recorded and cannot be given back.`,
    })
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  if (!existsSync(COMPONENT_META_PATH)) {
    console.error('✗ packages/core/docs/component-meta.json does not exist. Run `yarn generate:component-meta`.')
    process.exit(1)
  }
  const artifact = JSON.parse(readFileSync(COMPONENT_META_PATH, 'utf8')) as ComponentMetaArtifact
  const specSource = existsSync(ADOPTION_SPEC_PATH) ? readFileSync(ADOPTION_SPEC_PATH, 'utf8') : null
  const ceilings = readProviderDefaultsCeilings()

  const violations = checkProviderDefaults(artifact, specSource, ceilings)
  const consumers = defaultsConsumers(artifact)
  const table = specSource === null ? null : readAuditTable(specSource)
  const m = measureResidual(artifact, ceilings.exclusions)

  console.warn('Provider defaults adoption — TASK-R5-O3 (D32(a), D33(a))\n')
  console.warn(`  ${DEFAULTS_HOOK} consumers (component-meta.json, writers excluded): ${consumers.length}`)
  console.warn(`  raw-binding audit rows: ${table?.rows.length ?? 0} components`
    + `${(table?.vacuous.length ?? 0) > 0 ? ` (+${table!.vacuous.length} asserting nothing)` : ''}`
    + `${table?.executed === false ? ' (NOT executed)' : ''}`)
  console.warn(`  canonical-axis components: ${m.axisBearing.length} · resolving ${m.resolving.length} · `
    + `unresolved ${m.unresolved.length} · excluded ${m.excluded.length} · residual ${m.residual.length} `
    + `(ceiling ${ceilings.residual?.ceiling ?? '—'})`)
  if (showAll) {
    console.warn(`\n  excluded: ${m.excluded.join(', ') || '—'}`)
    console.warn(`  residual: ${m.residual.join(', ') || '—'}`)
  }

  if (violations.length === 0) {
    console.warn('\n✓ provider-defaults: every consumer is audited, every exclusion is argued and current, '
      + 'and the residual is at its ceiling.')
    process.exit(0)
  }

  console.error('')
  for (const v of violations)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${violations.length} provider-defaults violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
