<script setup lang="ts">
import type { DzImageEmits, DzImageProps, DzImageSlots } from './DzImage.types.ts'
/**
 * DzImage — Enhanced image component with loading and error states.
 *
 * Provides loading placeholder, error fallback, lazy loading,
 * and object-fit control.
 *
 * @example
 * ```vue
 * <DzImage src="/photo.jpg" alt="Photo" lazy />
 * <DzImage src="/photo.jpg" alt="Photo" fallback="/placeholder.jpg" fit="contain" />
 * ```
 */
import { computed, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { imageVariants } from './DzImage.variants.ts'

const props = withDefaults(defineProps<DzImageProps>(), {
  lazy: false,
  fit: 'cover',
})

const emit = defineEmits<DzImageEmits>()
defineSlots<DzImageSlots>()

const attrs = useAttrs()

/** Loading state */
const isLoading = ref(true)
/** Error state */
const hasError = ref(false)
/** Whether fallback was also attempted */
const fallbackError = ref(false)

const styles = computed(() => imageVariants({ fit: props.fit }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const imgClasses = computed(() => styles.value.img())
const placeholderClasses = computed(() => styles.value.placeholder())

/** The actual src to use (original or fallback) */
const effectiveSrc = computed(() => {
  if (hasError.value && props.fallback && !fallbackError.value) {
    return props.fallback
  }
  return props.src
})

/** Style for aspect ratio */
const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.aspectRatio) {
    style['aspect-ratio'] = props.aspectRatio
  }
  return style
})

function handleLoad(event: Event): void {
  isLoading.value = false
  emit('load', event)
}

function handleError(event: Event): void {
  isLoading.value = false
  if (hasError.value) {
    fallbackError.value = true
  }
  else {
    hasError.value = true
  }
  emit('error', event)
}
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
    :style="rootStyle"
    :aria-label="ariaLabel"
    :data-state="hasError && fallbackError ? 'error' : isLoading ? 'loading' : 'loaded'"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Loading placeholder -->
    <div v-if="isLoading" :class="placeholderClasses">
      <slot name="loading">
        <svg
          class="h-8 w-8 animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </slot>
    </div>

    <!-- Error fallback -->
    <div v-if="hasError && fallbackError" :class="placeholderClasses">
      <slot name="error">
        <svg
          class="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </slot>
    </div>

    <!-- Image element -->
    <img
      v-if="!(hasError && fallbackError)"
      :src="effectiveSrc"
      :alt="alt"
      :class="imgClasses"
      :loading="lazy ? 'lazy' : undefined"
      @load="handleLoad"
      @error="handleError"
    >
  </div>
</template>
