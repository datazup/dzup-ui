/**
 * The security-fixture corpus: schema, loader and conformance rules
 * (TASK-N1-O5).
 *
 * ── Why the schema lives here and not beside the specs ──────────────────────
 * `@dzup-ui/testing` is the one package both repositories can depend on:
 * `ui/dzup-ui` uses it from `packages/core/security/`, and `ui/dzup-ui-pro`'s
 * QUAL-04 (TASK-N1-P1) has to hang its 14 ad-hoc DOMPurify sites off the *same*
 * fixture format or the two corpora drift into two vocabularies for one
 * problem. Pro's task says "adopt the corpus SCHEMA from OSS TASK-N1-O5 … so
 * fixtures are shared-format"; this module is that schema.
 *
 * ── The one design decision worth arguing about ─────────────────────────────
 * A fixture does NOT carry a single expected outcome. It carries one per
 * sink kind*, because the same string is a different problem in a different
 * hole:
 *
 *   `javascript:alert(1)` in an `<a href>` **must be rejected** — it runs on
 *   click. The identical string in an `<img src>` is `inert` — no engine has
 *   executed a `javascript:` subresource this decade; it fires `error` and
 *   nothing else.
 *
 * Collapsing those into one "expected outcome" forces a choice between a
 * corpus that cries wolf on every image component and one that says nothing
 * about anchors. So `SecurityFixture.outcomes` is a map keyed by
 * {@link SecuritySink}, every entry is a required safe outcome, and a spec
 * looks up the sink it is actually testing. The requirement "every fixture
 * states the expected safe outcome" is met per sink rather than per fixture,
 * which is the only way it can be met truthfully.
 *
 * ── What an outcome is allowed to be ────────────────────────────────────────
 * Never "does not crash". The five values in {@link NeutralizationOutcome} are
 * all observable in a DOM assertion, and four of them are checkable without a
 * browser. `inert` and `admitted` are the two that can be claimed without
 * proving anything, so {@link SecurityFixture.rationale} is required for every
 * fixture and must be substantial wherever either appears.
 *
 * ── One format for two repositories (TASK-R3-O4, schema 1.1.0) ─────────────
 * The same record is published three ways that must never disagree: the
 * TypeScript types below, the checker {@link checkCorpusFile} (the authority —
 * it also enforces what JSON Schema cannot, such as unique ids), and the JSON
 * Schema files beside the data ({@link SECURITY_CORPUS_SCHEMA_FILE},
 * {@link PEER_COMPATIBILITY_SCHEMA_FILE}) that an editor or another repository
 * validates against. `yarn validate:security-corpus` runs all of them over
 * every data file and fails on any disagreement.
 *
 * A consumer that needs a field the shared format does not have puts it under
 * `extensions["<reverse-dns namespace>"]` rather than beside the shared
 * fields: unknown top-level keys are rejected, so a second vocabulary cannot
 * grow inside the first one unnoticed.
 *
 * ── Scope ───────────────────────────────────────────────────────────────────
 * Defensive. The payloads are the short, well-worn representatives that appear
 * in every public XSS test suite (cure53's HTML sanitizer cases, the OWASP
 * filter-evasion list, the WHATWG URL parsing tests). There is no generator,
 * no mutation engine and no encoder here, and there must not be: a corpus
 * exists to prove neutralization, and anything that *produces* payloads is a
 * different kind of tool with a different reason to exist.
 *
 * @module @dzup-ui/testing/security-corpus
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

/**
 * The corpus schema version, semver.
 *
 * Bumped **major** when an existing field changes meaning or a fixture id is
 * reused for a different payload, because a consumer in another repository
 * pins expectations to ids. Bumped **minor** for a new optional field or a new
 * category/sink/outcome value. A file whose `schemaVersion` major does not
 * match this one is rejected by {@link assertCorpusFile} rather than
 * best-effort parsed.
 *
 * 1.1.0 (TASK-R3-O4): sinks `markdown` and `mermaid-svg`; outcome `admitted`;
 * optional `extensions` and `$schema`; the peer-compatibility fixture record;
 * published JSON Schema. The checker now also enforces what the 1.0.0 README
 * already documented but only a spec checked — the three-segment id and the
 * substantial rationale — and rejects keys the format does not define.
 */
export const SECURITY_CORPUS_SCHEMA_VERSION = '1.1.0'

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/**
 * The class of hostile input a fixture represents.
 *
 * These are the four the reassessment named (URL scheme abuse, HTML injection,
 * CSS injection, oversized/degenerate input) plus the two the catalog actually
 * needs: file metadata, because Tier D here is a file control, and encoded
 * payload, because a QR code hands a string to a camera with no browser in
 * between.
 */
export type SecurityCategory
  = | 'url-scheme'
    | 'markup-injection'
    | 'css-injection'
    | 'degenerate-input'
    | 'file-metadata'
    | 'encoded-payload'

/** Every {@link SecurityCategory}, in the order files are listed. */
export const SECURITY_CATEGORIES: readonly SecurityCategory[] = [
  'url-scheme',
  'markup-injection',
  'css-injection',
  'degenerate-input',
  'file-metadata',
  'encoded-payload',
]

/**
 * Where the hostile value lands — the property that decides what "safe" means.
 *
 * Deliberately the same vocabulary Pro's sink registry needs (`v-html`,
 * markdown/mermaid render paths and dynamic `iframe src` are `html`,
 * `navigation` and `subresource` respectively), so one registry row can name
 * its sink kind and pick up the right expected outcomes without a translation
 * table.
 *
 * - `navigation` — the URL is *followed* on activation (`<a href>`, form
 *   action). The only sink where a `javascript:` URL executes.
 * - `subresource` — the URL is *fetched* (`<img src>`, `background-image`).
 * - `html` — the value reaches an HTML parser (`v-html`, `innerHTML`).
 * - `markdown` — the value is Markdown source: a Markdown parser builds HTML
 *   from it and that HTML reaches an HTML parser. Not `html`, because the
 *   parser rather than the author creates the markup — reference links,
 *   autolinks and image titles are attacks only a Markdown sink can have, and
 *   the same string in a raw-HTML sink is inert text that proves nothing.
 * - `mermaid-svg` — the value is Mermaid diagram source: a renderer builds SVG
 *   from it and that SVG reaches an HTML parser. Directives inside the source
 *   can ask the renderer to lower its own security level.
 *   `markdown` and `mermaid-svg` are spelled exactly as the sanitizer seam's
 *   `DzSanitizeSink` contexts in `@dzup-ui/contracts`, so a sink registry row
 *   whose context is one of them needs no translation to find its fixtures.
 * - `text` — the value becomes a text node.
 * - `attribute` — the value becomes an attribute value (`alt`, `aria-label`).
 * - `style` — the value becomes a CSS declaration or a `style` attribute.
 * - `encoded-payload` — the value is encoded for another system to decode.
 * - `file` — a `File` the user chose reaches the model.
 */
export type SecuritySink
  = | 'navigation'
    | 'subresource'
    | 'html'
    | 'markdown'
    | 'mermaid-svg'
    | 'text'
    | 'attribute'
    | 'style'
    | 'encoded-payload'
    | 'file'

/** Every {@link SecuritySink}. */
export const SECURITY_SINKS: readonly SecuritySink[] = [
  'navigation',
  'subresource',
  'html',
  'markdown',
  'mermaid-svg',
  'text',
  'attribute',
  'style',
  'encoded-payload',
  'file',
]

/**
 * What has to be observably true after the payload meets the sink.
 *
 * - `rejected` — the value never reaches the sink. No attribute is rendered,
 *   or the component emits an error and drops it. Strongest, and the only
 *   acceptable outcome for `javascript:` in a `navigation` sink.
 * - `stripped` — the dangerous part is removed and the remainder is kept.
 * - `escaped` — the value reaches the sink **verbatim, as data**: it is
 *   readable, and it built no element, no attribute and no handler.
 * - `inert` — the value reaches the sink verbatim and the sink has no way to
 *   act on it. Requires a stated reason; `inert` without one is `unchecked`
 *   wearing a better word.
 * - `admitted` — the value reaches the sink **live and unchanged because a
 *   named policy deliberately admits it**: an internationalised hostname a URL
 *   allowlist accepts, a document under a size ceiling. Not a neutralization
 *   and the weakest outcome; it exists so a reviewed "we let this through"
 *   is not recorded as `stripped` (false — nothing was removed) or left out of
 *   the corpus (the decision then has no fixture to fail when the policy
 *   changes). The rationale must name the policy.
 *
 * How the sanitizer seam in `@dzup-ui/contracts` reads in this vocabulary: a
 * real `DzSanitizerAdapter.sanitize()` produces `stripped`; Core's default
 * escaping adapter produces `escaped`; a `DzSanitizeLimitError` is `rejected`.
 *
 * There is deliberately no value for "unsafe". A measurement needs one, and it
 * belongs to the measuring code (`passed-through` in Core's
 * `security/boundary-suites.ts`), never to a fixture.
 */
export type NeutralizationOutcome = 'rejected' | 'stripped' | 'escaped' | 'inert' | 'admitted'

/** Every {@link NeutralizationOutcome}, strongest first. */
export const NEUTRALIZATION_OUTCOMES: readonly NeutralizationOutcome[] = [
  'rejected',
  'stripped',
  'escaped',
  'inert',
  'admitted',
]

/**
 * The outcomes that can be claimed without proving anything, and therefore
 * require a rationale longer than {@link RATIONALE_MIN_LENGTH_WHEN_UNPROVEN}
 * characters wherever a fixture states one.
 */
export const UNPROVEN_OUTCOMES: readonly NeutralizationOutcome[] = ['inert', 'admitted']

/** A rationale for an {@link UNPROVEN_OUTCOMES} claim must be longer than this. */
export const RATIONALE_MIN_LENGTH_WHEN_UNPROVEN = 80

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

/**
 * `{category}.{family}.{case}` — three lowercase kebab segments.
 *
 * The family segment is where a consumer's finer taxonomy lives: Pro's
 * `event-handler` payloads are `markup-injection.event-handler.*`, so no
 * category has to be added for a distinction only one repository draws.
 */
export const SECURITY_FIXTURE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * A reverse-DNS extension namespace, at least two segments: `com.dzup.pro`.
 * The same convention as the `$extensions["com.dzup"]` block in the DTCG token
 * export, for the same reason — a key nobody else can collide with.
 */
export const EXTENSION_NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/

/**
 * Consumer-specific data, keyed by namespace. A reader that does not know a
 * namespace ignores it, and an extension never changes the meaning of a
 * shared field — a Trusted Types policy name or a list of live-surface tokens
 * belongs here; a second `outcomes` map does not.
 */
export type SecurityExtensions = Readonly<Record<string, Readonly<Record<string, unknown>>>>

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

/** One hostile input and what every sink that can receive it owes. */
export interface SecurityFixture {
  /**
   * Stable id, `{category}.{family}.{case}`. Never reused for a different
   * payload — a deviation register in either repository refers to fixtures by
   * id, and a silently repurposed id relabels somebody's recorded defect.
   */
  readonly id: string
  readonly category: SecurityCategory
  /** One line a reviewer can read without decoding the payload. */
  readonly title: string
  /**
   * The input, verbatim — or, with {@link SecurityFixture.repeat}, the unit it
   * is built from. Minimal and inert; see the module note on scope.
   */
  readonly payload: string
  /**
   * Repeat count for {@link SecurityFixture.payload}, default 1.
   *
   * Only oversized cases use it, and only so a data file stays readable: a
   * 4 096-character run of `a` pasted into JSON is a file nobody reviews.
   * Always resolve a payload through {@link payloadOf}, never by reading
   * `payload` directly, or an oversized case silently becomes a one-character
   * one.
   */
  readonly repeat?: number
  /**
   * The required safe outcome per sink kind. A sink absent from this map is
   * one the fixture says nothing about — which is different from, and must
   * never be read as, "anything goes".
   */
  readonly outcomes: Readonly<Partial<Record<SecuritySink, NeutralizationOutcome>>>
  /**
   * Why those outcomes, in particular why any `inert` is genuinely inert and
   * which policy any `admitted` rests on. Longer than
   * {@link RATIONALE_MIN_LENGTH_WHEN_UNPROVEN} characters wherever an
   * {@link UNPROVEN_OUTCOMES} value appears.
   */
  readonly rationale: string
  /** Where the case comes from, so nobody has to trust that it is representative. */
  readonly provenance: string
  /** Consumer-specific data; see {@link SecurityExtensions}. */
  readonly extensions?: SecurityExtensions
}

/** One corpus file: every fixture of a single category. */
export interface SecurityCorpusFile {
  /** Editor hint only — a path or URL to `security-corpus.schema.json`. */
  readonly $schema?: string
  readonly schemaVersion: string
  readonly category: SecurityCategory
  readonly description: string
  readonly fixtures: readonly SecurityFixture[]
  /** Consumer-specific data about the whole file; see {@link SecurityExtensions}. */
  readonly extensions?: SecurityExtensions
}

// ---------------------------------------------------------------------------
// Peer compatibility (08-11 doc 06 §Files/engines, R-058d)
// ---------------------------------------------------------------------------

/**
 * What is installed of a peer a package declares.
 *
 * - `absent` — nothing resolvable. The case both repositories already model
 *   (Pro's `fixtures/consumers/optional-peer` "absent" lane).
 * - `installed` — a version inside the declared range (Pro's "present" lane).
 * - `incompatible` — a version **outside** the declared range: a wrong major,
 *   or a floor the install does not reach. The case neither repository had.
 */
export type PeerState = 'absent' | 'installed' | 'incompatible'

/** Every {@link PeerState}. */
export const PEER_STATES: readonly PeerState[] = ['absent', 'installed', 'incompatible']

/**
 * Where a consumer is told about the peer.
 *
 * - `install` — the package manager (`npm install` refusing under strict
 *   peers with `ERESOLVE`).
 * - `validate` — a repository's own peer gate (`yarn validate:peers`).
 * - `build` — the bundler (`Rollup failed to resolve import`).
 * - `runtime` — the component itself (a missing-dependency panel that names
 *   the package and its install command).
 */
export type PeerDiagnosticStage = 'install' | 'validate' | 'build' | 'runtime'

/** Every {@link PeerDiagnosticStage}, earliest first. */
export const PEER_DIAGNOSTIC_STAGES: readonly PeerDiagnosticStage[] = ['install', 'validate', 'build', 'runtime']

/** One diagnostic a consumer must see. */
export interface PeerDiagnostic {
  readonly stage: PeerDiagnosticStage
  readonly severity: 'error' | 'warning'
  /**
   * Substrings the diagnostic must contain. At least one names the peer:
   * "it did not crash" is not the promise — telling the consumer **which**
   * package to install or change is.
   */
  readonly mustContain: readonly string[]
}

/**
 * One claim about a declared peer in one install state.
 *
 * A sibling of the consumer-matrix lane, not a replacement for it: the lane
 * says how the state is produced (which command installs what) and this record
 * says what must then be true, as data both repositories can read.
 */
export interface PeerCompatibilityFixture {
  /** `peer.{peer-slug}.{case}`; the slug is the peer name with `@` dropped and `/` as `-`. */
  readonly id: string
  readonly title: string
  /** The package that declares the peer. */
  readonly dependent: string
  readonly peer: string
  /** The range `dependent` declares, verbatim from its `peerDependencies`. */
  readonly declaredRange: string
  /** `peerDependenciesMeta[peer].optional === true`. */
  readonly optional: boolean
  readonly state: PeerState
  /** The exact installed version; `null` exactly when `state` is `absent`. */
  readonly installedVersion: string | null
  /** Non-empty for `absent` and `incompatible` — those are the states a consumer must be told about. */
  readonly diagnostics: readonly PeerDiagnostic[]
  readonly rationale: string
  readonly provenance: string
  readonly extensions?: SecurityExtensions
}

/** The peer-compatibility fixture file. */
export interface PeerCompatibilityFile {
  readonly $schema?: string
  readonly schemaVersion: string
  readonly description: string
  readonly fixtures: readonly PeerCompatibilityFixture[]
  readonly extensions?: SecurityExtensions
}

/** `peer.{slug}.{case}`. */
export const PEER_FIXTURE_ID_PATTERN = /^peer\.[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The id slug a peer name must appear as: `@vue/reactivity` → `vue-reactivity`. */
export function peerSlug(peer: string): string {
  return peer
    .toLowerCase()
    .replace(/^@/, '')
    .split(/[^a-z0-9]+/)
    .filter(part => part !== '')
    .join('-')
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** A schema violation, with the path that has it. */
export interface CorpusViolation {
  readonly path: string
  readonly message: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function majorOf(version: string): string {
  return version.split('.')[0] ?? ''
}

type Fail = (at: string, message: string) => void

/** `x.y.z` with nothing else — a data file's schema version is never a range or a pre-release. */
const SCHEMA_VERSION_PATTERN = /^\d+\.\d+\.\d+$/

/** An exact installed version: `x.y.z`, optionally with a pre-release and build. */
const EXACT_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[\d.a-z-]+)?(?:\+[\d.a-z-]+)?$/i

/** An npm package name, scoped or not. */
const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/

const CORPUS_FILE_KEYS = new Set(['$schema', 'schemaVersion', 'category', 'description', 'fixtures', 'extensions'])
const FIXTURE_KEYS = new Set(['id', 'category', 'title', 'payload', 'repeat', 'outcomes', 'rationale', 'provenance', 'extensions'])
const PEER_FILE_KEYS = new Set(['$schema', 'schemaVersion', 'description', 'fixtures', 'extensions'])
const PEER_FIXTURE_KEYS = new Set([
  'id',
  'title',
  'dependent',
  'peer',
  'declaredRange',
  'optional',
  'state',
  'installedVersion',
  'diagnostics',
  'rationale',
  'provenance',
  'extensions',
])
const DIAGNOSTIC_KEYS = new Set(['stage', 'severity', 'mustContain'])

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

/**
 * Keys the format does not define are refused, not ignored.
 *
 * Ignoring them is how a second vocabulary grows inside the first: a `why`
 * beside `rationale`, a `mustNotSurvive` beside `outcomes`, each readable by
 * exactly one repository. Data only one consumer understands goes under
 * `extensions`, where every reader knows it may skip it.
 */
function checkKnownKeys(record: Record<string, unknown>, allowed: ReadonlySet<string>, at: string, fail: Fail): void {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key))
      fail(`${at}.${key}`, 'not a field of this format — put consumer-specific data under extensions["<namespace>"]')
  }
}

function checkSchemaVersion(value: unknown, at: string, fail: Fail): void {
  if (typeof value !== 'string')
    fail(at, 'missing')
  else if (!SCHEMA_VERSION_PATTERN.test(value))
    fail(at, `not an x.y.z version: ${value}`)
  else if (majorOf(value) !== majorOf(SECURITY_CORPUS_SCHEMA_VERSION))
    fail(at, `major ${majorOf(value)} != ${majorOf(SECURITY_CORPUS_SCHEMA_VERSION)}`)
}

function checkExtensions(value: unknown, at: string, fail: Fail): void {
  if (value === undefined)
    return
  if (!isRecord(value)) {
    fail(at, 'not an object')
    return
  }
  for (const [namespace, payload] of Object.entries(value)) {
    if (!EXTENSION_NAMESPACE_PATTERN.test(namespace))
      fail(`${at}.${namespace}`, 'not a reverse-DNS namespace such as "com.dzup.pro"')
    if (!isRecord(payload))
      fail(`${at}.${namespace}`, 'an extension is an object')
  }
}

function checkOptionalSchemaHint(value: unknown, at: string, fail: Fail): void {
  if (value !== undefined && !isNonEmptyString(value))
    fail(at, 'not a non-empty string')
}

/**
 * Check one parsed corpus file against the schema.
 *
 * Returns every violation rather than throwing on the first, because the
 * caller is a spec listing what is wrong with a data file and stopping at the
 * first bad fixture would turn one fix into six runs.
 *
 * This is the authority. `security-corpus.schema.json` expresses the same
 * record for editors and other repositories, and `validate:security-corpus`
 * fails if the two ever disagree about a data file; the rules JSON Schema
 * cannot state — unique ids — live only here.
 */
export function checkCorpusFile(value: unknown, path = '<corpus>'): CorpusViolation[] {
  const problems: CorpusViolation[] = []
  const fail: Fail = (at, message) => {
    problems.push({ path: at, message })
  }

  if (!isRecord(value)) {
    fail(path, 'not an object')
    return problems
  }

  checkKnownKeys(value, CORPUS_FILE_KEYS, path, fail)
  checkOptionalSchemaHint(value.$schema, `${path}.$schema`, fail)
  checkSchemaVersion(value.schemaVersion, `${path}.schemaVersion`, fail)
  checkExtensions(value.extensions, `${path}.extensions`, fail)

  const category = value.category
  if (typeof category !== 'string' || !SECURITY_CATEGORIES.includes(category as SecurityCategory))
    fail(`${path}.category`, `not a SecurityCategory: ${String(category)}`)

  if (!isNonEmptyString(value.description))
    fail(`${path}.description`, 'missing or empty')

  const fixtures = value.fixtures
  if (!Array.isArray(fixtures)) {
    fail(`${path}.fixtures`, 'not an array')
    return problems
  }
  if (fixtures.length === 0)
    fail(`${path}.fixtures`, 'empty — a category file with no cases is a heading')

  const seen = new Set<string>()
  fixtures.forEach((raw, index) => {
    const at = `${path}.fixtures[${index}]`
    if (!isRecord(raw)) {
      fail(at, 'not an object')
      return
    }
    checkKnownKeys(raw, FIXTURE_KEYS, at, fail)
    checkExtensions(raw.extensions, `${at}.extensions`, fail)

    const id = raw.id
    if (!isNonEmptyString(id)) {
      fail(`${at}.id`, 'missing or empty')
    }
    else {
      if (seen.has(id))
        fail(`${at}.id`, `duplicate id ${id}`)
      seen.add(id)
      if (!SECURITY_FIXTURE_ID_PATTERN.test(id))
        fail(`${at}.id`, `not {category}.{family}.{case} in lowercase kebab segments: ${id}`)
      if (typeof category === 'string' && !id.startsWith(`${category}.`))
        fail(`${at}.id`, `id must start with "${category}." so a bare id names its category`)
    }
    if (raw.category !== category)
      fail(`${at}.category`, `disagrees with the file (${String(raw.category)} vs ${String(category)})`)
    if (!isNonEmptyString(raw.title))
      fail(`${at}.title`, 'missing or empty')
    if (typeof raw.payload !== 'string' || raw.payload === '')
      fail(`${at}.payload`, 'missing or empty')
    if (raw.repeat !== undefined && (typeof raw.repeat !== 'number' || !Number.isInteger(raw.repeat) || raw.repeat < 1))
      fail(`${at}.repeat`, 'not a positive integer')
    if (!isNonEmptyString(raw.rationale))
      fail(`${at}.rationale`, 'missing or empty')
    if (!isNonEmptyString(raw.provenance))
      fail(`${at}.provenance`, 'missing or empty')

    const outcomes = raw.outcomes
    if (!isRecord(outcomes)) {
      fail(`${at}.outcomes`, 'missing')
      return
    }
    const entries = Object.entries(outcomes)
    if (entries.length === 0) {
      fail(
        `${at}.outcomes`,
        'empty — a fixture that names no required outcome asserts only "does not crash"',
      )
    }
    for (const [sink, outcome] of entries) {
      if (!SECURITY_SINKS.includes(sink as SecuritySink))
        fail(`${at}.outcomes.${sink}`, 'not a SecuritySink')
      if (!NEUTRALIZATION_OUTCOMES.includes(outcome as NeutralizationOutcome))
        fail(`${at}.outcomes.${sink}`, `not a NeutralizationOutcome: ${String(outcome)}`)
    }

    // `inert` and `admitted` are claims a fixture can make without proving
    // anything, so they are the ones the schema makes expensive: a one-word
    // reason is indistinguishable from nobody having looked.
    const unproven = entries.map(([, outcome]) => outcome).filter(outcome =>
      UNPROVEN_OUTCOMES.includes(outcome as NeutralizationOutcome))
    if (
      unproven.length > 0
      && typeof raw.rationale === 'string'
      && raw.rationale.length <= RATIONALE_MIN_LENGTH_WHEN_UNPROVEN
    ) {
      fail(
        `${at}.rationale`,
        `claims ${[...new Set(unproven)].join(' and ')}, so the rationale must be longer than `
        + `${RATIONALE_MIN_LENGTH_WHEN_UNPROVEN} characters (has ${raw.rationale.length})`,
      )
    }
  })

  return problems
}

/**
 * Check one parsed peer-compatibility file.
 *
 * Same contract as {@link checkCorpusFile}: every violation, never the first,
 * and the rules JSON Schema cannot state (unique ids, the id slug naming the
 * peer, a diagnostic that names the peer) live only here.
 */
export function checkPeerCompatibilityFile(value: unknown, path = '<peer-compatibility>'): CorpusViolation[] {
  const problems: CorpusViolation[] = []
  const fail: Fail = (at, message) => {
    problems.push({ path: at, message })
  }

  if (!isRecord(value)) {
    fail(path, 'not an object')
    return problems
  }

  checkKnownKeys(value, PEER_FILE_KEYS, path, fail)
  checkOptionalSchemaHint(value.$schema, `${path}.$schema`, fail)
  checkSchemaVersion(value.schemaVersion, `${path}.schemaVersion`, fail)
  checkExtensions(value.extensions, `${path}.extensions`, fail)
  if (!isNonEmptyString(value.description))
    fail(`${path}.description`, 'missing or empty')

  const fixtures = value.fixtures
  if (!Array.isArray(fixtures)) {
    fail(`${path}.fixtures`, 'not an array')
    return problems
  }
  if (fixtures.length === 0)
    fail(`${path}.fixtures`, 'empty — a fixture file with no cases is a heading')

  const seen = new Set<string>()
  fixtures.forEach((raw, index) => {
    const at = `${path}.fixtures[${index}]`
    if (!isRecord(raw)) {
      fail(at, 'not an object')
      return
    }
    checkKnownKeys(raw, PEER_FIXTURE_KEYS, at, fail)
    checkExtensions(raw.extensions, `${at}.extensions`, fail)

    for (const key of ['title', 'declaredRange', 'rationale', 'provenance'] as const) {
      if (!isNonEmptyString(raw[key]))
        fail(`${at}.${key}`, 'missing or empty')
    }
    for (const key of ['dependent', 'peer'] as const) {
      const name = raw[key]
      if (typeof name !== 'string' || !PACKAGE_NAME_PATTERN.test(name))
        fail(`${at}.${key}`, `not a package name: ${String(name)}`)
    }
    if (typeof raw.optional !== 'boolean')
      fail(`${at}.optional`, 'not a boolean')

    const peer = typeof raw.peer === 'string' ? raw.peer : ''
    const id = raw.id
    if (!isNonEmptyString(id)) {
      fail(`${at}.id`, 'missing or empty')
    }
    else {
      if (seen.has(id))
        fail(`${at}.id`, `duplicate id ${id}`)
      seen.add(id)
      if (!PEER_FIXTURE_ID_PATTERN.test(id))
        fail(`${at}.id`, `not peer.{peer}.{case} in lowercase kebab segments: ${id}`)
      else if (peer !== '' && id.split('.')[1] !== peerSlug(peer))
        fail(`${at}.id`, `the middle segment must be "${peerSlug(peer)}" so the id names its peer`)
    }

    const state = raw.state
    if (typeof state !== 'string' || !PEER_STATES.includes(state as PeerState))
      fail(`${at}.state`, `not a PeerState: ${String(state)}`)

    const installed = raw.installedVersion
    if (state === 'absent') {
      if (installed !== null)
        fail(`${at}.installedVersion`, 'must be null when the peer is absent')
    }
    else if (typeof installed !== 'string' || !EXACT_VERSION_PATTERN.test(installed)) {
      fail(`${at}.installedVersion`, `must be an exact x.y.z version when the peer is ${String(state)}`)
    }

    const diagnostics = raw.diagnostics
    if (!Array.isArray(diagnostics)) {
      fail(`${at}.diagnostics`, 'not an array')
      return
    }
    if (diagnostics.length === 0 && (state === 'absent' || state === 'incompatible'))
      fail(`${at}.diagnostics`, `empty — a ${String(state)} peer is exactly when the consumer must be told`)

    diagnostics.forEach((diagnostic, position) => {
      const where = `${at}.diagnostics[${position}]`
      if (!isRecord(diagnostic)) {
        fail(where, 'not an object')
        return
      }
      checkKnownKeys(diagnostic, DIAGNOSTIC_KEYS, where, fail)
      if (!PEER_DIAGNOSTIC_STAGES.includes(diagnostic.stage as PeerDiagnosticStage))
        fail(`${where}.stage`, `not a PeerDiagnosticStage: ${String(diagnostic.stage)}`)
      if (diagnostic.severity !== 'error' && diagnostic.severity !== 'warning')
        fail(`${where}.severity`, `not error or warning: ${String(diagnostic.severity)}`)
      const mustContain = diagnostic.mustContain
      if (!Array.isArray(mustContain) || mustContain.length === 0 || !mustContain.every(isNonEmptyString)) {
        fail(`${where}.mustContain`, 'must be a non-empty list of non-empty strings')
      }
      else if (peer !== '' && !mustContain.some(text => text.includes(peer))) {
        fail(`${where}.mustContain`, `must name the peer "${peer}" — a diagnostic that does not say which package is not actionable`)
      }
    })
  })

  return problems
}

/** {@link checkCorpusFile}, throwing. */
export function assertCorpusFile(value: unknown, path = '<corpus>'): SecurityCorpusFile {
  const problems = checkCorpusFile(value, path)
  if (problems.length > 0) {
    throw new Error(
      `security corpus ${path} violates schema ${SECURITY_CORPUS_SCHEMA_VERSION}:\n${
        problems.map(p => `  ${p.path}: ${p.message}`).join('\n')}`,
    )
  }
  return value as SecurityCorpusFile
}

/** {@link checkPeerCompatibilityFile}, throwing. */
export function assertPeerCompatibilityFile(value: unknown, path = '<peer-compatibility>'): PeerCompatibilityFile {
  const problems = checkPeerCompatibilityFile(value, path)
  if (problems.length > 0) {
    throw new Error(
      `peer-compatibility fixtures ${path} violate schema ${SECURITY_CORPUS_SCHEMA_VERSION}:\n${
        problems.map(p => `  ${p.path}: ${p.message}`).join('\n')}`,
    )
  }
  return value as PeerCompatibilityFile
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Where the `.corpus.json` files live, resolved from this module.
 *
 * `../security-corpus` from `src/security-corpus.ts` **and** from
 * `dist/security-corpus.js` is the same directory, which is why the data sits
 * beside `src/` rather than inside it: source and built consumers read one
 * copy, and nothing has to be copied at build time to keep them agreeing.
 */
export const SECURITY_CORPUS_DIR: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'security-corpus',
)

/**
 * The published JSON Schema (draft-07) for a `.corpus.json` file.
 *
 * Ships in the package tarball beside the data, so another repository points
 * a file's `$schema` at `node_modules/@dzup-ui/testing/security-corpus/…` and
 * its editor validates while the fixture is written. {@link checkCorpusFile}
 * stays the authority; the schema cannot express unique ids.
 */
export const SECURITY_CORPUS_SCHEMA_FILE: string = join(SECURITY_CORPUS_DIR, 'security-corpus.schema.json')

/** The published JSON Schema (draft-07) for the peer-compatibility fixture file. */
export const PEER_COMPATIBILITY_SCHEMA_FILE: string = join(SECURITY_CORPUS_DIR, 'peer-compatibility.schema.json')

/** The peer-compatibility fixture file's name inside {@link SECURITY_CORPUS_DIR}. */
export const PEER_COMPATIBILITY_FILE_NAME = 'peer-compatibility.fixtures.json'

/** Read and validate the peer-compatibility fixtures. Throws with every violation listed. */
export function loadPeerCompatibilityFixtures(): PeerCompatibilityFixture[] {
  const parsed: unknown = JSON.parse(readFileSync(join(SECURITY_CORPUS_DIR, PEER_COMPATIBILITY_FILE_NAME), 'utf8'))
  return [...assertPeerCompatibilityFile(parsed, PEER_COMPATIBILITY_FILE_NAME).fixtures]
}

/**
 * The input a fixture actually represents.
 *
 * The one function every consumer must go through, in either repository.
 * Reading `fixture.payload` directly is correct for every fixture that has no
 * `repeat` and silently wrong for every one that does, which is the worst
 * possible failure mode for a security fixture: the oversized case still runs,
 * still passes, and stopped being oversized.
 */
export function payloadOf(fixture: SecurityFixture): string {
  return fixture.payload.repeat(fixture.repeat ?? 1)
}

/** The file a category is stored in. */
export function corpusFileName(category: SecurityCategory): string {
  return `${category}.corpus.json`
}

/** Read and validate one category. Throws with every violation listed. */
export function loadSecurityCorpus(category: SecurityCategory): SecurityCorpusFile {
  const file = join(SECURITY_CORPUS_DIR, corpusFileName(category))
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'))
  return assertCorpusFile(parsed, corpusFileName(category))
}

/** Every `.corpus.json` on disk, by file name — including any this module's enum does not know. */
export function listSecurityCorpusFiles(): string[] {
  return readdirSync(SECURITY_CORPUS_DIR)
    .filter(name => name.endsWith('.corpus.json'))
    .sort()
}

/** Every fixture of every category, in category order then file order. */
export function loadAllSecurityFixtures(): SecurityFixture[] {
  return SECURITY_CATEGORIES.flatMap(category => [...loadSecurityCorpus(category).fixtures])
}

/**
 * The fixtures a sink owes an outcome for, from the given categories.
 *
 * This is the call a component spec makes: "I am a `navigation` sink and my
 * boundary is `url`, give me the cases that say something about me." A fixture
 * whose `outcomes` map has no entry for the sink is left out — silence is not
 * permission, and asserting nothing is better than asserting a default.
 */
export function fixturesForSink(
  sink: SecuritySink,
  categories: readonly SecurityCategory[],
): Array<SecurityFixture & { readonly required: NeutralizationOutcome }> {
  const out: Array<SecurityFixture & { readonly required: NeutralizationOutcome }> = []
  for (const category of categories) {
    for (const fixture of loadSecurityCorpus(category).fixtures) {
      const required = fixture.outcomes[sink]
      if (required !== undefined)
        out.push({ ...fixture, required })
    }
  }
  return out
}
