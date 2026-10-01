/**
 * Capability/evidence matrix generator (TASK-OSS-P5-06).
 *
 * Joins every artifact P5-01…05 produce into
 * `packages/core/docs/capability-matrix.json`, which
 * `apps/storybook/stories/Capability-Matrix.mdx` renders.
 *
 * **The rule that shapes everything here: a missing input turns a column
 * `unrun`, and the file says so.** A generator that quietly emitted `unrun` for
 * a browser cell would be indistinguishable whether the matrix had never run or
 * had run and failed — so `inputs` records which artifacts were found, and the
 * page prints it above the table.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-capability-matrix.ts
 */

import type { EvidenceKind } from '@dzup-ui/contracts'
import type { VisualLedger } from '../validators/visual-baselines.ts'
import type { AtMatrixIndex } from './at-matrix.ts'
import type { BrowserEvidenceLedger } from './browser-evidence.ts'
import type { CapabilityMatrix, CapabilityRow, CellState, EvidenceCell, VisualEvidence } from './capability-matrix.ts'
import type { QualityMatrixRow } from './generate-quality-matrix.ts'
import type { ComponentDeclaration } from './spec-contract-surfaces.ts'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { perfInputGate, perfInputNote, readCaptureEnvironment } from '../perf/capture-environment.ts'
import { readBaselineFile } from '../perf/read-baselines.ts'
import { checkStoryDod } from '../validators/story-dod.ts'
import { resolveAtManual } from './at-matrix.ts'
import { BROWSER_EVIDENCE_PATH, cellKey, readBrowserEvidence, readDeclaredMatrixProjects } from './browser-evidence.ts'
import { CAPABILITY_SCHEMA_VERSION, CELL_STATES, emptyTally } from './capability-matrix.ts'
import { renderCapabilityData } from './emit-capability-data.ts'
import { AT_MATRIX_INDEX } from './generate-at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'
import { evidenceIsCurrent, headCommit, lastCommitFor } from './git.ts'
import { filesExercising } from './spec-capability-refs.ts'
import { missingContractSurfaces, unitSpecGap } from './spec-contract-surfaces.ts'

export const CAPABILITY_MATRIX_PATH = resolve(ROOT, 'packages/core/docs/capability-matrix.json')

/** The narrowed projection the Storybook page imports. */
export const CAPABILITY_DATA_PATH = resolve(
  ROOT,
  'apps/storybook/stories/_data/capability.generated.ts',
)

/**
 * Playwright's JSON reporter output — **no longer read here** (TASK-R2-O1).
 *
 * Kept as a named constant and a signpost, because deriving the path again from
 * the Playwright docs is exactly what a future reader would do. Three measured
 * reasons it cannot be this generator's input:
 *
 *  - `.gitignore` excludes `test-results/`, so a fresh clone had no browser
 *    evidence at all and every Tier B–D cell read `unrun` (N0-05 finding F4).
 *  - Playwright **empties `outputDir` at the start of every run**. The
 *    2026-08-25 chromium record that N1-O2 decision D1 set out to protect, and
 *    that TASK-R2-O5 declined to overwrite for that reason, was destroyed by
 *    R2-O5's own sweep on 2026-09-18. It is gone.
 *  - Its presence was read as a *boolean*: one chromium/default run made all 88
 *    components read `pass` on all three engines, because the file cannot say
 *    which of the 24 projects ran.
 *
 * The tracked projection `e2e/matrix/browser-evidence.json` replaces it. The
 * report is still what produces the numbers — `yarn generate:browser-evidence`
 * reads it — it is just not what the matrix *cites*.
 */
const PLAYWRIGHT_REPORT_SUPERSEDED = 'test-results/matrix-report.json'
const KNOWN_FAILURES = resolve(ROOT, 'e2e/matrix/known-failures.json')

/**
 * The committed per-engine browser-lane ledger (TASK-N1-O2).
 *
 * The Playwright report is git-ignored, so it can say *whether* a lane ran and
 * nothing durable about *which of the 24 projects* did. Reading engine
 * coverage from a committed file instead is what lets a `browser-matrix` cell
 * distinguish "chromium only, two of six conditions" from "three engines, six
 * conditions each" — which is the whole claim the row is making.
 */
const ENGINE_RATCHETS = resolve(ROOT, 'e2e/matrix/engine-ratchets.json')

/**
 * The visual-baseline acceptance ledger (TASK-N1-O6) — the fifth *generated*
 * input, and the sixth entry in `inputs`.
 *
 * It is read rather than the snapshot directories themselves for the same
 * reason `browser-matrix` reads `engine-ratchets.json` rather than counting
 * PNGs: a file on disk says an image exists, and the question the matrix is
 * asking is whether somebody accepted it, when, and against which commit.
 * `yarn validate:visual-baselines` is what keeps the ledger and the images in
 * agreement, so this generator can trust one file.
 */
const VISUAL_BASELINES = resolve(ROOT, 'e2e/visual/visual-baselines.json')

/**
 * Every matrix condition, in the order `playwright.config.ts` declares them.
 *
 * The count is derived from this list wherever it is printed (TASK-R2-O5): the
 * sentences below used to spell `/6` by hand, so the day the lane gained the
 * SC 1.4.4 and SC 1.4.12 conditions, a coverage note would have read
 * `6/6 conditions` about a lane with eight of them.
 *
 * TASK-R2-O1: it is no longer a *copy* of that list either. It is read from
 * `playwright.config.ts` at load, because the transcription R2-O5 corrected had
 * been wrong for exactly as long as it had existed, and a second correct copy is
 * a copy waiting to go wrong.
 */
const MATRIX_CONDITIONS: readonly string[] = readDeclaredMatrixProjects().conditions

interface EngineRatchets {
  engines: Record<string, {
    version: string
    conditionsRun: string[]
    notReproducing: { component: string, condition: string }[]
    engineOnly: { component: string, condition: string }[]
  }>
  /**
   * The host the divergences were measured on, and the commit and cleanliness of
   * the tree at the time.
   *
   * Declared in the file since TASK-N1-O2 and never read here until RESIDUAL-09
   * needed it for this input's `gate.platform`. Optional because a ledger written
   * before the field existed is still readable.
   */
  platform?: string
  measuredAt?: string
  sourceCommit?: string
  worktreeDirty?: boolean
}

/**
 * The `gate` block an input may declare: where its evidence was produced, where a
 * gate for it would have to run, and whether it can fail CI **today**
 * (TASK-S1-O3).
 *
 * Restated as a named type by RESIDUAL-09, when four more inputs needed it. The
 * two functions that predate it (`perfInputGate`, `visualInputGate`) keep their
 * inline structural return types, which are identical.
 */
interface InputGate {
  platform: string
  authoritative: string
  ciGate: boolean
  blockedOn?: string
}

// ---------------------------------------------------------------------------
// Source scanning
// ---------------------------------------------------------------------------

function collect(dir: string, suffix: string, out: string[] = []): string[] {
  if (!existsSync(dir))
    return out
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry !== 'node_modules')
        collect(full, suffix, out)
    }
    else if (full.endsWith(suffix)) {
      out.push(full)
    }
  }
  return out
}

function rel(path: string): string {
  return path.replace(ROOT, '').replaceAll('\\', '/').replace(/^\//, '')
}

/**
 * Files under `dir` that **exercise `kind`** for the component — not merely name
 * it, and no longer merely load it either.
 *
 * Two corrections, in two packets, to one helper:
 *
 *  - It used to be `filesMentioning`, a word-boundary substring match over the
 *    whole file text, and it was wrong in a way no gate could see: a component
 *    named in a header comment, or in a sentence saying it is tested *somewhere
 *    else*, acquired a published evidence citation. RESIDUAL-02 discovered it by
 *    writing such a comment and watching a citation appear; RESIDUAL-05 measured
 *    the standing damage (**8 of 201** citations) and made the rule structural —
 *    the module must be **loaded**.
 *  - It then became `filesLoading`, which RESIDUAL-05's own docblock said proved
 *    nothing about what the spec *asserts*. RESIDUAL-16 censused all 1,634
 *    published citations and measured that gap: **`portal-hydration` called this
 *    with the same arguments as `ssr-sample`**, so 16 of its 19 citations named a
 *    spec that never reaches a teleport, and `DzAccordion`'s `ssr-sample` cited an
 *    `it.skip`. Loading is now the floor and not the ceiling: a **live** test block
 *    must also do the thing the cell claims. The per-kind rule is in
 *    `spec-capability-refs.ts`.
 *  - RESIDUAL-17 then wrote the missing harness
 *    (`packages/core/tests/ssr/portal-hydration.spec.ts`) and tightened
 *    `portal-hydration` to require a **hydration** as well, plus the anchor pair in
 *    the asserted output — because `open: true` in a call turned out not to mean the
 *    branch was taken at all: `DzCommandPalette` opened emits 27 bytes with a false
 *    `v-if` and an empty `ctx.teleports`, since Reka UI's `*Portal` does not render
 *    on the server.
 *
 * `rel` is passed in rather than imported there, so the path-shortening stays a
 * property of this generator.
 */
function filesExercisingCapability(
  files: readonly { path: string, source: string }[],
  component: string,
  kind: Parameters<typeof filesExercising>[2],
) {
  return filesExercising(files, component, kind, rel)
}

// ---------------------------------------------------------------------------
// The join
// ---------------------------------------------------------------------------

interface Sources {
  componentFiles: Set<string>
  a11ySpecs: { path: string, source: string }[]
  ssrSpecs: { path: string, source: string }[]
  storyDod: Map<string, Set<string>>
  /** story check id → the components the check was ASKED of (RESIDUAL-16). */
  storyApplicable: Map<string, Set<string>>
  /** story check id → the components whose story SATISFIES it (RESIDUAL-16). */
  storyPassing: Map<string, Set<string>>
  storyFile: Map<string, string>
  // The real type, not a structural restatement of it (TASK-R2-O2). The inline
  // shape this replaces named four fields and omitted `tasks`, `tier` and the
  // result *values* — which is how the resolver came to be written against a
  // row it could not see the outcome of. Importing the type makes the next
  // scaffold field a compile error here rather than a silent no-op.
  atIndex?: AtMatrixIndex
  baselines?: ReturnType<typeof readBaselineFile>
  /** The declared perf capture host (TASK-S1-O4) — what makes `perf-baselines.gate` answerable. */
  captureEnvironment?: ReturnType<typeof readCaptureEnvironment>
  /** The tracked browser ledger (TASK-R2-O1), replacing the git-ignored report. */
  browserEvidence?: BrowserEvidenceLedger
  knownFailures: Set<string>
  engineRatchets?: EngineRatchets
  visual?: VisualLedger
}

/**
 * Per-engine state for one component's `browser-matrix` cell.
 *
 * Returns one sentence per engine that ran the lane, naming how much of the
 * six-condition sweep that engine covered and which conditions the ledgers
 * expect to fail on it. An engine absent from the ledger is absent from the
 * sentence — silence here would read as a pass.
 */
function browserEngineNote(component: string, sources: Sources): string | undefined {
  const ratchets = sources.engineRatchets
  if (ratchets === undefined)
    return undefined

  const parts: string[] = []
  for (const [engine, state] of Object.entries(ratchets.engines)) {
    const ran = state.conditionsRun.length
    const withdrawn = new Set(
      state.notReproducing.filter(e => e.component === component).map(e => e.condition),
    )
    const expected = [
      ...[...sources.knownFailures]
        .filter(k => k.startsWith(`${component}:`))
        .map(k => k.split(':')[1]!)
        .filter(c => !withdrawn.has(c)),
      ...state.engineOnly.filter(e => e.component === component).map(e => e.condition),
    ].sort()
    const failing = expected.filter(c => state.conditionsRun.includes(c))
    // A ledger entry for a condition this engine never ran is neither a pass
    // nor a failure here, and saying "no expected failure" would read as the
    // former. Naming the gap is the whole point of the coverage sentence.
    const uncovered = expected.filter(c => !state.conditionsRun.includes(c))

    const coverage = ran === MATRIX_CONDITIONS.length
      ? `all ${MATRIX_CONDITIONS.length} conditions`
      : `${ran}/${MATRIX_CONDITIONS.length} conditions (${state.conditionsRun.join(', ')})`
    const verdict = failing.length === 0
      ? 'no expected failure in what it ran'
      : `expected failure in ${failing.join(', ')}`
    const gap = uncovered.length === 0
      ? ''
      : `, and did not run ${uncovered.join(', ')} — where the ledger expects a failure`
    const diverged = withdrawn.size === 0
      ? ''
      : `; the cross-engine expectation for ${[...withdrawn].sort().join(', ')} is withdrawn `
        + `on this engine (measured divergence in e2e/matrix/engine-ratchets.json)`
    parts.push(`${engine} ${state.version}: ${coverage}, ${verdict}${gap}${diverged}`)
  }

  return parts.length === 0 ? undefined : parts.join('. ')
}

function loadSources(): Sources {
  const componentsDir = resolve(ROOT, 'packages/core/src/components')
  const providersDir = resolve(ROOT, 'packages/core/src/providers')
  const componentFiles = new Set(
    [...collect(componentsDir, '.ts'), ...collect(providersDir, '.ts')].map(rel),
  )

  const read = (paths: string[]) => paths.map(path => ({ path, source: readFileSync(path, 'utf8') }))

  // story check id → set of components that FAIL it, and set of components it was
  // ASKED of at all.
  //
  // The second map is RESIDUAL-16's correction. This used to invert `violations`
  // alone — "a component absent from the failing set passed the check" — and that
  // is true of a component the check passed AND of a component it does not apply
  // to. `states` derives applicability from the component's own `.types.ts`
  // (`applies: ctx => ctx.stateProps.length > 0`, which is how the DoD's "as
  // applicable" clause was finally made to mean something), so 27 components with
  // no state prop, no `States` story and nothing to put in one published
  // `state-stories: pass` with their story file printed beside it as evidence.
  const storyDod = new Map<string, Set<string>>()
  const storyApplicable = new Map<string, Set<string>>()
  const storyPassing = new Map<string, Set<string>>()
  const storyFile = new Map<string, string>()
  const componentOf = (file: string) => basename(file.replaceAll('\\', '/'), '.stories.ts')
  for (const result of checkStoryDod()) {
    const failing = new Set<string>()
    for (const violation of result.violations)
      failing.add(componentOf(violation.file))
    storyDod.set(result.id, failing)
    storyApplicable.set(result.id, new Set(result.applicableFiles.map(componentOf)))
    storyPassing.set(result.id, new Set(result.passingFiles.map(componentOf)))
  }
  for (const path of collect(resolve(ROOT, 'packages/core/stories'), '.stories.ts'))
    storyFile.set(basename(path, '.stories.ts'), rel(path))

  const knownFailures = new Set<string>()
  if (existsSync(KNOWN_FAILURES)) {
    const ledger = JSON.parse(readFileSync(KNOWN_FAILURES, 'utf8')) as {
      entries: { component: string, condition: string }[]
    }
    for (const entry of ledger.entries)
      knownFailures.add(`${entry.component}:${entry.condition}`)
  }

  return {
    componentFiles,
    a11ySpecs: read(collect(resolve(ROOT, 'packages/core/tests/a11y'), '.spec.ts')),
    ssrSpecs: read(collect(resolve(ROOT, 'packages/core/tests/ssr'), '.spec.ts')),
    storyDod,
    storyApplicable,
    storyPassing,
    storyFile,
    atIndex: existsSync(AT_MATRIX_INDEX)
      ? JSON.parse(readFileSync(AT_MATRIX_INDEX, 'utf8'))
      : undefined,
    baselines: readBaselineFile(),
    captureEnvironment: readCaptureEnvironment(),
    browserEvidence: readBrowserEvidence(),
    knownFailures,
    engineRatchets: existsSync(ENGINE_RATCHETS)
      ? JSON.parse(readFileSync(ENGINE_RATCHETS, 'utf8'))
      : undefined,
    visual: existsSync(VISUAL_BASELINES)
      ? JSON.parse(readFileSync(VISUAL_BASELINES, 'utf8'))
      : undefined,
  }
}

/**
 * One component's visual-baseline coverage (TASK-N1-O6).
 *
 * The scope is declared by FAMILY in the ledger and joined here against the
 * quality matrix, which is the same join `e2e/visual/coverage.ts` performs
 * against `targets.generated.ts`. Two joins over the same declaration rather
 * than one shared list, because the lane runs in Playwright and the matrix runs
 * in tsx, and `validate:visual-baselines` fails if they ever disagree about
 * which components a covered family contains.
 *
 * A component outside the scope is `not-covered` and says why, with its
 * rollout position. It is never `unknown`: an undeclared state would be
 * indistinguishable from a lane nobody ran, which is the exact confusion the
 * `inputs` table at the top of this file exists to prevent.
 */
function resolveVisual(
  row: QualityMatrixRow,
  sources: Sources,
  componentCommit: string,
): VisualEvidence {
  const ledger = sources.visual
  if (ledger === undefined) {
    return {
      state: 'not-covered',
      baselines: 0,
      themes: [],
      artifacts: [],
      note: 'No e2e/visual/visual-baselines.json, so no component has an accepted baseline. '
        + 'That is an absent input, not a failed one.',
    }
  }

  const scope = `families [${ledger.scope.families.join(', ')}] on ${ledger.scope.platform}`
  if (!ledger.scope.families.includes(row.family)) {
    return {
      state: 'not-covered',
      baselines: 0,
      themes: [],
      artifacts: ['e2e/visual/visual-baselines.json'],
      note: `The per-component visual lane covers ${scope}; \`${row.family}\` is not in scope `
        + `yet. Ranked for rollout in docs/program-2026-09/reports/`
        + `N1-O6-visual-regression-handoff.md.`,
    }
  }

  const mine = ledger.baselines
    .filter(b => b.component === row.component && b.platform === ledger.scope.platform)
  const themes = [...new Set(mine.map(b => b.theme))].sort()
  const artifacts = [
    'e2e/visual/component-baselines.spec.ts',
    'e2e/visual/visual-baselines.json',
    ...mine.map(b => b.file).sort(),
  ]

  const owed = ledger.scope.themes.filter(theme => !themes.includes(theme))
  if (owed.length > 0) {
    return {
      state: 'not-covered',
      baselines: mine.length,
      themes,
      artifacts,
      note: `In a covered family and missing an accepted baseline for ${owed.join(', ')}. `
        + `\`yarn validate:visual-baselines\` fails on this.`,
    }
  }

  const stale = mine.filter(b => !evidenceIsCurrent(b.sourceCommit, componentCommit))
  if (stale.length > 0) {
    return {
      state: 'stale',
      baselines: mine.length,
      themes,
      artifacts,
      note: `${stale.length}/${mine.length} baseline(s) were captured before the component's `
        + `last change (${componentCommit.slice(0, 8)}) — a pass about different code.`,
    }
  }

  return {
    state: 'covered',
    baselines: mine.length,
    themes,
    artifacts,
    note: `${mine.length} accepted baseline(s), ${themes.join(' + ')}, `
      + `${ledger.scope.engine}/${ledger.scope.platform}, ${ledger.scope.direction}. ${
        ledger.scope.platform === ledger.scope.ciPlatform
          ? 'Gating platform matches CI.'
          : `CI runs ${ledger.scope.ciPlatform}, so this is developer-local evidence, not a CI gate.`}`,
  }
}

/** Does `packages/core/src/**\/Dz{Name}{suffix}` exist? */
function sidecar(sources: Sources, row: QualityMatrixRow, suffix: string): string | undefined {
  const dir = row.source.replace(/\/[^/]+$/, '')
  const path = `${dir}/${row.component}${suffix}`
  return sources.componentFiles.has(path) ? path : undefined
}

/**
 * Whether a story-dod check passed for this component's story file.
 *
 * Four answers, not two (RESIDUAL-16), and the order matters:
 *
 *  1. no story file at all → `unrun`;
 *  2. **the story satisfies the check** → `pass`, whatever applicability says. This
 *     arm is first on purpose. `states` derives applicability from the props a
 *     component's own `.types.ts` spells, so nine components that inherit
 *     `disabled`/`readonly` from `BaseFormControlProps` are never asked — and nine
 *     of them export a `States` story anyway. Asking applicability first would
 *     demote `DzInput`'s real `States` story to "nothing to demonstrate";
 *  3. it does not, and the check **does not apply** → `excepted`, with the reason.
 *     A component declaring none of `disabled`, `loading`, `readonly`, `invalid`,
 *     `error`, `required` has no state to demonstrate, which is what the DoD's "as
 *     applicable" has always meant. An exception a reader can check, not a pass;
 *  4. it does not, and the check **did** apply → `unrun`.
 *
 * Arms 2 and 3 are what RESIDUAL-16 added. Both used to be `pass`, because the
 * only question asked was "is this component absent from the failing set?" — and a
 * component the check never asked is absent from it too.
 *
 * Exported so a regression spec can drive it with fabricated maps. The `at-manual`
 * resolution was inline for a year and shipped a defect a test could not reach
 * (TASK-R2-O2); this one published 27 false `pass` cells for four packets, and the
 * reason nobody caught it is the same reason.
 */
export function storyCheck(
  sources: Pick<Sources, 'storyFile' | 'storyPassing' | 'storyApplicable' | 'storyDod'>,
  component: string,
  check: string,
): { state: CellState, note?: string } {
  if (!sources.storyFile.has(component))
    return { state: 'unrun' }
  if (sources.storyPassing.get(check)?.has(component) === true)
    return { state: 'pass' }
  const applicable = sources.storyApplicable.get(check)
  if (applicable !== undefined && !applicable.has(component)) {
    return {
      state: 'excepted',
      note: `The \`${check}\` story check does not apply to this component — `
        + '`packages/tooling/src/validators/story-dod.ts` derives applicability from the '
        + 'component\'s own `.types.ts`, and there is nothing here for the story to show. '
        + 'This read `pass` until RESIDUAL-16: "absent from the failing set" was inverted as '
        + '"passed", and a check that was never asked is absent from it too.',
    }
  }
  return { state: 'unrun' }
}

/**
 * One story-derived cell, with the citation the state actually supports.
 *
 * A story file is evidence that the story exists. Where the check does not apply
 * it is evidence of nothing, so the cell cites the component's **`.types.ts`**
 * instead — the file `story-dod.ts` reads to decide applicability, and therefore
 * the one a reader has to open to check the exception.
 */
function storyCell(
  kind: EvidenceKind,
  origin: string,
  sources: Sources,
  row: QualityMatrixRow,
  check: string,
  story: string | undefined,
): EvidenceCell {
  const { state, note } = storyCheck(sources, row.component, check)
  const types = sidecar(sources, row, '.types.ts')
  const artifacts = state === 'excepted'
    ? (types === undefined ? [] : [types])
    : (story === undefined ? [] : [story])
  return cell(kind, origin, { state, artifacts, note })
}

/**
 * A `contract-spec` / `unit-spec` cell for a sidecar spec that exists (RESIDUAL-19).
 *
 * Both kinds were `present` on **file existence** until this packet. The cell names
 * what it claims — `@dzup-ui/contracts` documents `contract-spec` as *"Contract
 * Spec v1 props/events/slots/ARIA"* and `unit-spec` as *"render and behaviour
 * units"* — and a census of all 283 citations at `4e4e46f` found 80 contract specs
 * that never touch a surface the component itself declares, and 14 unit specs that
 * never drive a component that emits. The rule, its terms and its stated limits are
 * in `spec-contract-surfaces.ts`.
 *
 * A spec that falls short is `unrun` **with the spec still cited**. That is the
 * shape the Tier D gate already reads as "a gap somebody has made a place for",
 * and it is the truth: the file is there, and the note names what it does not yet
 * do. It is never `present` with a caveat — a caveat on a credited cell is how
 * this column came to mean "a file exists".
 *
 * Exported, and pure over its four arguments, so a regression spec can drive it
 * with fabricated sources — the reason `storyCheck` is exported, for the reason
 * written there.
 */
export function sidecarSpecCell(
  kind: 'contract-spec' | 'unit-spec',
  declaration: ComponentDeclaration,
  path: string,
  specSource: string,
): { state: CellState, artifacts: string[], note?: string } {
  if (kind === 'contract-spec') {
    const missing = missingContractSurfaces(declaration, specSource)
    if (missing.length === 0)
      return { state: 'present', artifacts: [path] }
    return {
      state: 'unrun',
      artifacts: [path],
      note: `The contract spec exists and does not touch ${missing.map(s => `\`${s}\``).join(', ')} — `
        + `${missing.length === 1 ? 'a surface' : 'surfaces'} this component declares. Contract Spec v1 is `
        + 'props/events/slots/ARIA; a surface is owed only when the component\'s own `.types.ts` or '
        + 'template declares it (`packages/tooling/src/quality/spec-contract-surfaces.ts`). '
        + 'This read `present` until RESIDUAL-19, on the file existing.',
    }
  }
  const gap = unitSpecGap(declaration, specSource)
  if (gap === undefined)
    return { state: 'present', artifacts: [path] }
  return {
    state: 'unrun',
    artifacts: [path],
    note: gap === 'no-behaviour'
      ? 'The unit spec exists and renders the component, and no live test drives it: the component '
      + 'calls `defineEmits`/`defineModel`, and nothing here triggers an event, sets a value, changes a '
      + 'prop or reads what was emitted. `unit-spec` is "render and behaviour units" '
      + '(`packages/tooling/src/quality/spec-contract-surfaces.ts`). This read `present` until '
      + 'RESIDUAL-19, on the file existing.'
      : 'The unit spec exists and holds no live test with an assertion.',
  }
}

function cell(
  kind: EvidenceKind,
  origin: string,
  input: Partial<EvidenceCell> & { state: CellState },
): EvidenceCell {
  return {
    kind,
    origin,
    scope: input.scope ?? 'component',
    state: input.state,
    artifacts: input.artifacts ?? [],
    ...(input.note === undefined ? {} : { note: input.note }),
  }
}

/** Resolve one evidence row for one component. */
function resolveCell(
  kind: EvidenceKind,
  row: QualityMatrixRow,
  sources: Sources,
  componentCommit: string,
): EvidenceCell {
  const origin = row.evidenceOrigin[kind] ?? 'unattributed'
  const exception = row.exceptions?.[kind]
  if (exception !== undefined)
    return cell(kind, origin, { state: 'excepted', note: exception })

  const story = sources.storyFile.get(row.component)

  switch (kind) {
    case 'contract-spec':
    case 'unit-spec': {
      const path = sidecar(sources, row, kind === 'contract-spec' ? '.contract.spec.ts' : '.spec.ts')
      if (path === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const types = sidecar(sources, row, '.types.ts')
      return cell(kind, origin, sidecarSpecCell(
        kind,
        {
          component: row.component,
          types: types === undefined ? '' : readFileSync(resolve(ROOT, types), 'utf8'),
          vue: readFileSync(resolve(ROOT, row.source), 'utf8'),
        },
        path,
        readFileSync(resolve(ROOT, path), 'utf8'),
      ))
    }

    case 'axe': {
      const hits = filesExercisingCapability(sources.a11ySpecs, row.component, 'axe')
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
        note: hits.length === 0
          ? 'No a11y spec runs axe over a tree containing this component in a test that runs.'
          : undefined,
      })
    }

    case 'ssr-sample': {
      const hits = filesExercisingCapability(sources.ssrSpecs, row.component, 'ssr-sample')
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
        note: hits.length === 0
          ? 'No SSR spec server-renders this component in a test that runs.'
          : undefined,
      })
    }

    case 'portal-hydration': {
      const hits = filesExercisingCapability(sources.ssrSpecs, row.component, 'portal-hydration')
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
        // Both notes name exactly what is and is not evidenced. RESIDUAL-16
        // censused all 19 citations this cell used to publish: three took the
        // portal branch and NONE hydrated. RESIDUAL-17 wrote the harness
        // (`packages/core/tests/ssr/portal-hydration.spec.ts`), so the kind now
        // requires the server render, the anchor pair in the ASSERTED OUTPUT and
        // a hydration — and measured that 20 of the 24 components cannot meet it
        // for a structural reason, which the `unrun` note names.
        note: hits.length === 0
          ? 'No spec server-renders this component with its portal branch taken AND hydrates the '
          + 'result. Measured (RESIDUAL-17): this component portals through a Reka UI `*Portal` '
          + 'primitive, which renders NOTHING on the server — `renderToString` emits a false '
          + '`v-if` and `ctx.teleports` is empty — so there is no teleported content for SSR to '
          + 'preserve and none for hydration to match. `open: true` in a test call is not '
          + 'evidence the branch was taken; the anchor pair in the output is. Asserted in '
          + '`packages/core/tests/ssr/portal-hydration.spec.ts`, so this reason goes red the day '
          + 'it stops being true.'
          : 'Server-rendered with the portal branch taken (the teleport anchor pair asserted), '
            + 'the teleported markup read from `renderToString`\'s SSR context, then hydrated with '
            + 'ZERO bytes of the component\'s own output rewritten. What is NOT evidenced is '
            + 'whether hydration CLAIMS server-rendered content sitting in the teleport target '
            + 'rather than re-creating it: a minimal `<Teleport to="body">` control mismatches the '
            + 'same way under a hand-placed target in jsdom, so that half needs a real SSR '
            + 'document in a real engine — owner decision `D-RES17-1`.',
      })
    }

    case 'token-contrast': {
      // Corpus-scope on purpose: `validate:tokens` proves every colour pair in
      // the repository, which is real evidence and is not about this component.
      return cell(kind, origin, {
        state: 'pass',
        scope: 'corpus',
        artifacts: ['packages/tooling/src/token-checks/intent-text-contrast.ts'],
        note: 'Corpus gate: `yarn validate:tokens` covers every pair in the catalog at once.',
      })
    }

    case 'story-light-dark':
      return storyCell(kind, origin, sources, row, 'dark-mode', story)

    case 'state-stories':
      return storyCell(kind, origin, sources, row, 'states', story)

    case 'a11y-narrative':
      return storyCell(kind, origin, sources, row, 'accessibility', story)

    case 'real-world-story':
      return storyCell(kind, origin, sources, row, 'real-world', story)

    case 'browser-play':
      return storyCell(kind, origin, sources, row, 'play', story)

    case 'data-scenarios': {
      if (story === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const source = readFileSync(resolve(ROOT, story), 'utf8')
      const has = /export const (?:Empty|Loading|Error|Large|ManyRows|Skeleton)/.test(source)
      return cell(kind, origin, { state: has ? 'present' : 'unrun', artifacts: [story] })
    }

    // TASK-R5-O5 replaced the regex boolean here.
    //
    // It used to test the unit spec against
    // `/Arrow(?:Up|Down|Left|Right)|['"]Tab['"]|['"]Escape['"]|['"]Enter['"]|keydown/`
    // and report `present` on a single hit — *that* some key is asserted, never
    // *which*. A component declaring nine bindings and asserting one scored the
    // same as a component asserting all nine, and the docs had nothing better
    // to render than "not yet derived".
    //
    // Now the component's own declared keyboard contract is the yardstick: the
    // cell measures how many of the keys the component PROMISES its spec
    // actually exercises, and names the ones it does not. Where no contract is
    // declared the old presence test still applies — that is the honest floor
    // for a component that has not written its contract down, and the note says
    // so rather than scoring it as if it had.
    case 'keyboard-spec': {
      const path = sidecar(sources, row, '.spec.ts')
      if (path === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const source = readFileSync(resolve(ROOT, path), 'utf8')
      const anatomyPath = sidecar(sources, row, '.anatomy.ts')
      const contract = anatomyPath === undefined
        ? undefined
        : parseAnatomySource(readFileSync(resolve(ROOT, anatomyPath), 'utf8'), anatomyPath)
          .anatomy
          ?.keyboard

      if (contract === 'none') {
        return cell(kind, origin, {
          state: 'excepted',
          artifacts: [path],
          note: 'The component declares `keyboard: \'none\'` — an explicit claim that it has no '
            + 'keyboard behaviour of its own, so there is no key sequence for a spec to assert.',
        })
      }

      if (contract === undefined) {
        const has = /Arrow(?:Up|Down|Left|Right)|['"]Tab['"]|['"]Escape['"]|['"]Enter['"]|keydown/
          .test(source)
        return cell(kind, origin, {
          state: has ? 'present' : 'unrun',
          artifacts: has ? [path] : [],
          note: has
            ? 'Presence only: the component declares no keyboard contract, so this measures that '
            + 'SOME key is asserted, not which. Declare `keyboard` in its anatomy to measure the '
            + 'keys it promises.'
            : 'The unit spec exists and asserts no key sequence.',
        })
      }

      // Each declared key, as the spec would have to spell it. `' '` is written
      // as `' '` or as `'Space'` in practice, and both count.
      const unasserted = contract
        .map(b => b.key)
        .filter((key, index, all) => all.indexOf(key) === index)
        .filter((key) => {
          if (key.startsWith('<'))
            return false // a character class — no single literal to look for
          const spellings = key === ' ' ? ['\' \'', '"Space"', '\'Space\''] : [`'${key}'`, `"${key}"`]
          return !spellings.some(s => source.includes(s))
        })
      const declared = contract.length
      return cell(kind, origin, {
        state: unasserted.length === 0 ? 'present' : 'unrun',
        artifacts: [path],
        note: unasserted.length === 0
          ? `All ${declared} declared binding(s) are exercised by the unit spec.`
          : `The component declares ${declared} binding(s); the unit spec asserts no key event for `
            + `${unasserted.map(k => `\`${k === ' ' ? 'Space' : k}\``).join(', ')}. `
            + 'The contract is the yardstick, not the presence of any key at all.',
      })
    }

    case 'controlled-uncontrolled': {
      const path = sidecar(sources, row, '.spec.ts')
      if (path === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const source = readFileSync(resolve(ROOT, path), 'utf8')
      const has = /update:modelValue/.test(source) && /defaultValue|uncontrolled/i.test(source)
      return cell(kind, origin, {
        state: has ? 'present' : 'unrun',
        artifacts: has ? [path] : [],
        note: has
          ? undefined
          : 'The unit spec does not exercise both a controlled and an uncontrolled value path.',
      })
    }

    case 'rtl-contract': {
      const path = sidecar(sources, row, '.anatomy.ts')
      if (path === undefined) {
        return cell(kind, origin, {
          state: 'unrun',
          note: 'No anatomy, so no declared RTL contract. The logical-property migration in '
            + 'TASK-OSS-P4-05 covered the whole catalog; only the declaration is missing.',
        })
      }
      const declares = /\brtl\s*:/.test(readFileSync(resolve(ROOT, path), 'utf8'))
      return cell(kind, origin, {
        state: declares ? 'present' : 'unrun',
        artifacts: declares ? [path, 'packages/core/docs/rtl-matrix.md'] : [],
      })
    }

    case 'browser-matrix': {
      const evidence = sources.browserEvidence
      if (evidence === undefined) {
        return cell(kind, origin, {
          state: 'unrun',
          note: `No tracked browser ledger at ${rel(BROWSER_EVIDENCE_PATH)}. Run the lane into a `
            + 'Playwright JSON report (PLAYWRIGHT_JSON_OUTPUT, written OUTSIDE test-results/) '
            + 'and project it with `yarn generate:browser-evidence --report <path>`.',
        })
      }

      const entry = evidence.components.find(c => c.component === row.component)
      if (entry === undefined) {
        return cell(kind, origin, {
          state: 'unrun',
          artifacts: [rel(BROWSER_EVIDENCE_PATH)],
          note: `${row.component} is not a target of the browser matrix: `
            + '`e2e/matrix/targets.generated.ts` covers Tier B–D. That is a scope statement, '
            + 'not a result.',
        })
      }

      // Per-project counting, not a boolean over one file. The whole claim a
      // browser cell makes is "three engines × eight conditions", and the input
      // this replaced could not distinguish that from one chromium project.
      const runs = new Map(evidence.runs.map(r => [cellKey(r.engine, r.condition), r]))
      const failing: string[] = []
      const missing: string[] = []
      const staleProjects: string[] = []
      let passed = 0
      for (const [key, result] of Object.entries(entry.cells)) {
        if (result === 'fail') {
          failing.push(key)
          continue
        }
        if (result === 'unrun') {
          missing.push(key)
          continue
        }
        passed++
        const at = runs.get(key)?.sourceCommit
        if (at !== undefined && !evidenceIsCurrent(at, componentCommit))
          staleProjects.push(key)
      }

      const total = Object.keys(entry.cells).length
      const known = [...sources.knownFailures].filter(k => k.startsWith(`${row.component}:`))
      const artifacts = [
        'e2e/matrix/conditions.spec.ts',
        rel(BROWSER_EVIDENCE_PATH),
        'e2e/matrix/known-failures.json',
        ...(sources.engineRatchets === undefined ? [] : ['e2e/matrix/engine-ratchets.json']),
      ]

      // Never resolved upward: a recorded failure outranks a pass in the same
      // cell, and it outranks staleness too (see CellState's contract).
      const state: CellState = failing.length > 0
        ? 'fail'
        : passed === 0
          ? 'unrun'
          : missing.length > 0 || known.length > 0
            ? 'present'
            : staleProjects.length > 0 ? 'stale' : 'pass'

      const commits = [...new Set(
        Object.keys(entry.cells)
          .map(key => runs.get(key))
          .filter(run => run?.state === 'run')
          .map(run => `${run!.sourceCommit}${run!.worktreeDirty === true ? ' (worktree dirty)' : ''}`),
      )].sort()

      const sentences = [
        `${passed}/${total} projects measured green at ${commits.join(', ') || 'no recorded run'}`,
        failing.length === 0 ? undefined : `FAILING in ${failing.join(', ')}`,
        missing.length === 0
          ? undefined
          : `${missing.length} project(s) unrun: ${missing.join(', ')}`,
        staleProjects.length === 0
          ? undefined
          : `${staleProjects.length} measured before the component's last change`,
        known.length === 0
          ? undefined
          : `Known cross-engine failures in ${known.map(k => k.split(':')[1]).join(', ')}; see the ledger.`,
        browserEngineNote(row.component, sources),
      ].filter(part => part !== undefined)

      return cell(kind, origin, { state, artifacts, note: sentences.join('. ') })
    }

    case 'at-manual': {
      const entry = sources.atIndex?.entries.find(e => e.component === row.component)
      if (entry === undefined)
        return cell(kind, origin, { state: 'unrun' })
      // TASK-R2-O2. The resolution used to live here, and it counted rows whose
      // `result !== 'unrun'` without ever reading the value — so an all-`fail`
      // component published `pass` (N1-O4 §6.2). It now lives in
      // `resolveAtManual`, which is a pure function a regression spec drives
      // directly; keeping it inline is what made the defect unreachable by a
      // test for a year.
      const resolved = resolveAtManual(
        entry,
        entry.requiredPairs,
        evidenceIsCurrent,
      )
      return cell(kind, origin, {
        state: resolved.state,
        artifacts: resolved.state === 'unrun' && entry.rows.length === 0 ? [] : [entry.file],
        note: resolved.note,
      })
    }

    case 'perf-baseline': {
      const mine = (sources.baselines?.baselines ?? [])
        .filter(b => b.component === row.component)
      if (mine.length === 0)
        return cell(kind, origin, { state: 'unrun' })
      const measurable = mine.filter(b => b.threshold !== null)
      const staleAt = mine.some(b => !evidenceIsCurrent(b.sourceCommit, componentCommit))
      if (measurable.length === 0) {
        return cell(kind, origin, {
          state: 'present',
          artifacts: ['packages/core/perf/baselines.json'],
          note: `${mine.length} metric(s) measured; none has a threshold — variance exceeds `
            + `signal on this host.`,
        })
      }
      return cell(kind, origin, {
        state: staleAt ? 'stale' : 'pass',
        artifacts: ['packages/core/perf/baselines.json'],
        note: `${measurable.length}/${mine.length} metric(s) have a derived threshold`,
      })
    }

    case 'non-drag-alternative': {
      const path = sidecar(sources, row, '.spec.ts')
      if (path === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const source = readFileSync(resolve(ROOT, path), 'utf8')
      const has = /keyboard|Arrow(?:Up|Down|Left|Right)|' ' |Space/.test(source)
      return cell(kind, origin, {
        state: has ? 'present' : 'unrun',
        artifacts: has ? [path] : [],
        note: has
          ? 'A keyboard path is asserted; whether it covers the whole drag interaction is a '
          + 'review question this cannot answer.'
          : 'The component drags and its spec asserts no keyboard equivalent (WCAG 2.5.7).',
      })
    }

    case 'threat-model':
    case 'malicious-corpus':
    case 'url-policy':
    case 'csp-fixture': {
      const dir = resolve(ROOT, 'packages/core/security')
      const file = `packages/core/security/${row.component}.${kind}.md`
      const spec = `packages/core/security/${row.component}.${kind}.spec.ts`
      const own = [file, spec].filter(p => existsSync(resolve(ROOT, p)))
      // Class-level artifacts (TASK-N1-O5). Thirteen components declare the
      // same `url` boundary and cross it the same way, so their threat model is
      // one document and their corpus is one suite. The per-component filename
      // convention above cannot see either, and the alternative — thirteen stub
      // documents whose only content is a pointer — is the box-ticking this
      // matrix exists to make visible. So a manifest declares which components
      // a shared artifact covers, and the generator checks both the file and
      // the claim.
      const shared = sharedSecurityArtifacts(row.component, kind)
      const found = [...own, ...shared]
      // The state stays `present`, deliberately (TASK-R2-O1). The suite is run
      // and green, and the run record below cites the commit — but `pass` in
      // this matrix means "an artifact exists AND something recorded *this
      // component's* row passing", and the security suites are corpus-level: one
      // green `yarn test` does not resolve to 60 per-component passes. Promoting
      // them would be exactly the aggregate-standing-in-for-components move the
      // scope field exists to prevent. Whether the corpus deserves a `corpus`
      // -scoped `pass` cell of its own is an owner decision, not a generator's.
      const cited = securityCorpusRunNote()
      return cell(kind, origin, {
        state: found.length === 0 ? 'unrun' : 'present',
        artifacts: found.length === 0 ? [] : [...found, 'packages/core/security/coverage.json'],
        note: [
          found.length === 0 && !existsSync(dir)
            ? 'packages/core/security/ does not exist yet.'
            : shared.length > 0 && own.length === 0
              ? 'Covered by a class-level artifact, not a per-component one.'
              : undefined,
          found.length === 0 ? undefined : cited,
        ].filter(part => part !== undefined).join(' ') || undefined,
      })
    }
  }
}

/** One shared security artifact and the components it covers. */
interface SharedSecurityArtifact {
  readonly kind: string
  readonly path: string
  readonly covers: readonly string[]
}

/** The stamped run record TASK-R2-O1 adds beside the coverage declaration. */
interface SecurityCorpusRun {
  readonly ranAt: string
  readonly sourceCommit: string
  readonly worktreeDirty?: boolean
  readonly exitCode: number
  readonly tests: number
  readonly passed: number
  readonly failed: number
}

interface SecurityCoverageManifest {
  readonly artifacts: readonly SharedSecurityArtifact[]
  readonly lastRun?: SecurityCorpusRun
}

/**
 * Class-level security artifacts, read once from
 * `packages/core/security/coverage.json` (TASK-N1-O5).
 *
 * A missing manifest is an absent input, not an error: the matrix falls back to
 * the per-component filename convention exactly as before. A manifest naming a
 * file that does not exist IS an error, because the whole point of the input is
 * that a shared artifact is still an artifact somebody can open.
 */
const SECURITY_COVERAGE: SecurityCoverageManifest = (() => {
  const path = resolve(ROOT, 'packages/core/security/coverage.json')
  if (!existsSync(path))
    return { artifacts: [] }
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as SecurityCoverageManifest
  for (const artifact of parsed.artifacts) {
    if (!existsSync(resolve(ROOT, artifact.path))) {
      throw new Error(
        `packages/core/security/coverage.json claims ${artifact.path} covers `
        + `${artifact.covers.length} component(s); the file does not exist.`,
      )
    }
  }
  return parsed
})()

/**
 * The security corpus's last recorded run, as one citable sentence.
 *
 * A function declaration rather than an inline read so the constant it reads can
 * stay beside the manifest it belongs to, and so the security cells keep citing
 * a run they do not themselves perform.
 */
function securityCorpusRunNote(): string | undefined {
  const run = SECURITY_COVERAGE.lastRun
  if (run === undefined)
    return undefined
  const dirty = run.worktreeDirty === true ? ' (worktree dirty)' : ''
  return `Corpus last run ${run.ranAt} at ${run.sourceCommit}${dirty}: `
    + `${run.passed}/${run.tests} passed, ${run.failed} failed, exit ${run.exitCode} `
    + `— locally qualified.`
}

/** The shared artifacts that cover `component` for `kind`. */
function sharedSecurityArtifacts(component: string, kind: string): string[] {
  return SECURITY_COVERAGE.artifacts
    .filter(a => a.kind === kind && a.covers.includes(component))
    .map(a => a.path)
}

/**
 * The sentence the docs page prints above the matrix for the browser input.
 *
 * It names the projects run out of the projects declared, and it names the
 * admissibility* of the numbers, because "1,408 cells passed" and "1,408 cells
 * passed on a tree nobody can check out" are different claims and the page has
 * been printing the first while meaning the second.
 */
function browserInputNote(ledger: BrowserEvidenceLedger | undefined): string {
  if (ledger === undefined) {
    return `The browser lane has not been projected into ${rel(BROWSER_EVIDENCE_PATH)}, so every `
      + '`browser-matrix` cell below is `unrun` — which is not the same as "it ran and failed". '
      + `It is superseded by nothing: ${PLAYWRIGHT_REPORT_SUPERSEDED} is git-ignored AND is `
      + 'emptied by Playwright at the start of every run, so it never was a record.'
  }
  const t = ledger.totals
  const dirty = ledger.runs.some(r => r.state === 'run' && r.worktreeDirty === true)
  const admissibility = dirty
    ? 'At least one run was measured on a DIRTY worktree — locally qualified only, not release '
    + 'or CI evidence. Each run carries its own worktreeDirty/dirtyPathCount.'
    : 'Every run was measured on a clean worktree at its stated commit; still a developer '
      + 'machine, not CI.'
  return `${t.projectsRun}/${t.projects} projects (${ledger.engines.join(', ')} × `
    + `${ledger.conditions.length} conditions) projected over ${t.components} Tier B–D `
    + `components: ${t.pass} pass, ${t.fail} fail, ${t.unrun} unrun. ${admissibility}`
}

/**
 * Whether the visual input can fail a CI run today (TASK-S1-O3).
 *
 * `available: true` on an input says an artifact was read. For a
 * platform-locked input that is not the same question as "can this gate", and
 * conflating them is how the matrix came to read `visual: covered` for eight
 * components whose baselines no runner can ever compare against. So the answer
 * is recorded as data next to the note, and it is `false` until the images and
 * the runner are on the same platform.
 */
function visualInputGate(ledger: VisualLedger | undefined): {
  platform: string
  authoritative: string
  ciGate: boolean
  blockedOn?: string
} | undefined {
  if (ledger === undefined)
    return undefined
  const authoritative = ledger.scope.authoritativePlatform ?? ledger.scope.ciPlatform
  const ciGate = ledger.scope.platform === authoritative
  return {
    platform: ledger.scope.platform,
    authoritative,
    ciGate,
    ...(ciGate
      ? {}
      : {
          blockedOn: `one \`yarn visual:accept\` pass per snapshot on ${authoritative}, then `
            + `\`lanes[component-baselines].capturedOn\` → "${authoritative}". Baseline capture `
            + `is an owner action (e2e/visual/README.md).`,
        }),
  }
}

/**
 * Whether the story-DoD input can fail a CI run today (RESIDUAL-09, closing
 * RESIDUAL-03 items 3–4 for this input).
 *
 * **The only one of the six inputs whose answer is `true`**, and it is measured
 * rather than reasoned. `.github/workflows/ci.yml` job `validate`
 * (`runs-on: ubuntu-latest`) runs `yarn validate:story-dod` at line 163 on every
 * push and pull request, and the job carries **no** `continue-on-error` — the
 * only `continue-on-error: true` in that file is at line 515, on the visual e2e
 * step. `validate:story-dod-tiers` is link 21 of `validate:all`, which
 * `.github/workflows/validate-min-runtime.yml` runs at line 120 as a reusable
 * workflow `ci.yml` calls on the same trigger, also `ubuntu-latest`, also without
 * `continue-on-error`.
 *
 * `platform` is `any`, and that is a real difference rather than a hedge: this
 * input is static analysis over the committed `.stories.ts` text. No browser, no
 * AT, no timing, no rendered pixel — so unlike the other five it has no host to
 * be locked to, and `authoritative` is the same `any`.
 *
 * **The honest limit, measured 2026-09-28.** Five checks feed cells here:
 * `dark-mode`, `states`, `accessibility`, `real-world`, `play`. `dark-mode` is
 * `level: 'error'` and stands at 170/170, so a regression fails outright.
 * `states`, `accessibility` and `real-world` are `level: 'report'` but are
 * tier-required in `validate:story-dod-tiers` and sit at `0 / 0` ceilings, so a
 * new violation on a component whose tier requires the check is over its ceiling
 * and red. `play` is reported and **no tier requires it** (158/170), so a `play`
 * regression alone fails nothing. `ciGate: true` with that edge recorded here is
 * the accurate answer; `false` would be the wrong one, because four of the five
 * checks can and do turn a CI run red.
 */
function storyDodInputGate(): InputGate {
  return { platform: 'any', authoritative: 'any', ciGate: true }
}

/**
 * Whether the AT matrix can fail a CI run today (RESIDUAL-09).
 *
 * **It cannot, and it never will be able to.** This is the input where
 * `available: true` was most misleading: the artifact is read, its 534 rows are
 * joined into every `at-manual` cell, and **not one of them has been executed**.
 * The blocker is not a wiring gap that CI could close — a screen-reader result is
 * produced by a person listening to an AT, `yarn at:ingest` transcribes a record
 * a *named* person wrote, and an agent may never write one.
 *
 * What CI does run is the **shape** of the record, not its evidence:
 * `validate:at-matrix` (link 23) and `validate:at-runs` (link 57) are both inside
 * `validate:all`, on `ubuntu-latest`, without `continue-on-error` — and both exit
 * 0 over an empty directory, by design, because every row in a new matrix starts
 * `unrun` and a gate that failed on that would be switched off the day it landed.
 */
function atMatrixInputGate(index: AtMatrixIndex | undefined): InputGate | undefined {
  if (index === undefined)
    return undefined
  const rows = index.entries.flatMap(e => [...e.rows])
  const executed = rows.filter(r => r.result !== 'unrun').length
  const platforms = [...new Set(index.pairs.map(p => p.platform))]
  return {
    platform: executed === 0
      ? `none — ${executed} of ${rows.length} cells executed, so no host has produced evidence `
      + 'for this input at all'
      : `the recorded testers' hosts (${executed} of ${rows.length} cells executed)`,
    authoritative: `the AT pairing's own platform (${platforms.join(', ')}) — a screen-reader `
      + 'result is only valid on the AT and OS that produced it, and no single runner can hold '
      + 'all six',
    ciGate: false,
    blockedOn: `a NAMED HUMAN TESTER and a date (register D112): ${rows.length} cells, `
      + `${executed} executed. No CI job can ever make this true — \`yarn at:ingest\` `
      + 'transcribes a session record a named person produced, and an agent may never write '
      + 'one. `validate:at-matrix` and `validate:at-runs` DO run in CI without '
      + '`continue-on-error`, but they check the SHAPE of a record and exit 0 over an empty '
      + 'directory. Wave 1 is 44 cells / 20.6 tester-hours on one Windows 11 machine '
      + '(TASK-S1-O1 wave-1 schedule).',
  }
}

/**
 * Whether the Playwright browser matrix can fail a CI run today (RESIDUAL-09,
 * closing RESIDUAL-03 ranked item 3).
 *
 * RESIDUAL-03 recorded the answer as prose in this exact shape and deliberately
 * did not write it here, on the ground that a win32 packet should not rewrite the
 * artifact that records browser results. This declares the same measurement
 * without touching one cell.
 *
 * **`ciGate` is false for a reason no platform comparison would reveal: no
 * workflow runs the lane at all.** Measured 2026-09-28 over all eight files in
 * `.github/workflows/`: `grep -rn 'e2e:matrix|browser-evidence|engine-ratchets|e2e/matrix'`
 * returns **zero** matches. `ci.yml`'s `e2e` job runs `test:e2e:functional`
 * (chromium) and `test:e2e:visual` — and that second step is the one
 * `continue-on-error: true` in the file, so even the visual lane cannot fail a
 * run. Nothing anywhere invokes `yarn test:e2e:matrix` or
 * `yarn generate:browser-evidence`.
 *
 * `authoritative` is `linux` by measurement too: all **19** `runs-on:` values
 * across the eight workflow files are `ubuntu-latest`, so if a job existed, linux
 * is the platform whose result could block a merge — and every committed run here
 * is `win32`.
 */
function browserMatrixInputGate(ledger: BrowserEvidenceLedger | undefined): InputGate | undefined {
  if (ledger === undefined)
    return undefined
  const hosts = [...new Set(ledger.runs.map(r => r.platform ?? 'undeclared'))].sort()
  const dirty = ledger.runs.some(r => r.worktreeDirty === true)
  return {
    platform: hosts.length === 0 ? 'none — no run recorded' : hosts.join('; '),
    authoritative: 'linux',
    ciGate: false,
    blockedOn: 'two acts, in this order. (1) A CI job that runs the Playwright matrix lane on '
      + '`ubuntu-latest` and projects its JSON report through `yarn generate:browser-evidence` '
      + '— measured 2026-09-28, NO workflow in .github/ invokes `yarn test:e2e:matrix` or '
      + '`yarn generate:browser-evidence`, and the only `continue-on-error: true` in ci.yml is '
      + `on the visual e2e step. (2) One sweep on a CLEAN worktree${dirty
        ? ' — every run committed here carries worktreeDirty: true, which this ledger\'s own '
        + 'admissibility field calls locally qualified only'
        : ''}. Until (1), these rows are developer-local evidence and cannot fail anything.`,
  }
}

/**
 * Whether the per-engine ratchet ledger can fail a CI run today (RESIDUAL-09,
 * closing RESIDUAL-03 ranked item 4).
 *
 * The same lane as `browser-matrix`, so the same answer, and it is recorded
 * separately rather than by reference because this input is read on its own: it is
 * what lets a `browser-matrix` cell say *which* of the 24 projects ran, and a
 * reader who trusts that sentence is trusting an ungated ledger.
 */
function engineRatchetsInputGate(file: EngineRatchets | undefined): InputGate | undefined {
  if (file === undefined)
    return undefined
  return {
    platform: file.platform ?? 'undeclared',
    authoritative: 'linux',
    ciGate: false,
    blockedOn: 'the same two acts as `browser-matrix` — no workflow in .github/ runs the '
      + 'Playwright matrix lane, and all 19 CI jobs are `ubuntu-latest` while this ledger is '
      + `win32. Measured ${file.measuredAt ?? 'at an undeclared date'} at `
      + `\`${file.sourceCommit ?? 'an undeclared commit'}\``
      + `${file.worktreeDirty === true ? ' on a DIRTY worktree' : ''}, so it is locally `
      + 'qualified only.',
  }
}

/** The sentence the docs page prints above the matrix for the visual input. */
function visualInputNote(ledger: VisualLedger | undefined): string {
  if (ledger === undefined) {
    return 'No acceptance ledger, so no component can read `covered` — which is the absence of '
      + 'an input, not a lane that ran and failed.'
  }

  // `fixture:<id>` records are stress fixtures over a covered family (schema
  // 1.1.0, TASK-R5-O4), NOT components — the prefix exists precisely so no
  // capability row can match one. They were nonetheless counted here, so this
  // note claimed "12 component(s)" over 8 covered components and 4 fixtures, on
  // every one of the 144 generated docs pages that prints it (TASK-R2-O6, D138).
  // The per-component join was always right; only this sentence was not.
  const covered = new Set(
    ledger.baselines
      .filter(b => b.platform === ledger.scope.platform && !b.component.startsWith('fixture:'))
      .map(b => b.component),
  )
  const fixtures = new Set(
    ledger.baselines
      .filter(b => b.platform === ledger.scope.platform && b.component.startsWith('fixture:'))
      .map(b => b.component),
  )
  // TASK-S1-O3: the authoritative platform is a declared decision, not an
  // inference from `ciPlatform`. Say which platform is authoritative and which
  // lanes are on it, because "developer-local" without the target named is a
  // status nobody can act on.
  const authoritative = ledger.scope.authoritativePlatform ?? ledger.scope.ciPlatform
  const lanes = (ledger.lanes ?? [])
    .map(l => `${l.id} (${l.capturedOn}, ${l.role})`)
    .join('; ')
  const laneNote = lanes === '' ? '' : ` Lanes: ${lanes}.`
  const platform = ledger.scope.platform === authoritative
    ? `The gating platform is the authoritative one (${authoritative}).${laneNote}`
    : `The authoritative platform is \`${authoritative}\` (every CI runner is that platform) and `
      + `these baselines are \`${ledger.scope.platform}\`. Baselines are platform-locked, so this `
      + `lane is developer-local evidence and CANNOT fail a CI run until one accept pass is made `
      + `on ${authoritative}.${laneNote}`

  const fixtureNote = fixtures.size === 0
    ? ''
    : `${fixtures.size} stress fixture(s) also carry baselines over these families; a fixture `
      + `is not a component and changes no row's \`visual\` state. `

  return `Per-component baselines for families [${ledger.scope.families.join(', ')}]: `
    + `${covered.size} component(s), ${ledger.scope.themes.join(' + ')}, `
    + `${ledger.scope.engine}/${ledger.scope.platform}, ${ledger.scope.direction}. `
    + `${fixtureNote}`
    + `Every component outside those families reads \`not-covered\`, never \`unknown\`. ${
      platform}`
}

/** Build the matrix. */
export function buildCapabilityMatrix(
  quality = readCommittedMatrix(),
  sources: Sources = loadSources(),
): CapabilityMatrix {
  if (quality === undefined)
    throw new Error('quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')

  const rows: CapabilityRow[] = quality.components.map((row) => {
    const componentCommit = lastCommitFor(row.source)
    return {
      component: row.component,
      family: row.family,
      tier: row.tier,
      pattern: row.pattern,
      securityBoundary: row.securityBoundary,
      traits: row.traits,
      anatomy: row.hasAnatomy ? 'declared' : 'absent',
      source: row.source,
      componentCommit,
      cells: row.evidence.map(kind => resolveCell(kind, row, sources, componentCommit)),
      visual: resolveVisual(row, sources, componentCommit),
    }
  })

  const totals = { A: emptyTally(), B: emptyTally(), C: emptyTally(), D: emptyTally() }
  for (const row of rows) {
    for (const c of row.cells)
      totals[row.tier][c.state]++
  }

  return {
    schemaVersion: CAPABILITY_SCHEMA_VERSION,
    // Not `quality.sourceCommit`. That was a copy of a copy — the capability
    // matrix inherited the oldest hash in the chain and every "N commits
    // behind" statement derived from it over-stated drift (N0-05 D1).
    sourceCommit: headCommit(),
    generatedFrom: [
      'packages/core/docs/quality-matrix.json',
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/tooling/src/validators/story-dod.ts (report)',
      'e2e/at-matrix/index.json',
      'packages/core/perf/baselines.json',
      'packages/core/perf/capture-environment.json',
      'e2e/matrix/known-failures.json',
      'e2e/matrix/engine-ratchets.json',
      'e2e/matrix/browser-evidence.json',
      'e2e/visual/visual-baselines.json',
    ],
    // RESIDUAL-09. Four of the six inputs declared `available` and no `gate`,
    // which the rendered evidence page printed as a `—` in its "Can fail CI"
    // column — indistinguishable from "not asked". They are now all six
    // answered. The four added here are a DECLARATION of existing truth: no cell
    // resolver reads `gate`, so `pass`/`fail`/`present`/`stale`/`unrun`/`excepted`
    // cannot move, and RESIDUAL-09 proved the totals byte-for-byte unchanged.
    inputs: {
      'story-dod': {
        available: true,
        path: 'packages/tooling/src/validators/story-dod.ts',
        gate: storyDodInputGate(),
      },
      'at-matrix': {
        available: sources.atIndex !== undefined,
        path: 'e2e/at-matrix/index.json',
        gate: atMatrixInputGate(sources.atIndex),
      },
      // TASK-S1-O4. `available: true` said an artifact was read; it could not
      // say whether that artifact can fail anything. For perf the gap is wider
      // than it was for pixels: 4 of the 6 declared metric families have no
      // baseline at all, 9 of the 33 that exist are `unmeasurable`, and no
      // workflow in .github/ runs `yarn test:perf`, so `ciGate` is false for a
      // reason no platform comparison would have revealed.
      'perf-baselines': {
        available: sources.baselines !== undefined,
        path: 'packages/core/perf/baselines.json',
        note: perfInputNote(sources.baselines, sources.captureEnvironment),
        gate: perfInputGate(sources.baselines, sources.captureEnvironment),
      },
      'browser-matrix': {
        available: sources.browserEvidence !== undefined,
        path: rel(BROWSER_EVIDENCE_PATH),
        note: browserInputNote(sources.browserEvidence),
        gate: browserMatrixInputGate(sources.browserEvidence),
      },
      'visual-baselines': {
        available: sources.visual !== undefined,
        path: 'e2e/visual/visual-baselines.json',
        note: visualInputNote(sources.visual),
        gate: visualInputGate(sources.visual),
      },
      'browser-engine-ratchets': {
        available: sources.engineRatchets !== undefined,
        path: 'e2e/matrix/engine-ratchets.json',
        note: sources.engineRatchets === undefined
          ? 'No committed per-engine ledger, so a `browser-matrix` cell can say the lane ran '
          + 'and cannot say which of the 24 projects did.'
          : `Engine coverage of the ${MATRIX_CONDITIONS.length}-condition sweep: ${
            Object.entries(sources.engineRatchets.engines)
              .map(([engine, s]) => `${engine} ${s.conditionsRun.length}/${MATRIX_CONDITIONS.length}`)
              .join(', ')
          }.`,
        gate: engineRatchetsInputGate(sources.engineRatchets),
      },
    },
    totals,
    rows,
  }
}

/** Serialize with a trailing newline. */
export function serializeCapabilityMatrix(matrix: CapabilityMatrix): string {
  return `${JSON.stringify(matrix, null, 2)}\n`
}

/** The committed matrix, or `undefined`. */
export function readCapabilityMatrix(
  path: string = CAPABILITY_MATRIX_PATH,
): CapabilityMatrix | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as CapabilityMatrix
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const matrix = buildCapabilityMatrix()
  writeFileSync(CAPABILITY_MATRIX_PATH, serializeCapabilityMatrix(matrix), 'utf8')
  writeFileSync(CAPABILITY_DATA_PATH, renderCapabilityData(matrix), 'utf8')

  const cells = matrix.rows.reduce((n, r) => n + r.cells.length, 0)
  console.warn(`capability-matrix: ${matrix.rows.length} components, ${cells} evidence cells\n`)
  // Driven from CELL_STATES, not a hand-written column list. See the same change
  // in `validators/capability-matrix.ts` (TASK-R2-O2).
  console.warn(`  tier  ${CELL_STATES.map(s => s.padStart(9)).join('')}`)
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    const t = matrix.totals[tier]
    console.warn(
      `  ${tier}    ${CELL_STATES.map(s => String(t[s] ?? 0).padStart(9)).join('')}`,
    )
  }
  const visual = { 'covered': 0, 'not-covered': 0, 'stale': 0 }
  for (const row of matrix.rows)
    visual[row.visual.state]++
  console.warn(
    `\n  visual   covered ${visual.covered}  ·  stale ${visual.stale}  ·  `
    + `not-covered ${visual['not-covered']}`,
  )

  for (const [name, input] of Object.entries(matrix.inputs)) {
    if (!input.available)
      console.warn(`\n  ! input \`${name}\` absent (${input.path})`)
  }
  console.warn(`\n  → packages/core/docs/capability-matrix.json`)
}
/* c8 ignore stop */
