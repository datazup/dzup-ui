<script setup lang="ts">
/**
 * DzFormDescription -- Description sub-part for DzFormField compound.
 *
 * Injects form field context to automatically set its ID, which is
 * referenced by the control's aria-describedby attribute.
 *
 * @example
 * ```vue
 * <DzFormField>
 *   <DzFormLabel>Email</DzFormLabel>
 *   <DzInput v-model="email" />
 *   <DzFormDescription>We'll never share your email.</DzFormDescription>
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
    'text-[length:var(--dz-text-xs)] text-[var(--dz-muted-foreground)]',
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
    :id="context?.descriptionId"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </p>
</template>
