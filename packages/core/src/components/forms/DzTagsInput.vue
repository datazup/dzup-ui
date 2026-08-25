<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import type {
  DzTagsInputEmits,
  DzTagsInputProps,
  DzTagsInputRejectReason,
  DzTagsInputSlots,
} from './DzTagsInput.types.ts'
/**
 * DzTagsInput — free-text token / chips input.
 *
 * Users type arbitrary values; each committed entry becomes a removable chip
 * (rendered with DzChip). Distinct from DzMultiSelect / DzCombobox, which pick
 * from a fixed list. Typing a delimiter (Enter or `,` by default) commits the
 * pending token; Backspace on an empty field removes the last token; pasted
 * text is split on the delimiters. Tokens can be validated per-entry, deduped,
 * and capped via `max` — rejected tokens trigger a brief `danger` flash.
 *
 * v-model:value via defineModel (ADR-16) — an array of string tokens.
 *
 * @example
 * ```vue
 * <DzTagsInput v-model:value="tags" placeholder="Add a tag…" />
 * <DzTagsInput v-model:value="emails" :validate="isEmail" add-on-blur />
 * <DzTagsInput v-model:value="keywords" :max="5" />
 * ```
 */
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, useId } from 'vue'
import { useDualModel } from '../../composables/useDualModel/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzChip from '../data/DzChip.vue'
import { tagsInputVariants } from './DzTagsInput.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/**
 * Both `v-model` and `v-model:value` (renderer contract C1).
 *
 * `v-model:value` keeps working unchanged; `v-model` is the binding every other
 * control in the catalog takes, and until now it silently did nothing here.
 */
const legacyValueModel = defineModel<string[]>('value', { default: () => [] })
const primaryModel = defineModel<string[] | undefined>({ default: undefined })
const props = withDefaults(defineProps<DzTagsInputProps>(), {
  placeholder: undefined,
  max: undefined,
  allowDuplicates: false,
  delimiters: () => ['Enter', ','],
  validate: undefined,
  addOnBlur: false,
  chipVariant: 'subtle',
  chipTone: 'neutral',
  disabled: false,
  readonly: false,
  loading: false,
  size: 'md',
  variant: 'outline',
  tone: undefined,
  name: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTagsInputEmits>()

defineSlots<DzTagsInputSlots>()

const model = useDualModel(primaryModel, legacyValueModel)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Pending (uncommitted) text in the field. */
const draft = ref('')
const inputEl = ref<HTMLInputElement>()
/** Root element — scopes chip lookups for focus management. */
const rootEl = ref<HTMLElement>()
/** Whether the danger flash is currently showing. */
const flashing = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined

// ---------------------------------------------------------------------------
// Resolved field-context state
// ---------------------------------------------------------------------------

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedReadonly = computed(() => props.readonly ?? false)
const resolvedInvalid = computed(() => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false))
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))
const statusId = computed(() => `${resolvedId.value}-status`)

const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  parts.push(statusId.value)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.join(' ')
})

const isInteractive = computed(() => !resolvedDisabled.value && !resolvedReadonly.value)

// ---------------------------------------------------------------------------
// Delimiters: split keys (Enter/Tab) from inline separator characters
// ---------------------------------------------------------------------------

/** Single-character separators (everything except named keys like Enter/Tab). */
const charDelimiters = computed(() => props.delimiters.filter(d => d.length === 1))

/** Build a RegExp that splits pasted text on any char delimiter or newline. */
const splitPattern = computed(() => {
  const chars = charDelimiters.value.map(escapeRegExp)
  // Always split on newlines so multi-line pastes become separate tokens.
  const parts = [...new Set([...chars, '\\n', '\\r'])]
  return new RegExp(`[${parts.join('')}]`)
})

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------------
// Chip sizing — map the field size down to a comfortable chip size
// ---------------------------------------------------------------------------

const chipSize = computed<CanonicalSize>(() => {
  const map: Partial<Record<CanonicalSize, CanonicalSize>> = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'sm',
    xl: 'md',
  }
  return map[props.size ?? 'md'] ?? 'sm'
})

// ---------------------------------------------------------------------------
// Status announcement (a11y)
// ---------------------------------------------------------------------------

const tokenCount = computed(() => model.value.length)
const statusText = computed(() => {
  const n = tokenCount.value
  const limit = props.max ? ` of ${props.max}` : ''
  return `${n} ${n === 1 ? 'tag' : 'tags'}${limit}`
})

// ---------------------------------------------------------------------------
// Commit / remove
// ---------------------------------------------------------------------------

function flashInvalid(token: string, reason: DzTagsInputRejectReason): void {
  emit('invalid', token, reason)
  flashing.value = true
  if (flashTimer)
    clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashing.value = false
  }, 600)
}

/**
 * Attempt to commit a single token. Returns true when added.
 * Order of checks: trim/empty → max → duplicate → validate.
 */
function addToken(raw: string): boolean {
  if (!isInteractive.value)
    return false
  const token = raw.trim()
  if (!token)
    return false

  if (props.max !== undefined && model.value.length >= props.max) {
    flashInvalid(token, 'max')
    return false
  }
  if (!props.allowDuplicates && model.value.includes(token)) {
    flashInvalid(token, 'duplicate')
    return false
  }
  if (props.validate && !props.validate(token)) {
    flashInvalid(token, 'invalid')
    return false
  }

  model.value = [...model.value, token]
  emit('add', token)
  return true
}

/** Commit the current draft (used by delimiter keys and addOnBlur). */
function commitDraft(): void {
  if (addToken(draft.value))
    draft.value = ''
}

function removeAt(index: number): void {
  if (!isInteractive.value)
    return
  const token = model.value[index]
  if (token === undefined)
    return
  model.value = model.value.filter((_, i) => i !== index)
  emit('remove', token, index)
}

/** Remove a token then restore focus to a sensible neighbour. */
function removeAndRefocus(index: number): void {
  removeAt(index)
  void nextTick(() => {
    const chips = rootEl.value?.querySelectorAll<HTMLElement>('[data-dz-tag]')
    const next = chips?.[index] ?? chips?.[index - 1]
    if (next)
      next.focus()
    else
      inputEl.value?.focus()
  })
}

// ---------------------------------------------------------------------------
// Input event handling
// ---------------------------------------------------------------------------

function onKeydown(event: KeyboardEvent): void {
  // Named-key delimiters (Enter, Tab, …) commit the draft.
  if (props.delimiters.includes(event.key) && event.key.length > 1) {
    if (draft.value.trim()) {
      event.preventDefault()
      commitDraft()
    }
    return
  }
  // Single-character delimiters (',', ';', …) commit before the char is typed.
  if (event.key.length === 1 && charDelimiters.value.includes(event.key)) {
    event.preventDefault()
    commitDraft()
    return
  }
  // Backspace on an empty field removes the last token.
  if (event.key === 'Backspace' && draft.value === '' && model.value.length > 0) {
    event.preventDefault()
    removeAt(model.value.length - 1)
  }
}

function onPaste(event: ClipboardEvent): void {
  const text = event.clipboardData?.getData('text') ?? ''
  if (!text)
    return
  const pieces = text.split(splitPattern.value)
  // Only intercept when the paste actually contains a delimiter; otherwise
  // let the browser drop the raw text into the draft normally.
  if (pieces.length <= 1)
    return
  event.preventDefault()
  for (const piece of pieces)
    addToken(piece)
  draft.value = ''
}

function onBlur(event: FocusEvent): void {
  if (props.addOnBlur)
    commitDraft()
  emit('blur', event)
}

function onFocus(event: FocusEvent): void {
  emit('focus', event)
}

/** Clicking the field shell focuses the text input (ignore chip clicks). */
function onFieldMousedown(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target === inputEl.value)
    return
  if (target.closest('[data-dz-tag]'))
    return
  event.preventDefault()
  inputEl.value?.focus()
}

onBeforeUnmount(() => {
  if (flashTimer)
    clearTimeout(flashTimer)
})

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() =>
  tagsInputVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
    flash: flashing.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <div
    ref="rootEl"
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading || undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div
      :class="styles.field()"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-state="resolvedDisabled ? 'disabled' : undefined"
      role="group"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      @mousedown="onFieldMousedown"
    >
      <!-- Committed tokens -->
      <template v-for="(tag, index) in model" :key="`${tag}-${index}`">
        <slot
          name="tag"
          :tag="tag"
          :index="index"
          :remove="() => removeAndRefocus(index)"
        >
          <DzChip
            data-dz-tag
            :variant="chipVariant"
            :tone="chipTone"
            :size="chipSize"
            :closable="isInteractive"
            :disabled="resolvedDisabled"
            :aria-label="tag"
            @close="removeAndRefocus(index)"
          >
            {{ tag }}
          </DzChip>
        </slot>
      </template>

      <!-- Text field -->
      <input
        :id="resolvedId"
        ref="inputEl"
        v-model="draft"
        type="text"
        :class="styles.input()"
        :placeholder="placeholder"
        :disabled="resolvedDisabled"
        :readonly="resolvedReadonly"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :aria-required="resolvedRequired || undefined"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        @keydown="onKeydown"
        @paste="onPaste"
        @focus="onFocus"
        @blur="onBlur"
      >
    </div>

    <!-- Visually-hidden live status announcing the token count -->
    <span :id="statusId" class="sr-only" aria-live="polite">{{ statusText }}</span>

    <!-- Hidden form inputs for native form submission -->
    <template v-if="name">
      <input
        v-for="(tag, index) in model"
        :key="`hidden-${index}`"
        type="hidden"
        :name="name"
        :value="tag"
      >
    </template>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      :class="styles.error()"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
