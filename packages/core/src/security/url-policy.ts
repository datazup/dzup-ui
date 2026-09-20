import type {
  DzUrlPolicy,
  DzUrlPolicyContext,
  DzUrlPolicyOptions,
} from '@dzup-ui/contracts'
import { DZ_ALLOWED_URL_SCHEMES } from '@dzup-ui/contracts'

/**
 * The Core half of the URL policy (TASK-R2-O4, ADR-20 amendment A7).
 *
 * Framework-free on purpose — no `vue` import, no `window` or `document` at
 * module scope or on any code path, exactly like `sanitize.ts` beside it.
 * `useDzUrlPolicy` is the Vue-facing wrapper; this file is what an SSR render,
 * a worker, or a Pro package that wants the same verdict without the composable
 * can import.
 *
 * ## The finding this closes
 *
 * TASK-N1-O5 measured, rather than inferred, that **no URL policy existed
 * anywhere in `packages/core/src`** — no scheme check, no allowlist, no
 * normalization. All nine `url-scheme` corpus fixtures reached the rendered
 * `href` verbatim on all six navigation-sink components: **54 measurements**,
 * pinned as `S1`–`S12` in `packages/core/security/security-deviations.json`
 * with severity `high`, and documented in
 * `packages/core/security/url-boundary.threat-model.md` §2a as finding U1.
 *
 * A `javascript:` URL from whatever populates a menu, breadcrumb, sidebar or
 * anchor list — a CMS row, an API navigation tree, a user profile, a model
 * response — executed in the host's own origin on an ordinary click, with the
 * host's cookies and the host's DOM.
 *
 * ## Three properties, and each is load-bearing
 *
 * 1. **A rejected URL is a rejected URL, never a rewritten one.** The attribute
 *    is *omitted* and the element is no longer a link. Rewriting to `#` or to
 *    `javascript:void(0)` produces a control that looks operable and is not,
 *    which is a worse failure than refusing to draw a link and is invisible to
 *    everything except a click.
 * 2. **Allowlist, after normalization.** See {@link effectiveUrlScheme}.
 * 3. **The escape hatch is the provider, once.** A component-level opt-out
 *    boolean would re-open the hole for exactly the consumers most likely to
 *    reach for it, one call site at a time and with no central record.
 *
 * @module @dzup-ui/core/security/url-policy
 */

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** Anything at or below U+0020 — the C0 controls plus the space. */
function isC0OrSpace(code: number): boolean {
  return code <= 0x20
}

/** Tab, line feed, carriage return: removed from ANYWHERE in the input. */
function isTabOrNewline(code: number): boolean {
  return code === 0x09 || code === 0x0A || code === 0x0D
}

/**
 * The scheme a browser would see, not the one the string starts with.
 *
 * WHATWG URL §4.4 is three steps and a check built on any two of them rejects
 * the obvious payload and admits its twin:
 *
 * 1. strip leading and trailing C0 controls and spaces;
 * 2. remove tab, LF and CR from anywhere in what is left;
 * 3. compare the scheme ASCII case-insensitively.
 *
 * The corpus carries one fixture for each miss — `url-scheme.javascript.
 * mixed-case`, `.leading-control`, `.embedded-tab` — precisely because
 * `startsWith('javascript:')` closes one of the four and admits the other
 * three.
 *
 * Written with character codes rather than a regular expression for the classes
 * involved: they are exactly the ones `no-control-regex` and
 * `regexp/no-obscure-range` exist to stop people writing by accident, and a
 * rule silenced for a security check is a rule silenced everywhere the check is
 * pasted next.
 *
 * @param raw The value as the host supplied it.
 * @returns The lowercased scheme without its colon, or `null` when the value
 * carries no scheme — i.e. it is relative, a fragment, or a query, all of which
 * resolve against the document's own origin.
 */
export function effectiveUrlScheme(raw: string): string | null {
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

// ---------------------------------------------------------------------------
// The default policy
// ---------------------------------------------------------------------------

/**
 * Decide one URL against one scheme list.
 *
 * Exported so a host writing an `allow` function can reuse the library's own
 * verdict rather than re-deriving the normalization, and so the SSR and worker
 * paths have something to call that is not a composable.
 *
 * - No scheme → **allowed**. Relative (`/products`), fragment (`#intro`),
 *   query (`?page=2`) and protocol-relative (`//cdn.example/x`) URLs resolve
 *   against the document the host already chose to serve.
 * - Scheme in the list → **allowed**.
 * - Anything else → **refused**, including every scheme nobody has thought of
 *   yet. That is the direction an allowlist is wrong in.
 */
export function isAllowedUrl(raw: string, allowedSchemes: readonly string[]): boolean {
  const scheme = effectiveUrlScheme(raw)
  return scheme === null || allowedSchemes.includes(scheme)
}

/**
 * What every navigation sink enforces with no provider mounted.
 *
 * Frozen: a policy a consumer can mutate in place is not a policy, and the one
 * sanctioned way to change it is `<DzProvider :url-policy="…">`.
 */
export const DZ_DEFAULT_URL_POLICY: DzResolvedUrlPolicy = Object.freeze({
  allowedSchemes: DZ_ALLOWED_URL_SCHEMES,
  isAllowed(url: string): boolean {
    return isAllowedUrl(url, DZ_ALLOWED_URL_SCHEMES)
  },
})

/**
 * A resolved policy that still remembers the two fields it was built from.
 *
 * `DzUrlPolicy` publishes the verdict; this adds the host's `allow` beside it,
 * and it exists for exactly one reason: a nested provider must be able to
 * replace the scheme list **while keeping an ancestor's escape hatch**. With
 * only `isAllowed` to inherit, the two are welded together — narrowing the list
 * one level down would silently discard the hatch the application installed at
 * its root, which is the failure mode ADR-20 §3's per-key override exists to
 * prevent, one level further in.
 *
 * Core-internal: `@dzup-ui/contracts` publishes `DzUrlPolicy`, which is what a
 * consumer reads and what Pro injects.
 */
export interface DzResolvedUrlPolicy extends DzUrlPolicy {
  /** The effective escape hatch, when a provider installed one. */
  readonly allow?: DzUrlPolicyOptions['allow']
}

/**
 * Fold a host's options over an inherited policy.
 *
 * Reads `options()` at call time rather than closing over a snapshot, for the
 * reason `resolveSanitizer` does: a provider whose prop changes must change the
 * verdict without every consumer re-subscribing.
 *
 * The fold is **per field**: `allowedSchemes` and `allow` are inherited
 * independently, so `<DzProvider :url-policy="{ allowedSchemes: ['https'] }">`
 * nested inside a provider that installed a custom `allow` keeps the `allow`
 * and narrows the list. Each field *replaces* rather than merges — a scheme
 * list that unioned with its ancestor's could only ever widen, and a policy
 * that cannot be narrowed by nesting is not one.
 */
export function resolveUrlPolicy(
  options: () => DzUrlPolicyOptions | null | undefined,
  inherited: DzResolvedUrlPolicy = DZ_DEFAULT_URL_POLICY,
): DzResolvedUrlPolicy {
  const current = (): DzUrlPolicyOptions => options() ?? {}
  const schemesOf = (): readonly string[] => current().allowedSchemes ?? inherited.allowedSchemes
  const allowOf = (): DzUrlPolicyOptions['allow'] => current().allow ?? inherited.allow

  return {
    get allowedSchemes(): readonly string[] {
      return schemesOf()
    },
    get allow(): DzUrlPolicyOptions['allow'] {
      return allowOf()
    },
    isAllowed(url: string, context: DzUrlPolicyContext): boolean {
      const allowedByDefault = isAllowedUrl(url, schemesOf())
      const allow = allowOf()
      return allow === undefined ? allowedByDefault : allow(url, { ...context, allowedByDefault })
    },
  }
}

// ---------------------------------------------------------------------------
// Applying it
// ---------------------------------------------------------------------------

/** What a component should render, and whether something was refused. */
export interface DzUrlDecision {
  /** The value to bind, or `undefined` when the attribute must be omitted. */
  readonly href: string | undefined
  /**
   * True only when a value was supplied **and** refused.
   *
   * Distinct from `href === undefined`, which is also what an unset prop looks
   * like: a component that conflated the two would stamp `data-state`
   * `url-rejected` on every button that is not a link.
   */
  readonly rejected: boolean
}

/** Nothing supplied — the shared object so a render allocates none. */
const NO_URL: DzUrlDecision = Object.freeze({ href: undefined, rejected: false })

/** Refused — likewise shared; the value is deliberately not carried forward. */
const REJECTED: DzUrlDecision = Object.freeze({ href: undefined, rejected: true })

/**
 * Warn once per (component, prop, scheme), in development only.
 *
 * Once, because a rejected URL is almost always a *list* of them — one CMS
 * export, five hundred menu rows — and a warning per row is a warning nobody
 * reads. Keyed by scheme as well as by site so a second, different attack on
 * the same prop is still reported.
 */
const warned = new Set<string>()

/** Test hook. Not exported from any barrel; specs import it by path. */
export function resetUrlPolicyWarnings(): void {
  warned.clear()
}

function warnRejected(raw: string, context: DzUrlPolicyContext): void {
  const scheme = effectiveUrlScheme(raw)
  const key = `${context.component}.${context.prop}:${scheme ?? '(relative)'}`
  if (warned.has(key))
    return
  warned.add(key)
  console.warn(
    `[dzup-ui] ${context.component}: refused to render a ${context.sink} URL with `
    + `scheme "${scheme ?? '(none)'}:" supplied on \`${context.prop}\`. The attribute is `
    + 'omitted and the element renders as a non-link, carrying `data-state="url-rejected"`. '
    + 'Allowed by default: '
    + `${DZ_ALLOWED_URL_SCHEMES.join(', ')}, plus relative and fragment URLs. To widen or `
    + 'narrow this, set `url-policy` on DzProvider — there is no per-component opt-out, '
    + 'on purpose.',
  )
}

/**
 * Apply a policy to one value.
 *
 * @param policy The resolved policy — `useDzUrlPolicy()` in a component.
 * @param raw What the host supplied. `undefined`, `null` and the empty string
 * all mean "no URL" and are **not** rejections.
 * @param context Who is asking. Used for the dev warning and handed to a host's
 * `allow` function.
 */
export function applyUrlPolicy(
  policy: DzUrlPolicy,
  raw: string | undefined | null,
  context: DzUrlPolicyContext,
): DzUrlDecision {
  if (raw === undefined || raw === null || raw === '')
    return NO_URL

  if (policy.isAllowed(raw, context))
    return { href: raw, rejected: false }

  if (import.meta.env?.DEV)
    warnRejected(raw, context)

  return REJECTED
}
