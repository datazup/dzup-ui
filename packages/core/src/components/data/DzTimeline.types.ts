/**
 * DzTimeline + DzTimelineItem — type definitions for the compound Timeline family.
 *
 * DzTimeline provides context to DzTimelineItem children via inject (ADR-08).
 *
 * @module @dzup-ui/core/components/data/DzTimeline
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzTimelineItem children via inject */
export interface DzTimelineContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** Layout orientation */
  orientation: Ref<'vertical' | 'horizontal'>
}

/** Typed injection key for DzTimeline context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TIMELINE_KEY: InjectionKey<DzTimelineContext> = Symbol('dz-timeline')

// ---------------------------------------------------------------------------
// DzTimeline Props
// ---------------------------------------------------------------------------

/** Props for the DzTimeline root component */
export interface DzTimelineProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal'
}

// ---------------------------------------------------------------------------
// DzTimeline Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTimeline */
export interface DzTimelineSlots {
  /** DzTimelineItem children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTimelineItem Props
// ---------------------------------------------------------------------------

/** Props for the DzTimelineItem component */
export interface DzTimelineItemProps extends BaseAccessibilityProps {
  /** Semantic color tone for the item indicator */
  tone?: CanonicalTone
  /** Status text (e.g., time, date) */
  status?: string
}

// ---------------------------------------------------------------------------
// DzTimelineItem Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTimelineItem */
export interface DzTimelineItemSlots {
  /** Item content */
  default: () => unknown
  /** Custom indicator (replaces the default dot) */
  indicator?: () => unknown
}
