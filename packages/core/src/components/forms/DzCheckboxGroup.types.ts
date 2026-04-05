/**
 * DzCheckboxGroup — type definitions.
 *
 * Groups DzCheckbox components and manages a string[] model value.
 * Uses typed injection key (ADR-08).
 *
 * @module @dzip-ui/core/components/forms/DzCheckboxGroup
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to child DzCheckbox components via inject */
export interface DzCheckboxGroupContext {
  /** Currently selected values */
  modelValue: Ref<string[]>
  /** Whether the entire group is disabled */
  disabled: Ref<boolean>
  /** Size propagated to all children */
  size: Ref<CanonicalSize>
  /** Toggle a value in the group selection */
  toggle: (value: string) => void
}

/** Typed injection key for DzCheckboxGroup context (ADR-08, SCREAMING_SNAKE) */
export const DZ_CHECKBOX_GROUP_KEY: InjectionKey<DzCheckboxGroupContext>
  = Symbol('dz-checkbox-group')

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCheckboxGroup component */
export interface DzCheckboxGroupProps extends BaseAccessibilityProps {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Disabled state propagated to all child checkboxes */
  disabled?: boolean
  /** Size propagated to all child checkboxes */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCheckboxGroup */
export interface DzCheckboxGroupEmits {
  /** Value changed after user interaction */
  change: [values: string[]]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCheckboxGroup */
export interface DzCheckboxGroupSlots {
  /** Child DzCheckbox components */
  default: () => unknown
}
