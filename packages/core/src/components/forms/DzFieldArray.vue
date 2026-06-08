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

/** Whether another row may be removed without dropping below `min` */
const canRemove = computed(() => props.min === undefined || model.value.length > props.min)

/** Whether another row may be appended without exceeding `max` */
const canAppend = computed(() => props.max === undefined || model.value.length < props.max)

function remove(index: number): void {
  // Enforce the lower bound — removing below `min` is a no-op.
  if (!canRemove.value)
    return
  model.value = model.value.filter((_, i) => i !== index)
  emit('remove', index)
}

function move(from: number, to: number): void {
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
      :can-remove="canRemove"
      :can-append="canAppend"
      :count="model.length"
    />
  </template>
  <slot v-if="canAppend" name="append" :count="model.length" :can-append="canAppend" />
</template>
