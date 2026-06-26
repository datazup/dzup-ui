<script setup lang="ts">
import type { DzFabEmits, DzFabProps, DzFabSlots } from './DzFab.types.ts'
/**
 * DzFab — Floating action button.
 *
 * A circular, elevated button for a single persistent primary action. Reuses
 * the DzButton color tiers (tone × variant) and adds FAB sizing/elevation plus
 * optional fixed corner positioning. Requires `ariaLabel` since it is
 * icon-only.
 *
 * @example
 * ```vue
 * <DzFab :icon="PlusIcon" aria-label="Compose" position="bottom-right" />
 * <DzFab aria-label="Ask AI" tone="primary"><SparkleIcon /></DzFab>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { fabVariants } from './DzFab.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzFabProps>(), {
  icon: undefined,
  variant: 'solid',
  size: 'md',
  tone: 'primary',
  disabled: false,
  loading: false,
  position: 'static',
  type: 'button',
})

const emit = defineEmits<DzFabEmits>()
const _slots = defineSlots<DzFabSlots>()

const attrs = useAttrs()

const isInert = computed(() => props.disabled || props.loading)

/** Glyph dimension driven by the `--dz-fab-icon-size` token */
const iconSizeClass = 'h-[var(--dz-fab-icon-size)] w-[var(--dz-fab-icon-size)]'

const classes = computed(() =>
  cn(
    // Color (tone × variant) from the button family.
    buttonVariants({ variant: props.variant, size: 'md', tone: props.tone }),
    // Shell: circle, elevation, sizing token, optional fixed positioning.
    // Listed second so the FAB shape/size wins over button defaults via cn().
    fabVariants({ position: props.position }),
    attrs.class as string | undefined,
  ),
)

function handleClick(event: MouseEvent): void {
  if (isInert.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<template>
  <button
    :id="id"
    :type="type"
    :class="classes"
    :data-size="size"
    :disabled="disabled || undefined"
    :aria-disabled="isInert || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    :data-state="loading ? 'loading' : disabled ? 'disabled' : 'idle'"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin"
      :class="iconSizeClass"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Icon: default slot wins over the `icon` prop -->
    <span v-else class="inline-flex items-center justify-center" :class="iconSizeClass">
      <slot>
        <component :is="icon" v-if="icon" :class="iconSizeClass" aria-hidden="true" />
      </slot>
    </span>
  </button>
</template>

<style scoped>
/* Accessibility: respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  :deep(*),
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
