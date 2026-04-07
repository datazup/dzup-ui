/**
 * DzCaption — Type definitions for the small caption text component.
 *
 * @module @dzup-ui/core/components/typography/DzCaption
 */

/** Semantic tone for caption */
export type CaptionTone = 'default' | 'muted' | 'success' | 'warning' | 'danger'

/** Props for the DzCaption component */
export interface DzCaptionProps {
  /** Semantic color tone */
  tone?: CaptionTone
  /** Unique element ID */
  id?: string
}

/** Slot definitions for DzCaption */
export interface DzCaptionSlots {
  /** Caption text content */
  default: () => unknown
}
