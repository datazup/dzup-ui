<script setup lang="ts">
import type { DzScrollAreaProps, DzScrollAreaSlots } from './DzScrollArea.types.ts'
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui'
/**
 * DzScrollArea — Custom scrollbar area using Reka UI (ADR-07).
 *
 * Provides styled scrollbars with consistent look across browsers.
 *
 * @example
 * ```vue
 * <DzScrollArea class="h-72 w-48">
 *   <div class="p-4">Long content here...</div>
 * </DzScrollArea>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { scrollAreaVariants } from './DzScrollArea.variants.ts'

const props = withDefaults(defineProps<DzScrollAreaProps>(), {
  orientation: 'vertical',
  type: 'hover',
})

defineSlots<DzScrollAreaSlots>()

const attrs = useAttrs()
const styles = computed(() => scrollAreaVariants())

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const vScrollbarClasses = computed(() =>
  scrollAreaVariants({ scrollbarOrientation: 'vertical' }).scrollbar(),
)

const hScrollbarClasses = computed(() =>
  scrollAreaVariants({ scrollbarOrientation: 'horizontal' }).scrollbar(),
)

/** Whether to show vertical scrollbar */
const showVertical = computed(() =>
  props.orientation === 'vertical' || props.orientation === 'both',
)

/** Whether to show horizontal scrollbar */
const showHorizontal = computed(() =>
  props.orientation === 'horizontal' || props.orientation === 'both',
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ScrollAreaRoot
    :id="id"
    :type="type"
    :class="rootClasses"
    :aria-label="ariaLabel"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <ScrollAreaViewport :class="styles.viewport()">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      v-if="showVertical"
      orientation="vertical"
      :class="vScrollbarClasses"
    >
      <ScrollAreaThumb :class="styles.thumb()" />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      v-if="showHorizontal"
      orientation="horizontal"
      :class="hScrollbarClasses"
    >
      <ScrollAreaThumb :class="styles.thumb()" />
    </ScrollAreaScrollbar>

    <ScrollAreaCorner v-if="orientation === 'both'" :class="styles.corner()" />
  </ScrollAreaRoot>
</template>
