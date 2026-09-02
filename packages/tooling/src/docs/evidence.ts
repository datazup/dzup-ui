/**
 * The docs site's evidence layer (TASK-N2-D2).
 *
 * D1 published what the library *is*: 144 generated component pages whose prop,
 * event, slot and expose tables are a projection of
 * `packages/core/docs/component-meta.json`. Its handoff §8b recorded, as a
 * deliberate absence, that *"per-component accessibility, browser and AT
 * evidence is **not** on this site"* and that inventing a green badge for it
 * "would be the single most damaging thing this packet could do"*.
 *
 * This module is the other half: what the library has actually been *measured*
 * to do. It renders from the generated evidence artifacts and from nothing else.
 *
 * ## Three rules this module exists to obey
 *
 * 1. **`unrun` and `stale` are printed BY NAME** (README §3 `<evidence_rules>`).
 *    A page saying "18 evidence cells" while hiding which two are unrun would be
 *    the first dishonest thing on this site. Every table here names them.
 * 2. **Nothing may become a green badge for evidence that has not run.** There
 *    are no badges in this module. There are states, and `unrun` renders as
 *    `unrun`.
 * 3. **The AT state is read from the RAW scaffold, never from the `at-manual`
 *    capability cell.** TASK-N1-O4 §6.2 measured that
 *    `generate-capability-matrix.ts` resolves that cell with
 *    `entry.rows.filter(r => r.result !== 'unrun')` and **never inspects the
 *    result value**, so a component whose every AT pair FAILED resolves to
 *    `state: 'pass'`. `CellState` has no `fail` value, so repairing it is a
 *    schema decision five packets read — an owner call, not this packet's. Until
 *    it is closed, this module reads `e2e/at-matrix/index.json` directly and
 *    {@link atManualTripwire} refuses to generate a page whose `at-manual` cell
 *    claims more than the raw rows support.
 *
 * ## Why it reads the artifacts and not `record.capability`
 *
 * `component-meta.json`'s `CapabilityJoin` is a *summary*: `cells` is a count
 * per state, plus `unrun`/`stale` by name. It carries no per-cell `origin`, no
 * `note`, no `artifacts` and no WCAG list — everything a reader needs in order
 * to check the claim rather than take it. So the join is used as a **cross-check
 * only** ({@link crossCheckCapabilityJoin}): if the summary in one artifact
 * disagrees with the matrix in another, one of them was regenerated without the
 * other and the build stops.
 *
 * @module @dzup-ui/tooling/docs/evidence
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'

// ---------------------------------------------------------------------------
// Artifact shapes — read-only views, only the fields this module uses
// ---------------------------------------------------------------------------

/** One WCAG 2.2 success criterion, from the quality matrix's own dictionary. */
export interface WcagCriterionRef {
  id: string
  name: string
  level: string
  since: string
}

/** One row of `packages/core/docs/quality-matrix.json`. */
export interface QualityRow {
  component: string
  family: string
  tier: string
  pattern: string
  patternJustification?: string
  securityBoundary: string
  boundaryJustification?: string
  traits: string[]
  wcag: string[]
  evidence: string[]
  evidenceOrigin: Record<string, string>
  exceptions?: Record<string, string>
  /** Compound sub-parts. They are documented on the parent's page and are NOT matrix rows. */
  parts?: string[]
  hasAnatomy?: boolean
}

/** `packages/core/docs/quality-matrix.json`. */
export interface QualityMatrix {
  schemaVersion: string
  sourceCommit: string
  generatedFrom: string[]
  rules: { tierIncrement: Record<string, string[]>, traitEvidence: Record<string, string[]>, boundaryEvidence: Record<string, string[]> }
  wcag: WcagCriterionRef[]
  components: QualityRow[]
}

/** One evidence cell of the capability matrix. */
export interface CapabilityCell {
  kind: string
  origin: string
  scope: string
  state: string
  artifacts?: string[]
  note?: string
}

/** One row of `packages/core/docs/capability-matrix.json`. */
export interface CapabilityRow {
  component: string
  family: string
  tier: string
  pattern: string
  securityBoundary: string
  traits: string[]
  anatomy: string
  source: string
  componentCommit: string
  cells: CapabilityCell[]
}

/** `packages/core/docs/capability-matrix.json`. */
export interface CapabilityMatrix {
  schemaVersion: string
  sourceCommit: string
  generatedFrom: string[]
  inputs: Record<string, { available: boolean, path: string, note?: string }>
  totals: Record<string, Record<string, number>>
  rows: CapabilityRow[]
}

/** One declared AT/browser pairing. */
export interface AtPair {
  id: string
  at: string
  browser: string
  platform: string
  purpose: string
}

/** One append-only AT run record. `result` is `unrun` until a human writes otherwise. */
export interface AtRow {
  pair: string
  result: string
  versions: string
  tester: string
  date: string
  sourceCommit: string
  notes: string
}

/** One component's AT scaffold entry. */
export interface AtEntry {
  component: string
  tier: string
  pattern: string
  file: string
  tasks: string[]
  rows: AtRow[]
  componentCommit: string
}

/** `e2e/at-matrix/index.json`. */
export interface AtIndex {
  schemaVersion: string
  generatedFrom: string[]
  pairs: AtPair[]
  entries: AtEntry[]
}

/** One engine's record in `e2e/matrix/engine-ratchets.json`. */
export interface EngineRecord {
  version: string
  conditionsRun: string[]
  notReproducing: unknown[]
  engineOnly: unknown[]
  summary: {
    inLane: number
    runnableTargets: number
    declaredUnrunTargets: number
    cellsRun: number
    passed: number
    unexpectedFailure: number
    exitCode: number
    wallClock: string
    ranAt: string
  }
  note?: string
}

/** `e2e/matrix/engine-ratchets.json` — the per-engine browser lane record. */
export interface EngineRatchets {
  schemaVersion: string
  measuredAt: string
  sourceCommit: string
  worktreeDirty: boolean
  admissibility: string
  playwrightVersion: string
  platform: string
  method: string
  engines: Record<string, EngineRecord>
  crossEngineResult: {
    measuredAt: string
    ledgerEntries: number
    note: string
  } & Record<string, unknown>
}

/** `e2e/matrix/known-failures.json` — the cross-engine ledger. */
export interface KnownFailures {
  measuredAt: string
  entries: unknown[]
  closedAt?: string
  closedBy?: string
}

/** One audited drag surface in `packages/core/docs/wcag-deviations.json`. */
export interface WcagSurface {
  component: string
  operation: string
  keyboardAlternative: string
  singlePointerNoDrag: string | null
  state: 'met' | 'gap'
  caveat?: string
  gapReason?: string
  ownerDecision?: string
  notEssential?: string
}

/** `packages/core/docs/wcag-deviations.json`. */
export interface WcagDeviations {
  schemaVersion: string
  note: string
  recordedAt: Record<string, string>
  criterion: WcagCriterionRef & { text: string, url: string }
  scope: string
  conformanceStatement: string
  ceiling: number
  openGaps: number
  surfaces: WcagSurface[]
  followUp: string
}

/** One measured security deviation (`packages/core/security/security-deviations.json`). */
export interface SecurityDeviation {
  id: string
  component: string
  sink: string
  fixtures: string[]
  required: string
  measured: string
  severity: string
  publicBehaviourChange: boolean
  reason: string
}

/** `packages/core/security/security-deviations.json`. */
export interface SecurityDeviations {
  schemaVersion: string
  note: string
  recordedAt: Record<string, string>
  ceiling: number
  deviations: SecurityDeviation[]
}

/**
 * Everything the evidence layer renders from.
 *
 * The three `required` artifacts have no honest fallback: a page cannot say what
 * a component owes without the quality matrix, what was measured without the
 * capability matrix, or what the AT state is without the scaffold. The
 * `optional` ones are *lane records* whose absence is itself a fact worth
 * printing — N1's finding F4 is precisely that deleting one silently flips
 * cells, so this module prints the absence rather than rendering around it.
 */
export interface EvidenceSources {
  quality: QualityMatrix
  capability: CapabilityMatrix
  atMatrix: AtIndex
  wcagDeviations: WcagDeviations
  /** Absent when the browser lane has not been run in this checkout. */
  engines?: EngineRatchets
  /** Absent when the cross-engine ledger file is missing. */
  knownFailures?: KnownFailures
  /** Absent when the security corpus has not been run in this checkout. */
  securityDeviations?: SecurityDeviations
  /** The cascade-layer names, read from the one `@layer` statement in `base.css`. */
  cascadeLayers: string[]
  /** AT script files present on disk, by component name. */
  atScripts: Record<string, string>
  /** SHA-256 of each artifact's bytes, keyed by repo-relative path. */
  fingerprints: Record<string, string>
}

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

/** The APG patterns dictionary URL prefix — the contract `ApgPattern`'s doc comment states. */
export const APG_PATTERN_BASE = 'https://www.w3.org/WAI/ARIA/apg/patterns/'
/** WCAG 2.2 Understanding documents, for the SC table's links. */
export const WCAG_UNDERSTANDING = 'https://www.w3.org/WAI/WCAG22/Understanding/'

/**
 * The Understanding-document URL for a success criterion, derived from its name.
 *
 * W3C's own slug rule: lower-case the criterion name, drop parentheses and
 * commas, and join the remaining words with hyphens. Derived rather than
 * hand-listed, so a criterion added to the dictionary gets a link with no edit
 * here — and so there is no table of 38 URLs for anyone to mistype.
 *
 * The rule was verified against the four shapes the published dictionary
 * contains, rather than assumed: `Target Size (Minimum)` →
 * `target-size-minimum`, `Name, Role, Value` → `name-role-value`,
 * `Pause, Stop, Hide` → `pause-stop-hide`, and
 * `Accessible Authentication (Minimum)` → `accessible-authentication-minimum`
 * all resolve to the criterion they name.
 */
export function wcagUnderstandingUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[(),]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `${WCAG_UNDERSTANDING}${slug}.html`
}

/**
 * Patterns with no APG page. `custom` and `none` are values of `ApgPattern`, not
 * slugs — linking them would produce a 404 dressed as a citation.
 */
export const NON_APG_PATTERNS: ReadonlySet<string> = new Set(['custom', 'none'])

/** Make one value safe inside a markdown table cell. */
export function cell(value: string | undefined): string {
  if (value === undefined || value === '')
    return '—'
  return value.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim()
}

/**
 * A dash is the AT scaffold's own "nothing recorded" value, and so is an empty
 * string. Both must render as an absence, never as a value a reader might read
 * as a name.
 */
export function orAbsent(value: string | undefined): string {
  const v = (value ?? '').trim()
  return v === '' || v === '-' || v === 'n/a' || v === 'tbd' ? '—' : v
}

/** `51dec93c73214af…` → `51dec93c`. Provenance, shown short and linked to nothing. */
export function shortCommit(commit: string): string {
  return /^[0-9a-f]{8,}$/i.test(commit) ? commit.slice(0, 8) : commit
}

/** The APG link for a pattern, or `undefined` when the pattern has no APG page. */
export function apgLink(pattern: string): string | undefined {
  return NON_APG_PATTERNS.has(pattern) ? undefined : `${APG_PATTERN_BASE}${pattern}/`
}

/** Look up one component's quality row. */
export function qualityRowFor(name: string, ev: EvidenceSources): QualityRow | undefined {
  return ev.quality.components.find(c => c.component === name)
}

/** Look up one component's capability row. */
export function capabilityRowFor(name: string, ev: EvidenceSources): CapabilityRow | undefined {
  return ev.capability.rows.find(r => r.component === name)
}

/** Look up one component's AT scaffold entry. */
export function atEntryFor(name: string, ev: EvidenceSources): AtEntry | undefined {
  return ev.atMatrix.entries.find(e => e.component === name)
}

/** The measured 2.5.7 audit row for a component, when it has one. */
export function wcagSurfaceFor(name: string, ev: EvidenceSources): WcagSurface | undefined {
  return ev.wcagDeviations.surfaces.find(s => s.component === name)
}

/** Every measured security deviation for a component. */
export function securityDeviationsFor(name: string, ev: EvidenceSources): SecurityDeviation[] {
  return ev.securityDeviations?.deviations.filter(d => d.component === name) ?? []
}

/**
 * Is this the lowest tier the rulebook defines?
 *
 * Read from the artifact's own `rules.tierIncrement` key order rather than
 * assumed to be `A`: the tier vocabulary is published data, and a page that
 * hard-codes the bottom of it would be wrong the day a tier is added below.
 */
export function isBaseTier(tier: string, ev: EvidenceSources): boolean {
  return Object.keys(ev.quality.rules.tierIncrement)[0] === tier
}

// ---------------------------------------------------------------------------
// The at-manual tripwire — B-N1-AT, enforced rather than described
// ---------------------------------------------------------------------------

/**
 * Refuse to publish an `at-manual` capability cell that claims more than the raw
 * AT rows support.
 *
 * TASK-N1-O4 §6.2 proved, in memory and without fabricating a record, that the
 * capability-matrix generator resolves this cell by counting rows whose
 * `result !== 'unrun'` and never reading the value. All six pairs `fail`
 * therefore resolves to `state: 'pass'`. `CellState` has no `fail` value, so the
 * defect cannot be fixed here — but a docs site is where it would first become
 * visible to the public, and this function makes that impossible: if the cell
 * says anything other than `unrun` while a raw row says anything other than
 * `pass`, generation stops with the component named.
 *
 * Today it is silent, because 0 of 534 cells are executed. It exists for the day
 * they are not.
 *
 * @returns One message per violation. Empty means the artifacts agree.
 */
export function atManualTripwire(ev: EvidenceSources): string[] {
  const problems: string[] = []
  for (const row of ev.capability.rows) {
    const capCell = row.cells.find(c => c.kind === 'at-manual')
    if (capCell === undefined)
      continue
    const entry = atEntryFor(row.component, ev)
    if (entry === undefined) {
      if (capCell.state !== 'unrun') {
        problems.push(
          `${row.component}: the capability matrix publishes at-manual \`${capCell.state}\` but `
          + 'the AT scaffold has no entry for it at all.',
        )
      }
      continue
    }
    const executed = entry.rows.filter(r => r.result !== 'unrun')
    const nonPass = executed.filter(r => r.result !== 'pass')
    if (capCell.state !== 'unrun' && nonPass.length > 0) {
      problems.push(
        `${row.component}: the capability matrix publishes at-manual \`${capCell.state}\`, but `
        + `${nonPass.length} of ${entry.rows.length} recorded AT rows are `
        + `${[...new Set(nonPass.map(r => r.result))].sort().map(r => `\`${r}\``).join('/')}. `
        + 'This is the N1-O4 §6.2 defect (`CellState` has no `fail` value) reaching a published '
        + 'page. Fix the cell resolution before publishing AT evidence.',
      )
    }
    // The second half of the same defect: a cell that claims a state while the
    // append-only records show nothing was ever driven.
    if (capCell.state !== 'unrun' && executed.length === 0) {
      problems.push(
        `${row.component}: the capability matrix publishes at-manual \`${capCell.state}\` while all `
        + `${entry.rows.length} AT run records read \`unrun\`. No screen-reader session is recorded, `
        + 'so there is nothing for that state to be a summary of.',
      )
    }
    // And the mirror image: a real run recorded, and a matrix that has not been
    // regenerated to see it. Publishing `unrun` over a recorded result is a
    // smaller lie than the reverse, and still a lie.
    if (capCell.state === 'unrun' && executed.length > 0) {
      problems.push(
        `${row.component}: ${executed.length} AT run record(s) exist but the capability matrix still `
        + 'publishes at-manual `unrun`. Regenerate the capability matrix.',
      )
    }
  }
  return problems
}

/**
 * The capability *summary* in `component-meta.json` must agree with the
 * capability *matrix* it was joined from.
 *
 * They are two artifacts written by two generators. If one is regenerated and
 * the other is not, the component page's evidence section and the site's
 * capability page would disagree — and the reader has no way to know which is
 * right. So the build stops instead.
 */
export function crossCheckCapabilityJoin(
  artifact: ComponentMetaArtifact,
  ev: EvidenceSources,
): string[] {
  const problems: string[] = []
  for (const record of artifact.components) {
    if (record.kind !== 'public-component')
      continue
    const row = capabilityRowFor(record.name, ev)
    if (row === undefined) {
      problems.push(`${record.name} is a public component with no capability-matrix row.`)
      continue
    }
    if (qualityRowFor(record.name, ev) === undefined) {
      problems.push(`${record.name} is a public component with no quality-matrix row.`)
      continue
    }
    const join = record.capability
    if (join === undefined) {
      problems.push(`${record.name} has no \`capability\` join in component-meta.json.`)
      continue
    }
    const unrun = row.cells.filter(c => c.state === 'unrun').map(c => c.kind).sort()
    const stale = row.cells.filter(c => c.state === 'stale').map(c => c.kind).sort()
    if (unrun.join(',') !== [...join.unrun].sort().join(',')) {
      problems.push(
        `${record.name}: component-meta.json says unrun = [${[...join.unrun].sort().join(', ')}], `
        + `capability-matrix.json says [${unrun.join(', ')}]. One artifact is stale.`,
      )
    }
    if (stale.join(',') !== [...join.stale].sort().join(',')) {
      problems.push(
        `${record.name}: component-meta.json says stale = [${[...join.stale].sort().join(', ')}], `
        + `capability-matrix.json says [${stale.join(', ')}]. One artifact is stale.`,
      )
    }
  }
  return problems
}

/**
 * The 2.5.7 audit must cover exactly the components the `drags` trait names.
 *
 * The register is transcribed prose, so it is the one place in this packet where
 * a fact could rot. Binding it to a generated trait means a tenth drag surface —
 * or a component losing the trait — fails the build instead of quietly leaving a
 * conformance statement that is no longer true.
 */
export function crossCheckWcagDeviations(ev: EvidenceSources): string[] {
  const problems: string[] = []
  const audited = ev.wcagDeviations.surfaces.map(s => s.component).sort()
  const drags = ev.quality.components.filter(c => c.traits.includes('drags')).map(c => c.component).sort()
  if (audited.join(',') !== drags.join(',')) {
    problems.push(
      `wcag-deviations.json audits [${audited.join(', ')}] but the \`drags\` trait names `
      + `[${drags.join(', ')}]. The SC 2.5.7 audit and the trait must cover the same set.`,
    )
  }
  const gaps = ev.wcagDeviations.surfaces.filter(s => s.state === 'gap')
  if (gaps.length !== ev.wcagDeviations.openGaps) {
    problems.push(
      `wcag-deviations.json declares openGaps = ${ev.wcagDeviations.openGaps} but `
      + `${gaps.length} surface(s) are in state \`gap\`.`,
    )
  }
  if (gaps.length > ev.wcagDeviations.ceiling) {
    problems.push(
      `wcag-deviations.json has ${gaps.length} open gap(s) against a ceiling of `
      + `${ev.wcagDeviations.ceiling}. Ratchets move one way only.`,
    )
  }
  for (const surface of ev.wcagDeviations.surfaces) {
    if (surface.state === 'gap' && surface.singlePointerNoDrag !== null) {
      problems.push(`${surface.component} is recorded as a 2.5.7 gap yet names a single-pointer path.`)
    }
    if (surface.state === 'met' && (surface.singlePointerNoDrag ?? '') === '') {
      problems.push(`${surface.component} is recorded as meeting 2.5.7 with no single-pointer path named.`)
    }
  }
  return problems
}

// ---------------------------------------------------------------------------
// The standing note — printed on every page this packet generates
// ---------------------------------------------------------------------------

/**
 * The admissibility statement, composed from the artifacts rather than typed.
 *
 * README §3 `<evidence_rules>`: *"A green local run is 'locally qualified' —
 * never CI, release, or production evidence."* Every page carries it, because a
 * reader who lands on one page from a search result has not read the others.
 */
export function standingNote(ev: EvidenceSources): string[] {
  const dirty = ev.engines?.worktreeDirty === true
  return [
    '::: warning How far this evidence goes',
    'Every state on this page is read from a generated artifact and bound to the commit that',
    `artifact records — \`${shortCommit(ev.capability.sourceCommit)}\` for the capability matrix,`,
    `\`${shortCommit(ev.quality.sourceCommit)}\` for the quality matrix. It is **locally qualified**:`,
    `produced by a local run on one machine${
      dirty ? ', against a worktree carrying uncommitted work' : ''
    }. It is **not** continuous-integration evidence, **not** release evidence and **not**`,
    'production evidence, and it must not be read as a conformance claim.',
    ':::',
  ]
}

// ---------------------------------------------------------------------------
// Per-component: the evidence section
// ---------------------------------------------------------------------------

/**
 * Why a keyboard interaction table is not rendered, said once and precisely.
 *
 * The task's own instruction: *"where only prose exists, the section links the
 * APG pattern and marks the table 'not yet derived' rather than hand-typing
 * one."* This is that sentence, and §4 of the handoff records the measurement
 * behind it: the repository's only machine-readable keyboard signal is a
 * boolean. `generate-capability-matrix.ts` resolves `keyboard-spec` by testing
 * the unit spec against
 * `/Arrow(?:Up|Down|Left|Right)|['"]Tab['"]|['"]Escape['"]|['"]Enter['"]|keydown/`
 * — it records *that* keys are asserted, never *which* keys do *what*.
 */
export function renderKeyboardSection(quality: QualityRow, capability: CapabilityRow): string[] {
  const kbd = capability.cells.find(c => c.kind === 'keyboard-spec')
  const link = apgLink(quality.pattern)
  const lines: string[] = ['### Keyboard interaction', '']

  lines.push(
    '**Not yet derived.** This library has no machine-readable keyboard table: the only generated',
    'keyboard signal is whether a spec asserts *some* key, not which key does what. Rather than',
    'hand-type a table that nothing could check, this page links the pattern the component is held',
    'to and states what has actually been measured.',
    '',
  )

  if (link !== undefined) {
    lines.push(
      `- **Pattern:** [APG — \`${quality.pattern}\`](${link}) · its *Keyboard Interaction* section is`,
      '  the contract this component is audited against.',
    )
  }
  else {
    lines.push(
      `- **Pattern:** \`${quality.pattern}\` — **no APG pattern applies**, so there is no external`,
      `  keyboard contract to link.${
        quality.patternJustification === undefined ? '' : ' The recorded reason is quoted above.'}`,
    )
  }

  if (kbd === undefined) {
    lines.push(
      `- **Measured:** Tier ${quality.tier} does not owe a \`keyboard-spec\`, so nothing measures this`,
      '  component\'s keyboard behaviour.',
    )
  }
  else if (kbd.state === 'excepted') {
    lines.push(
      '- **Measured:** the `keyboard-spec` requirement is **excepted** for this component'
      + `${kbd.note === undefined ? '' : ` — ${kbd.note}`}`,
    )
  }
  else if (kbd.state === 'unrun') {
    lines.push(
      '- **Measured:** `keyboard-spec` is **unrun**'
      + `${kbd.note === undefined ? '.' : ` — ${kbd.note}`}`,
    )
  }
  else {
    lines.push(
      `- **Measured:** \`keyboard-spec\` is **${kbd.state}** — a spec asserts at least one key`,
      `  sequence${kbd.artifacts === undefined || kbd.artifacts.length === 0 ? '' : ` in \`${kbd.artifacts[0]}\``}.`,
      '  That is a presence measurement, not a table: it does not say which keys, or what they do.',
    )
  }
  lines.push('')
  return lines
}

/** The WCAG success criteria in scope for one component, joined to the dictionary. */
export function renderWcagSection(quality: QualityRow, ev: EvidenceSources): string[] {
  const byId = new Map(ev.quality.wcag.map(c => [c.id, c]))
  const rows = quality.wcag.map(id => byId.get(id)).filter((c): c is WcagCriterionRef => c !== undefined)
  const missing = quality.wcag.filter(id => !byId.has(id))

  const lines: string[] = [
    `### WCAG 2.2 criteria in scope (${rows.length})`,
    '',
    'The success criteria **this component can fail**, derived from its tier and its traits. This is',
    'a scope list, not a conformance claim: a criterion appearing here means it applies, not that it',
    'has been verified. What has been verified, and by which lane, is the evidence table below.',
    '',
    '| SC | Criterion | Level | New in |',
    '| --- | --- | --- | --- |',
    ...rows.map(c => `| [${c.id}](${wcagUnderstandingUrl(c.name)}) | ${cell(c.name)} | ${c.level} | WCAG ${c.since} |`),
    '',
  ]
  if (missing.length > 0) {
    lines.push(
      `**${missing.length} criterion id(s) on this component are not in the published dictionary**`,
      `and are shown unresolved: ${missing.map(id => `\`${id}\``).join(', ')}.`,
      '',
    )
  }
  return lines
}

/**
 * The measured SC 2.5.7 position for a component that drags.
 *
 * The capability matrix cannot say this. Its `non-drag-alternative` cell tests
 * the unit spec for a keyboard path and cites 2.5.7 in its own note — but a
 * keyboard path satisfies SC 2.1.1, and 2.5.7 is a *pointer* criterion. Three
 * components read `present` on that cell and do not meet the SC.
 */
export function renderDragSection(surface: WcagSurface, ev: EvidenceSources): string[] {
  const c = ev.wcagDeviations.criterion
  if (surface.state === 'gap') {
    return [
      `::: danger Open WCAG ${c.id} ${c.name} (level ${c.level}) gap`,
      `**${surface.component} does not meet SC ${c.id}.** The operation — *${cell(surface.operation)}* —`,
      'is keyboard-operable, but the criterion requires a **single pointer without dragging**, and this',
      'component has no such path.',
      '',
      `- **Keyboard (SC 2.1.1):** ${cell(surface.keyboardAlternative)}`,
      `- **Single pointer, no dragging (SC ${c.id}):** none — ${cell(surface.gapReason)}`,
      `- **Why it is not excepted:** ${cell(surface.notEssential)}`,
      `- **Why it is not fixed:** ${cell(surface.ownerDecision)}`,
      '',
      `[Understanding SC ${c.id}](${c.url}) · measured by \`${cell(ev.wcagDeviations.recordedAt.measuredBy)}\``,
      `at \`${shortCommit(ev.wcagDeviations.recordedAt.sourceCommit ?? '')}\`.`,
      ':::',
      '',
    ]
  }
  const lines = [
    `::: tip WCAG ${c.id} ${c.name} — met`,
    `${surface.component} drags (${cell(surface.operation)}), so SC ${c.id} applies and was audited.`,
    '',
    `- **Keyboard (SC 2.1.1):** ${cell(surface.keyboardAlternative)}`,
    `- **Single pointer, no dragging (SC ${c.id}):** ${cell(surface.singlePointerNoDrag ?? undefined)}`,
  ]
  if (surface.caveat !== undefined)
    lines.push('', `**Caveat:** ${cell(surface.caveat)}`)
  lines.push(':::', '')
  return lines
}

/**
 * The AT matrix for one component — the raw scaffold rows, per pair.
 *
 * Not the `at-manual` capability cell. See the module docstring and
 * {@link atManualTripwire}.
 */
export function renderAtSection(
  quality: QualityRow,
  ev: EvidenceSources,
  entry: AtEntry | undefined,
): string[] {
  const lines: string[] = ['### Assistive technology', '']

  if (!quality.evidence.includes('at-manual')) {
    lines.push(
      `Tier ${quality.tier} does not owe a manual screen-reader run, so this component has no row in`,
      'the AT matrix. Only Tier B and above do.',
      '',
    )
    return lines
  }
  if (entry === undefined) {
    lines.push(
      '**This component owes a manual screen-reader run and has no scaffold entry.** That is a gap in',
      'the matrix itself, not a result; nothing here should be read as evidence either way.',
      '',
    )
    return lines
  }

  const byId = new Map(ev.atMatrix.pairs.map(p => [p.id, p]))
  const executed = entry.rows.filter(r => r.result !== 'unrun')
  const headline = executed.length === 0
    ? `**0 of ${entry.rows.length} AT/browser pairs executed.** Nothing below has been run: every row`
    + ' is `unrun`, which means the pairing was not available and not attempted — a different fact'
    + ' from a failure.'
    : `**${executed.length} of ${entry.rows.length} AT/browser pairs executed.** The unexecuted pairs`
      + ' are listed with the same weight as the executed ones.'

  lines.push(
    headline,
    '',
    `Tasks this component owes on each pair: ${entry.tasks.map(t => `\`${t}\``).join(', ')}.`,
    '',
    '| Pair | AT | Browser | Platform | Result | Tester | Date | AT/browser versions | Recorded at |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  )
  for (const row of entry.rows) {
    const pair = byId.get(row.pair)
    const result = row.result === 'unrun' ? '`unrun`' : `**\`${row.result}\`**`
    lines.push(
      `| \`${row.pair}\` | ${cell(pair?.at)} | ${cell(pair?.browser)} | ${cell(pair?.platform)} `
      + `| ${result} | ${cell(orAbsent(row.tester))} | ${cell(orAbsent(row.date))} `
      + `| ${cell(orAbsent(row.versions))} | ${cell(orAbsent(row.sourceCommit) === '—' ? undefined : shortCommit(row.sourceCommit))} |`,
    )
  }
  lines.push('')

  const script = ev.atScripts[entry.component]
  lines.push(
    script === undefined
      ? `Record: \`${entry.file}\` (append-only). No executable script exists for this component yet;`
      + ' scripts were authored for the Tier C and D components first.'
      : `Script: \`${script}\` · record: \`${entry.file}\` (append-only).`,
    '',
    'A row here is written by a human after a real screen-reader session, never by a generator.',
    'See [the AT matrix](/evidence/at-matrix) for the state of all pairs across the catalogue.',
    '',
  )
  return lines
}

/** The evidence-cell table for one component — every cell, named, with its state. */
export function renderCellsSection(quality: QualityRow, capability: CapabilityRow): string[] {
  const unrun = capability.cells.filter(c => c.state === 'unrun')
  const stale = capability.cells.filter(c => c.state === 'stale')
  const excepted = capability.cells.filter(c => c.state === 'excepted')

  const lines: string[] = [
    `### Evidence cells (${capability.cells.length})`,
    '',
    `Every kind of evidence required of this component — by Tier ${quality.tier}`
    + `${quality.traits.length === 0 ? '' : `, by its traits (${quality.traits.map(t => `\`${t}\``).join(', ')})`}`
    + `${quality.securityBoundary === 'none' ? '' : `, by its \`${quality.securityBoundary}\` security boundary`}`
    + ' — and what was found. The states are'
    + ' `pass` (a lane ran and passed), `present` (an artifact exists and is bound to the component),'
    + ' `stale` (it exists but predates the component\'s last change), `excepted` (the requirement was'
    + ' waived with a recorded reason) and `unrun` (nothing has measured it).',
    '',
    '| Evidence | Required by | State | Where |',
    '| --- | --- | --- | --- |',
  ]
  for (const c of capability.cells) {
    // No raw HTML in a table cell: `escapeForVue` escapes `<` outside code spans
    // (constraint B14), so a `<br>` would render as literal text on the page.
    const artifacts = (c.artifacts ?? []).map(a => `\`${a}\``).join(' · ')
    const note = cell(c.note) === '—' ? '' : cell(c.note)
    const where = [artifacts, note].filter(s => s !== '').join(' — ')
    lines.push(
      `| \`${c.kind}\` | ${cell(c.origin)}${c.scope === 'corpus' ? ' · corpus-wide' : ''} `
      + `| ${c.state === 'unrun' ? '**`unrun`**' : `\`${c.state}\``} | ${where === '' ? '—' : where} |`,
    )
  }
  lines.push('')

  const named: string[] = []
  if (unrun.length > 0)
    named.push(`**${unrun.length} unrun:** ${unrun.map(c => `\`${c.kind}\``).join(', ')}`)
  if (stale.length > 0)
    named.push(`**${stale.length} stale:** ${stale.map(c => `\`${c.kind}\``).join(', ')}`)
  if (excepted.length > 0)
    named.push(`**${excepted.length} excepted:** ${excepted.map(c => `\`${c.kind}\``).join(', ')}`)
  lines.push(
    named.length === 0
      ? 'No cell on this component is unrun, stale or excepted.'
      : `${named.join(' · ')}. They are named rather than counted, because a total tells a reader nothing about what is missing.`,
    '',
  )

  if (capability.cells.some(c => c.kind === 'at-manual')) {
    lines.push(
      'The `at-manual` row above is the matrix\'s **summary** of the screen-reader lane. This page does',
      'not rely on it: the *Assistive technology* section is rendered from the append-only run records',
      'themselves, and the generator refuses to build this page if the summary claims more than those',
      'records support. [Why](/evidence/accessibility#why-this-site-reads-the-raw-scaffold-and-not-the-summary-cell).',
      '',
    )
  }
  return lines
}

/** Measured security deviations for one component, printed where they are relevant. */
export function renderSecuritySection(
  deviations: SecurityDeviation[],
  ev: EvidenceSources,
): string[] {
  if (deviations.length === 0)
    return []
  const high = deviations.filter(d => d.severity === 'high')
  const fixtures = new Set(deviations.flatMap(d => d.fixtures))
  return [
    '::: danger Measured security deviations',
    `The hostile-input corpus measured **${deviations.length} deviation(s)** on this component`,
    `(${high.length} of them high severity), across ${fixtures.size} fixture(s). A deviation is a`,
    'defect the library owes, not a waiver — and the security evidence cells above can read `present`',
    'while these stand, because a corpus that runs is a different fact from a corpus that passes.',
    '',
    ...deviations.map(d =>
      `- **\`${d.id}\`** · sink \`${d.sink}\` · required \`${d.required}\`, measured `
      + `\`${d.measured}\` · severity \`${d.severity}\``
      + `${d.publicBehaviourChange ? ' · **fixing it is a breaking change**' : ''}`,
    ),
    '',
    `Recorded by \`${cell(ev.securityDeviations?.recordedAt.task)}\` in`,
    '`packages/core/security/security-deviations.json`.',
    ':::',
    '',
  ]
}

/**
 * The whole per-component evidence section, appended after *Extraction
 * fidelity* on every generated component page.
 */
export function renderEvidence(record: ComponentMetaRecord, ev: EvidenceSources): string[] {
  const quality = qualityRowFor(record.name, ev)
  const capability = capabilityRowFor(record.name, ev)

  // Compound parts have no matrix row of their own. N1-O5's finding S4 is that
  // some of them are real security sinks; saying so is more useful than saying
  // nothing, and far more useful than implying the parent's evidence covers them.
  if (quality === undefined || capability === undefined) {
    if (record.kind === 'compound-part') {
      return [
        '## Accessibility and evidence',
        '',
        `\`${record.name}\` is a compound sub-part and **is not a row in the evidence matrices**, which`,
        `cover the ${ev.capability.rows.length} public components. Its evidence is whatever its parent`,
        `\`${record.parentComponent ?? '—'}\` owes; nothing here measures the part on its own. That gap`,
        'is recorded — some sub-parts own a URL sink their parent declares — and closing it means',
        'making parts matrix rows, which is an owner decision.',
        '',
      ]
    }
    return [
      '## Accessibility and evidence',
      '',
      `**No evidence row exists for \`${record.name}\`.** It is published as a public component and`,
      'carries no quality-matrix or capability-matrix row, so nothing on this page says what it owes',
      'or what has been measured. That is a gap in the matrices, not a clean bill of health.',
      '',
    ]
  }

  const link = apgLink(quality.pattern)
  const tierKinds = ev.quality.rules.tierIncrement[quality.tier] ?? []
  const surface = wcagSurfaceFor(record.name, ev)

  const lines: string[] = [
    '## Accessibility and evidence',
    '',
    ...standingNote(ev),
    '',
    `- **Risk tier:** \`${quality.tier}\` — `
    + `${tierKinds.length === 0
      ? 'adds no evidence of its own'
      : isBaseTier(quality.tier, ev)
        ? `the base tier, which every component owes: ${tierKinds.map(k => `\`${k}\``).join(', ')}`
        : `adds ${tierKinds.map(k => `\`${k}\``).join(', ')} on top of the tiers below it`}.`,
    link === undefined
      ? `- **APG pattern:** \`${quality.pattern}\` — no WAI-ARIA Authoring Practices pattern describes this component.`
      : `- **APG pattern:** [\`${quality.pattern}\`](${link})`,
    `- **Traits:** ${quality.traits.length === 0 ? 'none declared' : quality.traits.map(t => `\`${t}\``).join(', ')}`,
    `- **Security boundary:** \`${quality.securityBoundary}\``
    + `${quality.boundaryJustification === undefined ? '' : ` — ${cell(quality.boundaryJustification)}`}`,
    `- **Declared anatomy:** \`${capability.anatomy}\``
    + `${capability.anatomy === 'declared' ? '' : ' — the component has not declared its parts, which is not the same claim as having none'}`,
    `- **Component last changed at:** \`${shortCommit(capability.componentCommit)}\``,
    '',
  ]

  if (quality.patternJustification !== undefined) {
    lines.push(`**Why this pattern:** ${cell(quality.patternJustification)}`, '')
  }

  // N1-O5's finding S4, made visible where it matters: a parent can declare a
  // security boundary whose sink actually lives on a sub-part, and the sub-part
  // is not a row. Saying so on the parent's page is the only place a reader
  // would ever meet the gap.
  const parts = quality.parts ?? []
  if (parts.length > 0) {
    lines.push(
      `**Compound sub-parts are not matrix rows.** ${parts.map(p => `\`${p}\``).join(', ')} `
      + `${parts.length === 1 ? 'is documented' : 'are documented'} on this page and `
      + `${parts.length === 1 ? 'carries' : 'carry'} no evidence row of its own. Everything below `
      + `describes \`${record.name}\`. Whether sub-parts should become rows — some of them own a sink `
      + 'their parent declares — is an open owner decision.',
      '',
    )
  }
  if (quality.exceptions !== undefined && Object.keys(quality.exceptions).length > 0) {
    lines.push(
      '::: warning Recorded exceptions',
      'A requirement this component provably cannot meet. The row stays in the matrix and the reason',
      'travels with it — an exception is visible, not deleted.',
      '',
      ...Object.entries(quality.exceptions).map(([kind, reason]) => `- \`${kind}\` — ${cell(reason)}`),
      ':::',
      '',
    )
  }

  lines.push(...renderWcagSection(quality, ev))
  if (surface !== undefined)
    lines.push(...renderDragSection(surface, ev))
  lines.push(...renderKeyboardSection(quality, capability))
  lines.push(...renderAtSection(quality, ev, atEntryFor(record.name, ev)))
  lines.push(...renderCellsSection(quality, capability))
  lines.push(...renderSecuritySection(securityDeviationsFor(record.name, ev), ev))

  return lines
}
