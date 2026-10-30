/**
 * Artifact retention (CI-ARTIFACT-RETENTION-20261030-R1).
 *
 * Actions artifacts share the organisation's 500 MB storage pool. An upload
 * without `retention-days` keeps the org default of 90 days, and the two
 * Lighthouse CI steps uploaded through the action itself, which has no
 * retention input: 146 of those artifacts (2.5 GB) filled the pool, and
 * every repository's uploads then failed with "Artifact storage quota has been
 * hit". Every upload now states a retention of at most 14 days, and the
 * Lighthouse action's own upload stays off.
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

function uses(step: string[], action: string): boolean {
  return step.some(line => new RegExp(`^\\s*(?:-\\s+)?uses:\\s*${action}@`).test(line))
}

const files = listWorkflowFiles()
const allSteps = files.flatMap(file =>
  [...jobs(readWorkflow(file))].flatMap(([job, body]) => steps(body).map(step => ({ file, job, step }))),
)
const uploads = allSteps.filter(({ step }) => uses(step, 'actions/upload-artifact'))
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
  })
})
