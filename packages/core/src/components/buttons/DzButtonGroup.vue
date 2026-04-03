<script setup lang="ts">
import type { DzButtonGroupContext, DzButtonGroupProps, DzButtonGroupSlots } from './DzButtonGroup.types.ts'
/**
 * DzButtonGroup — Groups buttons together with shared styling context.
 *
 * Provides size, variant, tone, and disabled state to child DzButton
 * components via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzButtonGroup size="sm" variant="outline">
 *   <DzButton>Left</DzButton>
 *   <DzButton>Center</DzButton>
 *   <DzButton>Right</DzButton>
 * </DzButtonGroup>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_BUTTON_GROUP_KEY } from './DzButtonGroup.types.ts'
import { buttonGroupVariants } from './DzButtonGroup.variants.ts'

const props = withDefaults(defineProps<DzButtonGroupProps>(), {
  orientation: 'horizontal',
  size: undefined,
  variant: undefined,
  tone: undefined,
  disabled: false,
})

defineSlots<DzButtonGroupSlots>()

const attrs = useAttrs()

const context: DzButtonGroupContext = {
  size: toRef(() => props.size),
  variant: toRef(() => props.variant),
  tone: toRef(() => props.tone),
  orientation: toRef(() => props.orientation),
  disabled: toRef(() => props.disabled),
}

provide(DZ_BUTTON_GROUP_KEY, context)

const classes = computed(() =>
  cn(
    buttonGroupVariants({ orientation: props.orientation }),
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
    :data-state="disabled ? 'disabled' : 'ready'"
    :data-disabled="disabled ? '' : undefined"
    :data-tone="tone"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
