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
import type { CapabilityMatrix, CapabilityRow, CellState, EvidenceCell, VisualEvidence } from './capability-matrix.ts'
import type { QualityMatrixRow } from './generate-quality-matrix.ts'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { readBaselineFile } from '../perf/read-baselines.ts'
import { checkStoryDod } from '../validators/story-dod.ts'
import { CAPABILITY_SCHEMA_VERSION, emptyTally } from './capability-matrix.ts'
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

/** Playwright's JSON reporter output, when the matrix lane has been run. */
const PLAYWRIGHT_REPORT = resolve(ROOT, 'test-results/matrix-report.json')
const KNOWN_FAILURES = resolve(ROOT, 'e2e/matrix/known-failures.json')

/**
 * The committed per-engine browser-lane ledger (TASK-N1-O2).
 *
 * The Playwright report is git-ignored, so it can say *whether* a lane ran and
 * nothing durable about *which of the eighteen projects* did. Reading engine
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

/** All six matrix conditions, in the order `playwright.config.ts` declares them. */
const MATRIX_CONDITIONS = [
  'default',
  'forced-colors',
  'reduced-motion',
  'rtl',
  'touch',
  'zoom-400',
] as const

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
  atIndex?: { entries: { component: string, componentCommit: string, file: string, rows: { result: string, sourceCommit: string }[] }[] }
  baselines?: ReturnType<typeof readBaselineFile>
  playwright?: { suites?: unknown[] }
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
      ? 'all 6 conditions'
      : `${ran}/6 conditions (${state.conditionsRun.join(', ')})`
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
    playwright: existsSync(PLAYWRIGHT_REPORT)
      ? JSON.parse(readFileSync(PLAYWRIGHT_REPORT, 'utf8'))
      : undefined,
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

    case 'keyboard-spec': {
      const path = sidecar(sources, row, '.spec.ts')
      if (path === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const source = readFileSync(resolve(ROOT, path), 'utf8')
      const has = /Arrow(?:Up|Down|Left|Right)|['"]Tab['"]|['"]Escape['"]|['"]Enter['"]|keydown/
        .test(source)
      return cell(kind, origin, {
        state: has ? 'present' : 'unrun',
        artifacts: has ? [path] : [],
        note: has ? undefined : 'The unit spec exists and asserts no key sequence.',
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
      if (sources.playwright === undefined) {
        return cell(kind, origin, {
          state: 'unrun',
          note: 'No Playwright report at test-results/matrix-report.json. Run '
            + '`yarn test:e2e:matrix` with PLAYWRIGHT_JSON_OUTPUT set.',
        })
      }
      const known = [...sources.knownFailures].filter(k => k.startsWith(`${row.component}:`))
      const engines = browserEngineNote(row.component, sources)
      const ledger = known.length > 0
        ? `Known failures in ${known.map(k => k.split(':')[1]).join(', ')}; see the ledger.`
        : undefined
      return cell(kind, origin, {
        state: known.length > 0 ? 'present' : 'pass',
        artifacts: [
          'e2e/matrix/conditions.spec.ts',
          'e2e/matrix/known-failures.json',
          ...(sources.engineRatchets === undefined ? [] : ['e2e/matrix/engine-ratchets.json']),
        ],
        note: [ledger, engines].filter(part => part !== undefined).join(' ') || undefined,
      })
    }

    case 'at-manual': {
      const entry = sources.atIndex?.entries.find(e => e.component === row.component)
      if (entry === undefined)
        return cell(kind, origin, { state: 'unrun' })
      const executed = entry.rows.filter(r => r.result !== 'unrun')
      if (executed.length === 0) {
        return cell(kind, origin, {
          state: 'unrun',
          artifacts: [entry.file],
          note: `${entry.rows.length} AT/browser pairs, none executed.`,
        })
      }
      const stale = executed.some(r => !evidenceIsCurrent(r.sourceCommit, entry.componentCommit))
      return cell(kind, origin, {
        state: stale ? 'stale' : 'pass',
        artifacts: [entry.file],
        note: `${executed.length}/${entry.rows.length} pairs executed`,
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
      return cell(kind, origin, {
        state: found.length === 0 ? 'unrun' : 'present',
        artifacts: found,
        note: found.length === 0 && !existsSync(dir)
          ? 'packages/core/security/ does not exist yet.'
          : shared.length > 0 && own.length === 0
            ? 'Covered by a class-level artifact, not a per-component one.'
            : undefined,
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

interface SecurityCoverageManifest {
  readonly artifacts: readonly SharedSecurityArtifact[]
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

/** The shared artifacts that cover `component` for `kind`. */
function sharedSecurityArtifacts(component: string, kind: string): string[] {
  return SECURITY_COVERAGE.artifacts
    .filter(a => a.kind === kind && a.covers.includes(component))
    .map(a => a.path)
}

/** The sentence the docs page prints above the matrix for the visual input. */
function visualInputNote(ledger: VisualLedger | undefined): string {
  if (ledger === undefined) {
    return 'No acceptance ledger, so no component can read `covered` — which is the absence of '
      + 'an input, not a lane that ran and failed.'
  }

  const covered = new Set(
    ledger.baselines.filter(b => b.platform === ledger.scope.platform).map(b => b.component),
  )
  const platform = ledger.scope.platform === ledger.scope.ciPlatform
    ? 'The gating platform matches CI.'
    : `Baselines are platform-locked and CI runs ${ledger.scope.ciPlatform}, so this lane is `
      + `developer-local evidence until one accept pass is made there.`

  return `Per-component baselines for families [${ledger.scope.families.join(', ')}]: `
    + `${covered.size} component(s), ${ledger.scope.themes.join(' + ')}, `
    + `${ledger.scope.engine}/${ledger.scope.platform}, ${ledger.scope.direction}. `
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
      'test-results/matrix-report.json',
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
        available: sources.playwright !== undefined,
        path: 'test-results/matrix-report.json',
        note: sources.playwright === undefined
          ? 'The browser lane has not been run into a JSON report, so every browser-matrix cell '
          + 'below is `unrun` — which is not the same as "it ran and failed".'
          : undefined,
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
          + 'and cannot say which of the eighteen projects did.'
          : `Engine coverage of the 6-condition sweep: ${
            Object.entries(sources.engineRatchets.engines)
              .map(([engine, s]) => `${engine} ${s.conditionsRun.length}/6`)
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
  console.warn('  tier   pass  present  stale  unrun  excepted')
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    const t = matrix.totals[tier]
    console.warn(
      `  ${tier}     ${String(t.pass).padStart(5)}${String(t.present).padStart(9)}`
      + `${String(t.stale).padStart(7)}${String(t.unrun).padStart(7)}${String(t.excepted).padStart(10)}`,
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
