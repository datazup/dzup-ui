/**
 * DzSkeleton — type definitions.
 *
 * @module @dzip-ui/core/components/feedback/DzSkeleton
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Shape variant for the skeleton placeholder */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

/** Props for the DzSkeleton component */
export interface DzSkeletonProps {
  /** Shape variant of the skeleton */
  variant?: SkeletonVariant
  /** Custom width (CSS value) */
  width?: string
  /** Custom height (CSS value) */
  height?: string
  /** Number of text lines to render (only for variant="text") */
  lines?: number
  /** Whether to animate the skeleton */
  animate?: boolean
}
