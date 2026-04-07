/**
 * DzContainer -- type definitions.
 *
 * Centered content container with responsive padding and max-width.
 *
 * @module @dzup-ui/core/components/layout/DzContainer
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Maximum width breakpoints for the container */
export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

/** Props for the DzContainer component */
export interface DzContainerProps extends BaseAccessibilityProps {
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth
  /** Whether to apply horizontal padding */
  padding?: boolean
  /** Whether to center the container horizontally */
  centered?: boolean
  /** HTML element to render as */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzContainer */
export interface DzContainerSlots {
  /** Container content */
  default?: () => unknown
}
