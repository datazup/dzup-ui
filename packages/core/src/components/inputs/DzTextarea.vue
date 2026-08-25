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
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzSpinner from '../feedback/DzSpinner.vue'
import { textareaVariants } from './DzTextarea.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  loadingLabel: undefined,
})

const emit = defineEmits<DzTextareaEmits>()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzTextarea')
const resolvedLoadingLabel = computed(() => props.loadingLabel ?? dzMessages.value.loading)

const attrs = useAttrs()
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const autoId = useId()

/** Optional DzFormField context (ADR-08) — present only when inside a field */
const fieldContext = useFormFieldContext()

/** Resolved element ID — explicit prop wins, then the field context's control ID */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Resolved disabled: own prop OR form-field-level disabled */
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))

/** Resolved required: own prop OR form-field-level required */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

/** Whether the invalid state should show (own prop/error OR form-field-level) */
const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    textareaVariants({
      variant: props.variant,
      size: props.size,
      invalid: isInvalid.value,
    }),
    // Auto-resize drives height inline; drop the 80px min-height floor so the
    // computed height (incl. maxRows clamp) is honoured, and disable manual
    // resizing/scrollbars.
    props.autoResize ? 'resize-none overflow-hidden min-h-0' : '',
    attrs.class as string | undefined,
  ),
)

/**
 * Spinner size mapped down from the field size so the indicator stays
 * proportionate (mirrors DzInput).
 */
const spinnerSize = computed(() => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'xs' as const
    case 'xl':
      return 'md' as const
    default:
      return 'sm' as const
  }
})

/** ID for the error message element */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

/** Auto-resize logic: adjust height to fit content */
function adjustHeight(): void {
  const el = textareaRef.value
  if (!el || !props.autoResize)
    return

  const style = getComputedStyle(el)

  // `scrollHeight` measures content + vertical padding. The element uses
  // border-box (Tailwind default), so the inline `height` must also include
  // the borders to render the same number of rows.
  const borderY
    = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)

  // Reset to auto to get an accurate scrollHeight for the current content.
  el.style.height = 'auto'

  let targetHeight = el.scrollHeight + borderY

  // Clamp to maxRows if specified.
  if (props.maxRows !== undefined) {
    // `line-height: normal` is not a length — fall back to a ~1.2 ratio of
    // the font size rather than a hardcoded pixel value.
    let lineHeight = Number.parseFloat(style.lineHeight)
    if (Number.isNaN(lineHeight))
      lineHeight = Number.parseFloat(style.fontSize) * 1.2

    const paddingY
      = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
    const maxHeight = lineHeight * props.maxRows + paddingY + borderY

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight
      el.style.overflowY = 'auto'
    }
    else {
      el.style.overflowY = 'hidden'
    }
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

<template>
  <div
    :data-state="resolvedDisabled ? 'disabled' : loading ? 'loading' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    class="relative"
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
      :disabled="resolvedDisabled"
      :readonly="readonly || loading"
      :required="resolvedRequired"
      :maxlength="maxlength"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="isInvalid || undefined"
      :aria-required="resolvedRequired || undefined"
      :aria-busy="loading || undefined"
      v-bind="{ ...$attrs, class: undefined }"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="adjustHeight"
    />

    <!-- Loading spinner -->
    <DzSpinner
      v-if="loading"
      class="absolute right-[var(--dz-spacing-2)] top-[var(--dz-spacing-2)]"
      :size="spinnerSize"
      :tone="tone ?? 'neutral'"
      :label="resolvedLoadingLabel"
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
