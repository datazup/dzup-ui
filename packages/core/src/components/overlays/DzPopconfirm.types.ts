/**
 * DzPopconfirm -- Type definitions for the inline confirmation popover.
 *
 * A lightweight "are you sure?" bubble anchored to its trigger -- the standard
 * pattern for low-risk destructive actions in tables and toolbars, where a full
 * modal (DzConfirmDialog) would be too heavy. Positioning reuses the shared
 * `useFloating` composable (ADR-07) so anchoring matches DzPopover/DzTooltip.
 *
 * Open state via defineModel<boolean>('open') (ADR-16) with an uncontrolled
 * fallback so the component can drive itself when `v-model:open` is omitted.
 *
 * @module @dzup-ui/core/components/overlays/DzPopconfirm
 */

import type { BaseAccessibilityProps, CanonicalTone } from '@dzup-ui/contracts'
import type { Component } from 'vue'
import type { FloatingPlacement } from '../../composables/useFloating/index.ts'

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

/** Placement of the popover relative to its trigger (mirrors floating-ui). */
export type PopconfirmPlacement = FloatingPlacement

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPopconfirm component. */
export interface DzPopconfirmProps extends BaseAccessibilityProps {
  /** Title / question rendered as the popover heading. */
  title: string
  /** Optional supporting description rendered below the title. */
  description?: string
  /** Label for the confirm action button. Defaults to `Confirm`. */
  confirmText?: string
  /** Label for the cancel action button. Defaults to `Cancel`. */
  cancelText?: string
  /**
   * Semantic tone applied to the leading icon and confirm button.
   * Defaults to `danger` since the common case is a destructive action.
   */
  tone?: CanonicalTone
  /** Optional leading icon component (e.g. from lucide-vue-next). */
  icon?: Component
  /** Placement of the popover relative to the trigger. Defaults to `top`. */
  placement?: PopconfirmPlacement
  /**
   * Whether the confirm action is in progress. While truthy the popover stays
   * open, the confirm button shows a spinner, and the cancel button is disabled.
   * Drive this from an async `@confirm` handler to keep the popover open until
   * the work settles.
   */
  loading?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzPopconfirm.
 *
 * Note: `update:open` is provided implicitly by `defineModel` (ADR-16) and is
 * therefore not declared here.
 */
export interface DzPopconfirmEmits {
  /** User confirmed the action via the confirm button. */
  confirm: []
  /** User dismissed via cancel, Escape, or an outside click. */
  cancel: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPopconfirm. */
export interface DzPopconfirmSlots {
  /** The trigger element the popover anchors to. */
  default?: () => unknown
  /** Custom popover body (replaces the default title + description). */
  content?: () => unknown
  /** Custom leading icon (replaces the `icon` prop). */
  icon?: () => unknown
}
