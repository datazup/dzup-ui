/**
 * DzDropdownMenu — Type definitions for the dropdown menu compound.
 *
 * Uses Reka UI DropdownMenu primitives (ADR-07).
 *
 * @module @dzup-ui/core/components/overlays/DzDropdownMenu
 */

import type { BaseAccessibilityProps, BasePortalProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Side / Align
// ---------------------------------------------------------------------------

/** Dropdown content side relative to trigger */
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left'

/** Dropdown content alignment */
export type DropdownAlign = 'start' | 'center' | 'end'

// ---------------------------------------------------------------------------
// DzDropdownMenu (Root)
// ---------------------------------------------------------------------------

/** Props for the DzDropdownMenu root component */
export interface DzDropdownMenuProps {
  /** Initial open state when uncontrolled. For controlled use, bind `v-model:open`. */
  defaultOpen?: boolean
  /**
   * Whether the menu traps focus and blocks interaction with the page behind it.
   * Set `false` for menus layered over live page chrome, such as a site nav.
   */
  modal?: boolean
}

/** Slot definitions for DzDropdownMenu root */
export interface DzDropdownMenuSlots {
  /** Trigger and content children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzDropdownMenuTrigger
// ---------------------------------------------------------------------------

/** Slot definitions for DzDropdownMenuTrigger */
export interface DzDropdownMenuTriggerSlots {
  /** Trigger element */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzDropdownMenuContent
// ---------------------------------------------------------------------------

/** Props for the DzDropdownMenuContent component */
export interface DzDropdownMenuContentProps extends BaseAccessibilityProps, BasePortalProps {
  /** Side of trigger to render content */
  side?: DropdownSide
  /** Alignment relative to the trigger */
  align?: DropdownAlign
  /** Offset from trigger in pixels */
  sideOffset?: number
}

/** Events emitted by DzDropdownMenuContent */
export interface DzDropdownMenuContentEmits {
  /** Escape key pressed */
  escapeKeyDown: [event: KeyboardEvent]
  /** Pointer down outside content */
  pointerDownOutside: [event: Event]
}

/** Slot definitions for DzDropdownMenuContent */
export interface DzDropdownMenuContentSlots {
  /** Menu items and groups */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzDropdownMenuItem
// ---------------------------------------------------------------------------

/** Props for the DzDropdownMenuItem component */
export interface DzDropdownMenuItemProps {
  /** Whether the item is disabled */
  disabled?: boolean
}

/** Events emitted by DzDropdownMenuItem */
export interface DzDropdownMenuItemEmits {
  /** Item selected (clicked or Enter key) */
  select: [event: Event]
}

/** Slot definitions for DzDropdownMenuItem */
export interface DzDropdownMenuItemSlots {
  /** Item content (label) */
  default: () => unknown
  /** Leading icon or marker, aligned to the start of the row */
  prefix?: () => unknown
  /** Trailing content (e.g., keyboard shortcut hint), aligned to the end */
  suffix?: () => unknown
}

// ---------------------------------------------------------------------------
// DzDropdownMenuSeparator
// ---------------------------------------------------------------------------

/** Slot definitions for DzDropdownMenuSeparator (empty -- no slots) */
export interface DzDropdownMenuSeparatorSlots {
  // No slots — visual divider
}
