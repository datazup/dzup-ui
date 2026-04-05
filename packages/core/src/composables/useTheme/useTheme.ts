/**
 * DEPRECATED — This standalone useTheme has been unified with the provider-based version.
 *
 * The canonical useTheme is now exported from providers/useTheme.ts,
 * which requires a DzThemeProvider ancestor. This file re-exports it
 * for backward compatibility.
 *
 * @module @dzip-ui/core/composables/useTheme
 * @deprecated Use the provider-based useTheme from DzThemeProvider instead.
 */

export type { DzThemeContext as UseThemeReturn } from '../../providers/DzThemeProvider.types.ts'
export { useTheme } from '../../providers/useTheme.ts'
