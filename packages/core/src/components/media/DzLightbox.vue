<script setup lang="ts">
import type {
  DzLightboxEmits,
  DzLightboxProps,
  DzLightboxSlots,
} from './DzLightbox.types.ts'
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
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
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { lightboxVariants } from './DzLightbox.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Whether the lightbox overlay is open; `false` keeps it closed. */
const open = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzLightboxProps>(), {
  startIndex: 0,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzLightboxEmits>()

defineSlots<DzLightboxSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

const attrs = useAttrs()
const currentIndex = ref(props.startIndex)
/**
 * TASK-N1-O3. `tv({ slots })` returns a map of FUNCTIONS, and every binding in
 * the template below used to read `styles.closeButton` rather than
 * `styles.closeButton()`. Vue's `normalizeClass` has no case for a function, so
 * it produced the empty string: DzLightbox rendered with **no classes at all**
 * on its overlay, content, image, caption, counter, close button and both nav
 * buttons. The browser matrix caught it as a WCAG 2.5.8 failure -- the close
 * control measured 16x16 and the nav controls 20x20, which is the size of the
 * bare SVG inside them, against the 32x32 and 40x40 the variants declare -- and
 * it was only intermittent because the overlay is teleported and mounts for a
 * few frames. It was never a timing artefact; it was this.
 */
const styles = lightboxVariants()

watch(open, (val) => {
  if (val) {
    currentIndex.value = props.startIndex
  }
})

const currentImage = computed(() => props.images[currentIndex.value])
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.images.length - 1)
const fallbackTitle = computed(() => props.ariaLabel ?? currentImage.value?.alt ?? 'Image viewer')
const fallbackDescription = computed(() => {
  if (!currentImage.value)
    return 'Fullscreen image viewer'
  const parts = [`Image ${currentIndex.value + 1} of ${props.images.length}`]
  if (currentImage.value.caption)
    parts.push(currentImage.value.caption)
  return parts.join('. ')
})
const contentAria = computed<Record<string, unknown>>(() => {
  const aria: Record<string, unknown> = {}
  if (props.ariaLabel !== undefined)
    aria['aria-label'] = props.ariaLabel
  if (props.ariaLabelledby !== undefined)
    aria['aria-labelledby'] = props.ariaLabelledby
  if (props.ariaDescribedby !== undefined)
    aria['aria-describedby'] = props.ariaDescribedby
  return aria
})

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
  const previousKey = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  const nextKey = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'

  switch (event.key) {
    case previousKey:
      event.preventDefault()
      prev()
      break
    case nextKey:
      event.preventDefault()
      next()
      break
  }
}

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzLightbox')
</script>

<template>
  <slot />

  <DialogRoot v-model:open="open">
    <DialogPortal
      :to="resolvedPortalTo"
      :disabled="portalDisabled"
      :defer="portalDefer"
    >
      <DialogOverlay data-part="overlay" :class="cn(styles.overlay(), props.ui?.overlay)" />

      <DialogContent
        :id="id"
        data-part="content"
        :class="cn(styles.content(), attrs.class as string | undefined, props.ui?.content)"
        style="contain: layout style"
        v-bind="{ ...contentAria, ...$attrs, class: undefined }"
        @keydown="handleKeydown"
      >
        <DialogTitle class="sr-only">
          {{ fallbackTitle }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ fallbackDescription }}
        </DialogDescription>
        <!-- Counter -->
        <span v-if="images.length > 1" data-part="label" :class="cn(styles.counter(), props.ui?.label)">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>

        <!-- Close button -->
        <button
          type="button"
          data-part="close"
          :class="cn(styles.closeButton(), props.ui?.close)"
          :aria-label="dzMessages.close"
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
          data-part="action"
          :class="cn(styles.navButton(), styles.prevButton(), props.ui?.action)"
          :disabled="!hasPrev"
          :aria-label="dzMessages.previous"
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
          :class="styles.image()"
        >

        <!-- Next -->
        <button
          v-if="images.length > 1"
          type="button"
          data-part="action"
          :class="cn(styles.navButton(), styles.nextButton(), props.ui?.action)"
          :disabled="!hasNext"
          :aria-label="dzMessages.next"
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
        <div v-if="currentImage?.caption" data-part="description" :class="cn(styles.caption(), props.ui?.description)">
          <slot name="caption" :image="currentImage" :index="currentIndex">
            {{ currentImage.caption }}
          </slot>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
