/**
 * Navigation family — public exports.
 *
 * @module @dzup-ui/core/components/navigation
 */

// ── Anchor (scrollspy section navigation) ──

export type {
  DzAnchorEmits,
  DzAnchorItem,
  DzAnchorItemSlotProps,
  DzAnchorProps,
  DzAnchorSlots,
} from './DzAnchor.types.ts'
export { type AnchorVariantProps, anchorVariants } from './DzAnchor.variants.ts'
export { default as DzAnchor } from './DzAnchor.vue'

// ── BackTop (scroll-to-top affordance) ──

export type {
  DzBackTopEmits,
  DzBackTopProps,
  DzBackTopSlots,
} from './DzBackTop.types.ts'
export { type BackTopVariantProps, backTopVariants } from './DzBackTop.variants.ts'
export { default as DzBackTop } from './DzBackTop.vue'

// ── ColorModeToggle (theme switch control) ──

export type {
  DzColorModeToggleEmits,
  DzColorModeToggleLabels,
  DzColorModeToggleProps,
  DzColorModeToggleSlots,
  DzColorModeToggleVariant,
} from './DzColorModeToggle.types.ts'
export {
  type ColorModeToggleVariantProps,
  colorModeToggleVariants,
} from './DzColorModeToggle.variants.ts'
export { default as DzColorModeToggle } from './DzColorModeToggle.vue'

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

// ── MegaMenu (multi-column navigation) ──

export type {
  DzMegaMenuEmits,
  DzMegaMenuGroup,
  DzMegaMenuGroupSlotProps,
  DzMegaMenuItem,
  DzMegaMenuItemSlotProps,
  DzMegaMenuLink,
  DzMegaMenuLinkSlotProps,
  DzMegaMenuOrientation,
  DzMegaMenuProps,
  DzMegaMenuSlots,
} from './DzMegaMenu.types.ts'
export { type MegaMenuVariantProps, megaMenuVariants } from './DzMegaMenu.variants.ts'
export { default as DzMegaMenu } from './DzMegaMenu.vue'

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
  DzSidebarContext,
  DzSidebarEmits,
  DzSidebarFooterProps,
  DzSidebarFooterSlots,
  DzSidebarHeaderProps,
  DzSidebarHeaderSlots,
  DzSidebarItemEmits,
  DzSidebarItemProps,
  DzSidebarItemSlots,
  DzSidebarProps,
  DzSidebarSectionProps,
  DzSidebarSectionSlots,
  DzSidebarSlots,
} from './DzSidebar.types.ts'

export { DZ_SIDEBAR_KEY } from './DzSidebar.types.ts'

export { type SidebarVariantProps, sidebarVariants } from './DzSidebar.variants.ts'

export { default as DzSidebar } from './DzSidebar.vue'

// ── Stepper (Compound) ──

export { default as DzSidebarFooter } from './DzSidebarFooter.vue'
export { default as DzSidebarHeader } from './DzSidebarHeader.vue'

export { default as DzSidebarItem } from './DzSidebarItem.vue'

export { default as DzSidebarSection } from './DzSidebarSection.vue'

export type {
  DzStepperContext,
  DzStepperEmits,
  DzStepperItemEmits,
  DzStepperItemProps,
  DzStepperItemSlots,
  DzStepperProps,
  DzStepperSlots,
  StepperOrientation,
} from './DzStepper.types.ts'

// ── Segmented ──

export { DZ_STEPPER_KEY } from './DzStepper.types.ts'

export { type StepperVariantProps, stepperVariants } from './DzStepper.variants.ts'

export { default as DzStepper } from './DzStepper.vue'

// ── Sidebar (Compound) ──

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

export { type TabsVariantProps, tabsVariants } from './DzTabs.variants.ts'

export { default as DzTabs } from './DzTabs.vue'

export { default as DzTabTrigger } from './DzTabTrigger.vue'
