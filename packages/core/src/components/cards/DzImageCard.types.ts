/**
 * DzImageCard — Type definitions for the card with prominent image.
 *
 * @module @dzup-ui/core/components/cards/DzImageCard
 */

import type { CardVariant } from '@dzup-ui/contracts'

/**
 * Card variant — subset of the canonical {@link CardVariant} contract.
 * Image cards don't support the `flat` surface.
 */
export type ImageCardVariant = Extract<CardVariant, 'elevated' | 'outlined'>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzImageCard component */
export interface DzImageCardProps {
  /** Image source URL */
  src: string
  /** Alt text for the image */
  alt: string
  /** Visual style variant */
  variant?: ImageCardVariant
  /** Aspect ratio for the image area (e.g., '16/9') */
  aspectRatio?: string
  /**
   * Native image loading strategy. Defaults to `'lazy'`; set to `'eager'`
   * for above-the-fold / LCP images.
   */
  loading?: 'lazy' | 'eager'
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzImageCard */
export interface DzImageCardSlots {
  /** Card body content below the image */
  default?: () => unknown
  /** Card header content */
  header?: () => unknown
  /** Card footer content */
  footer?: () => unknown
  /** Overlay content on top of the image */
  overlay?: () => unknown
}
