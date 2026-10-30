/**
 * Artifact retention (CI-ARTIFACT-RETENTION-20261030-R1).
 *
 * Actions artifacts share the organisation's 500 MB storage pool. An upload
 * without `retention-days` keeps the org default of 90 days, and the two
 * Lighthouse CI steps uploaded through the action itself, which has no
 * retention input: 146 of those artifacts (2.5 GB) filled the pool, and
 * every repository's uploads then failed with "Artifact storage quota has been
 * hit". Every upload now states a retention of at most 14 days, and the
 * Lighthouse action's own upload stays off. upload-artifact@v4 also skips
 * hidden paths unless `include-hidden-files: true`, which left landing-perf's
 * `.lighthouseci/` out of every artifact, so a hidden upload path is refused.
 * The rule reads named paths only; a dotfile inside a named folder is still
 * left out of the upload.
 */
import { describe, expect, it } from 'vitest'
import { jobs, listWorkflowFiles, readWorkflow } from './workflow-text.ts'

const MAX_RETENTION_DAYS = 14

/** Each step of a job body as its lines; steps open at 6 spaces with `- `. */
function steps(body: string[]): string[][] {
  const result: string[][] = []
  for (const line of body) {
    if (/^ {6}- /.test(line))
      result.push([line])
    else if (/^ {7,}/.test(line))
      result.at(-1)?.push(line)
  }
  return result
}

/** The `path:` entries of an upload step, inline or as a block scalar. */
function uploadPaths(step: string[]): string[] {
  const start = step.findIndex(line => /^ {10}path:/.test(line))
  if (start === -1)
    return []
  const inline = step[start]!.replace(/^ {10}path:\s*/, '').trim()
  if (inline !== '' && !/^[|>][+-]?$/.test(inline))
    return [inline.replace(/^(['"])(.*)\1$/, '$2')]
  const entries: string[] = []
  for (const line of step.slice(start + 1)) {
    if (!/^ {12,}\S/.test(line))
      break
    entries.push(line.trim())
  }
  return entries.map(entry => entry.replace(/^(!?)(['"])(.*)\2$/, '$1$3'))
}

function uses(step: string[], action: string): boolean {
  return step.some(line => new RegExp(`^\\s*(?:-\\s+)?uses:\\s*${action}@`).test(line))
}

const files = listWorkflowFiles()
const allSteps = files.flatMap(file =>
  [...jobs(readWorkflow(file))].flatMap(([job, body]) => steps(body).map(step => ({ file, job, step }))),
)
const uploads = allSteps.filter(({ step }) => uses(step, 'actions/upload-artifact(?:/merge)?'))
const lighthouse = allSteps.filter(({ step }) => uses(step, 'treosh/lighthouse-ci-action'))

describe('artifact retention (CI-ARTIFACT-RETENTION-20261030-R1)', () => {
  it('finds the upload and Lighthouse steps, so the rules below are not vacuous', () => {
    expect(uploads.length).toBeGreaterThanOrEqual(10)
    expect(lighthouse.length).toBe(2)
  })

  it(`gives every actions/upload-artifact step a retention of 1 to ${MAX_RETENTION_DAYS} days`, () => {
    const offending = uploads
      .filter(({ step }) => {
        const days = step.map(line => /^ {10}retention-days:\s*(\d+)\s*$/.exec(line)?.[1]).find(Boolean)
        return days === undefined || Number(days) < 1 || Number(days) > MAX_RETENTION_DAYS
      })
      .map(({ file, job }) => `${file}:${job}`)
    expect(offending).toEqual([])
  })

  it('keeps the Lighthouse CI action\'s own upload off; actions/upload-artifact uploads the results', () => {
    const offending = lighthouse
      .filter(({ step }) => !step.some(line => /^ {10}uploadArtifacts:\s*false\s*$/.test(line)))
      .map(({ file, job }) => `${file}:${job}`)
    expect(offending).toEqual([])
    for (const { file, job } of lighthouse) {
      const paths = uploads.filter(upload => upload.file === file && upload.job === job).flatMap(({ step }) => uploadPaths(step))
      expect(paths).toEqual(expect.arrayContaining(['lighthouse-desktop/', 'lighthouse-mobile/']))
    }
  })

  it('keeps each URL\'s representative Lighthouse report and moves the results into the uploaded folders', () => {
    for (const { file, job } of lighthouse) {
      const scripts = allSteps.filter(entry => entry.file === file && entry.job === job).map(({ step }) => step.join('\n'))
      const upload = scripts.findIndex(script => script.includes('\n            lighthouse-mobile/'))
      for (const device of ['desktop', 'mobile']) {
        const run = scripts.findIndex(script => /uses:\s*treosh\/lighthouse-ci-action@/.test(script) && script.includes(`lighthouserc${device === 'mobile' ? '.mobile' : ''}.json`))
        const index = scripts.findIndex(script => script.includes(`mv .lighthouseci lighthouse-${device}`))
        const aside = scripts[index]
        expect(aside, `${file}:${job}:${device}`).toBeDefined()
        expect(aside).toMatch(/^ {8}if: always\(\)$/m)
        expect(aside).toContain('select(.isRepresentativeRun | not)')
        expect(aside).toContain('rm -f .lighthouseci/lhr-*')
        // Right after its own Lighthouse run, and before the upload.
        expect([run + 1 === index, index < upload], `${file}:${job}:${device} order`).toEqual([true, true])
      }
    }
  })

  it('uploads no hidden path unless the step sets include-hidden-files: true', () => {
    const offending = uploads
      .filter(({ step }) => !step.some(line => /^ {10}include-hidden-files:\s*true\s*$/.test(line)))
      .flatMap(({ file, job, step }) => uploadPaths(step)
        .filter(entry => !entry.startsWith('!') && entry.split('/').some(part => /^\.[^./]/.test(part)))
        .map(entry => `${file}:${job}:${entry}`))
    expect(offending).toEqual([])
  })
})
