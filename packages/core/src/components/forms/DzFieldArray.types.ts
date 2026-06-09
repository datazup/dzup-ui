export interface DzFieldArrayProps {
  min?: number
  max?: number
}

export interface DzFieldArrayEmits<T = unknown> {
  add: [item: T]
  remove: [index: number]
  reorder: [from: number, to: number]
}

export interface DzFieldArraySlotProps<T = unknown> {
  field: T
  index: number
  remove: () => void
  move: (to: number) => void
  /** Append a new item, enforcing `max` (no-op once `max` is reached) */
  append: (item: T) => void
  /** Whether removing a row is allowed (false once `min` is reached) */
  canRemove: boolean
  /** Whether appending a row is allowed (false once `max` is reached) */
  canAppend: boolean
  /** Current number of items in the array */
  count: number
}

export interface DzFieldArrayAppendSlotProps<T = unknown> {
  /** Append a new item, enforcing `max` (no-op once `max` is reached) */
  append: (item: T) => void
  /** Current number of items in the array */
  count: number
  /** Whether appending a row is allowed (always true while this slot renders) */
  canAppend: boolean
}

export interface DzFieldArraySlots<T = unknown> {
  default?: (props: DzFieldArraySlotProps<T>) => unknown
  append?: (props: DzFieldArrayAppendSlotProps<T>) => unknown
}
