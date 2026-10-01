/**
 * `validate:browser-lane` — the wiring contract of the repository's only
 * browser-qualified test lane (RESIDUAL-03, closing `D-S5O2-1`).
 *
 * The lane is `apps/storybook`'s Vitest browser-mode project: every story's
 * `play()` plus the `@storybook/addon-a11y` axe pass, run in real chromium.
 * Measured 2026-09-25 on this tree: **170 files, 1,462 tests, 103.8 s**. It is the
 * only rung of the maturity ladder that executes component code in a browser
 * engine, and CI gates it (`.github/workflows/ci.yml`, job `storybook-test`).
 *
 * This validator does **not** run the lane. A gate that needed a chromium
 * download would be switched off within the week, and a browser result is
 * host-sensitive besides — CI's `ubuntu-latest` is the authoritative platform, so
 * a developer's win32 run cannot qualify pass/fail for anyone else. What IS
 * repository state, answerable with no browser and identical on every host, is
 * whether the lane can still run at all and can still fail CI. Four ways it
 * silently could not, three of which have actually happened:
 *
 *  1. **Cross-install invocation.** `apps/storybook` declares
 *     `installConfig.hoistingLimits: "workspaces"`, so it owns its `vitest`,
 *     `@vitest/browser` and `vite` 6 beside the root's `vite` 7. Driving its
 *     config with the ROOT `vitest` binary — the invocation this repo's agent
 *     guidance teaches, because `npx` is unsafe here — launches a browser, connects
 *     it, then dies at collection (`collect 0ms`) with no error for ~7 minutes.
 *     Three agents lost ~45 minutes to it and filed a 🔴 regression (`D-S5O2-1`)
 *     that did not exist. `apps/storybook/vitest.config.ts` now refuses that
 *     shape; this validator refuses its removal.
 *  2. **The app losing its own runner.** Drop `vitest`, `@vitest/browser`,
 *     `playwright` or `vite` from `apps/storybook`'s devDependencies and every
 *     invocation silently becomes a cross-install one.
 *  3. **The lane quietly becoming a jsdom lane.** Remove `browser.enabled`, the
 *     provider or the instance list and the suite still passes — in jsdom, having
 *     stopped being browser evidence, with nothing saying so.
 *  4. **The lane quietly stopping being a gate.** `continue-on-error` on the CI
 *     step, or the step being renamed away, turns a blocking check into a report.
 *     TASK-S1-O3's `inputs[].gate` distinguishes "an input that is read" from "an
 *     input that can fail CI" precisely because that distinction had already been
 *     lost elsewhere in this repository.
 *
 * The CI clause is a **textual** read of `.github/workflows/ci.yml`, scoped to the
 * `storybook-test` job block, because `packages/tooling` declares no runtime
 * dependencies and adding a YAML parser to check one job would cost more than it
 * buys. It is stated here rather than discovered later: this asserts the job
 * invokes the lane's script and carries no `continue-on-error`, not that GitHub
 * would schedule it.
 *
 * ## The `ciGate` claims (RESIDUAL-10, closing RESIDUAL-09's own caveat)
 *
 * RESIDUAL-09 declared a `gate` block on all six capability-matrix inputs and said
 * plainly that **every `ciGate` value in it was established by a human grep over
 * `.github/workflows/`, and that nothing asserted them**. A declared
 * `ciGate: true` that no workflow enforces is exactly the class of false evidence
 * this programme has spent its run removing, and the drift is silent in both
 * directions: a job renamed or given `continue-on-error` turns a `true` into a
 * lie, and a lane that quietly *gains* enforcement leaves a `false` understating
 * what can fail a merge.
 *
 * This is the same textual mechanism widened, not a second one. The `ci-gate` read
 * above is a substring test over one job block of one file; the clause below reads
 * **every** file under `.github/workflows/`, splits each into jobs and each job
 * into steps, and for **each input that declares `ciGate`** asks one question:
 *
 *   **is there a job that runs this input's lane and can fail?**
 *
 * "Can fail" means neither the step nor its job carries `continue-on-error: true`
 * — the distinction TASK-S1-O3's `inputs[].gate` exists to record. Then:
 *
 * - `ciGate: true` requires **at least one** such job. Zero is a violation.
 * - `ciGate: false` requires **zero**. One or more is a violation, so a lane that
 *   silently becomes a gate reddens the chain until the declaration catches up.
 *
 * Two further things fail closed rather than pass quietly: an input that declares
 * `ciGate` with no lane declared in `CI_GATE_LANES` (a seventh input would arrive
 * unverified otherwise), and a `CI_GATE_LANES` entry naming an input the matrix no
 * longer has (a stale declaration checking nothing).
 *
 * **What a "lane" is, per input, is a declaration and not a guess**, because the
 * answer differs in kind between inputs and getting it wrong is how a check like
 * this becomes decoration. `story-dod`'s evidence *is* static analysis, so the
 * validator invoking it is the lane. `at-matrix`'s evidence is a person listening
 * to a screen reader, so its structural validators — which DO run in CI without
 * `continue-on-error` — are **not** its lane: they check the shape of a record and
 * exit 0 over an empty directory by design. `CI_GATE_LANES` carries that reasoning
 * next to each entry.
 *
 * A step's `run:` text is **expanded through the root `package.json` scripts**
 * before matching, transitively and with a depth cap, so `yarn validate:all` is
 * seen to contain the links it actually chains rather than only the four words
 * printed in the YAML. `//`-prefixed documentation keys are skipped — they are
 * prose about commands, not commands, and clause 6 below already had to learn that.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/browser-lane.ts
 *
 * Exit code 1 if violations found.
 *
 * @module @dzup-ui/tooling/validators/browser-lane
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

/** The lane's CI job id and the script it must invoke. */
export const CI_JOB_ID = 'storybook-test'
/** The npm script the CI job runs. Renaming it without updating CI is a violation. */
export const CI_LANE_SCRIPT = 'test-storybook:ci'
/** Packages the app must declare itself, because hoisting will not supply them. */
export const REQUIRED_APP_DEV_DEPS = ['vitest', '@vitest/browser', 'vite', 'playwright'] as const
/**
 * The guard's top-level **call**, on a line of its own. A substring search would
 * also be satisfied by the declaration `function assertAppLocalRunner(): void`.
 */
export const GUARD_CALL = /^assertAppLocalRunner\(\)\s*$/m

/** Where the declared `ciGate` values are published. */
export const CAPABILITY_MATRIX_PATH = 'packages/core/docs/capability-matrix.json'
/** The directory whose every file is read for the `ciGate` clause. */
export const WORKFLOW_DIR = '.github/workflows'
/** How far a `yarn <script>` reference is followed through the root manifest. */
export const SCRIPT_EXPANSION_DEPTH = 6

/**
 * One capability-matrix input, and what "running its lane" means in CI.
 *
 * The commands are a **declaration with a reason**, not a keyword list: see the
 * module header for why `at-matrix`'s structural validators are deliberately not
 * among them.
 */
export interface CiGateLane {
  /** The `inputs` key in the capability matrix, exactly as it is published. */
  input: string
  /**
   * Commands that, run by a job that can fail, would make this input's evidence
   * able to fail a CI run. Matched as substrings of a step's `run:` text after
   * root-script expansion.
   */
  laneCommands: readonly string[]
  /** Why these commands, and not this input's other scripts. */
  why: string
}

export const CI_GATE_LANES: readonly CiGateLane[] = [
  {
    input: 'story-dod',
    laneCommands: ['validate:story-dod'],
    why: 'This input\'s evidence IS static analysis over the committed story text, so '
      + 'the validator is the lane — there is nothing else to run. The prefix also '
      + 'matches `validate:story-dod-tiers`, the triaged half that holds the ceilings.',
  },
  {
    input: 'at-matrix',
    laneCommands: ['at:ingest', 'test:at'],
    why: 'A screen-reader result is produced by a PERSON, and `yarn at:ingest` is what '
      + 'transcribes the session record they wrote. `validate:at-matrix` and '
      + '`validate:at-runs` are deliberately NOT lane commands: they do run in CI '
      + 'without `continue-on-error`, and they exit 0 over an empty directory by '
      + 'design, so counting them would make an input with 0 of 534 cells executed '
      + 'read as gated.',
  },
  {
    input: 'perf-baselines',
    laneCommands: ['test:perf', 'DZUP_PERF_GATE'],
    why: 'Every perf metric reports always and fails only under `DZUP_PERF_GATE=1`, so '
      + 'a job that ran `yarn test:perf` WITHOUT that variable would still not be a '
      + 'gate. Either token is accepted because either one appearing is the signal '
      + 'that this lane has reached CI and the declaration needs re-measuring.',
  },
  {
    input: 'browser-matrix',
    laneCommands: ['test:e2e:matrix', 'generate:browser-evidence'],
    why: 'The ledger this input reads is written by projecting a Playwright matrix '
      + 'report through `generate:browser-evidence`. Running the sweep without '
      + 'projecting it, or projecting without running it, both count as the lane '
      + 'having arrived — the declaration is then wrong either way.',
  },
  {
    input: 'visual-baselines',
    laneCommands: ['test:e2e:visual', 'visual:accept'],
    why: 'The gate specs are the two lanes whose baselines sit on the authoritative '
      + 'platform. `test:e2e:visual` DOES run in `ci.yml`, and the declaration is '
      + '`false` because that step carries `continue-on-error: true` — which is '
      + 'precisely the distinction this clause measures rather than assumes.',
  },
  {
    input: 'browser-engine-ratchets',
    laneCommands: ['test:e2e:matrix', 'generate:browser-evidence'],
    why: 'The same sweep as `browser-matrix`: the per-engine ledger is a projection of '
      + 'the same run. Declared separately because the input is READ separately — it '
      + 'is what lets a matrix cell say which of the 24 projects ran.',
  },
] as const

export interface BrowserLaneViolation {
  rule: string
  message: string
}

/** One step of one workflow job, reduced to the two things this validator asks. */
export interface WorkflowStep {
  /** The step's `name:` when it has one, for the diagnostic a human reads. */
  name: string
  /** The step's `run:` body, joined; empty for a `uses:` step. */
  run: string
  /** `continue-on-error: true` on the step itself. */
  continueOnError: boolean
}

/** One workflow job. */
export interface WorkflowJob {
  /** Repo-relative path of the file it came from. */
  file: string
  /** The job key. */
  id: string
  /** `continue-on-error: true` on the job. */
  continueOnError: boolean
  steps: WorkflowStep[]
}

/** A declared `ciGate`, read from the published matrix. */
export interface DeclaredCiGate {
  input: string
  ciGate: boolean
}

/** Everything the check reads, so it is testable without a repository. */
export interface BrowserLaneInputs {
  /** `apps/storybook/package.json`, parsed. */
  appManifest: {
    installConfig?: { hoistingLimits?: string }
    scripts?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  /** The source of `apps/storybook/vitest.config.ts`. */
  vitestConfigSource: string
  /** The source of `.github/workflows/ci.yml`. */
  workflowSource: string
  /** Every manifest in the repo that declares scripts, keyed by repo-relative path. */
  scriptManifests: { path: string, scripts: Record<string, string> }[]
  /**
   * **Every** file under `.github/workflows/`, so a lane cannot be enforced (or
   * stop being enforced) in a file this validator does not look at.
   */
  workflowFiles: { path: string, source: string }[]
  /**
   * The root manifest's scripts, used to expand a step's `yarn <script>` into what
   * it actually chains. Required rather than optional: a caller that omitted it
   * would silently stop seeing `validate:all`'s links.
   */
  rootScripts: Record<string, string>
  /**
   * The `ciGate` values as **published**, read from the capability matrix, or
   * `undefined` when the artifact could not be read or parsed — which is itself a
   * violation, reported by the caller rather than thrown here.
   */
  declaredGates: DeclaredCiGate[] | undefined
}

/**
 * The `storybook-test:` job block, from its own key up to the next job at the
 * same indentation. Returns `undefined` when there is no such job — which is
 * itself a violation, reported by the caller rather than thrown here.
 */
export function extractJobBlock(workflowSource: string, jobId: string): string | undefined {
  const start = workflowSource.indexOf(`\n  ${jobId}:`)
  if (start === -1)
    return undefined
  const rest = workflowSource.slice(start + 1)
  const next = rest.slice(1).search(/\n {2}[\w-]+:/)
  return next === -1 ? rest : rest.slice(0, next + 1)
}

/**
 * Every job of one workflow file, with its steps.
 *
 * A textual split, for the reason the module header gives, and scoped to the
 * `jobs:` mapping: `on:` and `concurrency:` also carry two-space keys
 * (`  push:`, `  group:`), so a scan that did not wait for `jobs:` would invent a
 * job called `push`. Indentation is GitHub's fixed shape — jobs at 2, job keys at
 * 4, steps at 6 — which is what makes the split safe without a YAML parser.
 */
/** `continue-on-error: true` at job level (4 spaces). */
const JOB_ADVISORY = /^ {4}continue-on-error: *true\b/
/** `continue-on-error: true` at step level (8 spaces). */
const STEP_ADVISORY = /^ {8}continue-on-error: *true\b/
/** `- continue-on-error: true` on a step's own opening line. */
const INLINE_ADVISORY = /^continue-on-error: *true\b/
/** A YAML block-scalar introducer, so `run: |` is read as a multi-line command. */
const BLOCK_SCALAR = /^[|>]/

export function parseWorkflowJobs(file: string, source: string): WorkflowJob[] {
  const jobs: WorkflowJob[] = []
  let inJobs = false
  let job: WorkflowJob | undefined
  let step: WorkflowStep | undefined
  let runIndent = -1
  let runBlock = false

  const endStep = (): void => {
    if (job !== undefined && step !== undefined)
      job.steps.push(step)
    step = undefined
    runBlock = false
    runIndent = -1
  }

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '')
    if (line === '')
      continue

    // A key at column 0 ends the jobs mapping (and starts or continues another).
    if (/^\S/.test(line)) {
      endStep()
      job = undefined
      inJobs = /^jobs:\s*$/.test(line)
      continue
    }
    if (!inJobs)
      continue

    const jobKey = /^ {2}([\w-]+):/.exec(line)
    if (jobKey !== null) {
      endStep()
      job = { file, id: jobKey[1] ?? '', continueOnError: false, steps: [] }
      jobs.push(job)
      continue
    }
    if (job === undefined)
      continue

    // Job-level `continue-on-error` sits at 4 spaces; a step's sits at 8 (or on
    // the `- ` line itself). Getting those two confused is the whole point of
    // this clause, so they are matched separately and never by `includes`.
    if (JOB_ADVISORY.test(line)) {
      endStep()
      job.continueOnError = true
      continue
    }

    const stepStart = /^ {6}- (.*)$/.exec(line)
    if (stepStart !== null) {
      endStep()
      step = { name: '', run: '', continueOnError: false }
      // `- run: cmd` and `- name: x` are both legal on the opening line.
      const inline = stepStart[1] ?? ''
      const asRun = /^run:(.*)$/.exec(inline)
      const asName = /^name:(.*)$/.exec(inline)
      if (asRun !== null) {
        const value = (asRun[1] ?? '').trim()
        if (BLOCK_SCALAR.test(value)) {
          runBlock = true
          runIndent = 8
        }
        else {
          step.run = value
        }
      }
      else if (asName !== null) {
        step.name = (asName[1] ?? '').trim()
      }
      else if (INLINE_ADVISORY.test(inline)) {
        step.continueOnError = true
      }
      continue
    }
    if (step === undefined)
      continue

    const indent = /^ */.exec(line)?.[0].length ?? 0
    if (runBlock && indent >= runIndent) {
      step.run += `${line.trim()}\n`
      continue
    }
    runBlock = false

    if (STEP_ADVISORY.test(line)) {
      step.continueOnError = true
      continue
    }
    const name = /^ {8}name:(.*)$/.exec(line)
    if (name !== null) {
      step.name = (name[1] ?? '').trim()
      continue
    }
    const run = /^ {8}run:(.*)$/.exec(line)
    if (run !== null) {
      const value = (run[1] ?? '').trim()
      if (BLOCK_SCALAR.test(value)) {
        runBlock = true
        runIndent = 10
      }
      else {
        step.run = value
      }
    }
  }
  endStep()
  return jobs
}

/**
 * A step's command with its root-level `yarn <script>` references replaced by what
 * they chain, transitively.
 *
 * `yarn workspace <pkg> <script>` is deliberately NOT followed: that name belongs
 * to another manifest, and looking it up in the root's would resolve a collision
 * to the wrong body. `//`-prefixed keys are skipped — they are documentation.
 */
export function expandYarnScripts(
  command: string,
  scripts: Record<string, string>,
  depth = SCRIPT_EXPANSION_DEPTH,
  seen: Set<string> = new Set(),
): string {
  if (depth <= 0)
    return command
  let out = command
  const referenced = /\byarn\s+(?!workspace\b|workspaces\b|dlx\b|node\b|run\b)([\w:@./-]+)/g
  for (const match of command.matchAll(referenced)) {
    const name = match[1] ?? ''
    if (name === '' || name.startsWith('//') || seen.has(name))
      continue
    const body = scripts[name]
    if (body === undefined)
      continue
    seen.add(name)
    out += `\n${expandYarnScripts(body, scripts, depth - 1, seen)}`
  }
  return out
}

/** A job that runs one of `laneCommands` and can fail, or `undefined`. */
export function findEnforcingJob(
  jobs: readonly WorkflowJob[],
  laneCommands: readonly string[],
  rootScripts: Record<string, string>,
): { job: WorkflowJob, step: WorkflowStep, command: string } | undefined {
  for (const job of jobs) {
    for (const step of job.steps) {
      if (step.run === '')
        continue
      const expanded = expandYarnScripts(step.run, rootScripts)
      const hit = laneCommands.find(command => expanded.includes(command))
      if (hit === undefined)
        continue
      if (job.continueOnError || step.continueOnError)
        continue
      return { job, step, command: hit }
    }
  }
  return undefined
}

/** Every job that runs one of `laneCommands`, whether or not it can fail. */
export function findLaneJobs(
  jobs: readonly WorkflowJob[],
  laneCommands: readonly string[],
  rootScripts: Record<string, string>,
): { job: WorkflowJob, step: WorkflowStep, advisory: boolean }[] {
  const found: { job: WorkflowJob, step: WorkflowStep, advisory: boolean }[] = []
  for (const job of jobs) {
    for (const step of job.steps) {
      if (step.run === '')
        continue
      const expanded = expandYarnScripts(step.run, rootScripts)
      if (!laneCommands.some(command => expanded.includes(command)))
        continue
      found.push({ job, step, advisory: job.continueOnError || step.continueOnError })
    }
  }
  return found
}

/** A step's label for a diagnostic: its `name:` if it has one, else its command. */
function describeStep(step: WorkflowStep): string {
  return step.name === '' ? (step.run.split('\n')[0] ?? '').trim() : step.name
}

/**
 * Whether every published `ciGate` is true of the workflows, in both directions.
 *
 * Fails closed on four things, not two: the claim being unsupported, the claim
 * being understated, an input declaring `ciGate` with no lane declared here, and a
 * lane declared here for an input the matrix no longer publishes.
 */
export function checkCiGateClaims(inputs: BrowserLaneInputs): BrowserLaneViolation[] {
  const violations: BrowserLaneViolation[] = []
  const { declaredGates, workflowFiles, rootScripts } = inputs

  if (declaredGates === undefined) {
    violations.push({
      rule: 'ci-gate-declaration',
      message: `${CAPABILITY_MATRIX_PATH} could not be read as a capability matrix with `
        + 'an `inputs` map, so no declared `ciGate` could be verified. This fails rather '
        + 'than skips: an unreadable artifact is how a check like this stops running '
        + 'without anyone noticing.',
    })
    return violations
  }

  if (workflowFiles.length === 0) {
    violations.push({
      rule: 'ci-gate-declaration',
      message: `no files were read from ${WORKFLOW_DIR}/, so every \`ciGate\` claim would `
        + 'be verified against nothing. A `false` would pass vacuously.',
    })
    return violations
  }

  const jobs = workflowFiles.flatMap(f => parseWorkflowJobs(f.path, f.source))
  const files = workflowFiles.map(f => f.path).join(', ')

  for (const declared of declaredGates) {
    const lane = CI_GATE_LANES.find(l => l.input === declared.input)
    if (lane === undefined) {
      violations.push({
        rule: 'ci-gate-declaration',
        message: `capability-matrix input \`${declared.input}\` declares `
          + `\`ciGate: ${declared.ciGate}\` and \`CI_GATE_LANES\` names no lane for it, so `
          + 'the claim is unverifiable. Declare what running that input\'s lane looks '
          + 'like, with the reason, beside the other six.',
      })
      continue
    }
    const enforcing = findEnforcingJob(jobs, lane.laneCommands, rootScripts)
    if (declared.ciGate && enforcing === undefined) {
      const advisory = findLaneJobs(jobs, lane.laneCommands, rootScripts)
      violations.push({
        rule: 'ci-gate-claim',
        message: `capability-matrix input \`${declared.input}\` declares \`ciGate: true\`, `
          + `but no job in ${WORKFLOW_DIR}/ runs its lane and can fail. Searched `
          + `${jobs.length} job(s) across ${workflowFiles.length} file(s) (${files}) for `
          + `${lane.laneCommands.map(c => `\`${c}\``).join(' or ')}${advisory.length === 0
            ? ' — no job runs it at all'
            : `; the ${advisory.length} job(s) that do are advisory: ${advisory
              .map(a => `${a.job.file} job \`${a.job.id}\` step \`${describeStep(a.step)}\``)
              .join(', ')}`
          }. Either the declaration is wrong or the gate was lost.`,
      })
      continue
    }
    if (!declared.ciGate && enforcing !== undefined) {
      violations.push({
        rule: 'ci-gate-drift',
        message: `capability-matrix input \`${declared.input}\` declares \`ciGate: false\`, `
          + `but ${enforcing.job.file} job \`${enforcing.job.id}\` step `
          + `\`${describeStep(enforcing.step)}\` runs \`${enforcing.command}\` and carries `
          + 'no `continue-on-error` on either the step or the job. The lane became a gate '
          + 'and the declaration did not follow, so the matrix understates what can fail a '
          + 'merge — and every `blockedOn` sentence beside it is now stale.',
      })
    }
  }

  const declaredInputs = new Set(declaredGates.map(d => d.input))
  for (const lane of CI_GATE_LANES) {
    if (!declaredInputs.has(lane.input)) {
      violations.push({
        rule: 'ci-gate-declaration',
        message: `\`CI_GATE_LANES\` declares a lane for capability-matrix input `
          + `\`${lane.input}\`, which no longer declares a \`ciGate\` (or no longer `
          + 'exists). A lane entry that matches no input verifies nothing and reads as '
          + 'coverage; remove it or restore the input.',
      })
    }
  }

  return violations
}

/** Every violation, in a stable order. Empty means the lane is wired and gated. */
export function checkBrowserLane(inputs: BrowserLaneInputs): BrowserLaneViolation[] {
  const violations: BrowserLaneViolation[] = []
  const { appManifest, vitestConfigSource, workflowSource, scriptManifests } = inputs

  // 1. The reason the app needs its own runner in the first place.
  if (appManifest.installConfig?.hoistingLimits !== 'workspaces') {
    violations.push({
      rule: 'hoisting-limits',
      message: 'apps/storybook/package.json must declare `installConfig.hoistingLimits: '
        + '"workspaces"`. Every other clause here exists because it does; if that changed '
        + 'deliberately, this validator is what has to change with it.',
    })
  }

  // 2. The app must declare the whole runner itself.
  const declared = appManifest.devDependencies ?? {}
  const missing = REQUIRED_APP_DEV_DEPS.filter(name => declared[name] === undefined)
  if (missing.length > 0) {
    violations.push({
      rule: 'own-runner',
      message: `apps/storybook must declare its own ${missing.join(', ')} in devDependencies. `
        + 'Without it the specifier resolves to the ROOT install and every run becomes a '
        + 'cross-install run, which hangs at collection instead of failing.',
    })
  }

  // 3. The guard that turns a 7-minute silence into an error message.
  //
  // Anchored to a top-level call statement, NOT a substring. `includes` matched
  // the declaration `function assertAppLocalRunner(): void` too — measured while
  // proving this gate can fail — so deleting only the call site, which is the
  // whole of the damage, would have passed.
  if (!GUARD_CALL.test(vitestConfigSource)) {
    violations.push({
      rule: 'runner-guard',
      message: 'apps/storybook/vitest.config.ts must CALL `assertAppLocalRunner()` at the top '
        + 'level (declaring it is not enough). It is the only thing standing between a '
        + 'cross-install invocation and ~7 minutes of silence followed by `Browser connection '
        + 'was closed while running tests` (D-S5O2-1).',
    })
  }

  // 4. The lane must still be a browser lane.
  const browserClauses: [string, string][] = [
    ['enabled: true', 'browser mode is not enabled'],
    ['provider: \'playwright\'', 'no playwright provider is configured'],
    ['instances:', 'no browser instance list is configured'],
  ]
  const absent = browserClauses.filter(([needle]) => !vitestConfigSource.includes(needle))
  if (absent.length > 0) {
    violations.push({
      rule: 'browser-mode',
      message: `apps/storybook/vitest.config.ts no longer configures a browser lane: ${
        absent.map(([, why]) => why).join('; ')
      }. The suite would still pass — in jsdom — and would silently stop being the `
      + 'repository\'s only browser-qualified evidence.',
    })
  }

  // 5. The lane must still be able to fail CI.
  const job = extractJobBlock(workflowSource, CI_JOB_ID)
  if (job === undefined) {
    violations.push({
      rule: 'ci-gate',
      message: `.github/workflows/ci.yml has no \`${CI_JOB_ID}:\` job. The lane would run `
        + 'nowhere, and no aggregate would say so: it is not part of `validate:all` either.',
    })
  }
  else {
    if (!job.includes(CI_LANE_SCRIPT)) {
      violations.push({
        rule: 'ci-gate',
        message: `.github/workflows/ci.yml job \`${CI_JOB_ID}\` does not invoke `
          + `\`${CI_LANE_SCRIPT}\`. A job that no longer runs the lane is not a gate.`,
      })
    }
    if (/continue-on-error:\s*true/.test(job)) {
      violations.push({
        rule: 'ci-advisory',
        message: `.github/workflows/ci.yml job \`${CI_JOB_ID}\` carries `
          + '`continue-on-error: true`. That demotes the only browser-qualified lane in the '
          + 'repository from a gate to a report, which is exactly the "an input that is read '
          + 'but cannot fail CI" state TASK-S1-O3 made recordable.',
      })
    }
  }

  // 6. No script may teach the invocation that hangs.
  for (const manifest of scriptManifests) {
    for (const [name, body] of Object.entries(manifest.scripts)) {
      if (name.startsWith('//'))
        continue
      if (/\.\.[\\/](?:\.\.[\\/])*node_modules[\\/]vitest/.test(body)) {
        violations.push({
          rule: 'cross-install-invocation',
          message: `${manifest.path} script \`${name}\` reaches a vitest binary through `
            + '`../node_modules`. For apps/storybook that is the invocation that hangs at '
            + 'collection; invoke the workspace\'s own binary instead.',
        })
      }
    }
  }

  // 7. Every published `ciGate` must be true of the workflows, both ways.
  violations.push(...checkCiGateClaims(inputs))

  return violations
}

/** Read the inputs off disk. */
export function readBrowserLaneInputs(root = ROOT): BrowserLaneInputs {
  const read = (relPath: string): string => readFileSync(resolve(root, relPath), 'utf-8')
  const manifestPaths = [
    'package.json',
    'apps/storybook/package.json',
    'apps/landing/package.json',
    'apps/docs/package.json',
  ]
  const scriptManifests: { path: string, scripts: Record<string, string> }[] = []
  for (const path of manifestPaths) {
    let parsed: { scripts?: Record<string, string> }
    try {
      parsed = JSON.parse(read(path)) as { scripts?: Record<string, string> }
    }
    catch {
      continue // An app that does not exist cannot carry a bad script.
    }
    if (parsed.scripts !== undefined)
      scriptManifests.push({ path, scripts: parsed.scripts })
  }

  // Every workflow file, sorted, so the diagnostics are stable run to run.
  const workflowFiles: { path: string, source: string }[] = []
  const workflowDir = resolve(root, WORKFLOW_DIR)
  if (existsSync(workflowDir)) {
    for (const entry of readdirSync(workflowDir).sort()) {
      if (!/\.ya?ml$/.test(entry))
        continue
      workflowFiles.push({ path: `${WORKFLOW_DIR}/${entry}`, source: read(`${WORKFLOW_DIR}/${entry}`) })
    }
  }

  // The declared `ciGate` values, as published. `undefined` — not `[]` — when the
  // artifact cannot be read: an empty list would pass every claim vacuously, and
  // this clause has to fail closed.
  let declaredGates: DeclaredCiGate[] | undefined
  try {
    const matrix = JSON.parse(read(CAPABILITY_MATRIX_PATH)) as {
      inputs?: Record<string, { gate?: { ciGate?: unknown } }>
    }
    if (matrix.inputs === undefined || typeof matrix.inputs !== 'object')
      throw new TypeError('no `inputs` map')
    declaredGates = Object.entries(matrix.inputs)
      .filter(([, value]) => typeof value?.gate?.ciGate === 'boolean')
      .map(([input, value]) => ({ input, ciGate: value.gate?.ciGate as boolean }))
  }
  catch {
    declaredGates = undefined
  }

  const rootManifest = JSON.parse(read('package.json')) as { scripts?: Record<string, string> }

  return {
    appManifest: JSON.parse(read('apps/storybook/package.json')) as BrowserLaneInputs['appManifest'],
    vitestConfigSource: read('apps/storybook/vitest.config.ts'),
    workflowSource: read('.github/workflows/ci.yml'),
    scriptManifests,
    workflowFiles,
    rootScripts: rootManifest.scripts ?? {},
    declaredGates,
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const inputs = readBrowserLaneInputs()
  const violations = checkBrowserLane(inputs)

  console.warn('Browser lane wiring — RESIDUAL-03 / D-S5O2-1\n')
  console.warn(`  lane       apps/storybook, --project=storybook, provider playwright/chromium`)
  console.warn(`  entry      yarn storybook:test → workspace script \`test-storybook\``)
  console.warn(`  ci gate    .github/workflows/ci.yml job \`${CI_JOB_ID}\` → \`${CI_LANE_SCRIPT}\``)
  console.warn(`  authority  CI runs ubuntu-latest; a developer run on another platform is `
    + `local evidence, never a qualification for anyone else`)
  console.warn(`  not here   this gate does NOT run the lane — no browser is downloaded, `
    + `nothing is measured`)

  // The `ciGate` verdicts, printed as a table rather than only when they fail: the
  // value of this clause is that the six answers are now MEASURED every run, and a
  // reader of the log should be able to see which way each one went.
  const jobs = inputs.workflowFiles.flatMap(f => parseWorkflowJobs(f.path, f.source))
  console.warn(`\n  ciGate claims — ${inputs.workflowFiles.length} workflow file(s), `
    + `${jobs.length} job(s) read from ${WORKFLOW_DIR}/`)
  for (const declared of inputs.declaredGates ?? []) {
    const lane = CI_GATE_LANES.find(l => l.input === declared.input)
    if (lane === undefined) {
      console.warn(`    ${declared.input.padEnd(24)} declared ${String(declared.ciGate).padEnd(5)} `
        + `no lane declared`)
      continue
    }
    const found = findLaneJobs(jobs, lane.laneCommands, inputs.rootScripts)
    const enforcing = found.filter(f => !f.advisory)
    const where = enforcing.length > 0
      ? enforcing.map(f => `${f.job.file}:${f.job.id}`).join(', ')
      : found.length > 0
        ? `${found.length} advisory job(s): ${found.map(f => `${f.job.file}:${f.job.id}`).join(', ')}`
        : 'no job runs the lane'
    console.warn(`    ${declared.input.padEnd(24)} declared ${String(declared.ciGate).padEnd(5)} `
      + `enforcing ${String(enforcing.length).padEnd(3)} ${where}`)
  }
  if (inputs.declaredGates === undefined)
    console.warn(`    (the capability matrix could not be read — see the violation below)`)

  if (violations.length === 0) {
    console.warn('\n✓ browser-lane: the lane is invocable, is still a browser lane, and can '
      + 'still fail CI; and every declared `ciGate` matches what the workflows do.')
    process.exit(0)
  }

  console.error('')
  for (const v of violations)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${violations.length} browser-lane violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
