/**
 * `yarn docs:verify` — the CI-agnostic lane a deploy pipeline calls before it
 * uploads a byte (TASK-S2-O3).
 *
 * ## Why this exists rather than a workflow file
 *
 * The docs-deployment packet (`docs/program-2026-09-04/reports/docs-deployment-packet-2026-09.md`
 * §5) describes an eight-step `docs-deploy` job whose steps 3, 5 and 6 are the
 * gates that make publishing legal. That file was deliberately **not written**,
 * because writing a workflow that deploys is inside `<no_deploy>`. The cost of
 * that correct refusal was that the gates stayed a *list in a report*: an owner
 * wiring up Cloudflare Pages or GitHub Pages had to re-derive which commands to
 * run, in which order, and what each one proves.
 *
 * This lane is that list, executable, with **no host, no credential and no
 * upload in it**. The pipeline configuration the owner still has to write is
 * reduced to: check out, install, `yarn docs:verify`, upload
 * `apps/docs/.vitepress/dist`. Everything before the upload is one command here,
 * and the same command is what a developer runs locally — so the pipeline and
 * the desk cannot diverge, which is the failure mode this repository keeps
 * finding (N2-A3 D2: *"a surface that is only correct on one developer's disk"*).
 *
 * ## The five checks, and who already owned them
 *
 * Nothing here re-implements a check. Each step delegates to the lane that owns
 * it, so there is one implementation of every question:
 *
 * | # | Check | Delegates to | What it proves |
 * |---|---|---|---|
 * | 1 | **build** | `yarn docs:build` | the site builds; a stale `component-meta.json` turns it red (its `generate` step re-extracts); a **dead internal link** turns it red (`.vitepress/config.ts` does not ignore them); and it ends in `validate:docs-size --require-dist` |
 * | 2 | **size** | `yarn validate:docs-size --require-dist --all` | the measured artifact against the **declared budget** in `docs-size-ceilings.json`, both numbers printed, plus the ten largest files |
 * | 3 | **registry** | `yarn validate:registry --all` | the 191 items resolve, no Pro source, the theme is layered and dark-aware — and the **resolution ledger**: how many items a consumer could actually install (`--require-installable` makes tier 3 fail closed) |
 * | 4 | **links** | `yarn check:links` | every external URL the identity surfaces publish resolves. **No second link checker was added** — internal links are the build's job (step 1) |
 * | 5 | **freshness** | `yarn validate:docs-freshness --require-dist` + `yarn validate:docs-pages` + `yarn validate:playground-parity` | the built artifact is younger than every input and every rendered artifact names one commit; the committed pages match a fresh render; the playground copies are byte-identical to their producer |
 *
 * ## What it deliberately does not do
 *
 * It does not deploy, upload, authenticate, touch DNS, or write a workflow file.
 * It does not build Storybook or landing — those are the *other* two publishable
 * artifacts and their own budgets already govern them; a docs deploy that also
 * serves them (D166 option (a)) adds two build steps to the pipeline, and the
 * runbook says so rather than hiding them in here.
 *
 * Usage:
 *   yarn docs:verify
 *   yarn docs:verify --skip-build            # reuse the dist; step 5 still catches a stale one
 *   yarn docs:verify --require-installable    # fail closed on registry tier 3 (the deploy lane)
 *   yarn docs:verify --offline                # skip the external link check
 *
 * Exit code 1 if any step fails. Every step's own exit code is printed, because
 * "docs:verify failed" is not actionable and "step 3 registry exited 1" is.
 *
 * @module @dzup-ui/tooling/docs/verify
 */

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

export interface VerifyStep {
  /** `1`…`5` — the check number in the table above. Several commands may share one. */
  check: number
  name: string
  /** The yarn script and its arguments, exactly as a human would type them. */
  argv: readonly string[]
  /** Why this step is in the lane, for the log. */
  why: string
}

export interface VerifyOptions {
  skipBuild?: boolean
  requireInstallable?: boolean
  offline?: boolean
}

/**
 * The lane, as data. Ordered: nothing after step 1 means anything if the build
 * failed, and the freshness gate is last because it asks about the artifact the
 * earlier steps produced.
 */
export function verifySteps(options: VerifyOptions = {}): VerifyStep[] {
  const steps: VerifyStep[] = []
  if (options.skipBuild !== true) {
    steps.push({
      check: 1,
      name: 'build',
      argv: ['docs:build'],
      why: 'VitePress build; fails on a stale component-meta.json or a dead internal link, '
        + 'and ends in validate:docs-size --require-dist',
    })
  }
  steps.push({
    check: 2,
    name: 'size',
    argv: ['validate:docs-size', '--require-dist', '--all'],
    why: 'measured bytes against the declared budget in docs-size-ceilings.json',
  })
  steps.push({
    check: 3,
    name: 'registry',
    argv: options.requireInstallable === true
      ? ['validate:registry', '--all', '--require-installable']
      : ['validate:registry', '--all'],
    why: 'the 191 registry items resolve, and the resolution ledger says how many install',
  })
  if (options.offline !== true) {
    steps.push({
      check: 4,
      name: 'links',
      argv: ['check:links'],
      why: 'every external URL the identity surfaces publish resolves (internal links are step 1)',
    })
  }
  steps.push(
    {
      check: 5,
      name: 'freshness',
      argv: ['validate:docs-freshness', '--require-dist'],
      why: 'the built artifact is younger than every input; rendered artifacts name one commit',
    },
    {
      check: 5,
      name: 'pages',
      argv: ['validate:docs-pages'],
      why: 'the committed pages equal a fresh render of component-meta.json',
    },
    {
      check: 5,
      name: 'playground',
      argv: ['validate:playground-parity'],
      why: 'the copied playground assets are byte-identical to their single producer',
    },
  )
  return steps
}

export function parseVerifyOptions(argv: readonly string[]): VerifyOptions {
  return {
    skipBuild: argv.includes('--skip-build'),
    requireInstallable: argv.includes('--require-installable'),
    offline: argv.includes('--offline'),
  }
}

export interface StepResult {
  step: VerifyStep
  status: number
}

/* c8 ignore start */
/** Runs one step through yarn. `shell: true` because yarn is a `.cmd` on Windows. */
export function runStep(step: VerifyStep, cwd: string = ROOT): number {
  const r = spawnSync('yarn', [...step.argv], { cwd, stdio: 'inherit', shell: true })
  if (r.error !== undefined) {
    console.error(`  spawn failed: ${r.error.message}`)
    return 127
  }
  return r.status ?? 1
}

const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const options = parseVerifyOptions(process.argv)
  const steps = verifySteps(options)
  const results: StepResult[] = []

  console.warn('docs:verify — TASK-S2-O3, the lane a deploy pipeline calls before it uploads\n')
  console.warn(`  ${steps.length} command(s) across 5 checks · `
    + `skipBuild=${options.skipBuild === true} · `
    + `requireInstallable=${options.requireInstallable === true} · `
    + `offline=${options.offline === true}`)
  console.warn('  NOTHING in this lane deploys, uploads, authenticates or touches DNS.\n')

  for (const step of steps) {
    console.warn(`\n${'─'.repeat(78)}\n[${step.check}/${step.name}] yarn ${step.argv.join(' ')}`)
    console.warn(`  why: ${step.why}\n`)
    const status = runStep(step)
    results.push({ step, status })
    if (status !== 0 && step.name === 'build') {
      // Everything after the build asks a question about the artifact the build
      // produces. Continuing would report five failures with one cause.
      console.error('\n✗ the build failed — the remaining checks ask about an artifact that was '
        + 'not produced, so the lane stops here rather than reporting five symptoms of one cause.')
      break
    }
  }

  console.warn(`\n${'═'.repeat(78)}\ndocs:verify summary\n`)
  for (const r of results)
    console.warn(`  ${r.status === 0 ? 'PASS' : 'FAIL'}  [${r.step.check}/${r.step.name}]  exit ${r.status}  ·  yarn ${r.step.argv.join(' ')}`)
  const skipped = steps.length - results.length
  if (skipped > 0)
    console.warn(`  ${skipped} command(s) NOT RUN — see above`)

  const failed = results.filter(r => r.status !== 0)
  if (failed.length === 0 && skipped === 0) {
    console.warn('\n✓ docs:verify: the site is built, inside its declared budget, its registry '
      + 'resolves, its external links resolve and the artifact is younger than every input.')
    console.warn('  This is LOCALLY QUALIFIED, not deployed and not released. The deploy is the '
      + 'owner\'s act — see docs/program-2026-09-22-architecture/reports/TASK-S2-O3-deploy-runbook.md.')
    process.exit(0)
  }
  console.error(`\n✗ docs:verify: ${failed.length} command(s) failed`
    + `${skipped > 0 ? ` and ${skipped} did not run` : ''}. Do not deploy.`)
  process.exit(1)
}
/* c8 ignore stop */
