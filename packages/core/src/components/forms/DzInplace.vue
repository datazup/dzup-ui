<script setup lang="ts" generic="T = unknown">
/**
 * DzInplace — display→edit toggle wrapper.
 *
 * Renders a read-only `#display` view as a button; on activation it swaps to an
 * `#edit` view (or a built-in DzInput when no `#edit` slot is supplied). Esc
 * cancels and restores the prior value; Enter and/or blur commit per `saveOn`.
 * Focus moves into the editor on open and returns to the trigger on close.
 *
 * @example
 * ```vue
 * <DzInplace v-model:value="name" aria-label="Edit name" />
 *
 * <DzInplace v-model:value="title" v-model:active="open" save-on="enter">
 *   <template #display="{ value }">{{ value || 'Empty' }}</template>
 *   <template #edit="{ value, setValue }">
 *     <DzInput :model-value="value" @update:model-value="setValue" />
 *   </template>
 * </DzInplace>
 * ```
 */
import type { DzInplaceEmits, DzInplaceProps, DzInplaceSlots } from './DzInplace.types.ts'
import { computed, nextTick, ref, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzInput from '../inputs/DzInput.vue'
import { inplaceVariants } from './DzInplace.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzInplaceProps>(), {
  saveOn: 'both',
  disabled: false,
  size: 'md',
  placeholder: undefined,
})

const emit = defineEmits<DzInplaceEmits<T>>()
const slots = defineSlots<DzInplaceSlots<T>>()

/** Open state — `v-model:active` (ADR-16) */
const active = defineModel<boolean>('active', { default: false })
/** Edited value — `v-model:value` passthrough (ADR-16) */
const value = defineModel<T>('value')

const attrs = useAttrs()

const triggerRef = ref<HTMLButtonElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const builtinRef = ref<InstanceType<typeof DzInput> | null>(null)

/** Snapshot of the value at open time, restored on cancel */
let priorValue: T | undefined

const commitOnEnter = computed(() => props.saveOn === 'enter' || props.saveOn === 'both')
const commitOnBlur = computed(() => props.saveOn === 'blur' || props.saveOn === 'both')

const styles = computed(() => inplaceVariants({ disabled: props.disabled }))

const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

/** Writable string proxy for the built-in DzInput (string-only editor) */
const stringValue = computed<string>({
  get: () => (value.value == null ? '' : String(value.value)),
  set: (v) => {
    value.value = v as T
  },
})

/** Focus the editor's first focusable element (or the built-in input). */
function focusEditor(): void {
  const builtinInput = builtinRef.value?.inputRef
  if (builtinInput) {
    builtinInput.focus()
    builtinInput.select?.()
    return
  }
  const root = editorRef.value
  const focusable = root?.querySelector<HTMLElement>(
    'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"]), [contenteditable]',
  )
  focusable?.focus()
}

/** Return focus to the display trigger. */
function focusTrigger(): void {
  triggerRef.value?.focus()
}

/** Open the editor (display → edit). No-op when disabled or already open. */
function activate(): void {
  if (props.disabled || active.value)
    return
  active.value = true
  emit('open')
}

/** Commit the current value and close. */
function save(): void {
  if (!active.value)
    return
  active.value = false
  emit('save', value.value as T)
  nextTick(focusTrigger)
}

/** Restore the prior value and close. */
function cancel(): void {
  if (!active.value)
    return
  value.value = priorValue as T
  active.value = false
  emit('cancel')
  nextTick(focusTrigger)
}

/** Update the model value without committing (exposed to the `#edit` slot). */
function setValue(next: T): void {
  value.value = next
}

// Snapshot the value and move focus into the editor whenever it opens — covers
// both internal activation and external `v-model:active` control.
watch(active, (open, was) => {
  if (open && !was) {
    priorValue = value.value
    nextTick(focusEditor)
  }
})

function onEditorKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
  else if (event.key === 'Enter' && commitOnEnter.value) {
    // Allow Shift+Enter for newlines in a multiline editor; plain Enter commits.
    if (event.shiftKey)
      return
    event.preventDefault()
    save()
  }
}

function onEditorFocusout(event: FocusEvent): void {
  if (!commitOnBlur.value)
    return
  // Ignore focus moves that stay inside the editor.
  const next = event.relatedTarget as Node | null
  if (next && editorRef.value?.contains(next))
    return
  save()
}

/** Programmatic control for consumers (e.g. table cells). */
defineExpose({ activate, save, cancel })
</script>

<template>
  <div
    :class="rootClasses"
    :data-state="active ? 'edit' : 'display'"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Editor view -->
    <div
      v-if="active"
      ref="editorRef"
      :class="styles.editor()"
      @keydown="onEditorKeydown"
      @focusout="onEditorFocusout"
    >
      <slot
        name="edit"
        :value="(value as T)"
        :set-value="setValue"
        :save="save"
        :cancel="cancel"
      >
        <!-- Built-in editor when no #edit slot is supplied -->
        <DzInput
          ref="builtinRef"
          v-model="stringValue"
          :size="size"
          :placeholder="placeholder"
          :aria-label="ariaLabel"
        />
      </slot>
    </div>

    <!-- Display view (activation trigger) -->
    <button
      v-else
      ref="triggerRef"
      type="button"
      class="group"
      :class="styles.display()"
      :disabled="disabled || undefined"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      @click="activate"
    >
      <slot name="display" :value="(value as T)" :activate="activate">
        {{ stringValue }}
      </slot>
      <svg
        v-if="!disabled"
        :class="styles.hint()"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  </div>
</template>
