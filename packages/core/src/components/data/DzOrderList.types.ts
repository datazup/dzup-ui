/**
 * DzOrderList — type definitions for the reorderable list.
 *
 * A single list whose items can be reordered in place — by pointer drag (via a
 * grab handle), by Move Up / Down / Top / Bottom controls, and by keyboard
 * (grab → move → drop). It fills the gap left by DzTransfer, which moves items
 * *between* two lists but cannot reorder *within* one.
 *
 * The ordered array is owned by the consumer through `v-model:value`
 * (defineModel, ADR-16); the component never mutates the bound array in place.
 *
 * @module @dzup-ui/core/components/data/DzOrderList
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** Visual style variants for the DzOrderList surface */
export type OrderListVariant = 'plain' | 'bordered' | 'divided'

/** A discrete reorder command issued by the control buttons or keyboard */
export type OrderListMove = 'up' | 'down' | 'top' | 'bottom'

/** Where the Move controls sit relative to the list */
export type OrderListControlsPosition = 'start' | 'end'

/** A resolved stable key for an item (from `dataKey` or its index) */
export type OrderListKey = string | number

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzOrderList component (item type lives on the slots/model) */
export interface DzOrderListProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: OrderListVariant
  /** Component size */
  size?: CanonicalSize
  /** Disabled state — prevents all reordering and selection */
  disabled?: boolean
  /** Allow multi-selection so a group of rows can be moved together */
  selectable?: boolean
  /** Render the Move Up / Down / Top / Bottom control buttons */
  showControls?: boolean
  /** Show a drag handle and enable pointer drag-and-drop reordering */
  dragHandle?: boolean
  /** Which side the control button column sits on */
  controlsPosition?: OrderListControlsPosition
  /**
   * Property name used to derive a stable key from each item (e.g. `'id'`).
   * Falls back to the item's index when omitted — note that index-based keys do
   * not survive reordering, so provide `dataKey` when using `selectable`.
   */
  dataKey?: string
  /** Accessible label for the Move Up control */
  moveUpLabel?: string
  /** Accessible label for the Move Down control */
  moveDownLabel?: string
  /** Accessible label for the Move To Top control */
  moveTopLabel?: string
  /** Accessible label for the Move To Bottom control */
  moveBottomLabel?: string
  /** Accessible label for each row's drag handle */
  dragHandleLabel?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Payload describing a completed reorder */
export interface OrderListReorderPayload {
  /** Index the anchor item moved from */
  from: number
  /** Index the anchor item moved to */
  to: number
}

/**
 * Events emitted by DzOrderList.
 *
 * Note: `update:value` is produced implicitly by `defineModel` (ADR-16) and is
 * therefore NOT redeclared here.
 */
export interface DzOrderListEmits {
  /** A reorder completed (drag, control button, or keyboard drop) */
  'reorder': [payload: OrderListReorderPayload]
  /** The selected key set changed (only fired when `selectable`) */
  'selection-change': [keys: OrderListKey[]]
  /** Focus entered the list */
  'focus': [event: FocusEvent]
  /** Focus left the list */
  'blur': [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `#item` slot for each rendered row */
export interface DzOrderListItemSlotProps<T = unknown> {
  /** The item */
  item: T
  /** Current index within the ordered array */
  index: number
  /** Whether the row is selected */
  selected: boolean
  /** Whether the row is currently grabbed for keyboard reordering */
  grabbed: boolean
}

/** Slot definitions for DzOrderList */
export interface DzOrderListSlots<T = unknown> {
  /** Per-row content (defaults to the item rendered as text) */
  item?: (props: DzOrderListItemSlotProps<T>) => unknown
  /** Heading content rendered above the list */
  header?: () => unknown
  /** Content shown when the list is empty */
  empty?: () => unknown
}
