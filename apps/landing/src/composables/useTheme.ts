import type { ThemePreference } from '@dzup-ui/core/providers'
import { useTheme as useProviderTheme } from '@dzup-ui/core/providers'
import { watch } from 'vue'

/**
 * Landing-friendly aliases over the single DzThemeProvider authority.
 *
 * The previous module-level theme store duplicated provider state and required a
 * two-way synchronization bridge. Consumers now read and mutate the provider
 * context directly, while keeping the landing's established API names.
 */

export type ThemeMode = ThemePreference

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']

/**
 * Keep the browser-chrome colour on the theme the site is ACTUALLY showing
 * (TASK-FREE3-08).
 *
 * `index.html` ships two `<meta name="theme-color">` tags with
 * `prefers-color-scheme` media, which covers the OS preference on its own. What
 * no media query can see is this app's MANUAL override: a visitor on a light OS
 * who picks dark with the toggle gets a dark page inside light-blue chrome,
 * because the light tag is still the matching one.
 *
 * The fix is to disable the tag that no longer applies rather than to rewrite a
 * colour: `media="none"` never matches, so the browser falls through to the other
 * tag, and the literals stay in the HTML where the drift guard in
 * `@dzup-ui/tooling` (`landing-token-fallbacks.spec.ts`) can still recompute them
 * from the ramp. Restoring both tags' original media returns control to the OS —
 * which is exactly what `system` mode should do.
 */
function applyThemeColorMeta(resolved: 'light' | 'dark', followSystem: boolean): void {
  if (typeof document === 'undefined')
    return
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][data-scheme]')
  for (const meta of metas) {
    const scheme = meta.dataset.scheme
    meta.media = followSystem
      ? `(prefers-color-scheme: ${scheme})`
      : (scheme === resolved ? 'all' : 'none')
  }
}

export function useTheme() {
  const { resolvedTheme, setTheme, theme, toggleTheme } = useProviderTheme()

  // Bound to the CALLING component's scope rather than installed once at module
  // level, and that is deliberate. A module-level watcher would capture the refs
  // of whichever provider happened to mount first and go stale the moment that
  // provider unmounted — which is every test after the first, and any future
  // route that re-mounts the tree. Per-caller watchers cannot go stale.
  //
  // The redundancy is harmless: every caller derives the same two attribute
  // values from the same provider refs, so extra watchers re-write identical
  // `media` strings. `data-theme` and persistence are the provider's job; this
  // only owns the two theme-color metas.
  watch(
    [theme, resolvedTheme],
    ([mode, resolved]) => applyThemeColorMeta(resolved, mode === 'system'),
    { immediate: true },
  )

  return {
    mode: theme,
    resolved: resolvedTheme,
    setMode: setTheme,
    toggle: toggleTheme,
  }
}
