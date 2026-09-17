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
