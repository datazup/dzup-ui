/**
 * DzMegaMenu — Type definitions for the multi-column navigation menu.
 *
 * A horizontal (or vertical) menubar whose top-level items open wide,
 * multi-column dropdown panels. Model-driven via the `items` prop.
 *
 * a11y follows the WAI-ARIA menubar pattern (role="menubar" + roving
 * tabindex). On small screens (`breakpoint`) it collapses into a stacked
 * disclosure/accordion menu.
 *
 * @module @dzup-ui/core/components/navigation/DzMegaMenu
 */

import type { BaseAccessibilityProps, CanonicalSize, Orientation } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

/** A single navigable link rendered inside a panel column. */
export interface DzMegaMenuLink {
  /** Display label */
  label: string
  /** Stable key (falls back to `label` when omitted) */
  key?: string
  /** URL to navigate to (renders as <a>); omit for button semantics */
  href?: string
  /** Secondary description line (rendered by the default #link template) */
  description?: string
  /** Whether the link is disabled */
  disabled?: boolean
}

/** A column / group of links inside a top-level item's panel. */
export interface DzMegaMenuGroup {
  /** Optional column heading */
  label?: string
  /** Stable key (falls back to `label`/index when omitted) */
  key?: string
  /** Links rendered in this column */
  items: DzMegaMenuLink[]
  /** Render this group as a featured card (consumed by the #group slot) */
  featured?: boolean
}

/** A top-level menubar item. Opens a panel when it has `items` (columns). */
export interface DzMegaMenuItem {
  /** Display label for the menubar trigger */
  label: string
  /** Stable key (falls back to `label`/index when omitted) */
  key?: string
  /** Column groups rendered in the dropdown panel */
  items?: DzMegaMenuGroup[]
  /** Direct navigation URL for items without a panel (renders as <a>) */
  href?: string
  /** Whether the top-level item is disabled */
  disabled?: boolean
}

/** Menubar orientation */
export type DzMegaMenuOrientation = Orientation

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzMegaMenu component */
export interface DzMegaMenuProps extends BaseAccessibilityProps {
  /** Top-level items, each optionally owning multi-column panel groups */
  items: DzMegaMenuItem[]
  /** Menubar orientation */
  orientation?: DzMegaMenuOrientation
  /** Component size */
  size?: CanonicalSize
  /** Open panels on pointer hover (in addition to click / keyboard) */
  openOnHover?: boolean
  /**
   * Viewport width (px) at or below which the menu collapses into a stacked
   * accordion. Uses matchMedia; ignored when `collapsed` is set explicitly.
   */
  breakpoint?: number
  /** Force the collapsed (stacked accordion) layout regardless of viewport */
  collapsed?: boolean
  /** Disabled state — prevents all interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzMegaMenu */
export interface DzMegaMenuEmits {
  /** A panel link was activated */
  select: [link: DzMegaMenuLink, item: DzMegaMenuItem]
  /** A top-level panel opened (payload: item index) */
  open: [index: number]
  /** A top-level panel closed (payload: item index) */
  close: [index: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `#item` slot (custom trigger rendering) */
export interface DzMegaMenuItemSlotProps {
  /** The top-level item */
  item: DzMegaMenuItem
  /** Index among top-level items */
  index: number
  /** Whether this item's panel is currently open */
  open: boolean
}

/** Props passed to the `#group` slot (custom column / featured-card rendering) */
export interface DzMegaMenuGroupSlotProps {
  /** The column group */
  group: DzMegaMenuGroup
  /** The owning top-level item */
  item: DzMegaMenuItem
  /** Index of the column within the panel */
  index: number
}

/** Props passed to the `#link` slot (custom link rendering) */
export interface DzMegaMenuLinkSlotProps {
  /** The link */
  link: DzMegaMenuLink
  /** The owning column group */
  group: DzMegaMenuGroup
}

/** Slot definitions for DzMegaMenu */
export interface DzMegaMenuSlots {
  /** Custom top-level trigger content. Defaults to the item label + caret. */
  item?: (props: DzMegaMenuItemSlotProps) => unknown
  /** Custom column / featured-card content. Defaults to heading + links. */
  group?: (props: DzMegaMenuGroupSlotProps) => unknown
  /** Custom link content. Defaults to label + optional description. */
  link?: (props: DzMegaMenuLinkSlotProps) => unknown
}
