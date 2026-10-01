import type { SecurityConformanceReport } from '@dzup-ui/testing'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  expectSecurityConformance,
  formatConformanceReport,
  runSecurityConformance,
  SECURITY_CORPUS_VERSION,
} from '@dzup-ui/testing/security-conformance'
import { describe, expect, it } from 'vitest'
import { DZ_ESCAPING_SANITIZER, resolveSanitizer } from '../src/security/sanitize.ts'

/**
 * Core's own sanitizer adapter, run against the versioned corpus (TASK-S3-O3).
 *
 * The suite next door (`url-boundary.*`) asks what real components do with
 * hostile values. This asks a narrower and until now unasked question: does the
 * adapter at the **centre** of ADR-20's sanitizer seam actually neutralise the
 * corpus? R3-O2 shipped the seam and R3-O4 shipped the fixture format, and
 * between them nothing executed one against the other — the interface was
 * published, and conformance was asserted in prose.
 *
 * Two adapters are measured here on purpose, because they are not the same
 * thing and the difference is the whole point of the seam:
 *
 *   - **`resolveSanitizer()` wrapping the escaping default** — what
 *     `useDzSanitizer` hands a component when a host has installed nothing.
 *     Escapes, *and* enforces `DzSanitizeLimits` before `sanitize` is reached.
 *     This is the reference adapter.
 *   - **`DZ_ESCAPING_SANITIZER` alone** — the bare default, with no seam around
 *     it. It escapes and enforces nothing, so it fails the depth fixture. That
 *     failure is asserted below rather than avoided: it is the executable proof
 *     that the ceilings belong to the seam and that this runner can distinguish
 *     an adapter that fails from one that passes.
 */

const REFERENCE_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'sanitizer-conformance.reference.json',
)

interface Reference {
  readonly runnerVersion: string
  readonly corpusVersion: string
  readonly corpusFingerprint: string
  readonly adapter: string
  readonly cells: number
  readonly lossy: number
  readonly nonConforming: number
  readonly counts: Record<string, number>
  readonly failClosed: Record<string, string>
  readonly unasserted: readonly { fixtureId: string, sink: string, reason: string }[]
  readonly verdicts: Record<string, string>
}

const reference = JSON.parse(readFileSync(REFERENCE_PATH, 'utf8')) as Reference

/** The adapter a component really gets: the seam, not the bare default. */
const seamAdapter = resolveSanitizer(() => undefined, DZ_ESCAPING_SANITIZER)

const report: SecurityConformanceReport = runSecurityConformance(seamAdapter, {
  adapterName: reference.adapter,
})

describe('the Core sanitizer adapter conforms to the security corpus', () => {
  it('prints the per-fixture verdict count for the run', () => {
    // Not decoration: the `<done_check>` for this task asks for a per-fixture
    // verdict count to be printed, and a suite that asserts without reporting
    // leaves the reader to trust the exit code.
    console.warn(formatConformanceReport(report))
    for (const cell of report.cellDetail)
      console.warn(`  ${cell.fixtureId}:${cell.sink} requires ${cell.required} → ${cell.verdict}${cell.lossy ? ' (lossy)' : ''}`)
    for (const cell of report.unasserted)
      console.warn(`  ${cell.fixtureId}:${cell.sink} UNASSERTED — ${cell.reason}`)
    expect(report.cells).toBeGreaterThan(0)
  })

  it('conforms on every asserted cell, with every fail-closed property holding', () => {
    expectSecurityConformance(report)
  })

  it('runs a non-empty suite — the corpus really does carry sanitizer cells', () => {
    // The silent-failure guard. `expectSecurityConformance` on an empty report
    // would pass, so the count is asserted separately from the conformance.
    expect(report.cells).toBe(reference.cells)
    expect(report.cells).toBeGreaterThan(0)
  })

  it('matches the recorded reference verdict for verdict', () => {
    expect(report.verdicts).toEqual(reference.verdicts)
    expect(report.counts).toEqual(reference.counts)
    expect(report.lossy).toBe(reference.lossy)
    expect(report.nonConforming).toBe(0)
    expect(report.nonConforming).toBe(reference.nonConforming)
  })

  it('is pinned to a corpus content version and fingerprint', () => {
    expect(report.corpusVersion).toBe(SECURITY_CORPUS_VERSION)
    expect(report.corpusVersion).toBe(reference.corpusVersion)
    expect(report.corpusFingerprint).toBe(reference.corpusFingerprint)
    expect(report.runnerVersion).toBe(reference.runnerVersion)
  })

  it('records the same fail-closed state the reference does, all four holding', () => {
    expect(report.failClosed).toEqual(reference.failClosed)
    for (const [property, value] of Object.entries(report.failClosed))
      expect(value, property).not.toBe('NOT FAIL-CLOSED')
  })

  it('reports the same unasserted cells, each with a reason that says it is not passing', () => {
    expect(report.unasserted.map(cell => `${cell.fixtureId}:${cell.sink}`))
      .toEqual(reference.unasserted.map(cell => `${cell.fixtureId}:${cell.sink}`))
    for (const cell of report.unasserted)
      expect(cell.reason.length, `${cell.fixtureId}:${cell.sink}`).toBeGreaterThan(40)
  })

  it('escapes rather than strips, and says so — the default is safe and lossy', () => {
    // Core ships no HTML sink and bundles no sanitizer (see sanitize.ts's note
    // on the three candidate defaults), so every markup fixture comes back
    // escaped where a DOMPurify-backed adapter would report `stripped`. That is
    // conformance by over-delivery, and the report says `lossy` so nobody reads
    // it as "Core sanitizes rich content".
    expect(report.counts.escaped).toBeGreaterThan(0)
    expect(report.counts.stripped).toBe(0)
    expect(report.lossy).toBe(report.counts.escaped)
    expect(report.counts['passed-through']).toBe(0)
    expect(report.counts.unchanged).toBe(0)
  })
})

describe('the ceilings belong to the seam, not to the adapter', () => {
  const depthCell = 'degenerate-input.depth.element-nesting-bomb:html'

  it('the seam blocks the depth bomb before anything parses', () => {
    expect(report.verdicts[depthCell]).toBe('blocked')
    const cell = report.cellDetail.find(candidate => `${candidate.fixtureId}:${candidate.sink}` === depthCell)
    expect(cell?.required).toBe('rejected')
    expect(cell?.detail).toContain('DzSanitizeLimitError')
  })

  it('the bare escaping default does NOT — which is why resolveSanitizer wraps it', () => {
    // The proof that this runner can fail. `DZ_ESCAPING_SANITIZER.sanitize` is
    // `escapeHtml` and nothing else: it never throws, so the depth fixture's
    // required `rejected` cannot be met and the run is non-conforming. If this
    // test ever goes green by itself, either the bare default started enforcing
    // ceilings (fine — re-record) or the runner stopped distinguishing
    // `blocked` from `escaped`, which would make every verdict here worthless.
    const bare = runSecurityConformance(DZ_ESCAPING_SANITIZER, {
      adapterName: '@dzup-ui/core:DZ_ESCAPING_SANITIZER (bare, no seam)',
    })
    expect(bare.verdicts[depthCell]).toBe('escaped')
    expect(bare.nonConforming).toBe(1)
    expect(() => expectSecurityConformance(bare)).toThrow(/degenerate-input\.depth\.element-nesting-bomb/)
    expect(() => expectSecurityConformance(bare)).toThrow(/requires "rejected"/)
  })

  it('a per-call ceiling override tightens the seam, and the fixture follows it', () => {
    // `DzSanitizeContext.limits` is the per-call override. A host that tightens
    // maxDepth to 4 must block payloads the default admits, which is the
    // property that makes the ceiling configurable rather than decorative.
    expect(() => seamAdapter.sanitize('<div><div><div><div><div>x', {
      sink: 'markdown',
      component: 'spec',
      limits: { maxDepth: 4 },
    })).toThrow(/nested too deeply/)
  })
})
