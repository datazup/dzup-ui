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
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { readBaselineFile } from '../perf/read-baselines.ts'
import { checkStoryDod } from '../validators/story-dod.ts'
import { resolveAtManual } from './at-matrix.ts'
import { BROWSER_EVIDENCE_PATH, cellKey, readBrowserEvidence, readDeclaredMatrixProjects } from './browser-evidence.ts'
import { CAPABILITY_SCHEMA_VERSION, CELL_STATES, emptyTally } from './capability-matrix.ts'
import { renderCapabilityData } from './emit-capability-data.ts'
import { AT_MATRIX_INDEX } from './generate-at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'
import { evidenceIsCurrent, lastCommitFor } from './git.ts'

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

/** Files under `dir` whose contents name the component. */
function filesMentioning(files: readonly { path: string, source: string }[], component: string) {
  const word = new RegExp(`\\b${component}\\b`)
  return files.filter(f => word.test(f.source)).map(f => rel(f.path))
}

// ---------------------------------------------------------------------------
// The join
// ---------------------------------------------------------------------------

interface Sources {
  componentFiles: Set<string>
  a11ySpecs: { path: string, source: string }[]
  ssrSpecs: { path: string, source: string }[]
  storyDod: Map<string, Set<string>>
  storyFile: Map<string, string>
  // The real type, not a structural restatement of it (TASK-R2-O2). The inline
  // shape this replaces named four fields and omitted `tasks`, `tier` and the
  // result *values* — which is how the resolver came to be written against a
  // row it could not see the outcome of. Importing the type makes the next
  // scaffold field a compile error here rather than a silent no-op.
  atIndex?: AtMatrixIndex
  baselines?: ReturnType<typeof readBaselineFile>
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

  // story check id → set of components that FAIL it. Inverted at lookup: a
  // component absent from the failing set passed the check.
  const storyDod = new Map<string, Set<string>>()
  const storyFile = new Map<string, string>()
  for (const result of checkStoryDod()) {
    const failing = new Set<string>()
    for (const violation of result.violations)
      failing.add(basename(violation.file.replaceAll('\\', '/'), '.stories.ts'))
    storyDod.set(result.id, failing)
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
    storyFile,
    atIndex: existsSync(AT_MATRIX_INDEX)
      ? JSON.parse(readFileSync(AT_MATRIX_INDEX, 'utf8'))
      : undefined,
    baselines: readBaselineFile(),
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

/** Whether a story-dod check passed for this component's story file. */
function storyCheck(sources: Sources, component: string, check: string): CellState {
  if (!sources.storyFile.has(component))
    return 'unrun'
  return sources.storyDod.get(check)?.has(component) === true ? 'unrun' : 'pass'
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
    case 'contract-spec': {
      const path = sidecar(sources, row, '.contract.spec.ts')
      return cell(kind, origin, {
        state: path === undefined ? 'unrun' : 'present',
        artifacts: path === undefined ? [] : [path],
      })
    }

    case 'unit-spec': {
      const path = sidecar(sources, row, '.spec.ts')
      return cell(kind, origin, {
        state: path === undefined ? 'unrun' : 'present',
        artifacts: path === undefined ? [] : [path],
      })
    }

    case 'axe': {
      const hits = filesMentioning(sources.a11ySpecs, row.component)
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
      })
    }

    case 'ssr-sample': {
      const hits = filesMentioning(sources.ssrSpecs, row.component)
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
      })
    }

    case 'portal-hydration': {
      const hits = filesMentioning(sources.ssrSpecs, row.component)
      return cell(kind, origin, {
        state: hits.length === 0 ? 'unrun' : 'present',
        artifacts: hits,
        note: hits.length === 0
          ? 'This component renders teleported content and no SSR/hydration spec names it.'
          : undefined,
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
      return cell(kind, origin, {
        state: storyCheck(sources, row.component, 'dark-mode'),
        artifacts: story === undefined ? [] : [story],
      })

    case 'state-stories':
      return cell(kind, origin, {
        state: storyCheck(sources, row.component, 'states'),
        artifacts: story === undefined ? [] : [story],
      })

    case 'a11y-narrative':
      return cell(kind, origin, {
        state: storyCheck(sources, row.component, 'accessibility'),
        artifacts: story === undefined ? [] : [story],
      })

    case 'real-world-story':
      return cell(kind, origin, {
        state: storyCheck(sources, row.component, 'real-world'),
        artifacts: story === undefined ? [] : [story],
      })

    case 'browser-play':
      return cell(kind, origin, {
        state: storyCheck(sources, row.component, 'play'),
        artifacts: story === undefined ? [] : [story],
      })

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
  const platform = ledger.scope.platform === ledger.scope.ciPlatform
    ? 'The gating platform matches CI.'
    : `Baselines are platform-locked and CI runs ${ledger.scope.ciPlatform}, so this lane is `
      + `developer-local evidence until one accept pass is made there.`

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
    sourceCommit: quality.sourceCommit,
    generatedFrom: [
      'packages/core/docs/quality-matrix.json',
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/tooling/src/validators/story-dod.ts (report)',
      'e2e/at-matrix/index.json',
      'packages/core/perf/baselines.json',
      'e2e/matrix/known-failures.json',
      'e2e/matrix/engine-ratchets.json',
      'e2e/matrix/browser-evidence.json',
      'e2e/visual/visual-baselines.json',
    ],
    inputs: {
      'story-dod': { available: true, path: 'packages/tooling/src/validators/story-dod.ts' },
      'at-matrix': {
        available: sources.atIndex !== undefined,
        path: 'e2e/at-matrix/index.json',
      },
      'perf-baselines': {
        available: sources.baselines !== undefined,
        path: 'packages/core/perf/baselines.json',
      },
      'browser-matrix': {
        available: sources.browserEvidence !== undefined,
        path: rel(BROWSER_EVIDENCE_PATH),
        note: browserInputNote(sources.browserEvidence),
      },
      'visual-baselines': {
        available: sources.visual !== undefined,
        path: 'e2e/visual/visual-baselines.json',
        note: visualInputNote(sources.visual),
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
