/**
 * useTheme composable — re-exports from providers.
 *
 * The canonical useTheme now lives in providers/useTheme.ts.
 * This barrel re-exports it for in-repo relative imports only; it is not a
 * package subpath (the exports map has no `./composables/useTheme`), so
 * consumers import `useTheme` from the `@dzup-ui/core` root.
 */
export { useTheme } from './useTheme.ts'
export type { UseThemeReturn } from './useTheme.ts'
