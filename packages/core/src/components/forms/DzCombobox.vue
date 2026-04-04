<script setup lang="ts">
import type {
  DzComboboxEmits,
  DzComboboxProps,
  DzComboboxSlots,
} from './DzCombobox.types.ts'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import {
  ComboboxAnchor,
  ComboboxCancel,
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
 * DzCombobox -- Searchable select using Reka UI Combobox (ADR-07).
 *
 * Single-value combobox with search input and optional custom value.
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzCombobox
 *   v-model="selected"
 *   :items="items"
 *   placeholder="Search..."
 *   allow-custom-value
 * />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { comboboxVariants } from './DzCombobox.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzComboboxProps>(), {
  placeholder: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  allowCustomValue: false,
  filterFn: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzComboboxEmits>()
defineSlots<DzComboboxSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()
const searchQuery = ref('')

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  comboboxVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

/** Filtered items based on search query */
const filteredItems = computed(() => {
  if (!searchQuery.value)
    return props.items
  const query = searchQuery.value
  if (props.filterFn) {
    return props.items.filter(item => props.filterFn!(item, query))
  }
  const lowerQuery = query.toLowerCase()
  return props.items.filter(item =>
    item.label.toLowerCase().includes(lowerQuery),
  )
})

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
    if (!props.allowCustomValue) {
      searchQuery.value = ''
    }
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleClear(): void {
  model.value = ''
  searchQuery.value = ''
  emit('clear')
  emit('change', '')
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
    @update:model-value="handleValueChange"
    @update:open="handleOpenChange"
  >
    <ComboboxAnchor
      :class="rootClasses"
      :data-state="resolvedDisabled ? 'disabled' : 'idle'"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <ComboboxInput
        :id="resolvedId"
        v-model="searchQuery"
        :placeholder="placeholder"
        :class="styles.input()"
        :disabled="resolvedDisabled"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <ComboboxCancel
        v-if="model"
        as-child
      >
        <button
          type="button"
          :class="styles.clearButton()"
          aria-label="Clear selection"
          @click.stop="handleClear"
        >
          <X class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </ComboboxCancel>

      <ChevronDown :class="styles.icon()" aria-hidden="true" />
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent :class="styles.content()" position="popper" :side-offset="4">
        <ComboboxViewport :class="styles.viewport()">
          <ComboboxItem
            v-for="(item, index) in filteredItems"
            :key="item.value"
            :value="item.value"
            :disabled="item.disabled"
            :class="styles.item()"
          >
            <ComboboxItemIndicator class="absolute left-1 flex items-center justify-center">
              <Check :class="styles.checkIcon()" aria-hidden="true" />
            </ComboboxItemIndicator>
            <slot
              name="item"
              :item="item"
              :index="index"
              :selected="model === item.value"
            >
              <span class="pl-6">{{ item.label }}</span>
            </slot>
          </ComboboxItem>

          <ComboboxEmpty :class="styles.empty()">
            <slot name="empty">
              No results found
            </slot>
          </ComboboxEmpty>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
