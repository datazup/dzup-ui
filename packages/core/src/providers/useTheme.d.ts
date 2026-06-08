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
import type { DzThemeContext } from './DzThemeProvider.types';
export interface UseThemeOptions {
    /**
     * When `true`, returns a no-op sentinel context instead of throwing when no
     * DzThemeProvider ancestor is found. Useful in SSR layouts or components
     * that render before the provider is mounted.
     *
     * @default false
     */
    optional?: boolean;
}
/**
 * Inject theme context from the nearest DzThemeProvider ancestor.
 *
 * @param options.optional - Return a no-op sentinel instead of throwing when
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
export declare function useTheme(options?: UseThemeOptions): DzThemeContext;
