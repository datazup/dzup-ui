import { nextTick } from 'vue'
import { startViewTransition, supportsViewTransitions, useReducedMotion } from '../motion/index.ts'
import { useTheme } from './useTheme.ts'

/**
 * useThemeTransition — the landing "re-theme the page" behaviour.
 *
 * Wraps the shared {@link useTheme} toggle (which flips the FOUC-safe
 * `data-theme` attribute and persists the `dz-theme` preference) in a View
 * Transition so the whole surface — component internals included — dissolves
 * between light and dark instead of hard-flipping. While the swap runs, `<html>`
 * carries the `dz-theming` marker class so the pure opacity cross-fade in
 * `tailwind.css` REPLACES the route fade+slide for that one transition.
 *
 * Progressive enhancement / accessibility:
 * - Reduced motion (OS or the gallery override) or a browser without the View
 *   Transitions API → the theme is swapped instantly (no cross-fade). The CSS
 *   `--dz-landing-theme-transition` on major surfaces still eases the colours.
 * - The update callback awaits `nextTick()` so the singleton `data-theme` watcher
 *   has applied the new attribute before the browser captures the "new" snapshot;
 *   otherwise the cross-fade would capture no visual change.
 */

const THEMING_CLASS = 'dz-theming'
/**
 * Slightly longer than the `--dz-duration-slower` (500ms) cross-fade so the
 *  marker class outlives the animation before it's cleared.
 */
const CLEANUP_MS = 700

export function useThemeTransition() {
  const { resolved, toggle } = useTheme()
  const reduced = useReducedMotion()

  let cleanupTimer: number | undefined

  function retheme(): void {
    const root = typeof document === 'undefined' ? null : document.documentElement
    const skip = reduced.value || !supportsViewTransitions()

    if (!skip && root) {
      root.classList.add(THEMING_CLASS)
      if (cleanupTimer !== undefined)
        window.clearTimeout(cleanupTimer)
      cleanupTimer = window.setTimeout(() => root.classList.remove(THEMING_CLASS), CLEANUP_MS)
    }

    void startViewTransition(async () => {
      toggle()
      // Let the data-theme watcher flush before the "new" snapshot is taken.
      await nextTick()
    }, { skip })
  }

  return { resolved, reduced, retheme }
}
