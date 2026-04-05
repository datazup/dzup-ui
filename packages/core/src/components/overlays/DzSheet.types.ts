/**
 * DzSheet — Type definitions for the slide-out side panel.
 *
 * Uses Reka UI DialogRoot with sheet styling (ADR-07).
 * v-model via defineModel<boolean>('open') (ADR-16).
 *
 * @module @dzip-ui/core/components/overlays/DzSheet
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'

/** Sheet slide direction */
export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

// ---------------------------------------------------------------------------
// DzSheet (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzSheet root component */
export interface DzSheetProps {
  /** Whether the sheet is modal (default true) */
  modal?: boolean
}

// ---------------------------------------------------------------------------
// DzSheetContent Props
// ---------------------------------------------------------------------------

/** Props for the DzSheetContent component */
export interface DzSheetContentProps extends BaseAccessibilityProps {
  /** Side from which the sheet slides in */
  side?: SheetSide
}

/** Events emitted by DzSheetContent */
export interface DzSheetContentEmits {
  /** Escape key pressed */
  escapeKeyDown: [event: KeyboardEvent]
  /** Pointer down outside sheet content */
  pointerDownOutside: [event: Event]
  /** Any interaction outside sheet content */
  interactOutside: [event: Event]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSheet root */
export interface DzSheetSlots {
  /** DzSheetTrigger, DzSheetContent, etc. */
  default: () => unknown
}

/** Slot definitions for DzSheetContent */
export interface DzSheetContentSlots {
  /** Sheet body content */
  default: () => unknown
}

/** Slot definitions for DzSheetTrigger */
export interface DzSheetTriggerSlots {
  /** Trigger element */
  default: () => unknown
}

/** Slot definitions for DzSheetClose */
export interface DzSheetCloseSlots {
  /** Close button content */
  default?: () => unknown
}

/** Slot definitions for DzSheetTitle */
export interface DzSheetTitleSlots {
  /** Title text */
  default: () => unknown
}

/** Slot definitions for DzSheetDescription */
export interface DzSheetDescriptionSlots {
  /** Description text */
  default: () => unknown
}
