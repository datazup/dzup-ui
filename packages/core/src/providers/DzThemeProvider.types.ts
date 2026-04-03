/**
 * DzThemeProvider — Type definitions.
 *
 * Defines the provider props, context interface, and typed injection key (ADR-08).
 * The context shape follows ADR-09: minimal useTheme API
 * (theme, resolvedTheme, setTheme, toggleTheme — no getToken/getCssVar).
 *
 * @module @dzup-ui/core/providers/DzThemeProvider
 */

import type { ComputedRef, InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Theme value types
// ---------------------------------------------------------------------------

/** User-selectable theme preference */
export type ThemePreference = 'light' | 'dark' | 'system'

/** Resolved theme after accounting for system preference (never 'system') */
export type ResolvedTheme = 'light' | 'dark'

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

/** Props for the DzThemeProvider component */
export interface DzThemeProviderProps {
  /** Initial theme when no persisted value exists */
  defaultTheme?: ThemePreference
  /** localStorage key for theme persistence (ADR-15) */
  storageKey?: string
  /** HTML attribute name set on document.documentElement */
  attribute?: string
}

// ---------------------------------------------------------------------------
// Context (ADR-08 + ADR-09)
// ---------------------------------------------------------------------------

/** Theme context provided to descendants via inject (ADR-09 minimal API) */
export interface DzThemeContext {
  /** Current theme preference ('light' | 'dark' | 'system') */
  theme: Ref<ThemePreference>
  /** Resolved actual theme — accounts for system preference when theme is 'system' */
  resolvedTheme: ComputedRef<ResolvedTheme>
  /** Set the theme preference */
  setTheme: (theme: ThemePreference) => void
  /** Toggle between light and dark (resolves 'system' to its opposite) */
  toggleTheme: () => void
}

/** Typed injection key for DzThemeProvider context (ADR-08, SCREAMING_SNAKE) */
export const DZ_THEME_KEY: InjectionKey<DzThemeContext> = Symbol('dz-theme')
