/**
 * Workflow hardening pins (UI-DZUP-UI-SEC-L-04).
 *
 * Six of eight workflows ran with the repository's default GITHUB_TOKEN
 * scope, Chromatic handed its project token to a floating `@latest` action,
 * and min-peer expanded a free-text dispatch input straight into a shell line.
 * Every workflow now declares its token permissions, inputs reach `run:` only
 * through `env:`, and third-party actions are SHA-pinned — except the
 * references in PENDING_SHA_PIN (none since QF-46). The list is exact in both directions: pinning one fails until it
 * is removed here, and a new unpinned action fails until it is pinned.
 */
import { describe, expect, it } from 'vitest'
import {
  hasTopLevelPermissions,
  jobHasPermissions,
  jobs,
  listWorkflowFiles,
  readWorkflow,
  runScripts,
  usesRefs,
} from './workflow-text.ts'

/**
 * Third-party actions still awaiting a verified full-length commit SHA. Empty
 * since AUDIT-FOLLOWUPS-20261017-R1 (QF-46) resolved the last three with
 * `git ls-remote https://github.com/<owner>/<repo> refs/tags/<tag>` (peeled):
 * chromaui/action latest = v18.13.0, treosh/lighthouse-ci-action v12, and
 * changesets/action v1 -> v1.9.0 (the repository carries no moving `v1` ref).
 * Kept as a record so a deliberate exception has a place to be stated.
 */
const PENDING_SHA_PIN: Record<string, string> = {}

const FULL_SHA = /@[0-9a-f]{40}$/
const INPUT_IN_SCRIPT = /\$\{\{\s*(?:github\.event\.)?inputs\./

function isFirstParty(ref: string): boolean {
  return ref.startsWith('./') || ref.startsWith('actions/')
}

const files = listWorkflowFiles()

describe('workflow hardening (UI-DZUP-UI-SEC-L-04)', () => {
  it('reads the workflow directory, so the rules below are not vacuous', () => {
    expect(files).toEqual(expect.arrayContaining(['ci.yml', 'chromatic.yml', 'min-peer.yml', 'release.yml']))
  })

  it.each(files)('%s declares token permissions for every job', (file) => {
    const source = readWorkflow(file)
    if (hasTopLevelPermissions(source))
      return
    const missing = [...jobs(source)].filter(([, body]) => !jobHasPermissions(body)).map(([id]) => id)
    expect(missing).toEqual([])
  })

  it.each(files)('%s passes no dispatch/call input straight into a run script', (file) => {
    const offending = runScripts(readWorkflow(file)).filter(script => INPUT_IN_SCRIPT.test(script))
    expect(offending).toEqual([])
  })

  it('pins every third-party action to a full commit SHA, apart from the exact pending list', () => {
    const unpinned = [...new Set(files.flatMap(file => usesRefs(readWorkflow(file))))]
      .filter(ref => !isFirstParty(ref) && !FULL_SHA.test(ref))
      .sort()
    expect(unpinned).toEqual(Object.keys(PENDING_SHA_PIN).sort())
  })
})

describe('workflow-text readers', () => {
  const sample = [
    'on: workflow_dispatch',
    'jobs:',
    '  a:',
    '    runs-on: ubuntu-latest',
    '    permissions:',
    '      contents: read',
    '    steps:',
    '      - uses: some/action@v1',
    // eslint-disable-next-line no-template-curly-in-string -- a literal workflow expression
    '      - run: echo ${{ inputs.x }}',
    '  b:',
    '    steps:',
    '      - name: block',
    '        run: |',
    '          echo one',
    // eslint-disable-next-line no-template-curly-in-string -- a literal workflow expression
    '          echo "${{ inputs.y }}"',
    '        env:',
    // eslint-disable-next-line no-template-curly-in-string -- a literal workflow expression
    '          SAFE: ${{ inputs.z }}',
  ].join('\n')

  it('finds a job without permissions when there is no top-level block', () => {
    expect(hasTopLevelPermissions(sample)).toBe(false)
    const missing = [...jobs(sample)].filter(([, body]) => !jobHasPermissions(body)).map(([id]) => id)
    expect(missing).toEqual(['b'])
  })

  it('flags inputs in inline and block run scripts but not in env', () => {
    const flagged = runScripts(sample).filter(script => INPUT_IN_SCRIPT.test(script))
    expect(flagged).toHaveLength(2)
    expect(flagged.join('\n')).not.toContain('inputs.z')
  })

  it('collects uses references', () => {
    expect(usesRefs(sample)).toEqual(['some/action@v1'])
  })
})
