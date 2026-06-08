<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzCopyButtonEmits, DzCopyButtonProps, DzCopyButtonSlots } from './DzCopyButton.types.ts'
/**
 * DzCopyButton — Clipboard copy button with visual feedback.
 *
 * Copies the provided value to the clipboard using the Clipboard API
 * with a textarea fallback. Shows a checkmark icon for 2 seconds
 * after a successful copy.
 *
 * @example
 * ```vue
 * <DzCopyButton value="npm install dzup-ui" />
 * <DzCopyButton value="secret" label="Copy token" copiedLabel="Copied!" />
 * ```
 */
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { copyButtonVariants } from './DzCopyButton.variants.ts'

const props = withDefaults(defineProps<DzCopyButtonProps>(), {
  id: undefined,
  ariaLabel: undefined,
  label: undefined,
  copiedLabel: undefined,
  variant: 'outline',
  tone: 'neutral',
  size: 'sm',
  disabled: false,
})

const emit = defineEmits<DzCopyButtonEmits>()
defineSlots<DzCopyButtonSlots>()

const attrs = useAttrs()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

/** Whether a text label is shown next to the icon (non-square layout) */
const hasLabel = computed(() => Boolean(props.label || props.copiedLabel))

/** Active tone — flips to `success` while showing copied feedback */
const resolvedTone = computed(() => (copied.value ? 'success' : props.tone))

const classes = computed(() =>
  cn(
    // Fill / border / tone come from the shared button taxonomy (ADR-02)
    buttonVariants({
      variant: props.variant,
      size: props.size,
      tone: resolvedTone.value,
    }),
    // Icon-only buttons are square; labelled buttons keep button padding + gap
    hasLabel.value
      ? 'gap-1.5'
      : copyButtonVariants({ size: props.size }),
    attrs.class as string | undefined,
  ),
)

const resolvedAriaLabel = computed(() =>
  props.ariaLabel ?? (copied.value ? 'Copied' : 'Copy to clipboard'),
)

/**
 * Copy the value to the clipboard.
 * Uses navigator.clipboard.writeText with a textarea fallback.
 */
async function handleCopy(): Promise<void> {
  if (props.disabled || copied.value)
    return

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(props.value)
    }
    else {
      fallbackCopy(props.value)
    }

    copied.value = true
    emit('copied', props.value)

    if (resetTimer !== undefined)
      clearTimeout(resetTimer)

    resetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // Fallback if clipboard API rejects (e.g. permissions)
    try {
      fallbackCopy(props.value)
      copied.value = true
      emit('copied', props.value)

      if (resetTimer !== undefined)
        clearTimeout(resetTimer)

      resetTimer = setTimeout(() => {
        copied.value = false
      }, 2000)
    }
    catch {
      // Silently fail — no clipboard access
    }
  }
}

onBeforeUnmount(() => {
  if (resetTimer !== undefined)
    clearTimeout(resetTimer)
})

/** Textarea-based fallback for environments without Clipboard API */
function fallbackCopy(text: string): void {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
</script>


<template>
  <button
    :id="id"
    type="button"
    :class="classes"
    :disabled="disabled || undefined"
    :aria-label="resolvedAriaLabel"
    :data-state="copied ? 'copied' : 'idle'"
    :data-variant="variant"
    :data-tone="resolvedTone"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleCopy"
  >
    <!-- Icon slot -->
    <slot name="icon" :copied="copied">
      <!-- Check icon (shown after copy) -->
      <svg
        v-if="copied"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>

      <!-- Copy icon (default state) -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    </slot>

    <!-- Label -->
    <slot :copied="copied">
      <span v-if="copied && copiedLabel">{{ copiedLabel }}</span>
      <span v-else-if="label">{{ label }}</span>
    </slot>
  </button>
</template>
