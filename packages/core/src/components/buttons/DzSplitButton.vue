<script setup lang="ts">
import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzSplitButtonContext, DzSplitButtonProps, DzSplitButtonSlots } from './DzSplitButton.types.ts'
/**
 * DzSplitButton — Compound split button with primary action + dropdown.
 *
 * Provides variant, size, tone, disabled, and loading context to child
 * components via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzSplitButton tone="primary" size="md">
 *   <DzSplitButtonAction @click="save">Save</DzSplitButtonAction>
 *   <DzSplitButtonMenu>
 *     <DzDropdownMenu>...</DzDropdownMenu>
 *   </DzSplitButtonMenu>
 * </DzSplitButton>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_SPLIT_BUTTON_KEY } from './DzSplitButton.types.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzSplitButtonProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  loading: false,
  ui: undefined,
})

defineSlots<DzSplitButtonSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Resolution happens HERE rather than in the children: the compound already
 * owns these three axes for everything inside it (that is what the context is
 * for), so resolving once keeps one answer per split button. Each axis keeps
 * the literal it carried in `withDefaults` as the last link, so the context a
 * child injects is never `undefined` and an unprovided tree is unchanged.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ButtonVariant>('DzSplitButton', 'variant', [props.variant]) ?? 'solid',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzSplitButton', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzSplitButton', 'tone', [props.tone]) ?? 'primary',
)

const context: DzSplitButtonContext = {
  variant: toRef(() => resolvedVariant.value),
  size: toRef(() => resolvedSize.value),
  tone: toRef(() => resolvedTone.value),
  disabled: toRef(() => props.disabled),
  loading: toRef(() => props.loading),
}

provide(DZ_SPLIT_BUTTON_KEY, context)

const classes = computed(() =>
  cn(
    'inline-flex items-center',
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    :id="id"
    data-part="root"
    role="group"
    :class="classes"
    :aria-label="ariaLabel"
    :data-state="loading ? 'loading' : disabled ? 'disabled' : 'idle'"
    :data-disabled="disabled ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-tone="resolvedTone"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-split-button'), ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
