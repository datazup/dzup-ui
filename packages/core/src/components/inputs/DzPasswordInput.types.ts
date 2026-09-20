/**
 * DzPasswordInput — Type definitions for password input with visibility toggle.
 *
 * @module @dzup-ui/core/components/inputs/DzPasswordInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzup-ui/contracts'
import type { DzPasswordInputUi } from './DzPasswordInput.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPasswordInput component */
export interface DzPasswordInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text */
  placeholder?: string
  /** Maximum character length */
  maxlength?: number
  /** Accessible label for the loading spinner shown when `loading` is true */
  loadingLabel?: string
  /**
   * The `autocomplete` token the field advertises to password managers.
   *
   * Defaults to `current-password`, which is the sign-in step. A registration
   * or change-password step must say `new-password`, or the manager offers the
   * password being replaced instead of generating one.
   *
   * It is a prop rather than a fall-through attribute because
   * `inheritAttrs: false` sends every unrecognised attribute to the wrapper
   * `<div>`: writing `autocomplete="new-password"` on the component used to put
   * the token on an element the browser does not read, silently.
   *
   * A working password manager is the *mechanism* WCAG 2.2 SC 3.3.8 Accessible
   * Authentication (AA) accepts in place of requiring the user to recall the
   * password, so steering it at the right step is a conformance concern and not
   * only a convenience.
   */
  autocomplete?: 'current-password' | 'new-password' | 'off' | (string & {})
  /**
   * Per-part class overrides, keyed by the names in `DzPasswordInput.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzPasswordInput v-model="pw" :ui="{ toggle: 'hidden' }" />
   * ```
   */
  ui?: DzPasswordInputUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzPasswordInput */
export interface DzPasswordInputEmits extends ChangeEvents<string> {
  // Inherits focus, blur, change from ChangeEvents
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPasswordInput */
export interface DzPasswordInputSlots {
  /** Content rendered before the input (icon) */
  prefix?: () => unknown
}
