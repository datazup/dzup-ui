<script setup lang="ts">
import type { MaskResult } from './DzInputMask.engine.ts'
import type { DzInputMaskEmits, DzInputMaskProps, DzInputMaskSlots } from './DzInputMask.types.ts'
/**
 * DzInputMask — format-masked text input.
 *
 * Guides and constrains typing for structured fields (phone, date, credit card,
 * license keys) using a mask alphabet of `9` (digit), `a` (letter), and `*`
 * (alphanumeric); every other character is a literal. Stays a native `<input>`
 * so screen readers and form autofill keep working (TASK-NF-25).
 *
 * v-model holds the displayed (masked) value; `update:unmasked` emits the value
 * with literals and slot characters stripped.
 *
 * @example
 * ```vue
 * <DzInputMask v-model="phone" mask="(999) 999-9999" @update:unmasked="raw = $event" />
 * ```
 */
import { computed, inject, onMounted, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_INPUT_GROUP_KEY } from './DzInputGroup.types.ts'
import { applyMask, backspaceValue, forwardDeleteValue } from './DzInputMask.engine.ts'
import { maskElementVariants, maskWrapperVariants } from './DzInputMask.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzInputMaskProps>(), {
  variant: 'outline',
  size: undefined,
  tone: undefined,
  slotChar: '_',
  autoClear: false,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
})

const emit = defineEmits<DzInputMaskEmits>()
defineSlots<DzInputMaskSlots>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()

/** Optional DzInputGroup context (ADR-08) — present only when grouped */
const groupContext = inject(DZ_INPUT_GROUP_KEY, null)

/** Optional DzFormField context (ADR-08) — present only when inside a field */
const fieldContext = useFormFieldContext()

/** Whether this input is nested inside a DzInputGroup shell */
const isGrouped = computed(() => groupContext !== null)

/** Resolved size: own prop wins, then group context, then default */
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')

/** Resolved disabled: own prop OR group-level OR form-field-level disabled */
const resolvedDisabled = computed(
  () => props.disabled || (groupContext?.disabled.value ?? false) || (fieldContext?.isDisabled.value ?? false),
)

/** Resolved required: own prop OR form-field-level required */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

/** Resolved element ID — explicit prop wins, then the field context's control ID */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Whether the invalid state should show (own prop/error OR form-field-level) */
const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/** Wrapper classes merged with consumer class via cn() (ADR-10) */
const wrapperClasses = computed(() =>
  cn(
    maskWrapperVariants({
      variant: props.variant,
      size: resolvedSize.value,
      tone: props.tone ?? 'neutral',
      invalid: isInvalid.value,
      seamless: isGrouped.value,
    }),
    attrs.class as string | undefined,
  ),
)

/** Inner input element classes */
const inputClasses = computed(() => maskElementVariants())

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
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

// ── Mask state ──

/** The unmasked value (literals + slot chars stripped) */
const unmasked = ref('')
/** Whether every token position is filled */
const completed = ref(false)
/** Last masked value we wrote to the model — guards the external-change watcher */
const lastMasked = ref('')

/**
 * Commit a mask result to model + derived state and, when an element is given,
 * synchronously to the DOM value and caret. Synchronous DOM writes guarantee
 * rejected characters never linger even when `model` is unchanged.
 */
function commit(res: MaskResult, el?: HTMLInputElement | null): void {
  lastMasked.value = res.masked
  model.value = res.masked

  if (unmasked.value !== res.unmasked) {
    unmasked.value = res.unmasked
    emit('update:unmasked', res.unmasked)
  }

  const justCompleted = res.completed && !completed.value
  completed.value = res.completed
  if (justCompleted)
    emit('complete', res.unmasked)

  if (el) {
    el.value = res.masked
    el.setSelectionRange(res.caret, res.caret)
  }
}

function handleInput(event: Event): void {
  const el = event.target as HTMLInputElement
  const res = applyMask(el.value, props.mask, props.slotChar, el.selectionStart ?? undefined)
  commit(res, el)
}

function handleKeydown(event: KeyboardEvent): void {
  const el = inputRef.value
  if (!el)
    return
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  // Only handle collapsed selections; ranged deletes fall through to @input.
  if (start !== end)
    return

  if (event.key === 'Backspace') {
    const res = backspaceValue(el.value, props.mask, props.slotChar, start)
    if (res) {
      event.preventDefault()
      commit(res, el)
    }
  }
  else if (event.key === 'Delete') {
    const res = forwardDeleteValue(el.value, props.mask, props.slotChar, start)
    if (res) {
      event.preventDefault()
      commit(res, el)
    }
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  if (props.autoClear && !completed.value && unmasked.value.length > 0)
    commit({ masked: '', unmasked: '', completed: false, caret: 0 }, inputRef.value)
  emit('blur', event)
}

// Normalize externally-set model values (controlled usage / programmatic set).
watch(model, (val) => {
  if (val === lastMasked.value)
    return
  const res = applyMask(val ?? '', props.mask, props.slotChar)
  commit(res)
})

onMounted(() => {
  if (model.value) {
    const res = applyMask(model.value, props.mask, props.slotChar)
    commit(res, inputRef.value)
  }
})

/** Expose the native input ref + validation state for consumers */
defineExpose({ inputRef, completed, unmasked })
</script>

<template>
  <div
    :data-state="resolvedDisabled ? 'disabled' : loading ? 'loading' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-completed="completed ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :data-disabled="resolvedDisabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Input wrapper with variant styling -->
    <div :class="wrapperClasses">
      <!-- Prefix slot -->
      <span
        v-if="$slots.prefix"
        class="flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]"
      >
        <slot name="prefix" />
      </span>

      <!-- Native input element -->
      <input
        :id="resolvedId"
        ref="inputRef"
        type="text"
        :class="inputClasses"
        :value="model"
        :name="name"
        :placeholder="placeholder"
        :disabled="resolvedDisabled"
        :readonly="readonly || loading"
        :required="resolvedRequired"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="isInvalid || undefined"
        :aria-required="resolvedRequired || undefined"
        :aria-busy="loading || undefined"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <!-- Suffix slot -->
      <span
        v-if="$slots.suffix"
        class="flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]"
      >
        <slot name="suffix" />
      </span>
    </div>

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
