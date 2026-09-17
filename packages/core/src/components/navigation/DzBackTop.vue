<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzFabVariant } from '../buttons/DzFab.types.ts'
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
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useScrollToTop } from '../../composables/useScrollToTop/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzFab from '../buttons/DzFab.vue'
import { backTopVariants } from './DzBackTop.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzBackTopProps>(), {
  ariaLabel: undefined,
  visibilityHeight: 400,
  target: undefined,
  duration: 400,
  variant: undefined,
  size: undefined,
  tone: undefined,
})

const emit = defineEmits<DzBackTopEmits>()
defineSlots<DzBackTopSlots>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzBackTop')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * This component FORWARDS its three axes to an inner `DzFab` that has also
 * adopted, which makes the literals load-bearing rather than cosmetic: this
 * component's `tone` default is `neutral` while `DzFab`'s is `primary`, so
 * passing `undefined` down would silently repaint every back-to-top button.
 * Keeping the literal as `resolve`'s last link means the value handed to the
 * FAB is always explicit, and a host configuring `DzBackTop` reaches it here
 * rather than being shadowed by a `DzFab` default.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<DzFabVariant>('DzBackTop', 'variant', [props.variant]) ?? 'solid',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzBackTop', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzBackTop', 'tone', [props.tone]) ?? 'neutral',
)

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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <DzFab
    data-part="root"
    :aria-label="resolvedAriaLabel"
    :variant="resolvedVariant"
    :size="resolvedSize"
    :tone="resolvedTone"
    position="static"
    :class="classes"
    :ui="ui"
    :tabindex="visible ? undefined : -1"
    :aria-hidden="visible ? undefined : 'true'"
    data-component="dz-back-top"
    v-bind="{ ...dzTestId('dz-back-top'), ...$attrs, class: undefined }"
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
