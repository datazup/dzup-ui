<script setup lang="ts" generic="T = unknown">
import type { DzFieldArrayEmits, DzFieldArrayProps, DzFieldArraySlots } from './DzFieldArray.types.ts'
import { computed } from 'vue'

const props = withDefaults(defineProps<DzFieldArrayProps>(), {
  min: undefined,
  max: undefined,
})

const emit = defineEmits<DzFieldArrayEmits<T>>()
defineSlots<DzFieldArraySlots<T>>()

const model = defineModel<T[]>({ default: () => [] })

/** Current number of items in the array */
const count = computed(() => model.value.length)

/** Whether another row may be removed without dropping below `min` */
const canRemove = computed(() => props.min === undefined || count.value > props.min)

/** Whether another row may be appended without exceeding `max` */
const canAppend = computed(() => props.max === undefined || count.value < props.max)

/** Append a new item, enforcing the upper bound (`max`). */
function append(item: T): void {
  // Enforce the upper bound — appending past `max` is a no-op.
  if (!canAppend.value)
    return
  model.value = [...model.value, item]
  emit('add', item)
}

function remove(index: number): void {
  // Enforce the lower bound — removing below `min` is a no-op.
  if (!canRemove.value)
    return
  // Ignore out-of-range indices.
  if (index < 0 || index >= count.value)
    return
  model.value = model.value.filter((_, i) => i !== index)
  emit('remove', index)
}

function move(from: number, to: number): void {
  const len = count.value
  // Ignore out-of-range or no-op moves so the array can't be corrupted.
  if (from < 0 || from >= len || to < 0 || to >= len || from === to)
    return
  const arr = [...model.value]
  const [item] = arr.splice(from, 1)
  arr.splice(to, 0, item!)
  model.value = arr
  emit('reorder', from, to)
}
</script>

<template>
  <template v-for="(field, index) in model" :key="index">
    <slot
      :field="field"
      :index="index"
      :remove="() => remove(index)"
      :move="(to: number) => move(index, to)"
      :append="append"
      :can-remove="canRemove"
      :can-append="canAppend"
      :count="count"
    />
  </template>
  <slot v-if="canAppend" name="append" :append="append" :count="count" :can-append="canAppend" />
</template>
