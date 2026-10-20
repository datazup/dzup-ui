<script setup lang="ts">
import type {
  DzRadioGroupEmits,
  DzRadioGroupProps,
  DzRadioGroupSlots,
} from './DzRadioGroup.types.ts'
import { RadioGroupRoot } from 'reka-ui'
/**
 * DzRadioGroup -- Radio group using Reka UI RadioGroupRoot (ADR-07).
 *
 * v-model via defineModel<string>() (ADR-16).
 * Wraps Reka UI's RadioGroupRoot with dzup-ui styling.
 *
 * @example
 * ```vue
 * <DzRadioGroup v-model="color" orientation="horizontal">
 *   <DzRadio value="red">Red</DzRadio>
 *   <DzRadio value="green">Green</DzRadio>
 *   <DzRadio value="blue">Blue</DzRadio>
 * </DzRadioGroup>
 * ```
 */
import { computed, nextTick, onBeforeUnmount, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useFormControl } from '../../composables/useFormField/useFormControl.ts'
import { cn } from '../../utilities/cn.ts'

defineOptions({
  inheritAttrs: false,
})

/** Value of the selected radio; the default empty string selects none. */
const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzRadioGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  size: 'md',
  name: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzRadioGroupEmits>()

defineSlots<DzRadioGroupSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()
const {
  fieldContext,
  resolvedId,
  resolvedDisabled,
  resolvedRequired,
  resolvedAriaDescribedby,
} = useFormControl(props)

/**
 * Changes of value seen so far. The arrow-key check below reads it to tell
 * whether Reka has already checked the radio it focused.
 */
let valueChanges = 0

/** Reka UI emits AcceptableValue; we narrow to string for our API */
function handleValueChange(value: unknown): void {
  valueChanges += 1
  const stringValue = String(value ?? '')
  model.value = stringValue
  emit('change', stringValue)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/**
 * An arrow key moves focus **and checks** (APG radio group; UIPRO-FRM-06).
 *
 * Reka moves focus on the next tick and checks the radio it lands on from a
 * `setTimeout(0)` queued by that radio's focus handler — but only while the
 * arrow is still held, which it reads from a window `keyup` listener. A key
 * released before the timer fires (a quick tap, or any scripted press) moved
 * focus and left the selection behind.
 *
 * So this queues one more timer, behind Reka's, and checks the focused radio
 * only if no value change arrived since the key went down: when Reka did check
 * it, nothing happens twice. It answers only the arrows Reka acted on, which
 * Reka marks by preventing their default; an arrow with a modifier held, or in
 * a disabled group, moved nothing and checks nothing. It clicks rather than
 * writing the model, as Reka does, so the radio's own `select` path runs.
 */
const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
let pendingArrowCheck: ReturnType<typeof setTimeout> | undefined

function checkFocusedRadio(root: HTMLElement, changesAtPress: number): void {
  pendingArrowCheck = undefined
  if (!root.isConnected || valueChanges !== changesAtPress)
    return
  const focused = root.ownerDocument.activeElement
  if (!(focused instanceof HTMLElement) || focused.getAttribute('role') !== 'radio')
    return
  if (focused.closest('[role="radiogroup"]') !== root)
    return
  if (focused.getAttribute('aria-checked') === 'true' || focused.hasAttribute('data-disabled'))
    return
  focused.click()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!ARROW_KEYS.has(event.key) || !event.defaultPrevented || resolvedDisabled.value)
    return
  const root = event.currentTarget
  if (!(root instanceof HTMLElement))
    return
  const changesAtPress = valueChanges
  // Registered after Reka's own `nextTick` focus move, so it runs after it,
  // and the timer it queues runs after the one Reka queued from that focus.
  void nextTick(() => {
    clearTimeout(pendingArrowCheck)
    pendingArrowCheck = setTimeout(checkFocusedRadio, 0, root, changesAtPress)
  })
}

onBeforeUnmount(() => clearTimeout(pendingArrowCheck))

const classes = computed(() =>
  cn(
    'flex',
    props.orientation === 'vertical' ? 'flex-col gap-[var(--dz-spacing-2)]' : 'flex-row flex-wrap gap-[var(--dz-spacing-4)]',
    attrs.class as string | undefined,
  ),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <RadioGroupRoot
    :id="resolvedId"
    :dir="dzDirection"
    data-part="root"
    :model-value="model"
    :disabled="resolvedDisabled"
    :name="name"
    :required="resolvedRequired"
    :orientation="orientation"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="resolvedAriaDescribedby"
    :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
    :class="classes"
    :data-state="resolvedDisabled ? 'disabled' : 'ready'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-orientation="orientation"
    class="[contain:layout_style]"
    v-bind="{ ...dzTestId('dz-radio-group'), ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    <slot />
  </RadioGroupRoot>
</template>
