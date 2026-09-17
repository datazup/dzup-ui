<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzFabEmits, DzFabProps, DzFabSlots, DzFabVariant } from './DzFab.types.ts'
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
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { fabVariants } from './DzFab.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzFabProps>(), {
  icon: undefined,
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  loading: false,
  position: 'static',
  type: 'button',
  ui: undefined,
})

const emit = defineEmits<DzFabEmits>()
const _slots = defineSlots<DzFabSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal it carried in `withDefaults` as `resolve`'s last
 * link, so an unprovided tree renders exactly what it rendered before.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<DzFabVariant>('DzFab', 'variant', [props.variant]) ?? 'solid',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzFab', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzFab', 'tone', [props.tone]) ?? 'primary',
)

const isInert = computed(() => props.disabled || props.loading)

/** Glyph dimension driven by the `--dz-fab-icon-size` token */
const iconSizeClass = 'h-[var(--dz-fab-icon-size)] w-[var(--dz-fab-icon-size)]'

const classes = computed(() =>
  cn(
    // Color (tone × variant) from the button family.
    buttonVariants({ variant: resolvedVariant.value, size: 'md', tone: resolvedTone.value }),
    // Shell: circle, elevation, sizing token, optional fixed positioning.
    // Listed second so the FAB shape/size wins over button defaults via cn().
    fabVariants({ position: props.position }),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

/** Per-part class values (ADR-19 §5). */
const spinnerClasses = computed(() => cn('animate-spin', iconSizeClass, props.ui?.spinner))
const iconWrapperClasses = computed(() => cn(
  'inline-flex items-center justify-center',
  iconSizeClass,
  props.ui?.icon,
))

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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <button
    :id="id"
    data-part="root"
    :type="type"
    :class="classes"
    :data-size="resolvedSize"
    :disabled="disabled || undefined"
    :aria-disabled="isInert || undefined"
    :aria-busy="loading || undefined"
    :aria-label="ariaLabel"
    :data-state="loading ? 'loading' : disabled ? 'disabled' : 'idle'"
    :data-tone="resolvedTone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-fab'), ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      data-part="spinner"
      :class="spinnerClasses"
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
    <span v-else data-part="icon" :class="iconWrapperClasses">
      <slot>
        <component :is="icon" v-if="icon" :class="iconSizeClass" aria-hidden="true" />
      </slot>
    </span>
  </button>
</template>
