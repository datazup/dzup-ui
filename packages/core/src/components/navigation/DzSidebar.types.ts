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
  /** How the sidebar root positions itself on desktop */
  position: ComputedRef<'static' | 'fixed'>
  /** Visual treatment for active items */
  activeStyle: ComputedRef<'filled' | 'rail'>
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
  /** Controls how the sidebar root positions itself on desktop.
   *  - `static` (default): `relative shrink-0` — sidebar is a flex sibling of the AppShell content panel.
   *  - `fixed`: `fixed inset-y-0 left-0` — legacy positioning; content area must reserve its own offset.
   *  Mobile drawer behavior (when `mobileOpen` is true and `isMobile` is true) overrides position to `fixed` regardless. */
  position?: 'static' | 'fixed'
  /** Pixel breakpoint at or below which the sidebar enters mobile-drawer mode.
   *  Only used when the parent does not pass `isMobile`. Default 1024 (Tailwind `lg`). */
  mobileBreakpoint?: number
  /** Externally controlled mobile state. When provided, the sidebar will not run its own matchMedia listener
   *  and will defer entirely to this prop. Use this when a parent `useSidebar` already detects the breakpoint. */
  isMobile?: boolean
  /** Visual treatment for active items.
   *  - `filled` (default): solid `--dz-sidebar-item-active-bg` background, `--dz-sidebar-item-active-text` foreground. Matches modern dark-sidebar UX.
   *  - `rail`: 3px left border accent, dimmer background. Legacy / minimalist look. */
  activeStyle?: 'filled' | 'rail'
  /** Expanded sidebar width (CSS value) */
  width?: string
  /** Collapsed sidebar width (CSS value) */
  collapsedWidth?: string
  /**
   * Persist the collapsed state to `localStorage` under this key.
   * Hydrates from storage on mount (when running in the browser).
   * No-op during SSR or when storage is unavailable.
   */
  storageKey?: string
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
