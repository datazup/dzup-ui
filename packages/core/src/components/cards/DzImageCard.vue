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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { imageCardVariants } from './DzImageCard.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzImageCardProps>(), {
  variant: 'elevated',
  aspectRatio: '16/9',
  loading: 'lazy',
})

defineSlots<DzImageCardSlots>()

const attrs = useAttrs()
const styles = computed(() => imageCardVariants({ variant: props.variant }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

const imageStyle = computed(() => ({
  'aspect-ratio': props.aspectRatio,
}))

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    :id="id"
    data-part="root"
    :class="rootClasses"
    data-state="ready"
    :data-variant="variant"
    v-bind="{ ...dzTestId('dz-image-card'), ...$attrs, class: undefined }"
  >
    <!-- Image area -->
    <div :class="styles.imageWrapper()" :style="imageStyle">
      <img
        :src="src"
        :alt="alt"
        :loading="loading"
        decoding="async"
        :class="styles.image()"
      >
      <div v-if="$slots.overlay" data-part="overlay" :class="cn(styles.overlay(), props.ui?.overlay)">
        <slot name="overlay" />
      </div>
    </div>

    <!-- Header -->
    <div v-if="$slots.header" data-part="header" :class="cn(styles.header(), props.ui?.header)">
      <slot name="header" />
    </div>

    <!-- Body content -->
    <div v-if="$slots.default" data-part="body" :class="cn(styles.body(), props.ui?.body)">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" data-part="footer" :class="cn(styles.footer(), props.ui?.footer)">
      <slot name="footer" />
    </div>
  </div>
</template>
