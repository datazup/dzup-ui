/**
 * useTheme — Composable for theme management with system preference detection.
 *
 * Provides a minimal API (ADR-09) for reading/writing the current theme.
 * Persists to `localStorage` key `dz-theme` and sets `data-theme` on
 * `document.documentElement` (ADR-15). SSR-safe: media query listeners
 * are only attached in `onMounted()`.
 *
 * Tokens are consumed via CSS `var()` — no `getToken()` or `getCssVar()`.
 *
 * @module @dzup-ui/core/composables/useTheme
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key for theme persistence (ADR-15) */
const STORAGE_KEY = 'dz-theme'

/** data attribute set on document.documentElement */
const DATA_ATTR = 'data-theme'

/** Valid theme preference values */
type ThemePreference = 'light' | 'dark' | 'system'

/** Resolved theme (never 'system') */
type ResolvedTheme = 'light' | 'dark'

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Return value of the useTheme composable (ADR-09 minimal API) */
export interface UseThemeReturn {
  /** Current theme preference ('light' | 'dark' | 'system') */
  theme: Ref<ThemePreference>
  /** Resolved actual theme — accounts for system preference when theme is 'system' */
  resolvedTheme: ComputedRef<ResolvedTheme>
  /** Set the theme preference */
  setTheme: (theme: ThemePreference) => void
  /** Toggle between light and dark (resolves 'system' to its opposite) */
  toggleTheme: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if code is running in a browser environment */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** Read persisted theme from localStorage (returns null if unavailable) */
function readPersistedTheme(): ThemePreference | null {
  if (!isBrowser())
    return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  }
  catch {
    // localStorage may throw in restricted contexts (e.g. iframe sandboxes)
  }
  return null
}

/** Persist theme to localStorage */
function persistTheme(value: ThemePreference): void {
  if (!isBrowser())
    return
  try {
    localStorage.setItem(STORAGE_KEY, value)
  }
  catch {
    // Silently ignore storage errors
  }
}

/** Apply data-theme attribute to document.documentElement */
function applyThemeAttribute(resolved: ResolvedTheme): void {
  if (!isBrowser())
    return
  document.documentElement.setAttribute(DATA_ATTR, resolved)
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages application theme with system preference detection and persistence.
 *
 * @returns Theme state and control functions (ADR-09 minimal API)
 *
 * @example
 * ```ts
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
 *
 * // Set explicit theme
 * setTheme('dark')
 *
 * // Follow system preference
 * setTheme('system')
 *
 * // Toggle between light/dark
 * toggleTheme()
 *
 * // Use in template
 * // <span>Current: {{ resolvedTheme }}</span>
 * ```
 */
export function useTheme(): UseThemeReturn {
  const theme = ref<ThemePreference>(readPersistedTheme() ?? 'system')
  const systemPrefersDark = ref(false)

  /** Resolved theme: converts 'system' to actual light/dark */
  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (theme.value === 'system') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return theme.value
  })

  /** Media query change handler */
  let mediaQuery: MediaQueryList | null = null

  function handleMediaChange(event: MediaQueryListEvent): void {
    systemPrefersDark.value = event.matches
  }

  // Watch for theme changes and sync to DOM + storage
  watch(resolvedTheme, (resolved) => {
    applyThemeAttribute(resolved)
  })

  watch(theme, (value) => {
    persistTheme(value)
  })

  // SSR-safe: only access window.matchMedia in onMounted (ADR-15)
  onMounted(() => {
    if (!isBrowser())
      return

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches

    mediaQuery.addEventListener('change', handleMediaChange)

    // Apply initial theme attribute
    applyThemeAttribute(resolvedTheme.value)
  })

  // Cleanup listener on unmount
  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaChange)
      mediaQuery = null
    }
  })

  /** Set the theme preference */
  function setTheme(value: ThemePreference): void {
    theme.value = value
  }

  /** Toggle between light and dark (if 'system', resolves to opposite of current) */
  function toggleTheme(): void {
    theme.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
