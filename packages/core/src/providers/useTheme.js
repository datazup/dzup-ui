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
import { computed, ref } from 'vue';
import { inject } from 'vue';
import { DZ_THEME_KEY } from './DzThemeProvider.types';
/** Sentinel context returned when `optional: true` and no provider is found */
function createSentinelContext() {
    const theme = ref('system');
    return {
        theme,
        resolvedTheme: computed(() => 'light'),
        setTheme: (_value) => { },
        toggleTheme: () => { },
    };
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
export function useTheme(options) {
    const context = inject(DZ_THEME_KEY);
    if (!context) {
        if (options?.optional) {
            if (import.meta.env?.DEV) {
                console.warn('[DzThemeProvider] useTheme({ optional: true }) called outside of a '
                    + '<DzThemeProvider>. Returning no-op sentinel context.');
            }
            return createSentinelContext();
        }
        if (import.meta.env?.DEV) {
            console.warn('[DzThemeProvider] useTheme() was called outside of a <DzThemeProvider>. '
                + 'Wrap your app in <DzThemeProvider> to use theme context.');
        }
        throw new Error('useTheme() requires a <DzThemeProvider> ancestor. '
            + 'Wrap your component tree in <DzThemeProvider>.');
    }
    return context;
}
//# sourceMappingURL=useTheme.js.map