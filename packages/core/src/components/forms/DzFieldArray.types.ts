/** Props for the DzFieldArray component */
export interface DzFieldArrayProps {
  /** Fewest rows the array may hold — removing below it is a no-op. `undefined` sets no lower bound. */
  min?: number
  /** Most rows the array may hold — appending past it is a no-op, and the `append` slot stops rendering. `undefined` sets no upper bound. */
  max?: number
  /**
   * Base for the per-item ids handed to the default slot.
   *
   * Defaults to the surrounding `DzFormField`'s id, then to a generated one.
   * Set it when two arrays share a page and their generated bases would be
   * indistinguishable in a test or a bug report.
   */
  id?: string
}

/** Events emitted by DzFieldArray */
export interface DzFieldArrayEmits<T = unknown> {
  /** Emitted after a row is appended, with the appended item. Suppressed when `max` blocked the append. */
  add: [item: T]
  /** Emitted after a row is removed, with the index it occupied. Suppressed when `min` blocked the removal. */
  remove: [index: number]
  /** Emitted after a row moves, with its old and new index. Suppressed for out-of-range or no-op moves. */
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
  /**
   * Id for this row's control, unique across the array.
   *
   * Every row of a repeater sits inside one `DzFormField`, so every control in
   * it resolved to the *same* id — a label pointing at one row activated a
   * different one, and `aria-describedby` named an error belonging to another
   * item. Spec 04 §8 asks for "collision-free control/help/error IDs per form
   * instance and array item"; these are that, and the row is what wires them.
   */
  fieldId: string
  /** Id for this row's description, paired with {@link fieldId}. */
  descriptionId: string
  /** Id for this row's error message, paired with {@link fieldId}. */
  messageId: string
}

export interface DzFieldArrayAppendSlotProps<T = unknown> {
  /** Append a new item, enforcing `max` (no-op once `max` is reached) */
  append: (item: T) => void
  /** Current number of items in the array */
  count: number
  /** Whether appending a row is allowed (always true while this slot renders) */
  canAppend: boolean
}

/** Slot definitions for DzFieldArray */
export interface DzFieldArraySlots<T = unknown> {
  /** Rendered once per row, with the row value, its index, its collision-free ids and the `remove` / `move` / `append` callbacks. */
  default?: (props: DzFieldArraySlotProps<T>) => unknown
  /** Rendered after the rows while another may be appended, with `append`, `count` and `canAppend`. Omitted once `max` is reached. */
  append?: (props: DzFieldArrayAppendSlotProps<T>) => unknown
}
