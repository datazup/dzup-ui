/**
 * DzRelativeTime — type definitions.
 *
 * A self-updating relative timestamp ("2 minutes ago") that re-renders as time
 * passes, degrades to an absolute date for assistive tech / tooltip, and is
 * built on the platform `Intl.RelativeTimeFormat` for dependency-free locale
 * awareness. Renders inside a `<time>` element with a machine-readable
 * `datetime` attribute.
 *
 * @module @dzup-ui/core/components/typography/DzRelativeTime
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type {
  RelativeTimeLocale,
  RelativeTimeMode,
  RelativeTimeValue,
} from '../../composables/useRelativeTime/index.ts'
import type { DzRelativeTimeUi } from './DzRelativeTime.anatomy.ts'

export type { RelativeTimeLocale, RelativeTimeMode, RelativeTimeValue }

/** Semantic colour tone — inherits the shared text token palette. */
export type RelativeTimeTone = 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'info'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRelativeTime component */
export interface DzRelativeTimeProps extends BaseAccessibilityProps {
  /** The timestamp to render (Date, epoch ms, or ISO string) */
  value: RelativeTimeValue
  /** Display mode — `'relative'` (live, default) or `'absolute'` (static) */
  mode?: RelativeTimeMode
  /** Locale override; defaults to the runtime/document locale */
  locale?: RelativeTimeLocale
  /**
   * Fixed refresh interval in ms. Omit to derive the cadence from the value's
   * age (every second under a minute, minute under an hour, …); pass `null` to
   * disable auto-updates.
   */
  updateInterval?: number | null
  /** Wrap in a DzTooltip showing the full absolute date (default true) */
  tooltip?: boolean
  /** Semantic colour tone */
  tone?: RelativeTimeTone
  /**
   * Per-part class overrides, keyed by the names in `DzRelativeTime.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzRelativeTime :datetime="ts" :ui="{ root: 'tabular-nums' }" />
   * ```
   */
  ui?: DzRelativeTimeUi
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the default slot */
export interface DzRelativeTimeSlotProps {
  /** The string currently rendered (honours `mode`) */
  display: string
  /** The live relative phrase, e.g. "2 minutes ago" */
  relative: string
  /** The full absolute date */
  absolute: string
  /** ISO 8601 datetime attribute value */
  datetime: string
}

/** Slot definitions for DzRelativeTime */
export interface DzRelativeTimeSlots {
  /** Override the rendered text; receives the formatted strings */
  default?: (props: DzRelativeTimeSlotProps) => unknown
}
