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
 * Never "does not crash". The four values in {@link NeutralizationOutcome} are
 * all observable in a DOM assertion, and three of them are checkable without a
 * browser. `inert` is the one that needs a stated reason, so
 * {@link SecurityFixture.rationale} is required rather than optional.
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
 * category/sink value. A file whose `schemaVersion` major does not match this
 * one is rejected by {@link assertCorpusFile} rather than best-effort parsed.
 */
export const SECURITY_CORPUS_SCHEMA_VERSION = '1.0.0'

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
 */
export type NeutralizationOutcome = 'rejected' | 'stripped' | 'escaped' | 'inert'

/** Every {@link NeutralizationOutcome}, strongest first. */
export const NEUTRALIZATION_OUTCOMES: readonly NeutralizationOutcome[] = [
  'rejected',
  'stripped',
  'escaped',
  'inert',
]

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
  /** Why those outcomes, in particular why any `inert` is genuinely inert. */
  readonly rationale: string
  /** Where the case comes from, so nobody has to trust that it is representative. */
  readonly provenance: string
}

/** One corpus file: every fixture of a single category. */
export interface SecurityCorpusFile {
  readonly schemaVersion: string
  readonly category: SecurityCategory
  readonly description: string
  readonly fixtures: readonly SecurityFixture[]
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

/**
 * Check one parsed corpus file against the schema.
 *
 * Returns every violation rather than throwing on the first, because the
 * caller is a spec listing what is wrong with a data file and stopping at the
 * first bad fixture would turn one fix into six runs.
 */
export function checkCorpusFile(value: unknown, path = '<corpus>'): CorpusViolation[] {
  const problems: CorpusViolation[] = []
  const fail = (at: string, message: string): void => {
    problems.push({ path: at, message })
  }

  if (!isRecord(value)) {
    fail(path, 'not an object')
    return problems
  }

  const version = value.schemaVersion
  if (typeof version !== 'string')
    fail(`${path}.schemaVersion`, 'missing')
  else if (majorOf(version) !== majorOf(SECURITY_CORPUS_SCHEMA_VERSION))
    fail(`${path}.schemaVersion`, `major ${majorOf(version)} != ${majorOf(SECURITY_CORPUS_SCHEMA_VERSION)}`)

  const category = value.category
  if (typeof category !== 'string' || !SECURITY_CATEGORIES.includes(category as SecurityCategory))
    fail(`${path}.category`, `not a SecurityCategory: ${String(category)}`)

  if (typeof value.description !== 'string' || value.description.trim() === '')
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
    const id = raw.id
    if (typeof id !== 'string' || id.trim() === '') {
      fail(`${at}.id`, 'missing or empty')
    }
    else {
      if (seen.has(id))
        fail(`${at}.id`, `duplicate id ${id}`)
      seen.add(id)
      if (typeof category === 'string' && !id.startsWith(`${category}.`))
        fail(`${at}.id`, `id must start with "${category}." so a bare id names its category`)
    }
    if (raw.category !== category)
      fail(`${at}.category`, `disagrees with the file (${String(raw.category)} vs ${String(category)})`)
    if (typeof raw.title !== 'string' || raw.title.trim() === '')
      fail(`${at}.title`, 'missing or empty')
    if (typeof raw.payload !== 'string' || raw.payload === '')
      fail(`${at}.payload`, 'missing or empty')
    if (raw.repeat !== undefined && (typeof raw.repeat !== 'number' || !Number.isInteger(raw.repeat) || raw.repeat < 1))
      fail(`${at}.repeat`, 'not a positive integer')
    if (typeof raw.rationale !== 'string' || raw.rationale.trim() === '')
      fail(`${at}.rationale`, 'missing or empty')
    if (typeof raw.provenance !== 'string' || raw.provenance.trim() === '')
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
