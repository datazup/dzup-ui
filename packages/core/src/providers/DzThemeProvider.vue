<!--
  DzThemeProvider — Provides theme context to the component tree.

  Uses provide() with DZ_THEME_KEY (ADR-08) to expose the minimal
  useTheme API (ADR-09): theme, resolvedTheme, setTheme, toggleTheme.

  Persists to localStorage key (default 'dz-theme') and sets a data
  attribute on document.documentElement (ADR-15).

  SSR-safe: all window/document access is deferred to onMounted().

  @module @dzip-ui/core/providers/DzThemeProvider
-->

<script setup lang="ts">
import type { DzThemeProviderProps, ResolvedTheme, ThemePreference } from './DzThemeProvider.types'
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { DZ_THEME_KEY } from './DzThemeProvider.types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = withDefaults(defineProps<DzThemeProviderProps>(), {
  defaultTheme: 'system',
  storageKey: 'dz-theme',
  attribute: 'data-theme',
})

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
    const stored = localStorage.getItem(props.storageKey)
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
    localStorage.setItem(props.storageKey, value)
  }
  catch {
    // Silently ignore storage errors
  }
}

/** Apply the theme attribute to document.documentElement */
function applyAttribute(resolved: ResolvedTheme): void {
  if (!isBrowser())
    return
  document.documentElement.setAttribute(props.attribute, resolved)
}

// ---------------------------------------------------------------------------
// Reactive state
// ---------------------------------------------------------------------------

const theme = ref<ThemePreference>(readPersistedTheme() ?? props.defaultTheme)
const systemPrefersDark = ref(false)

/** Resolved theme: converts 'system' to actual light/dark */
const resolvedTheme = computed<ResolvedTheme>(() => {
  if (theme.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light'
  }
  return theme.value
})

// ---------------------------------------------------------------------------
// Media query listener
// ---------------------------------------------------------------------------

let mediaQuery: MediaQueryList | null = null

function handleMediaChange(event: MediaQueryListEvent): void {
  systemPrefersDark.value = event.matches
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------

// Sync resolved theme to DOM attribute
watch(resolvedTheme, (resolved) => {
  applyAttribute(resolved)
})

// Persist preference changes to localStorage
watch(theme, (value) => {
  persistTheme(value)
})

// ---------------------------------------------------------------------------
// SSR-safe lifecycle (ADR-15)
// ---------------------------------------------------------------------------

onMounted(() => {
  if (!isBrowser())
    return

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemPrefersDark.value = mediaQuery.matches

  mediaQuery.addEventListener('change', handleMediaChange)

  // Apply initial theme attribute
  applyAttribute(resolvedTheme.value)
})

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange)
    mediaQuery = null
  }
})

// ---------------------------------------------------------------------------
// Public API (ADR-09 minimal)
// ---------------------------------------------------------------------------

/** Set the theme preference */
function setTheme(value: ThemePreference): void {
  theme.value = value
}

/** Toggle between light and dark (if 'system', resolves to opposite of current) */
function toggleTheme(): void {
  theme.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
}

// ---------------------------------------------------------------------------
// Provide context (ADR-08)
// ---------------------------------------------------------------------------

provide(DZ_THEME_KEY, {
  theme,
  resolvedTheme,
  setTheme,
  toggleTheme,
})
</script>

<template>
  <slot />
</template>
