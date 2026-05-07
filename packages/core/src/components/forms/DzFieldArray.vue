<script setup lang="ts" generic="T = unknown">
import type { DzFieldArrayEmits, DzFieldArrayProps, DzFieldArraySlots } from './DzFieldArray.types.ts'

const props = withDefaults(defineProps<DzFieldArrayProps>(), {
  min: undefined,
  max: undefined,
})

const emit = defineEmits<DzFieldArrayEmits<T>>()
defineSlots<DzFieldArraySlots<T>>()

const model = defineModel<T[]>({ default: () => [] })

function remove(index: number): void {
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

const showAppend = () => props.max === undefined || model.value.length < props.max
</script>

<template>
  <template v-for="(field, index) in model" :key="index">
    <slot
      :field="field"
      :index="index"
      :remove="() => remove(index)"
      :move="(to: number) => move(index, to)"
    />
  </template>
  <slot v-if="showAppend()" name="append" />
</template>
