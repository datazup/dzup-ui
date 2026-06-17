/**
 * DzBackTop — type definitions.
 *
 * A scroll-to-top affordance: a circular button that fades in once the page (or
 * a scroll container) has scrolled past a threshold and smooth-scrolls back to
 * the top when activated. Rendered on top of `DzFab` so it inherits the button
 * family's tone × variant appearance, sizing, and elevation.
 *
 * @module @dzup-ui/core/components/navigation/DzBackTop
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { DzFabVariant } from '../buttons/DzFab.types.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzBackTop component */
export interface DzBackTopProps extends BaseAccessibilityProps {
  /**
   * Accessible label for the button. Defaults to `'Back to top'`. The button is
   * icon-only, so an accessible name is always rendered.
   */
  ariaLabel?: string
  /** Scroll distance (px) past which the button appears. Defaults to `400`. */
  visibilityHeight?: number
  /**
   * Scroll container to observe and scroll. Defaults to `window` when omitted.
   * Pass an element ref to anchor the affordance to an inner scroll area.
   */
  target?: HTMLElement | Window | null
  /**
   * Smooth-scroll duration in milliseconds. `0` (or `prefers-reduced-motion`)
   * jumps instantly. Defaults to `400`.
   */
  duration?: number
  /** Visual style variant (delegated to DzFab). */
  variant?: DzFabVariant
  /** Component size (delegated to DzFab). */
  size?: CanonicalSize
  /** Semantic color tone (delegated to DzFab). */
  tone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzBackTop */
export interface DzBackTopEmits {
  /** Native click event, fired after the scroll-to-top action is triggered. */
  click: [event: MouseEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzBackTop */
export interface DzBackTopSlots {
  /** Icon content. Overrides the default up-arrow glyph. */
  default?: () => unknown
}
