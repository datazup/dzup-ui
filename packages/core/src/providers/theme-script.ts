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
 * import { getThemeScript } from '@dzip-ui/core/providers'
 *
 * // Custom storage key and attribute
 * const script = getThemeScript({ storageKey: 'my-theme', attribute: 'data-mode' })
 * ```
 *
 * @module @dzip-ui/core/providers/theme-script
 */

/** Options for generating the theme initialization script */
export interface ThemeScriptOptions {
  /** localStorage key (default: 'dz-theme') */
  storageKey?: string
  /** HTML attribute name (default: 'data-theme') */
  attribute?: string
  /** Default theme when nothing is persisted (default: 'system') */
  defaultTheme?: 'light' | 'dark' | 'system'
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

  return `(function(){try{var s=localStorage.getItem(${JSON.stringify(storageKey)});var t=s==='light'||s==='dark'?s:s==='system'||!s?null:null;if(!t){var d=${JSON.stringify(defaultTheme)};t=d==='system'?window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light':d}document.documentElement.setAttribute(${JSON.stringify(attribute)},t)}catch(e){}})()`
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
