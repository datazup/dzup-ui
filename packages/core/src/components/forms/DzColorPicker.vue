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
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { colorPickerVariants } from './DzColorPicker.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  ariaLabel: 'Choose a color',
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  canvasHeight: 120,
})

const emit = defineEmits<DzColorPickerEmits>()
defineSlots<DzColorPickerSlots>()

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

const resolvedId = computed(() => props.id ?? autoId)

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
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
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
          :class="styles.trigger()"
          :aria-label="ariaLabel"
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
              :class="styles.swatch()"
              :style="{ backgroundColor: model }"
              aria-hidden="true"
            />
            <span :class="styles.valueText()">{{ model }}</span>
          </slot>
        </button>
      </PopoverTrigger>

      <!-- Popover panel -->
      <PopoverPortal>
        <PopoverContent
          :side-offset="4"
          class="z-50 w-64 rounded-[var(--dz-radius-lg)] border border-[var(--dz-border)] bg-[var(--dz-background)] shadow-[var(--dz-shadow-lg)]"
        >
          <div :class="styles.panel()">
            <!-- Native color input as main picker -->
            <div :class="styles.colorArea()" :style="{ height: `${props.canvasHeight}px` }">
              <input
                type="color"
                :value="model"
                class="h-full w-full cursor-crosshair border-0 p-0"
                style="appearance: none; -webkit-appearance: none; border: none; background: none;"
                aria-label="Color area"
                @input="handleNativeColorChange"
              >
            </div>

            <!-- Hex input -->
            <div v-if="showInput" class="flex items-center gap-[var(--dz-spacing-2)]">
              <span
                :class="styles.swatch()"
                :style="{ backgroundColor: model }"
                aria-hidden="true"
              />
              <input
                type="text"
                :class="styles.input()"
                :value="model"
                maxlength="7"
                placeholder="#000000"
                aria-label="Hex color value"
                @change="handleInputChange"
              >
            </div>

            <!-- Preset swatches -->
            <div v-if="presets.length > 0" :class="styles.presetGrid()">
              <button
                v-for="color in presets"
                :key="color"
                type="button"
                :class="styles.presetSwatch()"
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
      class="text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
