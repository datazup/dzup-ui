/**
 * DzToggleButton — Type definitions for the toggleable button component.
 *
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @module @dzup-ui/core/components/buttons/DzToggleButton
 */

import type {
  BaseAccessibilityProps,
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { DzToggleButtonUi } from './DzToggleButton.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzToggleButton component */
export interface DzToggleButtonProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzToggleButton.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzToggleButton v-model="on" :ui="{ root: 'rounded-full' }" />
   * ```
   */
  ui?: DzToggleButtonUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzToggleButton */
export interface DzToggleButtonEmits {
  /** Pressed state changed */
  change: [pressed: boolean]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzToggleButton */
export interface DzToggleButtonSlots {
  /** Button label content */
  default?: () => unknown
  /** Content before the label (typically an icon) */
  prefix?: () => unknown
  /** Content after the label */
  suffix?: () => unknown
}
