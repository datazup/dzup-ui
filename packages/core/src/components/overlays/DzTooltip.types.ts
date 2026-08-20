/**
 * DzTooltip -- Compound tooltip type definitions.
 *
 * Uses Reka UI Tooltip primitives (ADR-07).
 * Open state via defineModel<boolean>('open') (ADR-16).
 *
 * @module @dzup-ui/core/components/overlays/DzTooltip
 */

import type { BasePortalProps } from '@dzup-ui/contracts'

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
export interface DzTooltipContentProps extends /* @vue-ignore */ BasePortalProps {
  // Vue's SFC compiler cannot resolve the imported base interface through the
  // source-linked Research App portal. Keep the contract extension for TypeScript
  // consumers, while declaring these fields locally so they remain runtime props
  // rather than becoming fallthrough attributes.
  /** Portal target. Defaults to `document.body` when omitted. */
  portalTo?: string | HTMLElement
  /** Render inline instead of teleporting to the portal target. */
  portalDisabled?: boolean
  /** Defer target resolution until the application has mounted. */
  portalDefer?: boolean
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
