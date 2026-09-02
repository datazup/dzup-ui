/**
 * DzIconButton — type definitions.
 *
 * Extends DzButton API for icon-only buttons.
 * Requires `ariaLabel` for accessibility since there is no visible text.
 *
 * @module @dzup-ui/core/components/buttons/DzIconButton
 */

import type {
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { Component } from 'vue'
import type { DzIconButtonUi } from './DzIconButton.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzIconButton component */
export interface DzIconButtonProps {
  /** Icon component to render (from lucide-vue-next or similar) */
  icon: Component
  /** Accessible label -- REQUIRED since there is no visible text */
  ariaLabel?: string
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Loading state -- shows spinner and sets aria-busy */
  loading?: boolean
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Unique element ID */
  id?: string
  /**
   * Per-part class overrides, keyed by the names in `DzIconButton.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzIconButton :icon="X" :ui="{ spinner: 'text-[var(--dz-primary)]' }" />
   * ```
   */
  ui?: DzIconButtonUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzIconButton */
export interface DzIconButtonEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}
