import { describe, expect, it } from 'vitest'
import {
  checkCorpusFile,
  corpusFileName,
  fixturesForSink,
  listSecurityCorpusFiles,
  loadAllSecurityFixtures,
  loadSecurityCorpus,
  payloadOf,
  SECURITY_CATEGORIES,
  SECURITY_CORPUS_SCHEMA_VERSION,
  SECURITY_SINKS,
} from './security-corpus.js'

/**
 * The corpus is data, so the thing that has to be tested is the data.
 *
 * A fixture file that drifts out of schema does not fail loudly — it fails by
 * being skipped, or by a spec reading `undefined` as "nothing required here".
 * Everything below exists to make that impossible: every file on disk is
 * validated, every file the enum names exists, and no file exists that the
 * enum does not name.
 */
describe('security corpus — schema conformance', () => {
  it('has a corpus file for every category and no orphans', () => {
    const onDisk = listSecurityCorpusFiles()
    const expected = SECURITY_CATEGORIES.map(corpusFileName).sort()
    expect(onDisk).toEqual(expected)
  })

  for (const category of SECURITY_CATEGORIES) {
    it(`${category} conforms to schema ${SECURITY_CORPUS_SCHEMA_VERSION}`, () => {
      // `loadSecurityCorpus` asserts; calling `checkCorpusFile` as well means a
      // failure lists every violation at once instead of the first.
      const file = loadSecurityCorpus(category)
      expect(checkCorpusFile(file, corpusFileName(category))).toEqual([])
      expect(file.category).toBe(category)
    })
  }

  it('gives every fixture a globally unique id', () => {
    const ids = loadAllSecurityFixtures().map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('names only known sinks in every outcomes map', () => {
    for (const fixture of loadAllSecurityFixtures()) {
      for (const sink of Object.keys(fixture.outcomes))
        expect(SECURITY_SINKS, `${fixture.id} names sink ${sink}`).toContain(sink)
    }
  })

  it('resolves repeated payloads to their full length', () => {
    const repeated = loadAllSecurityFixtures().filter(f => f.repeat !== undefined)
    // If this ever reaches zero the `repeat` field has become dead weight and
    // `payloadOf` stops being load-bearing — which is exactly when somebody
    // starts reading `payload` directly.
    expect(repeated.length).toBeGreaterThan(0)
    for (const fixture of repeated)
      expect(payloadOf(fixture)).toHaveLength(fixture.payload.length * (fixture.repeat ?? 1))
  })

  it('requires a rationale wherever it claims a payload is inert', () => {
    // `inert` is the outcome that can be asserted without proving anything, so
    // it is the one the schema makes expensive: an inert claim with a
    // one-word reason is indistinguishable from nobody having looked.
    for (const fixture of loadAllSecurityFixtures()) {
      if (Object.values(fixture.outcomes).includes('inert'))
        expect(fixture.rationale.length, `${fixture.id}`).toBeGreaterThan(80)
    }
  })
})

describe('security corpus — selection', () => {
  it('returns only fixtures that state an outcome for the sink asked about', () => {
    const navigation = fixturesForSink('navigation', ['url-scheme'])
    expect(navigation.length).toBeGreaterThan(0)
    for (const fixture of navigation)
      expect(fixture.required).toBe(fixture.outcomes.navigation)
  })

  it('omits a fixture that says nothing about the sink rather than defaulting it', () => {
    // `css-injection.expression.legacy` states `style` only. Asking about a
    // navigation sink must return nothing for it — silence is not permission.
    const ids = fixturesForSink('navigation', ['css-injection']).map(f => f.id)
    expect(ids).not.toContain('css-injection.expression.legacy')
  })

  it('requires rejection for javascript: in a navigation sink', () => {
    // The single load-bearing row of the whole corpus. If this ever weakens,
    // every url-boundary component's spec quietly weakens with it.
    const plain = fixturesForSink('navigation', ['url-scheme'])
      .find(f => f.id === 'url-scheme.javascript.plain')
    expect(plain?.required).toBe('rejected')
  })
})
