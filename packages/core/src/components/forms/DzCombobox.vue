<script setup lang="ts">
import type {
  DzComboboxEmits,
  DzComboboxItem,
  DzComboboxProps,
  DzComboboxResolvedItem,
  DzComboboxSlots,
} from './DzCombobox.types.ts'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import {
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
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
import { computed, ref, useAttrs, useId, watch } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzSpinner from '../feedback/DzSpinner.vue'
import { comboboxVariants } from './DzCombobox.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzComboboxProps>(), {
  placeholder: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  defaultOpen: false,
  openOnClick: true,
  openOnFocus: false,
  allowCustomValue: false,
  loading: false,
  loadingText: undefined,
  emptyText: undefined,
  noResultsText: undefined,
  getItemValue: undefined,
  getItemLabel: undefined,
  getItemDisabled: undefined,
  filterFn: undefined,
  displayValue: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzComboboxEmits>()
defineSlots<DzComboboxSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzCombobox')
const resolvedLoadingText = computed(() => props.loadingText ?? dzMessages.value.loading)
const resolvedEmptyText = computed(() => props.emptyText ?? dzMessages.value.empty)
const resolvedNoResultsText = computed(() => props.noResultsText ?? dzMessages.value.noResults)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()
const searchQuery = ref('')
const filterQuery = ref('')
const isOpen = ref(false)

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

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

/**
 * Accessible name wiring for the `role="combobox"` input.
 *
 * An input's value is announced natively, but it still needs an author-supplied
 * name (axe `aria-input-field-name`). We prefer an explicit `ariaLabelledby`, then
 * the surrounding DzFormField label, so the input reads its associated label.
 */
const resolvedAriaLabelledby = computed(() => {
  if (props.ariaLabelledby)
    return props.ariaLabelledby
  if (!props.ariaLabel && fieldContext?.labelId)
    return fieldContext.labelId
  return undefined
})

/**
 * Falls back to the placeholder so the input always has a non-empty accessible
 * name. Suppressed when aria-labelledby already supplies the name, to avoid a
 * redundant (and lower-precedence) aria-label.
 */
const resolvedAriaLabel = computed(() => {
  if (resolvedAriaLabelledby.value)
    return undefined
  return props.ariaLabel ?? props.placeholder
})

const styles = computed(() =>
  comboboxVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

function defaultItemValue(item: DzComboboxItem): string {
  if (props.getItemValue)
    return props.getItemValue(item)
  if (typeof item === 'object' && item !== null && 'value' in item) {
    return String((item as Record<string, unknown>).value ?? '')
  }
  return String(item)
}

function defaultItemLabel(item: DzComboboxItem): string {
  if (props.getItemLabel)
    return props.getItemLabel(item)
  if (typeof item === 'object' && item !== null && 'label' in item) {
    return String((item as Record<string, unknown>).label ?? '')
  }
  return defaultItemValue(item)
}

function defaultItemDisabled(item: DzComboboxItem): boolean {
  if (props.getItemDisabled)
    return props.getItemDisabled(item)
  return typeof item === 'object' && item !== null && 'disabled' in item
    ? Boolean((item as Record<string, unknown>).disabled)
    : false
}

const normalizedItems = computed<DzComboboxResolvedItem[]>(() =>
  props.items.map(item => ({
    raw: item,
    value: defaultItemValue(item),
    label: defaultItemLabel(item),
    disabled: defaultItemDisabled(item),
  })),
)

/** Filtered items based on search query */
const filteredItems = computed(() => {
  if (props.loading)
    return []
  if (!filterQuery.value)
    return normalizedItems.value
  const query = filterQuery.value
  if (props.filterFn) {
    return normalizedItems.value.filter(item => props.filterFn!(item, query))
  }
  const lowerQuery = query.toLowerCase()
  return normalizedItems.value.filter(item =>
    item.label.toLowerCase().includes(lowerQuery),
  )
})

function getResolvedItemByValue(value: string): DzComboboxResolvedItem | undefined {
  if (!value)
    return undefined
  return normalizedItems.value.find(i => i.value === value)
}

function resolveDisplayValue(value: unknown): string {
  const stringValue = typeof value === 'string'
    ? value
    : value == null
      ? ''
      : String(value)
  const item = getResolvedItemByValue(stringValue)
  if (props.displayValue) {
    return props.displayValue(item, stringValue)
  }
  if (!value)
    return ''
  return item?.label ?? stringValue
}

function handleValueChange(value: string): void {
  model.value = value
  emit('change', value)
  emit('select', value)
}

function handleOpenChange(open: boolean): void {
  isOpen.value = open
  if (open) {
    // Opening the menu should browse the whole option set by default.
    // The visible input keeps its current display value; filtering resumes
    // as soon as the user types again.
    filterQuery.value = ''
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

function handleInput(event: Event): void {
  const value = (event.target as HTMLInputElement | null)?.value ?? ''
  filterQuery.value = value
  if (!props.allowCustomValue)
    return
  if (model.value === value)
    return
  model.value = value
  emit('change', value)
}

function handleClear(): void {
  model.value = ''
  searchQuery.value = ''
  filterQuery.value = ''
  emit('clear')
  emit('change', '')
}

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

watch(
  () => model.value,
  () => {
    if (!isOpen.value) {
      searchQuery.value = resolveDisplayValue(model.value)
      filterQuery.value = ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <ComboboxRoot
      :model-value="model"
      :disabled="resolvedDisabled"
      :name="name"
      :default-open="defaultOpen"
      :open-on-click="openOnClick"
      :open-on-focus="openOnFocus"
      :ignore-filter="true"
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
          :display-value="resolveDisplayValue"
          :placeholder="placeholder"
          :class="styles.input()"
          :disabled="resolvedDisabled"
          :aria-label="resolvedAriaLabel"
          :aria-labelledby="resolvedAriaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          @input="handleInput"
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
            :aria-label="dzMessages.clearSelection"
            @click.stop="handleClear"
          >
            <X class="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </ComboboxCancel>

        <ComboboxTrigger as-child>
          <button
            type="button"
            :class="styles.icon()"
            :aria-label="dzMessages.toggleOptions"
            :disabled="resolvedDisabled"
          >
            <DzSpinner
              v-if="loading"
              size="xs"
              tone="neutral"
              :label="resolvedLoadingText"
              class="h-full w-full"
            />
            <ChevronDown v-else class="h-full w-full" aria-hidden="true" />
          </button>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxPortal
        :to="resolvedPortalTo"
        :disabled="portalDisabled"
        :defer="portalDefer"
      >
        <ComboboxContent :class="styles.content()" position="popper" :side-offset="4">
          <ComboboxViewport :class="styles.viewport()">
            <template v-if="loading">
              <slot name="loading">
                <div :class="styles.empty()">
                  {{ resolvedLoadingText }}
                </div>
              </slot>
            </template>

            <template v-else-if="filteredItems.length > 0">
              <ComboboxItem
                v-for="(item, index) in filteredItems"
                :key="item.value"
                :value="item.value"
                :text-value="item.label"
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
            </template>

            <div v-else :class="styles.empty()">
              <slot
                name="empty"
                :query="searchQuery"
                :loading="loading"
                :has-items="normalizedItems.length > 0"
              >
                {{ normalizedItems.length > 0 ? resolvedNoResultsText : resolvedEmptyText }}
              </slot>
            </div>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
