/**
 * CI records a dependency-advisory result on every main push
 * (UI-DZUP-UI-SEC-L-03).
 *
 * The gates job ran licence and peer audits but nothing queried an advisory
 * database. ci.yml's `dependency-audit` job runs `yarn npm audit` on every PR
 * and main push and records the outcome in the run summary and an artifact.
 * It is deliberately non-blocking until the first baseline is triaged; this
 * spec pins that the result is RECORDED, not that it is green.
 */
import { describe, expect, it } from 'vitest'
import { jobs, readWorkflow } from './workflow-text.ts'

describe('ci.yml dependency-audit job (UI-DZUP-UI-SEC-L-03)', () => {
  const source = readWorkflow('ci.yml')
  const body = jobs(source).get('dependency-audit')
  const text = body?.join('\n') ?? ''

  it('runs on every push to main', () => {
    expect(source).toMatch(/^ {2}push:\n {4}branches: \[main\]/m)
    expect(body).toBeDefined()
    // No job-level condition, so neither a PR-only nor a manual-only job.
    expect(body!.some(line => /^ {4}if:/.test(line))).toBe(false)
  })

  it('queries the advisory database across the whole resolved tree', () => {
    expect(text).toMatch(/yarn npm audit --all --recursive --severity high/)
  })

  it('records the outcome even when the audit step fails', () => {
    expect(text).toMatch(/AUDIT_OUTCOME: \$\{\{ steps\.advisories\.outcome \}\}/)
    expect(text).toMatch(/GITHUB_STEP_SUMMARY/)
    expect(text).toMatch(/uses: actions\/upload-artifact@v4[\s\S]*path: dependency-audit\.txt/)
    const always = body!.filter(line => /^ {8}if: always\(\)/.test(line))
    expect(always.length).toBeGreaterThanOrEqual(2)
  })
})
