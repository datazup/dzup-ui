/**
 * DzButtonGroup — type definitions.
 *
 * Provides shared context (size, variant, tone) to child DzButton components
 * via provide/inject (ADR-08).
 *
 * @module @dzip-ui/core/components/buttons/DzButtonGroup
 */

import type {
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to child buttons via inject */
export interface DzButtonGroupContext {
  /** Size propagated to all children */
  size: Ref<CanonicalSize | undefined>
  /** Variant propagated to all children */
  variant: Ref<ButtonVariant | undefined>
  /** Tone propagated to all children */
  tone: Ref<CanonicalTone | undefined>
  /** Orientation of the button group */
  orientation: Ref<'horizontal' | 'vertical'>
  /** Whether the entire group is disabled */
  disabled: Ref<boolean>
}

/** Typed injection key for DzButtonGroup context (ADR-08, SCREAMING_SNAKE) */
export const DZ_BUTTON_GROUP_KEY: InjectionKey<DzButtonGroupContext>
  = Symbol('dz-button-group')

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzButtonGroup component */
export interface DzButtonGroupProps {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size propagated to all child buttons */
  size?: CanonicalSize
  /** Variant propagated to all child buttons */
  variant?: ButtonVariant
  /** Tone propagated to all child buttons */
  tone?: CanonicalTone
  /** Disabled state propagated to all child buttons */
  disabled?: boolean
  /** Unique element ID */
  id?: string
  /** Accessible label for the group */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzButtonGroup */
export interface DzButtonGroupSlots {
  /** Child buttons */
  default: () => unknown
}
