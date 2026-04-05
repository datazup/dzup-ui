/**
 * Theme Initialization Script (FOUC Prevention)
 *
 * This script must be placed in the `<head>` of the HTML document
 * BEFORE any content renders. It reads the user's theme preference
 * from localStorage and sets the `data-theme` attribute on `<html>`
 * immediately, preventing a flash of unstyled/wrong-theme content.
 *
 * ADR-15: Theme persistence and FOUC prevention.
 *
 * Usage:
 *   import { themeScript } from '@dzip-ui/tokens/utils'
 *
 *   // In your HTML template or SSR head:
 *   `<script>${themeScript}</script>`
 */

/**
 * Inline script string for `<head>`.
 * Reads `localStorage('dz-theme')`, resolves 'system' to actual preference,
 * and sets `data-theme` on `document.documentElement`.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('dz-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',d)}}catch(e){}})();`

/**
 * The localStorage key used for theme persistence.
 * Must match the key used in DzThemeProvider.
 */
export const THEME_STORAGE_KEY = 'dz-theme'
