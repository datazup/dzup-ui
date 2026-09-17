/**
 * DzImageCard — Type definitions for the card with prominent image.
 *
 * @module @dzup-ui/core/components/cards/DzImageCard
 */

import type { CardVariant } from '@dzup-ui/contracts'
import type { DzImageCardUi } from './DzImageCard.anatomy.ts'

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
  /**
   * Per-part class overrides, keyed by the names in `DzImageCard.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing target (the root surface); `ui`
   * addresses the other parts by name, and a typo is a type error.
   */
  ui?: DzImageCardUi
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
