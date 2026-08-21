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
 * import { getThemeScript } from '@dzup-ui/core/providers'
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
 * @module @dzup-ui/core/providers/theme-script
 */

import type { DzDirectionPreference, DzLocale } from '@dzup-ui/contracts'
import { directionForLocale } from '../composables/provider/useDzLocale.ts'

/** Options for generating the theme initialization script */
export interface ThemeScriptOptions {
  /** localStorage key (default: 'dz-theme') */
  storageKey?: string
  /** HTML attribute name (default: 'data-theme') */
  attribute?: string
  /** Default theme when nothing is persisted (default: 'system') */
  defaultTheme?: 'light' | 'dark' | 'system'
  /**
   * Writing direction to set on `<html>` before first paint (ADR-20).
   *
   * `'auto'` — the default — resolves from {@link ThemeScriptOptions.locale}.
   * With neither given the script writes no `dir` at all, so the emitted string
   * is byte-identical to what it was before direction existed: a host that has
   * not declared a locale gets no opinion imposed on its markup.
   */
  direction?: DzDirectionPreference
  /** BCP-47 tag the direction resolves from when `direction` is `'auto'`. */
  locale?: DzLocale
}

/**
 * The `dir` this script should write, or `undefined` for "say nothing".
 *
 * Exported for the spec: the interesting cases (`'auto'` with no locale, an
 * explicit direction that contradicts the locale) are decisions, and a decision
 * that is only reachable through a generated string is a decision nothing tests.
 */
export function resolveScriptDirection(options: ThemeScriptOptions): 'ltr' | 'rtl' | undefined {
  const { direction = 'auto', locale } = options
  if (direction !== 'auto')
    return direction
  return locale === undefined ? undefined : directionForLocale(locale)
}

/**
 * Generate a theme initialization script string with custom options.
 *
 * @param options - Script generation options
 * @returns Inline JavaScript string for `<head>` injection
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const {
    storageKey = 'dz-theme',
    attribute = 'data-theme',
    defaultTheme = 'system',
  } = options

  const dir = resolveScriptDirection(options)
  // Inside the same `try`, and after the theme write: both attributes land on
  // the same element in the same tick, so there is no frame in which the page
  // is themed but not yet directed.
  const dirWrite = dir === undefined
    ? ''
    : `;document.documentElement.setAttribute('dir',${JSON.stringify(dir)})`

  return `(function(){try{var s=localStorage.getItem(${JSON.stringify(storageKey)});var t=s==='light'||s==='dark'?s:null;if(!t){var d=${JSON.stringify(defaultTheme)};t=d==='system'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':d}document.documentElement.setAttribute(${JSON.stringify(attribute)},t)${dirWrite}}catch(e){}})()`
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
