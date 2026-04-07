/**
 * DzImage — Type definitions for the enhanced image component.
 *
 * @module @dzup-ui/core/components/media/DzImage
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzImage component */
export interface DzImageProps extends BaseAccessibilityProps {
  /** Image source URL */
  src: string
  /** Alt text for the image (required for accessibility) */
  alt: string
  /** Fallback image URL to display on error */
  fallback?: string
  /** Whether to lazy-load the image */
  lazy?: boolean
  /** Object-fit behavior */
  fit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Aspect ratio (e.g., '16/9', '1/1') */
  aspectRatio?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzImage */
export interface DzImageEmits {
  /** Image loaded successfully */
  load: [event: Event]
  /** Image failed to load */
  error: [event: Event]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzImage */
export interface DzImageSlots {
  /** Custom loading placeholder */
  loading?: () => unknown
  /** Custom error/fallback content */
  error?: () => unknown
}
