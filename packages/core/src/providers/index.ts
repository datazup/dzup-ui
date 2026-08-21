/**
 * Providers — Public exports.
 *
 * `DzProvider` (TASK-OSS-P4-02) is the one sanctioned writer for every concern
 * ADR-20 declares. `DzThemeProvider` is a thin wrapper over it with theme props
 * only, kept because its contract shipped with ADR-09 and nothing about it
 * changed.
 *
 * `DZ_PROVIDER_SCOPE_KEY` is deliberately **not** exported: it answers "may I
 * write to `<html>`?", and the only correct answer for anyone outside
 * `DzProvider` is no.
 *
 * @module @dzup-ui/core/providers
 */

export type {
  DzProviderDefaults,
  DzProviderProps,
  DzProviderSlots,
  DzProviderThemeOptions,
} from './DzProvider.types.ts'
// DzProvider
export { default as DzProvider } from './DzProvider.vue'

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
export type { UseThemeOptions } from './useTheme.ts'
