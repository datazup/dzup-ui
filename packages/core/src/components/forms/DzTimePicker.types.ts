/**
 * DzTimePicker — type definitions.
 *
 * A dropdown time picker (CoreUI-style): the trigger displays the selected
 * time and opens a popover with selectable hour / minute / (optional) second
 * and AM/PM columns. Two selection layouts are supported — a scrollable
 * "roll" wheel and native "select" dropdowns.
 *
 * Built on Reka UI Popover primitive (ADR-07).
 * v-model via defineModel (ADR-16) — canonical 24h `HH:mm` or `HH:mm:ss`.
 *
 * @module @dzup-ui/core/components/forms/DzTimePicker
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Selection layout
// ---------------------------------------------------------------------------

/** Layout used inside the popover to pick time units */
export type TimePickerSelection = 'roll' | 'select'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTimePicker component */
export interface DzTimePickerProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Placeholder text shown on the trigger when no time is selected */
  placeholder?: string
  /** Minimum selectable time (`HH:mm` or `HH:mm:ss`) */
  min?: string
  /** Maximum selectable time (`HH:mm` or `HH:mm:ss`) */
  max?: string
  /** Minute step interval (e.g. 15 → :00, :15, :30, :45) */
  step?: number
  /** Second step interval (only relevant when `seconds` is enabled) */
  secondStep?: number
  /** Show a seconds column — value becomes `HH:mm:ss` */
  seconds?: boolean
  /** Disabled state — prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant of the trigger */
  variant?: InputVariant
  /** Popover selection layout: scrollable wheel (`roll`) or native dropdowns (`select`) */
  selection?: TimePickerSelection
  /** Form field name (submits the canonical 24h value via a hidden input) */
  name?: string
  /** Locale for time display formatting (BCP 47 tag) */
  locale?: string
  /** Use 12-hour format with AM/PM (default: follows locale) */
  hour12?: boolean
  /** Show the clock indicator icon on the trigger */
  indicator?: boolean
  /** Show the clear ("cleaner") button when a value is selected */
  cleaner?: boolean
  /** Show the Cancel / Confirm footer (staged selection). When false, picks apply immediately */
  footer?: boolean
  /** Confirm button label */
  confirmText?: string
  /** Cancel button label */
  cancelText?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzTimePicker.
 *
 * - `change` — value committed (`HH:mm` / `HH:mm:ss`)
 * - `select` — a time was chosen (same payload as change)
 * - `clear`  — value cleared via the cleaner button
 * - `open` / `close` — popover visibility
 * - `focus` / `blur` — trigger focus
 */
export interface DzTimePickerEmits extends SelectOpenableEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTimePicker */
export interface DzTimePickerSlots {
  /** Override the trigger value display. Receives the formatted display string. */
  trigger?: (props: { value: string, display: string }) => unknown
}
