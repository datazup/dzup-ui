<script setup lang="ts">
import type { DzImageCardProps, DzImageCardSlots } from './DzImageCard.types.ts'
/**
 * DzImageCard — Card component with a prominent image.
 *
 * Displays an image at the top with configurable aspect ratio,
 * optional overlay, and body/header/footer content slots.
 *
 * @example
 * ```vue
 * <DzImageCard src="/photo.jpg" alt="Project" aspect-ratio="16/9">
 *   <h3>Project Title</h3>
 *   <p>Description text here.</p>
 *   <template #footer>
 *     <DzButton size="sm">Learn More</DzButton>
 *   </template>
 * </DzImageCard>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { imageCardVariants } from './DzImageCard.variants.ts'

const props = withDefaults(defineProps<DzImageCardProps>(), {
  variant: 'elevated',
  aspectRatio: '16/9',
})

defineSlots<DzImageCardSlots>()

const attrs = useAttrs()
const styles = computed(() => imageCardVariants({ variant: props.variant }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const imageStyle = computed(() => ({
  'aspect-ratio': props.aspectRatio,
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
    :class="rootClasses"
    data-state="ready"
    :data-variant="variant"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Image area -->
    <div :class="styles.imageWrapper()" :style="imageStyle">
      <img
        :src="src"
        :alt="alt"
        :class="styles.image()"
      >
      <div v-if="$slots.overlay" :class="styles.overlay()">
        <slot name="overlay" />
      </div>
    </div>

    <!-- Header -->
    <div v-if="$slots.header" :class="styles.header()">
      <slot name="header" />
    </div>

    <!-- Body content -->
    <div v-if="$slots.default" :class="styles.body()">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" :class="styles.footer()">
      <slot name="footer" />
    </div>
  </div>
</template>
