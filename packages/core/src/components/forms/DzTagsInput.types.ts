/**
 * DzTagsInput — type definitions.
 *
 * A free-text token / chips input: the user types arbitrary values (tags,
 * recipient emails, keywords) and each committed entry becomes a removable
 * chip rendered with {@link ../data/DzChip DzChip}. This differs from
 * DzMultiSelect / DzCombobox, which pick from a *fixed* list of options.
 *
 * v-model:value via defineModel (ADR-16) — an array of string tokens.
 *
 * @module @dzup-ui/core/components/forms/DzTagsInput
 */

import type {
  BaseFormControlProps,
  CanonicalTone,
  ChipVariant,
  InputVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Supporting shapes
// ---------------------------------------------------------------------------

/**
 * Why a typed/pasted token was rejected.
 *
 * - `duplicate` — `allowDuplicates` is false and the token already exists
 * - `invalid`   — the `validate` predicate returned false
 * - `max`       — adding it would exceed `max`
 */
export type DzTagsInputRejectReason = 'duplicate' | 'invalid' | 'max'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTagsInput component */
export interface DzTagsInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder shown in the text field (hidden once tokens exist, optional) */
  placeholder?: string
  /** Maximum number of tokens allowed (no limit when omitted) */
  max?: number
  /** Allow the same token to appear more than once (default false) */
  allowDuplicates?: boolean
  /**
   * Keys / characters that commit the pending token and split pasted text.
   * Defaults to `['Enter', ',']`. Use `KeyboardEvent.key` values for keys
   * (e.g. `'Enter'`, `'Tab'`) and single characters for inline separators.
   */
  delimiters?: string[]
  /**
   * Per-token validation predicate. Return `false` to reject the token,
   * triggering a brief `danger` flash on the field. Runs after the dedupe
   * and max checks.
   */
  validate?: (token: string) => boolean
  /** Commit the pending token when the field loses focus (default false) */
  addOnBlur?: boolean
  /** Visual style of the committed-token chips (default `subtle`) */
  chipVariant?: ChipVariant
  /** Semantic tone of the committed-token chips (default `neutral`) */
  chipTone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzTagsInput.
 *
 * `update:value` is provided implicitly by `defineModel` (ADR-16).
 *
 * - `add`     — a token was committed
 * - `remove`  — a token was removed (token + its former index)
 * - `invalid` — a token was rejected (token + reason)
 * - `focus` / `blur` — text field focus
 */
export interface DzTagsInputEmits {
  add: [token: string]
  remove: [token: string, index: number]
  invalid: [token: string, reason: DzTagsInputRejectReason]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTagsInput */
export interface DzTagsInputSlots {
  /**
   * Override the rendering of each committed token. Receives the token text,
   * its index, and a `remove` callback to detach it.
   */
  tag?: (props: { tag: string, index: number, remove: () => void }) => unknown
}
