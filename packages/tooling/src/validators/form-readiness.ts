/**
 * Form-control readiness matrix — generator and gate (TASK-FORM-OSS-01).
 *
 * Two jobs from one source of truth, the way `validators/rtl.ts` does it:
 *
 *   1. **Generate.** `docs/program-2026-08/form-controls-readiness-matrix.md` is
 *      written from the ownership manifest (which controls exist), the source
 *      probe (what they do), the quality matrix (their APG pattern), and the
 *      reviewed assessments (what a person judged). Nothing in the table is
 *      typed by hand, so no cell can claim a gap is closed while source still
 *      shows it open.
 *   2. **Gate.** Exit 1 when the committed matrix is stale, when a control has
 *      no assessment or an assessment names a control that no longer exists,
 *      and when a reviewed `pass` carries no evidence.
 *
 * **Which half wins.** Where a clause is decidable from source — C2 identity,
 * C3 states, C5's browser globals, C6, C7, C8 — the probe's answer is final and
 * a reviewed cell cannot upgrade it. Where it is not — did clearing emit the
 * documented empty value, is the hydrated DOM equal — the reviewed cell decides
 * and the probe only reports what it could see. The split is the point: a
 * reviewer cannot talk a `data-state="idle"` into being canonical, and a regex
 * cannot talk itself into having watched a form hydrate.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/form-readiness.ts            # check
 *   tsx packages/tooling/src/validators/form-readiness.ts --write    # regenerate
 *   tsx packages/tooling/src/validators/form-readiness.ts --gaps     # list open gaps
 *
 * @module @dzup-ui/tooling/validators/form-readiness
 */

import type { Assessment, Clause, Verdict } from '../forms/assessments.ts'
import type { ProbeResult } from '../forms/probe.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import {
  ASSESSMENTS,
  CLAUSE_TITLES,
  CLAUSES,
  NOT_APPLICABLE,
} from '../forms/assessments.ts'
import { probeControls, ROOT, STATE_PROPS, valueModel } from '../forms/probe.ts'

const MANIFEST = resolve(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
const QUALITY = resolve(ROOT, 'packages/core/docs/quality-matrix.json')
export const MATRIX_PATH = resolve(ROOT, 'docs/program-2026-08/form-controls-readiness-matrix.md')
const CONTRACT_DOC = 'form-control-renderer-contract.md'

/**
 * The five primitives a form renderer uses as *sections* rather than controls.
 *
 * They are not in `forms/` or `inputs/` and they hold no value of their own, so
 * the roster would never find them — but a renderer's layout nodes map onto
 * them one to one, and the failure they cause is the worst one in a form: the
 * first invalid field sits in a collapsed panel, `focus()` silently does
 * nothing, and the user is told to fix errors they cannot reach.
 *
 * Named rather than derived, because "is a layout primitive" is a judgment
 * about how a component is used, not a fact in its source. The gate fails if
 * one of these stops being a public component.
 */
const LAYOUT_PRIMITIVES = ['DzStack', 'DzGrid', 'DzTabs', 'DzAccordion', 'DzStepper']

/** Verdicts, widened past the reviewed set with the two the generator derives. */
interface Cell { verdict: Verdict | 'unrun', note: string, evidence: string, source: 'derived' | 'reviewed' }

interface OwnershipEntry {
  symbol: string
  kind: string
  evidence?: string[]
  anatomy?: { riskTier?: string, rtl?: { mirrors: string, keyboard: string } | null }
}

export interface RosterEntry {
  /** The section this row appears under in the matrix. */
  family: string
  /** The directory the `.vue` actually lives in, which the probe needs. */
  dir: string
  component: string
  kind: string
  entry: OwnershipEntry
}

interface QualityEntry {
  component: string
  tier: string
  pattern: string
}

const MARK: Record<Cell['verdict'], string> = {
  'pass': '✅ pass',
  'gap': '⛔ gap',
  'n-a': '– n-a',
  'future': '🕓 future',
  'unrun': '◻ unrun',
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/**
 * The roster, derived rather than listed.
 *
 * A control is any manifest entry whose evidence names a `.vue` under
 * `components/forms/` or `components/inputs/`. Adding a component to either
 * directory therefore adds a row, and the gate fails until somebody assesses
 * it — which is the only way a matrix stays complete.
 */
export function roster(): RosterEntry[] {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { entries: OwnershipEntry[] }
  const out: RosterEntry[] = []
  for (const entry of manifest.entries) {
    const vue = entry.evidence?.find(p => /components\/(?:forms|inputs)\/Dz\w+\.vue$/.test(p))
    if (vue === undefined)
      continue
    const family = /components\/(forms|inputs)\//.exec(vue)?.[1]
    if (family === undefined)
      continue
    out.push({ family, dir: family, component: entry.symbol, kind: entry.kind, entry })
  }
  for (const entry of manifest.entries) {
    if (!LAYOUT_PRIMITIVES.includes(entry.symbol))
      continue
    const vue = entry.evidence?.find(p => p.endsWith('.vue'))
    if (vue === undefined)
      continue
    // `family` is the matrix section; `dir` is where the file actually lives.
    // The layout primitives sit in `layout/`, `navigation/` and `data/`, and a
    // probe pointed at a `layouts/` directory finds nothing at all.
    const dir = /components\/([^/]+)\//.exec(vue)?.[1]
    if (dir === undefined)
      continue
    out.push({ family: 'layouts', dir, component: entry.symbol, kind: entry.kind, entry })
  }

  const familyOrder = ['inputs', 'forms', 'layouts']
  return out.sort((a, b) =>
    a.family === b.family
      ? a.component.localeCompare(b.component)
      : familyOrder.indexOf(a.family) - familyOrder.indexOf(b.family),
  )
}

function qualityByComponent(): Map<string, QualityEntry> {
  if (!existsSync(QUALITY))
    return new Map()
  const parsed = JSON.parse(readFileSync(QUALITY, 'utf8')) as { components: QualityEntry[] }
  return new Map(parsed.components.map(c => [c.component, c]))
}

// ---------------------------------------------------------------------------
// Derivation, clause by clause
// ---------------------------------------------------------------------------

/** C1 — the half of value semantics that is visible in source. */
function deriveC1(p: ProbeResult): Cell | null {
  const model = valueModel(p)
  if (model === null)
    return null
  if (model.name !== null) {
    return {
      verdict: 'gap',
      note: `value is bound to v-model:${model.name}; a registry entry cannot bind it generically`,
      evidence: `${p.file} defineModel<${model.type ?? '?'}>('${model.name}')`,
      source: 'derived',
    }
  }
  if (model.type !== null && /\b(?:File|Blob|Date|Map|Set|FileList)\b/.test(model.type)) {
    return {
      verdict: 'gap',
      note: `model type ${model.type} is not JSON-serializable`,
      evidence: `${p.file} defineModel<${model.type}>`,
      source: 'derived',
    }
  }
  return null
}

/**
 * C2 — identity, decided against what the kind of control actually owes.
 *
 * A value-bearing control merges four axes with the field context. A compound
 * part owes only that it takes its id *from* the context so the control can
 * point at it. A wrapper owes neither — it passes its child through a slot and
 * the context reaches the child on its own — but it still may not accept an
 * identity prop and drop it on the floor, which is the failure mode that leaves
 * a renderer wiring a control that was never listening.
 */
function deriveC2(
  p: ProbeResult,
  kind: Assessment['kind'],
  delegatesTo?: string,
  inertProps?: Readonly<Record<string, string>>,
): Cell {
  const missing: string[] = []

  if (delegatesTo !== undefined) {
    // The delegate is a descendant, so injection reaches it directly. The only
    // thing this control can still get wrong is accepting an identity prop and
    // not forwarding it, which the `declaredUnread` check below still catches.
  }
  else if (kind === 'compound-part') {
    if (p.contextIdBindings.length === 0)
      missing.push('binds no id from the field context, so nothing can reference it')
  }
  else if (p.providesFieldContext) {
    // The provider is the identity. It has nothing to inject from.
  }
  else if (kind === 'wrapper') {
    // Nothing required: the wrapped control injects the context itself.
  }
  else if (kind === 'layout') {
    // A section is a box around fields. The fields carry the identity; what a
    // section owes is a way in — `revealItem` — which is C-layouts, not C2.
  }
  else if (kind === 'array') {
    // A repeater is renderless — it has no element to carry an id, a state
    // attribute or a describedby. What it owes is the opposite: an id base each
    // row can derive a *distinct* id from, because every row otherwise inherits
    // the one field id and a label for row 1 activates row 3.
    if (!p.consumesFieldContext)
      missing.push('does not inject the DzFormField context, so rows cannot derive ids from the field')
  }
  else {
    if (!p.consumesFieldContext) {
      missing.push('does not inject the DzFormField context')
    }
    else {
      for (const axis of ['id', 'disabled', 'invalid', 'describedby'] as const) {
        if (!p.resolutions.includes(axis))
          missing.push(`never reads the field context's ${axis}`)
      }
    }
  }

  const ignored = p.declaredUnread.filter(u => /^(?:id|aria)/.test(u.prop))
  for (const u of ignored) {
    const parked = inertProps?.[u.prop]
    missing.push(
      parked === undefined
        ? `declares ${u.prop} and never reads it${u.line ? ` (${p.file}:${u.line})` : ''}`
        : `declares ${u.prop} and cannot honour it — ${parked} (owner decision: remove the prop, which is a breaking type change)`,
    )
  }

  if (missing.length === 0) {
    const how = delegatesTo !== undefined
      ? `renders ${delegatesTo}, which injects the field context itself`
      : p.providesFieldContext
        ? 'provides the field identity every other control resolves against'
        : kind === 'compound-part'
          ? `binds ${p.contextIdBindings.join(', ')} from the field context`
          : kind === 'wrapper'
            ? 'passes its child through a slot, so the field context reaches it unchanged'
            : kind === 'layout'
              ? 'a section around fields; the fields inside it carry the identity'
              : kind === 'array'
                ? 'derives a distinct id base per row from the field context'
                : `merges ${p.resolutions.join(', ')} with the field context`
    return { verdict: 'pass', note: how, evidence: `${p.file} (probe)`, source: 'derived' }
  }
  return { verdict: 'gap', note: missing.join('; '), evidence: `${p.file} (probe)`, source: 'derived' }
}

/**
 * C4 — the describedby half, which source can decide.
 *
 * A conforming control merges three sources into `aria-describedby`: its own
 * error id, the consumer's `ariaDescribedby` prop, and the field context's.
 * Binding the attribute but reading only one of them is the gap — it means a
 * control inside a `DzFormField` silently drops whatever the consumer passed,
 * or the reverse.
 *
 * The announcement policy in C4.3/C4.4 is not decidable here and stays reviewed.
 */
function deriveC4(p: ProbeResult, kind: Assessment['kind'], delegatesTo?: string): Cell | null {
  // A renderless repeater has no element to describe. It hands each row the ids
  // and the row's own control does the describing.
  if (kind === 'array')
    return null
  if (delegatesTo !== undefined) {
    return {
      verdict: 'pass',
      note: `renders ${delegatesTo}, which owns the describedby merge and the message surface`,
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  if (kind === 'compound-part' || kind === 'wrapper' || kind === 'layout')
    return null
  if (!p.stateAttrs.ariaDescribedby) {
    return {
      verdict: 'gap',
      note: 'binds no aria-describedby, so a description and an error can never be announced with the control',
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  const readsContext = p.resolutions.includes('describedby')
  const readsProp = !p.declaredUnread.some(u => u.prop === 'ariaDescribedby') && p.declared.includes('ariaDescribedby')
  if (readsContext && readsProp) {
    return {
      verdict: 'pass',
      note: 'merges its own message id, the ariaDescribedby prop and the field context',
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  const missing = [
    readsContext ? null : 'ignores the field context describedby',
    readsProp ? null : 'ignores the ariaDescribedby prop',
  ].filter(Boolean)
  return {
    verdict: 'gap',
    note: `binds aria-describedby but ${missing.join(' and ')}`,
    evidence: `${p.file} (probe)`,
    source: 'derived',
  }
}

/**
 * C3 — states: declared, read, and reflected as presence-only booleans.
 *
 * The `data-state` half follows ADR-19 §4: the attribute is a *per-component*
 * enum declared in that component's anatomy, so `DzInput` emitting
 * `'disabled' | 'loading' | 'readonly'` is correct and its anatomy says so. The
 * first version of this check judged those values against the global
 * `DataState` union and reported twenty-one components — including the one the
 * contract names as its reference implementation — for doing exactly what the
 * ADR decided. A component with no anatomy is not judged on the enum at all;
 * the anatomy rollout is P3-02's ratchet and this gate does not re-open it.
 */
function deriveC3(p: ProbeResult, delegatesTo?: string): Cell {
  if (delegatesTo !== undefined) {
    return {
      verdict: 'pass',
      note: `renders ${delegatesTo}, which reflects the state attributes`,
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  const problems: string[] = []
  const ignored = p.declaredUnread.filter(u => (STATE_PROPS as readonly string[]).includes(u.prop))
  for (const u of ignored)
    problems.push(`declares ${u.prop} and never reads it${u.line ? ` (${p.file}:${u.line})` : ''}`)

  /**
   * The `data-*` half only.
   *
   * The ARIA half is often supplied at runtime by the Reka primitive a control
   * wraps — `DzCheckbox`, `DzSwitch`, `DzRadioGroup` and `DzSelect` all render
   * `aria-required="true"` without the string appearing anywhere in their
   * templates. A source probe cannot see that and must not claim to: saying
   * "not reflected as data-required or aria-required" would be half wrong, and
   * would send somebody to add an ARIA attribute that is already there.
   *
   * So this checks what source can answer — the presence-only attribute ADR-19
   * §4 lists, which is the styling hook nothing else provides — and leaves the
   * ARIA half to the a11y and contract specs, which mount the component.
   */
  const declares = (prop: string): boolean => p.declared.includes(prop) && !ignored.some(i => i.prop === prop)
  const a = p.stateAttrs
  if (declares('disabled') && !a.disabled)
    problems.push('disabled is not reflected as data-disabled')
  if (declares('readonly') && !a.readonly)
    problems.push('readonly is not reflected as data-readonly')
  if (declares('loading') && !a.loading)
    problems.push('loading is not reflected as data-loading')
  if ((declares('invalid') || declares('error')) && !a.invalid && !a.ariaInvalid)
    problems.push('invalid is not reflected as data-invalid or aria-invalid')
  if (declares('required') && !a.required)
    problems.push('required is not reflected as data-required')

  const undeclaredState = p.dataStateValues
    .filter(v => v.declared === false)
    .filter((v, i, arr) => arr.findIndex(o => o.value === v.value) === i)
  if (undeclaredState.length > 0) {
    const list = undeclaredState.map(v => `"${v.value}" (:${v.line})`).join(', ')
    problems.push(`emits data-state ${list}, which its own anatomy does not declare`)
  }

  if (problems.length === 0) {
    const reflected = Object.entries(a).filter(([, v]) => v).map(([k]) => k)
    const enumNote = p.declaredStates === null
      ? 'no anatomy yet, so its data-state enum is unchecked'
      : `data-state within its declared [${p.declaredStates.join('|')}]`
    return {
      verdict: 'pass',
      note: reflected.length > 0
        ? `reflects ${reflected.join(', ')}; ${enumNote}`
        : `declares no state it fails to reflect; ${enumNote}`,
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  return { verdict: 'gap', note: problems.join('; '), evidence: `${p.file} (probe)`, source: 'derived' }
}

/**
 * C9 — the async-options seam, once it exists.
 *
 * Derived rather than reviewed, because every part of it is a declaration in
 * the component's own `.types.ts`: the state prop, the abortable request, the
 * retry. Before `TASK-FORM-OSS-03` there was nothing to derive and every cell
 * was a reviewed `future`; now the rollout across the remaining controls is
 * checked by the gate instead of asserted by a person who might miss one.
 */
function deriveC9(p: ProbeResult): Cell | null {
  const { optionsState, loadOptionsEmit, abortSignal, retry } = p.async
  if (optionsState && loadOptionsEmit && abortSignal) {
    return {
      verdict: 'pass',
      note: `declares optionsState, an abortable load-options request${retry ? ' and a retry' : ''}`,
      evidence: `${p.file.replace('.vue', '.types.ts')} (probe)`,
      source: 'derived',
    }
  }
  if (!optionsState && !loadOptionsEmit && !abortSignal)
    return null

  const missing = [
    optionsState ? null : 'no optionsState prop',
    loadOptionsEmit ? null : 'no load-options emit',
    abortSignal ? null : 'no AbortSignal in the request, so a superseded load cannot be cancelled',
  ].filter(Boolean)
  return {
    verdict: 'gap',
    note: `half-wired: ${missing.join('; ')}`,
    evidence: `${p.file.replace('.vue', '.types.ts')} (probe)`,
    source: 'derived',
  }
}

/**
 * C5 — SSR.
 *
 * Two facts, both in source: a browser global read at the top level of
 * `<script setup>` (which fails on the server), and whether any SSR spec renders
 * the control at all (without which "it renders on the server" is a belief).
 * Neither needs a reviewer, so the whole clause is derived and a reviewed cell
 * cannot upgrade it — an untested control is untested however confident anyone
 * is about it.
 */
function deriveC5(p: ProbeResult): Cell {
  if (p.eagerGlobals.length > 0) {
    const list = p.eagerGlobals.map(g => `${g.name} (:${g.line})`).join(', ')
    return {
      verdict: 'gap',
      note: `reads ${list} at the top level of the setup block, which runs on the server`,
      evidence: `${p.file} (probe)`,
      source: 'derived',
    }
  }
  if (!p.namedInSsrSpec) {
    return {
      verdict: 'gap',
      note: 'no SSR spec renders it, so nothing has ever checked its server output or its hydration',
      evidence: 'packages/core/tests/ssr/ (probe)',
      source: 'derived',
    }
  }
  return {
    verdict: 'pass',
    note: 'rendered by the SSR suite and reads no browser global during setup',
    evidence: 'packages/core/tests/ssr/ (probe)',
    source: 'derived',
  }
}

/** C6 — delegated to the RTL declaration TASK-OSS-P4-05 introduced. */
function deriveC6(entry: OwnershipEntry): Cell {
  const rtl = entry.anatomy?.rtl
  if (rtl == null) {
    return {
      verdict: 'unrun',
      note: 'declares no RTL contract; `yarn validate:rtl` has nothing to check for it',
      evidence: 'packages/core/docs/rtl-matrix.md',
      source: 'derived',
    }
  }
  return {
    verdict: 'pass',
    note: `mirrors: ${rtl.mirrors}, keyboard: ${rtl.keyboard} — gated by yarn validate:rtl`,
    evidence: 'packages/core/docs/rtl-matrix.md',
    source: 'derived',
  }
}

/** C7 — motion. Animating without a reduced-motion guard is the whole check. */
function deriveC7(p: ProbeResult): Cell {
  if (!p.animates)
    return { verdict: 'n-a', note: 'no transition or animation', evidence: `${p.file} (probe)`, source: 'derived' }
  if (p.animatesUnguarded) {
    return {
      verdict: 'gap',
      note: 'animates with no prefers-reduced-motion guard',
      evidence: `${p.file} / .variants.ts (probe)`,
      source: 'derived',
    }
  }
  return { verdict: 'pass', note: 'animation is guarded by motion-reduce', evidence: `${p.file} (probe)`, source: 'derived' }
}

/** C8 — delegated to the tier assignment TASK-OSS-P5-01 already gates. */
function deriveC8(component: string, quality: Map<string, QualityEntry>): Cell {
  const q = quality.get(component)
  if (q === undefined) {
    return {
      verdict: 'unrun',
      note: 'not in the quality matrix (compound parts are not assigned a tier)',
      evidence: 'packages/core/docs/quality-matrix.json',
      source: 'derived',
    }
  }
  if (q.pattern === 'none')
    return { verdict: 'n-a', note: 'no APG pattern', evidence: 'packages/core/docs/quality-matrix.json', source: 'derived' }
  return {
    verdict: 'pass',
    note: `APG ${q.pattern}, tier ${q.tier} — gated by yarn validate:quality-tiers`,
    evidence: 'packages/core/docs/quality-matrix.json',
    source: 'derived',
  }
}

// ---------------------------------------------------------------------------
// One row
// ---------------------------------------------------------------------------

export interface Row {
  readonly component: string
  readonly family: string
  readonly kind: Assessment['kind']
  readonly cells: Record<Clause, Cell>
  readonly probe: ProbeResult
  readonly specs: { contract: boolean, a11y: boolean, ssr: boolean }
  readonly storyStates: string[]
}

const STATE_STORY_NAMES = ['Disabled', 'Readonly', 'Loading', 'Invalid', 'Error', 'Required']

function buildRow(
  component: string,
  family: string,
  entry: OwnershipEntry,
  probe: ProbeResult,
  quality: Map<string, QualityEntry>,
  assessment: Assessment,
): Row {
  const kind = assessment.kind
  const na = NOT_APPLICABLE[kind] ?? {}

  const derived: Partial<Record<Clause, Cell | null>> = {
    C1: deriveC1(probe),
    C2: deriveC2(probe, kind, assessment.delegatesTo, assessment.inertProps),
    C3: deriveC3(probe, assessment.delegatesTo),
    C4: deriveC4(probe, kind, assessment.delegatesTo),
    C5: deriveC5(probe),
    C6: deriveC6(entry),
    C7: deriveC7(probe),
    C8: deriveC8(component, quality),
    C9: deriveC9(probe),
  }
  /** Clauses where source is the final word and a review cannot upgrade it. */
  /**
   * C9 joined this list once the seam existed. Before `TASK-FORM-OSS-03` it was
   * a reviewed `future` on every control, because there was nothing in source
   * to read; now every part of it is a declaration in the component's own
   * types, and the six controls the seam rolled out to still carried the old
   * review. Source decides it.
   */
  const HARD: readonly Clause[] = ['C2', 'C3', 'C5', 'C6', 'C7', 'C8', 'C9']

  const cells = {} as Record<Clause, Cell>
  for (const clause of CLAUSES) {
    const reviewed = assessment.reviewed?.[clause]
    const d = derived[clause] ?? null
    const naReason = na[clause]

    if (HARD.includes(clause) && d !== null) {
      cells[clause] = d
      continue
    }
    if (d !== null && d.verdict === 'gap') {
      // A source-visible defect outranks a reviewed pass, whatever the clause.
      // When the reviewer saw the same defect, their sentence is the better one
      // — it says what it costs, where the probe only says what it is — so the
      // note is theirs and the citation stays the probe's.
      cells[clause] = reviewed && reviewed.verdict === 'gap'
        ? { ...d, note: reviewed.note, evidence: `${reviewed.evidence} · ${d.evidence}` }
        : d
      continue
    }
    if (reviewed !== undefined) {
      cells[clause] = { ...reviewed, source: 'reviewed' }
      continue
    }
    if (naReason !== undefined) {
      cells[clause] = { verdict: 'n-a', note: naReason, evidence: 'contract §What a control owes, by kind', source: 'derived' }
      continue
    }
    if (d !== null) {
      cells[clause] = d
      continue
    }
    cells[clause] = {
      verdict: 'unrun',
      note: 'no reviewed judgment and nothing in source decides it',
      evidence: '—',
      source: 'derived',
    }
  }

  return {
    component,
    family,
    kind,
    cells,
    probe,
    specs: { contract: probe.hasContractSpec, a11y: probe.namedInA11ySpec, ssr: probe.namedInSsrSpec },
    storyStates: STATE_STORY_NAMES.filter(s =>
      probe.storyExports.some(e => e.toLowerCase().includes(s.toLowerCase())),
    ),
  }
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export interface BuildResult {
  readonly rows: Row[]
  readonly problems: string[]
}

export function build(): BuildResult {
  const list = roster()
  const problems: string[] = []
  const quality = qualityByComponent()

  const probes = new Map(
    probeControls(list.map(r => [r.dir, r.component] as const)).map(p => [p.component, p]),
  )

  for (const { component } of list) {
    if (ASSESSMENTS[component] === undefined)
      problems.push(`${component} is a form control with no entry in forms/assessments.ts`)
  }
  for (const component of Object.keys(ASSESSMENTS)) {
    if (!list.some(r => r.component === component))
      problems.push(`forms/assessments.ts names ${component}, which is not a form control in the ownership manifest`)
  }
  for (const [component, assessment] of Object.entries(ASSESSMENTS)) {
    for (const prop of Object.keys(assessment.inertProps ?? {})) {
      const probe = probes.get(component)
      if (probe !== undefined && !probe.declaredUnread.some(u => u.prop === prop)) {
        problems.push(
          `${component} lists ${prop} as inert, but source now reads it — `
          + 'delete the entry rather than leaving a parked decision that has been made',
        )
      }
    }
    if (assessment.delegatesTo !== undefined && ASSESSMENTS[assessment.delegatesTo] === undefined) {
      problems.push(
        `${component} delegates to ${assessment.delegatesTo}, which is not a form control — `
        + 'a delegate that does not exist excuses three clauses for nothing',
      )
    }
    for (const [clause, cell] of Object.entries(assessment.reviewed ?? {})) {
      if (cell.verdict === 'pass' && cell.evidence.trim() === '')
        problems.push(`${component} ${clause} is a reviewed pass with no evidence`)
      if (cell.note.trim() === '')
        problems.push(`${component} ${clause} has no note`)
    }
  }

  const rows: Row[] = []
  for (const { component, family, entry } of list) {
    const probe = probes.get(component)
    if (probe === undefined) {
      problems.push(`${component} has a manifest entry but no readable .vue`)
      continue
    }
    const assessment = ASSESSMENTS[component]
    if (assessment === undefined)
      continue
    rows.push(buildRow(component, family, entry, probe, quality, assessment))
  }
  return { rows, problems }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

const esc = (s: string): string => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

function cellText(cell: Cell): string {
  if (cell.verdict === 'pass' || cell.verdict === 'n-a')
    return MARK[cell.verdict]
  return `${MARK[cell.verdict]} — ${esc(cell.note)}`
}

function counts(rows: readonly Row[]): Record<Cell['verdict'], number> {
  const out: Record<Cell['verdict'], number> = { 'pass': 0, 'gap': 0, 'n-a': 0, 'future': 0, 'unrun': 0 }
  for (const row of rows) {
    for (const clause of CLAUSES) out[row.cells[clause].verdict]++
  }
  return out
}

export function render(rows: readonly Row[]): string {
  const total = counts(rows)
  const perClause = CLAUSES.map((clause) => {
    const c: Record<string, number> = {}
    for (const row of rows) c[row.cells[clause].verdict] = (c[row.cells[clause].verdict] ?? 0) + 1
    return { clause, c }
  })

  const lines: string[] = []
  lines.push('# Form-control readiness matrix')
  lines.push('')
  lines.push('<!-- GENERATED FILE — do not edit by hand.')
  lines.push('     Regenerate: yarn generate:form-readiness')
  lines.push('     Gate:       yarn validate:form-readiness')
  lines.push('     Sources:    packages/core/manifests/component-ownership.manifest.json (roster)')
  lines.push('                 packages/tooling/src/forms/probe.ts                       (source facts)')
  lines.push('                 packages/tooling/src/forms/assessments.ts                 (reviewed cells)')
  lines.push('                 packages/core/docs/quality-matrix.json                    (C8)')
  lines.push('-->')
  lines.push('')
  lines.push(`> Every Core form control against the nine clauses of [\`${CONTRACT_DOC}\`](./${CONTRACT_DOC}).`)
  lines.push('> Read the contract for what a clause means; this file only says who satisfies it.')
  lines.push('>')
  lines.push('> A cell is **derived** — re-read from source on every run — unless the clause needs a')
  lines.push('> judgment source cannot make, in which case it is **reviewed** and carries the citation')
  lines.push('> the reviewer consulted. Where the two disagree, source wins.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`${rows.length} controls × ${CLAUSES.length} clauses = ${rows.length * CLAUSES.length} cells.`)
  lines.push('')
  lines.push('| Verdict | Count | Meaning |')
  lines.push('| --- | ---: | --- |')
  lines.push(`| ${MARK.pass} | ${total.pass} | satisfies the clause today |`)
  lines.push(`| ${MARK.gap} | ${total.gap} | fails the clause; work for TASK-FORM-OSS-02 |`)
  lines.push(`| ${MARK.future} | ${total.future} | the seam does not exist yet; work for TASK-FORM-OSS-03 |`)
  lines.push(`| ${MARK.unrun} | ${total.unrun} | the check exists and has not been run for this control |`)
  lines.push(`| ${MARK['n-a']} | ${total['n-a']} | the clause does not apply to this kind of control |`)
  lines.push('')
  lines.push('| Clause | | ✅ | ⛔ | 🕓 | ◻ | – |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |')
  for (const { clause, c } of perClause) {
    lines.push(
      `| ${clause} | ${CLAUSE_TITLES[clause as Clause]} | ${c.pass ?? 0} | ${c.gap ?? 0} | `
      + `${c.future ?? 0} | ${c.unrun ?? 0} | ${c['n-a'] ?? 0} |`,
    )
  }
  lines.push('')

  lines.push('## Pro may rely on today')
  lines.push('')
  const fully = rows.filter(r => CLAUSES.every(c => ['pass', 'n-a'].includes(r.cells[c].verdict)))
  if (fully.length === 0) {
    lines.push('**No control satisfies all nine clauses.** The closest are listed below by open-clause count;')
    lines.push('the renderer can bind any of them today provided it supplies identity explicitly and does not')
    lines.push('rely on the clauses marked open.')
    lines.push('')
    const ranked = [...rows]
      .map(r => ({ r, open: CLAUSES.filter(c => ['gap', 'unrun', 'future'].includes(r.cells[c].verdict)) }))
      .sort((a, b) => a.open.length - b.open.length)
      .slice(0, 12)
    lines.push('| Control | open clauses |')
    lines.push('| --- | --- |')
    for (const { r, open } of ranked)
      lines.push(`| \`${r.component}\` | ${open.length}: ${open.join(', ')} |`)
  }
  else {
    for (const r of fully) lines.push(`- \`${r.component}\``)
  }
  lines.push('')

  lines.push('## Matrix')
  lines.push('')
  for (const family of ['inputs', 'forms', 'layouts']) {
    const familyRows = rows.filter(r => r.family === family)
    if (familyRows.length === 0)
      continue
    lines.push(family === 'layouts'
      ? '### Layouts — the primitives a renderer uses as form sections'
      : `### \`packages/core/src/components/${family}/\``)
    lines.push('')
    lines.push(`| Control | kind | ${CLAUSES.join(' | ')} | specs c/a/s | story states |`)
    lines.push(`| --- | --- | ${CLAUSES.map(() => '---').join(' | ')} | --- | --- |`)
    for (const row of familyRows) {
      const specs = `${row.specs.contract ? '✓' : '·'}/${row.specs.a11y ? '✓' : '·'}/${row.specs.ssr ? '✓' : '·'}`
      lines.push(
        `| \`${row.component}\` | ${row.kind} | ${
          CLAUSES.map(c => cellText(row.cells[c])).join(' | ')
        } | ${specs} | ${row.storyStates.join(', ') || '—'} |`,
      )
    }
    lines.push('')
  }

  lines.push('## Gaps by family, for TASK-FORM-OSS-02')
  lines.push('')
  const slices: [string, string[]][] = [
    ['inputs', ['DzInput', 'DzInputGroup', 'DzInputMask', 'DzNumberInput', 'DzOtpInput', 'DzPasswordInput', 'DzSearchInput', 'DzTextarea']],
    ['selection', ['DzSelect', 'DzMultiSelect', 'DzCombobox', 'DzListbox', 'DzCascader', 'DzTreeSelect', 'DzTransfer', 'DzRadioGroup', 'DzRadio', 'DzCheckboxGroup', 'DzCheckbox', 'DzSwitch', 'DzPersonaSelector']],
    ['date / time / file', ['DzDatePicker', 'DzDateRangePicker', 'DzTimePicker', 'DzFileUpload']],
    ['sliders & rating', ['DzSlider', 'DzRangeSlider', 'DzKnob', 'DzRating', 'DzColorPicker']],
    ['compound & advanced', ['DzTagsInput', 'DzMention', 'DzFieldArray', 'DzInplace', 'DzFloatLabel', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzFormMessage']],
  ]
  for (const [slice, members] of slices) {
    const open = rows
      .filter(r => members.includes(r.component))
      .flatMap(r => CLAUSES
        .filter(c => r.cells[c].verdict === 'gap')
        .map(c => ({ component: r.component, clause: c, cell: r.cells[c] })))
    lines.push(`### Slice: ${slice} — ${open.length} gap${open.length === 1 ? '' : 's'}`)
    lines.push('')
    if (open.length === 0) {
      lines.push('No open gaps.')
      lines.push('')
      continue
    }
    lines.push('| Control | Clause | What is wrong |')
    lines.push('| --- | --- | --- |')
    for (const o of open)
      lines.push(`| \`${o.component}\` | ${o.clause} ${CLAUSE_TITLES[o.clause]} | ${esc(o.cell.note)} |`)
    lines.push('')
  }

  lines.push('## Deferred to TASK-FORM-OSS-03')
  lines.push('')
  const future = rows.flatMap(r => CLAUSES.filter(c => r.cells[c].verdict === 'future').map(c => ({ r, c })))
  lines.push(`${future.length} cells wait on a seam Core does not have. They are listed as \`future\` rather than`)
  lines.push('`gap` because no amount of work on the control alone closes them.')
  lines.push('')
  lines.push('| Control | Clause | Missing |')
  lines.push('| --- | --- | --- |')
  for (const { r, c } of future)
    lines.push(`| \`${r.component}\` | ${c} | ${esc(r.cells[c].note)} |`)
  lines.push('')

  return `${lines.join('\n')}\n`
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
  const write = process.argv.includes('--write')
  const listGaps = process.argv.includes('--gaps')
  const { rows, problems } = build()
  const rendered = render(rows)

  if (listGaps) {
    for (const row of rows) {
      for (const clause of CLAUSES) {
        const cell = row.cells[clause]
        if (cell.verdict === 'gap')
          console.error(`${row.component.padEnd(20)} ${clause}  ${cell.note}`)
      }
    }
  }

  if (write) {
    writeFileSync(MATRIX_PATH, rendered, 'utf8')
    console.error(`form-readiness: wrote ${MATRIX_PATH.slice(ROOT.length + 1)} (${rows.length} controls)`)
  }

  // Compared with line endings normalised, written with LF: a Windows editor
  // that rewrites the file as CRLF has not changed a single fact in it, and a
  // gate that called that "stale" would be wrong every time it fired.
  const committed = existsSync(MATRIX_PATH)
    ? readFileSync(MATRIX_PATH, 'utf8').replace(/\r\n/g, '\n')
    : null
  if (!write && committed !== rendered) {
    problems.push(
      committed === null
        ? 'docs/program-2026-08/form-controls-readiness-matrix.md does not exist — run yarn generate:form-readiness'
        : 'docs/program-2026-08/form-controls-readiness-matrix.md is stale — run yarn generate:form-readiness',
    )
  }

  if (problems.length > 0) {
    console.error('\nform-readiness: FAIL')
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }

  const total = counts(rows)
  console.error(
    `form-readiness: OK — ${rows.length} controls, `
    + `${total.pass} pass, ${total.gap} gap, ${total.future} future, ${total.unrun} unrun, ${total['n-a']} n-a`,
  )
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('form-readiness.ts'))
  main()
