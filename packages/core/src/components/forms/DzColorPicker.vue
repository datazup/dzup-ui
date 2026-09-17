<!-- token-check-allow-raw-values: hex/rgb parsing and swatch fills are this component's subject
     matter. Narrow by design — its own chrome is still held to the palette-class rules. -->
<script setup lang="ts">
import type { DzColorPickerEmits, DzColorPickerProps, DzColorPickerSlots } from './DzColorPicker.types.ts'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
/**
 * DzColorPicker — Color selection component with popover panel.
 *
 * Built from scratch. Uses DzPopover internally for the picker panel.
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzColorPicker v-model="color" :presets="['#ef4444','#3b82f6','#22c55e']" show-input />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useDzPortalTarget, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { colorPickerVariants } from './DzColorPicker.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** The selected colour as a CSS colour string (hex or `rgb()`); the default empty string selects none. */
const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzColorPickerProps>(), {
  presets: () => [],
  showInput: true,
  disabled: false,
  size: 'md',
  invalid: false,
  error: undefined,
  required: false,
  name: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  canvasHeight: 120,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzColorPickerEmits>()
defineSlots<DzColorPickerSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzColorPicker')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

const attrs = useAttrs()
const fieldContext = useFormFieldContext()
const autoId = useId()
const popoverOpen = ref(false)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
)

/**
 * Own prop, then the DzFormField context, then a generated id — it skipped
 * the middle step, so a DzFormLabel's `for` named an id this control never
 * used (renderer contract C2).
 */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

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

const styles = computed(() =>
  colorPickerVariants({
    size: props.size,
    invalid: isInvalid.value || undefined,
    disabled: resolvedDisabled.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Handle direct text input change */
function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value
  if (/^#[0-9a-f]{6}$/i.test(value) || /^#[0-9a-f]{3}$/i.test(value)) {
    model.value = value
    emit('change', value)
  }
}

/** Handle native color input change */
function handleNativeColorChange(event: Event): void {
  const target = event.target as HTMLInputElement
  model.value = target.value
  emit('change', target.value)
}

/** Handle preset swatch click */
function handlePresetClick(color: string): void {
  model.value = color
  emit('change', color)
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
  <div
    data-part="root"
    :class="[rootClasses, ui?.root]"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-color-picker'), ...$attrs, class: undefined }"
  >
    <PopoverRoot v-model:open="popoverOpen">
      <!-- Trigger button -->
      <PopoverTrigger
        as-child
        :disabled="resolvedDisabled"
      >
        <button
          :id="resolvedId"
          type="button"
          data-part="trigger"
          :class="[styles.trigger(), ui?.trigger]"
          :aria-label="resolvedAriaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (isInvalid || undefined)"
          :aria-required="resolvedRequired || undefined"
          :aria-expanded="popoverOpen"
          :disabled="resolvedDisabled || undefined"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <slot>
            <span
              data-part="indicator"
              :class="[styles.swatch(), ui?.indicator]"
              :style="{ backgroundColor: model }"
              aria-hidden="true"
            />
            <span data-part="label" :class="[styles.valueText(), ui?.label]">{{ model }}</span>
          </slot>
        </button>
      </PopoverTrigger>

      <!-- Popover panel -->
      <PopoverPortal
        :to="resolvedPortalTo"
        :disabled="portalDisabled"
        :defer="portalDefer"
      >
        <PopoverContent
          data-part="content"
          :side-offset="4"
          class="z-50 w-64 rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] bg-[var(--dz-background)] shadow-[var(--dz-shadow-lg)]"
          :class="[ui?.content]"
        >
          <div data-part="panel" :class="[styles.panel(), ui?.panel]">
            <!-- Native color input as main picker -->
            <div :class="styles.colorArea()" :style="{ height: `${props.canvasHeight}px` }">
              <input
                type="color"
                data-part="input"
                :value="model"
                class="h-full w-full cursor-crosshair border-0 p-0"
                :class="[ui?.input]"
                style="appearance: none; -webkit-appearance: none; border: none; background: none;"
                :aria-label="dzMessages.colorArea"
                @input="handleNativeColorChange"
              >
            </div>

            <!-- Hex input -->
            <div v-if="showInput" class="flex items-center gap-[var(--dz-spacing-2)]">
              <span
                data-part="indicator"
                :class="[styles.swatch(), ui?.indicator]"
                :style="{ backgroundColor: model }"
                aria-hidden="true"
              />
              <input
                type="text"
                data-part="input"
                :class="[styles.input(), ui?.input]"
                :value="model"
                maxlength="7"
                placeholder="#000000"
                :aria-label="dzMessages.hexValue"
                @change="handleInputChange"
              >
            </div>

            <!-- Preset swatches -->
            <div v-if="presets.length > 0" data-part="group" :class="[styles.presetGrid(), ui?.group]">
              <button
                v-for="color in presets"
                :key="color"
                type="button"
                data-part="item"
                :class="[styles.presetSwatch(), ui?.item]"
                :style="{ backgroundColor: color }"
                :aria-label="`Select color ${color}`"
                @click="handlePresetClick(color)"
              />
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <!-- Hidden form input for native form submission -->
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="model"
    >

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      data-part="error"
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      :class="[ui?.error]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
