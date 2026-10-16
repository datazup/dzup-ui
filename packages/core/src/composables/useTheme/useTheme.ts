/**
 * DEPRECATED — This standalone useTheme has been unified with the provider-based version.
 *
 * The canonical useTheme is now exported from providers/useTheme.ts,
 * which requires a DzThemeProvider ancestor, and reaches consumers only
 * through the package root (`import { useTheme } from '@dzup-ui/core'`).
 * This file re-exports it for in-repo relative imports. It was never a
 * package subpath: `@dzup-ui/core/composables/useTheme` is not in the
 * exports map and this module is not a build entry.
 *
 * @deprecated Use the provider-based useTheme from DzThemeProvider instead.
 */

export type { DzThemeContext as UseThemeReturn } from '../../providers/DzThemeProvider.types.ts'
export { useTheme } from '../../providers/useTheme.ts'
