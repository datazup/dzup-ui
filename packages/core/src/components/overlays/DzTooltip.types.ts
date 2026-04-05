/**
 * DzTooltip -- Compound tooltip type definitions.
 *
 * Uses Reka UI Tooltip primitives (ADR-07).
 * Open state via defineModel<boolean>('open') (ADR-16).
 *
 * @module @dzip-ui/core/components/overlays/DzTooltip
 */

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

/** Side placement for tooltip content */
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

/** Alignment along the side axis */
export type TooltipAlign = 'start' | 'center' | 'end'

// ---------------------------------------------------------------------------
// DzTooltip (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzTooltip root component */
export interface DzTooltipProps {
  /** Delay in ms before tooltip appears (default 200) */
  delayDuration?: number
  /** Disable hovering over content to keep it open */
  disableHoverableContent?: boolean
}

// ---------------------------------------------------------------------------
// DzTooltipContent Props
// ---------------------------------------------------------------------------

/** Props for the DzTooltipContent component */
export interface DzTooltipContentProps {
  /** Side to place the tooltip (default 'top') */
  side?: TooltipSide
  /** Offset from the trigger in px (default 4) */
  sideOffset?: number
  /** Alignment along the side axis */
  align?: TooltipAlign
  /** Whether to show the arrow (default true) */
  arrow?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTooltip (Root) */
export interface DzTooltipSlots {
  /** DzTooltipTrigger and DzTooltipContent */
  default: () => unknown
}

/** Slot definitions for DzTooltipTrigger */
export interface DzTooltipTriggerSlots {
  /** Trigger element */
  default: () => unknown
}

/** Slot definitions for DzTooltipContent */
export interface DzTooltipContentSlots {
  /** Tooltip body content */
  default: () => unknown
}
