/**
 * Which standalone Playwright lanes CI runs, as a two-way declaration
 * (UI-DZUP-UI-TEST-M-08).
 *
 * `e2e/styling/layer-order.spec.ts` is the only proof of ADR-19 §2 — the six
 * layers in the PACKED core/tokens CSS, and a consumer's `@layer dz-overrides`
 * beating dz-components without `!important` — and it ran in no workflow: the
 * root Playwright config ignores `e2e/styling`, and the lane's own config was
 * invoked by nothing under `.github/workflows`. A lane that runs nowhere is a
 * claim, not a check.
 *
 * Each lane below is declared either `gated` (some workflow job runs it and can
 * fail: neither the step nor the job carries `continue-on-error: true`) or
 * `notGated` with the reason. Both directions are checked against the live
 * workflows, so wiring a not-gated lane — or dropping a gated one — reddens this
 * file until the declaration is updated with it. The workflow reading reuses
 * `validate:browser-lane`'s parser and its root-script expansion.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { findEnforcingJob, findLaneJobs, parseWorkflowJobs, WORKFLOW_DIR } from './browser-lane.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

interface E2eLane {
  /** The root `package.json` script that runs the lane. */
  script: string
  gated: boolean
  why: string
}

const E2E_LANES: readonly E2eLane[] = [
  {
    script: 'test:e2e:layer-order',
    gated: true,
    why: 'ADR-19 §2 cascade proof on the packed tarballs. Runs in ci.yml\'s build job, '
      + 'after `yarn build`, on chromium only; firefox and webkit stay a local lane.',
  },
  {
    script: 'test:e2e:csp',
    gated: false,
    why: 'The strict-CSP browser lane builds a Vite fixture and serves it twice. The '
      + 'blocking CI coverage today is `test:csp:packed` (SSR bytes, open vs strict) in '
      + 'the test job; this browser lane is not wired yet and is declared so here '
      + 'rather than assumed.',
  },
]

const rootScripts = (JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }).scripts

function workflowJobs(override?: { file: string, source: string }) {
  const dir = resolve(ROOT, WORKFLOW_DIR)
  return readdirSync(dir)
    .filter(name => /\.ya?ml$/.test(name))
    .flatMap((name) => {
      const file = `${WORKFLOW_DIR}/${name}`
      const source = override?.file === file ? override.source : readFileSync(resolve(dir, name), 'utf8')
      return parseWorkflowJobs(file, source)
    })
}

const CI_FILE = `${WORKFLOW_DIR}/ci.yml`
const ciSource = readFileSync(resolve(ROOT, CI_FILE), 'utf8')

describe('e2e lane wiring', () => {
  it('declares only scripts the root manifest defines', () => {
    for (const lane of E2E_LANES)
      expect(rootScripts[lane.script], lane.script).toBeTypeOf('string')
  })

  it.each(E2E_LANES.map(lane => ({ ...lane, label: `${lane.script} (${lane.gated ? 'gated' : 'not gated'})` })))(
    '$label matches the workflows',
    ({ script, gated }) => {
      const jobs = workflowJobs()
      if (gated) {
        const enforcing = findEnforcingJob(jobs, [script], rootScripts)
        expect(enforcing, `${script} must run in a job that can fail`).toBeDefined()
      }
      else {
        expect(findLaneJobs(jobs, [script], rootScripts).map(({ job }) => `${job.file}#${job.id}`)).toEqual([])
      }
    },
  )

  it('runs the layer-order lane in ci.yml after the packages are built', () => {
    const enforcing = findEnforcingJob(workflowJobs(), ['test:e2e:layer-order'], rootScripts)
    expect(enforcing?.job.file).toBe(CI_FILE)
    const steps = enforcing!.job.steps
    const build = steps.findIndex(step => /\byarn build\b/.test(step.run))
    const lane = steps.indexOf(enforcing!.step)
    expect(build).toBeGreaterThanOrEqual(0)
    expect(lane).toBeGreaterThan(build)
  })

  it('fails when the layer-order step is removed from ci.yml', () => {
    const removed = ciSource.replace(/^ {6}- name: CSS layer order in the packed tarballs[^\n]*\n {8}run: [^\n]*\n/m, '')
    expect(removed).not.toBe(ciSource)
    expect(findEnforcingJob(workflowJobs({ file: CI_FILE, source: removed }), ['test:e2e:layer-order'], rootScripts)).toBeUndefined()
  })

  it('fails when the layer-order step is made advisory', () => {
    const advisory = ciSource.replace(
      /^( {6}- name: CSS layer order in the packed tarballs[^\n]*\n)/m,
      '$1        continue-on-error: true\n',
    )
    expect(advisory).not.toBe(ciSource)
    expect(findEnforcingJob(workflowJobs({ file: CI_FILE, source: advisory }), ['test:e2e:layer-order'], rootScripts)).toBeUndefined()
  })
})
