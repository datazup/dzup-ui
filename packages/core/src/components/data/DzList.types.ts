/**
 * DzList + DzListItem — type definitions for the compound List family.
 *
 * DzList provides context to DzListItem children via inject (ADR-08).
 *
 * @module @dzup-ui/core/components/data/DzList
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

/** Context provided to DzListItem children via inject */
export interface DzListContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** List variant */
  variant: Ref<ListVariant>
  /** Whether list items are interactive (clickable) */
  interactive: Ref<boolean>
}

/** Typed injection key for DzList context (ADR-08, SCREAMING_SNAKE) */
export const DZ_LIST_KEY: InjectionKey<DzListContext> = Symbol('dz-list')

// ---------------------------------------------------------------------------
// Variant type
// ---------------------------------------------------------------------------

/** Visual variants for the DzList component */
export type ListVariant = 'plain' | 'bordered' | 'divided'

// ---------------------------------------------------------------------------
// DzList Props
// ---------------------------------------------------------------------------

/** Props for the DzList root component */
export interface DzListProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ListVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Whether the list is ordered (renders <ol> instead of <ul>) */
  ordered?: boolean
  /** Whether list items are interactive (clickable) */
  interactive?: boolean
  /** Loading state */
  loading?: boolean
}

// ---------------------------------------------------------------------------
// DzList Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzList */
export interface DzListEmits {
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// DzList Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzList */
export interface DzListSlots {
  /** DzListItem children */
  default: () => unknown
  /** Content shown when the list is empty */
  empty?: () => unknown
}

// ---------------------------------------------------------------------------
// DzListItem Props
// ---------------------------------------------------------------------------

/** Props for the DzListItem component */
export interface DzListItemProps extends BaseAccessibilityProps {
  /** Disabled state */
  disabled?: boolean
  /** Whether this item is currently active/selected */
  active?: boolean
  /** Semantic color tone */
  tone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// DzListItem Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzListItem */
export interface DzListItemEmits {
  /** Emitted when an interactive item is clicked */
  click: [event: MouseEvent]
}

// ---------------------------------------------------------------------------
// DzListItem Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzListItem */
export interface DzListItemSlots {
  /** Item content */
  default: () => unknown
  /** Content before the label (icon, avatar) */
  prefix?: () => unknown
  /** Content after the label (badge, action) */
  suffix?: () => unknown
}
