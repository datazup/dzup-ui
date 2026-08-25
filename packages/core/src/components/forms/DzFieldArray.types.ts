export interface DzFieldArrayProps {
  min?: number
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

export interface DzFieldArraySlots<T = unknown> {
  default?: (props: DzFieldArraySlotProps<T>) => unknown
  append?: (props: DzFieldArrayAppendSlotProps<T>) => unknown
}
