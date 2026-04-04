<script setup lang="ts">
import type { DzFormFieldProps, DzFormFieldSlots } from './DzFormField.types.ts'
/**
 * DzFormField -- Compound wrapper that provides form field context.
 *
 * Provides unique IDs, validation state, and ARIA relationships to
 * child sub-parts (DzFormLabel, DzFormDescription, DzFormMessage)
 * via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzFormField :error="errorMsg" required>
 *   <DzFormLabel>Email</DzFormLabel>
 *   <DzInput v-model="email" />
 *   <DzFormDescription>We'll never share your email.</DzFormDescription>
 *   <DzFormMessage />
 * </DzFormField>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormField } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(defineProps<DzFormFieldProps>(), {
  disabled: false,
  required: false,
  invalid: false,
  error: undefined,
  id: undefined,
})

defineSlots<DzFormFieldSlots>()

const attrs = useAttrs()

useFormField({
  error: computed(() => props.error),
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  invalid: computed(() => props.invalid),
  id: computed(() => props.id),
})

const classes = computed(() =>
  cn('flex flex-col gap-[var(--dz-spacing-1_5)]', attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="classes"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="invalid || !!error ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    role="group"
  >
    <slot />
  </div>
</template>
