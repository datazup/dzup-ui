/**
 * DzSpeedDial — type definitions.
 *
 * A DzFab that, when activated, fans out a set of secondary actions either in a
 * straight line (`linear`) or along an arc (`radial`), in one of four
 * directions. Each action is a circular icon button labelled with a DzTooltip.
 *
 * Open state via defineModel<boolean>('open') (ADR-16).
 *
 * @module @dzup-ui/core/components/buttons/DzSpeedDial
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { Component } from 'vue'
import type { DzFabPosition, DzFabVariant } from './DzFab.types.ts'
import type { DzSpeedDialUi } from './DzSpeedDial.anatomy.ts'

// ---------------------------------------------------------------------------
// Item shape
// ---------------------------------------------------------------------------

/** A single secondary action in the speed dial */
export interface DzSpeedDialItem {
  /** Icon component for the action */
  icon: Component
  /** Accessible label + tooltip text (required — actions are icon-only) */
  label: string
  /** Invoked when the action is activated */
  onClick?: (event: MouseEvent) => void
  /** Disable this action */
  disabled?: boolean
  /** Per-action color tone (falls back to the dial's `tone`) */
  tone?: CanonicalTone
  /** Stable key for list rendering (defaults to the index) */
  key?: string | number
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/** Expansion direction relative to the trigger */
export type DzSpeedDialDirection = 'up' | 'down' | 'left' | 'right'

/** Layout of the fanned-out actions */
export type DzSpeedDialType = 'linear' | 'radial'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSpeedDial component */
export interface DzSpeedDialProps extends BaseAccessibilityProps {
  /** Secondary actions revealed on open */
  items: DzSpeedDialItem[]
  /** Direction the actions expand toward */
  direction?: DzSpeedDialDirection
  /** Straight line (`linear`) or arc (`radial`) layout */
  type?: DzSpeedDialType
  /** Trigger (FAB) size — also scales the action buttons */
  size?: CanonicalSize
  /** Trigger color tone */
  tone?: CanonicalTone
  /** Trigger visual variant */
  variant?: DzFabVariant
  /** Pin the trigger to a viewport corner (passed through to DzFab) */
  position?: DzFabPosition
  /** Trigger icon shown while closed (default: a plus glyph) */
  icon?: Component
  /** Trigger icon shown while open (default: an x/close glyph) */
  closeIcon?: Component
  /** Also open on pointer hover (in addition to click) */
  openOnHover?: boolean
  /** Disable the whole control */
  disabled?: boolean
  /** Arc radius in px for `radial` layout (default 112) */
  radius?: number
  /**
   * Accessible label for the trigger — REQUIRED, the trigger is icon-only.
   * (Inherited as optional from BaseAccessibilityProps; redeclared required.)
   */
  ariaLabel?: string
  /**
   * Per-part class overrides, keyed by the names in `DzSpeedDial.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzSpeedDial :items="items" :ui="{ list: 'gap-4' }" />
   * ```
   */
  ui?: DzSpeedDialUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSpeedDial */
export interface DzSpeedDialEmits {
  /** Menu opened */
  open: []
  /** Menu closed */
  close: []
  /** An action was activated */
  itemClick: [item: DzSpeedDialItem, index: number]
}
