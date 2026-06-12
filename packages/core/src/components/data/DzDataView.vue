<script setup lang="ts" generic="T extends Record<string, unknown>">
import type {
  DataViewLayout,
  DataViewSortOrder,
  DzDataViewEmits,
  DzDataViewProps,
  DzDataViewSlots,
} from './DzDataView.types.ts'
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzEmpty from '../feedback/DzEmpty.vue'
import DzSkeleton from '../feedback/DzSkeleton.vue'
import DzGrid from '../layout/DzGrid.vue'
import DzPagination from '../navigation/DzPagination.vue'
import DzSegmented from '../navigation/DzSegmented.vue'
import { dataViewVariants } from './DzDataView.variants.ts'

/**
 * DzDataView — list/grid switchable collection renderer.
 *
 * Pure presentation over `items` (no fetching): renders each record through
 * the `#item` slot as a vertical list row or a card in a responsive grid, with
 * an optional segmented layout toggle, built-in client-side sorting, and
 * paging via DzPagination. Loading shows DzSkeleton placeholders; an empty
 * collection shows DzEmpty.
 *
 * Layout / paging offset / sort state are exposed via defineModel (ADR-16):
 * `v-model:layout`, `v-model:first`, `v-model:sortField`, `v-model:sortOrder`.
 *
 * @example
 * ```vue
 * <DzDataView :items="products" data-key="id" layout-toggle paginator :rows="8">
 *   <template #item="{ item, layout }">
 *     <ProductCard :product="item" :compact="layout === 'list'" />
 *   </template>
 * </DzDataView>
 * ```
 */
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzDataViewProps<T>>(), {
  items: () => [],
  dataKey: undefined,
  layoutToggle: false,
  cols: () => ({ sm: 1, md: 2, lg: 3 }),
  gap: 'md',
  paginator: false,
  rows: 12,
  sortOptions: () => [],
  loading: false,
  loadingRows: 6,
  emptyTitle: 'No items',
  emptyDescription: undefined,
  size: 'md',
  disabled: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzDataViewEmits>()
defineSlots<DzDataViewSlots<T>>()

const layout = defineModel<DataViewLayout>('layout', { default: 'list' })
const first = defineModel<number>('first', { default: 0 })
const sortField = defineModel<string>('sortField', { default: '' })
const sortOrder = defineModel<DataViewSortOrder>('sortOrder', { default: 1 })

const attrs = useAttrs()

const styles = computed(() => dataViewVariants({ size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

// ---------------------------------------------------------------------------
// Layout toggle
// ---------------------------------------------------------------------------

const layoutItems = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
]

// ---------------------------------------------------------------------------
// Sorting (client-side, stable copy)
// ---------------------------------------------------------------------------

/** Resolve a possibly dot-pathed field value from a record */
function fieldValue(item: unknown, field: string): unknown {
  if (item == null || typeof item !== 'object')
    return undefined
  if (!field.includes('.'))
    return (item as Record<string, unknown>)[field]
  return field.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object')
      return (acc as Record<string, unknown>)[key]
    return undefined
  }, item)
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null)
    return 0
  if (a == null)
    return -1
  if (b == null)
    return 1
  if (typeof a === 'number' && typeof b === 'number')
    return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

const sortedItems = computed<T[]>(() => {
  const list = props.items ?? []
  const field = sortField.value
  const order = sortOrder.value
  if (!field || order === 0)
    return list
  return [...list].sort((a, b) => compare(fieldValue(a, field), fieldValue(b, field)) * order)
})

const total = computed(() => sortedItems.value.length)

// ---------------------------------------------------------------------------
// Paging
// ---------------------------------------------------------------------------

/** First-record offset of the rendered window (0 when not paginated) */
const pageOffset = computed(() => (props.paginator ? first.value : 0))

const pagedItems = computed<T[]>(() => {
  if (!props.paginator)
    return sortedItems.value
  return sortedItems.value.slice(first.value, first.value + props.rows)
})

/** 1-based page number for DzPagination */
const currentPage = computed(() => Math.floor(first.value / props.rows) + 1)

/** Whether the paginator should be shown (more than one page of records) */
const showPaginator = computed(() => props.paginator && total.value > props.rows)

function onPageChange(page: number): void {
  const offset = (page - 1) * props.rows
  first.value = offset
  emit('page', offset)
}

// ---------------------------------------------------------------------------
// Sort control
// ---------------------------------------------------------------------------

function setSort(field: string, order: DataViewSortOrder = 1): void {
  sortField.value = field
  sortOrder.value = order
  // A new sort invalidates the current page window.
  if (props.paginator && first.value !== 0) {
    first.value = 0
    emit('page', 0)
  }
  emit('sort', { sortField: field, sortOrder: order })
}

/** Index of the active option in `sortOptions` (or '' when none matches) */
const activeSortIndex = computed<string>(() => {
  const idx = props.sortOptions.findIndex(
    o => o.field === sortField.value && (o.order ?? 1) === sortOrder.value,
  )
  return idx === -1 ? '' : String(idx)
})

function onSortSelect(event: Event): void {
  const raw = (event.target as HTMLSelectElement).value
  if (raw === '') {
    setSort('', 0)
    return
  }
  const option = props.sortOptions[Number(raw)]
  if (option)
    setSort(option.field, option.order ?? 1)
}

// ---------------------------------------------------------------------------
// Keys + announcements
// ---------------------------------------------------------------------------

function itemKey(item: T, index: number): string {
  if (props.dataKey) {
    const v = fieldValue(item, props.dataKey)
    if (v != null)
      return String(v)
  }
  return `dz-data-view-${pageOffset.value + index}`
}

/** Live-region text announcing the rendered window */
const announcement = computed(() => {
  if (props.loading)
    return 'Loading items'
  if (total.value === 0)
    return props.emptyTitle
  if (!props.paginator)
    return `Showing ${total.value} item${total.value === 1 ? '' : 's'}`
  const start = pageOffset.value + 1
  const end = Math.min(pageOffset.value + props.rows, total.value)
  return `Showing ${start} to ${end} of ${total.value} items`
})
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-size="size"
    :data-layout="layout"
    :data-disabled="disabled ? '' : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Live region: announces the rendered window on page/sort/layout change -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>

    <!-- Toolbar: leading content + sort control + layout toggle -->
    <div
      v-if="$slots.header || $slots.sort || sortOptions.length > 0 || layoutToggle"
      :class="styles.toolbar()"
    >
      <div :class="styles.toolbarStart()">
        <slot name="header" />
      </div>

      <div :class="styles.toolbarEnd()">
        <!-- Sort control -->
        <slot
          name="sort"
          :sort-field="sortField"
          :sort-order="sortOrder"
          :set-sort="setSort"
        >
          <select
            v-if="sortOptions.length > 0"
            :class="styles.sortSelect()"
            :disabled="disabled"
            :value="activeSortIndex"
            aria-label="Sort by"
            @change="onSortSelect"
          >
            <option value="">
              Unsorted
            </option>
            <option
              v-for="(option, index) in sortOptions"
              :key="`${option.field}-${option.order ?? 1}`"
              :value="String(index)"
            >
              {{ option.label }}
            </option>
          </select>
        </slot>

        <!-- Layout toggle -->
        <DzSegmented
          v-if="layoutToggle"
          v-model="layout"
          :items="layoutItems"
          :size="size"
          :disabled="disabled"
          aria-label="View layout"
        />
      </div>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <slot name="loading">
        <DzGrid
          v-if="layout === 'grid'"
          :cols="cols"
          :gap="gap"
          aria-hidden="true"
        >
          <DzSkeleton
            v-for="n in loadingRows"
            :key="`skeleton-${n}`"
            variant="rectangular"
            height="8rem"
            :class="styles.skeleton()"
          />
        </DzGrid>
        <div v-else class="flex flex-col gap-[var(--dz-spacing-2)]" aria-hidden="true">
          <DzSkeleton
            v-for="n in loadingRows"
            :key="`skeleton-${n}`"
            variant="rectangular"
            height="3rem"
            :class="styles.skeleton()"
          />
        </div>
      </slot>
    </template>

    <!-- Empty -->
    <template v-else-if="total === 0">
      <slot name="empty">
        <DzEmpty :title="emptyTitle" :description="emptyDescription" />
      </slot>
    </template>

    <!-- Grid layout -->
    <DzGrid
      v-else-if="layout === 'grid'"
      :cols="cols"
      :gap="gap"
      role="list"
    >
      <div
        v-for="(item, index) in pagedItems"
        :key="itemKey(item, index)"
        role="listitem"
        :class="styles.gridCell()"
      >
        <slot name="item" :item="item" :index="pageOffset + index" :layout="layout" />
      </div>
    </DzGrid>

    <!-- List layout -->
    <ul v-else role="list" :class="styles.list()">
      <li
        v-for="(item, index) in pagedItems"
        :key="itemKey(item, index)"
        role="listitem"
        :class="styles.listItem()"
      >
        <slot name="item" :item="item" :index="pageOffset + index" :layout="layout" />
      </li>
    </ul>

    <!-- Footer + paginator -->
    <div v-if="$slots.footer || showPaginator" :class="styles.footer()">
      <slot name="footer" />
      <DzPagination
        v-if="showPaginator"
        :model-value="currentPage"
        :total="total"
        :page-size="rows"
        :size="size"
        :disabled="disabled"
        class="ml-auto"
        @update:model-value="onPageChange"
      />
    </div>
  </div>
</template>
