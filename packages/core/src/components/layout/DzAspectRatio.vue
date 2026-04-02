<script setup lang="ts">
import type { DzAspectRatioProps, DzAspectRatioSlots } from './DzAspectRatio.types.ts'
/**
 * DzAspectRatio — Maintains a consistent aspect ratio for its content.
 *
 * Uses CSS `aspect-ratio` property to constrain content dimensions.
 *
 * @example
 * ```vue
 * <DzAspectRatio :ratio="16 / 9">
 *   <img src="/photo.jpg" alt="Photo" class="object-cover w-full h-full" />
 * </DzAspectRatio>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(defineProps<DzAspectRatioProps>(), {
  ratio: 1,
})

defineSlots<DzAspectRatioSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn('relative w-full overflow-hidden', attrs.class as string | undefined),
)

const style = computed(() => ({
  'aspect-ratio': `${props.ratio}`,
}))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="classes"
    :style="style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
