<script setup lang="ts">
import type {
  DzMultiSelectEmits,
  DzMultiSelectProps,
  DzMultiSelectSlots,
} from './DzMultiSelect.types.ts'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxViewport,
} from 'reka-ui'
/**
 * DzMultiSelect -- Multi-value select using Reka UI Combobox (ADR-07).
 *
 * Uses ComboboxRoot in multiple mode with searchable input.
 * v-model via defineModel<string[]>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzMultiSelect
 *   v-model="selected"
 *   :items="items"
 *   placeholder="Select items"
 *   :max-selections="3"
 * />
 * ```
 */
import { computed, ref, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { multiSelectVariants } from './DzMultiSelect.variants.ts'

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzMultiSelectProps>(), {
  placeholder: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  maxSelections: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzMultiSelectEmits>()
defineSlots<DzMultiSelectSlots>()

const attrs = useAttrs()
const fieldContext = useFormFieldContext()
const searchQuery = ref('')

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  multiSelectVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

/** Whether max selections has been reached */
const isMaxReached = computed(() =>
  props.maxSelections !== undefined && model.value.length >= props.maxSelections,
)

/** Filtered items based on search query */
const filteredItems = computed(() => {
  if (!searchQuery.value)
    return props.items
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item =>
    item.label.toLowerCase().includes(query),
  )
})

/** Get label for a selected value */
function getLabelForValue(value: string): string {
  const item = props.items.find(i => i.value === value)
  return item?.label ?? value
}

/** Remove a specific value from the selection */
function removeValue(value: string): void {
  model.value = model.value.filter(v => v !== value)
  emit('change', model.value)
}

function handleValueChange(raw: unknown): void {
  const value = raw as string[]
  if (props.maxSelections !== undefined && value.length > props.maxSelections) {
    return
  }
  model.value = value
  emit('change', value)
  emit('select', value)
  searchQuery.value = ''
}

function handleOpenChange(open: boolean): void {
  if (open) {
    emit('open')
  }
  else {
    emit('close')
    searchQuery.value = ''
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleClear(): void {
  model.value = []
  emit('clear')
  emit('change', [])
}

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ComboboxRoot
    :model-value="model"
    :disabled="resolvedDisabled"
    :name="name"
    multiple
    @update:model-value="handleValueChange"
    @update:open="handleOpenChange"
  >
    <ComboboxAnchor
      :class="rootClasses"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <!-- Selected tags -->
      <span
        v-for="value in model"
        :key="value"
        :class="styles.tag()"
      >
        <slot name="tag" :value="value" :label="getLabelForValue(value)" :remove="() => removeValue(value)">
          {{ getLabelForValue(value) }}
          <button
            type="button"
            :class="styles.tagClose()"
            :aria-label="`Remove ${getLabelForValue(value)}`"
            @click.stop="removeValue(value)"
          >
            <X class="h-3 w-3" aria-hidden="true" />
          </button>
        </slot>
      </span>

      <ComboboxInput
        :id="id ?? fieldContext?.fieldId"
        v-model="searchQuery"
        :placeholder="model.length === 0 ? placeholder : undefined"
        :class="styles.input()"
        :disabled="resolvedDisabled || isMaxReached"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <button
        v-if="model.length > 0"
        type="button"
        :class="styles.icon()"
        aria-label="Clear all"
        @click.stop="handleClear"
      >
        <X class="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <ChevronDown :class="styles.icon()" aria-hidden="true" />
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent :class="styles.content()" position="popper" :side-offset="4">
        <ComboboxViewport :class="styles.viewport()">
          <ComboboxItem
            v-for="(item, index) in filteredItems"
            :key="item.value"
            :value="item.value"
            :disabled="item.disabled || (isMaxReached && !model.includes(item.value))"
            :class="styles.item()"
          >
            <ComboboxItemIndicator class="absolute left-1 flex items-center justify-center">
              <Check :class="styles.checkIcon()" aria-hidden="true" />
            </ComboboxItemIndicator>
            <slot
              name="item"
              :item="item"
              :index="index"
              :selected="model.includes(item.value)"
            >
              <span class="pl-6">{{ item.label }}</span>
            </slot>
          </ComboboxItem>

          <ComboboxEmpty :class="styles.empty()">
            <slot name="empty">
              No options available
            </slot>
          </ComboboxEmpty>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
