/**
 * DzImageCard — Type definitions for the card with prominent image.
 *
 * @module @dzip-ui/core/components/cards/DzImageCard
 */

/** Card variant */
export type ImageCardVariant = 'elevated' | 'outlined'

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
