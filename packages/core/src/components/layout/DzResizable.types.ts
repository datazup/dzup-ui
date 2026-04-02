/**
 * DzResizable — type definitions for the compound Resizable panel family.
 *
 * Wraps Reka UI SplitterGroup/SplitterPanel/SplitterResizeHandle (ADR-07).
 * Context injection via DZ_RESIZABLE_KEY (ADR-08).
 *
 * @module @dzup-ui/core/components/layout/DzResizable
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzResizablePanel/Handle children via inject */
export interface DzResizableContext {
  /** Panel layout direction */
  direction: Ref<ResizableDirection>
  /** Component size */
  size: Ref<CanonicalSize>
}

/** Typed injection key for DzResizable context (ADR-08, SCREAMING_SNAKE) */
export const DZ_RESIZABLE_KEY: InjectionKey<DzResizableContext> = Symbol('dz-resizable')

// ---------------------------------------------------------------------------
// Direction type
// ---------------------------------------------------------------------------

/** Layout direction for the resizable group */
export type ResizableDirection = 'horizontal' | 'vertical'

// ---------------------------------------------------------------------------
// DzResizable (Root / SplitterGroup) Props
// ---------------------------------------------------------------------------

/** Props for the DzResizable root component */
export interface DzResizableProps extends BaseAccessibilityProps {
  /** Layout direction of the panels */
  direction?: ResizableDirection
  /** Component size (affects handle dimensions) */
  size?: CanonicalSize
  /** Disabled state — prevents resizing */
  disabled?: boolean
  /** Keyboard resize step in percentage (default 10) */
  keyboardResizeBy?: number
}

// ---------------------------------------------------------------------------
// DzResizable Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzResizable */
export interface DzResizableEmits {
  /** Emitted when any panel layout changes */
  layoutChange: [sizes: number[]]
}

// ---------------------------------------------------------------------------
// DzResizable Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzResizable */
export interface DzResizableSlots {
  /** DzResizablePanel and DzResizableHandle children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzResizablePanel Props
// ---------------------------------------------------------------------------

/** Props for the DzResizablePanel component */
export interface DzResizablePanelProps {
  /** Default panel size as a percentage (0-100) */
  defaultSize?: number
  /** Minimum panel size as a percentage */
  minSize?: number
  /** Maximum panel size as a percentage */
  maxSize?: number
  /** Whether the panel can be collapsed */
  collapsible?: boolean
  /** Size when collapsed (percentage) */
  collapsedSize?: number
  /** Panel order (for keyboard navigation) */
  order?: number
}

/** Slot definitions for DzResizablePanel */
export interface DzResizablePanelSlots {
  /** Panel content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzResizableHandle Props
// ---------------------------------------------------------------------------

/** Props for the DzResizableHandle component */
export interface DzResizableHandleProps {
  /** Whether to show a visual drag indicator */
  withHandle?: boolean
  /** Disabled state */
  disabled?: boolean
}

/** Slot definitions for DzResizableHandle */
export interface DzResizableHandleSlots {
  /** Custom handle indicator */
  default?: () => unknown
}
