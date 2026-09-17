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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { cn } from '../../utilities/cn.ts'
import { segmentedVariants } from './DzSegmented.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Value of the selected segment; the default empty string selects none. */
const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzSegmentedProps>(), {
  size: 'md',
  disabled: false,
})

const emit = defineEmits<DzSegmentedEmits>()

defineSlots<DzSegmentedSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()

const styles = computed(() => segmentedVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

const itemClasses = computed(() => cn(styles.value.item(), props.ui?.item))

function handleValueChange(raw: unknown): void {
  const value = raw as string
  if (value) {
    model.value = value
    emit('change', value)
  }
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <ToggleGroupRoot
    :id="id"
    :dir="dzDirection"
    data-part="root"
    type="single"
    :model-value="model"
    :disabled="disabled"
    :class="rootClasses"
    :data-state="disabled ? 'disabled' : 'idle'"
    :aria-label="ariaLabel"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-segmented'), ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <ToggleGroupItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :disabled="item.disabled"
      data-part="item"
      :class="itemClasses"
      :aria-label="item.label"
    >
      <slot name="item" :item="item" :active="model === item.value">
        {{ item.label }}
      </slot>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
