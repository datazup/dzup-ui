/**
 * DzAspectRatio — Type definitions for the aspect ratio container.
 *
 * @module @dzip-ui/core/components/layout/DzAspectRatio
 */

/** Props for the DzAspectRatio component */
export interface DzAspectRatioProps {
  /** Aspect ratio as a number (width / height). Default: 1 */
  ratio?: number
  /** Unique element ID */
  id?: string
}

/** Slot definitions for DzAspectRatio */
export interface DzAspectRatioSlots {
  /** Content to display within the aspect ratio container */
  default: () => unknown
}
