<script setup lang="ts">
import type {
  DzLightboxEmits,
  DzLightboxProps,
  DzLightboxSlots,
} from './DzLightbox.types.ts'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
/**
 * DzLightbox — Fullscreen image viewer overlay.
 *
 * Uses Reka UI DialogRoot internally for the overlay (ADR-07).
 * v-model via defineModel<boolean> for open state (ADR-16).
 *
 * @example
 * ```vue
 * <DzLightbox v-model="isOpen" :images="gallery" :start-index="0" />
 * ```
 */
import { computed, ref, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { lightboxVariants } from './DzLightbox.variants.ts'

const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzLightboxProps>(), {
  startIndex: 0,
})

const emit = defineEmits<DzLightboxEmits>()
defineSlots<DzLightboxSlots>()

const attrs = useAttrs()
const currentIndex = ref(props.startIndex)
const styles = lightboxVariants()

watch(open, (val) => {
  if (val) {
    currentIndex.value = props.startIndex
  }
})

const currentImage = computed(() => props.images[currentIndex.value])
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.images.length - 1)

function goTo(index: number): void {
  const resolved = Math.max(0, Math.min(index, props.images.length - 1))
  currentIndex.value = resolved
  emit('change', resolved)
}

function prev(): void {
  if (hasPrev.value)
    goTo(currentIndex.value - 1)
}

function next(): void {
  if (hasNext.value)
    goTo(currentIndex.value + 1)
}

function handleKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      prev()
      break
    case 'ArrowRight':
      event.preventDefault()
      next()
      break
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <slot />

  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay :class="styles.overlay" />

      <DialogContent
        :id="id"
        :class="cn(styles.content, attrs.class as string | undefined)"
        :aria-label="ariaLabel ?? 'Image viewer'"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        style="contain: layout style"
        v-bind="{ ...$attrs, class: undefined }"
        @keydown="handleKeydown"
      >
        <!-- Counter -->
        <span v-if="images.length > 1" :class="styles.counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>

        <!-- Close button -->
        <button
          type="button"
          :class="styles.closeButton"
          aria-label="Close lightbox"
          @click="open = false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Previous -->
        <button
          v-if="images.length > 1"
          type="button"
          :class="cn(styles.navButton, styles.prevButton)"
          :disabled="!hasPrev"
          aria-label="Previous image"
          @click="prev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <!-- Image -->
        <img
          v-if="currentImage"
          :src="currentImage.src"
          :alt="currentImage.alt ?? ''"
          :class="styles.image"
        >

        <!-- Next -->
        <button
          v-if="images.length > 1"
          type="button"
          :class="cn(styles.navButton, styles.nextButton)"
          :disabled="!hasNext"
          aria-label="Next image"
          @click="next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <!-- Caption -->
        <div v-if="currentImage?.caption" :class="styles.caption">
          <slot name="caption" :image="currentImage" :index="currentIndex">
            {{ currentImage.caption }}
          </slot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  [data-state] {
    animation: none !important;
  }
}
</style>
