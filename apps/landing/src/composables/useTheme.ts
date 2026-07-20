import { onBeforeUnmount, ref, watch } from 'vue'

/**
 * useTheme — light/dark/system theme controller for the landing app.
 *
 * Drives the `data-theme` attribute on
 * <html>, persists the preference under the `dz-theme` localStorage key (same
 * key the FOUC IIFE in index.html reads), and tracks the OS preference while in
 * `system` mode. A module singleton keeps one source of truth across the SPA.
 */

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'dz-theme'
const RESOLVED_KEY = 'data-theme'

let singleton: ReturnType<typeof create> | null = null

function readStored(): ThemeMode {
  if (typeof window === 'undefined')
    return 'system'
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

function systemPrefers(): 'light' | 'dark' {
  if (typeof window === 'undefined')
    return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

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
 * tag, and the literals stay in the HTML where the drift guard can check them.
 * Restoring both tags' original media returns control to the OS — which is
 * exactly what `system` mode should do.
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

function applyTheme(resolved: 'light' | 'dark', followSystem = false): void {
  if (typeof document === 'undefined')
    return
  document.documentElement.setAttribute(RESOLVED_KEY, resolved)
  applyThemeColorMeta(resolved, followSystem)
}

function create() {
  const mode = ref<ThemeMode>(readStored())
  const resolved = ref<'light' | 'dark'>(mode.value === 'system' ? systemPrefers() : mode.value)

  applyTheme(resolved.value, mode.value === 'system')

  const media
    = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)')

  function onSystemChange(): void {
    if (mode.value === 'system') {
      resolved.value = systemPrefers()
      applyTheme(resolved.value, true)
    }
  }

  media?.addEventListener('change', onSystemChange)

  watch(mode, (next) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    resolved.value = next === 'system' ? systemPrefers() : next
    applyTheme(resolved.value, next === 'system')
  })

  /**
   * Select a mode explicitly — including `'system'`, which the binary `toggle`
   * below can never reach (TASK-FREE2-08). This is what the nav's three-way
   * control drives.
   */
  function setMode(next: ThemeMode): void {
    mode.value = next
  }

  function toggle(): void {
    // Toggle relative to what's currently on screen. Deliberately one-way out of
    // `system`: a flip is a request for a specific appearance, so it pins one.
    // Getting back to `system` is the nav control's job, not this one's.
    mode.value = resolved.value === 'dark' ? 'light' : 'dark'
  }

  function dispose(): void {
    media?.removeEventListener('change', onSystemChange)
  }

  return { mode, resolved, setMode, toggle, dispose }
}

export function useTheme() {
  if (!singleton) {
    singleton = create()
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => singleton?.dispose(), { once: true })
    }
  }
  onBeforeUnmount(() => {
    /* keep singleton alive across page navigations */
  })
  return {
    mode: singleton.mode,
    resolved: singleton.resolved,
    setMode: singleton.setMode,
    toggle: singleton.toggle,
  }
}

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
