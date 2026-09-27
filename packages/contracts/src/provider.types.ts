import type { InjectionKey, Ref } from 'vue'
import type { CanonicalDensity, CanonicalSize, CanonicalTone } from './canonical.types.js'

/**
 * Provider contract — the concerns an application configures once
 * (TASK-OSS-P4-01, ADR-20).
 *
 * `DzThemeProvider` has covered theme since ADR-09. Everything else a component
 * needs from its host — the locale it formats in, the direction it lays out in,
 * where its overlays teleport to, whether it may animate, what a CSP nonce is,
 * what its default size should be — is currently a prop on every component or a
 * hard-coded string in its template. Measured on 2026-08-21: **79 distinct
 * user-visible literals** (50 unchangeable `aria-label` values, 29 prop
 * defaults only a per-instance prop can change), 15 components taking `portalTo`,
 * and 5 `Intl` construction sites across 4 files with no shared locale.
 *
 * This module declares the keys and the shapes. The read side lives in
 * `@dzup-ui/core/composables/provider`; the `DzProvider` component that writes
 * them is TASK-OSS-P4-02.
 *
 * **Why the keys live here.** An injection key is an identity: two packages
 * that inject the same concern must inject the *same symbol*, or the child
 * silently gets the default. Putting them in `@dzup-ui/contracts` is what lets
 * `@dzup-ui-pro/*` read an application's locale without importing Core's
 * runtime — the dependency direction the whole package graph is built around.
 *
 * These are the second and subsequent runtime values in a types-only package
 * (`assertNever` was the first). `Symbol()` calls are side-effect-free and
 * tree-shakeable, and the alternative — string keys — would collide silently
 * across libraries, which is the failure mode the symbol form exists to prevent.
 *
 * @module @dzup-ui/contracts/provider
 */

// ---------------------------------------------------------------------------
// Locale and messages
// ---------------------------------------------------------------------------

/** A BCP-47 language tag, e.g. `en-US`, `bs-BA`, `ar-EG`. */
export type DzLocale = string

/**
 * A message catalog: nested groups of strings, keyed by component or concern.
 *
 * Deliberately not a flat `Record<string, string>`. Nesting is what makes the
 * merge rule in ADR-20 expressible — a host overriding one string must not have
 * to restate the other 71.
 */
export interface DzMessages {
  readonly [key: string]: string | DzMessages
}

/**
 * The strict, per-component catalog every tier contributes its own keys to.
 *
 * Deliberately **empty here**. `@dzup-ui/contracts` knows about base prop
 * interfaces and canonical taxonomies, not about `DzCombobox` — enumerating
 * Core's components in the types package would invert that. Instead Core and
 * Pro each augment this interface from their own package:
 *
 * ```ts
 * declare module '@dzup-ui/contracts' {
 *   interface DzMessageCatalog {
 *     DzInput: { clear: string, loading: string }
 *   }
 * }
 * ```
 *
 * That makes the extension mechanism ADR-20 §9 requires of Pro **the same
 * mechanism Core itself uses**, rather than a second-class hook bolted on for
 * one consumer. It also means Pro augments a package it already depends on:
 * Pro depends inward on Core *contracts* and must never import Core's runtime,
 * so `declare module '@dzup-ui/core'` was never available to it.
 *
 * {@link DzMessages} stays the loose recursive shape — it is what a *host*
 * passes to `DzProvider`, where partial overrides are the whole point. This is
 * what the *library* guarantees it will look up.
 */

export interface DzMessageCatalog {}

/**
 * A value one message argument accepts (TASK-R5-O4).
 *
 * Numbers are formatted for the active locale — `1234` renders `1,234` in
 * `en-US` and `1.234` in `de-DE` — which is the reason a count is passed as a
 * number rather than pre-stringified by the caller.
 */
export type DzMessageArg = string | number

/** The named arguments one message is formatted with. */
export type DzMessageValues = Readonly<Record<string, DzMessageArg>>

/**
 * Phantom brand carrying a message's argument types. Type-only: nothing with
 * this name exists at runtime, and a plain string is still assignable to every
 * {@link DzMessage}, so a host's catalog and a translator's JSON never need a
 * cast.
 */
declare const dzMessageArgs: unique symbol

/**
 * A catalog string that takes arguments (TASK-R5-O4).
 *
 * Written in the dzup-ui message syntax — a documented subset of ICU
 * MessageFormat (`packages/core/docs/i18n.md`):
 *
 * ```text
 * {name}                                              an argument
 * {count, plural, one {# item} other {# items}}       Intl.PluralRules (cardinal)
 * {place, selectordinal, one {#st} other {#th}}       Intl.PluralRules (ordinal)
 * {kind, select, file {File} other {Item}}            exact match, `other` required
 * ```
 *
 * The type parameter is what makes the syntax *typed*: Core declares
 * `itemCount: DzMessage<{ count: number }>` in its `DzMessageCatalog`
 * augmentation, and formatting that key without a numeric `count` is a type
 * error at the call site rather than an `{count}` rendered to a user.
 */
export type DzMessage<A extends DzMessageValues = Record<never, never>> = string & {
  readonly [dzMessageArgs]?: A
}

/**
 * The arguments a catalog entry declares — `{}` for a plain string.
 *
 * `unknown extends A` catches the case where TypeScript infers the brand from a
 * bare `string` (it has no brand to read), so a plain message asks for no
 * arguments instead of accepting anything.
 */
export type DzMessageArgsOf<M> = M extends { readonly [dzMessageArgs]?: infer A }
  ? (unknown extends A ? Record<never, never> : A)
  : Record<never, never>

/**
 * Every dotted key the merged catalog declares, e.g. `'DzInput.clear'`.
 *
 * Derived from {@link DzMessageCatalog}, so it grows with each tier's
 * augmentation and is `never` in a program that loaded none.
 */
export type DzMessageKey = {
  [G in keyof DzMessageCatalog & string]: `${G}.${keyof DzMessageCatalog[G] & string}`
}[keyof DzMessageCatalog & string]

/**
 * A locale pack as it ships: `@dzup-ui/core/i18n/locales/<locale>.json`
 * (TASK-R5-O4).
 *
 * **Data, not code.** A pack is what a translator or a translation-management
 * tool edits, so it is JSON — no build step, no TypeScript, no import graph that
 * could pull a second language into every bundle.
 *
 * `fallback` is the explicit half of the completeness rule
 * `yarn validate:i18n-packs` enforces: **every catalog key is either translated
 * in `messages` or listed here**, never silently missing. A listed key renders
 * the English default, per key, exactly as a partial host catalog does.
 *
 * `direction` is declared rather than inferred. The gate fails when it disagrees
 * with the locale list `useDzDirection()` resolves `'auto'` from, so the two
 * sources of the same answer cannot drift apart unseen.
 *
 * @example
 * ```ts
 * import de from '@dzup-ui/core/i18n/locales/de.json' with { type: 'json' }
 * // <DzProvider :locale="de.locale" :messages="de.messages">
 * ```
 */
export interface DzLocalePack {
  readonly locale: DzLocale
  readonly direction: DzDirection
  readonly fallback: readonly string[]
  readonly messages: DzMessages
}

/** Direction for layout and logical properties. */
export type DzDirection = 'ltr' | 'rtl'

/**
 * Direction as an application declares it. `'auto'` resolves from the locale,
 * so a host that already knows its locale does not have to know the script
 * direction of every language it ships.
 */
export type DzDirectionPreference = DzDirection | 'auto'

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------

/**
 * A moment on the global timeline: a `Date`, epoch milliseconds, or an ISO 8601
 * string **with** an offset or `Z` (TASK-R5-O4).
 *
 * An instant has no wall-clock value of its own until it is rendered in a time
 * zone, so it is the one date kind a host's `formats.date.timeZone` applies to.
 * `DzRelativeTime`'s `value` and `DzCountdown`'s `target` are instants.
 */
export type DzInstant = Date | number | string

/**
 * A calendar date with no time and no zone: ISO 8601 `YYYY-MM-DD`
 * (TASK-R5-O4).
 *
 * The same date in every zone, so it is never converted through one — a
 * birthday picked in Sarajevo is not the day before in New York. `DzCalendar`,
 * `DzDatePicker` and `DzDateRangePicker` take and emit plain dates.
 *
 * An alias of `string`, not a template-literal type, on purpose: narrowing the
 * existing `string` props to it would reject every consumer variable typed
 * `string`, which is a breaking change for a documentation gain.
 */
export type DzPlainDate = string

/**
 * A wall-clock time with no date and no zone: `HH:mm` or `HH:mm:ss`, 24-hour
 * (TASK-R5-O4). `DzTimePicker`'s model is a plain time, and a host's
 * `formats.date.timeZone` never moves it.
 */
export type DzPlainTime = string

/**
 * Cached `Intl` factories bound to the active locale.
 *
 * Constructing an `Intl.NumberFormat` is one of the more expensive things a
 * component can do in a render, and a table doing it per cell is a measurable
 * cost. These return shared instances keyed by locale plus options.
 */
export interface DzFormats {
  number: (options?: Intl.NumberFormatOptions) => Intl.NumberFormat
  date: (options?: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat
  relativeTime: (options?: Intl.RelativeTimeFormatOptions) => Intl.RelativeTimeFormat
  list: (options?: Intl.ListFormatOptions) => Intl.ListFormat
}

/**
 * Option defaults an application sets once and every formatter call inherits.
 *
 * Separate from {@link DzFormats} because the two are opposite halves: a host
 * declares **defaults** (`{ currency: 'EGP' }`), a component asks for a
 * **formatter**. Merging happens per call, with the caller's options winning, so
 * a component that genuinely needs percent formatting is not overridden by an
 * application-wide currency.
 *
 * `currency` is called out rather than left inside `number` because it is the
 * one option a host almost always has and a component almost never does:
 * `Intl.NumberFormat` throws `TypeError` when `style: 'currency'` is asked for
 * with no currency, so a component cannot supply that style on its own.
 */
export interface DzFormatDefaults {
  /** ISO 4217 code used when a caller asks for `style: 'currency'`. */
  readonly currency?: string
  readonly number?: Intl.NumberFormatOptions
  /**
   * Defaults for formatting **instants** ({@link DzInstant}).
   *
   * A `timeZone` here is honoured by every instant a component renders — a
   * relative time's absolute tooltip, for one. It is deliberately **not**
   * honoured by plain values ({@link DzPlainDate}, {@link DzPlainTime}): a
   * birthday or a 09:00 opening time is the same wall-clock value in every zone,
   * and running it through one moves it (TASK-R5-O4; the semantics table is in
   * `packages/core/docs/i18n.md`).
   */
  readonly date?: Intl.DateTimeFormatOptions
  readonly relativeTime?: Intl.RelativeTimeFormatOptions
  readonly list?: Intl.ListFormatOptions
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/**
 * How much a component may animate.
 *
 * - `system` — follow `prefers-reduced-motion` (the default, and the only
 *   answer that respects an OS-level accessibility setting).
 * - `reduced` — never animate, whatever the OS says. For an application that
 *   has its own setting.
 * - `full` — animate regardless. **An explicit override of a user's stated
 *   accessibility preference**; ADR-20 admits it only because a host that
 *   already asked the user is better placed to decide than this library.
 */
export type DzMotionPreference = 'system' | 'reduced' | 'full'

export interface DzMotion {
  /** What the application asked for. */
  readonly preference: Ref<DzMotionPreference>
  /** What that resolves to right now, after consulting the OS when `system`. */
  readonly reduced: Ref<boolean>
}

// ---------------------------------------------------------------------------
// Component defaults
// ---------------------------------------------------------------------------

/**
 * Application-wide prop defaults, per component.
 *
 * Precedence, fixed by ADR-20 and not negotiable per component: **an explicit
 * prop wins, then compound context (a `DzButtonGroup`), then these, then the
 * component's own default.** Context beats the provider because it is nearer
 * and more specific; a prop beats everything because it is what the author of
 * that line wrote.
 */
export interface DzDefaults {
  readonly size?: CanonicalSize
  readonly tone?: CanonicalTone
  readonly density?: CanonicalDensity
  /** Per-component overrides, keyed by exported component name. */
  readonly components?: {
    readonly [component: string]: Readonly<Record<string, unknown>>
  }
}

// ---------------------------------------------------------------------------
// Test ids
// ---------------------------------------------------------------------------

/**
 * How components expose stable test hooks.
 *
 * Off by default: an attribute nobody asked for is payload in every rendered
 * node. A host that wants them names the attribute, because `data-testid`,
 * `data-test` and `data-qa` are all in use and none is more correct.
 */
export interface DzTestIds {
  readonly enabled: boolean
  readonly attribute: string
  /**
   * Prepended to every generated id, `-` separated.
   *
   * Optional rather than defaulted to `''` so that `DZ_PROVIDER_DEFAULTS.testIds`
   * stays exactly the two fields ADR-20 published — a default that grows a field
   * is a contract change for everyone who compared against it.
   */
  readonly prefix?: string
}

// ---------------------------------------------------------------------------
// Sanitizer
// ---------------------------------------------------------------------------

/**
 * What a piece of HTML is being sanitised **for**.
 *
 * Sanitised output built for one context must never be reused in another — a
 * fragment that is safe inside rendered markdown is not safe as an SVG — so the
 * context travels with the call rather than being implied by whoever installed
 * the adapter.
 *
 * The five names are the ones `@dzup-ui-pro/pro` already records in
 * `docs/security.md` §4 and `packages/pro/manifests/html-sinks.manifest.json`;
 * none is invented here and none of Pro's is dropped. The open `(string & {})`
 * arm is what lets a host or a future tier add one without a Core release,
 * while keeping the five in autocomplete.
 */
export type DzSanitizeSink
  = | 'markdown'
    | 'mermaid-svg'
    | 'notebook-output'
    | 'diff-highlight'
    | 'rich-text-paste'
    | (string & {})

/**
 * The other half of the registry's context vocabulary — the sinks that are
 * **not** guarded by a sanitizer.
 *
 * `URL.createObjectURL` takes a `Blob`, not markup: these are guarded by
 * construction (the component serialises its own bytes and sets the MIME) or by
 * an allowlist, never by {@link DzSanitizerAdapter}. Declared so the whole
 * vocabulary is expressible in one place, and typed *apart* so that
 * `sanitize(html, { sink: 'download-blob' })` cannot be written by accident.
 */
export type DzObjectUrlSink = 'file-preview' | 'image-source' | 'download-blob'

/**
 * Input ceilings applied **before** the sanitizer parses.
 *
 * `maxLength` is in **characters, not bytes**. That is Pro's measured field
 * (`SanitizeLimits` in `components/editors/composables/markdown/sanitize.ts`),
 * and its numbers were chosen against character counts; renaming it to bytes
 * would silently change what every recorded measurement means.
 *
 * The pair bounds *amplification* rather than document size: the cost lives in
 * the HTML parser, and depth and length multiply.
 */
export interface DzSanitizeLimits {
  /** Maximum input length, in characters. */
  readonly maxLength: number
  /** Maximum element nesting depth. */
  readonly maxDepth: number
}

/** Where a sanitised string is going, and under what ceilings. */
export interface DzSanitizeContext {
  /** What the output is for. Sanitised output is not portable between sinks. */
  readonly sink: DzSanitizeSink
  /** The component asking, for diagnostics and for policy that varies by it. */
  readonly component: string
  /**
   * Per-call ceiling override, merged over the adapter's own.
   *
   * The counterpart of Pro's `sanitizeHtml(libs, html, limits?)` third
   * argument. Widen one only with a recorded reason.
   */
  readonly limits?: Partial<DzSanitizeLimits>
  /**
   * Whether the caller wants a Trusted-Types-backed value rather than a plain
   * string (DOMPurify's `RETURN_TRUSTED_TYPE`). Advisory: an adapter that
   * cannot produce one still returns a sanitised string.
   */
  readonly trustedTypes?: boolean
}

/**
 * The organisation-wide HTML sanitizer an application configures once.
 *
 * 08-11 doc 06 asks for exactly one of these per application: allowed schemes,
 * a Trusted Types policy name and size ceilings set at the root, not re-solved
 * by every component that happens to render rich content.
 *
 * The **contract of the seam, not of the adapter**, is that `limits` are
 * enforced before `sanitize` is reached — so a host supplying nothing but a
 * `sanitize` function still gets the ceilings, and an adapter that enforces
 * them again is merely redundant, never wrong.
 */
export interface DzSanitizerAdapter {
  /**
   * Trusted Types policy name, one per application.
   *
   * Defaults to `'dzup-ui'`, which is the name the published consumer CSP
   * recipe already tells hosts to allowlist (`trusted-types vue dompurify
   * dzup-ui`).
   */
  readonly policyName: string
  /** Ceilings applied before parsing. */
  readonly limits: DzSanitizeLimits
  /** Returns sanitised HTML, or throws. It must never return its input unchanged. */
  sanitize: (html: string, context: DzSanitizeContext) => string
}

/**
 * What a host hands `DzProvider` — every field optional, so a nested provider
 * can tighten `limits` without restating the adapter.
 *
 * This is the shape ADR-20 §3's per-key override needs one level down: the
 * provider overrides a whole concern per key, and this overrides that concern's
 * own three fields per field. A full {@link DzSanitizerAdapter} satisfies it,
 * so passing one is the common case.
 */
export interface DzSanitizerOptions {
  readonly policyName?: string
  readonly limits?: Partial<DzSanitizeLimits>
  readonly sanitize?: (html: string, context: DzSanitizeContext) => string
}

/**
 * Thrown when input exceeds a {@link DzSanitizeLimits} ceiling.
 *
 * A **class in a types-first package**, and the third runtime export it carries
 * after `assertNever` and the form-value codecs. It is here for the same reason
 * the injection keys are: catching an error by class is an *identity* question,
 * and a consumer or a Pro component must be able to write `e instanceof
 * DzSanitizeLimitError` against the same constructor Core threw — which a
 * per-package copy would break, silently, in the direction that swallows the
 * error.
 *
 * Fail-closed by construction: it carries no markup, and every path that throws
 * it has not parsed the input.
 */
export class DzSanitizeLimitError extends Error {
  /** Which ceiling was exceeded. */
  readonly limit: keyof DzSanitizeLimits
  /** The measured value. */
  readonly actual: number
  /** The ceiling it exceeded. */
  readonly allowed: number
  /** The sink the call was for. */
  readonly sink: DzSanitizeSink
  /** The component that asked. */
  readonly component: string

  constructor(
    limit: keyof DzSanitizeLimits,
    actual: number,
    allowed: number,
    context: Pick<DzSanitizeContext, 'component' | 'sink'>,
  ) {
    super(
      limit === 'maxLength'
        ? `${context.component}: content is too large to render safely (${actual} characters, limit ${allowed}).`
        : `${context.component}: content is nested too deeply to render safely (${actual} levels, limit ${allowed}).`,
    )
    this.name = 'DzSanitizeLimitError'
    this.limit = limit
    this.actual = actual
    this.allowed = allowed
    this.sink = context.sink
    this.component = context.component
  }
}

// ---------------------------------------------------------------------------
// URL policy
// ---------------------------------------------------------------------------

/**
 * What a host-supplied URL is about to become (TASK-R2-O4).
 *
 * The two kinds are not two flavours of one risk, they are two different
 * threats, and the corpus keyed its expected outcomes by exactly this
 * distinction (`packages/core/security/url-boundary.threat-model.md` §2a/§2b):
 *
 * - `navigation` — the value becomes an `<a href>` a person activates, so the
 *   scheme decides whether a click is a link or **script execution in the
 *   host's own origin**. This is the sink the policy guards.
 * - `subresource` — the value becomes an `<img src>` the browser fetches. No
 *   shipping engine has executed a `javascript:` subresource this decade and
 *   `data:image/svg+xml` in an `<img>` is script-disabled by specification, so
 *   the residual is a *request* to an origin the page's author did not choose.
 *   No component can decide which origins a consumer trusts (avatars come from
 *   CDNs); that is the host's `img-src` directive. Declared here so the
 *   vocabulary is complete and so a host CAN opt an image sink in, not because
 *   the library filters one by default.
 */
export type DzUrlSink = 'navigation' | 'subresource'

/** Which component asked, about which prop, for which sink. */
export interface DzUrlPolicyContext {
  /** The exported component name, as the quality matrix spells it. */
  readonly component: string
  /** The prop the value arrived on — `href`, `items[].href`, `src`. */
  readonly prop: string
  /** What the value is about to become. */
  readonly sink: DzUrlSink
}

/**
 * The application-wide answer to "may this URL be rendered as a live link?".
 *
 * An **allowlist**, never a denylist. A denylist is a list of the attacks
 * somebody thought of: `javascript:` is four evasions wide on its own (mixed
 * case, a leading C0 control, an embedded tab, and percent-encoding), and the
 * next scheme a browser ships is admitted by default. An allowlist is wrong in
 * the safe direction — a legitimate scheme is refused until a host adds it,
 * and the refusal is visible in the DOM rather than silent.
 *
 * The decision is **after WHATWG normalization**, not on the raw string: the
 * URL parser strips leading/trailing C0 controls and spaces, removes tab/LF/CR
 * from anywhere in the input, and compares schemes ASCII case-insensitively
 * (WHATWG URL §4.4). A check built on `startsWith('javascript:')` closes one of
 * the four evasions the corpus carries and admits the other three.
 */
export interface DzUrlPolicy {
  /**
   * Schemes admitted for a `navigation` sink, lowercase and without the colon.
   *
   * Relative and fragment URLs carry no scheme and are always admitted: they
   * resolve against the document's own origin, which the host already chose.
   */
  readonly allowedSchemes: readonly string[]
  /**
   * The decision. `true` renders the link; `false` omits the attribute.
   *
   * A host replaces this to widen or narrow — it is the escape hatch, and it is
   * here rather than on a component prop on purpose: a per-instance
   * `:unsafe-href` boolean re-opens the hole for exactly the consumers most
   * likely to reach for it, one call site at a time and with no central record.
   */
  readonly isAllowed: (url: string, context: DzUrlPolicyContext) => boolean
}

/**
 * What a host hands `DzProvider` — every field optional, so a nested provider
 * can narrow the scheme list without restating the decision function.
 *
 * `allow` receives the same context the default does **plus** the default's own
 * verdict, so the common extension ("everything the library allows, and
 * `slack:`") is one line that cannot accidentally disable the base policy.
 */
export interface DzUrlPolicyOptions {
  /** Replaces the default list outright. Lowercase, no colon. */
  readonly allowedSchemes?: readonly string[]
  /**
   * The explicit allow function. Called only for values the library would
   * otherwise refuse is **not** the contract — it is called for every value,
   * with `allowedByDefault` saying what the scheme list decided, so a host can
   * both widen and narrow.
   */
  readonly allow?: (
    url: string,
    context: DzUrlPolicyContext & { readonly allowedByDefault: boolean },
  ) => boolean
}

/**
 * The schemes a navigation sink admits with no provider mounted.
 *
 * `http`/`https` are the web. `mailto`, `tel` and `sms` hand off to another
 * application and cannot execute in this document; all three are ordinary
 * contents of a navigation menu and refusing them would make the policy the
 * thing consumers route around. Every other scheme — `javascript`, `vbscript`,
 * `data`, `file`, `blob`, `filesystem`, and whatever ships next — is refused
 * until a host says otherwise.
 *
 * Recorded as data rather than baked into the function so a consumer can read
 * the list, and so {@link DZ_PROVIDER_DEFAULTS} can publish the same values Pro
 * must resolve to.
 */
export const DZ_ALLOWED_URL_SCHEMES: readonly string[] = [
  'http',
  'https',
  'mailto',
  'tel',
  'sms',
]

// ---------------------------------------------------------------------------
// Injection keys
// ---------------------------------------------------------------------------

/**
 * One symbol per concern.
 *
 * Separate keys rather than one context object so a provider can override the
 * locale without restating the portal target, and so a component that needs
 * only the direction does not re-render when the message catalog changes.
 */
export const DZ_LOCALE_KEY: InjectionKey<Ref<DzLocale>> = Symbol('dz-locale')
export const DZ_MESSAGES_KEY: InjectionKey<Ref<DzMessages>> = Symbol('dz-messages')
export const DZ_FORMATS_KEY: InjectionKey<DzFormats> = Symbol('dz-formats')
export const DZ_DIRECTION_KEY: InjectionKey<Ref<DzDirectionPreference>> = Symbol('dz-direction')
export const DZ_PORTAL_TARGET_KEY: InjectionKey<Ref<string | undefined>> = Symbol('dz-portal-target')
export const DZ_MOTION_KEY: InjectionKey<DzMotion> = Symbol('dz-motion')
export const DZ_DEFAULTS_KEY: InjectionKey<Ref<DzDefaults>> = Symbol('dz-defaults')
export const DZ_NONCE_KEY: InjectionKey<Ref<string | undefined>> = Symbol('dz-nonce')
export const DZ_TEST_IDS_KEY: InjectionKey<Ref<DzTestIds>> = Symbol('dz-test-ids')
/**
 * The eleventh concern (TASK-R3-O2). A resolved adapter, not a ref, for the
 * reason `DZ_FORMATS_KEY` is not one: it is a method-bearing object whose
 * methods read the current configuration at call time, so a consumer does not
 * re-subscribe when the host changes a ceiling.
 *
 * `null` is a **provided** value with a meaning of its own — "the host said it
 * would supply an adapter and supplied none" — and is deliberately not the same
 * state as *uninjected*, which means "nobody has configured one" and resolves to
 * the documented default. Collapsing the two would turn a configuration mistake
 * into a rendering difference no one goes looking for.
 */
export const DZ_SANITIZER_KEY: InjectionKey<DzSanitizerAdapter | null> = Symbol('dz-sanitizer')
/**
 * The twelfth concern (TASK-R2-O4, ADR-20 amendment A7). A resolved policy, not
 * a ref, for the same reason {@link DZ_SANITIZER_KEY} is not one: it is a
 * method-bearing object whose method reads the current configuration at call
 * time.
 *
 * There is deliberately **no `null` arm** here, unlike the sanitizer. `null`
 * there means "the host said it would supply an adapter and supplied none",
 * which is a configuration mistake worth a dev-mode throw. A URL policy has no
 * such state: the library's answer with nothing configured is the *strict* one,
 * and a key whose absent value is the safe value cannot be turned off by
 * forgetting something.
 */
export const DZ_URL_POLICY_KEY: InjectionKey<DzUrlPolicy> = Symbol('dz-url-policy')

// ---------------------------------------------------------------------------
// Documented defaults
// ---------------------------------------------------------------------------

/**
 * What every concern resolves to with no provider mounted.
 *
 * Exported, not buried in each composable, because "works without a provider"
 * is a contract a consumer should be able to read rather than infer — and
 * because Pro must resolve to the same values.
 */
export const DZ_PROVIDER_DEFAULTS = {
  locale: 'en-US',
  direction: 'auto',
  motion: 'system',
  /** `undefined` means `document.body`, resolved by the portal at render time. */
  portalTarget: undefined,
  nonce: undefined,
  testIds: { enabled: false, attribute: 'data-testid' },
  /**
   * The sanitizer's **data** half only — the policy name and the ceilings.
   *
   * The default `sanitize` function is Core's, not this package's: it is real
   * code with a real HTML depth scanner, and `@dzup-ui/contracts` stays the
   * place where a value is *declared* rather than implemented. The two fields
   * that both tiers must agree on numerically are here, for exactly the reason
   * this object exists at all — "because Pro must resolve to the same values".
   *
   * `128 KiB` / depth `64` are Pro's measured `DEFAULT_SANITIZE_LIMITS`, not a
   * fresh guess; see {@link DzSanitizeLimits}.
   */
  sanitizer: {
    policyName: 'dzup-ui',
    limits: { maxLength: 128 * 1024, maxDepth: 64 },
  },
  /**
   * The URL policy's **data** half — the scheme allowlist (TASK-R2-O4).
   *
   * The decision *function* is Core's, for the same reason the sanitizer's is:
   * it is real code with a WHATWG normalizer, and `@dzup-ui/contracts` is where
   * a value is declared rather than implemented. The list is the part both
   * tiers must agree on, which is what this object is for.
   */
  urlPolicy: {
    allowedSchemes: DZ_ALLOWED_URL_SCHEMES,
  },
} as const satisfies {
  locale: DzLocale
  direction: DzDirectionPreference
  motion: DzMotionPreference
  portalTarget: string | undefined
  nonce: string | undefined
  testIds: DzTestIds
  sanitizer: { policyName: string, limits: DzSanitizeLimits }
  urlPolicy: { allowedSchemes: readonly string[] }
}
