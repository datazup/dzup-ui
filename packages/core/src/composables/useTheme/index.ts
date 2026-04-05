/**
 * useTheme composable — re-exports from providers.
 *
 * The canonical useTheme now lives in providers/useTheme.ts.
 * This barrel re-exports it for consumers who import from the composables path.
 *
 * @module @dzip-ui/core/composables/useTheme
 */
export { useTheme } from './useTheme.ts'
export type { UseThemeReturn } from './useTheme.ts'
