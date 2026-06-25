/**
 * Feedback family — public exports.
 *
 * @module @dzup-ui/core/components/feedback
 */

// Types — DzAlert
export type { DzAlertEmits, DzAlertProps, DzAlertSlots } from './DzAlert.types.ts'
// Variants (for consumer customization)
export { type AlertVariantProps, alertVariants } from './DzAlert.variants.ts'
// Components
export { default as DzAlert } from './DzAlert.vue'
// Types — DzBadge
export type { DzBadgeProps, DzBadgeSlots } from './DzBadge.types.ts'
export { type BadgeVariantProps, badgeVariants } from './DzBadge.variants.ts'
export { default as DzBadge } from './DzBadge.vue'
export type { DzEmptyProps, DzEmptySlots } from './DzEmpty.types.ts'
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
export type { DzProgressProps, DzProgressSlots } from './DzProgress.types.ts'

export {
  circularSizeMap,
  type ProgressBarVariantProps,
  progressBarVariants,
  type ProgressTrackVariantProps,
  progressTrackVariants,
} from './DzProgress.variants.ts'
export { default as DzProgress } from './DzProgress.vue'

// Types — DzScrollProgress
export type {
  DzScrollProgressEmits,
  DzScrollProgressProps,
  DzScrollProgressSlots,
} from './DzScrollProgress.types.ts'

export { scrollProgressTokens } from './DzScrollProgress.tokens.ts'

export {
  type ScrollProgressBarVariantProps,
  scrollProgressBarVariants,
  scrollProgressCircularSize,
  type ScrollProgressRootVariantProps,
  scrollProgressRootVariants,
  scrollProgressToneVar,
} from './DzScrollProgress.variants.ts'

export { default as DzScrollProgress } from './DzScrollProgress.vue'

// Types — DzMeterGroup
export type {
  DzMeterGroupComputedSegment,
  DzMeterGroupOrientation,
  DzMeterGroupProps,
  DzMeterGroupSegment,
  DzMeterGroupSlotProps,
  DzMeterGroupSlots,
} from './DzMeterGroup.types.ts'

export { meterGroupPalette, meterGroupToneColors, meterGroupTokens } from './DzMeterGroup.tokens.ts'

export {
  meterGroupLegendItemVariants,
  meterGroupLegendSwatchVariants,
  meterGroupLegendVariants,
  meterGroupRootVariants,
  meterGroupSegmentVariants,
  type MeterGroupSegmentVariantProps,
  type MeterGroupTrackVariantProps,
  meterGroupTrackVariants,
} from './DzMeterGroup.variants.ts'

export { default as DzMeterGroup } from './DzMeterGroup.vue'

export type { DzResultProps, DzResultSlots, ResultStatus } from './DzResult.types.ts'
export { type ResultVariantProps, resultVariants } from './DzResult.variants.ts'

// ── DzResult ──
export { default as DzResult } from './DzResult.vue'

// Types — DzRunStatusBadge
export type { DzRunStatusBadgeProps, DzRunStatusBadgeSlots } from './DzRunStatusBadge.types.ts'

export { default as DzRunStatusBadge } from './DzRunStatusBadge.vue'
// Types — DzSkeleton
export type { DzSkeletonProps, SkeletonVariant } from './DzSkeleton.types.ts'
export { type SkeletonVariantProps, skeletonVariants } from './DzSkeleton.variants.ts'
export { default as DzSkeleton } from './DzSkeleton.vue'
// Types — DzSpinner
export type { DzSpinnerProps } from './DzSpinner.types.ts'
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

// Types — DzErrorBoundary
export type { DzErrorBoundaryProps, DzErrorBoundarySlots } from './DzErrorBoundary.types.ts'
export { default as DzErrorBoundary } from './DzErrorBoundary.vue'

// Types — DzAsyncBoundary
export type {
  DzAsyncBoundaryEmits,
  DzAsyncBoundaryProps,
  DzAsyncBoundarySlots,
} from './DzAsyncBoundary.types.ts'
export { default as DzAsyncBoundary } from './DzAsyncBoundary.vue'

// Types — DzBlockUI
export type {
  DzBlockUIEmits,
  DzBlockUIProps,
  DzBlockUISlotProps,
  DzBlockUISlots,
} from './DzBlockUI.types.ts'
export { blockUiTokens } from './DzBlockUI.tokens.ts'
export { type BlockUiVariantProps, blockUiVariants } from './DzBlockUI.variants.ts'
export { default as DzBlockUI } from './DzBlockUI.vue'

// Types — DzTokenProgressBar
export type {
  DzTokenProgressBarProps,
  DzTokenProgressBarSlotProps,
  DzTokenProgressBarSlots,
} from './DzTokenProgressBar.types.ts'

export { default as DzTokenProgressBar } from './DzTokenProgressBar.vue'

// Types — TeamMemberBadge
export type {
  TeamMemberBadgeProps,
  TeamMemberBadgeSlots,
  TeamMemberStatus,
} from './TeamMemberBadge.types.ts'
export { TEAM_MEMBER_STATUS_TOKENS } from './TeamMemberBadge.tokens.ts'
export {
  teamMemberBadgeVariants,
  type TeamMemberBadgeVariantProps,
} from './TeamMemberBadge.variants.ts'
export { default as TeamMemberBadge } from './TeamMemberBadge.vue'

// Types — GovernanceBadge
export type {
  CoordinatorPattern,
  GovernanceBadgeProps,
  GovernanceBadgeSlots,
} from './GovernanceBadge.types.ts'
export { GOVERNANCE_PATTERN_TOKENS } from './GovernanceBadge.tokens.ts'
export {
  governanceBadgeVariants,
  type GovernanceBadgeVariantProps,
} from './GovernanceBadge.variants.ts'
export { default as GovernanceBadge } from './GovernanceBadge.vue'
