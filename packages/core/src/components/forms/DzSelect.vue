<script setup lang="ts">
import type { DzSelectEmits, DzSelectProps, DzSelectSlots } from './DzSelect.types.ts'
import { Check, ChevronDown } from 'lucide-vue-next'
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
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
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { selectVariants } from './DzSelect.variants.ts'

const EMPTY_VALUE_SENTINEL = '__DZ_SELECT_EMPTY__'

const model = defineModel<string>({ default: '' })

/** Maps external value → internal reka-ui safe value (empty string → sentinel) */
function toInternal(v: string): string {
  return v === '' ? EMPTY_VALUE_SENTINEL : v
}

/** Maps internal reka-ui value → external value (sentinel → empty string) */
function toExternal(v: string): string {
  return v === EMPTY_VALUE_SENTINEL ? '' : v
}

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
  defaultOpen: false,
  searchable: false,
  searchPlaceholder: 'Search...',
  filterFn: undefined,
  noResultsText: 'No results found',
})

const emit = defineEmits<DzSelectEmits>()
defineSlots<DzSelectSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

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

// -- Search state -----------------------------------------------------------

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

/** Default filter: case-insensitive label match */
function defaultFilter(option: { label: string, value: string, disabled?: boolean }, query: string): boolean {
  return option.label.toLowerCase().includes(query.toLowerCase())
}

const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.items
  }
  const filterFn = props.filterFn ?? defaultFilter
  return props.items.filter(item => filterFn(item, searchQuery.value))
})

function handleSearchInput(event: Event): void {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
}

function handleValueChange(value: string): void {
  const external = toExternal(value)
  model.value = external
  emit('change', external)
  emit('select', external)
}

function handleOpenChange(open: boolean): void {
  if (open) {
    emit('open')
    if (props.searchable) {
      void nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
  else {
    searchQuery.value = ''
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
    :model-value="toInternal(model)"
    :disabled="resolvedDisabled"
    :name="name"
    :required="required || fieldContext?.isRequired.value"
    :default-open="defaultOpen"
    @update:model-value="handleValueChange"
    @update:open="handleOpenChange"
  >
    <SelectTrigger
      :id="resolvedId"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      :class="triggerClasses"
      :data-state="resolvedDisabled ? 'disabled' : 'idle'"
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

    <SelectContent :class="styles.content()" position="popper" :side-offset="4">
      <SelectViewport :class="styles.viewport()">
        <div
          v-if="searchable"
          :class="styles.searchWrapper()"
          @pointerdown.stop
        >
          <input
            ref="searchInputRef"
            type="text"
            :value="searchQuery"
            :placeholder="searchPlaceholder"
            :class="styles.searchInput()"
            role="searchbox"
            aria-label="Filter options"
            data-dz-search-input
            @input="handleSearchInput"
            @keydown.stop
          >
        </div>
        <template v-if="filteredItems.length > 0">
          <SelectItem
            v-for="item in filteredItems"
            :key="toInternal(item.value)"
            :value="toInternal(item.value)"
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
          v-else-if="searchable && searchQuery.trim()"
          :class="styles.noResults()"
          data-dz-no-results
        >
          {{ noResultsText }}
        </div>
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
  </SelectRoot>
</template>
