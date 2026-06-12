/**
 * DzFab — type definitions.
 *
 * A floating action button (FAB): a circular, elevated button that surfaces a
 * single persistent primary action (compose, add, ask AI). Built on the
 * DzIconButton / DzButton appearance API but rendered as a circle with an
 * elevation shadow and optional fixed screen positioning.
 *
 * @module @dzup-ui/core/components/buttons/DzFab
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Variant / position unions
// ---------------------------------------------------------------------------

/**
 * Visual style for a FAB. A deliberate subset of `ButtonVariant` — a FAB is a
 * filled affordance, so `text`/`link` do not apply.
 */
export type DzFabVariant = 'solid' | 'outline' | 'ghost'

/**
 * Where the FAB is pinned. `static` keeps the button in normal flow (the
 * default — positioning is left to the consumer / parent SpeedDial); the
 * corner values apply `position: fixed` with a token-driven viewport offset.
 */
export type DzFabPosition =
  | 'static'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzFab component */
export interface DzFabProps extends BaseAccessibilityProps {
  /** Icon component to render. Ignored when the default slot is provided. */
  icon?: Component
  /**
   * Accessible label — REQUIRED. A FAB shows only an icon, so an accessible
   * name must be supplied.
   */
  ariaLabel: string
  /** Visual style variant */
  variant?: DzFabVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state — prevents interaction */
  disabled?: boolean
  /** Loading state — shows spinner and sets aria-busy */
  loading?: boolean
  /** Pin the FAB to a viewport corner (fixed) or leave it in flow (`static`) */
  position?: DzFabPosition
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset'
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzFab */
export interface DzFabEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzFab */
export interface DzFabSlots {
  /** Icon content. Takes precedence over the `icon` prop. */
  default?: () => unknown
}
