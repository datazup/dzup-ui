/**
 * DzLightbox — type definitions for the fullscreen image viewer.
 *
 * Uses Reka UI DialogRoot internally for the overlay (ADR-07).
 * v-model via defineModel<boolean> (ADR-16).
 *
 * @module @dzup-ui/core/components/media/DzLightbox
 */

import type {
  BaseAccessibilityProps,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** Image entry for the lightbox viewer */
export interface LightboxImage {
  /** Image source URL */
  src: string
  /** Alt text for the image */
  alt?: string
  /** Caption text shown below the image */
  caption?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzLightbox component */
export interface DzLightboxProps extends BaseAccessibilityProps {
  /** Array of images to display */
  images: LightboxImage[]
  /** Starting image index */
  startIndex?: number
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzLightbox */
export interface DzLightboxEmits {
  /** Emitted when the current image changes */
  change: [index: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzLightbox */
export interface DzLightboxSlots {
  /** Custom trigger that opens the lightbox */
  default?: () => unknown
  /** Custom caption rendering */
  caption?: (props: { image: LightboxImage, index: number }) => unknown
}
