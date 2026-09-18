import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  checkCorpusFile,
  checkPeerCompatibilityFile,
  corpusFileName,
  fixturesForSink,
  listSecurityCorpusFiles,
  loadAllSecurityFixtures,
  loadPeerCompatibilityFixtures,
  loadSecurityCorpus,
  NEUTRALIZATION_OUTCOMES,
  payloadOf,
  PEER_COMPATIBILITY_SCHEMA_FILE,
  peerSlug,
  SECURITY_CATEGORIES,
  SECURITY_CORPUS_SCHEMA_FILE,
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

/**
 * Schema 1.1.0 (TASK-R3-O4): the format is shared, so what matters is that a
 * second repository's file is judged by the same rules as this one's. The
 * JSON Schema ⇔ checker agreement itself is proven by
 * `yarn validate:security-corpus` and its spec in packages/tooling, which owns
 * the draft-07 evaluator; these are the checker's own rules.
 */
describe('security corpus — schema 1.1.0 (shared format)', () => {
  const base = (): ReturnType<typeof JSON.parse> => JSON.parse(JSON.stringify(loadSecurityCorpus('url-scheme')))

  it('carries the current version in every file, and publishes both JSON Schemas', () => {
    expect(SECURITY_CORPUS_SCHEMA_VERSION).toBe('1.1.0')
    for (const category of SECURITY_CATEGORIES)
      expect(loadSecurityCorpus(category).schemaVersion, category).toBe(SECURITY_CORPUS_SCHEMA_VERSION)
    for (const file of [SECURITY_CORPUS_SCHEMA_FILE, PEER_COMPATIBILITY_SCHEMA_FILE]) {
      expect(existsSync(file), file).toBe(true)
      expect(JSON.parse(readFileSync(file, 'utf8')).$schema).toBe('http://json-schema.org/draft-07/schema#')
    }
  })

  it('refuses a field the format does not define, and points at extensions', () => {
    const file = base()
    file.fixtures[0].why = 'Pro spells rationale this way'
    expect(checkCorpusFile(file)).toEqual([{
      path: '<corpus>.fixtures[0].why',
      message: 'not a field of this format — put consumer-specific data under extensions["<namespace>"]',
    }])
  })

  it('accepts consumer data under a reverse-DNS namespace and nowhere else', () => {
    const file = base()
    file.fixtures[0].extensions = { 'com.dzup.pro': { mustNotSurvive: ['javascript:'] } }
    expect(checkCorpusFile(file)).toEqual([])
    file.fixtures[0].extensions = { pro: { mustNotSurvive: ['javascript:'] } }
    expect(checkCorpusFile(file).map(p => p.path)).toEqual(['<corpus>.fixtures[0].extensions.pro'])
  })

  it('makes `admitted` as expensive as `inert`', () => {
    expect(NEUTRALIZATION_OUTCOMES.at(-1)).toBe('admitted')
    const file = base()
    file.fixtures[0].outcomes = { html: 'admitted' }
    file.fixtures[0].rationale = 'The URL policy allows it.'
    expect(checkCorpusFile(file).map(p => p.path)).toEqual(['<corpus>.fixtures[0].rationale'])
  })

  it('names the two sanitizer-seam contexts as sinks, so a markdown payload never reaches a raw-HTML query', () => {
    expect(SECURITY_SINKS).toContain('markdown')
    expect(SECURITY_SINKS).toContain('mermaid-svg')
    const file = base()
    file.fixtures[0].outcomes = { markdown: 'stripped' }
    expect(checkCorpusFile(file)).toEqual([])
  })
})

describe('peer compatibility — the incompatible-version shape', () => {
  it('loads, and covers the incompatible state the consumer matrices lacked', () => {
    const fixtures = loadPeerCompatibilityFixtures()
    expect(new Set(fixtures.map(f => f.id)).size).toBe(fixtures.length)
    const incompatible = fixtures.find(f => f.state === 'incompatible')
    expect(incompatible?.id).toBe('peer.vue.wrong-major')
    expect(incompatible?.diagnostics.some(d => d.mustContain.some(text => text.includes(incompatible.peer)))).toBe(true)
  })

  it('refuses a version on an absent peer and a silent incompatible one', () => {
    const file = JSON.parse(JSON.stringify({ schemaVersion: '1.1.0', description: 'x', fixtures: loadPeerCompatibilityFixtures() }))
    file.fixtures[1].installedVersion = '2.1.0'
    file.fixtures[0].diagnostics = []
    expect(checkPeerCompatibilityFile(file).map(p => p.path)).toEqual([
      '<peer-compatibility>.fixtures[0].diagnostics',
      '<peer-compatibility>.fixtures[1].installedVersion',
    ])
  })

  it('slugs a scoped or dotted peer name the way ids spell it', () => {
    expect(peerSlug('@vue/reactivity')).toBe('vue-reactivity')
    expect(peerSlug('chart.js')).toBe('chart-js')
    expect(peerSlug('pdfjs-dist')).toBe('pdfjs-dist')
  })
})
