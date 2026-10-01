import type { ConformanceReference } from './security-conformance.ts'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  compareWithReference,
  CORE_ADAPTER_NAME,
  coreAdapter,
  measureCoreConformance,
  readReference,
  REFERENCE_PATH,
  toReference,
} from './security-conformance.ts'

/**
 * Specs for the security-conformance drift gate (TASK-S3-O3).
 *
 * The gate's own failure mode is the one worth testing: a comparison that reports
 * "no violations" because it compared nothing. So every seeded defect below is
 * one single mutation of a real reference, and each must produce a violation
 * that names what changed — a gate that fails without saying which cell moved
 * sends the reader back to the diff.
 */

const measured = measureCoreConformance('spec')
const recorded = toReference(measured, 'security-conformance.spec.ts')

/** One mutation of the reference, and the text the violation must contain. */
function seeded(mutate: (reference: ConformanceReference) => ConformanceReference, ...expected: string[]): void {
  const violations = compareWithReference(measured, mutate(structuredClone(recorded)))
  expect(violations.length, JSON.stringify(violations)).toBeGreaterThan(0)
  for (const text of expected)
    expect(violations.join('\n')).toContain(text)
}

describe('the recorded reference on disk is current', () => {
  it('exists, parses, and is what a fresh measurement produces', () => {
    expect(existsSync(REFERENCE_PATH)).toBe(true)
    const onDisk = readReference(REFERENCE_PATH)
    expect(onDisk.error).toBeUndefined()
    expect(compareWithReference(measured, onDisk.value!)).toEqual([])
  })

  it('is formatted as the writer writes it — two-space JSON with a trailing newline', () => {
    // So `--write` never produces a diff that is only whitespace, which is how a
    // generated artifact stops being reviewable.
    const text = readFileSync(REFERENCE_PATH, 'utf8')
    const onDisk = JSON.parse(text) as ConformanceReference
    expect(text).toBe(`${JSON.stringify(onDisk, null, 2)}\n`)
  })

  it('carries the admissibility and regeneration note rather than leaving it to a reader', () => {
    const onDisk = readReference(REFERENCE_PATH).value!
    expect(onDisk.$comment).toContain('LOCALLY QUALIFIED ONLY')
    expect(onDisk.$comment).toContain('--write')
    expect(onDisk.$comment).toContain('never hand-edit')
  })

  it('names the seam, not just the escaping default', () => {
    // The two are different adapters: only one of them enforces the ceilings.
    expect(CORE_ADAPTER_NAME).toContain('seam-resolved')
    expect(readReference(REFERENCE_PATH).value!.adapter).toBe(CORE_ADAPTER_NAME)
  })
})

describe('the Core adapter, measured through the gate', () => {
  it('conforms on every asserted cell', () => {
    expect(measured.nonConforming).toBe(0)
    expect(measured.cells).toBeGreaterThan(0)
  })

  it('is the adapter a component actually receives, ceilings included', () => {
    const adapter = coreAdapter()
    expect(adapter.policyName).toBe('dzup-ui')
    expect(adapter.limits.maxDepth).toBe(64)
    expect(adapter.limits.maxLength).toBe(128 * 1024)
    expect(() => adapter.sanitize('<div>'.repeat(200), { sink: 'markdown', component: 'spec' }))
      .toThrow(/nested too deeply/)
  })

  it('reports all four fail-closed properties as holding', () => {
    expect(measured.failClosed).toEqual({
      absentAdapter: 'refused',
      throwingAdapter: 'blocked',
      identityAdapter: 'non-conforming',
      emptyApplicableSet: 'refused',
    })
  })
})

describe('a clean comparison is genuinely clean', () => {
  it('reports nothing when the reference is the measurement', () => {
    expect(compareWithReference(measured, recorded)).toEqual([])
  })

  it('…and the comparison is not vacuous — there are cells to compare', () => {
    // Guard against the failure this whole gate is meant to prevent: a green
    // result produced by comparing two empty maps.
    expect(Object.keys(recorded.verdicts).length).toBeGreaterThan(0)
    expect(Object.keys(recorded.verdicts).length).toBe(measured.cells)
  })
})

describe('seeded drift — every mutation is caught and named', () => {
  const someCell = Object.keys(recorded.verdicts)[0]!

  it('a changed verdict names the cell and both verdicts', () => {
    seeded(
      reference => ({ ...reference, verdicts: { ...reference.verdicts, [someCell]: 'stripped' } }),
      `${someCell}: VERDICT CHANGED`,
      'reference "stripped"',
      `measured "${recorded.verdicts[someCell]}"`,
    )
  })

  it('a verdict that disappears from the reference is a new cell, not a pass', () => {
    seeded((reference) => {
      const verdicts = { ...reference.verdicts }
      delete (verdicts as Record<string, string>)[someCell]
      return { ...reference, verdicts }
    }, `${someCell}: measured`, 'the reference records no verdict for this cell')
  })

  it('a recorded cell the run no longer produces is reported, not ignored', () => {
    seeded(
      reference => ({ ...reference, verdicts: { ...reference.verdicts, 'gone.fixture.id:html': 'escaped' } }),
      'gone.fixture.id:html',
      'a fixture or a sink disappeared',
    )
  })

  it('a corpus fingerprint change is reported with the fix', () => {
    seeded(
      reference => ({ ...reference, corpusFingerprint: '0'.repeat(32) }),
      'corpusFingerprint',
      'Bump SECURITY_CORPUS_VERSION',
    )
  })

  it.each([
    ['runnerVersion', '9.9.9'],
    ['corpusVersion', '9.9.9'],
    ['corpusSchemaVersion', '9.9.9'],
    ['adapter', 'somebody else\'s adapter'],
    ['policyName', 'not-dzup-ui'],
    ['runner', '@somebody/else'],
  ] as const)('a changed %s is reported', (field, value) => {
    seeded(reference => ({ ...reference, [field]: value }), `${field}: reference "${value}"`)
  })

  it('a changed ceiling is reported — the limits are part of what was measured', () => {
    seeded(
      reference => ({ ...reference, limits: { maxLength: 1, maxDepth: 1 } }),
      'limits: reference maxLength 1/maxDepth 1',
    )
  })

  it('a fail-closed property recorded differently is reported', () => {
    seeded(
      reference => ({ ...reference, failClosed: { ...reference.failClosed, throwingAdapter: 'escaped' } }),
      'fail-closed property "throwingAdapter": recorded "escaped"',
    )
  })

  it('a fail-closed property the runner no longer measures is reported', () => {
    seeded(
      reference => ({ ...reference, failClosed: { ...reference.failClosed, inventedProperty: 'refused' } }),
      'fail-closed property "inventedProperty" is recorded but the runner no longer measures it',
    )
  })

  it('an unasserted cell that vanishes from the run is reported', () => {
    seeded(
      reference => ({
        ...reference,
        unasserted: [...reference.unasserted, { fixtureId: 'gone.fixture.id', sink: 'markdown', required: 'stripped', reason: 'x' }],
      }),
      'gone.fixture.id:markdown',
      'recorded as unasserted but the run does not report it',
    )
  })

  it('a newly unasserted cell is reported — it is not a passing one', () => {
    seeded(
      reference => ({ ...reference, unasserted: [] }),
      'newly UNASSERTED',
      'an unasserted cell is not a passing one',
    )
  })

  it('a NOT FAIL-CLOSED measurement outranks every other violation', () => {
    const sabotaged = { ...measured, failClosed: { ...measured.failClosed, absentAdapter: 'NOT FAIL-CLOSED' as const } }
    const violations = compareWithReference(sabotaged, recorded)
    expect(violations[0]).toContain('fail-closed property "absentAdapter" DOES NOT HOLD')
    expect(violations[0]).toContain('outranks every other violation')
  })

  it('a non-conforming cell fails whatever the reference says', () => {
    // The reference is not a licence. An adapter that fails a fixture is a
    // defect, and re-recording the reference must not be able to bless it.
    const cell = measured.cellDetail[0]!
    const broken = {
      ...measured,
      nonConforming: 1,
      cellDetail: [{ ...cell, conforms: false, verdict: 'passed-through' as const, detail: 'seeded' }, ...measured.cellDetail.slice(1)],
      verdicts: { ...measured.verdicts, [`${cell.fixtureId}:${cell.sink}`]: 'passed-through' as const },
    }
    const blessed = toReference(broken, 'a reference recorded from the broken run')
    const violations = compareWithReference(broken, blessed)
    expect(violations.join('\n')).toContain(`${cell.fixtureId} in a ${cell.sink} sink requires`)
    expect(violations.join('\n')).toContain('measured "passed-through"')
  })
})

describe('a missing reference is a failure, never a skip', () => {
  it('names the file and the owner action that records it', () => {
    const absent = readReference('packages/core/security/does-not-exist.json')
    expect(absent.value).toBeUndefined()
    expect(absent.error).toContain('missing')
    expect(absent.error).toContain('--write')
    expect(absent.error).toContain('owner action')
  })
})
