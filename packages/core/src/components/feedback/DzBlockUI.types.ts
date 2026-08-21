/**
 * DzBlockUI — type definitions.
 *
 * A content-loading mask: overlays a scrim + spinner over its slotted content
 * (or the whole viewport) during async work, blocking pointer and keyboard
 * interaction with the region without unmounting it (unlike DzAsyncBoundary,
 * which replaces the subtree). Scroll position and DOM state are preserved.
 *
 * @module @dzup-ui/core/components/feedback/DzBlockUI
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzBlockUI component */
export interface DzBlockUIProps extends BaseAccessibilityProps {
  /**
   * Portal target for the teleported layer.
   *
   * Added by TASK-OSS-P4-04. This component used to teleport to a hard-coded
   * `body` with no way to redirect it — which is precisely the case an
   * application embedding the library in a shadow root or a micro-frontend
   * shell cannot work around. Falls back to the `DzProvider` target, then to
   * `document.body`.
   */
  portalTo?: string | HTMLElement
  /**
   * Mask the entire viewport instead of just the slotted region. When `true`
   * the overlay is teleported to `<body>` and fixed over the screen, and
   * keyboard focus is trapped within the overlay.
   */
  fullScreen?: boolean
  /** Optional message rendered beneath the default spinner. */
  message?: string
  /** Semantic color tone for the default spinner. */
  tone?: CanonicalTone
  /** Size of the default spinner. */
  spinnerSize?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzBlockUI. The `update:blocked` event backing
 * `v-model:blocked` is declared implicitly by `defineModel`.
 */
export interface DzBlockUIEmits {
  /** Fired after the region becomes blocked and focus has been contained. */
  block: []
  /** Fired after the region is unblocked and prior focus has been restored. */
  unblock: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot props shared with the overlay slot. */
export interface DzBlockUISlotProps {
  /** Whether the region is currently blocked. */
  blocked: boolean
}

/** Slot definitions for DzBlockUI */
export interface DzBlockUISlots {
  /** The content to mask while blocked. */
  default?: () => unknown
  /** Custom overlay content (replaces the default spinner + message). */
  overlay?: (props: DzBlockUISlotProps) => unknown
}
