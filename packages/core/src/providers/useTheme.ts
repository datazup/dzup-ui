/**
 * useTheme — Consumer composable for DzThemeProvider context.
 *
 * Injects the theme context from the nearest DzThemeProvider ancestor.
 * Issues a dev-mode warning if used outside a DzThemeProvider.
 *
 * Returns the ADR-09 minimal API: theme, resolvedTheme, setTheme, toggleTheme.
 *
 * @module @dzup-ui/core/providers/useTheme
 */

import type { DzThemeContext, ThemePreference } from './DzThemeProvider.types'
import { computed, inject, ref } from 'vue'
import { DZ_THEME_KEY } from './DzThemeProvider.types'

export interface UseThemeOptions {
  /**
   * When `true`, returns a no-op sentinel context instead of throwing when no
   * DzThemeProvider ancestor is found. Useful in SSR layouts or components
   * that render before the provider is mounted.
   *
   * @default false
   */
  optional?: boolean
}

/** Sentinel context returned when `optional: true` and no provider is found */
function createSentinelContext(): DzThemeContext {
  const theme = ref<ThemePreference>('system')
  return {
    theme,
    resolvedTheme: computed(() => 'light' as const),
    setTheme: (_value: ThemePreference) => { /* no-op */ },
    toggleTheme: () => { /* no-op */ },
  }
}

/**
 * Inject theme context from the nearest DzThemeProvider ancestor.
 *
 * @param [options] - Options object.
 * @param [options.optional] - Return a no-op sentinel instead of throwing when
 *   no provider is found (useful in SSR layout slots).
 *
 * @throws When no provider is found and `optional` is `false` (default).
 *
 * @example Basic usage
 * ```vue
 * <script setup lang="ts">
 * import { useTheme } from '@dzup-ui/core/providers'
 *
 * const { resolvedTheme, toggleTheme } = useTheme()
 * </script>
 *
 * <template>
 *   <button @click="toggleTheme">
 *     Current: {{ resolvedTheme }}
 *   </button>
 * </template>
 * ```
 *
 * @example Optional (no-throw) usage in SSR layouts
 * ```ts
 * const { resolvedTheme } = useTheme({ optional: true })
 * ```
 */
export function useTheme(options?: UseThemeOptions): DzThemeContext {
  const context = inject(DZ_THEME_KEY)

  if (!context) {
    if (options?.optional) {
      if (import.meta.env?.DEV) {
        console.warn(
          '[DzThemeProvider] useTheme({ optional: true }) called outside of a '
          + '<DzThemeProvider>. Returning no-op sentinel context.',
        )
      }
      return createSentinelContext()
    }

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
