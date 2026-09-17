<script setup lang="ts">
import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type {
  DzToggleButtonEmits,
  DzToggleButtonProps,
  DzToggleButtonSlots,
} from './DzToggleButton.types.ts'
/**
 * DzToggleButton — Toggleable button with pressed state.
 *
 * Uses v-model via defineModel<boolean>() (ADR-16) to track pressed state.
 * Supports aria-pressed for accessibility.
 *
 * @example
 * ```vue
 * <DzToggleButton v-model="isBold">
 *   <BoldIcon />
 *   Bold
 * </DzToggleButton>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { toggleButtonVariants } from './DzToggleButton.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Whether the button is pressed; `false` renders it unpressed. */
const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzToggleButtonProps>(), {
  variant: undefined,
  size: undefined,
  tone: undefined,
  disabled: false,
  ui: undefined,
})

const emit = defineEmits<DzToggleButtonEmits>()
defineSlots<DzToggleButtonSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * `variant` and `size` gain the provider as a fallback behind the prop and keep
 * the literal default they carried in `withDefaults`, so a tree with no
 * `DzProvider` renders exactly what it rendered before.
 *
 * `tone` deliberately gets **no** literal fallback. It had none before, and
 * `data-tone` is bound to it — giving it one would start emitting an attribute
 * on every toggle button that never carried one, which is a rendered-output
 * change rather than an adoption.
 */
const { resolve } = useDzDefaults()

/** Resolved variant: prop, then provider, then default */
const resolvedVariant = computed(
  () => resolve<ButtonVariant>('DzToggleButton', 'variant', [props.variant]) ?? 'outline',
)

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzToggleButton', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider — undefined when neither states one */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzToggleButton', 'tone', [props.tone]),
)

const classes = computed(() =>
  cn(
    toggleButtonVariants({
      variant: resolvedVariant.value,
      size: resolvedSize.value,
      pressed: model.value,
    }),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

function handleClick(): void {
  if (props.disabled)
    return
  model.value = !model.value
  emit('change', model.value)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
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
    :aria-pressed="model"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : model ? 'pressed' : 'idle'"
    :data-tone="resolvedTone"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-toggle-button'), ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </button>
</template>
