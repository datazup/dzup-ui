/**
 * DzAnimatedNumber — type definitions.
 *
 * A number that tweens from its previous value to the next whenever `value`
 * changes, formatting each frame through `Intl.NumberFormat`. Adds polish to
 * dashboards and KPIs (cf. DzStatCard's static figures) while handling the
 * concerns a naive count-up misses: reduced-motion, mid-flight restarts, and
 * screen-reader flooding.
 *
 * @module @dzup-ui/core/components/data/DzAnimatedNumber
 */

import type { BaseAccessibilityProps, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { AnimatedNumberEasing } from './DzAnimatedNumber.tween.ts'

export type { AnimatedNumberEasing }

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzAnimatedNumber component */
export interface DzAnimatedNumberProps extends BaseAccessibilityProps {
  /** The target value; animates from the previous value whenever this changes */
  value: number
  /**
   * Value the first animation starts from (the count-up origin). Subsequent
   * changes animate from the currently-displayed value, not this.
   * @default 0
   */
  from?: number
  /** Animation duration in milliseconds (`0` snaps with no animation) */
  duration?: number
  /** Easing curve — mirrors the `--dz-ease-*` design tokens */
  easing?: AnimatedNumberEasing
  /** `Intl.NumberFormat` options (currency, percent, decimals, …) */
  format?: Intl.NumberFormatOptions
  /** BCP-47 locale(s) for formatting (defaults to the runtime locale) */
  locale?: string | string[]
  /**
   * Begin the first animation only once scrolled into view, via
   * IntersectionObserver. Later value changes always animate immediately.
   * @default true
   */
  startOnView?: boolean
  /** Component size — scales the figure */
  size?: CanonicalSize
  /** Semantic colour tone of the figure */
  tone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAnimatedNumber */
export interface DzAnimatedNumberEmits {
  /** An animation toward a new target has begun */
  start: [value: number]
  /** The figure has settled on its target value */
  complete: [value: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `prefix` / `suffix` slots */
export interface DzAnimatedNumberAffixSlotProps {
  /** The current target value */
  value: number
  /** The current target value, formatted */
  formatted: string
}

/** Slot definitions for DzAnimatedNumber */
export interface DzAnimatedNumberSlots {
  /** Content rendered before the figure (e.g. a currency glyph or icon) */
  prefix?: (props: DzAnimatedNumberAffixSlotProps) => unknown
  /** Content rendered after the figure (e.g. a unit or "+" badge) */
  suffix?: (props: DzAnimatedNumberAffixSlotProps) => unknown
}

/** Imperative surface exposed via template ref */
export interface DzAnimatedNumberExpose {
  /** The currently-displayed (mid-tween) numeric value */
  readonly displayValue: number
  /** The current formatted string shown to sighted users */
  readonly displayText: string
}
