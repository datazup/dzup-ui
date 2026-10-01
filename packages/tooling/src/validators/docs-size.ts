/**
 * `yarn validate:docs-size` — the docs-site size budget (TASK-R1-O5, closes
 * D3-F10 / criterion C14's first half).
 *
 * ## Why this exists
 *
 * `apps/docs/.vitepress/dist` is the largest publishable artifact this
 * repository produces and, until this file, the only one under no ceiling at
 * all. Three consecutive packets grew it and each recorded the growth in a
 * handoff nobody re-reads:
 *
 * | Measured at | Size | By |
 * |---|---|---|
 * | TASK-N2-D1 | 16.04 MB | the site itself |
 * | TASK-N2-D2 | 20.67 MB | evidence pages (+28.9 %) |
 * | TASK-N2-D3 | 29.82 MB | playground machinery (+44.3 %) |
 * | 1.0 exit memo | 29.82 MB | — |
 * | TASK-R1-O5 | **33.12 MB** | R2/R3/R5 pages and evidence since |
 *
 * `apps/storybook/scripts/check-bundle-size.mjs` reads `storybook-static` and
 * nothing else (verified, D1-F-4), so none of that was ever charged against a
 * budget. The previous reporter at `apps/docs/scripts/report-size.mjs` said as
 * much in its own header and named the promotion path: *"one local build is not
 * a trusted baseline"*. Six months and 17 MB later, it is.
 *
 * ## The ratchet
 *
 * Down-only, like every other ratchet here — but measured in **bytes**, not in
 * counts, so it carries a tolerance the count ratchets do not need. Two rules,
 * both from `docs-size-ceilings.json`:
 *
 *   - **over** — `measured > ceilingBytes` fails, and the message names the
 *     three biggest files, because "the site is 2 MB bigger" is not actionable
 *     and "`@localSearchIndexroot` is 2.4 MB" is.
 *   - **stale** — `ceilingBytes - measured > relaxToleranceBytes` fails too,
 *     and says to lower the ceiling. A ceiling nobody lowers stops meaning
 *     anything; a ceiling that cannot absorb build-to-build noise gets turned
 *     off. The tolerance is the gap between those two failure modes and it is
 *     data, not a constant in this file.
 *
 * ## When the dist is absent — and why this changed on 2026-09-22
 *
 * Both budgeted artifacts are gitignored (`apps/docs/.gitignore:7`,
 * `apps/storybook/.gitignore:2`) and **nothing in the 50-link `validate:all`
 * chain builds either of them.** So until 2026-09-22 this validator's behaviour
 * on the only tree that matters — a clean checkout, i.e. CI — was: measure
 * nothing, print `✓ docs-size: every budgeted artifact is inside its ceiling`,
 * exit 0. Link 38 of `validate:all` reported green having never looked. That is
 * the S1-F10 shape this repository keeps rediscovering, and it was found again
 * by the independent release-exit pass (finding **S6**).
 *
 * Two changes, both narrow:
 *
 *   1. **A skip can no longer be mistaken for a pass.** When any budget was
 *      skipped the run prints `⚠ docs-size: N of M measured · K SKIPPED` and
 *      names each unmeasured artifact. The unqualified `✓` line is printed
 *      **only when every budget was actually measured.** Free, and it is most of
 *      the value.
 *   2. **It fails closed where a skip is not honest.** An absent artifact is an
 *      error when `--require-dist` is passed **or when `CI` is set**, because on
 *      a machine that is gating a merge "the artifact was never built" is a
 *      finding, not an excuse. `--allow-missing-dist` opts back out for a CI job
 *      that deliberately runs the chain before any build.
 *
 * A skip stays the default locally, and stays exit 0 there: `dist` is a build
 * output (ADR-12: generated, never committed), so on a fresh clone there is
 * nothing to measure and a validator that failed would make `yarn validate:all`
 * unrunnable without a 40-second VitePress build — and a multi-minute Storybook
 * build — in front of it. Building them inside `validate:all` was the other
 * candidate fix and was rejected on that cost: the chain has to stay runnable on
 * a freshly-edited tree, which is the same reasoning **D149** applies to
 * `validate:published-imports --built`.
 *
 * `--require-dist` remains how `apps/docs`'s own `build` script calls it, so the
 * enforcing point is still the build that produces the artifact — the same split
 * `check-bundle-size.mjs` uses for Storybook.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/docs-size.ts
 *   tsx packages/tooling/src/validators/docs-size.ts --all
 *   tsx packages/tooling/src/validators/docs-size.ts --require-dist
 *   tsx packages/tooling/src/validators/docs-size.ts --allow-missing-dist   # opt out under CI
 *   DOCS_SIZE_ALLOW_MISSING_DIST=1 yarn validate:all                       # the same, through the chain
 *
 * Exit code 1 if a budget is over, a ceiling is stale, or the dist is absent
 * while `--require-dist` was passed or `CI` is set.
 *
 * @module @dzup-ui/tooling/validators/docs-size
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** Where the ceilings live. Data, not code — the shape every ratchet here uses. */
export const DOCS_SIZE_CEILINGS_PATH = resolve(
  ROOT,
  'packages/tooling/src/validators/docs-size-ceilings.json',
)

/** One budgeted static artifact. */
export interface SizeBudget {
  /** Repo-relative directory the budget covers. */
  path: string
  /** Hard ceiling in bytes. `measured > ceilingBytes` fails. */
  ceilingBytes: number
  /** The measurement the ceiling was seeded from, for the handoff trail. */
  seededFromBytes: number
  /** ISO date the seed was taken. */
  seededAt: string
  /** How far below the ceiling a build may sit before the ceiling is stale. */
  relaxToleranceBytes: number
}

export interface DocsSizeCeilings {
  [key: string]: SizeBudget | string | undefined
}

/** Read the budgets, ignoring the `//` prose keys. */
export function readBudgets(path: string = DOCS_SIZE_CEILINGS_PATH): Record<string, SizeBudget> {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as DocsSizeCeilings
  const out: Record<string, SizeBudget> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'object' && value !== null && 'ceilingBytes' in value)
      out[key] = value
  }
  return out
}

export interface MeasuredFile {
  /** Path relative to the measured directory, forward-slashed. */
  rel: string
  bytes: number
}

export interface Measurement {
  bytes: number
  files: MeasuredFile[]
}

/** Total bytes and every file under a directory, recursively. */
export function measureDirectory(dir: string): Measurement {
  const files: MeasuredFile[] = []
  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory())
        stack.push(full)
      else if (entry.isFile())
        files.push({ rel: relative(dir, full).replace(/\\/g, '/'), bytes: statSync(full).size })
    }
  }
  return { bytes: files.reduce((n, f) => n + f.bytes, 0), files }
}

/**
 * A byte count, with enough precision to see an overage.
 *
 * `check-bundle-size.mjs` printed `Storybook build 25.00 MB EXCEEDS budget
 * 25 MB` in CI on 2026-09-21 — a true statement that reads as a rounding bug,
 * because two decimal places cannot show a 4 KB overage on 25 MB. Every size
 * this module prints carries the exact byte count beside the human figure, so
 * a reader can always tell a real overage from a display artifact.
 */
export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB (${bytes.toLocaleString('en-US')} B)`
}

export interface SizeViolation {
  rule: 'over' | 'stale' | 'missing' | 'parity'
  level: 'error' | 'report'
  message: string
}

/** Where the Storybook build states its own copy of the same ceiling. */
export const STORYBOOK_PACKAGE_JSON = resolve(ROOT, 'apps/storybook/package.json')

/**
 * The Storybook budget is stated twice — here, and as `--max-mb` in
 * `apps/storybook/package.json`'s `check:size`, which is the call the Storybook
 * build itself makes. Two statements of one number is how the two drift, and a
 * drift here means CI enforces a ceiling this file has never heard of.
 *
 * So the number is asserted rather than restated: `ceilingBytes` must be
 * exactly `--max-mb` MiB. The same shape `validate:playground-parity` uses for
 * the sandbox contract, and for the same reason.
 */
export function checkStorybookParity(
  budget: SizeBudget | undefined,
  packageJsonPath: string = STORYBOOK_PACKAGE_JSON,
): SizeViolation[] {
  if (budget === undefined || !existsSync(packageJsonPath))
    return []
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    scripts?: Record<string, string>
  }
  const script = pkg.scripts?.['check:size']
  const declared = script === undefined ? null : /--max-mb\s+([\d.]+)/.exec(script)?.[1]
  if (declared === undefined || declared === null) {
    return [{
      rule: 'parity',
      level: 'error',
      message: 'apps/storybook/package.json `check:size` no longer passes `--max-mb`, so the '
        + 'Storybook build enforces no ceiling of its own. Restore it, or remove the '
        + '`storybookStatic` budget and say where the ceiling now lives.',
    }]
  }
  const declaredBytes = Math.round(Number(declared) * 1024 * 1024)
  if (declaredBytes !== budget.ceilingBytes) {
    return [{
      rule: 'parity',
      level: 'error',
      message: `the Storybook ceiling is stated twice and the two disagree: `
        + `docs-size-ceilings.json says ${budget.ceilingBytes.toLocaleString('en-US')} B, `
        + `apps/storybook/package.json \`check:size --max-mb ${declared}\` says `
        + `${declaredBytes.toLocaleString('en-US')} B. One number, two consumers — change both.`,
    }]
  }
  return []
}

export interface BudgetResult {
  key: string
  budget: SizeBudget
  /** Absent when the artifact has not been built. */
  measurement?: Measurement
  violations: SizeViolation[]
}

/**
 * Check one budget against one measurement. Pure — the spec drives it with
 * fabricated measurements, so both failure modes are reachable without a build.
 */
export function checkBudget(
  key: string,
  budget: SizeBudget,
  measurement: Measurement,
): SizeViolation[] {
  const v: SizeViolation[] = []
  const biggest = [...measurement.files]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 3)
    .map(f => `${f.rel} ${formatBytes(f.bytes)}`)

  if (measurement.bytes > budget.ceilingBytes) {
    v.push({
      rule: 'over',
      level: 'error',
      message: `${budget.path} is ${formatBytes(measurement.bytes)}, over the `
        + `${formatBytes(budget.ceilingBytes)} ceiling by `
        + `${formatBytes(measurement.bytes - budget.ceilingBytes)}.\n`
        + `      Biggest three: ${biggest.join(' · ')}\n`
        + `      A ceiling is not raised to make a build pass. Either the growth is the point — in `
        + `which case it is a decision with a number attached, taken in a handoff — or it is an `
        + `un-lazy import, a baked dataset or a duplicated vendor chunk.`,
    })
  }
  else if (budget.ceilingBytes - measurement.bytes > budget.relaxToleranceBytes) {
    v.push({
      rule: 'stale',
      level: 'error',
      message: `${budget.path} fell to ${formatBytes(measurement.bytes)}, `
        + `${formatBytes(budget.ceilingBytes - measurement.bytes)} under its ceiling — more than `
        + `the ${formatBytes(budget.relaxToleranceBytes)} tolerance. Lower `
        + `\`${key}.ceilingBytes\` in packages/tooling/src/validators/docs-size-ceilings.json to `
        + `about ${(measurement.bytes + budget.relaxToleranceBytes).toLocaleString('en-US')} and `
        + `record the drop. A ceiling nobody lowers stops meaning anything.`,
    })
  }
  return v
}

/**
 * The command that builds each budgeted artifact — and therefore the command
 * that enforces its ceiling, since each build calls this validator with
 * `--require-dist`. Named per budget because "run `yarn docs:build`" is the
 * wrong instruction for `storybook-static` and a reader who follows it learns
 * nothing.
 */
const BUILD_COMMAND: Record<string, string> = {
  docsDist: 'yarn docs:build',
  storybookStatic: 'yarn storybook:build',
}

/** Check every budget. `requireDist` turns an unbuilt artifact into an error. */
export function checkDocsSize(
  budgets: Record<string, SizeBudget> = readBudgets(),
  requireDist = false,
): BudgetResult[] {
  const results: BudgetResult[] = []
  for (const [key, budget] of Object.entries(budgets)) {
    const dir = resolve(ROOT, budget.path)
    if (!existsSync(dir)) {
      // "SKIPPED" alone reads as "fine". Say what a skip actually bought.
      const skipNote = requireDist ? '' : ' — budget SKIPPED, so this run enforced NOTHING for it'
      results.push({
        key,
        budget,
        violations: [{
          rule: 'missing',
          level: requireDist ? 'error' : 'report',
          message: `${budget.path} has not been built${skipNote}. `
            + 'It is a build output (ADR-12), so a fresh clone has nothing to measure. '
            + `Run \`${BUILD_COMMAND[key] ?? 'yarn build'}\`, which enforces this budget itself.`,
        }],
      })
      continue
    }
    const measurement = measureDirectory(dir)
    results.push({ key, budget, measurement, violations: checkBudget(key, budget, measurement) })
  }
  const parity = checkStorybookParity(budgets.storybookStatic)
  if (parity.length > 0) {
    const host = results.find(r => r.key === 'storybookStatic')
    if (host === undefined)
      results.push({ key: 'storybookStatic', budget: budgets.storybookStatic!, violations: parity })
    else
      host.violations.push(...parity)
  }
  return results
}

/**
 * Does an unbuilt artifact fail this run?
 *
 * Pure so the decision is testable without spawning the CLI: `--require-dist`
 * always requires it, `CI` requires it too (a gate that measures nothing on the
 * machine deciding a merge is not a gate), and `--allow-missing-dist` is the
 * explicit opt-out for a CI job that runs the chain before any build.
 *
 * `DOCS_SIZE_ALLOW_MISSING_DIST=1` is the same opt-out for a job that runs the
 * whole `validate:all` chain, where no flag can reach this one link. The
 * min-runtime job (`.github/workflows/validate-min-runtime.yml`) is that job: it
 * asks whether every validator STARTS at the Node floor and builds neither
 * artifact. The budget is enforced where the artifact is built instead — the
 * `storybook` job in `ci.yml`, and `apps/docs`'s own build (TASK-R4, 2026-09-24).
 *
 * The `CI` arm matters because both budgeted artifacts are gitignored and
 * nothing in `validate:all` builds them, so a clean checkout is precisely the
 * tree where the old default reported green over an unmeasured budget (S6).
 */
export function shouldRequireDist(
  argv: readonly string[],
  env: { CI?: string | undefined, DOCS_SIZE_ALLOW_MISSING_DIST?: string | undefined } = process.env,
): boolean {
  if (argv.includes('--allow-missing-dist') || env.DOCS_SIZE_ALLOW_MISSING_DIST === '1')
    return false
  if (argv.includes('--require-dist'))
    return true
  return env.CI !== undefined && env.CI !== '' && env.CI !== 'false' && env.CI !== '0'
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const requireDist = shouldRequireDist(process.argv)
  const results = checkDocsSize(readBudgets(), requireDist)

  console.warn('Docs-site size budget — TASK-R1-O5 (D3-F10, criterion C14)\n')
  for (const r of results) {
    if (r.measurement === undefined) {
      console.warn(`  SKIP  ${r.budget.path} (not built)`)
      continue
    }
    const pct = ((r.measurement.bytes / r.budget.ceilingBytes) * 100).toFixed(1)
    const over = r.violations.some(x => x.rule === 'over')
    console.warn(`  ${over ? 'FAIL' : 'PASS'}  ${r.budget.path}`)
    console.warn(`        ${formatBytes(r.measurement.bytes)} of `
      + `${formatBytes(r.budget.ceilingBytes)} — ${pct}% of budget, `
      + `${r.measurement.files.length} files`)
    console.warn(`        seeded ${r.budget.seededAt} from `
      + `${r.budget.seededFromBytes.toLocaleString('en-US')} B · tolerance `
      + `${r.budget.relaxToleranceBytes.toLocaleString('en-US')} B`)
    if (showAll) {
      const top = [...r.measurement.files].sort((a, b) => b.bytes - a.bytes).slice(0, 10)
      for (const f of top)
        console.warn(`          ${formatBytes(f.bytes).padStart(28)}  ${f.rel}`)
    }
  }

  const all = results.flatMap(r => r.violations)
  const errors = all.filter(x => x.level === 'error')
  for (const r of all.filter(x => x.level === 'report'))
    console.warn(`\n  ! ${r.message}`)

  const skipped = results.filter(r => r.measurement === undefined)
  const measured = results.length - skipped.length

  if (errors.length === 0) {
    // A skip is NOT a pass, and must never read like one. Before 2026-09-22 this
    // printed the unqualified ✓ even when every budget had been skipped, so link
    // 38 of `validate:all` reported green on a tree where it had never looked
    // (finding S6). The green line is now reserved for a run that measured
    // everything it claims to govern.
    if (skipped.length > 0) {
      console.warn(
        `\n⚠ docs-size: ${measured} of ${results.length} budgeted artifact(s) measured `
        + `and inside their ceilings · ${skipped.length} SKIPPED, UNMEASURED and UNENFORCED: `
        + `${skipped.map(r => r.budget.path).join(', ')}.`,
      )
      console.warn(
        '  This run proves NOTHING about the skipped artifact(s). Build them '
        + '(`yarn docs:build`, `yarn storybook:build`) or run with `--require-dist` '
        + 'to make the absence an error. Under CI the absence IS an error by default.',
      )
      process.exit(0)
    }
    console.warn('\n✓ docs-size: every budgeted artifact is inside its ceiling.')
    process.exit(0)
  }
  console.error('')
  for (const e of errors)
    console.error(`✗ [${e.rule}] ${e.message}`)
  console.error(`\n${errors.length} size-budget violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
