/**
 * The corpus-driven suites every `SecurityBoundary` declarer runs (TASK-N1-O5).
 *
 * Not a `.spec.ts`: this file is the machinery, and the per-component spec
 * files beside it are the bindings — "here is my component, here is the prop
 * that reaches my sink, here is the sink kind". Payload strings live in
 * `@dzup-ui/testing/security-corpus` and appear nowhere in either.
 *
 * ── What a suite asserts ────────────────────────────────────────────────────
 * For every fixture that states an outcome for this component's sink, the
 * suite renders the payload, **measures** what the DOM actually did with it,
 * and compares that to the required outcome — unless the deviation register
 * (`security-deviations.json`) records that this component does not meet it,
 * in which case it asserts the **recorded measurement instead**. Both
 * directions then fail: a component that regresses further fails, and a
 * component that gets fixed fails until its deviation entry is deleted and the
 * ceiling lowered. A recorded deviation is a defect that cannot rot.
 *
 * ── Why measurement and not `expect(html).not.toContain(...)` ───────────────
 * `wrapper.html()` re-serializes, so a text node holding a correctly escaped
 * `<img … onerror=…>` still *contains the string* `onerror`. An assertion on
 * the serialized string fails the component that got it right and passes the
 * one that concatenated into an attribute. Everything here reads the DOM.
 *
 * ── Scope ───────────────────────────────────────────────────────────────────
 * Defensive. {@link effectiveScheme} exists to decide whether a rendered URL
 * would be followed as script; it normalizes exactly what the URL parser
 * normalizes and it produces nothing.
 *
 * @module
 */

import type { SecurityCategory, SecurityFixture, SecuritySink } from '@dzup-ui/testing'
import type { VueWrapper } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

// ---------------------------------------------------------------------------
// Measured outcomes
// ---------------------------------------------------------------------------

/**
 * What a run actually observed.
 *
 * `passed-through` is the one value the corpus schema deliberately does not
 * have: `NeutralizationOutcome` in the corpus schema enumerates the SAFE
 * answers, and a measurement needs a name for the unsafe one.
 */
export type MeasuredOutcome
  = | 'rejected'
    | 'stripped'
    | 'escaped'
    | 'inert'
    | 'passed-through'

/** Schemes that make a navigation sink an execution sink. */
const EXECUTABLE_SCHEMES = new Set(['javascript', 'vbscript', 'data', 'file', 'blob'])

/**
 * The scheme a browser would see, not the one the string starts with.
 *
 * The URL parser strips leading and trailing C0 controls and spaces, removes
 * tab/LF/CR from anywhere in the input, and compares schemes ASCII
 * case-insensitively (WHATWG URL §4.4). Three fixtures in the corpus exist
 * precisely because a check that skips any of those steps rejects the obvious
 * payload and admits its twin.
 *
 * @returns the lowercased scheme without its colon, or `null` when the value
 * is not absolute.
 */
export function effectiveScheme(raw: string): string | null {
  // Written with character codes rather than a regular expression on purpose:
  // the classes this needs are exactly the ones `no-control-regex` and
  // `regexp/no-obscure-range` exist to stop people writing by accident, and a
  // rule silenced for a security check is a rule silenced everywhere it is
  // pasted next. Same three steps as WHATWG URL §4.4.
  const isC0OrSpace = (code: number): boolean => code <= 0x20
  const isTabOrNewline = (code: number): boolean => code === 0x09 || code === 0x0A || code === 0x0D

  let start = 0
  let end = raw.length
  while (start < end && isC0OrSpace(raw.charCodeAt(start)))
    start += 1
  while (end > start && isC0OrSpace(raw.charCodeAt(end - 1)))
    end -= 1

  let stripped = ''
  for (let i = start; i < end; i += 1) {
    if (!isTabOrNewline(raw.charCodeAt(i)))
      stripped += raw[i]
  }

  const match = /^([a-z][a-z0-9+\-.]*):/i.exec(stripped)
  return match === null ? null : match[1]!.toLowerCase()
}

/** Every element in the tree, root included. `querySelectorAll` excludes the root. */
function elementsOf(root: Element): Element[] {
  return [root, ...root.querySelectorAll('*')]
}

/**
 * Elements a payload could only have produced by being parsed as markup.
 *
 * `svg` and `img` are on the list even though several components render them
 * legitimately, which is exactly why the check is a **diff against a baseline
 * render** rather than a presence test: the component's own icon is counted
 * once when it renders a harmless value, and only a second one is an injection.
 */
const INJECTED_TAGS = 'script, iframe, object, embed, svg, img, a, style, link'

/** What the component renders with a harmless value, so hostile runs can be diffed against it. */
interface Baseline {
  readonly tagCounts: ReadonlyMap<string, number>
  readonly handlerCount: number
}

function countTags(roots: readonly Element[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const root of roots) {
    for (const el of elementsOf(root)) {
      if (!el.matches(INJECTED_TAGS))
        continue
      const tag = el.tagName.toLowerCase()
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return counts
}

function countHandlers(roots: readonly Element[]): number {
  let n = 0
  for (const root of roots) {
    for (const el of elementsOf(root)) {
      for (const attr of el.attributes) {
        if (attr.name.toLowerCase().startsWith('on'))
          n += 1
      }
    }
  }
  return n
}

/**
 * What the payload built that the same component did not build on its own.
 *
 * A component fails either by creating a node or by attaching a handler to a
 * node it already had; a check for only one of those passes half the broken
 * components, so both are counted and both are diffed.
 */
function injectedArtifacts(roots: readonly Element[], baseline: Baseline): string[] {
  const found: string[] = []
  const handlers = countHandlers(roots)
  if (handlers > baseline.handlerCount)
    found.push(`${handlers - baseline.handlerCount} event attribute(s)`)
  for (const [tag, count] of countTags(roots)) {
    const allowed = baseline.tagCounts.get(tag) ?? 0
    if (count > allowed)
      found.push(`${count - allowed} extra <${tag}>`)
  }
  return found
}

function measureBaseline(roots: readonly Element[]): Baseline {
  return { tagCounts: countTags(roots), handlerCount: countHandlers(roots) }
}

// ---------------------------------------------------------------------------
// Bindings
// ---------------------------------------------------------------------------

/** How one component reaches one sink with one hostile value. */
export interface BoundaryBinding {
  /** The exported component name, exactly as the quality matrix spells it. */
  readonly component: string
  /** Which sink the payload lands in. Decides what "safe" means. */
  readonly sink: SecuritySink
  /** A sentence naming the prop and the element, for the failure message. */
  readonly via: string
  /**
   * Render the component with `payload` in the position that reaches the sink.
   * Returning a wrapper mounted into `document.body` is fine; the suite
   * unmounts and clears it.
   */
  readonly render: (payload: string) => VueWrapper<never> | Promise<VueWrapper<never>>
  /**
   * Find the element that received the value, or `null` when the component
   * declined to render it. `null` is how `rejected` is observed.
   */
  readonly locate: (root: Element) => Element | null
  /** Attribute the value lands on for `navigation` / `subresource` sinks. */
  readonly attribute?: string
  /** True when the component teleports; the suite then also scans `document.body`. */
  readonly teleports?: boolean
}

// ---------------------------------------------------------------------------
// The deviation register
// ---------------------------------------------------------------------------

/** One recorded failure to meet a required outcome. */
export interface SecurityDeviation {
  readonly id: string
  readonly component: string
  readonly sink: SecuritySink
  readonly fixtures: readonly string[]
  readonly required: string
  readonly measured: MeasuredOutcome
  readonly severity: 'critical' | 'high' | 'medium' | 'low'
  readonly publicBehaviourChange: boolean
  readonly reason: string
}

interface DeviationRegister {
  readonly schemaVersion: string
  readonly ceiling: number
  readonly deviations: readonly SecurityDeviation[]
}

const REGISTER_PATH = resolve(dirname(fileURLToPath(import.meta.url)), 'security-deviations.json')

/** The register, read once. Loud on a parse error rather than silently empty. */
export function loadDeviationRegister(): DeviationRegister {
  return JSON.parse(readFileSync(REGISTER_PATH, 'utf8')) as DeviationRegister
}

const register = loadDeviationRegister()

function deviationFor(
  component: string,
  sink: SecuritySink,
  fixtureId: string,
): SecurityDeviation | undefined {
  return register.deviations.find(
    d => d.component === component && d.sink === sink && d.fixtures.includes(fixtureId),
  )
}

/**
 * Every (component, sink, fixture) triple the register excuses.
 *
 * The ratchet counts triples rather than entries so that widening an existing
 * entry's `fixtures` array cannot hide new failures inside a row that already
 * existed.
 */
export function deviationTriples(): number {
  return register.deviations.reduce((n, d) => n + d.fixtures.length, 0)
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

function measure(
  binding: BoundaryBinding,
  root: Element,
  extraRoots: Element[],
  payload: string,
  baseline: Baseline,
): { outcome: MeasuredOutcome, detail: string } {
  const roots = [root, ...extraRoots]
  const target = binding.locate(root) ?? extraRoots.map(r => binding.locate(r)).find(Boolean) ?? null

  if (binding.sink === 'navigation' || binding.sink === 'subresource') {
    const attribute = binding.attribute ?? (binding.sink === 'navigation' ? 'href' : 'src')
    const value = target?.getAttribute(attribute) ?? null
    if (target === null || value === null || value === '')
      return { outcome: 'rejected', detail: `no ${attribute} rendered` }
    if (value !== payload)
      return { outcome: 'stripped', detail: `${attribute}=${JSON.stringify(value)}` }

    const artifacts = injectedArtifacts(roots, baseline)
    if (binding.sink === 'subresource') {
      // `inert` is only true while the value stays on an image element with no
      // handler built from it. If either changes, the fixture rationale that
      // licensed `inert` no longer applies and the outcome is not `inert`.
      const tag = target.tagName.toLowerCase()
      if (tag !== 'img' || artifacts.length > 0) {
        return {
          outcome: 'passed-through',
          detail: `value reached <${tag}>${artifacts.length > 0 ? ` and built ${artifacts.join(', ')}` : ''}`,
        }
      }
      return { outcome: 'inert', detail: `<img ${attribute}> carries it verbatim, no handler built` }
    }

    const scheme = effectiveScheme(value)
    if (scheme !== null && EXECUTABLE_SCHEMES.has(scheme)) {
      return {
        outcome: 'passed-through',
        detail: `<${target.tagName.toLowerCase()} ${attribute}> resolves to scheme "${scheme}:"`,
      }
    }
    return { outcome: 'rejected', detail: `${attribute} carries no executable scheme` }
  }

  // text / attribute / style / encoded-payload: the value is data or it is not.
  const artifacts = injectedArtifacts(roots, baseline)
  if (artifacts.length > 0)
    return { outcome: 'passed-through', detail: `built ${artifacts.join(', ')}` }

  if (binding.sink === 'encoded-payload') {
    const live = roots.flatMap(r => elementsOf(r)).filter((el) => {
      const href = el.getAttribute('href')
      const src = el.getAttribute('src')
      return href === payload || src === payload
    })
    if (live.length > 0)
      return { outcome: 'passed-through', detail: 'the encoded value is also a live URL in the page' }
    if (target === null)
      return { outcome: 'rejected', detail: 'nothing encoded' }
    return { outcome: 'inert', detail: 'encoded as geometry; never a URL in this document' }
  }

  const readable = roots.some(r => (r.textContent ?? '').includes(payload))
    || roots.some(r => elementsOf(r).some(el =>
      [...el.attributes].some(a => a.value.includes(payload)),
    ))
  if (!readable)
    return { outcome: 'rejected', detail: 'the value does not appear in the DOM at all' }
  return { outcome: 'escaped', detail: 'present verbatim as data; no element and no handler built' }
}

// ---------------------------------------------------------------------------
// The suites
// ---------------------------------------------------------------------------

async function withRender(
  binding: BoundaryBinding,
  payload: string,
): Promise<{ root: Element, extras: Element[], wrapper: VueWrapper<never> }> {
  const wrapper = await binding.render(payload)
  await nextTick()
  await nextTick()
  const extras = binding.teleports === true ? [document.body] : []
  return { root: wrapper.element as Element, extras, wrapper }
}

/**
 * Run one binding against every corpus fixture that speaks to its sink.
 *
 * `categories` is chosen by the caller from the component's declared boundary:
 * a `url` boundary owes `url-scheme`, and every component that renders a
 * host-supplied label also owes `markup-injection` and `degenerate-input`.
 */
export function runBoundarySuite(
  binding: BoundaryBinding,
  categories: readonly SecurityCategory[],
  title: string,
): void {
  const fixtures = fixturesForSink(binding.sink, categories)

  describe(`${binding.component} — ${title} (${binding.sink} sink: ${binding.via})`, () => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('has fixtures to run — an empty suite is not a passing one', () => {
      expect(fixtures.length).toBeGreaterThan(0)
    })

    for (const fixture of fixtures) {
      const required = fixture.required
      const deviation = deviationFor(binding.component, binding.sink, fixture.id)
      const label = deviation === undefined
        ? `${fixture.id} → ${required}`
        : `${fixture.id} → ${required} NOT MET, pinned at "${deviation.measured}" (${deviation.severity}, ${deviation.id})`

      it(label, async () => {
        const payload = payloadOf(fixture as SecurityFixture)
        // A harmless render first: the artifact check is a diff against what
        // the component renders anyway, so a component that legitimately
        // contains an <svg> icon is not reported as having been injected with
        // one.
        const clean = await withRender(binding, 'safe-value')
        const baseline = measureBaseline([clean.root, ...(binding.teleports === true ? [document.body] : [])])
        clean.wrapper.unmount()
        document.body.innerHTML = ''

        const { root, extras, wrapper } = await withRender(binding, payload)
        const { outcome, detail } = measure(binding, root, extras, payload, baseline)
        wrapper.unmount()

        if (deviation !== undefined) {
          expect(
            outcome,
            `${deviation.id}: ${binding.component} is recorded as "${deviation.measured}" for `
            + `${fixture.id}; it measured "${outcome}" (${detail}). Update or delete the entry in `
            + 'security-deviations.json — a pinned defect must not drift in either direction.',
          ).toBe(deviation.measured)
          return
        }

        expect(
          outcome,
          `${fixture.id} requires "${required}" in a ${binding.sink} sink; measured `
          + `"${outcome}" (${detail}). ${fixture.rationale}`,
        ).toBe(required)
      })
    }
  })
}

/**
 * Assert the containment property the oversized fixtures depend on.
 *
 * Not a security outcome and deliberately separate from the corpus run: a
 * value that escapes its container can cover the control beside it, which is a
 * layout defect with a security consequence and is asserted where it belongs
 * rather than smuggled into an `escaped` assertion.
 */
export function expectContained(root: Element): void {
  const inlineStyle = root.getAttribute('style') ?? ''
  const classes = root.getAttribute('class') ?? ''
  expect(
    inlineStyle.includes('contain:') || /\[contain:/.test(classes),
    `${root.tagName.toLowerCase()} declares no CSS containment, so an oversized value is not `
    + 'bounded by the component box',
  ).toBe(true)
}
