/**
 * Navigation family — public exports.
 *
 * @module @dzup-ui/core/components/navigation
 */

// ── Tabs (Compound) ──

export type {
  DzBreadcrumbContext,
  DzBreadcrumbItemProps,
  DzBreadcrumbItemSlots,
  DzBreadcrumbProps,
  DzBreadcrumbSeparatorProps,
  DzBreadcrumbSeparatorSlots,
  DzBreadcrumbSlots,
} from './DzBreadcrumb.types.ts'
export { DZ_BREADCRUMB_KEY } from './DzBreadcrumb.types.ts'
export { type BreadcrumbVariantProps, breadcrumbVariants } from './DzBreadcrumb.variants.ts'
export { default as DzBreadcrumb } from './DzBreadcrumb.vue'

export { default as DzBreadcrumbItem } from './DzBreadcrumbItem.vue'

export { default as DzBreadcrumbSeparator } from './DzBreadcrumbSeparator.vue'

export type {
  DzMenuContext,
  DzMenuItemEmits,
  DzMenuItemProps,
  DzMenuItemSlots,
  DzMenuProps,
  DzMenuSeparatorProps,
  DzMenuSlots,
} from './DzMenu.types.ts'

// ── Breadcrumb (Compound) ──

export { DZ_MENU_KEY } from './DzMenu.types.ts'
export { type MenuVariantProps, menuVariants } from './DzMenu.variants.ts'
export { default as DzMenu } from './DzMenu.vue'

export { default as DzMenuItem } from './DzMenuItem.vue'

export { default as DzMenuSeparator } from './DzMenuSeparator.vue'

export type {
  DzPaginationEmits,
  DzPaginationProps,
  DzPaginationSlots,
} from './DzPagination.types.ts'

// ── Pagination ──

export { type PaginationVariantProps, paginationVariants } from './DzPagination.variants.ts'

export { default as DzPagination } from './DzPagination.vue'

export type {
  DzSegmentedEmits,
  DzSegmentedProps,
  DzSegmentedSlots,
  SegmentedItem,
} from './DzSegmented.types.ts'

// ── Menu (Compound) ──

export { type SegmentedVariantProps, segmentedVariants } from './DzSegmented.variants.ts'
export { default as DzSegmented } from './DzSegmented.vue'
export type {
  DzStepperContext,
  DzStepperEmits,
  DzStepperItemProps,
  DzStepperItemSlots,
  DzStepperProps,
  DzStepperSlots,
  StepperOrientation,
} from './DzStepper.types.ts'

export { DZ_STEPPER_KEY } from './DzStepper.types.ts'

export { type StepperVariantProps, stepperVariants } from './DzStepper.variants.ts'

export { default as DzStepper } from './DzStepper.vue'

// ── Stepper (Compound) ──

export { default as DzStepperItem } from './DzStepperItem.vue'
export { default as DzTabContent } from './DzTabContent.vue'

export { default as DzTabList } from './DzTabList.vue'

export type {
  DzTabContentProps,
  DzTabContentSlots,
  DzTabListProps,
  DzTabListSlots,
  DzTabsContext,
  DzTabsEmits,
  DzTabsProps,
  DzTabsSlots,
  DzTabTriggerProps,
  DzTabTriggerSlots,
} from './DzTabs.types.ts'

export { DZ_TABS_KEY } from './DzTabs.types.ts'

// ── Segmented ──

export { type TabsVariantProps, tabsVariants } from './DzTabs.variants.ts'

export { default as DzTabs } from './DzTabs.vue'

export { default as DzTabTrigger } from './DzTabTrigger.vue'
