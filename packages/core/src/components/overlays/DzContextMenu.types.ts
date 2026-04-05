/**
 * DzContextMenu — Type definitions for the context menu compound.
 *
 * Uses Reka UI ContextMenu primitives (ADR-07).
 *
 * @module @dzip-ui/core/components/overlays/DzContextMenu
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Side / Align
// ---------------------------------------------------------------------------

/** Context menu content side relative to trigger */
export type ContextMenuSide = 'top' | 'right' | 'bottom' | 'left'

/** Context menu content alignment */
export type ContextMenuAlign = 'start' | 'center' | 'end'

// ---------------------------------------------------------------------------
// DzContextMenu (Root)
// ---------------------------------------------------------------------------

/** Props for the DzContextMenu root component */
export interface DzContextMenuProps {
  /** Whether the context menu is modal (traps focus) */
  modal?: boolean
}

/** Slot definitions for DzContextMenu root */
export interface DzContextMenuSlots {
  /** Trigger and content children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzContextMenuTrigger
// ---------------------------------------------------------------------------

/** Slot definitions for DzContextMenuTrigger */
export interface DzContextMenuTriggerSlots {
  /** Trigger element (right-click target) */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzContextMenuContent
// ---------------------------------------------------------------------------

/** Props for the DzContextMenuContent component */
export interface DzContextMenuContentProps extends BaseAccessibilityProps {
  /** Side of pointer to render content */
  side?: ContextMenuSide
  /** Alignment relative to the pointer */
  align?: ContextMenuAlign
  /** Offset from pointer in pixels */
  sideOffset?: number
}

/** Events emitted by DzContextMenuContent */
export interface DzContextMenuContentEmits {
  /** Escape key pressed */
  escapeKeyDown: [event: KeyboardEvent]
  /** Pointer down outside content */
  pointerDownOutside: [event: Event]
}

/** Slot definitions for DzContextMenuContent */
export interface DzContextMenuContentSlots {
  /** Menu items and groups */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzContextMenuItem
// ---------------------------------------------------------------------------

/** Props for the DzContextMenuItem component */
export interface DzContextMenuItemProps {
  /** Whether the item is disabled */
  disabled?: boolean
}

/** Events emitted by DzContextMenuItem */
export interface DzContextMenuItemEmits {
  /** Item selected (clicked or Enter key) */
  select: [event: Event]
}

/** Slot definitions for DzContextMenuItem */
export interface DzContextMenuItemSlots {
  /** Item content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzContextMenuSeparator
// ---------------------------------------------------------------------------

/** Slot definitions for DzContextMenuSeparator (empty — no slots) */
export interface DzContextMenuSeparatorSlots {
  // No slots — visual divider
}
