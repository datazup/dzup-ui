import { defineComponent } from 'vue'
import { useProviderThemeSync } from '../composables/useProviderThemeSync.ts'

/**
 * Renderless bridge that keeps DzThemeProvider's preference mirroring the
 * landing's `useTheme` singleton (TASK-FREE2-08).
 *
 * It exists as a component purely for placement: the sync needs `inject()` to
 * reach the provider context, so it has to run in a component BELOW
 * `<DzThemeProvider>` — App.vue's own setup, which is where the provider is
 * rendered, cannot inject its own child's provide.
 *
 * Plain `.ts` rather than an SFC because it renders nothing, and a `.vue` file
 * with an empty template is not a valid SFC.
 *
 * See useProviderThemeSync for the authority design and the bug it fixes.
 */
export default defineComponent({
  name: 'ThemeSync',
  setup() {
    useProviderThemeSync()
    return () => null
  },
})
