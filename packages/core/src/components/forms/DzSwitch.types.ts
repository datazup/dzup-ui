/**
 * DzSwitch — type definitions.
 *
 * Uses Reka UI SwitchRoot + SwitchThumb (ADR-07).
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzSwitch
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { DzSwitchUi } from './DzSwitch.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSwitch component */
export interface DzSwitchProps extends BaseAccessibilityProps {
  // Declared locally since TASK-R0-O2 (2026-09-22): `ariaInvalid` left
  // BaseAccessibilityProps for BaseValidationProps (N5-02 D1). This control
  // resolves invalidity from the enclosing DzFormField, so it keeps the one
  // prop rather than inheriting `invalid`/`error` it never reads.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
  /** Whether the switch is required */
  required?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzSwitch.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target.
   */
  ui?: DzSwitchUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSwitch */
export interface DzSwitchEmits extends BaseEvents {
  /** Value changed after user interaction */
  change: [checked: boolean]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSwitch */
export interface DzSwitchSlots {
  /** Label text for the switch */
  default?: () => unknown
}
