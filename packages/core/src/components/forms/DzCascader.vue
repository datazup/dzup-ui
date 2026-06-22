<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type {
  DzCascaderEmits,
  DzCascaderFlatPath,
  DzCascaderOption,
  DzCascaderProps,
  DzCascaderSlots,
  DzCascaderValue,
} from './DzCascader.types.ts'
import { ChevronDown, ChevronRight, X } from 'lucide-vue-next'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
/**
 * DzCascader — cascading multi-level select built on Reka UI Popover.
 *
 * The trigger shows the selected path and opens a popover that reveals child
 * options column-by-column as each level is chosen. Leaf selection commits and
 * closes; with `changeOnSelect` any intermediate node also commits. An optional
 * `filter` mode replaces the columns with a flat, searchable list of full paths.
 *
 * v-model:value via defineModel (ADR-16) — an array of keys (root → leaf).
 *
 * @example
 * ```vue
 * <DzCascader v-model:value="region" :options="options" placeholder="Select region" />
 * <DzCascader v-model:value="region" :options="options" change-on-select />
 * <DzCascader v-model:value="region" :options="options" expand-trigger="hover" />
 * <DzCascader v-model:value="region" :options="options" filter />
 * ```
 */
import { computed, nextTick, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { cascaderVariants } from './DzCascader.variants.ts'

const model = defineModel<DzCascaderValue>('value', { default: () => [] })

const props = withDefaults(defineProps<DzCascaderProps>(), {
  placeholder: 'Select',
  changeOnSelect: false,
  expandTrigger: 'click',
  filter: false,
  separator: '/',
  searchPlaceholder: 'Search…',
  noResultsText: 'No matching paths',
  cleaner: true,
  disabled: false,
  readonly: false,
  loading: false,
  size: 'md',
  variant: 'outline',
  tone: undefined,
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

const emit = defineEmits<DzCascaderEmits>()
defineSlots<DzCascaderSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

const open = ref(false)
/** Element scoping the popover panel — used to focus option cells by data attrs */
const panelEl = ref<HTMLElement>()
/**
 * When the panel is opened from the trigger via ArrowDown/ArrowUp, this records
 * which edge of the root column should receive focus once the panel mounts.
 * Cleared after the open-watcher consumes it (Enter/Space leave it null and so
 * keep the selection-aware {@link initActive} behavior).
 */
const pendingTriggerNav = ref<'first' | 'last' | null>(null)

// ---------------------------------------------------------------------------
// Resolved field-context state
// ---------------------------------------------------------------------------

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
/** DOM id of the popover panel, wired to the trigger via aria-controls. */
const panelId = computed(() => `${resolvedId.value}-panel`)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedReadonly = computed(() => props.readonly ?? false)
const resolvedInvalid = computed(() => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false))
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

// ---------------------------------------------------------------------------
// Path resolution + display
// ---------------------------------------------------------------------------

/** Walk the option tree following `value`, returning the matched option chain. */
function resolvePath(value: DzCascaderValue): DzCascaderOption[] {
  const path: DzCascaderOption[] = []
  let level: DzCascaderOption[] | undefined = props.options
  for (const key of value) {
    const found: DzCascaderOption | undefined = level?.find(o => o.value === key)
    if (!found)
      break
    path.push(found)
    level = found.children
  }
  return path
}

const selectedPath = computed(() => resolvePath(model.value))
const displayLabels = computed(() => selectedPath.value.map(o => o.label))
const displayText = computed(() => displayLabels.value.join(` ${props.separator} `))
const hasValue = computed(() => displayLabels.value.length > 0)

// ---------------------------------------------------------------------------
// Active expansion path + focused cell
// ---------------------------------------------------------------------------

/** The currently expanded option chain — drives which columns are visible. */
const activePath = ref<DzCascaderOption[]>([])
/** Keyboard-focused cell (column index + option index within that column). */
const active = ref<{ col: number, index: number } | null>(null)

/** Visible columns: root, then each expanded node's children. */
const columns = computed<DzCascaderOption[][]>(() => {
  const cols: DzCascaderOption[][] = [props.options]
  for (const opt of activePath.value) {
    if (opt.children && opt.children.length > 0)
      cols.push(opt.children)
    else
      break
  }
  return cols
})

function isInPath(colIndex: number, option: DzCascaderOption): boolean {
  return activePath.value[colIndex]?.value === option.value
}
function isActiveCell(colIndex: number, index: number): boolean {
  return active.value?.col === colIndex && active.value?.index === index
}
function hasChildren(option: DzCascaderOption): boolean {
  return !!(option.children && option.children.length > 0)
}

// ---------------------------------------------------------------------------
// Flat filter mode
// ---------------------------------------------------------------------------

const searchQuery = ref('')

/** Every selectable path (leaves always; parents only when changeOnSelect). */
const flatPaths = computed<DzCascaderFlatPath[]>(() => {
  const out: DzCascaderFlatPath[] = []
  const walk = (opts: DzCascaderOption[], trail: DzCascaderOption[], trailDisabled: boolean): void => {
    for (const o of opts) {
      const path = [...trail, o]
      const disabled = trailDisabled || !!o.disabled
      if (!hasChildren(o) || props.changeOnSelect) {
        out.push({
          path,
          labels: path.map(p => p.label),
          value: path.map(p => p.value),
          disabled,
        })
      }
      if (hasChildren(o))
        walk(o.children!, path, disabled)
    }
  }
  walk(props.options, [], false)
  return out
})

const filteredPaths = computed<DzCascaderFlatPath[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return []
  return flatPaths.value.filter(e => e.labels.join(' ').toLowerCase().includes(q))
})

const showFlat = computed(() => props.filter && searchQuery.value.trim().length > 0)

// ---------------------------------------------------------------------------
// Selection / commit
// ---------------------------------------------------------------------------

function commit(path: DzCascaderOption[]): void {
  const value = path.map(o => o.value)
  model.value = value
  emit('change', value, { source: 'user' })
  emit('select', value)
}

function closePanel(): void {
  open.value = false
}

/** Click handler for a column cell: expand and/or commit per the rules. */
function selectOption(colIndex: number, option: DzCascaderOption, index: number): void {
  if (option.disabled || resolvedReadonly.value)
    return
  activePath.value = [...activePath.value.slice(0, colIndex), option]
  active.value = { col: colIndex, index }
  if (!hasChildren(option)) {
    commit(activePath.value)
    closePanel()
    return
  }
  if (props.changeOnSelect)
    commit(activePath.value)
  focusColumn(colIndex + 1)
}

/** Hover handler (only in `hover` expand mode): expand without committing. */
function expandOnHover(colIndex: number, option: DzCascaderOption, index: number): void {
  if (option.disabled)
    return
  if (!hasChildren(option)) {
    // Collapse any deeper columns when hovering a leaf.
    activePath.value = activePath.value.slice(0, colIndex)
    return
  }
  activePath.value = [...activePath.value.slice(0, colIndex), option]
  active.value = { col: colIndex, index }
}

function selectFlat(entry: DzCascaderFlatPath): void {
  if (entry.disabled || resolvedReadonly.value)
    return
  commit(entry.path)
  searchQuery.value = ''
  closePanel()
}

function handleClear(): void {
  if (!hasValue.value)
    return
  model.value = []
  activePath.value = []
  active.value = null
  emit('clear')
  emit('change', [], { source: 'user' })
}

// ---------------------------------------------------------------------------
// Keyboard navigation (column mode)
// ---------------------------------------------------------------------------

function firstEnabledIndex(col: number): number {
  const opts = columns.value[col] ?? []
  const i = opts.findIndex(o => !o.disabled)
  return i === -1 ? 0 : i
}

function lastEnabledIndex(col: number): number {
  const opts = columns.value[col] ?? []
  for (let i = opts.length - 1; i >= 0; i--) {
    if (!opts[i]!.disabled)
      return i
  }
  return 0
}

/** Step to the next enabled index within a column, wrapping around. */
function stepIndex(opts: DzCascaderOption[], from: number, dir: 1 | -1): number {
  if (opts.length === 0)
    return 0
  let i = from
  for (let n = 0; n < opts.length; n++) {
    i = (i + dir + opts.length) % opts.length
    if (!opts[i]!.disabled)
      return i
  }
  return from
}

function focusActive(): void {
  void nextTick(() => {
    const a = active.value
    if (!a || !panelEl.value)
      return
    const btn = panelEl.value.querySelector<HTMLElement>(
      `[data-col="${a.col}"][data-index="${a.index}"]`,
    )
    btn?.focus()
  })
}

function focusColumn(col: number): void {
  if (col >= columns.value.length)
    return
  active.value = { col, index: firstEnabledIndex(col) }
  focusActive()
}

function onColumnsKeydown(event: KeyboardEvent): void {
  const cols = columns.value
  const a = active.value ?? { col: 0, index: firstEnabledIndex(0) }
  const opts = cols[a.col] ?? []
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      active.value = { col: a.col, index: stepIndex(opts, a.index, 1) }
      focusActive()
      break
    case 'ArrowUp':
      event.preventDefault()
      active.value = { col: a.col, index: stepIndex(opts, a.index, -1) }
      focusActive()
      break
    case 'ArrowRight': {
      event.preventDefault()
      const opt = opts[a.index]
      if (opt && hasChildren(opt) && !opt.disabled) {
        activePath.value = [...activePath.value.slice(0, a.col), opt]
        focusColumn(a.col + 1)
      }
      break
    }
    case 'ArrowLeft': {
      event.preventDefault()
      if (a.col > 0) {
        const parent = activePath.value[a.col - 1]
        const pidx = parent ? cols[a.col - 1]!.indexOf(parent) : -1
        active.value = { col: a.col - 1, index: pidx >= 0 ? pidx : 0 }
        focusActive()
      }
      break
    }
    case 'Enter':
    case ' ': {
      event.preventDefault()
      const opt = opts[a.index]
      if (opt)
        selectOption(a.col, opt, a.index)
      break
    }
    default:
      break
  }
}

// ---------------------------------------------------------------------------
// Open/close lifecycle
// ---------------------------------------------------------------------------

function initActive(): void {
  if (activePath.value.length === 0) {
    active.value = { col: 0, index: firstEnabledIndex(0) }
    return
  }
  const col = columns.value.length - 1
  const last = activePath.value[activePath.value.length - 1]!
  const idx = columns.value[col]!.indexOf(last)
  active.value = { col, index: idx >= 0 ? idx : 0 }
}

watch(open, (isOpen) => {
  if (isOpen) {
    activePath.value = resolvePath(model.value)
    searchQuery.value = ''
    if (pendingTriggerNav.value) {
      // Opened via ArrowDown/ArrowUp on the trigger: anchor on the requested
      // edge of the root column rather than the current selection.
      const index = pendingTriggerNav.value === 'last'
        ? lastEnabledIndex(0)
        : firstEnabledIndex(0)
      active.value = { col: 0, index }
      pendingTriggerNav.value = null
    }
    else {
      initActive()
    }
    emit('open')
    focusActive()
  }
  else {
    pendingTriggerNav.value = null
    emit('close')
  }
})

/**
 * Combobox trigger keys. ArrowDown/ArrowUp open the panel and move focus onto
 * the first/last root option, mirroring the Enter/Space open path (handled
 * natively by PopoverTrigger). When the panel is already open, focus lives on a
 * column option, so {@link onColumnsKeydown} owns arrow handling instead.
 */
function handleTriggerKeydown(event: KeyboardEvent): void {
  if (resolvedDisabled.value || resolvedReadonly.value || open.value)
    return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    pendingTriggerNav.value = event.key === 'ArrowUp' ? 'last' : 'first'
    open.value = true
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}
function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() =>
  cascaderVariants({
    variant: props.variant,
    size: props.size,
    invalid: resolvedInvalid.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const showCleaner = computed(
  () => props.cleaner && hasValue.value && !resolvedDisabled.value && !resolvedReadonly.value,
)
</script>

<template>
  <div
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <PopoverRoot v-model:open="open">
      <PopoverTrigger
        as-child
        :disabled="resolvedDisabled"
      >
        <button
          :id="resolvedId"
          type="button"
          role="combobox"
          :class="styles.trigger()"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :aria-describedby="resolvedAriaDescribedby"
          :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
          :aria-required="resolvedRequired || undefined"
          :aria-expanded="open"
          :aria-controls="open ? panelId : undefined"
          aria-haspopup="listbox"
          :disabled="resolvedDisabled || undefined"
          @keydown="handleTriggerKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <slot
            name="value"
            :path="selectedPath"
            :value="model"
            :labels="displayLabels"
          >
            <span v-if="hasValue" :class="styles.valueText()">{{ displayText }}</span>
            <span v-else :class="styles.placeholder()">{{ placeholder }}</span>
          </slot>

          <span
            v-if="showCleaner"
            :class="styles.cleaner()"
            role="button"
            tabindex="-1"
            aria-label="Clear selection"
            @click.stop="handleClear"
            @keydown.enter.stop.prevent="handleClear"
            @keydown.space.stop.prevent="handleClear"
          >
            <X class="h-3.5 w-3.5" aria-hidden="true" />
          </span>

          <ChevronDown :class="styles.icon()" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          :side-offset="4"
          align="start"
          class="z-50"
        >
          <div :id="panelId" ref="panelEl" :class="styles.panel()">
            <!-- Filter (search) input -->
            <div v-if="filter" :class="styles.search()">
              <input
                type="text"
                :value="searchQuery"
                :placeholder="searchPlaceholder"
                :class="styles.searchInput()"
                role="searchbox"
                aria-label="Search paths"
                data-dz-cascader-search
                @input="searchQuery = ($event.target as HTMLInputElement).value"
              >
            </div>

            <!-- Flat results (filter mode, with a query) -->
            <div
              v-if="showFlat"
              :class="styles.flatList()"
              role="listbox"
              aria-label="Matching paths"
            >
              <button
                v-for="(entry, i) in filteredPaths"
                :key="`flat-${i}`"
                type="button"
                role="option"
                :class="styles.flatItem()"
                :disabled="entry.disabled"
                :aria-disabled="entry.disabled || undefined"
                @click="selectFlat(entry)"
              >
                {{ entry.labels.join(` ${separator} `) }}
              </button>
              <div v-if="filteredPaths.length === 0" :class="styles.empty()" data-dz-cascader-empty>
                {{ noResultsText }}
              </div>
            </div>

            <!-- Sliding columns -->
            <div
              v-else
              :class="styles.columns()"
              @keydown="onColumnsKeydown"
            >
              <ul
                v-for="(col, colIndex) in columns"
                :key="`col-${colIndex}`"
                :class="styles.column()"
                role="listbox"
                :aria-label="`Level ${colIndex + 1}`"
                data-cascader-column
              >
                <li
                  v-for="(opt, idx) in col"
                  :key="String(opt.value)"
                  role="presentation"
                >
                  <button
                    type="button"
                    role="option"
                    :data-col="colIndex"
                    :data-index="idx"
                    :class="styles.option()"
                    :aria-selected="isInPath(colIndex, opt)"
                    :aria-disabled="opt.disabled || undefined"
                    :aria-expanded="hasChildren(opt) ? isInPath(colIndex, opt) : undefined"
                    :data-selected="isInPath(colIndex, opt) || undefined"
                    :data-active="isActiveCell(colIndex, idx) || undefined"
                    :disabled="opt.disabled"
                    :tabindex="isActiveCell(colIndex, idx) ? 0 : -1"
                    @click="selectOption(colIndex, opt, idx)"
                    @mouseenter="expandTrigger === 'hover' ? expandOnHover(colIndex, opt, idx) : undefined"
                  >
                    <span :class="styles.optionLabel()">{{ opt.label }}</span>
                    <ChevronRight
                      v-if="hasChildren(opt)"
                      :class="styles.optionArrow()"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              </ul>
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
      :value="model.join(',')"
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
