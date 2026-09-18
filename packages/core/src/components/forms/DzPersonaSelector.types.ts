/**
 * DzPersonaSelector — type definitions.
 *
 * Wraps DzCombobox with persona-specific rendering (avatar + name + role).
 *
 * @module @dzup-ui/core/components/forms/DzPersonaSelector
 */

import type { AsyncOptionsEmits, AsyncOptionsProps } from '@dzup-ui/contracts'
import type { DzPersonaSelectorUi } from './DzPersonaSelector.anatomy.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A selectable persona */
export interface Persona {
  /** Stable persona identifier (used as v-model value) */
  id: string
  /** Display name */
  name: string
  /** Role / title */
  role: string
  /** Optional avatar image URL */
  avatarUrl?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the DzPersonaSelector component.
 *
 * Note: the selected persona id is exposed as `v-model` via `defineModel`
 * (ADR-16) and is intentionally not declared here.
 *
 * Extends {@link AsyncOptionsProps} (renderer contract C9, TASK-R3-O3). The
 * `DzCombobox` this component renders already had the seam; declaring it here
 * makes the pass-through typed — `optionsState`, `optionsError` and
 * `optionsRetryable` are forwarded, and the host answers `load-options` by
 * updating `personas`.
 */
export interface DzPersonaSelectorProps extends AsyncOptionsProps {
  /** Available personas */
  personas: Persona[]
  /** Placeholder text for the search input */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /**
   * Per-part class overrides, keyed by the names in
   * `DzPersonaSelector.anatomy.ts` (ADR-19 §5). This component renders no
   * element of its own, so the map is forwarded whole to the `DzCombobox` that
   * is* its root — one map still reaches every part the declaration names.
   */
  ui?: DzPersonaSelectorUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzPersonaSelector.
 *
 * Note: `update:modelValue` is provided by `defineModel` (ADR-16) and is not
 * declared here. `load-options` / `retry-options` are re-emitted from the
 * `DzCombobox` this component renders ({@link AsyncOptionsEmits}).
 */
export interface DzPersonaSelectorEmits extends AsyncOptionsEmits {
  /** Fires with the full persona object when one is selected */
  change: [persona: Persona | undefined]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPersonaSelector */
export interface DzPersonaSelectorSlots {
  /** Override rendering of a single persona item */
  item?: (props: { persona: Persona, selected: boolean }) => unknown
  /** Content shown when no personas match the query */
  empty?: () => unknown
}
