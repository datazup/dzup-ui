import type { ConformanceAdapter, ConformanceVerdict } from './security-conformance.js'
import type { SecurityFixture } from './security-corpus.js'
import { describe, expect, it } from 'vitest'
import {
  applicableCells,
  ASSERTABLE_OUTCOMES,
  classifyVerdict,
  CONFORMANCE_VERDICTS,
  CORPUS_VERSION_FINGERPRINTS,
  corpusFingerprint,
  DIRECT_SANITIZER_SINKS,
  expectSecurityConformance,
  formatConformanceReport,
  runSecurityConformance,
  SANITIZER_SINKS,
  SATISFIED_BY,
  SECURITY_CONFORMANCE_RUNNER_VERSION,
  SECURITY_CORPUS_VERSION,
  SecurityConformanceRefusal,
} from './security-conformance.js'
import { loadAllSecurityFixtures, NEUTRALIZATION_OUTCOMES, SECURITY_SINKS } from './security-corpus.js'

/**
 * Specs for the conformance runner (TASK-S3-O3).
 *
 * The suite is organised around one question: **can this runner report a pass it
 * did not earn?** Every other assertion is secondary, because a conformance
 * runner that can be satisfied by an absent, broken or stubbed adapter is worse
 * than no runner — it produces a green number that a reviewer will believe.
 *
 * So the seeded adapters below are deliberately adversarial: one that throws,
 * one that returns its input, one that escapes only `<`, one that strips only
 * `on*` handlers, one that lies about its policy name. Each must land in exactly
 * one verdict class.
 */

const HOSTILE = '<img src=x onerror="alert(1)">'

function adapter(sanitize: (html: string) => string, policyName = 'probe'): ConformanceAdapter {
  return { policyName, limits: { maxLength: 1024, maxDepth: 8 }, sanitize: (html: string) => sanitize(html) }
}

const ESCAPING = adapter(html => html.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
} as Record<string, string>)[character] as string), 'escaping')

const IDENTITY = adapter(html => html, 'identity')
const THROWING = adapter(() => {
  throw new Error('nope')
}, 'throwing')
/** Drops event attributes and nothing else — a real sanitizer's weakest plausible shape. */
const HANDLER_STRIPPING = adapter(html => html.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ''), 'handler-stripping')

/** A fixture set built by hand, so the runner is testable without the corpus on disk. */
function fixture(id: string, payload: string, outcomes: SecurityFixture['outcomes']): SecurityFixture {
  return {
    id,
    category: 'markup-injection',
    title: id,
    payload,
    outcomes,
    rationale: 'a hand-built fixture for the runner specs; long enough to satisfy the corpus checker even where an unproven outcome is claimed',
    provenance: 'security-conformance.spec.ts',
  }
}

describe('the vocabulary is closed and agrees with the corpus', () => {
  it('every sanitizer sink is a SecuritySink', () => {
    for (const sink of SANITIZER_SINKS)
      expect(SECURITY_SINKS, sink).toContain(sink)
  })

  it('the direct sinks are a subset of the sanitizer sinks', () => {
    for (const sink of DIRECT_SANITIZER_SINKS)
      expect(SANITIZER_SINKS).toContain(sink)
  })

  it('every assertable outcome is a NeutralizationOutcome and has a satisfaction row', () => {
    for (const outcome of ASSERTABLE_OUTCOMES) {
      expect(NEUTRALIZATION_OUTCOMES, outcome).toContain(outcome)
      expect(SATISFIED_BY[outcome], outcome).toBeDefined()
      expect(SATISFIED_BY[outcome]!.length, outcome).toBeGreaterThan(0)
    }
  })

  it('every satisfaction row names only real verdicts, and every row admits `blocked`', () => {
    for (const [outcome, verdicts] of Object.entries(SATISFIED_BY)) {
      for (const verdict of verdicts!)
        expect(CONFORMANCE_VERDICTS, `${outcome} → ${verdict}`).toContain(verdict as ConformanceVerdict)
      // `blocked` means the value never reached the sink. There is no required
      // outcome that a non-delivery could fail, and a row that omitted it would
      // fail an adapter for being too strict.
      expect(verdicts, outcome).toContain('blocked')
    }
  })

  it('no unproven outcome is assertable — `inert` and `admitted` are sink properties, not adapter obligations', () => {
    expect(ASSERTABLE_OUTCOMES).not.toContain('inert')
    expect(ASSERTABLE_OUTCOMES).not.toContain('admitted')
    expect(SATISFIED_BY.inert).toBeUndefined()
    expect(SATISFIED_BY.admitted).toBeUndefined()
  })

  it('`passed-through` and `unchanged` satisfy nothing at all', () => {
    for (const verdicts of Object.values(SATISFIED_BY)) {
      expect(verdicts).not.toContain('passed-through')
      expect(verdicts).not.toContain('unchanged')
    }
  })

  it('a required `escaped` is NOT satisfied by `stripped`', () => {
    // A value that must render as text and instead renders as sanitised markup
    // has had its meaning changed. That is how an option label becomes a link.
    expect(SATISFIED_BY.escaped).not.toContain('stripped')
  })
})

describe('classifyVerdict', () => {
  it('a throw is `blocked`, and the error name travels with it', () => {
    const classification = classifyVerdict(HOSTILE, { ok: false, error: new TypeError('too deep') })
    expect(classification.verdict).toBe('blocked')
    expect(classification.detail).toContain('TypeError')
    expect(classification.detail).toContain('too deep')
  })

  it('a non-Error throw is still `blocked` rather than a crash', () => {
    expect(classifyVerdict(HOSTILE, { ok: false, error: 'a string' }).verdict).toBe('blocked')
  })

  it('returning the input byte for byte is `unchanged`, not `passed-through`', () => {
    // Named separately because it is the one thing DzSanitizerAdapter.sanitize
    // explicitly promises not to do, so a reader can tell a permissive policy
    // from a stub that was never wired up.
    expect(classifyVerdict(HOSTILE, { ok: true, value: HOSTILE }).verdict).toBe('unchanged')
  })

  it('entity-encoded markup is `escaped`', () => {
    expect(classifyVerdict(HOSTILE, { ok: true, value: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;' }).verdict)
      .toBe('escaped')
  })

  it('markup with the handler removed is `stripped`', () => {
    expect(classifyVerdict(HOSTILE, { ok: true, value: '<img src="x">' }).verdict).toBe('stripped')
  })

  it('an escaped output whose TEXT still reads `onerror=` is `escaped`, not `passed-through`', () => {
    // The regression this gate exists for. Escaping touches only `&<>"'`, so
    // ` onerror=` survives as literal text in every correctly escaped output.
    // A danger scan that fired on it would report every escaping adapter —
    // including this repository's default — as having passed the payload
    // through, and a gate that red-flags the correct answer gets switched off.
    const classification = classifyVerdict(HOSTILE, { ok: true, value: '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;' })
    expect(classification.verdict).toBe('escaped')
    expect(classification.detail).toContain('no tag survived')
  })

  it('an adapter that returns a dangerous input unchanged reports `unchanged`, which satisfies nothing', () => {
    // `unchanged` is checked before the danger scan on purpose: it is the more
    // actionable diagnosis (a stub that was never wired up) and it is equally
    // non-conforming, so no requirement can be satisfied by it.
    const classification = classifyVerdict('<a href="javascript:alert(1)">x</a>', { ok: true, value: '<a href="javascript:alert(1)">x</a>' })
    expect(classification.verdict).toBe('unchanged')
    for (const verdicts of Object.values(SATISFIED_BY))
      expect(verdicts).not.toContain('unchanged')
  })

  it.each([
    ['a surviving event attribute', '<img src="x" onerror="alert(1)">', 'an event attribute'],
    ['a surviving script element', '<div></div><script>alert(1)</script>', 'a script-bearing element'],
    ['a javascript: href', '<a href="javascript:alert(1)">x</a>', 'an executable URL scheme'],
    ['an xlink:href javascript URL', '<svg><a xlink:href="javascript:alert(1)"></a></svg>', 'an executable URL scheme'],
    ['a legacy CSS expression', '<div style="width:expression(alert(1))">x</div>', 'a legacy CSS expression'],
    ['a preserved comment', '<div><!--<img src=x onerror=1>--></div>', 'an HTML comment'],
    ['a srcdoc iframe', '<iframe srcdoc="<script>alert(1)</script>"></iframe>', 'a script-bearing element'],
  ])('%s is `passed-through` (%#)', (_label, output, expected) => {
    const classification = classifyVerdict(HOSTILE, { ok: true, value: output })
    expect(classification.verdict).toBe('passed-through')
    expect(classification.detail).toContain(expected)
  })

  it('a bare executable scheme beside live markup is `passed-through` even with no attribute match', () => {
    // Conservative on purpose: an unquoted value or a namespaced attribute a
    // future parser honours must not be assumed inert because one regex missed.
    expect(classifyVerdict(HOSTILE, { ok: true, value: '<a data-to=javascript:alert(1)>x</a>' }).verdict)
      .toBe('passed-through')
  })
})

describe('the runner refuses rather than reporting a pass it did not earn', () => {
  it('refuses when there is no adapter', () => {
    expect(() => runSecurityConformance(null)).toThrow(SecurityConformanceRefusal)
    expect(() => runSecurityConformance(undefined)).toThrow(/no sanitizer adapter/)
  })

  it('refuses when no cell could be asserted', () => {
    expect(() => runSecurityConformance(ESCAPING, { fixtures: [] })).toThrow(SecurityConformanceRefusal)
    expect(() => runSecurityConformance(ESCAPING, { fixtures: [] })).toThrow(/no fixture × sink cell/)
  })

  it('refuses when every fixture names only sinks a sanitizer does not guard', () => {
    // The whole point: a corpus of navigation and file fixtures produces zero
    // sanitizer cells, and a runner that returned `{ nonConforming: 0 }` there
    // would be reporting that an adapter passed a suite that never ran.
    const fixtures = [
      fixture('markup-injection.only.text', HOSTILE, { text: 'escaped' }),
      fixture('markup-injection.only.navigation', 'javascript:alert(1)', { navigation: 'rejected' }),
    ]
    expect(() => runSecurityConformance(ESCAPING, { fixtures })).toThrow(/no fixture × sink cell/)
  })

  it('refuses when the only sanitizer cells need a renderer nobody supplied', () => {
    const fixtures = [fixture('markup-injection.only.markdown', '[x]: javascript:alert(1)', { markdown: 'stripped' })]
    expect(() => runSecurityConformance(ESCAPING, { fixtures })).toThrow(/no fixture × sink cell/)
  })

  it('a supplied renderer turns those cells from unasserted into measured', () => {
    const fixtures = [fixture('markup-injection.only.markdown', '[x]: javascript:alert(1)\n\n[x]', { markdown: 'stripped' })]
    const report = runSecurityConformance(ESCAPING, {
      fixtures,
      adapterName: 'escaping',
      renderers: { markdown: source => `<p><a href="${source.replace(/^\[x\]: /, '').split('\n')[0]}">x</a></p>` },
    })
    expect(report.cells).toBe(1)
    expect(report.unasserted).toEqual([])
  })
})

describe('unasserted cells are visible, named and never counted as passes', () => {
  const fixtures = [
    fixture('markup-injection.mixed.html', HOSTILE, { html: 'stripped' }),
    fixture('markup-injection.mixed.markdown', '[x]: javascript:alert(1)', { markdown: 'stripped' }),
    fixture('markup-injection.mixed.inert', HOSTILE, { html: 'inert' }),
  ]

  it('names the missing renderer and says the cell is not passing', () => {
    const report = runSecurityConformance(ESCAPING, { fixtures, adapterName: 'escaping' })
    const markdown = report.unasserted.find(cell => cell.sink === 'markdown')
    expect(markdown).toBeDefined()
    expect(markdown!.reason).toContain('renderer source')
    expect(markdown!.reason).toContain('UNASSERTED')
  })

  it('names why an `inert` requirement is not an adapter obligation', () => {
    const report = runSecurityConformance(ESCAPING, { fixtures, adapterName: 'escaping' })
    const inert = report.unasserted.find(cell => cell.required === 'inert')
    expect(inert).toBeDefined()
    expect(inert!.reason).toContain('fabricated verdict')
  })

  it('unasserted cells are excluded from `cells`, so the denominator is what actually ran', () => {
    const report = runSecurityConformance(ESCAPING, { fixtures, adapterName: 'escaping' })
    expect(report.cells).toBe(1)
    expect(report.unasserted).toHaveLength(2)
    expect(report.cells + report.unasserted.length).toBe(applicableCells(fixtures).length)
  })
})

describe('fail-closed, measured rather than asserted', () => {
  const fixtures = [fixture('markup-injection.fail-closed.html', HOSTILE, { html: 'stripped' })]

  it('records all four properties as holding, for every adapter', () => {
    for (const probe of [ESCAPING, IDENTITY, THROWING, HANDLER_STRIPPING]) {
      const report = runSecurityConformance(probe, { fixtures, adapterName: probe.policyName })
      expect(report.failClosed, probe.policyName).toEqual({
        absentAdapter: 'refused',
        throwingAdapter: 'blocked',
        identityAdapter: 'non-conforming',
        emptyApplicableSet: 'refused',
      })
    }
  })

  it('a throwing adapter blocks every cell and conforms — failing closed is conformance', () => {
    const report = runSecurityConformance(THROWING, { fixtures, adapterName: 'throwing' })
    expect(report.counts.blocked).toBe(report.cells)
    expect(report.nonConforming).toBe(0)
  })

  it('an identity adapter is non-conforming on every cell', () => {
    const report = runSecurityConformance(IDENTITY, { fixtures, adapterName: 'identity' })
    expect(report.nonConforming).toBe(report.cells)
    expect(report.counts.unchanged).toBe(report.cells)
    expect(() => expectSecurityConformance(report)).toThrow(/measured "unchanged"/)
  })

  it('expectSecurityConformance reports a broken fail-closed property before any cell', () => {
    const report = runSecurityConformance(ESCAPING, { fixtures, adapterName: 'escaping' })
    const sabotaged = { ...report, failClosed: { ...report.failClosed, throwingAdapter: 'NOT FAIL-CLOSED' as const } }
    expect(() => expectSecurityConformance(sabotaged)).toThrow(/fail-closed property "throwingAdapter"/)
    expect(() => expectSecurityConformance(sabotaged)).toThrow(/outranks every other failure/)
  })
})

describe('the satisfaction matrix decides, per required outcome', () => {
  it('escaping where `stripped` was required conforms, and is counted lossy', () => {
    const report = runSecurityConformance(ESCAPING, {
      fixtures: [fixture('markup-injection.lossy.html', HOSTILE, { html: 'stripped' })],
      adapterName: 'escaping',
    })
    expect(report.nonConforming).toBe(0)
    expect(report.lossy).toBe(1)
    expect(report.cellDetail[0]!.verdict).toBe('escaped')
  })

  it('stripping where `escaped` was required does NOT conform', () => {
    const report = runSecurityConformance(HANDLER_STRIPPING, {
      fixtures: [fixture('markup-injection.strict.html', HOSTILE, { html: 'escaped' })],
      adapterName: 'handler-stripping',
    })
    expect(report.nonConforming).toBe(1)
    expect(report.cellDetail[0]!.verdict).toBe('stripped')
  })

  it('only a throw satisfies a required `rejected`', () => {
    const rejecting = [fixture('markup-injection.ceiling.html', HOSTILE, { html: 'rejected' })]
    expect(runSecurityConformance(THROWING, { fixtures: rejecting, adapterName: 't' }).nonConforming).toBe(0)
    expect(runSecurityConformance(ESCAPING, { fixtures: rejecting, adapterName: 'e' }).nonConforming).toBe(1)
    expect(runSecurityConformance(HANDLER_STRIPPING, { fixtures: rejecting, adapterName: 'h' }).nonConforming).toBe(1)
  })

  it('a partial sanitizer is caught by the fixture the payload was chosen for', () => {
    // `HANDLER_STRIPPING` drops `on*` and nothing else, so it passes the
    // onerror fixture and fails the javascript: href one. A suite that carried
    // only the first would call it conformant.
    const report = runSecurityConformance(HANDLER_STRIPPING, {
      fixtures: [
        fixture('markup-injection.partial.handler', HOSTILE, { html: 'stripped' }),
        fixture('markup-injection.partial.href', '<a href="javascript:alert(1)" onmouseover="alert(2)">x</a>', { html: 'stripped' }),
      ],
      adapterName: 'handler-stripping',
    })
    expect(report.cells).toBe(2)
    expect(report.nonConforming).toBe(1)
    expect(report.cellDetail.find(cell => cell.fixtureId.endsWith('.href'))!.verdict).toBe('passed-through')
  })
})

describe('the report is a recordable artifact', () => {
  const report = runSecurityConformance(ESCAPING, { adapterName: 'escaping', sourceCommit: '4e4e46f' })

  it('carries both versions, the fingerprint and the adapter identity', () => {
    expect(report.runnerVersion).toBe(SECURITY_CONFORMANCE_RUNNER_VERSION)
    expect(report.corpusVersion).toBe(SECURITY_CORPUS_VERSION)
    expect(report.corpusFingerprint).toMatch(/^[0-9a-f]{32}$/)
    expect(report.adapter).toBe('escaping')
    expect(report.policyName).toBe('escaping')
    expect(report.sourceCommit).toBe('4e4e46f')
  })

  it('omits sourceCommit rather than inventing one', () => {
    expect(runSecurityConformance(ESCAPING, { adapterName: 'escaping' }).sourceCommit).toBeUndefined()
  })

  it('names an unnamed adapter as unnamed rather than guessing', () => {
    expect(runSecurityConformance(ESCAPING).adapter).toBe('unnamed adapter')
  })

  it('the verdict map has one entry per cell, keyed fixture:sink and sorted', () => {
    const keys = Object.keys(report.verdicts)
    expect(keys).toHaveLength(report.cells)
    expect(keys).toEqual([...keys].sort())
    for (const key of keys)
      expect(key).toMatch(/^[a-z0-9.-]+:[a-z-]+$/)
  })

  it('the counts sum to the cell count', () => {
    expect(CONFORMANCE_VERDICTS.reduce((sum, verdict) => sum + report.counts[verdict], 0)).toBe(report.cells)
  })

  it('formats a one-line summary that names the fail-closed state', () => {
    const line = formatConformanceReport(report)
    expect(line).toContain('corpus 1.1.0')
    expect(line).toContain('fail-closed absent=refused')
    expect(line).toContain(report.corpusFingerprint)
  })
})

describe('the corpus content version has teeth', () => {
  const fixtures = loadAllSecurityFixtures()

  it('the live corpus matches the fingerprint recorded for its version', () => {
    // The whole point of a content version: a fixture edit that forgets the
    // bump lands here, not in a consumer's stale conformance result.
    expect(CORPUS_VERSION_FINGERPRINTS[SECURITY_CORPUS_VERSION], SECURITY_CORPUS_VERSION).toBeDefined()
    expect(corpusFingerprint(fixtures)).toBe(CORPUS_VERSION_FINGERPRINTS[SECURITY_CORPUS_VERSION])
  })

  it('the fingerprint changes when an outcome changes, and ignores prose', () => {
    const [first, ...rest] = fixtures
    const verdictChanged = [{ ...first!, outcomes: { ...first!.outcomes, html: 'rejected' as const } }, ...rest]
    const proseChanged = [{ ...first!, rationale: `${first!.rationale} (typo fixed, and long enough to stay valid)` }, ...rest]
    expect(corpusFingerprint(verdictChanged)).not.toBe(corpusFingerprint(fixtures))
    expect(corpusFingerprint(proseChanged)).toBe(corpusFingerprint(fixtures))
  })

  it('the fingerprint is order-independent and repeat-sensitive', () => {
    expect(corpusFingerprint([...fixtures].reverse())).toBe(corpusFingerprint(fixtures))
    const [first, ...rest] = fixtures
    expect(corpusFingerprint([{ ...first!, repeat: (first!.repeat ?? 1) + 1 }, ...rest]))
      .not
      .toBe(corpusFingerprint(fixtures))
  })

  it('every recorded version has a 32-hex fingerprint, and no two versions share one', () => {
    const digests = Object.values(CORPUS_VERSION_FINGERPRINTS)
    for (const digest of digests)
      expect(digest).toMatch(/^[0-9a-f]{32}$/)
    expect(new Set(digests).size).toBe(digests.length)
  })
})

describe('the real corpus produces a non-empty, all-html applicable set', () => {
  const fixtures = loadAllSecurityFixtures()

  it('has sanitizer cells at all — an empty corpus would be the silent failure', () => {
    expect(applicableCells(fixtures).length).toBeGreaterThan(0)
  })

  it('carries at least one `rejected` html cell, so the ceiling path is exercised', () => {
    // Without one, every verdict in a run is a string transformation and the
    // seam's fail-closed ceiling is never measured by this suite at all.
    const rejecting = applicableCells(fixtures).filter(cell => cell.sink === 'html' && cell.required === 'rejected')
    expect(rejecting.length).toBeGreaterThan(0)
  })

  it('carries the markdown and mermaid-svg cells the format has had since schema 1.1.0', () => {
    const sinks = new Set(applicableCells(fixtures).map(cell => cell.sink))
    expect(sinks).toContain('markdown')
    expect(sinks).toContain('mermaid-svg')
  })
})
