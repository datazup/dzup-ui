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
}

export interface DzFieldArraySlots<T = unknown> {
  default?: (props: DzFieldArraySlotProps<T>) => unknown
  append?: () => unknown
}
