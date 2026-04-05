/**
 * Providers — Public exports.
 *
 * @module @dzip-ui/core/providers
 */

export { DZ_THEME_KEY } from './DzThemeProvider.types.ts'
export type {
  DzThemeContext,
  DzThemeProviderProps,
  ResolvedTheme,
  ThemePreference,
} from './DzThemeProvider.types.ts'
// DzThemeProvider
export { default as DzThemeProvider } from './DzThemeProvider.vue'
export { getThemeScript, themeScript } from './theme-script.ts'
export type { ThemeScriptOptions } from './theme-script.ts'
export { useTheme } from './useTheme.ts'
