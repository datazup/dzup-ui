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
} as const satisfies {
  locale: DzLocale
  direction: DzDirectionPreference
  motion: DzMotionPreference
  portalTarget: string | undefined
  nonce: string | undefined
  testIds: DzTestIds
}
