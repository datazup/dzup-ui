/**
 * DzDescriptions + DzDescriptionsItem — type definitions for the compound
 * Descriptions family (read-only label/value detail grid).
 *
 * DzDescriptions provides context to DzDescriptionsItem children via inject
 * (ADR-08) so slot-rich values inherit size / layout / bordered density.
 *
 * @module @dzup-ui/core/components/data/DzDescriptions
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Shared value types
// ---------------------------------------------------------------------------

/** Layout orientation of each label/value pair */
export type DescriptionsLayout = 'horizontal' | 'vertical'

/**
 * Responsive column counts keyed by breakpoint. Unspecified breakpoints
 * inherit the next smaller one (mobile-first).
 */
export interface DescriptionsResponsiveColumns {
  /** Columns from 0px up (default 1) */
  base?: number
  /** Columns from the `sm` breakpoint up */
  sm?: number
  /** Columns from the `md` breakpoint up */
  md?: number
  /** Columns from the `lg` breakpoint up */
  lg?: number
  /** Columns from the `xl` breakpoint up */
  xl?: number
}

/** Number of columns, or a responsive map of breakpoint → column count */
export type DescriptionsColumns = number | DescriptionsResponsiveColumns

/** A single label/value entry rendered by the `items` prop */
export interface DescriptionsItem {
  /** Term / field label */
  label: string
  /** Field value (plain text). Use DzDescriptionsItem for slot-rich values. */
  value?: string | number
  /** Number of columns this entry spans (default 1) */
  span?: number
}

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzDescriptionsItem children via inject */
export interface DzDescriptionsContext {
  /** Component size (density) */
  size: Ref<CanonicalSize>
  /** Layout orientation */
  layout: Ref<DescriptionsLayout>
  /** Whether cells render with borders */
  bordered: Ref<boolean>
}

/** Typed injection key for DzDescriptions context (ADR-08, SCREAMING_SNAKE) */
export const DZ_DESCRIPTIONS_KEY: InjectionKey<DzDescriptionsContext>
  = Symbol('dz-descriptions')

// ---------------------------------------------------------------------------
// DzDescriptions Props
// ---------------------------------------------------------------------------

/** Props for the DzDescriptions root component */
export interface DzDescriptionsProps extends BaseAccessibilityProps {
  /** Declarative entries. Omit to compose DzDescriptionsItem children instead. */
  items?: DescriptionsItem[]
  /** Number of columns, or a responsive breakpoint map (default 3) */
  columns?: DescriptionsColumns
  /** Per-pair layout orientation (default 'horizontal') */
  layout?: DescriptionsLayout
  /** Render label/value cells with borders (default false) */
  bordered?: boolean
  /** Component size / density (default 'md') */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// DzDescriptions Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDescriptions */
export interface DzDescriptionsSlots {
  /** DzDescriptionsItem children (used when `items` is not provided) */
  default?: () => unknown
}

// ---------------------------------------------------------------------------
// DzDescriptionsItem Props
// ---------------------------------------------------------------------------

/** Props for the DzDescriptionsItem child component */
export interface DzDescriptionsItemProps {
  /** Term / field label (omit when using the `label` slot) */
  label?: string
  /** Number of columns this entry spans (default 1) */
  span?: number
}

// ---------------------------------------------------------------------------
// DzDescriptionsItem Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDescriptionsItem */
export interface DzDescriptionsItemSlots {
  /** Field value content */
  default?: () => unknown
  /** Custom label content (overrides the `label` prop) */
  label?: () => unknown
}
