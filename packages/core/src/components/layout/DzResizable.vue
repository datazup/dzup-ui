<script setup lang="ts">
import type {
  DzResizableContext,
  DzResizableEmits,
  DzResizableProps,
  DzResizableSlots,
} from './DzResizable.types.ts'
import { SplitterGroup } from 'reka-ui'
/**
 * DzResizable — Compound resizable panel root using Reka UI Splitter (ADR-07).
 *
 * Wraps Reka UI SplitterGroup with styled variant support.
 * Provides context to DzResizablePanel/Handle children via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzResizable direction="horizontal">
 *   <DzResizablePanel :default-size="50">Left</DzResizablePanel>
 *   <DzResizableHandle with-handle />
 *   <DzResizablePanel :default-size="50">Right</DzResizablePanel>
 * </DzResizable>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzResizableProps>(), {
  direction: 'horizontal',
  size: 'md',
  disabled: false,
  keyboardResizeBy: 10,
})

const emit = defineEmits<DzResizableEmits>()
defineSlots<DzResizableSlots>()

const attrs = useAttrs()

const context: DzResizableContext = {
  direction: toRef(() => props.direction),
  size: toRef(() => props.size),
}

provide(DZ_RESIZABLE_KEY, context)

const styles = computed(() =>
  resizableVariants({ direction: props.direction, size: props.size }),
)

const rootClasses = computed(() =>
  cn(styles.value.group(), attrs.class as string | undefined, props.ui?.root),
)

function handleLayoutChange(sizes: number[]): void {
  emit('layoutChange', sizes)
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <SplitterGroup
    :id="id"
    data-part="root"
    :direction="direction"
    :keyboard-resize-by="keyboardResizeBy"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-resizable'), ...$attrs, class: undefined }"
    @layout="handleLayoutChange"
  >
    <slot />
  </SplitterGroup>
</template>
