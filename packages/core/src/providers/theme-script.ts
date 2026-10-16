/**
 * Theme initialization script for FOUC prevention (ADR-15).
 *
 * This string contains inline JavaScript meant to be injected into the
 * `<head>` of the HTML document BEFORE any rendering occurs. It reads the
 * persisted theme from `localStorage` and sets the `data-theme` attribute
 * on `<html>` so that the correct CSS variables are active on first paint.
 *
 * Usage in an HTML template or SSR framework:
 *
 * ```html
 * <head>
 *   <script>{{ themeScript }}</script>
 * </head>
 * ```
 *
 * Or with a bundler / SSR helper:
 *
 * ```ts
 * import { getThemeScript } from '@dzup-ui/core/theme-script'
 *
 * // Custom storage key and attribute
 * const script = getThemeScript({ storageKey: 'my-theme', attribute: 'data-mode' })
 *
 * // Theme AND writing direction, both before first paint (TASK-OSS-P4-02)
 * const script = getThemeScript({ locale: 'ar-EG' })   // also sets dir="rtl"
 * ```
 *
 * **Why direction is baked in rather than detected.** Theme has to be read at
 * runtime because it lives in `localStorage`, which only the browser can see.
 * Direction does not: it comes from the application's own configuration, which
 * is already known wherever this string is generated. Resolving it here keeps
 * the inline script small and keeps the RTL subtag list in exactly one place
 * (`useDzLocale`) instead of duplicating it into a string literal that no test
 * can reach.
 *
 * **One script, every host.** This is the only copy: `@dzup-ui/nuxt` injects
 * `getThemeScript(options)` and `@dzup-ui/tokens/utils`' `themeScript` is a
 * deprecated literal of the defaults. The module imports nothing that touches
 * Vue or the DOM, which is what lets the `./theme-script` subpath load in a
 * Nuxt module at build time without pulling a component in with it.
 *
 * @module @dzup-ui/core/theme-script
 */

import type { DzDirectionPreference, DzLocale } from '@dzup-ui/contracts'
import { directionForLocale } from '../i18n/direction.ts'

/** Options for generating the theme initialization script */
export interface ThemeScriptOptions {
  /** localStorage key (default: 'dz-theme') */
  storageKey?: string
  /** HTML attribute name (default: 'data-theme') */
  attribute?: string
  /**
   * Default theme when nothing valid is persisted (default: 'system').
   * A persisted `'system'` is honoured as system, never replaced by this.
   */
  defaultTheme?: 'light' | 'dark' | 'high-contrast' | 'system'
  /**
   * Read the persisted preference (default: `true`). Mirrors
   * `DzProvider`'s `theme.persist`: with `false` the provider ignores
   * `localStorage`, so the script must too or the first paint would show a
   * theme the provider then replaces.
   */
  persist?: boolean
  /**
   * Writing direction to set on `<html>` before first paint (ADR-20).
   *
   * `'auto'` — the default — resolves from {@link ThemeScriptOptions.locale}.
   * With neither given the script writes no `dir` at all: a host that has not
   * declared a locale gets no opinion imposed on its markup.
   */
  direction?: DzDirectionPreference
  /** BCP-47 tag the direction resolves from when `direction` is `'auto'`. */
  locale?: DzLocale
}

/**
 * The `dir` this script should write, or `undefined` for "say nothing".
 *
 * The interesting cases (`'auto'` with no locale, an explicit direction that
 * contradicts the locale) are decisions; the spec reaches them through the
 * generated script's behaviour.
 */
function resolveScriptDirection(options: ThemeScriptOptions): 'ltr' | 'rtl' | undefined {
  const { direction = 'auto', locale } = options
  if (direction !== 'auto')
    return direction
  return locale === undefined ? undefined : directionForLocale(locale)
}

/**
 * A host-supplied string as a JavaScript string literal. Every option value
 * reaches the script through here and nowhere else, so how a value is
 * embedded is decided in one place.
 */
function jsString(value: string): string {
  return JSON.stringify(value)
}

/**
 * Generate a theme initialization script string with custom options.
 *
 * Resolution order, matching `DzProvider`: a persisted `'light'`, `'dark'`,
 * `'high-contrast'` or `'system'` wins; anything else (nothing stored, a stale or foreign value,
 * storage disabled or throwing) falls back to `defaultTheme`; `'system'` is
 * then resolved through `prefers-color-scheme`.
 *
 * @param options - Script generation options
 * @returns Inline JavaScript string for `<head>` injection
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const {
    storageKey = 'dz-theme',
    attribute = 'data-theme',
    defaultTheme = 'system',
    persist = true,
  } = options

  const dir = resolveScriptDirection(options)
  // Inside the same `try`, and after the theme write: both attributes land on
  // the same element in the same tick, so there is no frame in which the page
  // is themed but not yet directed.
  const dirWrite = dir === undefined
    ? ''
    : `;document.documentElement.setAttribute('dir',${jsString(dir)})`

  // Storage is read in its own `try`: a browser that throws on `localStorage`
  // access (blocked storage, some private modes) still gets the default theme
  // rather than no theme at all.
  const read = persist
    ? `var s=null;try{s=localStorage.getItem(${jsString(storageKey)})}catch(e){}`
    : `var s=null;`

  return `(function(){try{${read}var p=s==='light'||s==='dark'||s==='high-contrast'||s==='system'?s:${jsString(defaultTheme)};`
    + `var t=p==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):p;`
    + `document.documentElement.setAttribute(${jsString(attribute)},t)${dirWrite}}catch(e){}})()`
}

/**
 * Pre-built inline script using default options (ADR-15).
 *
 * Reads `localStorage` key `dz-theme` and sets `data-theme` on `<html>`.
 * Falls back to system preference detection via `matchMedia`.
 *
 * Inject in `<head>` before any stylesheets or body content:
 *
 * ```html
 * <script>{{ themeScript }}</script>
 * ```
 */
export const themeScript: string = getThemeScript()
