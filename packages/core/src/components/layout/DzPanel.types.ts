/**
 * DzPanel -- type definitions.
 *
 * A titled container with optional header actions and collapse behavior.
 * Fills the gap between DzCard (no legend/collapse) and DzAccordion (multi-item
 * group): a single, optionally-collapsible frame for grouping a form section or
 * settings block. The `legend` variant covers the fieldset use case.
 *
 * @module @dzup-ui/core/components/layout/DzPanel
 */

import type {
  BaseAccessibilityProps,
  BaseAppearanceProps,
  CanonicalSize,
  PanelVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type { PanelVariant }

/**
 * Props for the DzPanel component.
 *
 * `size` controls header/body density; `variant` selects the surface treatment;
 * `tone` colors the title. Collapse state is owned via `v-model:collapsed`
 * (defineModel, ADR-16) rather than a prop.
 */
export interface DzPanelProps
  extends BaseAppearanceProps<CanonicalSize, PanelVariant>, BaseAccessibilityProps {
  /** Header title text (alternative to the `#header` slot) */
  header?: string
  /** Whether the panel can be collapsed via its header toggle */
  collapsible?: boolean
  /** HTML element to render the root as */
  as?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzPanel */
export interface DzPanelEmits {
  /** Emitted when the collapsed state changes via the header toggle */
  toggle: [collapsed: boolean]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPanel */
export interface DzPanelSlots {
  /** Panel body content */
  default?: () => unknown
  /** Header title region (overrides the `header` prop) */
  header?: () => unknown
  /** Header-right controls, rendered outside the collapse toggle button */
  actions?: () => unknown
}
