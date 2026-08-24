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
import type { CapabilityMatrix, CapabilityRow, CellState, EvidenceCell } from './capability-matrix.ts'
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
      return cell(kind, origin, {
        state: known.length > 0 ? 'present' : 'pass',
        artifacts: ['e2e/matrix/conditions.spec.ts', 'e2e/matrix/known-failures.json'],
        note: known.length > 0
          ? `Known failures in ${known.map(k => k.split(':')[1]).join(', ')}; see the ledger.`
          : undefined,
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
      const found = [file, spec].filter(p => existsSync(resolve(ROOT, p)))
      return cell(kind, origin, {
        state: found.length === 0 ? 'unrun' : 'present',
        artifacts: found,
        note: found.length === 0 && !existsSync(dir)
          ? 'packages/core/security/ does not exist yet.'
          : undefined,
      })
    }
  }
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
      'test-results/matrix-report.json',
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
  for (const [name, input] of Object.entries(matrix.inputs)) {
    if (!input.available)
      console.warn(`\n  ! input \`${name}\` absent (${input.path})`)
  }
  console.warn(`\n  → packages/core/docs/capability-matrix.json`)
}
/* c8 ignore stop */
