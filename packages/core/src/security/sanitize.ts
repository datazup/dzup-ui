import type {
  DzSanitizeContext,
  DzSanitizeLimits,
  DzSanitizerAdapter,
  DzSanitizerOptions,
} from '@dzup-ui/contracts'
import { DZ_PROVIDER_DEFAULTS, DzSanitizeLimitError } from '@dzup-ui/contracts'

/**
 * The Core half of the sanitizer seam (TASK-R3-O2, ADR-20 amendment A6).
 *
 * Framework-free on purpose — no `vue` import, no `window` or `document` at
 * module scope or on any code path. `useDzSanitizer` is the Vue-facing wrapper;
 * this file is what a server render, a worker, or a Pro package that wants the
 * ceilings without the composable can import.
 *
 * **Core renders no HTML sink.** Measured at `99b963a`: zero `v-html`, zero
 * `innerHTML` in `packages/core/src`, and all fifteen `SecurityBoundary`
 * declarers are `url` or `payload`. This module therefore exists to be the
 * seam itself — the one place an application installs a policy — and its
 * default is chosen for a host that has installed nothing yet.
 *
 * @module @dzup-ui/core/security/sanitize
 */

// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

/**
 * Render markup inert by turning it into text.
 *
 * The five characters are the ones that can start a tag, close one, or break
 * out of an attribute value. `&` is first in the table and matched by the same
 * pass, so `&lt;` in the input does not become `&amp;lt;` twice over.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ESCAPES[character] as string)
}

// ---------------------------------------------------------------------------
// Depth measurement
// ---------------------------------------------------------------------------

/** Elements that never nest, so they add a level without opening one. */
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** Elements whose content is text, not markup — a `<` inside them opens nothing. */
const RAW_TEXT_ELEMENTS = new Set([
  'script',
  'style',
  'textarea',
  'title',
  'xmp',
  'iframe',
  'noembed',
  'noframes',
])

/**
 * Start tags that implicitly close an open `<p>`.
 *
 * Without this, `'<p>x'.repeat(1000)` measures 1,000 deep where the parser
 * actually produces 1,000 siblings at depth 1 — an over-count that would reject
 * ordinary content.
 */
const P_CLOSING_STARTS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul',
])

/**
 * Optional-end-tag elements, and which open elements each start tag closes.
 *
 * `<ul><li>a<li>b` is two siblings, not a nest. Modelling this is what keeps the
 * measurement honest in both directions: an over-count rejects valid documents,
 * an under-count is a bypass.
 */
const CLOSED_BY_START: Readonly<Record<string, readonly string[]>> = {
  li: ['li'],
  dt: ['dt', 'dd'],
  dd: ['dt', 'dd'],
  rt: ['rt', 'rp'],
  rp: ['rt', 'rp'],
  option: ['option'],
  optgroup: ['option', 'optgroup'],
  td: ['td', 'th'],
  th: ['td', 'th'],
  tr: ['td', 'th', 'tr'],
  thead: ['td', 'th', 'tr'],
  tbody: ['td', 'th', 'tr', 'thead', 'tbody'],
  tfoot: ['td', 'th', 'tr', 'thead', 'tbody'],
}

/**
 * Maximum element nesting depth of `html`, measured without parsing it.
 *
 * Deliberately a scanner and not a parse: **the parse is the cost being
 * bounded**, so building a DOM to decide whether to build a DOM would defeat the
 * guard. It is O(n) and returns as soon as `limit` is passed, so a depth bomb is
 * rejected in microseconds rather than in the seconds `DOMParser` would spend.
 *
 * It models the parts of HTML tree construction that change the answer by more
 * than a level: void elements, raw-text elements, optional end tags, implied
 * `<tbody>`/`<tr>`, and the fact that `/>` self-closes only in foreign content.
 *
 * **Provenance.** Ported from `@dzup-ui-pro/pro`'s
 * `components/editors/composables/markdown/sanitize.ts#measureHtmlDepth`, where
 * it was written and validated against jsdom's real DOM depth across 26 shapes
 * — including the `'<span/>'.repeat(n)` and `'<table><td>'.repeat(n)`
 * under-counting bypasses found while writing it. It moves **into Core** rather
 * than being reimplemented because the ceiling is now a property of the seam,
 * and two copies of a scanner this subtle is how the two tiers come to disagree
 * about what depth 64 means. Pro's copy is retired by Pro TASK-R5-P2, not here.
 *
 * @param html Raw HTML to measure.
 * @param limit Stop and return as soon as the depth exceeds this.
 * @returns The maximum nesting depth, or the first depth found over `limit`.
 */
export function measureHtmlDepth(html: string, limit: number = Number.POSITIVE_INFINITY): number {
  const stack: string[] = []
  const n = html.length
  let max = 0
  let i = 0

  while (i < n) {
    const lt = html.indexOf('<', i)
    if (lt === -1)
      break

    const next = html.charCodeAt(lt + 1)

    // Comments, doctypes and CDATA open no element.
    if (next === 33 /* ! */) {
      if (html.startsWith('<!--', lt)) {
        const end = html.indexOf('-->', lt + 4)
        i = end === -1 ? n : end + 3
      }
      else {
        const end = html.indexOf('>', lt)
        i = end === -1 ? n : end + 1
      }
      continue
    }

    const isEndTag = next === 47 /* / */
    const nameStart = lt + (isEndTag ? 2 : 1)
    let nameEnd = nameStart
    while (nameEnd < n) {
      const c = html.charCodeAt(nameEnd)
      const isNameChar
        = (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 45
      if (!isNameChar)
        break
      nameEnd++
    }

    // A bare `<` in text ("a < b") is not a tag.
    if (nameEnd === nameStart) {
      i = lt + 1
      continue
    }

    const name = html.slice(nameStart, nameEnd).toLowerCase()

    // Walk to the closing `>`, skipping quoted attribute values so a `>` inside
    // `title="a>b"` does not end the tag early.
    let cursor = nameEnd
    let quote = 0
    while (cursor < n) {
      const c = html.charCodeAt(cursor)
      if (quote !== 0) {
        if (c === quote)
          quote = 0
      }
      else if (c === 34 /* " */ || c === 39 /* ' */) {
        quote = c
      }
      else if (c === 62 /* > */) {
        break
      }
      cursor++
    }
    const selfClosing = cursor > nameEnd && html.charCodeAt(cursor - 1) === 47
    i = cursor + 1

    if (isEndTag) {
      // An end tag with no matching open element is ignored, as the parser does.
      const open = stack.lastIndexOf(name)
      if (open !== -1)
        stack.length = open
      continue
    }

    const closes = CLOSED_BY_START[name]
    if (closes !== undefined) {
      for (let open = stack[stack.length - 1]; open !== undefined && closes.includes(open); open = stack[stack.length - 1])
        stack.pop()
    }
    if (P_CLOSING_STARTS.has(name) && stack[stack.length - 1] === 'p')
      stack.pop()

    // `<table><td>` really parses as `<table><tbody><tr><td>`; a scanner blind
    // to the implied sections under-counts that payload by half.
    const top = stack[stack.length - 1]
    if (name === 'td' || name === 'th') {
      if (top === 'table')
        stack.push('tbody', 'tr')
      else if (top === 'tbody' || top === 'thead' || top === 'tfoot')
        stack.push('tr')
    }
    else if (name === 'tr' && top === 'table') {
      stack.push('tbody')
    }

    // `/>` closes the element only inside SVG/MathML. In HTML the parser ignores
    // it, so `'<span/>'.repeat(n)` nests n deep and must be counted that way.
    const inForeignContent = stack.includes('svg') || stack.includes('math')
    if (VOID_ELEMENTS.has(name) || (selfClosing && inForeignContent)) {
      if (stack.length + 1 > max)
        max = stack.length + 1
      continue
    }

    stack.push(name)
    if (stack.length > max)
      max = stack.length
    if (max > limit)
      return max

    if (RAW_TEXT_ELEMENTS.has(name)) {
      const close = html.toLowerCase().indexOf(`</${name}`, i)
      i = close === -1 ? n : close
    }
  }

  return max
}

// ---------------------------------------------------------------------------
// Ceilings
// ---------------------------------------------------------------------------

/** The default ceilings, re-exported from the contract so there is one source. */
export const DZ_DEFAULT_SANITIZE_LIMITS: DzSanitizeLimits = DZ_PROVIDER_DEFAULTS.sanitizer.limits

/**
 * Apply the ceilings, before anything parses.
 *
 * Length first because it is O(1) and the depth scan is O(n): a 4 MiB payload
 * is rejected without being walked at all.
 *
 * @throws {DzSanitizeLimitError} when a ceiling is exceeded.
 */
export function enforceSanitizeLimits(
  html: string,
  limits: DzSanitizeLimits,
  context: DzSanitizeContext,
): void {
  if (html.length > limits.maxLength)
    throw new DzSanitizeLimitError('maxLength', html.length, limits.maxLength, context)

  const depth = measureHtmlDepth(html, limits.maxDepth)
  if (depth > limits.maxDepth)
    throw new DzSanitizeLimitError('maxDepth', depth, limits.maxDepth, context)
}

// ---------------------------------------------------------------------------
// The default adapter
// ---------------------------------------------------------------------------

/**
 * What an application gets before it has installed a sanitizer: **markup in,
 * text out**.
 *
 * The three candidate defaults, and why this one:
 *
 *   - *Pass-through* — rejected outright. A default that renders untrusted HTML
 *     as HTML is the vulnerability the seam exists to remove, and it fails in
 *     the direction where nothing looks wrong until it is.
 *   - *Bundle a sanitizer* — rejected. It puts a parser and an allowlist into
 *     every consumer's bundle for a library that renders no HTML of its own,
 *     and it makes Core own a policy that belongs to the host.
 *   - *Escape* — this. It is the only answer that is safe with no dependency,
 *     identical on a server and in a browser, and **visibly** wrong when it is
 *     wrong: a host that meant to render rich content sees its tags as text on
 *     the first render rather than shipping an unguarded sink to production.
 *
 * A host that wants real HTML installs an adapter on `DzProvider`. That is the
 * seam working, not a workaround for it.
 */
export const DZ_ESCAPING_SANITIZER: DzSanitizerAdapter = Object.freeze({
  policyName: DZ_PROVIDER_DEFAULTS.sanitizer.policyName,
  limits: DZ_DEFAULT_SANITIZE_LIMITS,
  sanitize: (html: string) => escapeHtml(html),
})

/**
 * Fold a host's partial options over an inherited adapter, and wrap the result
 * so the ceilings are enforced by the **seam** rather than by each adapter.
 *
 * Two properties this shape buys:
 *
 *   1. **Per-field nesting.** `<DzProvider :sanitizer="{ limits: { maxDepth: 8 } }">`
 *      inside a provider that installed DOMPurify keeps DOMPurify. ADR-20 §3
 *      overrides per key; this is the same rule one level down.
 *   2. **A host that supplies only a function still gets the ceilings.** The
 *      most common installation is `{ sanitize: html => DOMPurify.sanitize(html) }`,
 *      and requiring every such host to re-derive a depth bound is how the
 *      bound comes to be omitted.
 *
 * Reads `options` through a getter at call time, so a reactive prop change is
 * picked up without the consumer re-subscribing — the same contract
 * `useDzFormats` has with the locale.
 */
export function resolveSanitizer(
  options: () => DzSanitizerOptions | null | undefined,
  inherited: DzSanitizerAdapter = DZ_ESCAPING_SANITIZER,
): DzSanitizerAdapter {
  const current = (): DzSanitizerOptions => options() ?? {}

  const limitsOf = (context: DzSanitizeContext): DzSanitizeLimits => ({
    ...inherited.limits,
    ...current().limits,
    ...context.limits,
  })

  return {
    get policyName(): string {
      return current().policyName ?? inherited.policyName
    },
    get limits(): DzSanitizeLimits {
      return { ...inherited.limits, ...current().limits }
    },
    sanitize(html: string, context: DzSanitizeContext): string {
      enforceSanitizeLimits(html, limitsOf(context), context)
      return (current().sanitize ?? inherited.sanitize)(html, context)
    },
  }
}
