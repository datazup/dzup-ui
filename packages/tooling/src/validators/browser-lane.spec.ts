/**
 * Unit coverage for `validate:browser-lane` (RESIDUAL-03).
 *
 * Every clause is exercised against a fixture, and then the **live repository**
 * is read once and required to be clean. Both halves matter: the fixtures prove
 * the rules can fail, and the live read proves they are not failing for a reason
 * nobody would notice until CI.
 */

import type { BrowserLaneInputs, DeclaredCiGate } from './browser-lane.ts'
import { describe, expect, it } from 'vitest'
import {
  checkBrowserLane,
  checkCiGateClaims,
  CI_GATE_LANES,
  CI_JOB_ID,
  CI_LANE_SCRIPT,
  expandYarnScripts,
  extractJobBlock,
  findEnforcingJob,
  parseWorkflowJobs,
  readBrowserLaneInputs,
  REQUIRED_APP_DEV_DEPS,
} from './browser-lane.ts'

/**
 * One workflow that carries every shape the file's clauses read: the lane's own
 * job, a job that enforces `story-dod`'s lane, and a job whose visual step is
 * `continue-on-error` — which is the live repository's arrangement, reduced.
 *
 * `on:` and its nested keys are present on purpose. They also sit at two-space
 * indentation, so a job scan that did not wait for `jobs:` would report a job
 * called `push`.
 */
const GATED_WORKFLOW = [
  'name: CI',
  'on:',
  '  push:',
  '    branches: [main]',
  '  pull_request:',
  'jobs:',
  '  typecheck:',
  '    runs-on: ubuntu-latest',
  `  ${CI_JOB_ID}:`,
  '    runs-on: ubuntu-latest',
  '    steps:',
  `      - run: yarn workspace @dzup-ui/storybook ${CI_LANE_SCRIPT}`,
  '  validate:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - name: Story definition of done',
  '        run: yarn validate:story-dod',
  '  e2e:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - name: Run visual snapshot tests (Chromium, report-only)',
  '        continue-on-error: true',
  '        run: yarn test:e2e:visual --project=chromium',
  '',
].join('\n')

/** Every input declaring the value the live matrix declares. */
function declaredAsToday(overrides: Partial<Record<string, boolean>> = {}): DeclaredCiGate[] {
  return CI_GATE_LANES.map(lane => ({
    input: lane.input,
    ciGate: overrides[lane.input] ?? lane.input === 'story-dod',
  }))
}

function wellWired(overrides: Partial<BrowserLaneInputs> = {}): BrowserLaneInputs {
  return {
    appManifest: {
      installConfig: { hoistingLimits: 'workspaces' },
      devDependencies: Object.fromEntries(REQUIRED_APP_DEV_DEPS.map(name => [name, '*'])),
    },
    vitestConfigSource: [
      'assertAppLocalRunner()',
      'test: { browser: { enabled: true, provider: \'playwright\', instances: [] } }',
    ].join('\n'),
    workflowSource: GATED_WORKFLOW,
    scriptManifests: [{ path: 'package.json', scripts: { test: 'vitest run' } }],
    workflowFiles: [{ path: '.github/workflows/ci.yml', source: GATED_WORKFLOW }],
    rootScripts: { 'validate:story-dod': 'tsx story-dod.ts', 'test:e2e:visual': 'playwright test' },
    declaredGates: declaredAsToday(),
    ...overrides,
  }
}

describe('extractJobBlock', () => {
  it('returns only the named job, stopping at the next one', () => {
    const block = extractJobBlock(wellWired().workflowSource, CI_JOB_ID)
    expect(block).toBeDefined()
    expect(block).toContain(CI_LANE_SCRIPT)
    // The neighbouring jobs must not bleed in, or a `continue-on-error` on some
    // other job would read as this lane being advisory.
    expect(block).not.toContain('e2e:')
    expect(block).not.toContain('typecheck:')
  })

  it('is undefined for a job that is not there', () => {
    expect(extractJobBlock(wellWired().workflowSource, 'no-such-job')).toBeUndefined()
  })
})

describe('checkBrowserLane', () => {
  it('passes a well-wired lane', () => {
    expect(checkBrowserLane(wellWired())).toEqual([])
  })

  it('fails when the app stops declaring hoistingLimits', () => {
    const violations = checkBrowserLane(wellWired({
      appManifest: { devDependencies: Object.fromEntries(REQUIRED_APP_DEV_DEPS.map(n => [n, '*'])) },
    }))
    expect(violations.map(v => v.rule)).toContain('hoisting-limits')
  })

  it.each(REQUIRED_APP_DEV_DEPS)('fails when the app stops declaring its own %s', (dropped) => {
    const devDependencies = Object.fromEntries(
      REQUIRED_APP_DEV_DEPS.filter(n => n !== dropped).map(n => [n, '*']),
    )
    const violations = checkBrowserLane(wellWired({
      appManifest: { installConfig: { hoistingLimits: 'workspaces' }, devDependencies },
    }))
    const ownRunner = violations.find(v => v.rule === 'own-runner')
    expect(ownRunner?.message).toContain(dropped)
  })

  it('fails when the cross-install guard is removed', () => {
    const violations = checkBrowserLane(wellWired({
      vitestConfigSource: 'test: { browser: { enabled: true, provider: \'playwright\', instances: [] } }',
    }))
    expect(violations.map(v => v.rule)).toContain('runner-guard')
  })

  it('fails when the guard is declared but never called', () => {
    // The substring form of this check passed here, because
    // `assertAppLocalRunner(): void` contains `assertAppLocalRunner()`. Deleting
    // the call is the whole of the damage, so this case is pinned.
    const violations = checkBrowserLane(wellWired({
      vitestConfigSource: [
        'function assertAppLocalRunner(): void { throw new Error(\'x\') }',
        'test: { browser: { enabled: true, provider: \'playwright\', instances: [] } }',
      ].join('\n'),
    }))
    expect(violations.map(v => v.rule)).toContain('runner-guard')
  })

  it('accepts the guard call even when the declaration precedes it', () => {
    const violations = checkBrowserLane(wellWired({
      vitestConfigSource: [
        'function assertAppLocalRunner(): void { throw new Error(\'x\') }',
        'assertAppLocalRunner()',
        'test: { browser: { enabled: true, provider: \'playwright\', instances: [] } }',
      ].join('\n'),
    }))
    expect(violations).toEqual([])
  })

  it('fails when the lane stops being a browser lane', () => {
    const violations = checkBrowserLane(wellWired({
      vitestConfigSource: 'assertAppLocalRunner()\ntest: { environment: \'jsdom\' }',
    }))
    const browserMode = violations.find(v => v.rule === 'browser-mode')
    expect(browserMode?.message).toContain('browser mode is not enabled')
    expect(browserMode?.message).toContain('no playwright provider is configured')
  })

  it('fails when CI has no job for the lane', () => {
    const violations = checkBrowserLane(wellWired({ workflowSource: 'jobs:\n  typecheck:\n' }))
    expect(violations.map(v => v.rule)).toContain('ci-gate')
  })

  it('fails when the CI job stops invoking the lane script', () => {
    const violations = checkBrowserLane(wellWired({
      workflowSource: `jobs:\n  ${CI_JOB_ID}:\n    steps:\n      - run: echo skipped\n`,
    }))
    expect(violations.map(v => v.rule)).toContain('ci-gate')
  })

  it('fails when the CI job is demoted to advisory', () => {
    const violations = checkBrowserLane(wellWired({
      workflowSource: `jobs:\n  ${CI_JOB_ID}:\n    continue-on-error: true\n    steps:\n`
        + `      - run: yarn workspace @dzup-ui/storybook ${CI_LANE_SCRIPT}\n`,
    }))
    expect(violations.map(v => v.rule)).toContain('ci-advisory')
  })

  it('fails a script that reaches vitest through ../node_modules', () => {
    const violations = checkBrowserLane(wellWired({
      scriptManifests: [{
        path: 'apps/storybook/package.json',
        scripts: { 'test-storybook': 'node ../../node_modules/vitest/vitest.mjs run' },
      }],
    }))
    expect(violations.map(v => v.rule)).toContain('cross-install-invocation')
  })

  it('ignores `//`-prefixed documentation scripts', () => {
    const violations = checkBrowserLane(wellWired({
      scriptManifests: [{
        path: 'package.json',
        scripts: { '//note': 'never run ../../node_modules/vitest/vitest.mjs from apps/storybook' },
      }],
    }))
    expect(violations).toEqual([])
  })
})

describe('parseWorkflowJobs', () => {
  it('reads only the jobs mapping, not the two-space keys under `on:`', () => {
    const jobs = parseWorkflowJobs('ci.yml', GATED_WORKFLOW)
    expect(jobs.map(j => j.id)).toEqual(['typecheck', CI_JOB_ID, 'validate', 'e2e'])
    // `push` and `pull_request` sit at the same indentation as a job key.
    expect(jobs.map(j => j.id)).not.toContain('push')
    expect(jobs.map(j => j.id)).not.toContain('pull_request')
  })

  it('attaches each step to its own job, with its name and its command', () => {
    const jobs = parseWorkflowJobs('ci.yml', GATED_WORKFLOW)
    const validate = jobs.find(j => j.id === 'validate')
    expect(validate?.steps).toHaveLength(1)
    expect(validate?.steps[0]?.name).toBe('Story definition of done')
    expect(validate?.steps[0]?.run).toContain('validate:story-dod')
    expect(validate?.steps[0]?.continueOnError).toBe(false)
  })

  it('distinguishes a step-level `continue-on-error` from a job-level one', () => {
    const jobs = parseWorkflowJobs('ci.yml', GATED_WORKFLOW)
    const e2e = jobs.find(j => j.id === 'e2e')
    // The live `ci.yml` carries it on the STEP; confusing the two is what would
    // make a demoted lane read as a gate.
    expect(e2e?.continueOnError).toBe(false)
    expect(e2e?.steps[0]?.continueOnError).toBe(true)

    const jobLevel = parseWorkflowJobs('x.yml', [
      'jobs:',
      '  chromatic:',
      '    continue-on-error: true',
      '    steps:',
      '      - run: yarn chromatic',
      '',
    ].join('\n'))
    expect(jobLevel[0]?.continueOnError).toBe(true)
    expect(jobLevel[0]?.steps[0]?.continueOnError).toBe(false)
  })

  it('reads a block scalar `run: |` as the whole command', () => {
    const jobs = parseWorkflowJobs('x.yml', [
      'jobs:',
      '  build:',
      '    steps:',
      '      - name: Two commands',
      '        run: |',
      '          yarn tokens:generate',
      '          git diff --exit-code',
      '      - run: echo after',
      '',
    ].join('\n'))
    expect(jobs[0]?.steps).toHaveLength(2)
    expect(jobs[0]?.steps[0]?.run).toContain('tokens:generate')
    expect(jobs[0]?.steps[0]?.run).toContain('git diff --exit-code')
    expect(jobs[0]?.steps[1]?.run).toBe('echo after')
  })
})

describe('expandYarnScripts', () => {
  it('follows a root script transitively, so a chain is seen for what it chains', () => {
    const scripts = {
      'validate:all': 'yarn lint && yarn validate:story-dod',
      'validate:story-dod': 'tsx validators/story-dod.ts',
      'lint': 'eslint .',
    }
    const expanded = expandYarnScripts('yarn validate:all', scripts)
    expect(expanded).toContain('validate:story-dod')
    expect(expanded).toContain('story-dod.ts')
  })

  it('does NOT follow `yarn workspace <pkg> <script>`', () => {
    // That name belongs to another manifest; resolving it in the root's would
    // answer about a different script that happens to share the name.
    const expanded = expandYarnScripts('yarn workspace @dzup-ui/landing perf', { perf: 'yarn test:perf' })
    expect(expanded).not.toContain('test:perf')
  })

  it('terminates on a self-referential script', () => {
    expect(() => expandYarnScripts('yarn a', { a: 'yarn b', b: 'yarn a' })).not.toThrow()
  })
})

describe('checkCiGateClaims', () => {
  it('passes when every declared value matches the workflows', () => {
    expect(checkCiGateClaims(wellWired())).toEqual([])
  })

  it('declares a lane for every input the live matrix gates', () => {
    // The live artifact is the authority for which inputs exist; this is the pin
    // that makes a seventh input arrive as a failure rather than as silence.
    const live = readBrowserLaneInputs().declaredGates
    expect(live).toBeDefined()
    expect([...(live ?? [])].map(d => d.input).sort())
      .toEqual([...CI_GATE_LANES].map(l => l.input).sort())
  })

  it('fails a `ciGate: true` that no job enforces, naming the input', () => {
    const violations = checkCiGateClaims(wellWired({
      workflowFiles: [{
        path: '.github/workflows/ci.yml',
        source: 'jobs:\n  validate:\n    steps:\n      - run: yarn lint\n',
      }],
    }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-claim'])
    expect(violations[0]?.message).toContain('story-dod')
    expect(violations[0]?.message).toContain('validate:story-dod')
    expect(violations[0]?.message).toContain('no job runs it at all')
  })

  it('fails a `ciGate: true` whose only job is advisory, and says so', () => {
    const violations = checkCiGateClaims(wellWired({
      workflowFiles: [{
        path: '.github/workflows/ci.yml',
        source: [
          'jobs:',
          '  validate:',
          '    continue-on-error: true',
          '    steps:',
          '      - name: Story definition of done',
          '        run: yarn validate:story-dod',
          '',
        ].join('\n'),
      }],
    }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-claim'])
    expect(violations[0]?.message).toContain('advisory')
    expect(violations[0]?.message).toContain('job `validate`')
  })

  it('fails a `ciGate: false` that a job DOES enforce — the drift direction', () => {
    // A lane that silently becomes a gate is the half RESIDUAL-09 could not see:
    // the declaration would keep reading `false` and its `blockedOn` sentence
    // would keep naming acts that had already happened.
    const violations = checkCiGateClaims(wellWired({
      workflowFiles: [{
        path: '.github/workflows/ci.yml',
        source: [
          'jobs:',
          '  validate:',
          '    steps:',
          '      - name: Story definition of done',
          '        run: yarn validate:story-dod',
          '  matrix:',
          '    steps:',
          '      - name: Browser matrix',
          '        run: yarn test:e2e:matrix',
          '',
        ].join('\n'),
      }],
    }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-drift', 'ci-gate-drift'])
    // Both inputs that read the same sweep are named, not just the first.
    expect(violations.map(v => v.message).join(' ')).toContain('browser-matrix')
    expect(violations.map(v => v.message).join(' ')).toContain('browser-engine-ratchets')
    expect(violations[0]?.message).toContain('job `matrix`')
    expect(violations[0]?.message).toContain('test:e2e:matrix')
  })

  it('a step-level `continue-on-error` is enough to keep a `false` true', () => {
    const violations = checkCiGateClaims(wellWired({
      workflowFiles: [{
        path: '.github/workflows/ci.yml',
        source: [
          'jobs:',
          '  validate:',
          '    steps:',
          '      - run: yarn validate:story-dod',
          '  matrix:',
          '    steps:',
          '      - name: Browser matrix',
          '        continue-on-error: true',
          '        run: yarn test:e2e:matrix',
          '',
        ].join('\n'),
      }],
    }))
    expect(violations).toEqual([])
  })

  it('fails an input that declares `ciGate` with no lane declared for it', () => {
    const violations = checkCiGateClaims(wellWired({
      declaredGates: [...declaredAsToday(), { input: 'a-seventh-input', ciGate: false }],
    }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-declaration'])
    expect(violations[0]?.message).toContain('a-seventh-input')
  })

  it('fails a declared lane whose input the matrix no longer publishes', () => {
    const violations = checkCiGateClaims(wellWired({
      declaredGates: declaredAsToday().filter(d => d.input !== 'at-matrix'),
    }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-declaration'])
    expect(violations[0]?.message).toContain('at-matrix')
  })

  it('fails closed when the capability matrix cannot be read', () => {
    const violations = checkCiGateClaims(wellWired({ declaredGates: undefined }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-declaration'])
    expect(violations[0]?.message).toContain('capability-matrix.json')
  })

  it('fails closed when no workflow file was read at all', () => {
    // Otherwise every `false` passes vacuously and the clause reads as green.
    const violations = checkCiGateClaims(wellWired({ workflowFiles: [] }))
    expect(violations.map(v => v.rule)).toEqual(['ci-gate-declaration'])
    expect(violations[0]?.message).toContain('verified against nothing')
  })

  it('sees a lane reached only through `yarn validate:all`', () => {
    // The live repository has exactly this: `validate-min-runtime.yml` runs the
    // chain, and `validate:story-dod` is a link of it rather than a line of YAML.
    const found = findEnforcingJob(
      parseWorkflowJobs('v.yml', 'jobs:\n  floor:\n    steps:\n      - run: yarn validate:all\n'),
      ['validate:story-dod'],
      { 'validate:all': 'yarn lint && yarn validate:story-dod && yarn build' },
    )
    expect(found?.job.id).toBe('floor')
    expect(found?.command).toBe('validate:story-dod')
  })
})

describe('the live repository', () => {
  it('is wired so the browser lane can run and can fail CI', () => {
    expect(checkBrowserLane(readBrowserLaneInputs())).toEqual([])
  })

  it('story-dod is the ONLY input whose lane a CI job enforces today', () => {
    // Re-derived from the workflows on every run, not quoted from a report. If
    // this ever reads differently, one of the six `gate` blocks is out of date
    // and the clause above will already have said which.
    const inputs = readBrowserLaneInputs()
    const jobs = inputs.workflowFiles.flatMap(f => parseWorkflowJobs(f.path, f.source))
    const enforced = CI_GATE_LANES
      .filter(lane => findEnforcingJob(jobs, lane.laneCommands, inputs.rootScripts) !== undefined)
      .map(lane => lane.input)
    expect(enforced).toEqual(['story-dod'])
  })
})
