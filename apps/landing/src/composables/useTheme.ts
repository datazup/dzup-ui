import type { ThemePreference } from '@dzup-ui/core/providers'
import { useTheme as useProviderTheme } from '@dzup-ui/core/providers'

/**
 * Landing-friendly aliases over the single DzThemeProvider authority.
 *
 * The previous module-level theme store duplicated provider state and required a
 * two-way synchronization bridge. Consumers now read and mutate the provider
 * context directly, while keeping the landing's established API names.
 */
export type ThemeMode = ThemePreference

export function useTheme() {
  const { resolvedTheme, setTheme, theme, toggleTheme } = useProviderTheme()
  return {
    mode: theme,
    resolved: resolvedTheme,
    setMode: setTheme,
    toggle: toggleTheme,
  }
}

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
