<script setup lang="ts">
import type { DzTableRowProps, DzTableRowSlots } from './DzTable.types.ts'
/**
 * DzTableRow — Table row (<tr>).
 *
 * Child of DzTable compound component. Inherits context via inject.
 *
 * When `expandable` is set, the row renders a leading toggle cell (chevron
 * icon) and, when expanded, a sibling detail row (`<tr class="expand-row">`)
 * whose full-width cell hosts the `#expand` slot. Expanded state is tracked in
 * DzTableContext (`expandedRows`) and toggled via `toggleExpand`; DzTable emits
 * `row-expand`/`row-collapse` accordingly.
 */
import { ChevronRight } from 'lucide-vue-next'
import { computed, inject, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzIcon from '../media/DzIcon.vue'
import { DZ_TABLE_KEY } from './DzTable.types.ts'
import { tableVariants } from './DzTable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTableRowProps>(), {
  selected: false,
  expandable: false,
  rowId: undefined,
})

defineSlots<DzTableRowSlots>()

const attrs = useAttrs()
const tableContext = inject(DZ_TABLE_KEY, null)

const generatedId = useId()
/** Stable id used to track this row's expanded state. */
const resolvedRowId = computed(() => props.rowId ?? generatedId)

const isExpanded = computed(
  () => tableContext?.expandedRows.value.has(resolvedRowId.value) ?? false,
)

function onToggle(): void {
  tableContext?.toggleExpand(resolvedRowId.value)
}

const styles = computed(() =>
  tableVariants({
    variant: 'default',
    size: tableContext?.size.value ?? 'md',
    density: tableContext?.density.value ?? 'default',
    hoverable: tableContext?.hoverable.value ?? false,
  }),
)

const classes = computed(() =>
  cn(
    styles.value.row(),
    props.selected ? 'bg-[var(--dz-primary-muted)]' : '',
    attrs.class as string | undefined,
  ),
)

const toggleClasses = computed(() =>
  cn(styles.value.expandToggle(), isExpanded.value ? 'rotate-90' : ''),
)

const expandRowClasses = computed(() => styles.value.expandRow())
</script>

<template>
  <tr
    :class="classes"
    :aria-selected="selected || undefined"
    :data-state="selected ? 'selected' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <td v-if="expandable" class="w-[1%] whitespace-nowrap">
      <button
        type="button"
        :class="toggleClasses"
        :aria-expanded="isExpanded"
        :aria-controls="`${resolvedRowId}-expand`"
        :aria-label="isExpanded ? 'Collapse row' : 'Expand row'"
        @click="onToggle"
      >
        <DzIcon :icon="ChevronRight" size="sm" />
      </button>
    </td>
    <slot />
  </tr>
  <tr
    v-if="expandable && isExpanded"
    :id="`${resolvedRowId}-expand`"
    class="expand-row"
    :class="expandRowClasses"
    data-state="expanded"
  >
    <td colspan="1000">
      <slot name="expand" />
    </td>
  </tr>
</template>
