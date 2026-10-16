/**
 * The npm publish token reaches the publish script and nothing else
 * (UI-DZUP-UI-SEC-M-09).
 *
 * The release job used to hand `NPM_TOKEN` — exported three ways — to the
 * changesets step, which ran `yarn version-packages` and `yarn release`, and so
 * `yarn build` across every workspace, after a `yarn install` with
 * `enableScripts: true`. Any compromised build tool or install-time dependency
 * could read the token. The pins below hold both publishing workflows to one
 * rule: a step whose environment carries the token runs only
 * `yarn release:publish`, and the build it publishes ran earlier without it.
 *
 * A textual read of GitHub's fixed workflow shape — jobs at 2 spaces, steps at
 * 6, step keys at 8 — as `validators/browser-lane.ts` does, so no YAML parser
 * dependency is needed.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..', '..')
const WORKFLOWS = ['.github/workflows/release.yml', '.github/workflows/publish-prerelease.yml']
const TOKEN_VARS = ['NPM_TOKEN', 'NODE_AUTH_TOKEN', 'YARN_NPM_AUTH_TOKEN']
const TOKEN_KEY = new RegExp(`^\\s*(?:${TOKEN_VARS.join('|')}):`)
/** The one command a token-bearing step may run. */
const PUBLISH_ONLY = /^yarn release:publish(?:\s|$)/

interface Step {
  job: string
  name: string
  /** Token variables in this step's own `env:` */
  tokens: string[]
  /** Each command line of `run:`, plus a changesets/action `version` / `publish` input */
  commands: string[]
}

interface Workflow {
  steps: Step[]
  /** Token variables declared anywhere but a step's own `env:` (workflow or job level) */
  strayTokens: string[]
}

function parseWorkflow(source: string): Workflow {
  const steps: Step[] = []
  const strayTokens: string[] = []
  let inJobs = false
  let job = ''
  let step: Step | undefined
  let section: 'env' | 'run' | 'with' | undefined
  let usesAction = ''

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '')
    if (line.trim() === '' || line.trim().startsWith('#'))
      continue
    const indent = line.length - line.trimStart().length

    if (indent === 0) {
      step = undefined
      inJobs = /^jobs:\s*$/.test(line)
    }
    else if (inJobs && indent === 2) {
      step = undefined
      job = line.trim().replace(/:$/, '')
    }
    else if (inJobs && indent === 6 && line.trimStart().startsWith('- ')) {
      step = { job, name: '', tokens: [], commands: [] }
      steps.push(step)
      section = undefined
      usesAction = ''
      // `- name: x`, `- run: x` and `- uses: x` are all legal on the opening line.
      const inline = line.trimStart().slice(2)
      readStepKey(inline)
      continue
    }
    else if (step !== undefined && indent === 8) {
      readStepKey(line.trim())
      continue
    }
    else if (step !== undefined && indent > 8 && section !== undefined) {
      const text = line.trim()
      if (section === 'run') {
        step.commands.push(text)
      }
      else if (section === 'env' && TOKEN_KEY.test(text)) {
        step.tokens.push(text.split(':')[0]!)
      }
      else if (section === 'with' && usesAction.startsWith('changesets/action')) {
        const input = /^(version|publish):(.+)$/.exec(text)
        if (input !== null)
          step.commands.push(input[2]!.trim())
      }
      continue
    }

    // Anything else that names a token is outside any step's own `env:`.
    if (TOKEN_KEY.test(line))
      strayTokens.push(line.trim())
  }

  function readStepKey(text: string): void {
    const key = /^([\w-]+):(.*)$/.exec(text)
    if (key === null || step === undefined)
      return
    const name = key[1]
    const value = (key[2] ?? '').trim()
    section = undefined
    if (name === 'name') {
      step.name = value.replace(/^['"]|['"]$/g, '')
    }
    else if (name === 'uses') {
      usesAction = value
    }
    else if (name === 'env') {
      section = 'env'
    }
    else if (name === 'with') {
      section = 'with'
    }
    else if (name === 'run') {
      if (/^[|>]/.test(value))
        section = 'run'
      else
        step.commands.push(value)
    }
  }

  return { steps, strayTokens }
}

/** What the rule finds wrong with one workflow; empty when it holds. */
function tokenViolations(source: string): string[] {
  const { steps, strayTokens } = parseWorkflow(source)
  const violations = strayTokens.map(token => `token outside a step env: ${token}`)
  for (const step of steps.filter(s => s.tokens.length > 0)) {
    if (step.commands.length === 0)
      violations.push(`"${step.name}" carries ${step.tokens.join(', ')} and runs no publish command`)
    for (const command of step.commands.filter(c => !PUBLISH_ONLY.test(c)))
      violations.push(`"${step.name}" carries ${step.tokens.join(', ')} while running: ${command}`)
  }
  return violations
}

describe.each(WORKFLOWS)('%s — npm token scoping (UI-DZUP-UI-SEC-M-09)', (file) => {
  const source = readFileSync(resolve(ROOT_DIR, file), 'utf-8')
  const { steps } = parseWorkflow(source)
  const publishSteps = steps.filter(step => step.tokens.length > 0)

  it('gives the token only to steps that run nothing but yarn release:publish', () => {
    expect(tokenViolations(source)).toEqual([])
  })

  it('still publishes, so the rule above is not satisfied vacuously', () => {
    expect(publishSteps.length).toBeGreaterThan(0)
    expect(publishSteps.flatMap(step => step.tokens)).toContain('YARN_NPM_AUTH_TOKEN')
  })

  it('installs and builds in token-free steps before the publish step', () => {
    const firstPublish = steps.indexOf(publishSteps[0]!)
    const earlier = steps.slice(0, firstPublish)
    for (const command of ['yarn install', 'yarn build'])
      expect(earlier.some(step => step.tokens.length === 0 && step.commands.some(c => c.startsWith(command)))).toBe(true)
  })
})

describe('tokenViolations', () => {
  it('flags the shape the release job had: the token beside version and build scripts', () => {
    const before = [
      'jobs:',
      '  release:',
      '    steps:',
      '      - name: Create Release Pull Request or Publish',
      '        uses: changesets/action@v1',
      '        with:',
      '          version: yarn version-packages',
      '          publish: yarn release',
      '        env:',
      '          NPM_TOKEN: <secret>',
      '          YARN_NPM_AUTH_TOKEN: <secret>',
    ].join('\n')
    expect(tokenViolations(before)).toEqual([
      '"Create Release Pull Request or Publish" carries NPM_TOKEN, YARN_NPM_AUTH_TOKEN while running: yarn version-packages',
      '"Create Release Pull Request or Publish" carries NPM_TOKEN, YARN_NPM_AUTH_TOKEN while running: yarn release',
    ])
  })

  it('flags a token set for the whole job', () => {
    const jobLevel = [
      'jobs:',
      '  release:',
      '    env:',
      '      NODE_AUTH_TOKEN: <secret>',
      '    steps:',
      '      - run: yarn build',
    ].join('\n')
    expect(tokenViolations(jobLevel)).toEqual(['token outside a step env: NODE_AUTH_TOKEN: <secret>'])
  })

  it('flags a publish step that also builds', () => {
    const buildAndPublish = [
      'jobs:',
      '  release:',
      '    steps:',
      '      - name: Publish',
      '        run: |',
      '          yarn build',
      '          yarn release:publish --provenance',
      '        env:',
      '          YARN_NPM_AUTH_TOKEN: <secret>',
    ].join('\n')
    expect(tokenViolations(buildAndPublish)).toEqual(['"Publish" carries YARN_NPM_AUTH_TOKEN while running: yarn build'])
  })
})
