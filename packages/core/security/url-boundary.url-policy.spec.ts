import { describe, expect, it } from 'vitest'
import { BINDINGS, URL_BOUNDARY_COMPONENTS } from './boundary-bindings.ts'
import { deviationTriples, effectiveScheme, loadDeviationRegister, runBoundarySuite } from './boundary-suites.ts'

/**
 * `url-policy` for every component whose declared `SecurityBoundary` is `url`
 * (TASK-N1-O5).
 *
 * The evidence kind is defined as "URL/protocol allowlist behaviour asserted".
 * When this file was written there was no allowlist — nothing in
 * `packages/core/src` inspected a scheme, and every declarer handed whatever it
 * was given straight to an `href` or a `src`. That was a defensible position
 * for the subresource sinks (an `<img src>` cannot execute a `javascript:` URL,
 * and an image component that refused off-origin URLs would be useless) and not
 * a defensible position for the six navigation sinks, where the same string
 * runs on click. The gap was measured rather than asserted away: 54 triples,
 * pinned in `security-deviations.json` with a severity.
 *
 * **TASK-R2-O4 closed it.** `packages/core/src/security/url-policy.ts` is the
 * allowlist, installed through `DZ_URL_POLICY_KEY` and applied at every
 * navigation sink including the three compound sub-parts. The register is empty
 * and its ceiling is 0, so these suites now assert the REQUIRED outcome
 * directly, with nothing to fall back on — which is what makes them the
 * regression suite for the fix rather than a record of the defect.
 *
 * The subresource half is unchanged and still `inert` by design: filtering the
 * origins an avatar may load from is the host's `img-src` directive, not a
 * decision any component can make for it (finding U2).
 */

for (const [name, binding] of Object.entries(BINDINGS.navigation))
  runBoundarySuite(binding, ['url-scheme'], `url policy · ${name}`)

for (const [name, binding] of Object.entries(BINDINGS.subresource))
  runBoundarySuite(binding, ['url-scheme'], `url policy · ${name}`)

runBoundarySuite(BINDINGS.encodedIcon, ['url-scheme'], 'url policy · DzQRCode icon (undeclared sink)')

describe('the policy itself', () => {
  it('normalizes a scheme the way the URL parser does, not the way a string starts', () => {
    // The three evasions the corpus carries, checked against the function the
    // suite uses to decide whether a rendered URL is executable. A policy built
    // on `startsWith` passes the first and fails all three of the others.
    expect(effectiveScheme('javascript:alert(1)')).toBe('javascript')
    expect(effectiveScheme('JaVaScRiPt:alert(1)')).toBe('javascript')
    expect(effectiveScheme(`${String.fromCharCode(1)}javascript:alert(1)`)).toBe('javascript')
    expect(effectiveScheme('java\tscript:alert(1)')).toBe('javascript')
    expect(effectiveScheme('/relative/path')).toBeNull()
    expect(effectiveScheme('https://example.test/')).toBe('https')
  })

  it('covers every url-boundary declarer the quality matrix names', async () => {
    // The list this suite iterates and the list the matrix declares have to be
    // the same list, or a component gains a `url` boundary and silently gains
    // no corpus with it.
    const matrix = (await import('../docs/quality-matrix.json', { with: { type: 'json' } })).default
    const declared = matrix.components
      .filter(c => c.securityBoundary.includes('url'))
      .map(c => c.component)
      .sort()
    expect(URL_BOUNDARY_COMPONENTS).toEqual(declared)
  })
})

describe('deviation register', () => {
  const register = loadDeviationRegister()

  it('holds the ratchet at or below its ceiling', () => {
    expect(deviationTriples()).toBeLessThanOrEqual(register.ceiling)
  })

  it('gives every deviation a severity, a reason and a release disposition', () => {
    for (const d of register.deviations) {
      expect(d.reason.length, d.id).toBeGreaterThan(80)
      expect(['critical', 'high', 'medium', 'low'], d.id).toContain(d.severity)
      expect(typeof d.publicBehaviourChange, d.id).toBe('boolean')
      expect(d.fixtures.length, d.id).toBeGreaterThan(0)
    }
  })
})
