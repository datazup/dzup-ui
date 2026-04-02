<script setup lang="ts">
import type { DzResizablePanelProps, DzResizablePanelSlots } from './DzResizable.types.ts'
import { SplitterPanel } from 'reka-ui'
/**
 * DzResizablePanel — Panel child of DzResizable using Reka UI SplitterPanel (ADR-07).
 *
 * Inherits direction/size context from parent DzResizable via inject (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

const props = defineProps<DzResizablePanelProps>()
defineSlots<DzResizablePanelSlots>()

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
