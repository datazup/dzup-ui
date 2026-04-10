/**
 * DzSidebar -- type definitions for the compound Sidebar component family.
 *
 * Compound component providing a collapsible navigation sidebar with
 * header, footer, sections, and items.
 * Context injection via DZ_SIDEBAR_KEY (ADR-08).
 *
 * @module @dzup-ui/core/components/navigation/DzSidebar
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to child sidebar components via inject */
export interface DzSidebarContext {
  /** Whether the sidebar is in collapsed (icon-only) state */
  collapsed: Ref<boolean>
  /** Whether the viewport is mobile-width */
  isMobile: ComputedRef<boolean>
}

/** Typed injection key for DzSidebar context (ADR-08, SCREAMING_SNAKE) */
export const DZ_SIDEBAR_KEY: InjectionKey<DzSidebarContext> = Symbol('dz-sidebar')

// ---------------------------------------------------------------------------
// DzSidebar (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzSidebar root component */
export interface DzSidebarProps extends BaseAccessibilityProps {
  /** Whether the sidebar is collapsed to icon-only mode */
  collapsed?: boolean
  /** Whether the mobile overlay sidebar is open */
  mobileOpen?: boolean
  /** Expanded sidebar width (CSS value) */
  width?: string
  /** Collapsed sidebar width (CSS value) */
  collapsedWidth?: string
}

// ---------------------------------------------------------------------------
// DzSidebar Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSidebar */
export interface DzSidebarEmits {
  /** Collapsed state changed */
  'update:collapsed': [value: boolean]
  /** Mobile overlay open state changed */
  'update:mobileOpen': [value: boolean]
}

// ---------------------------------------------------------------------------
// DzSidebar Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSidebar */
export interface DzSidebarSlots {
  /** Sidebar children (header, sections, items, footer) */
  default?: (props: { collapsed: boolean }) => unknown
}

// ---------------------------------------------------------------------------
// DzSidebarItem Props
// ---------------------------------------------------------------------------

/** Props for the DzSidebarItem component */
export interface DzSidebarItemProps extends BaseAccessibilityProps {
  /** Whether this item is currently active */
  active?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Element or component to render as */
  as?: string | object
  /** Native link href (renders as <a>) */
  href?: string
  /** Router link destination (renders as <RouterLink>) */
  to?: string | object
}

/** Events emitted by DzSidebarItem */
export interface DzSidebarItemEmits {
  /** Item was clicked */
  click: [event: MouseEvent]
}

/** Slot definitions for DzSidebarItem */
export interface DzSidebarItemSlots {
  /** Icon displayed before the label */
  icon?: () => unknown
  /** Item label text */
  default?: () => unknown
  /** Badge displayed after the label */
  badge?: () => unknown
}

// ---------------------------------------------------------------------------
// DzSidebarSection Props
// ---------------------------------------------------------------------------

/** Props for the DzSidebarSection component */
export interface DzSidebarSectionProps {
  /** Section title text */
  title?: string
  /** Whether the section can be collapsed */
  collapsible?: boolean
  /** Whether the section is open by default */
  defaultOpen?: boolean
}

/** Slot definitions for DzSidebarSection */
export interface DzSidebarSectionSlots {
  /** Custom section title content */
  title?: () => unknown
  /** Section items */
  default?: () => unknown
}

// ---------------------------------------------------------------------------
// DzSidebarHeader Props
// ---------------------------------------------------------------------------

/** Props for the DzSidebarHeader component */
export interface DzSidebarHeaderProps {
  /** No additional props beyond accessibility */
}

/** Slot definitions for DzSidebarHeader */
export interface DzSidebarHeaderSlots {
  /** Header content with collapsed state */
  default?: (props: { collapsed: boolean }) => unknown
}

// ---------------------------------------------------------------------------
// DzSidebarFooter Props
// ---------------------------------------------------------------------------

/** Props for the DzSidebarFooter component */
export interface DzSidebarFooterProps {
  /** No additional props beyond accessibility */
}

/** Slot definitions for DzSidebarFooter */
export interface DzSidebarFooterSlots {
  /** Footer content with collapsed state */
  default?: (props: { collapsed: boolean }) => unknown
}
