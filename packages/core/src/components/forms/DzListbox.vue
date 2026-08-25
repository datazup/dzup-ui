<script setup lang="ts">
import type { Component } from 'vue'
import type {
  DzListboxEmits,
  DzListboxOption,
  DzListboxProps,
  DzListboxSlots,
  DzListboxValue,
} from './DzListbox.types.ts'
import { Check } from 'lucide-vue-next'
import {
  ListboxContent,
  ListboxFilter,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
  ListboxRoot,
} from 'reka-ui'
/**
 * DzListbox -- Always-visible single/multi-select list using Reka UI Listbox
 * primitives (ADR-07).
 *
 * Reka provides roving tabindex, Up/Down/Home/End navigation, Enter/Space
 * toggle, typeahead, and (via ListboxFilter) the `aria-activedescendant`
 * pattern. Range selection (Shift+click / Shift+Arrow) is layered on top.
 *
 * v-model via defineModel (ADR-16) — a single value in single mode, an array
 * when `multiple`.
 *
 * @example
 * ```vue
 * <DzListbox v-model="selected" multiple filter checkmark :options="cities" />
 * ```
 */
import { computed, markRaw, ref, useAttrs, useId } from 'vue'
import { useAsyncOptions } from '../../composables/useAsyncOptions/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { listboxVariants } from './DzListbox.variants.ts'
import DzOptionsState from './DzOptionsState.vue'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<DzListboxValue | DzListboxValue[] | null>({ default: null })

const props = withDefaults(defineProps<DzListboxProps>(), {
  optionsState: undefined,
  optionsError: undefined,
  optionsRetryable: undefined,
  multiple: false,
  optionLabel: undefined,
  optionValue: undefined,
  optionDisabled: undefined,
  optionGroup: undefined,
  filter: false,
  filterPlaceholder: undefined,
  checkmark: false,
  emptyMessage: undefined,
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
})

const emit = defineEmits<DzListboxEmits>()
defineSlots<DzListboxSlots>()

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
    hasOptions: () => props.options.length > 0,
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
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzListbox')
const resolvedFilterPlaceholder = computed(() => props.filterPlaceholder ?? dzMessages.value.filterPlaceholder)
const resolvedEmptyMessage = computed(() => props.emptyMessage ?? dzMessages.value.empty)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** A visible option augmented with its flat index (used for range selection) */
type VisibleOption = DzListboxOption & { index: number }

// -- Resolved field state ---------------------------------------------------

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/**
 * `required` was reaching the Reka root and nothing else; `readonly` and
 * `loading` were declared, defaulted, and read nowhere at all. All three now
 * reach the DOM as the presence-only attributes ADR-19 §4 names, so a
 * stylesheet and a renderer can both see them (renderer contract C3).
 */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

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
  listboxVariants({
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

// -- Option normalization ---------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Maps raw options (canonical or arbitrary objects) to a canonical shape */
const normalizedOptions = computed<DzListboxOption[]>(() => {
  const labelKey = props.optionLabel ?? 'label'
  const valueKey = props.optionValue ?? 'value'
  const disabledKey = props.optionDisabled ?? 'disabled'
  const groupKey = props.optionGroup ?? 'group'
  return props.options.map((raw) => {
    const o = (isRecord(raw) ? raw : {}) as Record<string, unknown>
    return {
      label: String(o[labelKey] ?? ''),
      value: o[valueKey] as DzListboxValue,
      disabled: Boolean(o[disabledKey]),
      icon: o.icon ? markRaw(o.icon as Component) : undefined,
      group: o[groupKey] != null ? String(o[groupKey]) : undefined,
    }
  })
})

const hasGroups = computed(() => normalizedOptions.value.some(o => o.group != null))

// -- Filtering --------------------------------------------------------------

const filterQuery = ref('')

const visibleOptions = computed<VisibleOption[]>(() => {
  const q = filterQuery.value.trim().toLowerCase()
  const source = q
    ? normalizedOptions.value.filter(o => o.label.toLowerCase().includes(q))
    : normalizedOptions.value
  return source.map((o, index) => ({ ...o, index }))
})

/** Visible options grouped for rendering (single ungrouped bucket when flat) */
const groups = computed<{ key: string | null, options: VisibleOption[] }[]>(() => {
  if (!hasGroups.value)
    return [{ key: null, options: visibleOptions.value }]
  const map = new Map<string, VisibleOption[]>()
  const order: string[] = []
  for (const o of visibleOptions.value) {
    const k = o.group ?? ''
    if (!map.has(k)) {
      map.set(k, [])
      order.push(k)
    }
    map.get(k)!.push(o)
  }
  return order.map(k => ({ key: k, options: map.get(k)! }))
})

function handleFilterInput(value: string): void {
  filterQuery.value = value
  emit('filter', value)
}

// -- Selection --------------------------------------------------------------

function valuesEqual(a: DzListboxValue | null, b: DzListboxValue | null): boolean {
  return a === b
}

const selectedValues = computed<DzListboxValue[]>(() => {
  if (props.multiple)
    return Array.isArray(model.value) ? model.value : []
  return model.value == null ? [] : [model.value as DzListboxValue]
})

function isSelected(value: DzListboxValue): boolean {
  return selectedValues.value.some(v => valuesEqual(v, value))
}

/** Value passed to Reka — array in multiple mode, scalar (or undefined) otherwise */
const rekaModel = computed<DzListboxValue | DzListboxValue[] | undefined>(() => {
  if (props.multiple)
    return selectedValues.value
  return model.value == null ? undefined : (model.value as DzListboxValue)
})

/** Anchor for range selection — the last individually-selected value */
const anchorValue = ref<DzListboxValue | null>(null)
const pendingRangeExtend = ref(false)

function updateAnchorFromDiff(prev: DzListboxValue[], next: DzListboxValue[]): void {
  const added = next.find(v => !prev.some(p => valuesEqual(p, v)))
  const removed = prev.find(p => !next.some(n => valuesEqual(n, p)))
  if (added !== undefined)
    anchorValue.value = added
  else if (removed !== undefined)
    anchorValue.value = removed
}

function handleUpdate(raw: unknown): void {
  if (props.multiple) {
    const next = Array.isArray(raw) ? (raw as DzListboxValue[]) : []
    updateAnchorFromDiff(selectedValues.value, next)
    model.value = next
    emit('change', next)
    emit('select', next)
  }
  else {
    const next = (raw ?? null) as DzListboxValue | null
    anchorValue.value = next
    model.value = next
    emit('change', next)
    emit('select', next)
  }
}

function commitMultiple(values: DzListboxValue[]): void {
  model.value = values
  emit('change', values)
  emit('select', values)
}

/** Extends the multiple-mode selection from the anchor to `targetValue` */
function applyRange(targetValue: DzListboxValue): void {
  const opts = visibleOptions.value
  const ti = opts.findIndex(o => valuesEqual(o.value, targetValue))
  if (ti === -1)
    return

  const ai = anchorValue.value == null
    ? -1
    : opts.findIndex(o => valuesEqual(o.value, anchorValue.value))

  const merged = [...selectedValues.value]
  const addValue = (v: DzListboxValue): void => {
    if (!merged.some(m => valuesEqual(m, v)))
      merged.push(v)
  }

  if (ai === -1) {
    // No usable anchor — fall back to selecting just the target
    anchorValue.value = targetValue
    addValue(targetValue)
    commitMultiple(merged)
    return
  }

  const [lo, hi] = ai <= ti ? [ai, ti] : [ti, ai]
  for (const o of opts.slice(lo, hi + 1)) {
    if (!o.disabled)
      addValue(o.value)
  }
  commitMultiple(merged)
}

// -- Range-select interactions ---------------------------------------------

const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End']

/** Capture Shift+Arrow/Home/End before Reka navigates, then extend on highlight */
function onRootKeydownCapture(event: KeyboardEvent): void {
  if (!props.multiple || resolvedDisabled.value)
    return
  if (event.shiftKey && NAV_KEYS.includes(event.key)) {
    pendingRangeExtend.value = true
    // Safety: drop the flag if no highlight fires (e.g. at a boundary)
    queueMicrotask(() => {
      pendingRangeExtend.value = false
    })
  }
}

function onHighlight(payload: { ref: HTMLElement, value: unknown } | undefined): void {
  if (!pendingRangeExtend.value)
    return
  pendingRangeExtend.value = false
  if (props.multiple && payload && payload.value != null)
    applyRange(payload.value as DzListboxValue)
}

/** Capture Shift+click before it reaches the option, then range-extend */
function onContentClickCapture(event: MouseEvent): void {
  if (!props.multiple || !event.shiftKey || resolvedDisabled.value)
    return
  const el = (event.target as HTMLElement | null)?.closest('[data-dz-listbox-option]')
  if (!el)
    return
  const idxAttr = el.getAttribute('data-dz-index')
  if (idxAttr == null)
    return
  const opt = visibleOptions.value[Number(idxAttr)]
  if (!opt || opt.disabled)
    return
  event.preventDefault()
  event.stopPropagation()
  applyRange(opt.value)
}
</script>

<template>
  <div>
    <ListboxRoot
      :model-value="rekaModel"
      :multiple="multiple"
      :disabled="resolvedDisabled"
      :name="name"
      :required="resolvedRequired"
      :class="rootClasses"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :data-required="resolvedRequired ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      :data-loading="loading ? '' : undefined"
      :aria-busy="loading || undefined"
      :aria-readonly="readonly || undefined"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @update:model-value="handleUpdate"
      @highlight="onHighlight"
      @keydown.capture="onRootKeydownCapture"
    >
      <div v-if="filter" :class="styles.filterWrapper()">
        <ListboxFilter
          :model-value="filterQuery"
          :placeholder="resolvedFilterPlaceholder"
          :class="styles.filter()"
          :aria-label="dzMessages.filterOptions"
          @update:model-value="handleFilterInput"
        />
      </div>

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

      <ListboxContent
        :id="resolvedId"
        :class="styles.viewport()"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        @click.capture="onContentClickCapture"
      >
        <template v-if="visibleOptions.length > 0">
          <template v-for="grp in groups" :key="grp.key ?? '__flat__'">
            <ListboxGroup v-if="grp.key !== null" :class="styles.group()">
              <ListboxGroupLabel :class="styles.groupLabel()">
                <slot name="groupLabel" :group="grp.key">
                  {{ grp.key }}
                </slot>
              </ListboxGroupLabel>
              <ListboxItem
                v-for="opt in grp.options"
                :key="opt.index"
                :value="opt.value"
                :disabled="opt.disabled"
                :class="styles.option()"
                data-dz-listbox-option=""
                :data-dz-index="opt.index"
              >
                <slot
                  name="option"
                  :option="opt"
                  :index="opt.index"
                  :selected="isSelected(opt.value)"
                >
                  <component
                    :is="opt.icon"
                    v-if="opt.icon"
                    :class="styles.optionIcon()"
                    aria-hidden="true"
                  />
                  <span :class="styles.optionLabel()">{{ opt.label }}</span>
                  <ListboxItemIndicator v-if="checkmark">
                    <Check :class="styles.checkIcon()" aria-hidden="true" />
                  </ListboxItemIndicator>
                </slot>
              </ListboxItem>
            </ListboxGroup>

            <template v-else>
              <ListboxItem
                v-for="opt in grp.options"
                :key="opt.index"
                :value="opt.value"
                :disabled="opt.disabled"
                :class="styles.option()"
                data-dz-listbox-option=""
                :data-dz-index="opt.index"
              >
                <slot
                  name="option"
                  :option="opt"
                  :index="opt.index"
                  :selected="isSelected(opt.value)"
                >
                  <component
                    :is="opt.icon"
                    v-if="opt.icon"
                    :class="styles.optionIcon()"
                    aria-hidden="true"
                  />
                  <span :class="styles.optionLabel()">{{ opt.label }}</span>
                  <ListboxItemIndicator v-if="checkmark">
                    <Check :class="styles.checkIcon()" aria-hidden="true" />
                  </ListboxItemIndicator>
                </slot>
              </ListboxItem>
            </template>
          </template>
        </template>

        <div v-else :class="styles.empty()">
          <slot name="empty">
            {{ resolvedEmptyMessage }}
          </slot>
        </div>
      </ListboxContent>
    </ListboxRoot>

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
