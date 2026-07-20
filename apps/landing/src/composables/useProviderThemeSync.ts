import { useTheme as useProviderTheme } from '@dzup-ui/core'
import { watch } from 'vue'
import { useTheme } from './useTheme.ts'

/**
 * useProviderThemeSync — reconcile the landing's theme singleton with the
 * `DzThemeProvider` that App.vue wraps the site in (TASK-FREE2-08).
 *
 * ## Why two theme stores exist at all
 *
 * The landing owns {@link useTheme}: a module singleton created at App.vue setup,
 * before any component mounts, agreeing with the FOUC IIFE in index.html. It is
 * what the nav control and the hero's re-theme button drive.
 *
 * `DzThemeProvider` is mounted for a different reason: library components that
 * bind to the theme context — `DzColorModeToggle`, which the nav itself uses and
 * which the nav-bar and footer block previews render — inject it and would
 * otherwise silently no-op against a sentinel context.
 * The provider is not optional and it is not ours to strip down.
 *
 * ## The problem this solves
 *
 * The provider keeps its own preference, reads the same `dz-theme` key, and
 * writes the same `data-theme` attribute. App.vue used to simply assert the two
 * "stay in sync rather than conflicting". They do not: a shared storage key
 * makes them agree at load and never again, because each only re-reads it once.
 *
 * The failure is not hypothetical, and it loses a real user preference:
 *
 *   1. Visitor arrives following the OS (both stores: `system`, OS: light).
 *   2. Visitor picks **light** explicitly in the nav → the singleton pins
 *      `light`. The provider still holds `system` — nothing told it otherwise.
 *   3. The OS flips to dark. The provider's own media listener fires, its
 *      `system` preference resolves to `dark`, and it writes `data-theme="dark"`
 *      over the light theme the visitor explicitly asked for.
 *
 * `apps/landing/src/composables/themeSync.spec.ts` pins that case.
 *
 * ## The design
 *
 * **The landing singleton is the authority for the preference.** The provider is
 * a mirror: it holds whatever the singleton holds, so its resolution and its
 * attribute write can only ever restate the singleton's own conclusion. Two
 * writers remain — the provider's `watch(resolvedTheme)` is internal and cannot
 * be disabled from outside — but they are no longer two *opinions*, which is
 * what actually made them conflict.
 *
 * The mirror is two-way because a `DzColorModeToggle` inside a block preview
 * mutates the provider directly; that edit is adopted by the singleton, which
 * then remains the thing everything else reads. Each direction is guarded by a
 * value check, so a propagated write lands as a same-value assignment and Vue
 * stops it there rather than looping.
 *
 * Mount this exactly once, immediately inside `<DzThemeProvider>` — it needs the
 * provider as an ancestor to inject, which is why it is a child of App.vue's
 * provider rather than part of App.vue's own setup.
 */
export function useProviderThemeSync() {
  const { mode, setMode } = useTheme()
  const provider = useProviderTheme({ optional: true })

  // Authority → mirror. `immediate` hands the provider the singleton's mode at
  // mount, which is the moment the two would otherwise start drifting: the
  // provider has just read localStorage independently.
  watch(
    mode,
    (next) => {
      if (provider.theme.value !== next)
        provider.setTheme(next)
    },
    { immediate: true },
  )

  // Mirror → authority. A DzColorModeToggle inside a block preview writes here;
  // adopting it keeps the singleton the one true reading for the nav control,
  // the hero button, and everything else on the page.
  watch(provider.theme, (next) => {
    if (mode.value !== next)
      setMode(next)
  })

  return {
    providerTheme: provider.theme,
    setProviderTheme: provider.setTheme,
  }
}
