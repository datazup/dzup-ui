<script setup lang="ts">
/**
 * DzFormMessage -- Error/validation message sub-part for DzFormField compound.
 *
 * Injects form field context to display the error message and set
 * appropriate ARIA attributes.
 *
 * The error is announced with `aria-live="polite"` and **not** `role="alert"`.
 * It carried both, which is contradictory: `alert` implies `aria-live="assertive"`
 * and takes precedence, so the standing field error interrupted whatever the
 * user was being told. A validation message that is already on screen when the
 * control is focused is read as part of the control's description; only a
 * message that *arrives* — an async or server error — needs a live region, and
 * polite is the right urgency for it (renderer contract C4).
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

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const context = useFormFieldContext()

// Tell the field this message exists (renderer contract C4).
context?.registerMessage()

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

<template>
  <p
    :id="context?.messageId"
    :class="classes"
    :aria-live="isShowingError ? 'polite' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <template v-if="isShowingError">
      {{ context!.error.value }}
    </template>
    <slot v-else />
  </p>
</template>
