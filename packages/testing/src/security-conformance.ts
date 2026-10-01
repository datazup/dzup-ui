/**
 * The security-corpus **conformance runner** (TASK-S3-O3).
 *
 * ── What this adds to the corpus ────────────────────────────────────────────
 * `./security-corpus.ts` (TASK-N1-O5, schema 1.1.0 by TASK-R3-O4) publishes one
 * fixture _format_: one hostile input, and per sink kind the outcome that sink
 * owes. A format is a description. Any implementation of `DzSanitizerAdapter` — this
 * repository's own escaping default, or whatever a host installs through the
 * ADR-20 provider seam — can claim to honour it, and before this module nothing
 * checked. That is the drift the central adapter was introduced to prevent,
 * recreated one level up: an interface anyone can implement, with correctness
 * asserted rather than measured.
 *
 * This module runs the corpus **against the interface**. It takes any adapter
 * that satisfies {@link ConformanceAdapter} structurally, feeds it every fixture
 * that speaks to a sink the adapter is the guard for, classifies what came back
 * into a {@link ConformanceVerdict}, and reports per fixture × sink.
 *
 * ── Why classes and not strings ─────────────────────────────────────────────
 * Two conforming sanitizers legitimately differ in whitespace, attribute order,
 * entity spelling (`&#39;` vs `&apos;`) and whether they keep an empty
 * attribute. An exact-output assertion would go red on a DOMPurify patch release
 * and be deleted within a month, which is worse than not having it. So the
 * runner asserts what class of thing happened, never the bytes.
 *
 * ── Why the runner may report only these three sinks ────────────────────────
 * {@link SANITIZER_SINKS} are the corpus sinks whose guard **is**
 * `DzSanitizerAdapter.sanitize()`. A `navigation` sink is guarded by the URL
 * policy (TASK-R2-O4), a `file` sink by the upload policy, a `text` sink by the
 * framework's own escaping — asking a sanitizer about those would produce a
 * number that looks like evidence and is not. Core's `security/boundary-suites.ts`
 * is the reader for those, against real components.
 *
 * Of the three, only `html` hands the adapter the fixture payload itself. For
 * `markdown` and `mermaid-svg` the payload is **source for a renderer**, and the
 * HTML the adapter sees is whatever that renderer produced; this repository
 * publishes no Markdown or Mermaid renderer. Those cells are therefore
 * **unasserted with a named reason** unless the caller supplies the renderer
 * through {@link SecurityConformanceOptions.renderers} — which is the form in
 * which a tier that does own a renderer makes them live, without this repository
 * importing a line of its source.
 *
 * ── Fail-closed, and why an empty run is a failure ─────────────────────────
 * A security suite that passes because it found nothing to test is the worst
 * outcome available: it is indistinguishable from a suite that ran. So the
 * runner **refuses** rather than returning a clean report when there is no
 * adapter ({@link MISSING_ADAPTER_REASON}) or when no cell could be asserted
 * ({@link EMPTY_APPLICABLE_SET_REASON}), and {@link SecurityConformanceReport.failClosed}
 * records the four properties every consumer should be able to read off a run:
 * an absent adapter is refused, a throwing adapter blocks, an adapter that
 * returns its input is reported non-conforming, and an empty applicable set is
 * refused.
 *
 * @module @dzup-ui/testing/security-conformance
 */

import type {
  NeutralizationOutcome,
  SecurityFixture,
  SecuritySink,
} from './security-corpus.js'
import {
  loadAllSecurityFixtures,
  payloadOf,
  SECURITY_CORPUS_SCHEMA_VERSION,
} from './security-corpus.js'

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/**
 * The runner's own contract version, semver.
 *
 * Distinct from both the corpus schema version and the corpus content version
 * because it answers a third question: *how* a verdict is decided. Bumped
 * **major** when a verdict classification or the satisfaction matrix changes
 * meaning, because a consumer's recorded reference then describes a measurement
 * this code no longer makes. Minor for a new verdict value or a new option.
 */
export const SECURITY_CONFORMANCE_RUNNER_VERSION = '1.0.0'

/**
 * The **content** version of the fixture corpus, semver — not the schema
 * version.
 *
 * `SECURITY_CORPUS_SCHEMA_VERSION` versions the *record shape*: what fields a
 * fixture has and what they mean. This versions *what the fixtures say*, which
 * is the thing a consumer's recorded conformance result is actually pinned to.
 * They move independently and conflating them is how a corpus gains nine
 * fixtures without a single downstream result looking out of date.
 *
 * The rule, per TASK-S3-O3:
 *
 * - **minor** — a fixture is added, or a rationale/provenance/title is improved.
 *   Additive: every previously recorded verdict is still correct, and a consumer
 *   sees new unrecorded cells rather than changed ones.
 * - **major** — an existing fixture's `outcomes` change, a fixture is removed,
 *   or an id is repurposed. Any recorded conformance result for the old version
 *   is now describing a different question, and must be re-run rather than
 *   re-read.
 *
 * History:
 * - `1.0.0` — the 34 fixtures shipped by TASK-N1-O5 and migrated by TASK-R3-O4.
 * - `1.1.0` — TASK-S3-O3 adds 5 fixtures for Form System spec doc 06 §10 and
 *   Graph & Flow spec doc 06 §"Security and trust boundary". Additive: no
 *   existing fixture's id, payload or outcomes changed.
 */
export const SECURITY_CORPUS_VERSION = '1.1.0'

/**
 * The fingerprint each released {@link SECURITY_CORPUS_VERSION} must have.
 *
 * This is what gives the content version teeth. A fixture edit changes
 * {@link corpusFingerprint}; if the version was not bumped, the entry below no
 * longer matches and `security-conformance.spec.ts` goes red. If the version was
 * bumped without recording a fingerprint, the lookup misses and it goes red the
 * other way. Neither can be satisfied by editing the data alone, which is the
 * property a version is supposed to have.
 */
export const CORPUS_VERSION_FINGERPRINTS: Readonly<Record<string, string>> = {
  // 34 fixtures, as TASK-R3-O4 left them. Recorded by running the fingerprint
  // over today's corpus minus the five fixtures TASK-S3-O3 added, which is also
  // the proof that 1.1.0 is additive: nothing else had to change for 1.0.0's
  // digest to still be computable.
  '1.0.0': 'fce4570ca849fadf19b082968379836b',
  // 39 fixtures.
  '1.1.0': '5c0f0b50ff53c648eb056848ecf9b3a2',
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/**
 * The corpus sinks whose guard is `DzSanitizerAdapter.sanitize()`.
 *
 * Spelled exactly as `DzSanitizeSink`'s first two contexts in
 * `@dzup-ui/contracts` plus the corpus's `html`, so a sink registry row needs no
 * translation table. Anything else in {@link SecuritySink} is guarded by a
 * different mechanism and is not this runner's business — see the module note.
 */
export const SANITIZER_SINKS: readonly SecuritySink[] = ['html', 'markdown', 'mermaid-svg']

/**
 * The sinks whose payload **is** the string the adapter receives.
 *
 * `markdown` and `mermaid-svg` are not here: their payload is renderer source,
 * and the adapter sees the renderer's HTML output instead.
 */
export const DIRECT_SANITIZER_SINKS: readonly SecuritySink[] = ['html']

/**
 * What a run observed an adapter do. The measurement vocabulary, deliberately
 * **not** {@link NeutralizationOutcome} — that enumerates the outcomes a fixture
 * may *require*, and a measurement needs names for the answers no fixture would
 * ever ask for.
 *
 * - `blocked` — `sanitize()` threw. The value never reaches the sink. The
 *   strongest answer and the only one that satisfies a required `rejected`.
 * - `escaped` — the returned string builds no markup at all: every tag in the
 *   payload came back as text. Safe, and lossy by construction.
 * - `stripped` — the returned string is still markup, and no dangerous element,
 *   event attribute or executable URL scheme survived in it.
 * - `passed-through` — a dangerous construct survived. **Never conforming.**
 * - `unchanged` — the adapter returned its input byte for byte. A special case
 *   of `passed-through`, named separately because it is the one thing
 *   `DzSanitizerAdapter.sanitize` explicitly promises not to do ("It must never
 *   return its input unchanged"), so a consumer reading a report can tell a
 *   policy that is too permissive from a stub that was never wired up.
 */
export type ConformanceVerdict
  = | 'blocked'
    | 'escaped'
    | 'stripped'
    | 'passed-through'
    | 'unchanged'

/** Every {@link ConformanceVerdict}, safest first. */
export const CONFORMANCE_VERDICTS: readonly ConformanceVerdict[] = [
  'blocked',
  'escaped',
  'stripped',
  'passed-through',
  'unchanged',
]

/**
 * Which verdicts satisfy which required outcome.
 *
 * A **matrix and not an ordering**, on purpose.
 * `NEUTRALIZATION_OUTCOMES` is documented "strongest first" in the sense
 * of *how little of the value survives*, which is not the same as safety:
 * `escaped` sits after `stripped` in that list and yet removes strictly more
 * attack surface, because nothing is parsed as markup at all. Reading that list
 * as a safety ordering would report a correctly escaping adapter as a
 * regression.
 *
 * So, per required outcome:
 *
 * - `rejected` ← `blocked` only. The fixture says the value must not reach the
 *   sink; returning a sanitised string is a different thing, however safe.
 * - `stripped` ← `blocked`, `stripped`, or `escaped`. Escaping where stripping
 *   was required is **conforming but lossy** — the host asked for rich content
 *   and got text — so it is counted separately
 *   ({@link ConformanceCell.lossy}) rather than hidden inside a pass.
 * - `escaped` ← `blocked` or `escaped`. Deliberately **not** `stripped`: a value
 *   that must render as text and instead renders as sanitised markup has had its
 *   meaning changed, and that is how an option label becomes a link.
 *
 * `inert` and `admitted` are absent: both are claims about a *sink's* nature (an
 * `<img src>` cannot execute a `javascript:` URL; a URL allowlist deliberately
 * admits this host), not obligations a sanitizer can discharge. Cells requiring
 * them are reported unasserted with that reason.
 */
export const SATISFIED_BY: Readonly<Partial<Record<NeutralizationOutcome, readonly ConformanceVerdict[]>>> = {
  rejected: ['blocked'],
  stripped: ['blocked', 'stripped', 'escaped'],
  escaped: ['blocked', 'escaped'],
}

/** The required outcomes this runner can assert against an adapter. */
export const ASSERTABLE_OUTCOMES: readonly NeutralizationOutcome[] = ['rejected', 'stripped', 'escaped']

/** A verdict that satisfies a required `stripped` only by over-delivering. */
const LOSSY_FOR: Readonly<Partial<Record<NeutralizationOutcome, readonly ConformanceVerdict[]>>> = {
  stripped: ['escaped'],
}

// ---------------------------------------------------------------------------
// The adapter, structurally
// ---------------------------------------------------------------------------

/**
 * The part of `DzSanitizerAdapter` this runner uses.
 *
 * Accepted **structurally**, like `CheckableAnatomy` next door and for the
 * same two reasons: `@dzup-ui/testing` stays free of a dependency on
 * `@dzup-ui/contracts`, and — the reason that matters here — an adapter this
 * repository has never seen must be runnable. A real `DzSanitizerAdapter`
 * satisfies this by shape, which is all the check needs.
 */
export interface ConformanceAdapter {
  /** Trusted Types policy name; reported so a run names the policy it measured. */
  readonly policyName: string
  /** Ceilings applied before parsing. Reported, never asserted — the numbers are the host's. */
  readonly limits: { readonly maxLength: number, readonly maxDepth: number }
  /** Returns sanitised HTML, or throws. */
  sanitize: (html: string, context: ConformanceSanitizeContext) => string
}

/** The context the runner passes, matching `DzSanitizeContext`'s required fields. */
export interface ConformanceSanitizeContext {
  readonly sink: string
  readonly component: string
  readonly limits?: { readonly maxLength?: number, readonly maxDepth?: number }
  readonly trustedTypes?: boolean
}

/** The `component` every runner call identifies itself as, for adapter diagnostics. */
export const CONFORMANCE_COMPONENT = '@dzup-ui/testing:security-conformance'

// ---------------------------------------------------------------------------
// Refusals
// ---------------------------------------------------------------------------

/** Why a run with no adapter is refused rather than reported. */
export const MISSING_ADAPTER_REASON
  = 'no sanitizer adapter was supplied. A conformance run with nothing to measure has no verdict, '
    + 'and reporting one would be a fabricated result — the absent-adapter case is a fixture '
    + '(failClosed.absentAdapter), not a run.'

/** Why a run with nothing assertable is refused rather than reported green. */
export const EMPTY_APPLICABLE_SET_REASON
  = 'no fixture × sink cell could be asserted. A security suite that passes because it found '
    + 'nothing to test is indistinguishable from one that ran, so this refuses. Supply fixtures '
    + 'with an html/markdown/mermaid-svg outcome, or a renderer for the sinks that need one.'

/**
 * Thrown when the runner cannot produce a verdict.
 *
 * A distinct class so a caller can tell "the adapter is broken" (a red suite)
 * from "the run was not possible" (a refusal to be fixed or explicitly
 * dispositioned). Never caught inside this module.
 */
export class SecurityConformanceRefusal extends Error {
  constructor(reason: string) {
    super(`[dzup-ui] security conformance refused: ${reason}`)
    this.name = 'SecurityConformanceRefusal'
  }
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * Any start or end tag, however malformed the rest of it is.
 *
 * `<` immediately followed by an optional `/` and a name character, with no
 * whitespace allowed in between — which is not a simplification but the rule:
 * the HTML tokenizer treats `< div` as text and `</ div>` as a bogus comment,
 * so neither opens an element and neither belongs in this test.
 */
const ANY_TAG = /<\/?[a-z][a-z0-9-]*/i

/**
 * Constructs whose survival in an adapter's output is a failure, with the name
 * reported when one is found.
 *
 * Every entry is something that *executes or fetches*, not merely something
 * unusual: a gate that flags the unusual is turned off. The list is scanned
 * against the adapter's **output**, which is why it can be this short — the
 * input is known hostile, so the only question is what came back alive.
 */
const DANGEROUS_IN_OUTPUT: readonly { readonly name: string, readonly pattern: RegExp }[] = [
  { name: 'a script-bearing element', pattern: /<\s*(?:script|iframe|object|embed|frame|frameset|noscript|base|meta|link|form|template|annotation-xml)\b/i },
  { name: 'an event attribute', pattern: /\son[a-z]+\s*=/i },
  { name: 'an executable URL scheme in a URL attribute', pattern: /(?:href|src|xlink:href|action|formaction|srcdoc|poster|background|data)\s*=\s*(?:["']\s*)?(?:javascript|vbscript|livescript|data|file|blob)\s*:/i },
  { name: 'a legacy CSS expression', pattern: /expression\s*\(/i },
  { name: 'a CSS @import', pattern: /@import\b/i },
]

/**
 * An HTML comment in the output, checked **before** the no-markup shortcut.
 *
 * A comment is the one construct that is dangerous while carrying no live tag of
 * its own: `<!--<img src=x onerror=1>-->` renders nothing, and a downstream step
 * that re-parses the sanitised string brings the element back. That is the mXSS
 * class `markup-injection.comment.hidden-element` exists for, so it cannot sit
 * behind the "did any tag survive?" gate the rest of the scan sits behind.
 */
const SURVIVING_COMMENT = {
  name: 'an HTML comment (an mXSS carrier once the output is re-parsed)',
  pattern: /<!--/,
} as const

/**
 * A scheme that executes, written so a surviving tag plus a bare
 * `javascript:` anywhere in the output is treated as live.
 *
 * Conservative on purpose: the output is markup at this point, so a scheme the
 * attribute scan missed (an unquoted value, a namespaced attribute a future
 * parser honours) is reported rather than assumed inert.
 */
const EXECUTABLE_SCHEME = /(?:javascript|vbscript|livescript)\s*:/i

/** What {@link classifyVerdict} decided, and the sentence explaining it. */
export interface VerdictClassification {
  readonly verdict: ConformanceVerdict
  readonly detail: string
}

/**
 * Classify one adapter response.
 *
 * Exported and pure so the rules are unit-testable against hand-written
 * input/output pairs, without an adapter and without a DOM — the same split
 * `checkAnatomy` / `expectAnatomy` uses next door.
 *
 * @param input The string handed to the adapter (known hostile).
 * @param output What it returned, or the error it threw.
 */
export function classifyVerdict(input: string, output: { ok: true, value: string } | { ok: false, error: unknown }): VerdictClassification {
  if (!output.ok) {
    const error = output.error
    const name = error instanceof Error ? (error.name || 'Error') : typeof error
    const message = error instanceof Error ? error.message : String(error)
    return {
      verdict: 'blocked',
      detail: `sanitize() threw ${name}: ${message.slice(0, 160)}`,
    }
  }

  const value = output.value
  if (value === input)
    return { verdict: 'unchanged', detail: 'returned its input byte for byte' }

  // The comment check is ungated; see SURVIVING_COMMENT.
  if (SURVIVING_COMMENT.pattern.test(value))
    return { verdict: 'passed-through', detail: `${SURVIVING_COMMENT.name} survived: ${JSON.stringify(value.slice(0, 120))}` }

  // Everything below is gated on a surviving tag, and that gate is load-bearing
  // rather than an optimisation. An escaping adapter returns
  // `&lt;img src=x onerror=&quot;alert(1)&quot;&gt;`, in which the literal text
  // ` onerror=` is still present — it builds nothing, because no tag survived to
  // carry it. A scan that fired on that text would report every correctly
  // escaping adapter as `passed-through`, which is the failure mode that makes a
  // security gate get switched off.
  if (!ANY_TAG.test(value))
    return { verdict: 'escaped', detail: 'no tag survived — the output builds no markup' }

  for (const { name, pattern } of DANGEROUS_IN_OUTPUT) {
    if (pattern.test(value))
      return { verdict: 'passed-through', detail: `${name} survived: ${JSON.stringify(value.slice(0, 120))}` }
  }
  if (EXECUTABLE_SCHEME.test(value))
    return { verdict: 'passed-through', detail: `an executable scheme survived beside live markup: ${JSON.stringify(value.slice(0, 120))}` }

  return { verdict: 'stripped', detail: 'markup survived carrying no dangerous element, attribute or scheme' }
}

// ---------------------------------------------------------------------------
// Fingerprint
// ---------------------------------------------------------------------------

/**
 * A 128-bit FNV-1a digest of the corpus **content**, as hex.
 *
 * Change detection, not cryptography: it exists so a fixture edit cannot slip
 * past {@link SECURITY_CORPUS_VERSION}, and an adversary who can edit the corpus
 * can also edit the recorded fingerprint. Written by hand rather than with
 * `node:crypto` so the module keeps `security-corpus.ts`'s import surface and
 * stays readable from a browser bundle after tree-shaking the loader away.
 *
 * Canonical form: fixtures sorted by id, then `id|payload|repeat|sink=outcome,…`
 * with sinks sorted. Title, rationale and provenance are **excluded** — they are
 * prose, and a typo fix in a rationale is not a corpus verdict change.
 */
export function corpusFingerprint(fixtures: readonly SecurityFixture[]): string {
  const canonical = [...fixtures]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((fixture) => {
      const outcomes = Object.entries(fixture.outcomes)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([sink, outcome]) => `${sink}=${String(outcome)}`)
        .join(',')
      return `${fixture.id}|${fixture.payload}|${fixture.repeat ?? 1}|${outcomes}`
    })
    .join('\n')

  // Four interleaved FNV-1a 32-bit lanes; 32 bits alone collides on a corpus
  // this small often enough to matter for a gate people are meant to trust.
  const lanes = [0x811C9DC5, 0x01000193, 0x7B5F1C29, 0x2545F491]
  for (let i = 0; i < canonical.length; i += 1) {
    const code = canonical.charCodeAt(i)
    for (let lane = 0; lane < lanes.length; lane += 1) {
      lanes[lane] = (lanes[lane]! ^ (code + lane)) >>> 0
      lanes[lane] = Math.imul(lanes[lane]!, 0x01000193) >>> 0
    }
  }
  return lanes.map(lane => lane.toString(16).padStart(8, '0')).join('')
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

/** One fixture × sink the runner asserted. */
export interface ConformanceCell {
  readonly fixtureId: string
  readonly sink: SecuritySink
  readonly required: NeutralizationOutcome
  readonly verdict: ConformanceVerdict
  readonly conforms: boolean
  /** Conforming, but by over-delivering — `escaped` where `stripped` was required. */
  readonly lossy: boolean
  readonly detail: string
}

/** One fixture × sink the runner could **not** assert, and why. */
export interface UnassertedCell {
  readonly fixtureId: string
  readonly sink: SecuritySink
  readonly required: NeutralizationOutcome
  readonly reason: string
}

/** The three fail-closed properties every run records. */
export interface FailClosedRecord {
  /** `refused` — a run with no adapter throws {@link SecurityConformanceRefusal}. */
  readonly absentAdapter: 'refused' | 'NOT FAIL-CLOSED'
  /** `blocked` — an adapter that throws for every input blocks every cell. */
  readonly throwingAdapter: 'blocked' | 'NOT FAIL-CLOSED'
  /** `non-conforming` — an adapter that returns its input is reported, never passed. */
  readonly identityAdapter: 'non-conforming' | 'NOT FAIL-CLOSED'
  /** `refused` — a run with nothing assertable throws rather than reporting green. */
  readonly emptyApplicableSet: 'refused' | 'NOT FAIL-CLOSED'
}

/** What one run measured. The shape a consumer records as its reference. */
export interface SecurityConformanceReport {
  readonly runner: string
  readonly runnerVersion: string
  readonly corpusVersion: string
  readonly corpusSchemaVersion: string
  readonly corpusFingerprint: string
  /** How the adapter identifies itself; supplied by the caller, never guessed. */
  readonly adapter: string
  readonly policyName: string
  readonly limits: { readonly maxLength: number, readonly maxDepth: number }
  /** Commit the measured tree was at, when the caller knows it. */
  readonly sourceCommit?: string
  readonly fixtures: number
  readonly cells: number
  readonly counts: Readonly<Record<ConformanceVerdict, number>>
  readonly lossy: number
  readonly nonConforming: number
  readonly unasserted: readonly UnassertedCell[]
  readonly failClosed: FailClosedRecord
  /** `"<fixtureId>:<sink>" → verdict`, sorted. The thing a drift gate diffs. */
  readonly verdicts: Readonly<Record<string, ConformanceVerdict>>
  readonly cellDetail: readonly ConformanceCell[]
}

/** Options for {@link runSecurityConformance}. */
export interface SecurityConformanceOptions {
  /**
   * How the adapter identifies itself in the report, e.g.
   * `"@dzup-ui/core:dzup-ui (seam-resolved escaping default)"`. Required in
   * spirit: a reference stamped `"unknown"` cannot be compared with anything.
   */
  readonly adapterName?: string
  /** The commit the measured tree is at, when the caller knows it. */
  readonly sourceCommit?: string
  /** Fixtures to run. Defaults to every fixture of every category on disk. */
  readonly fixtures?: readonly SecurityFixture[]
  /**
   * Renderers for the sinks whose payload is source rather than HTML.
   *
   * Supplying one turns that sink's cells from unasserted into measured. This is
   * the whole seam by which a tier that owns a Markdown or Mermaid renderer
   * proves conformance against this corpus without this package importing it.
   */
  readonly renderers?: Partial<Record<SecuritySink, (source: string) => string>>
}

function call(adapter: ConformanceAdapter, html: string, sink: SecuritySink): { ok: true, value: string } | { ok: false, error: unknown } {
  try {
    return { ok: true, value: adapter.sanitize(html, { sink, component: CONFORMANCE_COMPONENT }) }
  }
  catch (error) {
    return { ok: false, error }
  }
}

/** An adapter that throws for every input — the `throwingAdapter` fixture. */
const THROWING_ADAPTER: ConformanceAdapter = {
  policyName: 'fail-closed-probe',
  limits: { maxLength: 1, maxDepth: 1 },
  sanitize: () => {
    throw new Error('fail-closed probe: this adapter always throws')
  },
}

/** An adapter that returns its input — the `identityAdapter` fixture. */
const IDENTITY_ADAPTER: ConformanceAdapter = {
  policyName: 'identity-probe',
  limits: { maxLength: Number.MAX_SAFE_INTEGER, maxDepth: Number.MAX_SAFE_INTEGER },
  sanitize: (html: string) => html,
}

/**
 * Every (fixture, sink, required) the runner will look at, before renderers are
 * considered.
 *
 * A fixture that names no sanitizer sink is not in the result at all — it is not
 * this runner's business and counting it as skipped would inflate the denominator
 * with cells nobody ever intended to assert.
 */
export function applicableCells(
  fixtures: readonly SecurityFixture[],
): readonly { readonly fixture: SecurityFixture, readonly sink: SecuritySink, readonly required: NeutralizationOutcome }[] {
  const cells: { fixture: SecurityFixture, sink: SecuritySink, required: NeutralizationOutcome }[] = []
  for (const fixture of fixtures) {
    for (const sink of SANITIZER_SINKS) {
      const required = fixture.outcomes[sink]
      if (required !== undefined)
        cells.push({ fixture, sink, required })
    }
  }
  return cells
}

/**
 * Run the corpus against one adapter.
 *
 * @param adapter Any `DzSanitizerAdapter`-shaped object. `null`/`undefined` is
 * **refused**, not defaulted — see {@link MISSING_ADAPTER_REASON}.
 * @throws {SecurityConformanceRefusal} when there is no adapter, or when no cell
 * could be asserted.
 */
export function runSecurityConformance(
  adapter: ConformanceAdapter | null | undefined,
  options: SecurityConformanceOptions = {},
): SecurityConformanceReport {
  if (adapter === null || adapter === undefined)
    throw new SecurityConformanceRefusal(MISSING_ADAPTER_REASON)

  const fixtures = options.fixtures ?? loadAllSecurityFixtures()
  const renderers = options.renderers ?? {}
  const cells: ConformanceCell[] = []
  const unasserted: UnassertedCell[] = []
  const counts: Record<ConformanceVerdict, number> = {
    'blocked': 0,
    'escaped': 0,
    'stripped': 0,
    'passed-through': 0,
    'unchanged': 0,
  }

  for (const { fixture, sink, required } of applicableCells(fixtures)) {
    if (!ASSERTABLE_OUTCOMES.includes(required)) {
      unasserted.push({
        fixtureId: fixture.id,
        sink,
        required,
        reason: `required outcome "${required}" is a claim about the sink's nature, not an obligation a `
          + 'sanitizer can discharge; no adapter can report it, so asserting it here would be a fabricated verdict',
      })
      continue
    }

    let input = payloadOf(fixture)
    if (!DIRECT_SANITIZER_SINKS.includes(sink)) {
      const render = renderers[sink]
      if (render === undefined) {
        unasserted.push({
          fixtureId: fixture.id,
          sink,
          required,
          reason: `the "${sink}" sink's payload is renderer source, not the HTML the adapter receives; `
            + `this run supplied no "${sink}" renderer through options.renderers, so the cell is `
            + 'UNASSERTED — it is not passing',
        })
        continue
      }
      try {
        input = render(input)
      }
      catch (error) {
        unasserted.push({
          fixtureId: fixture.id,
          sink,
          required,
          reason: `the supplied "${sink}" renderer threw before the adapter was reached: `
            + `${error instanceof Error ? error.message : String(error)}`,
        })
        continue
      }
    }

    const { verdict, detail } = classifyVerdict(input, call(adapter, input, sink))
    const accepted = SATISFIED_BY[required] ?? []
    const conforms = accepted.includes(verdict)
    const lossy = conforms && (LOSSY_FOR[required] ?? []).includes(verdict)
    counts[verdict] += 1
    cells.push({ fixtureId: fixture.id, sink, required, verdict, conforms, lossy, detail })
  }

  if (cells.length === 0)
    throw new SecurityConformanceRefusal(EMPTY_APPLICABLE_SET_REASON)

  const verdicts: Record<string, ConformanceVerdict> = {}
  for (const cell of [...cells].sort((a, b) => (`${a.fixtureId}:${a.sink}` < `${b.fixtureId}:${b.sink}` ? -1 : 1)))
    verdicts[`${cell.fixtureId}:${cell.sink}`] = cell.verdict

  return {
    runner: '@dzup-ui/testing/security-conformance',
    runnerVersion: SECURITY_CONFORMANCE_RUNNER_VERSION,
    corpusVersion: SECURITY_CORPUS_VERSION,
    corpusSchemaVersion: SECURITY_CORPUS_SCHEMA_VERSION,
    corpusFingerprint: corpusFingerprint(fixtures),
    adapter: options.adapterName ?? 'unnamed adapter',
    policyName: adapter.policyName,
    limits: { maxLength: adapter.limits.maxLength, maxDepth: adapter.limits.maxDepth },
    ...(options.sourceCommit === undefined ? {} : { sourceCommit: options.sourceCommit }),
    fixtures: new Set(cells.map(cell => cell.fixtureId)).size,
    cells: cells.length,
    counts,
    lossy: cells.filter(cell => cell.lossy).length,
    nonConforming: cells.filter(cell => !cell.conforms).length,
    unasserted,
    failClosed: measureFailClosed(fixtures, renderers),
    verdicts,
    cellDetail: cells,
  }
}

/**
 * Measure the three fail-closed properties, by running them.
 *
 * Not asserted from a comment: each value below is the result of actually doing
 * the thing. `absentAdapter` and `emptyApplicableSet` are `refused` only if the
 * runner really threw; `throwingAdapter` is `blocked` only if every cell of a
 * throwing adapter came back blocked; `identityAdapter` is `non-conforming` only
 * if the identity adapter really failed. A report whose `failClosed` reads
 * `NOT FAIL-CLOSED` anywhere is the highest-priority failure in the run.
 */
function measureFailClosed(
  fixtures: readonly SecurityFixture[],
  renderers: Partial<Record<SecuritySink, (source: string) => string>>,
): FailClosedRecord {
  let absentAdapter: FailClosedRecord['absentAdapter'] = 'NOT FAIL-CLOSED'
  try {
    runSecurityConformance(null, { fixtures, renderers, adapterName: 'fail-closed probe: absent' })
  }
  catch (error) {
    if (error instanceof SecurityConformanceRefusal && error.message.includes('no sanitizer adapter'))
      absentAdapter = 'refused'
  }

  let emptyApplicableSet: FailClosedRecord['emptyApplicableSet'] = 'NOT FAIL-CLOSED'
  try {
    runSecurityConformance(THROWING_ADAPTER, { fixtures: [], adapterName: 'fail-closed probe: empty' })
  }
  catch (error) {
    if (error instanceof SecurityConformanceRefusal && error.message.includes('no fixture × sink cell'))
      emptyApplicableSet = 'refused'
  }

  const thrown = probeCells(THROWING_ADAPTER, fixtures, renderers)
  const throwingAdapter: FailClosedRecord['throwingAdapter']
    = thrown.cells > 0 && thrown.counts.blocked === thrown.cells && thrown.nonConforming === 0
      ? 'blocked'
      : 'NOT FAIL-CLOSED'

  const identity = probeCells(IDENTITY_ADAPTER, fixtures, renderers)
  const identityAdapter: FailClosedRecord['identityAdapter']
    = identity.cells > 0 && identity.nonConforming === identity.cells
      ? 'non-conforming'
      : 'NOT FAIL-CLOSED'

  return { absentAdapter, throwingAdapter, identityAdapter, emptyApplicableSet }
}

/** The cell loop without the fail-closed probes — the recursion base. */
function probeCells(
  adapter: ConformanceAdapter,
  fixtures: readonly SecurityFixture[],
  renderers: Partial<Record<SecuritySink, (source: string) => string>>,
): { cells: number, counts: Record<ConformanceVerdict, number>, nonConforming: number } {
  const counts: Record<ConformanceVerdict, number> = {
    'blocked': 0,
    'escaped': 0,
    'stripped': 0,
    'passed-through': 0,
    'unchanged': 0,
  }
  let cells = 0
  let nonConforming = 0

  for (const { fixture, sink, required } of applicableCells(fixtures)) {
    if (!ASSERTABLE_OUTCOMES.includes(required))
      continue
    let input = payloadOf(fixture)
    if (!DIRECT_SANITIZER_SINKS.includes(sink)) {
      const render = renderers[sink]
      if (render === undefined)
        continue
      try {
        input = render(input)
      }
      catch {
        continue
      }
    }
    const { verdict } = classifyVerdict(input, call(adapter, input, sink))
    counts[verdict] += 1
    cells += 1
    if (!(SATISFIED_BY[required] ?? []).includes(verdict))
      nonConforming += 1
  }

  return { cells, counts, nonConforming }
}

// ---------------------------------------------------------------------------
// Assertion
// ---------------------------------------------------------------------------

/**
 * Assert that an adapter conforms.
 *
 * Runner-independent, like `expectAnatomy`: no `expect`, no vitest import. It
 * throws with **every** failing cell in one message, because an adapter that
 * regressed on four fixtures should report four rather than the first one and
 * then a rerun.
 *
 * @throws {Error} when any cell is non-conforming, or when any fail-closed
 * property does not hold.
 */
export function expectSecurityConformance(report: SecurityConformanceReport): void {
  const problems: string[] = []

  for (const [property, value] of Object.entries(report.failClosed)) {
    if (value === 'NOT FAIL-CLOSED') {
      problems.push(
        `fail-closed property "${property}" does not hold. This outranks every other failure in `
        + 'this run: it means the runner itself can report a pass for an adapter that is absent, '
        + 'broken or a stub.',
      )
    }
  }

  for (const cell of report.cellDetail) {
    if (cell.conforms)
      continue
    problems.push(
      `${cell.fixtureId} in a ${cell.sink} sink requires "${cell.required}"; the adapter `
      + `"${report.adapter}" measured "${cell.verdict}" (${cell.detail})`,
    )
  }

  if (problems.length > 0) {
    throw new Error(
      `${report.adapter} does not conform to security corpus ${report.corpusVersion} `
      + `(runner ${report.runnerVersion}, ${report.cells} cell(s), ${problems.length} problem(s)):\n${
        problems.map(problem => `  - ${problem}`).join('\n')}`,
    )
  }
}

/** A one-line summary for a spec or a gate to print. Never a verdict by itself. */
export function formatConformanceReport(report: SecurityConformanceReport): string {
  const counts = CONFORMANCE_VERDICTS.map(verdict => `${verdict} ${report.counts[verdict]}`).join(' · ')
  return `${report.adapter} vs corpus ${report.corpusVersion} (schema ${report.corpusSchemaVersion}, `
    + `fingerprint ${report.corpusFingerprint}): ${report.cells} cell(s) over ${report.fixtures} fixture(s) — `
    + `${counts}; lossy ${report.lossy}; non-conforming ${report.nonConforming}; `
    + `unasserted ${report.unasserted.length}; fail-closed `
    + `absent=${report.failClosed.absentAdapter} throwing=${report.failClosed.throwingAdapter} `
    + `identity=${report.failClosed.identityAdapter} empty=${report.failClosed.emptyApplicableSet}`
}
