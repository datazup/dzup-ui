/**
 * `yarn regenerate:all` — the sanctioned regeneration order, executable
 * (RESIDUAL-09, closing `D-RES07-2` option (c)).
 *
 * ## Why this exists
 *
 * The order was **prose only**, and prose has to be copied. RESIDUAL-07 found it
 * documented in six live locations, corrected all six, and found a seventh
 * transcription that had already drifted to four commands. Its omissions broke
 * three agents' validation runs inside one programme: step 7 below
 * (`csp:inline-style-inventory`) appeared in none of the documented orders, is
 * not checked by `validate:all` at any of its 62 links, and fails only in the
 * unit suite — so two consecutive batches handed over a red suite for it.
 *
 * A list that must be hand-copied has already proved it drifts. A script cannot.
 * The **annotated table in `CLAUDE.md` is deliberately kept**, and each step
 * below carries the same `owedWhen` text: the table explains *why* a step is
 * owed, which is a judgement a human makes when only one artifact is stale, and
 * this script guarantees *what* runs and in which order when several are.
 *
 * ## The two things it refuses
 *
 * 1. **A step naming a script the root manifest does not declare.** Validator and
 *    script names diverge in this repository — `validate:ownership` runs
 *    `validators/ownership-manifest.ts` — so a step's name is checked against
 *    `package.json`'s `scripts` keys **before anything runs**. A renamed script
 *    is then a refusal that names the step, not a `command not found` in the
 *    middle of a chain that has already rewritten three artifacts.
 * 2. **Continuing past a failure.** Every step after a failed one derives its
 *    artifact from that step's output: `component-meta.json` carries a join of
 *    `capability-matrix.json`, `llms.txt` is a pure projection of
 *    `component-meta.json`, and `nav.json`'s `artifactSha256` **is** the sha256
 *    of `component-meta.json`. Continuing produces artifacts derived from a stale
 *    predecessor — the class of defect this programme spent sixteen tasks
 *    removing — so the run stops, names the failing step and its exit code, and
 *    lists the steps that did NOT run.
 *
 * Usage:
 *   yarn regenerate:all           # the seven steps, in order, stopping at the first failure
 *   yarn regenerate:all --list    # print the order and each step's trigger, run nothing
 *
 * Exit code: 0 when all seven exit 0; otherwise the failing step's own exit code,
 * because "regenerate:all failed" is not actionable and "step 4 of 7,
 * `yarn generate:component-meta`, exited 1" is.
 *
 * @module @dzup-ui/tooling/regenerate-all
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from './ownership/generate-ownership-manifest.ts'

/** One link of the regeneration order. */
export interface RegenerateStep {
  /** `1`…`7` — the position in the sanctioned order. Positions are cited in reports. */
  step: number
  /** The yarn script name, verbatim. Verified against `package.json` before any step runs. */
  script: string
  /**
   * What makes this step necessary — the `Owed when` column of `CLAUDE.md`'s
   * table, kept here so the log says why a step ran and not only that it did.
   */
  owedWhen: string
}

/**
 * The order, as data.
 *
 * Every name was verified against `package.json`'s `scripts` keys at the time of
 * writing, and is verified again on every run by {@link undeclaredSteps}.
 */
export const REGENERATE_STEPS: readonly RegenerateStep[] = [
  {
    step: 1,
    script: 'generate:ownership',
    owedWhen: 'a component is added, renamed or re-owned — every later step reads the '
      + 'ownership manifest to decide which components exist',
  },
  {
    step: 2,
    script: 'generate:quality-matrix',
    owedWhen: 'tier or story-DoD evidence changed — it is the single answer to "what evidence '
      + 'does DzX owe", which the capability matrix reads instead of re-deriving',
  },
  {
    step: 3,
    script: 'generate:capability-matrix',
    owedWhen: 'any evidence cell changed — one row per public component, one cell per evidence '
      + 'row it owes, and `validate:capability-matrix` holds a two-way staleness handshake '
      + 'over the committed artifact',
  },
  {
    step: 4,
    script: 'generate:component-meta',
    owedWhen: '(a) any CAPABILITY change — it carries a join of capability-matrix.json that '
      + 'src/docs/evidence.spec.ts fails on; (b) any STORY edit — it records each story '
      + 'example line range, so a one-line insertion moves it',
  },
  {
    step: 5,
    script: 'generate:llms',
    owedWhen: 'any of steps 1–4 moved — llms.txt and llms-full.txt are a pure projection of '
      + 'component-meta.json and are what MCP clients answer from',
  },
  {
    step: 6,
    script: 'generate:docs-pages',
    owedWhen: 'EVERY component-meta.json change — the artifactSha256 in nav.json IS the sha256 of '
      + 'component-meta.json, so a stale nav.json is a silently contradictory docs site',
  },
  {
    step: 7,
    script: 'csp:inline-style-inventory',
    owedWhen: 'any edit to a .vue that carries an inline style= — the inventory records the '
      + 'LINE NUMBER of every site, so a one-line insertion makes it stale with nothing added '
      + 'or removed. NO link of steps 1–6 refreshes it and validate:all does not check it at '
      + 'all; the only gate that fails is the unit suite '
      + '(packages/core/security/inline-style-inventory.spec.ts)',
  },
]

/** The script names the root `package.json` actually declares. */
export function declaredScripts(root: string = ROOT): Set<string> {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>
  }
  return new Set(Object.keys(manifest.scripts ?? {}))
}

/**
 * Steps naming a script the manifest does not declare.
 *
 * An empty array is the only acceptable answer, and it is checked **before** the
 * first step runs: a chain that discovers a renamed script at step 5 has already
 * rewritten four artifacts.
 */
export function undeclaredSteps(
  declared: ReadonlySet<string>,
  steps: readonly RegenerateStep[] = REGENERATE_STEPS,
): RegenerateStep[] {
  return steps.filter(s => !declared.has(s.script))
}

/**
 * The message printed when a step fails: which step, its exit code, and — the
 * part that matters — every step that did NOT run, because those are the
 * artifacts a reader might otherwise assume are fresh.
 */
export function stopMessage(
  failed: RegenerateStep,
  status: number,
  steps: readonly RegenerateStep[] = REGENERATE_STEPS,
): string {
  const notRun = steps.filter(s => s.step > failed.step)
  const lines = [
    `✗ regenerate:all STOPPED at step ${failed.step} of ${steps.length}: `
    + `\`yarn ${failed.script}\` exited ${status}.`,
    '',
    '  The chain stops here on purpose. Every step after a failed one derives its',
    '  artifact from that step\'s output, so continuing would produce artifacts built',
    '  from a stale predecessor — which reads as fresh and is not.',
    '',
    `  NOT RUN (${notRun.length} step(s)) — these artifacts are NOT fresh:`,
  ]
  for (const s of notRun)
    lines.push(`    ${s.step}. yarn ${s.script}`)
  if (notRun.length === 0)
    lines.push('    (none — the failure was the last step)')
  lines.push(
    '',
    `  Fix \`yarn ${failed.script}\`, then re-run \`yarn regenerate:all\` from the top:`,
    '  the order is idempotent, so re-running the steps that already succeeded costs',
    '  time and changes nothing.',
  )
  return lines.join('\n')
}

/* c8 ignore start */
/** Runs one step through yarn. `shell: true` because yarn is a `.cmd` on Windows. */
export function runStep(step: RegenerateStep, cwd: string = ROOT): number {
  const r = spawnSync('yarn', [step.script], { cwd, stdio: 'inherit', shell: true })
  if (r.error !== undefined) {
    console.error(`  spawn failed: ${r.error.message}`)
    return 127
  }
  return r.status ?? 1
}

const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const listOnly = process.argv.includes('--list')
  const steps = REGENERATE_STEPS

  console.warn('regenerate:all — the sanctioned regeneration order, in order '
    + '(RESIDUAL-09, D-RES07-2)\n')

  // Refuse BEFORE running anything: a step naming a script that no longer exists
  // is the drift this script was built to make impossible, and discovering it
  // halfway through has already rewritten artifacts.
  const missing = undeclaredSteps(declaredScripts(), steps)
  if (missing.length > 0) {
    console.error(`✗ regenerate:all refuses to start: ${missing.length} step(s) name a script `
      + 'the root package.json does not declare.\n')
    for (const s of missing)
      console.error(`    step ${s.step}: yarn ${s.script}`)
    console.error('\n  A script was renamed and this order was not updated. Fix the order in '
      + 'packages/tooling/src/regenerate-all.ts AND the table in CLAUDE.md, which are the '
      + 'two places it is written down.')
    process.exit(1)
  }

  if (listOnly) {
    console.warn(`  ${steps.length} steps, every name verified against package.json:\n`)
    for (const s of steps)
      console.warn(`  ${s.step}. yarn ${s.script}\n       owed when: ${s.owedWhen}\n`)
    console.warn('  Nothing was run (--list). The annotated table lives in CLAUDE.md under '
      + 'Quality Gates.')
    process.exit(0)
  }

  console.warn(`  ${steps.length} steps · every name verified against package.json · `
    + 'stops at the first failure\n')

  for (const step of steps) {
    console.warn(`\n${'─'.repeat(78)}\n[${step.step}/${steps.length}] yarn ${step.script}`)
    console.warn(`  owed when: ${step.owedWhen}\n`)
    const status = runStep(step)
    if (status !== 0) {
      console.error(`\n${'═'.repeat(78)}`)
      console.error(stopMessage(step, status, steps))
      process.exit(status)
    }
  }

  console.warn(`\n${'═'.repeat(78)}`)
  console.warn(`✓ regenerate:all — ${steps.length} of ${steps.length} steps exit 0.\n`)
  console.warn('  Step 7 is the one no documented order carried and no `validate:all` link '
    + 'checks: run `yarn test packages/core/security/inline-style-inventory.spec.ts` if you '
    + 'want that proved rather than assumed.')
  process.exit(0)
}
/* c8 ignore stop */
