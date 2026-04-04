<script setup lang="ts">
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
import { cn } from '../../utilities/cn.ts'
import { DZ_SPLIT_BUTTON_KEY } from './DzSplitButton.types.ts'

const props = withDefaults(defineProps<DzSplitButtonProps>(), {
  variant: 'solid',
  size: 'md',
  tone: 'primary',
  disabled: false,
  loading: false,
})

defineSlots<DzSplitButtonSlots>()

const attrs = useAttrs()

const context: DzSplitButtonContext = {
  variant: toRef(() => props.variant),
  size: toRef(() => props.size),
  tone: toRef(() => props.tone),
  disabled: toRef(() => props.disabled),
  loading: toRef(() => props.loading),
}

provide(DZ_SPLIT_BUTTON_KEY, context)

const classes = computed(() =>
  cn(
    'inline-flex items-center',
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    role="group"
    :class="classes"
    :aria-label="ariaLabel"
    :data-state="loading ? 'loading' : disabled ? 'disabled' : 'idle'"
    :data-disabled="disabled ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-tone="tone"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
