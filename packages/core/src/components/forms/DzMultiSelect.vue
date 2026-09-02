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
  ComboboxTrigger,
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
import { computed, ref, useAttrs, useId } from 'vue'
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { multiSelectVariants } from './DzMultiSelect.variants.ts'
import DzOptionsState from './DzOptionsState.vue'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzMultiSelectProps>(), {
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
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
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

const emit = defineEmits<DzMultiSelectEmits>()
defineSlots<DzMultiSelectSlots>()

// The async-options rows are one shared group across all seven selection
// controls, so a translator writes them once (renderer contract C9).
const dzAsyncMessages = useComponentMessages('DzAsyncOptions')

/**
 * The async-options seam (renderer contract C9).
 *
 * Inert unless the host passes `optionsState`, so a control with a static
 * option array behaves exactly as it did. Every request supersedes and aborts
 * the last, so a host that fences on the signal never has two in flight.
 */
const {
  row: optionsRow,
  state: resolvedOptionsState,
  canRetry: canRetryOptions,
  announcement: optionsAnnouncement,
  request: requestOptions,
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

function handleRetryOptions(): void {
  emit('retryOptions')
  requestOptions('open')
}
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

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

/** `required` was declared, defaulted, and read nowhere (renderer contract C3). */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

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

/**
 * Backspace on an empty search input removes the last selected tag,
 * matching the common multi-select interaction pattern.
 */
function handleInputKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Backspace' || searchQuery.value !== '' || resolvedDisabled.value)
    return
  const last = model.value[model.value.length - 1]
  if (last === undefined)
    return
  event.preventDefault()
  removeValue(last)
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

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzMultiSelect')
</script>

<template>
  <div>
    <ComboboxRoot
      :model-value="model"
      :disabled="resolvedDisabled"
      :name="name"
      multiple
      :open-on-click="true"
      :open-on-focus="true"
      :ignore-filter="true"
      @update:model-value="handleValueChange"
      @update:open="handleOpenChange"
    >
      <ComboboxAnchor
        :class="rootClasses"
        :data-state="resolvedDisabled ? 'disabled' : 'idle'"
        :data-disabled="resolvedDisabled ? '' : undefined"
        :data-invalid="resolvedInvalid ? '' : undefined"
        :data-required="resolvedRequired ? '' : undefined"
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
          :id="resolvedId"
          v-model="searchQuery"
          :placeholder="model.length === 0 ? placeholder : undefined"
          :class="styles.input()"
          :disabled="resolvedDisabled || isMaxReached"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleInputKeydown"
        />

        <button
          v-if="model.length > 0"
          type="button"
          :class="styles.icon()"
          :aria-label="dzMessages.clearAll"
          @click.stop="handleClear"
        >
          <X class="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <ComboboxTrigger as-child>
          <button
            type="button"
            :class="styles.icon()"
            :aria-label="dzMessages.toggleOptions"
            :disabled="resolvedDisabled"
          >
            <!-- TASK-N1-O3: see DzCombobox.vue — the button is the 24px target. -->
            <ChevronDown class="size-[var(--dz-control-visual-size)]" aria-hidden="true" />
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

            <!--
              One row instead of the list while the host is loading, has nothing, or
              failed (renderer contract C9). `optionsRow` is null whenever the control
              is static, so a control with a plain option array renders none of this.
            -->
            <DzOptionsState
              v-if="optionsRow !== null"
              :state="resolvedOptionsState"
              :message="optionsAnnouncement"
              :can-retry="canRetryOptions"
              @retry="handleRetryOptions"
            />
            <ComboboxEmpty :class="styles.empty()">
              <slot name="empty">
                No options available
              </slot>
            </ComboboxEmpty>
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
