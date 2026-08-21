/**
 * DzTour -- Type definitions for the guided product onboarding tour.
 *
 * A spotlight/coachmark walkthrough that highlights target elements in
 * sequence and shows an anchored popover with title/description/controls.
 * Positioning reuses the shared `useFloating` composable (ADR-07).
 *
 * Open state via defineModel<boolean>('open') and the active step via
 * defineModel<number>('current') (ADR-16).
 *
 * @module @dzup-ui/core/components/overlays/DzTour
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { FloatingPlacement } from '../../composables/useFloating/index.ts'

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

/** Placement of the step popover relative to its target (mirrors floating-ui). */
export type TourPlacement = FloatingPlacement

/**
 * Resolves to the element a step should spotlight.
 *
 * - `string` — a CSS selector passed to `document.querySelector`.
 * - `HTMLElement` — the element directly.
 * - `() => HTMLElement | null` — a getter evaluated at measure time.
 */
export type TourTarget = string | HTMLElement | (() => HTMLElement | null)

/** A single step in the tour. */
export interface DzTourStep {
  /** The element to spotlight for this step. */
  target: TourTarget
  /** Optional step title rendered in the popover header. */
  title?: string
  /** Optional step description rendered in the popover body. */
  description?: string
  /** Placement of the popover relative to the target. Defaults to `bottom`. */
  placement?: TourPlacement
}

// ---------------------------------------------------------------------------
// DzTour props / emits / slots
// ---------------------------------------------------------------------------

/** Props for the DzTour component. */
export interface DzTourProps extends BaseAccessibilityProps {
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
  /** The ordered steps that make up the tour. */
  steps: DzTourStep[]
  /** Dim everything except the active target with a spotlight mask. */
  mask?: boolean
  /** Scroll an off-screen target into view when its step activates. */
  scrollIntoView?: boolean
}

/** Events emitted by DzTour. */
export interface DzTourEmits {
  /** The tour completed via the Finish control on the last step. */
  finish: []
  /** The tour was dismissed via Skip, the Escape key, or programmatically. */
  close: []
  /** The active step changed; payload is the new zero-based step index. */
  change: [index: number]
}

/** Slot props shared by the customizable DzTour slots. */
export interface DzTourSlotProps {
  /** The active step definition. */
  step: DzTourStep
  /** Zero-based index of the active step. */
  current: number
  /** Total number of steps. */
  total: number
  /** Whether the active step is the first one. */
  isFirst: boolean
  /** Whether the active step is the last one. */
  isLast: boolean
  /** Advance to the next step (or finish on the last step). */
  next: () => void
  /** Return to the previous step. */
  prev: () => void
  /** Finish the tour. */
  finish: () => void
  /** Skip/close the tour. */
  close: () => void
}

/** Slot definitions for DzTour. */
export interface DzTourSlots {
  /** Custom step body (replaces the default title + description). */
  default?: (props: DzTourSlotProps) => unknown
  /** Custom footer (replaces the default Back/Next/Skip/Finish controls). */
  footer?: (props: DzTourSlotProps) => unknown
  /** Custom step indicators (replaces the default dots). */
  indicators?: (props: DzTourSlotProps) => unknown
}
