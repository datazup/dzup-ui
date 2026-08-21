/**
 * DzProvider — type definitions (TASK-OSS-P4-02, ADR-20).
 *
 * One props object for the nine concerns ADR-20 fixed plus the theme contract
 * ADR-09 already shipped. Every prop is optional and **every prop is optional
 * for the same reason**: ADR-20 §3 says a provider overrides *the keys it
 * sets*, so an undefined prop is not "use the default" — it is "leave whatever
 * the ancestor decided alone". That distinction is what makes nesting compose
 * instead of truncate, and it is why nothing here has a `withDefaults` value.
 *
 * @module @dzup-ui/core/providers/DzProvider
 */

import type {
  DzDefaults,
  DzDirectionPreference,
  DzFormatDefaults,
  DzLocale,
  DzMessages,
  DzMotionPreference,
  DzTestIds,
} from '@dzup-ui/contracts'
import type { InjectionKey } from 'vue'
import type { ThemePreference } from './DzThemeProvider.types.ts'

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/**
 * The theme half, as one object rather than five sibling props.
 *
 * Grouped because theme is the one concern with more than a single value to
 * configure, and because `<DzProvider :theme="{ default: 'dark' }">` reads as
 * a concern being configured while `default-theme` next to `locale` reads as
 * two unrelated props that happen to share a provider.
 *
 * Field names are the object's own, not `DzThemeProviderProps`': inside
 * `theme`, `default` and `persist` say what they mean, and `defaultTheme`
 * would stutter. `DzThemeProvider` maps its flat props onto these.
 */
export interface DzProviderThemeOptions {
  /** Theme when nothing is persisted. Default `'system'`. */
  default?: ThemePreference
  /**
   * Whether the preference survives a reload. Default `true`.
   *
   * `false` skips `localStorage` in **both** directions — the provider neither
   * reads a value another page wrote nor writes one. A read-only variant would
   * let a stale key from a different deployment win over the `default` this
   * host just stated, which is the opposite of what turning persistence off
   * means.
   */
  persist?: boolean
  /** `localStorage` key. Default `'dz-theme'`. */
  storageKey?: string
  /** Attribute written on `<html>`. Default `'data-theme'`. */
  attribute?: string
  /** Suppress CSS transitions during a theme switch. Default `true`. */
  disableTransitionOnChange?: boolean
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/**
 * Application-wide prop defaults, accepted in either of two shapes.
 *
 * The contract shape is {@link DzDefaults}: shared axes at the top level,
 * per-component entries under `components`. The shorthand puts a component
 * name at the top level — `{ DzButton: { size: 'sm' } }` — because that is what
 * a host writes first and there is no ambiguity to resolve: `size`, `tone`,
 * `density` and `components` are the only reserved keys, and no component is
 * called any of them.
 *
 * Both normalise to `DzDefaults` before they are provided, so
 * `useDzDefaults().resolve()` sees one shape and the ADR's precedence rule has
 * one thing to reason about. An explicit `components` entry wins over the
 * shorthand for the same component: the contract form is the specific one.
 */
export type DzProviderDefaults = DzDefaults & {
  readonly [component: `Dz${string}`]: Readonly<Record<string, unknown>> | undefined
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for `DzProvider`. */
export interface DzProviderProps {
  /** Theme options, or omitted to leave an ancestor's theme in charge. */
  theme?: DzProviderThemeOptions
  /** Active BCP-47 tag, e.g. `'ar-EG'`. */
  locale?: DzLocale
  /**
   * Writing direction. `'auto'` derives it from the locale.
   *
   * Setting this to `'ltr'` or `'rtl'` overrides the locale, which is what a
   * host embedding an RTL widget in an LTR page needs — the two are genuinely
   * independent, and deriving direction from locale is a default, not a law.
   */
  direction?: DzDirectionPreference
  /** Message catalog. **Deep-merges** with an ancestor's rather than replacing it. */
  messages?: DzMessages
  /** `Intl` option defaults every `useDzFormats()` call inherits. */
  formats?: DzFormatDefaults
  /** Where overlays teleport to: a selector, or omitted for `document.body`. */
  portal?: string
  /** Animation policy. `'full'` overrides a user's stated OS preference (ADR-20 §7). */
  motion?: DzMotionPreference
  /** Application-wide prop defaults. */
  defaults?: DzProviderDefaults
  /** CSP nonce for any `<style>` this library injects at runtime. */
  nonce?: string
  /** Test-id policy: whether they render at all, and under which attribute. */
  testIds?: Partial<DzTestIds>
  /**
   * Shorthand that both **enables** test ids and namespaces them.
   *
   * Enabling is implied because a host that names a prefix has said what it
   * wants; requiring `:test-ids="{ enabled: true, prefix: 'e2e' }"` alongside
   * would make the common case the verbose one. An explicit `testIds.enabled`
   * still wins, so the shorthand can be overruled without being removed.
   */
  testIdPrefix?: string
}

/** Slots for `DzProvider`. */
export interface DzProviderSlots {
  /** The application. `DzProvider` renders no element of its own. */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

/**
 * Marks "a `DzProvider` is already above you".
 *
 * Deliberately **not exported from the package barrel**. It answers exactly one
 * question — may I write to `<html>`? — and the only correct answer for anyone
 * outside this component is "no". Publishing it would let an application claim
 * to be a provider without being one, and the symptom would be a root provider
 * that silently stops reflecting `dir` because something upstairs said it had.
 */
export const DZ_PROVIDER_SCOPE_KEY: InjectionKey<true> = Symbol('dz-provider-scope')
