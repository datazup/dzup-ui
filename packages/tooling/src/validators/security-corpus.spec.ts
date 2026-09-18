/**
 * Unit tests for the security-corpus format gate (TASK-R3-O4).
 *
 * The real corpus is valid, so a run over it proves only that nothing is wrong
 * today. What this file proves is that the gate goes red: every seeded defect
 * below is a copy of the real corpus with one thing broken, and each one must
 * be reported. The schema/checker agreement table pins which rules both
 * validators enforce and which only the checker can; the types ⇔ schema block
 * ties the exported TypeScript unions and interfaces (fields and optionality)
 * to the JSON Schemas, which the gate itself cannot see; and ajv — a dev-time
 * oracle, resolvable here only as a hoisted transitive dependency, which is
 * acceptable in a test and not in a gate (see json-schema-draft07.ts) — confirms
 * the published schemas mean what the repository's evaluator says they mean.
 */

import type {
  NeutralizationOutcome,
  PeerCompatibilityFile,
  PeerCompatibilityFixture,
  PeerDiagnostic,
  PeerDiagnosticStage,
  PeerState,
  SecurityCategory,
  SecurityCorpusFile,
  SecurityFixture,
  SecuritySink,
} from '../../../testing/src/security-corpus.ts'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  checkCorpusFile,
  checkPeerCompatibilityFile,
  NEUTRALIZATION_OUTCOMES,
  PEER_COMPATIBILITY_FILE_NAME,
  PEER_COMPATIBILITY_SCHEMA_FILE,
  PEER_DIAGNOSTIC_STAGES,
  PEER_STATES,
  SECURITY_CATEGORIES,
  SECURITY_CORPUS_DIR,
  SECURITY_CORPUS_SCHEMA_FILE,
  SECURITY_SINKS,
} from '../../../testing/src/security-corpus.ts'
import { Draft07Validator } from '../token-checks/json-schema-draft07.ts'
import { checkPeerDeps, formatPeerCheck } from './peer-ranges.ts'
import {
  checkSecurityCorpus,
  checkVocabularyAgreement,
  CORPUS_SCHEMA_NAME,
  executePeerFixture,
  PEER_SCHEMA_NAME,
} from './security-corpus.ts'

/** Parsed JSON, mutated freely by the seeded cases — exactly what JSON.parse returns. */
type Json = ReturnType<typeof JSON.parse>

const readJson = (file: string): Json => JSON.parse(readFileSync(file, 'utf8'))
const corpusSchema: Json = readJson(SECURITY_CORPUS_SCHEMA_FILE)
const peerSchema: Json = readJson(PEER_COMPATIBILITY_SCHEMA_FILE)

/** A throwaway copy of the corpus directory with `mutate` applied to it. */
function seeded(mutate: (dir: string) => void): readonly string[] {
  const dir = mkdtempSync(join(tmpdir(), 'dzup-corpus-'))
  try {
    cpSync(SECURITY_CORPUS_DIR, dir, { recursive: true })
    mutate(dir)
    return checkSecurityCorpus(dir).violations
  }
  finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function editJson(dir: string, name: string, edit: (value: Json) => void): void {
  const file = join(dir, name)
  const value = readJson(file)
  edit(value)
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const realUrlScheme: Json = readJson(join(SECURITY_CORPUS_DIR, 'url-scheme.corpus.json'))
const realPeers: Json = readJson(join(SECURITY_CORPUS_DIR, PEER_COMPATIBILITY_FILE_NAME))

describe('the real corpus', () => {
  it('passes, and the counts are the measured ones', () => {
    const report = checkSecurityCorpus()
    expect(report.violations).toEqual([])
    expect(report.corpusFiles).toBe(6)
    expect(report.fixtures).toBe(34)
    expect(report.peerFixtures).toBe(2)
    // Both peer records carry a validate-stage diagnostic, so both executed.
    expect(report.executedDiagnostics).toBe(2)
  })
})

describe('seeded defects — each must turn the gate red', () => {
  it('an outcome outside the vocabulary', () => {
    const violations = seeded(dir => editJson(dir, 'url-scheme.corpus.json', (v) => {
      v.fixtures[0].outcomes.navigation = 'sanitised'
    }))
    expect(violations.some(v => v.includes('[json-schema]'))).toBe(true)
    expect(violations.some(v => v.includes('[checker]') && v.includes('not a NeutralizationOutcome'))).toBe(true)
  })

  it('a field outside the format (the fork this schema exists to stop)', () => {
    const violations = seeded(dir => editJson(dir, 'url-scheme.corpus.json', (v) => {
      v.fixtures[0].why = 'a second name for rationale'
    }))
    expect(violations.some(v => v.includes('[json-schema]') && v.includes('not an allowed property'))).toBe(true)
    expect(violations.some(v => v.includes('[checker]') && v.includes('extensions["<namespace>"]'))).toBe(true)
  })

  it('an unproven outcome with a one-line rationale', () => {
    const violations = seeded(dir => editJson(dir, 'url-scheme.corpus.json', (v) => {
      v.fixtures[0].rationale = 'Images cannot run script.'
    }))
    expect(violations.some(v => v.includes('[json-schema]'))).toBe(true)
    expect(violations.some(v => v.includes('[checker]') && v.includes('longer than 80'))).toBe(true)
  })

  it('data left on the previous schema version', () => {
    const violations = seeded(dir => editJson(dir, 'css-injection.corpus.json', (v) => {
      v.schemaVersion = '1.0.0'
    }))
    expect(violations).toEqual([
      'css-injection.corpus.json: schemaVersion 1.0.0 != 1.1.0 — migrate the data with the version',
    ])
  })

  it('a misnamed fixture file, which would otherwise never be loaded', () => {
    const violations = seeded(dir => cpSync(join(dir, 'url-scheme.corpus.json'), join(dir, 'url-schemes.corpus.json')))
    expect(violations.some(v => v.startsWith('url-schemes.corpus.json: not a category file'))).toBe(true)
  })

  it('a missing published schema', () => {
    const violations = seeded(dir => rmSync(join(dir, CORPUS_SCHEMA_NAME)))
    expect(violations.some(v => v.includes('missing or unreadable'))).toBe(true)
  })

  it('a schema whose vocabulary drifted from the module', () => {
    const violations = seeded(dir => editJson(dir, CORPUS_SCHEMA_NAME, (v) => {
      v.definitions.sink.enum = v.definitions.sink.enum.filter((sink: string) => sink !== 'markdown')
    }))
    expect(violations.some(v => v.includes('definitions.sink.enum != SECURITY_SINKS'))).toBe(true)
  })

  it('a peer record that no longer matches the real declaration', () => {
    const violations = seeded(dir => editJson(dir, PEER_COMPATIBILITY_FILE_NAME, (v) => {
      v.fixtures[0].declaredRange = '^3.4.0'
    }))
    expect(violations.some(v => v.includes('peer fixture peer.vue.wrong-major: declaredRange "^3.4.0" but @dzup-ui/core declares "^3.5.0"'))).toBe(true)
  })

  it('a peer diagnostic the real check does not print', () => {
    const violations = seeded(dir => editJson(dir, PEER_COMPATIBILITY_FILE_NAME, (v) => {
      v.fixtures[0].diagnostics[0].mustContain = ['vue', 'is incompatible']
    }))
    expect(violations.some(v => v.includes('does not contain "is incompatible"'))).toBe(true)
  })

  it('a peer state the declared range contradicts', () => {
    const violations = seeded(dir => editJson(dir, PEER_COMPATIBILITY_FILE_NAME, (v) => {
      v.fixtures[0].installedVersion = '3.5.13'
    }))
    expect(violations.some(v => v.includes('state "incompatible" but 3.5.13 satisfies ^3.5.0'))).toBe(true)
  })
})

describe('schema ⇔ checker agreement', () => {
  const corpusValidator = new Draft07Validator(corpusSchema)
  const peerValidator = new Draft07Validator(peerSchema)

  /** Both must reject: the schema expresses the rule. */
  const corpusBothReject: Array<[string, (v: Json) => void]> = [
    ['missing required field', (v) => { delete v.fixtures[0].provenance }],
    ['unknown file key', (v) => { v.policy = 'never delete a payload' }],
    ['unknown sink', (v) => { v.fixtures[0].outcomes.iframe = 'rejected' }],
    ['empty outcomes', (v) => { v.fixtures[0].outcomes = {} }],
    ['two-segment id', (v) => { v.fixtures[0].id = 'url-scheme.plain' }],
    ['id prefixed with another category', (v) => { v.fixtures[0].id = 'markup-injection.javascript.plain' }],
    ['fixture category disagreeing with the file', (v) => { v.fixtures[0].category = 'markup-injection' }],
    ['repeat of zero', (v) => { v.fixtures[0].repeat = 0 }],
    ['blank title', (v) => { v.fixtures[0].title = '   ' }],
    ['major 2', (v) => { v.schemaVersion = '2.0.0' }],
    ['extension without a reverse-DNS namespace', (v) => { v.fixtures[0].extensions = { pro: { mustNotSurvive: [] } } }],
    ['extension that is not an object', (v) => { v.fixtures[0].extensions = { 'com.dzup.pro': 'x' } }],
    ['admitted with a short rationale', (v) => {
      v.fixtures[1].outcomes = { html: 'admitted' }
      v.fixtures[1].rationale = 'Policy allows it.'
    }],
  ]

  it.each(corpusBothReject)('corpus: both reject %s', (_name, mutate) => {
    const value = clone(realUrlScheme)
    mutate(value)
    expect(corpusValidator.validate(value).length, 'JSON Schema').toBeGreaterThan(0)
    expect(checkCorpusFile(value).length, 'checker').toBeGreaterThan(0)
  })

  it('corpus: both accept a namespaced extension and the new vocabulary', () => {
    const value = clone(realUrlScheme)
    value.fixtures[0].extensions = { 'com.dzup.pro': { mustNotSurvive: ['javascript:'], trustedTypesPolicy: 'dzup-ui' } }
    value.fixtures[0].outcomes.markdown = 'stripped'
    value.fixtures[0].outcomes['mermaid-svg'] = 'admitted'
    value.extensions = { 'com.dzup.pro': { policy: 'Never delete a payload to make a suite pass.' } }
    expect(corpusValidator.validate(value)).toEqual([])
    expect(checkCorpusFile(value)).toEqual([])
  })

  it('corpus: only the checker can see a duplicate id', () => {
    const value = clone(realUrlScheme)
    value.fixtures[1].id = value.fixtures[0].id
    expect(corpusValidator.validate(value)).toEqual([])
    expect(checkCorpusFile(value).map(p => p.message)).toEqual([`duplicate id ${value.fixtures[0].id}`])
  })

  const peerBothReject: Array<[string, (v: Json) => void]> = [
    ['absent with a version', (v) => { v.fixtures[1].installedVersion = '2.0.0' }],
    ['incompatible with no version', (v) => { v.fixtures[0].installedVersion = null }],
    ['incompatible with no diagnostic', (v) => { v.fixtures[0].diagnostics = [] }],
    ['a range where a version belongs', (v) => { v.fixtures[0].installedVersion = '^2.7.0' }],
    ['unknown state', (v) => { v.fixtures[0].state = 'present' }],
    ['unknown stage', (v) => { v.fixtures[0].diagnostics[0].stage = 'import' }],
    ['empty mustContain', (v) => { v.fixtures[0].diagnostics[0].mustContain = [] }],
    ['not a package name', (v) => { v.fixtures[0].peer = 'Vue 2' }],
    ['unknown fixture key', (v) => { v.fixtures[0].lane = 'incompatible' }],
  ]

  it.each(peerBothReject)('peer: both reject %s', (_name, mutate) => {
    const value = clone(realPeers)
    mutate(value)
    expect(peerValidator.validate(value).length, 'JSON Schema').toBeGreaterThan(0)
    expect(checkPeerCompatibilityFile(value).length, 'checker').toBeGreaterThan(0)
  })

  it('peer: an installed record with no diagnostic is valid to both', () => {
    const value = clone(realPeers)
    Object.assign(value.fixtures[0], { id: 'peer.vue.in-range', state: 'installed', installedVersion: '3.5.13', diagnostics: [] })
    expect(peerValidator.validate(value)).toEqual([])
    expect(checkPeerCompatibilityFile(value)).toEqual([])
  })

  it('peer: only the checker can see an id that misnames its peer, or a diagnostic that never names it', () => {
    const value = clone(realPeers)
    value.fixtures[0].id = 'peer.reka-ui.wrong-major-two'
    value.fixtures[1].diagnostics[0].mustContain = ['not installed but required']
    expect(peerValidator.validate(value)).toEqual([])
    expect(checkPeerCompatibilityFile(value).map(p => p.path)).toEqual([
      '<peer-compatibility>.fixtures[0].id',
      '<peer-compatibility>.fixtures[1].diagnostics[0].mustContain',
    ])
  })
})

/**
 * Every key of `T`, labelled by whether `T` requires it. A literal of this type
 * must name every field with the right label: a missing field, an extra one or
 * a wrong label is a type error (`tsc -p packages/tooling/tsconfig.json`).
 */
type Presence<T> = { readonly [K in keyof T]-?: Pick<T, K> extends Required<Pick<T, K>> ? 'required' : 'optional' }
type FieldTable = Readonly<Record<string, 'optional' | 'required'>>

/** The same labels read out of a schema object node's `properties` and `required`. */
function schemaPresence(node: Json): FieldTable {
  const required = new Set<string>(node.required ?? [])
  return Object.fromEntries(Object.keys(node.properties ?? {}).map(key => [key, required.has(key) ? 'required' : 'optional']))
}

describe('the TypeScript types ⇔ the JSON Schemas (the third form of the format)', () => {
  // `checkVocabularyAgreement` proves each schema enum equals its exported
  // constant. But a constant typed `readonly SecuritySink[]` can omit a union
  // member and still compile, and no check compared the interfaces' fields at
  // all. A `Record<Union, true>` literal cannot omit or add a member, and a
  // `Presence<T>` literal cannot omit, add or mislabel a field — so these tables
  // are the type half, and the assertions tie them to the constants and schemas.
  const CATEGORY_TABLE: Record<SecurityCategory, true> = { 'url-scheme': true, 'markup-injection': true, 'css-injection': true, 'degenerate-input': true, 'file-metadata': true, 'encoded-payload': true }
  const SINK_TABLE: Record<SecuritySink, true> = { 'navigation': true, 'subresource': true, 'html': true, 'markdown': true, 'mermaid-svg': true, 'text': true, 'attribute': true, 'style': true, 'encoded-payload': true, 'file': true }
  const OUTCOME_TABLE: Record<NeutralizationOutcome, true> = { rejected: true, stripped: true, escaped: true, inert: true, admitted: true }
  const PEER_STATE_TABLE: Record<PeerState, true> = { absent: true, installed: true, incompatible: true }
  const STAGE_TABLE: Record<PeerDiagnosticStage, true> = { install: true, validate: true, build: true, runtime: true }
  const SEVERITY_TABLE: Record<PeerDiagnostic['severity'], true> = { error: true, warning: true }

  const CORPUS_FILE_FIELDS: Presence<SecurityCorpusFile> = { $schema: 'optional', schemaVersion: 'required', category: 'required', description: 'required', fixtures: 'required', extensions: 'optional' }
  const FIXTURE_FIELDS: Presence<SecurityFixture> = { id: 'required', category: 'required', title: 'required', payload: 'required', repeat: 'optional', outcomes: 'required', rationale: 'required', provenance: 'required', extensions: 'optional' }
  const PEER_FILE_FIELDS: Presence<PeerCompatibilityFile> = { $schema: 'optional', schemaVersion: 'required', description: 'required', fixtures: 'required', extensions: 'optional' }
  const PEER_FIXTURE_FIELDS: Presence<PeerCompatibilityFixture> = { id: 'required', title: 'required', dependent: 'required', peer: 'required', declaredRange: 'required', optional: 'required', state: 'required', installedVersion: 'required', diagnostics: 'required', rationale: 'required', provenance: 'required', extensions: 'optional' }
  const DIAGNOSTIC_FIELDS: Presence<PeerDiagnostic> = { stage: 'required', severity: 'required', mustContain: 'required' }

  const sorted = (values: readonly string[]): string[] => [...values].sort()

  it('every union has exactly the members of its exported constant (and so of its schema enum)', () => {
    expect(sorted(Object.keys(CATEGORY_TABLE))).toEqual(sorted(SECURITY_CATEGORIES))
    expect(sorted(Object.keys(SINK_TABLE))).toEqual(sorted(SECURITY_SINKS))
    expect(sorted(Object.keys(OUTCOME_TABLE))).toEqual(sorted(NEUTRALIZATION_OUTCOMES))
    expect(sorted(Object.keys(PEER_STATE_TABLE))).toEqual(sorted(PEER_STATES))
    expect(sorted(Object.keys(STAGE_TABLE))).toEqual(sorted(PEER_DIAGNOSTIC_STAGES))
    // No exported constant mirrors severity, so the union is compared with the schema directly.
    expect(sorted(Object.keys(SEVERITY_TABLE))).toEqual(sorted(peerSchema.definitions.diagnostic.properties.severity.enum))
  })

  it.each<[string, FieldTable, Json]>([
    ['SecurityCorpusFile', CORPUS_FILE_FIELDS, corpusSchema],
    ['SecurityFixture', FIXTURE_FIELDS, corpusSchema.definitions.fixture],
    ['PeerCompatibilityFile', PEER_FILE_FIELDS, peerSchema],
    ['PeerCompatibilityFixture', PEER_FIXTURE_FIELDS, peerSchema.definitions.fixture],
    ['PeerDiagnostic', DIAGNOSTIC_FIELDS, peerSchema.definitions.diagnostic],
  ])('%s: every field and its optionality match the schema', (_name, fields, node) => {
    expect(schemaPresence(node)).toEqual(fields)
  })

  it('a record carrying every typed field, optional ones included, is accepted by both validators', () => {
    const corpus = clone(realUrlScheme)
    corpus.extensions = { 'com.dzup.pro': {} }
    Object.assign(corpus.fixtures[0], { repeat: 1, extensions: { 'com.dzup.pro': {} } })
    expect(sorted(Object.keys(corpus))).toEqual(sorted(Object.keys(CORPUS_FILE_FIELDS)))
    expect(sorted(Object.keys(corpus.fixtures[0]))).toEqual(sorted(Object.keys(FIXTURE_FIELDS)))
    expect(new Draft07Validator(corpusSchema).validate(corpus)).toEqual([])
    expect(checkCorpusFile(corpus)).toEqual([])

    const peers = clone(realPeers)
    peers.extensions = { 'com.dzup.pro': {} }
    peers.fixtures[0].extensions = { 'com.dzup.pro': { lane: 'incompatible' } }
    expect(sorted(Object.keys(peers))).toEqual(sorted(Object.keys(PEER_FILE_FIELDS)))
    expect(sorted(Object.keys(peers.fixtures[0]))).toEqual(sorted(Object.keys(PEER_FIXTURE_FIELDS)))
    expect(sorted(Object.keys(peers.fixtures[0].diagnostics[0]))).toEqual(sorted(Object.keys(DIAGNOSTIC_FIELDS)))
    expect(new Draft07Validator(peerSchema).validate(peers)).toEqual([])
    expect(checkPeerCompatibilityFile(peers)).toEqual([])
  })
})

describe('the vocabulary check', () => {
  it('is clean for the published schemas', () => {
    expect(checkVocabularyAgreement(corpusSchema, peerSchema)).toEqual([])
  })

  it('catches a per-category block that pins the wrong prefix', () => {
    const drifted = clone(corpusSchema)
    drifted.allOf[0].then.properties.fixtures.items.properties.id.pattern = '^url\\.'
    expect(checkVocabularyAgreement(drifted, peerSchema)).toEqual([
      `${CORPUS_SCHEMA_NAME}: the url-scheme block must pin fixture category and id prefix to "url-scheme"`,
    ])
  })

  it('catches a peer stage enum that grew without the module', () => {
    const drifted = clone(peerSchema)
    drifted.definitions.diagnostic.properties.stage.enum.push('import')
    expect(checkVocabularyAgreement(corpusSchema, drifted)).toEqual([
      `${PEER_SCHEMA_NAME}: stage enum != PEER_DIAGNOSTIC_STAGES`,
    ])
  })
})

describe('executePeerFixture — the optional flag, which OSS has no real peer to exercise', () => {
  const base: PeerCompatibilityFixture = {
    id: 'peer.pdfjs-dist.wrong-major',
    title: 'synthetic',
    dependent: '@example/viewer',
    peer: 'pdfjs-dist',
    declaredRange: '^4.0.0',
    optional: true,
    state: 'incompatible',
    installedVersion: '3.11.174',
    diagnostics: [{ stage: 'validate', severity: 'error', mustContain: ['pdfjs-dist', '3.11.174 does NOT satisfy ^4.0.0'] }],
    rationale: 'synthetic',
    provenance: 'synthetic',
  }

  it('an optional peer at an incompatible version is still an error', () => {
    expect(executePeerFixture(base, new Map())).toEqual({ problems: [], executed: 1 })
  })

  it('an absent optional peer is a warning, not an error', () => {
    const absent: PeerCompatibilityFixture = {
      ...base,
      id: 'peer.pdfjs-dist.absent',
      state: 'absent',
      installedVersion: null,
      diagnostics: [{ stage: 'validate', severity: 'warning', mustContain: ['pdfjs-dist', 'optional peer'] }],
    }
    expect(executePeerFixture(absent, new Map())).toEqual({ problems: [], executed: 1 })
    expect(executePeerFixture({ ...absent, diagnostics: [{ ...absent.diagnostics[0]!, severity: 'error' }] }, new Map()).problems)
      .toEqual(['peer fixture peer.pdfjs-dist.absent: expects a validate-stage error, validate:peers reports a warning: "WARN  pdfjs-dist ^4.0.0 — not installed (optional peer — acceptable)"'])
  })

  it('leaves install, build and runtime diagnostics to the consumer matrix that produces them', () => {
    const runtime: PeerCompatibilityFixture = {
      ...base,
      diagnostics: [{ stage: 'runtime', severity: 'error', mustContain: ['pdfjs-dist', 'npm install pdfjs-dist'] }],
    }
    expect(executePeerFixture(runtime, new Map())).toEqual({ problems: [], executed: 0 })
  })

  it('prints exactly what validate:peers prints', () => {
    const [check] = checkPeerDeps({ name: 'x', version: '0.0.0', peerDependencies: { vue: '^3.5.0' } }, new Map(), () => '2.7.16')
    expect(formatPeerCheck(check!)).toBe('FAIL  vue ^3.5.0 — 2.7.16 does NOT satisfy ^3.5.0')
  })
})

describe('differential cross-check against ajv (dev-time oracle)', () => {
  const require = createRequire(import.meta.url)
  const verdict = (schema: Json, instance: Json): boolean => {
    const Ajv = require('ajv') as new (options: unknown) => { compile: (s: unknown) => (i: unknown) => boolean }
    return new Ajv({ allErrors: true, strict: false }).compile(schema)(instance)
  }

  it('agrees on every real data file', () => {
    for (const name of ['css-injection', 'degenerate-input', 'encoded-payload', 'file-metadata', 'markup-injection', 'url-scheme']) {
      const value = readJson(join(SECURITY_CORPUS_DIR, `${name}.corpus.json`))
      expect(verdict(corpusSchema, value), name).toBe(true)
      expect(new Draft07Validator(corpusSchema).validate(value), name).toEqual([])
    }
    expect(verdict(peerSchema, realPeers)).toBe(true)
  })

  it('agrees on every seeded corpus defect the schema expresses', () => {
    for (const [name, mutate] of [
      ['unknown sink', (v: Json) => { v.fixtures[0].outcomes.iframe = 'rejected' }],
      ['empty outcomes', (v: Json) => { v.fixtures[0].outcomes = {} }],
      ['short inert rationale', (v: Json) => { v.fixtures[0].rationale = 'short' }],
      ['wrong category prefix', (v: Json) => { v.fixtures[0].id = 'markup-injection.javascript.plain' }],
      ['bad namespace', (v: Json) => { v.extensions = { pro: {} } }],
    ] as const) {
      const value = clone(realUrlScheme)
      mutate(value)
      expect(verdict(corpusSchema, value), name).toBe(false)
      expect(new Draft07Validator(corpusSchema).validate(value).length > 0, name).toBe(true)
    }
  })

  it('agrees on the conditional peer rules', () => {
    for (const mutate of [
      (v: Json) => { v.fixtures[1].installedVersion = '2.0.0' },
      (v: Json) => { v.fixtures[0].installedVersion = null },
      (v: Json) => { v.fixtures[0].diagnostics = [] },
    ]) {
      const value = clone(realPeers)
      mutate(value)
      expect(verdict(peerSchema, value)).toBe(false)
      expect(new Draft07Validator(peerSchema).validate(value).length > 0).toBe(true)
    }
  })
})
