/**
 * DzColorModeToggle — type definitions.
 *
 * A ready-made light/dark/system theme switch that binds to the existing
 * DzThemeProvider via `useTheme` (ADR-08/ADR-09). It introduces no parallel
 * theme store: persistence, system-following (`prefers-color-scheme`), and
 * FOUC suppression (ADR-15) are all delegated to the provider.
 *
 * @module @dzup-ui/core/components/navigation/DzColorModeToggle
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { ThemePreference } from '../../providers/DzThemeProvider.types.ts'

// ---------------------------------------------------------------------------
// Variant taxonomy
// ---------------------------------------------------------------------------

/**
 * Rendering style of the toggle:
 * - `icon` — a single button that cycles through the available modes.
 * - `switch` — a DzSwitch-style control (light ⇄ dark).
 * - `segmented` — an explicit light / dark / system segmented control.
 */
export type DzColorModeToggleVariant = 'icon' | 'switch' | 'segmented'

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

/** Per-mode label overrides for i18n. Each falls back to an English default. */
export interface DzColorModeToggleLabels {
  /** Label for the light mode. Defaults to `'Light'`. */
  light?: string
  /** Label for the dark mode. Defaults to `'Dark'`. */
  dark?: string
  /** Label for the system mode. Defaults to `'System'`. */
  system?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzColorModeToggle component */
export interface DzColorModeToggleProps extends BaseAccessibilityProps {
  /** Rendering style. Defaults to `'icon'`. */
  variant?: DzColorModeToggleVariant
  /**
   * Include the `'system'` option (follow OS `prefers-color-scheme`).
   * When `false`, the control only switches between explicit light and dark.
   * Defaults to `true`.
   */
  showSystem?: boolean
  /** Component size (delegated to the underlying control). Defaults to `'md'`. */
  size?: CanonicalSize
  /** Per-mode label overrides for i18n. */
  labels?: DzColorModeToggleLabels
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzColorModeToggle */
export interface DzColorModeToggleEmits {
  /** The theme preference changed as a result of user interaction. */
  change: [theme: ThemePreference]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzColorModeToggle */
export interface DzColorModeToggleSlots {
  /**
   * Override the rendered glyph for a given mode (icon / switch variants).
   * Receives the resolved mode and the active theme preference.
   */
  icon?: (props: { mode: 'light' | 'dark' | 'system', theme: ThemePreference }) => unknown
}
