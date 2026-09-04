<script setup lang="ts">
/**
 * DzFloatLabel — floating-label field wrapper.
 *
 * Wraps a single dzup form control (DzInput, DzSelect, DzTextarea,
 * DzNumberInput, ...) and floats a label from a placeholder-like resting
 * position to a caption when the control is focused or filled. The label is
 * associated with the control's `id` (`<label for>`), so it is a real,
 * accessible label — never a purely visual one. The float is a CSS-only
 * transition that respects `prefers-reduced-motion`.
 *
 * @example
 * ```vue
 * <DzFloatLabel label="Email">
 *   <DzInput v-model="email" type="email" />
 * </DzFloatLabel>
 *
 * <DzFloatLabel label="Country" variant="on">
 *   <DzSelect v-model="country" :items="countries" />
 * </DzFloatLabel>
 * ```
 */
import type { DzFloatLabelProps, DzFloatLabelSlots } from './DzFloatLabel.types.ts'
import { computed, onMounted, onUpdated, ref, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { warnRemovedProps } from '../../utilities/warnRemovedProp.ts'
import { floatLabelVariants } from './DzFloatLabel.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzFloatLabelProps>(), {
  label: undefined,
  variant: 'over',
  filled: undefined,
})

const slots = defineSlots<DzFloatLabelSlots>()
const attrs = useAttrs()

// All four ARIA props were declared and never forwarded. A float-label wrapper
// is a generic <div> plus a <label>: it computes no accessible name and ignores
// aria-describedby and aria-invalid. The control it wraps owns all four and
// merges its own error id into aria-describedby — writing them from out here
// would clobber that merge (VERSIONING.md §3, minor).
warnRemovedProps('DzFloatLabel', attrs, {
  ariaLabel: 'A float-label wrapper is not a labelable element — put aria-label on the control it wraps.',
  ariaLabelledby: 'The wrapped control owns its accessible name — put aria-labelledby on the control.',
  ariaDescribedby: 'The description belongs on the control, which merges it with its own error id — put aria-describedby on the control, or use DzFormField.',
  ariaInvalid: 'Validity belongs to the control, not to the element that positions its label — bind `invalid` on the control.',
})

/** Selector for the first focusable form control inside the slot */
const CONTROL_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="combobox"], [role="textbox"], [role="spinbutton"]'

const rootRef = ref<HTMLElement | null>(null)
const autoId = useId()

/** Whether the slotted control currently holds focus */
const focused = ref(false)
/** Auto-detected filled state (native controls); overridden by the `filled` prop */
const autoFilled = ref(false)
/** The id wired between the label's `for` and the slotted control */
const controlId = ref<string | undefined>(props.id)

/** Resolved filled state — explicit prop wins over auto-detection */
const isFilled = computed(() => props.filled ?? autoFilled.value)

/** Label floats when the control is focused or holds a value */
const floated = computed(() => focused.value || isFilled.value)

const styles = computed(() => floatLabelVariants({ variant: props.variant, floated: floated.value }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

const hasLabel = computed(() => slots.label != null || props.label != null)

/** Find the first focusable form control rendered into the default slot. */
function getControl(): HTMLElement | null {
  return rootRef.value?.querySelector<HTMLElement>(CONTROL_SELECTOR) ?? null
}

/**
 * Wire the label to the control's id. Reuse the control's existing id, the
 * `id` prop, or a generated fallback — assigning it onto the control when it
 * has none so the `<label for>` association is always valid.
 */
function syncControlId(): void {
  const el = getControl()
  if (!el)
    return
  const existing = el.id || props.id
  if (existing) {
    controlId.value = existing
    return
  }
  el.id = autoId
  controlId.value = autoId
}

/** Read the filled state from a native control's value. */
function detectFilled(): void {
  const el = getControl()
  if (!el) {
    autoFilled.value = false
    return
  }
  if (
    el instanceof HTMLInputElement
    || el instanceof HTMLTextAreaElement
    || el instanceof HTMLSelectElement
  ) {
    autoFilled.value = el.value != null && el.value !== ''
    return
  }
  // Non-native control (e.g. combobox button): honor an explicit data-filled
  // hint when present; otherwise leave detection to the `filled` prop.
  const hint = el.getAttribute('data-filled')
  if (hint != null)
    autoFilled.value = hint !== 'false'
}

function onFocusin(): void {
  focused.value = true
}

function onFocusout(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  // Keep focused while focus stays within the wrapper.
  if (next && rootRef.value?.contains(next))
    return
  focused.value = false
  // A value may have been entered while focused — re-read on the way out.
  detectFilled()
}

function onValueChange(): void {
  detectFilled()
}

onMounted(() => {
  syncControlId()
  detectFilled()
})

// Re-sync when the slotted control re-renders (e.g. programmatic v-model
// changes that update the value without a DOM input event).
onUpdated(() => {
  syncControlId()
  if (props.filled == null)
    detectFilled()
})

defineExpose({ controlId })
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :data-variant="variant"
    :data-floated="floated ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @focusin="onFocusin"
    @focusout="onFocusout"
    @input="onValueChange"
    @change="onValueChange"
  >
    <slot />
    <label
      v-if="hasLabel"
      :for="controlId"
      :class="styles.label()"
      :data-floated="floated ? '' : undefined"
    >
      <slot name="label">{{ label }}</slot>
    </label>
  </div>
</template>
