<script setup lang="ts">
import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
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
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { buttonVariants } from './DzButton.variants.ts'
import { copyButtonVariants } from './DzCopyButton.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzCopyButtonProps>(), {
  id: undefined,
  ariaLabel: undefined,
  label: undefined,
  copiedLabel: undefined,
  variant: undefined,
  tone: undefined,
  size: undefined,
  disabled: false,
  ui: undefined,
})

const emit = defineEmits<DzCopyButtonEmits>()
defineSlots<DzCopyButtonSlots>()

const attrs = useAttrs()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

/** Whether a text label is shown next to the icon (non-square layout) */
const hasLabel = computed(() => Boolean(props.label || props.copiedLabel))

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal default it carried in `withDefaults` as the last
 * link, so an unprovided tree renders what it always did — note `size` is `sm`
 * here rather than the family's `md`, which is this component's own decision and
 * stays its own.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ButtonVariant>('DzCopyButton', 'variant', [props.variant]) ?? 'outline',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzCopyButton', 'size', [props.size]) ?? 'sm',
)

/**
 * Active tone — flips to `success` while showing copied feedback.
 *
 * The copied state outranks every configured source: it is transient feedback
 * about what just happened, not a style preference, so a host default cannot
 * suppress it.
 */
const resolvedTone = computed<CanonicalTone>(
  () => (copied.value
    ? 'success'
    : resolve<CanonicalTone>('DzCopyButton', 'tone', [props.tone]) ?? 'neutral'),
)

const classes = computed(() =>
  cn(
    // Fill / border / tone come from the shared button taxonomy (ADR-02)
    buttonVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      tone: resolvedTone.value,
    }),
    // Icon-only buttons are square; labelled buttons keep button padding + gap
    hasLabel.value
      ? 'gap-1.5'
      : copyButtonVariants({ size: resolvedSize.value }),
    attrs.class as string | undefined,
    props.ui?.root,
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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <button
    :id="id"
    data-part="root"
    type="button"
    :class="classes"
    :disabled="disabled || undefined"
    :aria-label="resolvedAriaLabel"
    :data-state="copied ? 'copied' : 'idle'"
    :data-variant="resolvedVariant"
    :data-tone="resolvedTone"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-copy-button'), ...$attrs, class: undefined }"
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
