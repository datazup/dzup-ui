/**
 * DzDivider -- type definitions.
 *
 * Visual separator with horizontal/vertical orientation
 * and semantic role handling.
 *
 * @module @dzup-ui/core/components/layout/DzDivider
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Divider orientation options */
export type DividerOrientation = 'horizontal' | 'vertical'

/** Props for the DzDivider component */
export interface DzDividerProps extends BaseAccessibilityProps {
  /** Divider orientation */
  orientation?: DividerOrientation
  /** When true, the divider is purely decorative (role="none") */
  decorative?: boolean
}

// ---------------------------------------------------------------------------
// Slots (none)
// ---------------------------------------------------------------------------

/** DzDivider has no slots */
export type DzDividerSlots = Record<string, never>
