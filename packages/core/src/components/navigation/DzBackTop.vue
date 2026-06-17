<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzBackTopEmits, DzBackTopProps, DzBackTopSlots } from './DzBackTop.types.ts'
/**
 * DzBackTop — Scroll-to-top button.
 *
 * A circular affordance that fades/slides in once a scroll container has moved
 * past `visibilityHeight`, and smooth-scrolls back to the top when activated
 * (respecting `prefers-reduced-motion`). Built on `DzFab` so its styling stays
 * consistent with the button family. While hidden it is removed from the tab
 * order and made inert.
 *
 * @example
 * ```vue
 * <DzBackTop />
 * <DzBackTop :visibility-height="200" :target="scrollEl" tone="primary" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useScrollToTop } from '../../composables/useScrollToTop/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzFab from '../buttons/DzFab.vue'
import { backTopVariants } from './DzBackTop.variants.ts'

const props = withDefaults(defineProps<DzBackTopProps>(), {
  ariaLabel: 'Back to top',
  visibilityHeight: 400,
  target: undefined,
  duration: 400,
  variant: 'solid',
  size: 'md',
  tone: 'neutral',
})

const emit = defineEmits<DzBackTopEmits>()
defineSlots<DzBackTopSlots>()

const attrs = useAttrs()

const { visible, scrollToTop } = useScrollToTop({
  visibilityHeight: () => props.visibilityHeight,
  duration: () => props.duration,
  target: () => props.target ?? null,
})

const classes = computed(() =>
  cn(backTopVariants({ visible: visible.value }), attrs.class as string | undefined),
)

/** Glyph dimension driven by the `--dz-fab-icon-size` token */
const iconSizeClass = 'h-[var(--dz-fab-icon-size)] w-[var(--dz-fab-icon-size)]'

function handleClick(event: MouseEvent): void {
  scrollToTop()
  emit('click', event)
}
</script>

<template>
  <DzFab
    :aria-label="ariaLabel"
    :variant="variant"
    :size="size"
    :tone="tone"
    position="static"
    :class="classes"
    :tabindex="visible ? undefined : -1"
    :aria-hidden="visible ? undefined : 'true'"
    data-component="dz-back-top"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
  >
    <slot>
      <!-- Default up-arrow glyph -->
      <svg
        :class="iconSizeClass"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </slot>
  </DzFab>
</template>
