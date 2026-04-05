/**
 * useTheme — Consumer composable for DzThemeProvider context.
 *
 * Injects the theme context from the nearest DzThemeProvider ancestor.
 * Issues a dev-mode warning if used outside a DzThemeProvider.
 *
 * Returns the ADR-09 minimal API: theme, resolvedTheme, setTheme, toggleTheme.
 *
 * @module @dzip-ui/core/providers/useTheme
 */

import type { DzThemeContext } from './DzThemeProvider.types'
import { inject } from 'vue'
import { DZ_THEME_KEY } from './DzThemeProvider.types'

/**
 * Inject theme context from the nearest DzThemeProvider ancestor.
 *
 * @throws Dev-mode warning if no provider is found.
 * @returns The DzThemeContext with theme, resolvedTheme, setTheme, toggleTheme.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTheme } from '@dzip-ui/core/providers'
 *
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
 * </script>
 *
 * <template>
 *   <button @click="toggleTheme">
 *     Current: {{ resolvedTheme }}
 *   </button>
 * </template>
 * ```
 */
export function useTheme(): DzThemeContext {
  const context = inject(DZ_THEME_KEY)

  if (!context) {
    if (import.meta.env?.DEV) {
      console.warn(
        '[DzThemeProvider] useTheme() was called outside of a <DzThemeProvider>. '
        + 'Wrap your app in <DzThemeProvider> to use theme context.',
      )
    }
    throw new Error(
      'useTheme() requires a <DzThemeProvider> ancestor. '
      + 'Wrap your component tree in <DzThemeProvider>.',
    )
  }

  return context
}
