/**
 * DzStepper — Type definitions for the step-by-step progress compound.
 *
 * v-model via defineModel<number>() (ADR-16).
 * Typed injection key (ADR-08).
 *
 * @module @dzip-ui/core/components/navigation/DzStepper
 */

import type { BaseAccessibilityProps } from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

/** Stepper orientation */
export type StepperOrientation = 'horizontal' | 'vertical'

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzStepperItem children via inject */
export interface DzStepperContext {
  /** Active step index (0-based) */
  activeStep: Ref<number>
  /** Orientation */
  orientation: Ref<StepperOrientation>
  /** Total number of steps */
  totalSteps: Ref<number>
  /** Register a step and get its index */
  registerStep: () => number
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
}

/** Events emitted by DzStepper */
export interface DzStepperEmits {
  /** Active step changed */
  change: [step: number]
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
}

/** Slot definitions for DzStepperItem */
export interface DzStepperItemSlots {
  /** Step content (displayed when active) */
  default?: () => unknown
  /** Custom step indicator */
  indicator?: (props: { step: number, status: 'completed' | 'active' | 'upcoming' }) => unknown
}
