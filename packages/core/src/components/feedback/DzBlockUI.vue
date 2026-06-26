<script setup lang="ts">
import type { DzBlockUIEmits, DzBlockUIProps, DzBlockUISlots } from './DzBlockUI.types.ts'
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap/index.ts'
import { cn } from '../../utilities/cn.ts'
import { blockUiVariants } from './DzBlockUI.variants.ts'
import DzSpinner from './DzSpinner.vue'

defineOptions({
  inheritAttrs: false,
})
const blocked = defineModel<boolean>('blocked', { default: false })

/**
 * DzBlockUI — Content-loading mask.
 *
 * Masks and disables its slotted content (or the whole viewport) during async
 * work, preventing pointer and keyboard interaction without unmounting the
 * region — so scroll position and DOM state are preserved. Unlike
 * DzAsyncBoundary (which swaps the subtree for a fallback), DzBlockUI dims in
 * place. Blocked state is controlled via `v-model:blocked` (ADR-16).
 *
 * While blocked the overlay captures pointer events, the region is marked
 * `aria-busy`, and the masked content is made `inert` so keyboard users cannot
 * tab into the now-disabled controls. Focus is moved out of the region on block
 * and restored to the previously-focused element on unblock.
 *
 * @example
 * ```vue
 * <DzBlockUI v-model:blocked="saving" message="Saving…">
 *   <ProfileForm />
 * </DzBlockUI>
 * ```
 */

const props = withDefaults(defineProps<DzBlockUIProps>(), {
  fullScreen: false,
  message: undefined,
  tone: 'primary',
  spinnerSize: 'lg',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzBlockUIEmits>()
defineSlots<DzBlockUISlots>()

const attrs = useAttrs()
const styles = blockUiVariants()

const contentRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

/** Whether the masked content is removed from tab/pointer/a11y trees. */
const contentInert = ref(false)

/** Element that held focus before blocking, restored on unblock. */
let previouslyFocused: HTMLElement | null = null

// Focus trap keeps keyboard focus within the overlay in full-screen mode, where
// the rest of the page (not just the slotted content) must be unreachable.
const { activate, deactivate } = useFocusTrap(overlayRef)

const rootClasses = computed(() =>
  cn(styles.root(), attrs.class as string | undefined),
)

function setContentRef(el: unknown): void {
  contentRef.value = el as HTMLElement | null
}

/** Label announced by the default spinner (falls back to a generic string). */
const spinnerLabel = computed(() => props.message ?? 'Loading')

watch(blocked, async (isBlocked) => {
  if (typeof document === 'undefined')
    return

  if (isBlocked) {
    previouslyFocused = (document.activeElement as HTMLElement | null) ?? null
    contentInert.value = true
    await nextTick()
    // Move focus out of the (now inert) content and into the overlay so it is
    // never stranded on a hidden control.
    overlayRef.value?.focus()
    if (props.fullScreen)
      activate()
    emit('block')
  }
  else {
    deactivate()
    contentInert.value = false
    await nextTick()
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus()
    }
    previouslyFocused = null
    emit('unblock')
  }
})

onBeforeUnmount(() => {
  deactivate()
})
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-blocked="blocked ? '' : undefined"
    :data-full-screen="fullScreen ? '' : undefined"
    :aria-busy="blocked || undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div
      :ref="setContentRef"
      :class="styles.content()"
      :inert="contentInert || undefined"
      data-testid="dz-block-ui-content"
    >
      <slot />
    </div>

    <Teleport to="body" :disabled="!fullScreen">
      <Transition
        enter-active-class="transition-opacity duration-200 motion-reduce:transition-none"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <div
          v-if="blocked"
          ref="overlayRef"
          :class="styles.overlay({ fullScreen })"
          tabindex="-1"
          data-testid="dz-block-ui-overlay"
          @mousedown.prevent
          @pointerdown.prevent
        >
          <slot name="overlay" :blocked="blocked">
            <DzSpinner :size="spinnerSize" :tone="tone" :label="spinnerLabel" />
            <span v-if="message" :class="styles.message()">{{ message }}</span>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
