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
import { computed, nextTick, ref, useAttrs, useId } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { selectVariants } from './DzSelect.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  defaultOpen: false,
  searchable: false,
  searchPlaceholder: undefined,
  filterFn: undefined,
  noResultsText: undefined,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
  ui: undefined,
})

const emit = defineEmits<DzSelectEmits>()
defineSlots<DzSelectSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzSelect')
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? dzMessages.value.searchPlaceholder)
const resolvedNoResultsText = computed(() => props.noResultsText ?? dzMessages.value.noResults)

const EMPTY_VALUE_SENTINEL = '__DZ_SELECT_EMPTY__'

/** Maps external value → internal reka-ui safe value (empty string → sentinel) */
function toInternal(v: string): string {
  return v === '' ? EMPTY_VALUE_SENTINEL : v
}

/** Maps internal reka-ui value → external value (sentinel → empty string) */
function toExternal(v: string): string {
  return v === EMPTY_VALUE_SENTINEL ? '' : v
}

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

/** ID of the SelectValue element holding the placeholder / selected label text */
const valueId = computed(() => `${resolvedId.value}-value`)

/**
 * Accessible name wiring for the `role="combobox"` trigger.
 *
 * A combobox derives its name from the author (aria-label / aria-labelledby), NOT
 * from its text content, so the placeholder rendered inside the button does not
 * contribute on its own (axe `button-name`). We therefore reference the value
 * element explicitly: the name stays non-empty (placeholder) when nothing is
 * selected and reflects the chosen item's label once a value is set. When the
 * select sits inside a DzFormField, the field's label is prepended so the name
 * reads "<label> <value>".
 *
 * Returns `undefined` when an explicit `ariaLabel` is supplied so that author
 * intent (aria-label) is not silently overridden by aria-labelledby precedence.
 */
const resolvedAriaLabelledby = computed(() => {
  if (props.ariaLabel)
    return undefined
  const parts: string[] = []
  if (props.ariaLabelledby)
    parts.push(props.ariaLabelledby)
  else if (fieldContext?.labelId)
    parts.push(fieldContext.labelId)
  parts.push(valueId.value)
  return parts.join(' ')
})

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

/**
 * Per-part class strings (ADR-19).
 *
 * `class` continues to land on the TRIGGER — the node it has always landed on,
 * and the only one a consumer could reach before `ui` existed. `ui.root` is the
 * way to the outer wrapper.
 */
const triggerClasses = computed(() =>
  cn(styles.value.trigger(), props.ui?.trigger, attrs.class as string | undefined),
)
const rootClasses = computed(() => cn(props.ui?.root))
const iconClasses = computed(() => cn(styles.value.icon(), props.ui?.icon))
const contentClasses = computed(() => cn(styles.value.content(), props.ui?.content))
const viewportClasses = computed(() => cn(styles.value.viewport(), props.ui?.viewport))
const searchInputClasses = computed(() => cn(styles.value.searchInput(), props.ui?.input))
const itemClasses = computed(() => cn(styles.value.item(), props.ui?.item))
const itemIndicatorClasses = computed(() => cn(
  'absolute left-1 flex items-center justify-center',
  props.ui?.['item-indicator'],
))
const itemLabelClasses = computed(() => cn('pl-6', props.ui?.['item-label']))
const noResultsClasses = computed(() => cn(styles.value.noResults(), props.ui?.empty))
const emptyClasses = computed(() => cn(
  'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)] text-center '
  + 'text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
  props.ui?.empty,
))
const errorClasses = computed(() => cn(
  'mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]',
  props.ui?.error,
))
</script>

<template>
  <div data-part="root" :class="rootClasses">
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
        data-part="trigger"
        :aria-label="ariaLabel"
        :aria-labelledby="resolvedAriaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
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
        <SelectValue :id="valueId" :placeholder="placeholder" />
        <SelectIcon as-child>
          <ChevronDown data-part="icon" :class="iconClasses" aria-hidden="true" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal
        :to="resolvedPortalTo"
        :disabled="portalDisabled"
        :defer="portalDefer"
      >
        <SelectContent
          data-part="content"
          :class="contentClasses"
          position="popper"
          :side-offset="4"
        >
          <SelectViewport data-part="viewport" :class="viewportClasses">
            <!-- TODO(remove-after: 0.3.0): `data-dz-search-input` and
                 `data-dz-no-results` below are dual-emitted beside their
                 `data-part` names for one minor series (ADR-19 §6). Removing
                 either is breaking and needs a major changeset. -->
            <div
              v-if="searchable"
              :class="styles.searchWrapper()"
              @pointerdown.stop
            >
              <input
                ref="searchInputRef"
                type="text"
                :value="searchQuery"
                :placeholder="resolvedSearchPlaceholder"
                :class="searchInputClasses"
                role="searchbox"
                :aria-label="dzMessages.filterOptions"
                data-part="input"
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
                data-part="item"
                :class="itemClasses"
              >
                <SelectItemIndicator data-part="item-indicator" :class="itemIndicatorClasses">
                  <Check :class="styles.checkIcon()" aria-hidden="true" />
                </SelectItemIndicator>
                <SelectItemText data-part="item-label" :class="itemLabelClasses">
                  {{ item.label }}
                </SelectItemText>
              </SelectItem>
            </template>
            <div
              v-else-if="searchable && searchQuery.trim()"
              data-part="empty"
              :class="noResultsClasses"
              data-dz-no-results
            >
              {{ resolvedNoResultsText }}
            </div>
            <div
              v-else
              data-part="empty"
              :class="emptyClasses"
            >
              <slot name="empty">
                No options available
              </slot>
            </div>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      data-part="error"
      :class="errorClasses"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
