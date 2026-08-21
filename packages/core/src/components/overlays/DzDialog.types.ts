/**
 * DzDialog -- Compound dialog type definitions.
 *
 * Uses Reka UI Dialog primitives (ADR-07).
 * Open state via defineModel<boolean>('open') (ADR-16).
 * Typed injection key for compound context (ADR-08).
 *
 * @module @dzup-ui/core/components/overlays/DzDialog
 */

import type { BaseAccessibilityProps, BasePortalProps } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'
import type { DzDialogContentUi } from './DzDialogContent.anatomy.ts'

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzDialog child components via inject */
export interface DzDialogContext {
  /** Current size for content panel */
  size: Ref<'sm' | 'md' | 'lg' | 'xl' | 'full'>
  /** Whether open/close transitions are enabled */
  animated: Ref<boolean>
  /** CSS transition name for the overlay */
  overlayTransition: Ref<string>
  /** CSS transition name for the content panel */
  contentTransition: Ref<string>
}

/** Typed injection key for DzDialog compound context (ADR-08, SCREAMING_SNAKE) */
export const DZ_DIALOG_KEY: InjectionKey<DzDialogContext> = Symbol('dz-dialog')

// ---------------------------------------------------------------------------
// DzDialog (Root) Props
// ---------------------------------------------------------------------------

/** Size options for dialog content panel */
export type DialogContentSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** Props for the DzDialog root component */
export interface DzDialogProps {
  /** Whether the dialog is modal (default true) */
  modal?: boolean
  /** Whether open/close transitions are enabled (default true) */
  animated?: boolean
  /** CSS transition name for the overlay backdrop (default 'dz-dialog-overlay') */
  overlayTransition?: string
  /** CSS transition name for the content panel (default 'dz-dialog-content') */
  contentTransition?: string
}

// ---------------------------------------------------------------------------
// DzDialogContent Props
// ---------------------------------------------------------------------------

/** Props for the DzDialogContent component */
export interface DzDialogContentProps extends BaseAccessibilityProps, BasePortalProps {
  /** Size of the dialog content panel */
  size?: DialogContentSize
  /**
   * When true, the dialog body scrolls within a capped max-height (80vh) and
   * `#header` / `#footer` slots are pinned to the top and bottom of the panel.
   * The default slot is used as the scrollable body.
   */
  scrollable?: boolean
  /**
   * Additional class applied to the overlay owned by DzDialogContent.
   *
   * @deprecated since the `ui` prop landed (ADR-19 §5) — prefer
   * `:ui="{ overlay: … }"`, which names the part rather than singling one node
   * out with a prop of its own. Kept working for one minor series; removing it
   * needs a major changeset. Both apply, with `ui.overlay` last.
   *
   * TODO(remove-after: 0.3.0)
   */
  overlayClass?: string
  /**
   * Per-part class overrides, keyed by the names in
   * `DzDialogContent.anatomy.ts` (ADR-19). `class` continues to apply to the
   * content panel.
   *
   * @example
   * ```vue
   * <DzDialogContent :ui="{ overlay: 'backdrop-blur-sm', footer: 'justify-start' }" />
   * ```
   */
  ui?: DzDialogContentUi
}

// ---------------------------------------------------------------------------
// DzDialogContent Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzDialogContent */
export interface DzDialogContentEmits {
  /** Escape key pressed while dialog is open */
  escapeKeyDown: [event: KeyboardEvent]
  /** Pointer down outside dialog content */
  pointerDownOutside: [event: Event]
  /** Any interaction outside dialog content */
  interactOutside: [event: Event]
  /** Focus event when dialog opens -- call event.preventDefault() to prevent auto-focus */
  openAutoFocus: [event: Event]
  /** Focus event when dialog closes -- call event.preventDefault() to prevent focus return */
  closeAutoFocus: [event: Event]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDialog (Root) */
export interface DzDialogSlots {
  /** DzDialogTrigger, DzDialogContent, and other dialog parts */
  default: () => unknown
}

/** Slot definitions for DzDialogTrigger */
export interface DzDialogTriggerSlots {
  /** Trigger element */
  default: () => unknown
}

/** Slot definitions for DzDialogOverlay */
export interface DzDialogOverlaySlots {
  /** Optional overlay content */
  default?: () => unknown
}

/** Slot definitions for DzDialogContent */
export interface DzDialogContentSlots {
  /** Dialog body content (DzDialogTitle, DzDialogDescription, etc.) */
  default: () => unknown
  /** Sticky header region, rendered above the body when `scrollable` is true */
  header?: () => unknown
  /** Sticky footer region, rendered below the body when `scrollable` is true */
  footer?: () => unknown
}

/** Slot definitions for DzDialogTitle */
export interface DzDialogTitleSlots {
  /** Title text content */
  default: () => unknown
}

/** Slot definitions for DzDialogDescription */
export interface DzDialogDescriptionSlots {
  /** Description text content */
  default: () => unknown
}

/** Props for DzDialogClose */
export interface DzDialogCloseProps {
  /**
   * When true, the close styling (absolute top-right positioning, default X icon)
   * is skipped and the close behaviour is forwarded onto the slotted child element.
   * Use for action buttons (Cancel / Confirm) inside a dialog footer.
   */
  asChild?: boolean
}

/** Slot definitions for DzDialogClose */
export interface DzDialogCloseSlots {
  /** Close button content */
  default?: () => unknown
}
