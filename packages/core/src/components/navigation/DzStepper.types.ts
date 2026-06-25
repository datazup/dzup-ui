/**
 * DzStepper — Type definitions for the step-by-step progress compound.
 *
 * v-model via defineModel<number>() (ADR-16).
 * Typed injection key (ADR-08).
 *
 * @module @dzup-ui/core/components/navigation/DzStepper
 */

import type { BaseAccessibilityProps, Orientation } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

/** Stepper orientation */
export type StepperOrientation = Orientation

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzStepperItem children via inject */
export interface DzStepperContext {
  /** Active step index (0-based) */
  activeStep: Ref<number>
  /** Orientation */
  orientation: Ref<StepperOrientation>
  /** Whether items in completed/active state may be clicked to navigate */
  clickable: Ref<boolean>
  /** Total number of steps */
  totalSteps: Ref<number>
  /** Register a step and get its index */
  registerStep: () => number
  /** Set the active step (used by clickable items) */
  setActiveStep: (index: number) => void
}

/** Typed injection key for DzStepper context (ADR-08, SCREAMING_SNAKE) */
export const DZ_STEPPER_KEY: InjectionKey<DzStepperContext> = Symbol('dz-stepper')

// ---------------------------------------------------------------------------
// DzStepper (Root)
// ---------------------------------------------------------------------------

/** Props for the DzStepper root component */
export interface DzStepperProps extends BaseAccessibilityProps {
  /** Orientation of the stepper */
  orientation?: StepperOrientation
  /**
   * Allow completed/active steps to be clicked to navigate back to them.
   * Upcoming steps remain non-interactive regardless. Defaults to `false`.
   */
  clickable?: boolean
}

/** Events emitted by DzStepper */
export interface DzStepperEmits {
  /** Active step changed */
  change: [step: number]
  /**
   * A clickable step was activated. Fired after v-model is updated; consumers
   * can use this for analytics or to trigger side effects.
   */
  navigate: [step: number]
}

/** Slot definitions for DzStepper */
export interface DzStepperSlots {
  /** DzStepperItem children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzStepperItem
// ---------------------------------------------------------------------------

/** Props for the DzStepperItem component */
export interface DzStepperItemProps {
  /** Step title */
  title?: string
  /** Step description */
  description?: string
  /** Whether this step is optional */
  optional?: boolean
  /**
   * Per-item override for clickability. Falls back to the parent
   * <code>DzStepper.clickable</code>. Only completed/active steps respond
   * regardless of this flag — upcoming steps never navigate.
   */
  clickable?: boolean
}

/** Events emitted by DzStepperItem */
export interface DzStepperItemEmits {
  /** Step was activated via click/keyboard (only fires when clickable and reachable) */
  navigate: [step: number]
}

/** Slot definitions for DzStepperItem */
export interface DzStepperItemSlots {
  /** Step content (displayed when active) */
  default?: () => unknown
  /** Custom step indicator */
  indicator?: (props: { step: number; status: 'completed' | 'active' | 'upcoming' }) => unknown
}
