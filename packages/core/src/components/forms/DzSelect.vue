<script setup lang="ts">
import type { DzSelectEmits, DzSelectProps, DzSelectSlots } from './DzSelect.types.ts'
import { Check, ChevronDown } from 'lucide-vue-next'
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
/**
 * DzSelect -- Select dropdown using Reka UI (ADR-07).
 *
 * W1 simplified version: string-based items only.
 * Generic version planned for W2.
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzSelect
 *   v-model="selected"
 *   :items="[
 *     { label: 'Apple', value: 'apple' },
 *     { label: 'Banana', value: 'banana' },
 *   ]"
 *   placeholder="Pick a fruit"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { selectVariants } from './DzSelect.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzSelectProps>(), {
  placeholder: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
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

const emit = defineEmits<DzSelectEmits>()
defineSlots<DzSelectSlots>()

const attrs = useAttrs()
const fieldContext = useFormFieldContext()

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  selectVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

function handleValueChange(value: string): void {
  model.value = value
  emit('change', value)
  emit('select', value)
}

function handleOpenChange(open: boolean): void {
  if (open) {
    emit('open')
  }
  else {
    emit('close')
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

const triggerClasses = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <SelectRoot
    :model-value="model"
    :disabled="resolvedDisabled"
    :name="name"
    :required="required || fieldContext?.isRequired.value"
    @update:model-value="handleValueChange"
    @update:open="handleOpenChange"
  >
    <SelectTrigger
      :id="id ?? fieldContext?.fieldId"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      :class="triggerClasses"
      :data-tone="undefined"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <SelectValue :placeholder="placeholder" />
      <SelectIcon as-child>
        <ChevronDown :class="styles.icon()" aria-hidden="true" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent :class="styles.content()" position="popper" :side-offset="4">
        <SelectViewport :class="styles.viewport()">
          <template v-if="items.length > 0">
            <SelectItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
              :disabled="item.disabled"
              :class="styles.item()"
            >
              <SelectItemIndicator class="absolute left-1 flex items-center justify-center">
                <Check :class="styles.checkIcon()" aria-hidden="true" />
              </SelectItemIndicator>
              <SelectItemText class="pl-6">
                {{ item.label }}
              </SelectItemText>
            </SelectItem>
          </template>
          <div
            v-else
            class="px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)] text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]"
          >
            <slot name="empty">
              No options available
            </slot>
          </div>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
