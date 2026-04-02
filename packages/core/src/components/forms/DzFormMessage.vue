<script setup lang="ts">
/**
 * DzFormMessage -- Error/validation message sub-part for DzFormField compound.
 *
 * Injects form field context to display the error message and set
 * appropriate ARIA attributes. Uses role="alert" when showing an error.
 *
 * @example
 * ```vue
 * <DzFormField :error="errorMsg">
 *   <DzFormLabel>Email</DzFormLabel>
 *   <DzInput v-model="email" />
 *   <DzFormMessage />
 * </DzFormField>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'

const attrs = useAttrs()
const context = useFormFieldContext()

const isShowingError = computed(() => context?.isInvalid.value && !!context.error.value)

const classes = computed(() =>
  cn(
    'text-[length:var(--dz-text-xs)]',
    isShowingError.value
      ? 'text-[var(--dz-danger)]'
      : 'text-[var(--dz-muted-foreground)]',
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
  <p
    :id="context?.messageId"
    :class="classes"
    :role="isShowingError ? 'alert' : undefined"
    :aria-live="isShowingError ? 'polite' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <template v-if="isShowingError">
      {{ context!.error.value }}
    </template>
    <slot v-else />
  </p>
</template>
