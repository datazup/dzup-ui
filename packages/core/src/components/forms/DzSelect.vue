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
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
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
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
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
// The async-options rows are one shared group, not three keys per control, so a
// translator writes them once for all seven selection controls.
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')
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

/**
 * `required` reached the Reka primitive (which renders `aria-required`) but
 * never reached the DOM as the presence-only attribute ADR-19 §4 lists, so no
 * stylesheet could show a required field as required (renderer contract C3).
 */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

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

/**
 * The label for the current value, computed from `items` rather than looked up
 * in Reka's item registry.
 *
 * Empty when nothing is selected, which is what leaves `SelectValue`'s
 * placeholder in charge.
 */
const selectedLabel = computed(
  () => props.items.find(item => item.value === model.value)?.label ?? '',
)

/**
 * The async-options seam (renderer contract C9).
 *
 * Inert unless the host passes `optionsState`: a select with a static `items`
 * array behaves exactly as it did, which is what keeps this additive. When a
 * host does drive it, the control renders one row instead of the list and
 * announces the change politely — and every request it emits supersedes and
 * aborts the last, so a host that fences on the signal never has two in flight.
 */
const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
  abort: abortOptions,
} = useAsyncOptions(
  {
    state: () => props.optionsState,
    error: () => props.optionsError,
    retryable: () => props.optionsRetryable,
    hasOptions: () => props.items.length > 0,
    emit: request => emit('loadOptions', request),
  },
  () => ({
    loading: dzAsyncMessages.value.loading,
    empty: dzAsyncMessages.value.empty,
    error: dzAsyncMessages.value.error,
  }),
)

function handleRetry(): void {
  emit('retryOptions')
  requestOptions('open', searchQuery.value)
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
  // A host driving the options filters server-side; a static control filters
  // locally through `filteredItems` and this is a no-op (renderer contract C9).
  requestOptions('search', searchQuery.value)
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
    // Ask on open only when there is nothing to show. A host that has already
    // supplied options should not see a request every time the panel opens.
    if (props.items.length === 0)
      requestOptions('open')
    if (props.searchable) {
      void nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
  else {
    searchQuery.value = ''
    // Nothing in flight matters once the panel is closed, and a host fencing on
    // the signal should not be left holding one that never aborts.
    abortOptions()
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
/** The async-options row reuses the `empty` part so a consumer styles one thing. */
const optionsStateClasses = computed(() => cn(styles.value.optionsState(), props.ui?.empty))
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
      :required="resolvedRequired"
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
        :data-required="resolvedRequired ? '' : undefined"
        :data-invalid="resolvedInvalid ? '' : undefined"
        style="contain: layout style"
        v-bind="{ ...$attrs, class: undefined }"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <!--
          The slot content is the server's answer, not a decoration.

          `SelectValue` resolves the label from Reka's item registry, and that
          registry is populated when the *content* mounts — which never happens
          during SSR. So a select with a value rendered an empty placeholder on
          the server and filled itself in only after hydration: a form field
          that looks unset until JavaScript arrives. `items` is right here, so
          the label can be computed without the registry (renderer contract C5).
        -->
        <SelectValue v-if="selectedLabel" :id="valueId" :placeholder="placeholder">
          {{ selectedLabel }}
        </SelectValue>
        <!--
          No selection: leave Reka's own placeholder path alone. Supplying slot
          content unconditionally replaces the placeholder as well as the value,
          which emptied the accessible name of every unset select.
        -->
        <SelectValue v-else :id="valueId" :placeholder="placeholder" />
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
            <!--
              One row instead of the list while the host is loading, has
              nothing, or failed (renderer contract C9). Rendered before the
              list so the three states cannot both show; `asyncOptions.row` is
              null whenever the control is static, which is the whole of the
              additive guarantee.
            -->
            <!--
              One row instead of the list while the host is loading, has
              nothing, or failed (renderer contract C9).

              `role="status"` + `aria-live="polite"` because these arrive *after*
              first paint — a user who opened the panel and is waiting has no
              other way to learn that the load finished, or failed. Polite, not
              assertive: it is information, not an interruption.

              `optionsRow` is null whenever the control is static, so a select
              with a plain `items` array renders none of this. That is the whole
              of the additive guarantee.
            -->
            <div
              v-if="optionsRow !== null"
              data-part="options-state"
              :data-options-state="resolvedOptionsState"
              :class="optionsStateClasses"
              role="status"
              aria-live="polite"
            >
              <slot
                name="options-state"
                :state="resolvedOptionsState"
                :message="optionsAnnouncement"
                :error="optionsError"
                :retry="handleRetry"
              >
                <span data-part="options-message">{{ optionsAnnouncement }}</span>
                <button
                  v-if="canRetryOptions"
                  type="button"
                  data-part="options-retry"
                  :class="styles.optionsRetry()"
                  @click="handleRetry"
                >
                  {{ dzAsyncMessages.retry }}
                </button>
              </slot>
            </div>
            <template v-else-if="filteredItems.length > 0">
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
