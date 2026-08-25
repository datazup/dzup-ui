/**
 * DzInputMask — type definitions.
 *
 * Format-masked text input that guides and constrains typing for structured
 * fields (phone, date, credit card, license keys). Emits both the displayed
 * masked value (v-model) and the stripped unmasked value.
 *
 * @module @dzup-ui/core/components/inputs/DzInputMask
 */

import type { BaseEvents, BaseFormControlProps, InputVariant } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInputMask component */
export interface DzInputMaskProps extends BaseFormControlProps<InputVariant> {
  /**
   * Mask pattern. Tokens: `9` = digit, `a` = letter, `*` = alphanumeric.
   * Every other character is a literal (e.g. `"(999) 999-9999"`, `"99/99/9999"`).
   */
  mask: string
  /** Character shown for unfilled token positions */
  slotChar?: string
  /** Clear the field on blur when the input is incomplete */
  autoClear?: boolean
  /** Placeholder text shown when the field is empty */
  placeholder?: string
  /**
   * Which value `v-model` holds.
   *
   * `'masked'` (the default, and the existing behaviour) keeps the displayed
   * string — `"(555) 123-4567"` — in the model. `'unmasked'` puts the stripped
   * value there instead: `"5551234567"`.
   *
   * Why this exists: a form document persists whatever the model holds, so the
   * default persists *presentation*. Change the mask from `"(999) 999-9999"` to
   * `"999-999-9999"` and every stored value is now formatted for a mask that no
   * longer exists. `update:unmasked` has always emitted the raw value, but a
   * generic consumer — a schema-driven renderer binding `v-model` through a
   * registry — has no way to reach a one-way emit. This gives it one without
   * changing what anybody gets today.
   *
   * The displayed value is unaffected either way; only the model changes.
   *
   * @default 'masked'
   */
  modelMode?: 'masked' | 'unmasked'
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzInputMask */
export interface DzInputMaskEmits extends BaseEvents {
  /** Emitted with formatting characters (literals + slot chars) stripped */
  'update:unmasked': [value: string]
  /** Emitted once every token position has been filled */
  'complete': [unmasked: string]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzInputMask */
export interface DzInputMaskSlots {
  /** Content rendered before the input (icon, label fragment) */
  prefix?: () => unknown
  /** Content rendered after the input (icon, action) */
  suffix?: () => unknown
}
