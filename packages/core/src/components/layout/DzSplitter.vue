<script setup lang="ts">
import type {
  DzResizableContext,
} from './DzResizable.types.ts'
import type {
  DzSplitterEmits,
  DzSplitterProps,
  DzSplitterSlots,
} from './DzSplitter.types.ts'
import { SplitterGroup } from 'reka-ui'
/**
 * DzSplitter — Naming alias for DzResizable.
 *
 * Provides the same resizable panel layout as DzResizable
 * under an alternative name for API familiarity.
 *
 * @example
 * ```vue
 * <DzSplitter direction="horizontal">
 *   <DzSplitterPanel :default-size="50">Left</DzSplitterPanel>
 *   <DzSplitterHandle with-handle />
 *   <DzSplitterPanel :default-size="50">Right</DzSplitterPanel>
 * </DzSplitter>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

const props = withDefaults(defineProps<DzSplitterProps>(), {
  direction: 'horizontal',
  size: 'md',
  disabled: false,
  keyboardResizeBy: 10,
})

const emit = defineEmits<DzSplitterEmits>()
defineSlots<DzSplitterSlots>()

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
  cn(styles.value.group(), attrs.class as string | undefined),
)

function handleLayoutChange(sizes: number[]): void {
  emit('layoutChange', sizes)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <SplitterGroup
    :id="id"
    :direction="direction"
    :keyboard-resize-by="keyboardResizeBy"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @layout="handleLayoutChange"
  >
    <slot />
  </SplitterGroup>
</template>
