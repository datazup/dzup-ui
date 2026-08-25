<script setup lang="ts">
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
import type { VNode } from 'vue'
import type { DzFormFieldProps, DzFormFieldSlots } from './DzFormField.types.ts'
import { Comment, computed, Fragment, useAttrs, useSlots } from 'vue'
import { useFormField } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzFormDescription from './DzFormDescription.vue'
import DzFormMessage from './DzFormMessage.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzFormFieldProps>(), {
  disabled: false,
  required: false,
  invalid: false,
  error: undefined,
  id: undefined,
})

defineSlots<DzFormFieldSlots>()

const attrs = useAttrs()
const slots = useSlots()

/**
 * Whether the default slot contains a given component, at any depth.
 *
 * The field has to know before its children render, because the control inside
 * it serialises its `aria-describedby` on the way past — and on the server
 * there is no second pass in which a late registration could correct it. So the
 * slot's vnodes are walked instead: synchronous, and the same answer on the
 * server and in the browser.
 *
 * Depth matters because nobody writes the sub-parts as bare siblings; they sit
 * inside a layout `<div>` more often than not.
 */
function slotContains(nodes: readonly VNode[] | undefined, component: unknown): boolean {
  if (nodes === undefined)
    return false
  for (const node of nodes) {
    if (node.type === component)
      return true
    if (node.type === Comment)
      continue
    const children = node.children
    if (Array.isArray(children) && slotContains(children as VNode[], component))
      return true
    if (node.type === Fragment && Array.isArray(node.children)
      && slotContains(node.children as VNode[], component)) {
      return true
    }
  }
  return false
}

const slotNodes = computed(() => slots.default?.())
const hasDescription = computed(() => slotContains(slotNodes.value, DzFormDescription))
const hasMessage = computed(() => slotContains(slotNodes.value, DzFormMessage))

useFormField({
  error: computed(() => props.error),
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  invalid: computed(() => props.invalid),
  id: computed(() => props.id),
  hasDescription,
  hasMessage,
})

const classes = computed(() =>
  cn('flex flex-col gap-[var(--dz-spacing-2)]', attrs.class as string | undefined),
)
</script>

<template>
  <div
    :class="classes"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="invalid || !!error ? '' : undefined"
    :data-required="required ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    role="group"
  >
    <slot />
  </div>
</template>
