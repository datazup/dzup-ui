/**
 * DzInputGroup — Type definitions for the input group wrapper.
 *
 * Groups an input with addons (prefix/suffix text, buttons, icons).
 *
 * @module @dzup-ui/core/components/inputs/DzInputGroup
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/**
 * Context provided to child form controls (e.g. DzInput) via inject.
 *
 * Lets the group own the shared size and disabled state so a single
 * `<DzInputGroup size="lg" disabled>` cascades to the field inside it
 * without the consumer repeating those props on the child.
 */
export interface DzInputGroupContext {
  /** Size propagated to the grouped field */
  size: Ref<CanonicalSize | undefined>
  /** Whether the entire group is disabled */
  disabled: Ref<boolean>
}

/** Typed injection key for DzInputGroup context (ADR-08, SCREAMING_SNAKE) */
export const DZ_INPUT_GROUP_KEY: InjectionKey<DzInputGroupContext>
  = Symbol('dz-input-group')

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInputGroup component */
export interface DzInputGroupProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzInputGroup */
export interface DzInputGroupSlots {
  /** Input element and addon children */
  default: () => unknown
  /** Addon content before the input */
  prefix?: () => unknown
  /** Addon content after the input */
  suffix?: () => unknown
}
