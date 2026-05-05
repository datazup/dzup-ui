/**
 * Feedback family — public exports.
 *
 * @module @dzup-ui/core/components/feedback
 */

// Types — DzAlert
export type {
  DzAlertEmits,
  DzAlertProps,
  DzAlertSlots,
} from './DzAlert.types.ts'
// Variants (for consumer customization)
export { type AlertVariantProps, alertVariants } from './DzAlert.variants.ts'
// Components
export { default as DzAlert } from './DzAlert.vue'
// Types — DzBadge
export type {
  DzBadgeProps,
  DzBadgeSlots,
} from './DzBadge.types.ts'
export { type BadgeVariantProps, badgeVariants } from './DzBadge.variants.ts'
export { default as DzBadge } from './DzBadge.vue'
export type {
  DzEmptyProps,
  DzEmptySlots,
} from './DzEmpty.types.ts'
export { type EmptyVariantProps, emptyVariants } from './DzEmpty.variants.ts'

// ── DzEmpty ──
export { default as DzEmpty } from './DzEmpty.vue'

export type {
  DzNotificationEmits,
  DzNotificationProps,
  DzNotificationSlots,
} from './DzNotification.types.ts'

export {
  notificationCloseVariants,
  notificationDescriptionVariants,
  notificationTitleVariants,
  type NotificationVariantProps,
  notificationVariants,
} from './DzNotification.variants.ts'

// ── DzNotification ──
export { default as DzNotification } from './DzNotification.vue'

// Types — DzProgress
export type {
  DzProgressProps,
  DzProgressSlots,
} from './DzProgress.types.ts'

// Types — DzRunStatusBadge
export type {
  DzRunStatusBadgeProps,
  DzRunStatusBadgeSlots,
} from './DzRunStatusBadge.types.ts'
export { default as DzRunStatusBadge } from './DzRunStatusBadge.vue'

// Types — DzTokenProgressBar
export type {
  DzTokenProgressBarProps,
  DzTokenProgressBarSlotProps,
  DzTokenProgressBarSlots,
} from './DzTokenProgressBar.types.ts'
export { default as DzTokenProgressBar } from './DzTokenProgressBar.vue'

export {
  circularSizeMap,
  type ProgressBarVariantProps,
  progressBarVariants,
  type ProgressTrackVariantProps,
  progressTrackVariants,
} from './DzProgress.variants.ts'

export { default as DzProgress } from './DzProgress.vue'

export type {
  DzResultProps,
  DzResultSlots,
  ResultStatus,
} from './DzResult.types.ts'
export { type ResultVariantProps, resultVariants } from './DzResult.variants.ts'
// ── DzResult ──
export { default as DzResult } from './DzResult.vue'
// Types — DzSkeleton
export type {
  DzSkeletonProps,
  SkeletonVariant,
} from './DzSkeleton.types.ts'
export { type SkeletonVariantProps, skeletonVariants } from './DzSkeleton.variants.ts'
export { default as DzSkeleton } from './DzSkeleton.vue'

// Types — DzSpinner
export type {
  DzSpinnerProps,
} from './DzSpinner.types.ts'

export { type SpinnerVariantProps, spinnerVariants } from './DzSpinner.variants.ts'

export { default as DzSpinner } from './DzSpinner.vue'

// Types — DzToast
export type {
  DzToastContext,
  DzToastEmits,
  DzToastProps,
  DzToastProviderProps,
  DzToastProviderSlots,
  DzToastSlots,
  DzToastViewportProps,
  DzToastViewportSlots,
  ToastItem,
} from './DzToast.types.ts'

// Injection keys (runtime exports)
export { DZ_TOAST_KEY } from './DzToast.types.ts'

export { type ToastVariantProps, toastVariants } from './DzToast.variants.ts'

export { default as DzToast } from './DzToast.vue'

export { default as DzToastProvider } from './DzToastProvider.vue'

export { default as DzToastViewport } from './DzToastViewport.vue'
