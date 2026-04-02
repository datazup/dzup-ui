<script setup lang="ts">
import type { DzSplitterPanelProps, DzSplitterPanelSlots } from './DzSplitter.types.ts'
import { SplitterPanel } from 'reka-ui'
/**
 * DzSplitterPanel — Naming alias for DzResizablePanel.
 *
 * Identical to DzResizablePanel; uses the same Reka UI SplitterPanel
 * and the same DZ_RESIZABLE_KEY injection context.
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

const props = defineProps<DzSplitterPanelProps>()
defineSlots<DzSplitterPanelSlots>()

const attrs = useAttrs()
const resizableContext = inject(DZ_RESIZABLE_KEY, null)

const styles = computed(() =>
  resizableVariants({
    direction: resizableContext?.direction.value ?? 'horizontal',
    size: resizableContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.panel(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <SplitterPanel
    :default-size="props.defaultSize"
    :min-size="props.minSize"
    :max-size="props.maxSize"
    :collapsible="props.collapsible"
    :collapsed-size="props.collapsedSize"
    :order="props.order"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </SplitterPanel>
</template>
