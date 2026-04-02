<script setup lang="ts">
import type { DzTextareaEmits, DzTextareaProps } from './DzTextarea.types.ts'
/**
 * DzTextarea — Multiline text input with optional auto-resize.
 *
 * Supports three variants (outline, filled, underlined), five sizes,
 * and auto-height adjustment based on content.
 *
 * @example
 * ```vue
 * <DzTextarea v-model="description" placeholder="Enter description" />
 * <DzTextarea v-model="bio" autoResize :maxRows="10" />
 * ```
 */
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { textareaVariants } from './DzTextarea.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTextareaProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  rows: 3,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
  autoResize: false,
  maxRows: undefined,
})

const emit = defineEmits<DzTextareaEmits>()

const attrs = useAttrs()
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const autoId = useId()

/** Resolved element ID */
const resolvedId = computed(() => props.id ?? autoId)

/** Whether the invalid state should show (prop or error message) */
const isInvalid = computed(() => props.invalid || !!props.error)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    textareaVariants({
      variant: props.variant,
      size: props.size,
      invalid: isInvalid.value,
    }),
    props.autoResize ? 'resize-none overflow-hidden' : '',
    attrs.class as string | undefined,
  ),
)

/** ID for the error message element */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

/** Auto-resize logic: adjust height to fit content */
function adjustHeight(): void {
  const el = textareaRef.value
  if (!el || !props.autoResize)
    return

  // Reset to auto to get accurate scrollHeight
  el.style.height = 'auto'

  let targetHeight = el.scrollHeight

  // Clamp to maxRows if specified
  if (props.maxRows !== undefined) {
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 20
    const maxHeight = lineHeight * props.maxRows
    targetHeight = Math.min(targetHeight, maxHeight)

    // Enable scrolling if content exceeds maxRows
    el.style.overflowY = targetHeight >= maxHeight ? 'auto' : 'hidden'
  }

  el.style.height = `${targetHeight}px`
}

// Watch for model changes to auto-resize
watch(model, () => {
  if (props.autoResize) {
    void nextTick(adjustHeight)
  }
})

onMounted(() => {
  if (props.autoResize) {
    adjustHeight()
  }
})

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/** Expose the native textarea ref for programmatic focus */
defineExpose({ textareaRef })
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :data-state="disabled ? 'disabled' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
  >
    <textarea
      :id="resolvedId"
      ref="textareaRef"
      v-model="model"
      :class="classes"
      :name="name"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="isInvalid || undefined"
      :aria-required="required || undefined"
      v-bind="{ ...$attrs, class: undefined }"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="adjustHeight"
    />

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
