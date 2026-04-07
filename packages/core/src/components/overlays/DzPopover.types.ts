/**
 * DzPopover -- Compound popover type definitions.
 *
 * Uses Reka UI Popover primitives (ADR-07).
 * Open state via defineModel<boolean>('open') (ADR-16).
 *
 * @module @dzup-ui/core/components/overlays/DzPopover
 */

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

/** Side placement for popover content */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

/** Alignment along the side axis */
export type PopoverAlign = 'start' | 'center' | 'end'

/** Size options for popover content */
export type PopoverContentSize = 'sm' | 'md' | 'lg'

// ---------------------------------------------------------------------------
// DzPopover (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzPopover root component */
export interface DzPopoverProps {
  /** Whether the popover is modal (traps focus and blocks outside interaction) */
  modal?: boolean
}

// ---------------------------------------------------------------------------
// DzPopoverContent Props
// ---------------------------------------------------------------------------

/** Props for the DzPopoverContent component */
export interface DzPopoverContentProps {
  /** Side to place the popover */
  side?: PopoverSide
  /** Offset from the trigger in px */
  sideOffset?: number
  /** Alignment along the side axis */
  align?: PopoverAlign
  /** Whether to show the arrow (default true) */
  arrow?: boolean
  /** Size of the popover panel */
  size?: PopoverContentSize
}

// ---------------------------------------------------------------------------
// DzPopoverContent Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzPopoverContent */
export interface DzPopoverContentEmits {
  /** Escape key pressed while popover is open */
  escapeKeyDown: [event: KeyboardEvent]
  /** Pointer down outside popover content */
  pointerDownOutside: [event: Event]
  /** Any interaction outside popover content */
  interactOutside: [event: Event]
  /** Focus event when popover opens */
  openAutoFocus: [event: Event]
  /** Focus event when popover closes */
  closeAutoFocus: [event: Event]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPopover (Root) */
export interface DzPopoverSlots {
  /** DzPopoverTrigger and DzPopoverContent */
  default: () => unknown
}

/** Slot definitions for DzPopoverTrigger */
export interface DzPopoverTriggerSlots {
  /** Trigger element */
  default: () => unknown
}

/** Slot definitions for DzPopoverContent */
export interface DzPopoverContentSlots {
  /** Popover body content */
  default: () => unknown
}
