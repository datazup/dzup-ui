<script setup lang="ts">
import type { DzSegmentedEmits, DzSegmentedProps, DzSegmentedSlots } from './DzSegmented.types.ts'
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
/**
 * DzSegmented — Segmented control (tab-like toggle).
 *
 * Uses Reka UI ToggleGroupRoot + ToggleGroupItem (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzSegmented
 *   v-model="view"
 *   :items="[
 *     { value: 'list', label: 'List' },
 *     { value: 'grid', label: 'Grid' },
 *     { value: 'table', label: 'Table' },
 *   ]"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { segmentedVariants } from './DzSegmented.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzSegmentedProps>(), {
  size: 'md',
  disabled: false,
})

const emit = defineEmits<DzSegmentedEmits>()
defineSlots<DzSegmentedSlots>()

const attrs = useAttrs()

const styles = computed(() => segmentedVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const itemClasses = computed(() => styles.value.item())

function handleValueChange(raw: unknown): void {
  const value = raw as string
  if (value) {
    model.value = value
    emit('change', value)
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ToggleGroupRoot
    :id="id"
    type="single"
    :model-value="model"
    :disabled="disabled"
    :class="rootClasses"
    :data-state="disabled ? 'disabled' : 'idle'"
    :aria-label="ariaLabel"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <ToggleGroupItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      :class="itemClasses"
      :aria-label="item.label"
    >
      <slot name="item" :item="item" :active="model === item.value">
        {{ item.label }}
      </slot>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
