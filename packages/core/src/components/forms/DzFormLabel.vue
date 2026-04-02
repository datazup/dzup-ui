<script setup lang="ts">
/**
 * DzFormLabel -- Label sub-part for DzFormField compound.
 *
 * Injects form field context to automatically connect the `for` attribute
 * to the form control's ID.
 *
 * @example
 * ```vue
 * <DzFormField>
 *   <DzFormLabel>Email</DzFormLabel>
 *   <DzInput v-model="email" />
 * </DzFormField>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'

const attrs = useAttrs()
const context = useFormFieldContext()

const classes = computed(() =>
  cn(
    'text-[length:var(--dz-text-sm)] font-medium text-[var(--dz-foreground)] leading-none',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
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
  <label
    :id="context?.labelId"
    :for="context?.fieldId"
    :class="classes"
    :data-required="context?.isRequired.value ? '' : undefined"
    :data-invalid="context?.isInvalid.value ? '' : undefined"
    :data-disabled="context?.isDisabled.value ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
    <span
      v-if="context?.isRequired.value"
      class="text-[var(--dz-danger)] ml-[var(--dz-spacing-0.5)]"
      aria-hidden="true"
    >*</span>
  </label>
</template>
