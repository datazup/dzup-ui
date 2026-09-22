/**
 * DzInputGroup — Type definitions for the input group wrapper.
 *
 * Groups an input with addons (prefix/suffix text, buttons, icons).
 *
 * @module @dzup-ui/core/components/inputs/DzInputGroup
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'
import type { DzInputGroupUi } from './DzInputGroup.anatomy.ts'

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
  // Declared locally since TASK-R0-O2 (2026-09-22): `ariaInvalid` left
  // BaseAccessibilityProps for BaseValidationProps (N5-02 D1). This group
  // forwards the attribute to its own element without being a form control,
  // so it keeps the one prop rather than inheriting `invalid`/`error`/
  // `required` it never reads — the wrapped control owns those.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzInputGroup.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzInputGroup :ui="{ prefix: 'bg-[var(--dz-muted)]' }"><DzInput /></DzInputGroup>
   * ```
   */
  ui?: DzInputGroupUi
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
