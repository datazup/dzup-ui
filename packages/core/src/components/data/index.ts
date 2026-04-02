/**
 * Data family — public exports.
 *
 * @module @dzup-ui/core/components/data
 */

export type {
  AccordionVariant,
  DzAccordionContentProps,
  DzAccordionContentSlots,
  DzAccordionContext,
  DzAccordionEmits,
  DzAccordionItemProps,
  DzAccordionItemSlots,
  DzAccordionMultipleProps,
  DzAccordionProps,
  DzAccordionSingleProps,
  DzAccordionSlots,
  DzAccordionTriggerProps,
  DzAccordionTriggerSlots,
} from './DzAccordion.types.ts'
export { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
export { type AccordionVariantProps, accordionVariants } from './DzAccordion.variants.ts'

// ── DzAccordion (Reka UI) ──
export { default as DzAccordion } from './DzAccordion.vue'
export { default as DzAccordionContent } from './DzAccordionContent.vue'
export { default as DzAccordionItem } from './DzAccordionItem.vue'

export { default as DzAccordionTrigger } from './DzAccordionTrigger.vue'
export type { DzChipEmits, DzChipProps, DzChipSlots } from './DzChip.types.ts'
export { type ChipVariantProps, chipVariants } from './DzChip.variants.ts'
// ── DzChip ──
export { default as DzChip } from './DzChip.vue'
export type {
  ColumnDef,
  DzDataGridBodyProps,
  DzDataGridBodySlots,
  DzDataGridCellProps,
  DzDataGridCellSlots,
  DzDataGridContext,
  DzDataGridEmits,
  DzDataGridFilter,
  DzDataGridHeaderProps,
  DzDataGridHeaderSlots,
  DzDataGridPaginationEmits,
  DzDataGridPaginationProps,
  DzDataGridPaginationSlots,
  DzDataGridProps,
  DzDataGridRowProps,
  DzDataGridRowSlots,
  DzDataGridSlots,
  FilterOperator,
  FilterType,
  GridDensity,
  PaginationConfig,
  SortDirection,
  SortModel,
} from './DzDataGrid.types.ts'

export { DZ_DATA_GRID_KEY } from './DzDataGrid.types.ts'
export { type DataGridVariantProps, dataGridVariants } from './DzDataGrid.variants.ts'
// ── DzDataGrid ──
export { default as DzDataGrid } from './DzDataGrid.vue'
export { default as DzDataGridBody } from './DzDataGridBody.vue'
export { default as DzDataGridHeader } from './DzDataGridHeader.vue'

export { default as DzDataGridPagination } from './DzDataGridPagination.vue'
export type {
  DzListContext,
  DzListEmits,
  DzListItemEmits,
  DzListItemProps,
  DzListItemSlots,
  DzListProps,
  DzListSlots,
  ListVariant,
} from './DzList.types.ts'
export { DZ_LIST_KEY } from './DzList.types.ts'
export { type ListVariantProps, listVariants } from './DzList.variants.ts'
// ── DzList ──
export { default as DzList } from './DzList.vue'
export { default as DzListItem } from './DzListItem.vue'
export type {
  DzTableBodyProps,
  DzTableBodySlots,
  DzTableCellProps,
  DzTableCellSlots,
  DzTableContext,
  DzTableHeaderProps,
  DzTableHeaderSlots,
  DzTableProps,
  DzTableRowProps,
  DzTableRowSlots,
  DzTableSlots,
  TableDensity,
  TableVariant,
} from './DzTable.types.ts'
export { DZ_TABLE_KEY } from './DzTable.types.ts'

export { type TableVariantProps, tableVariants } from './DzTable.variants.ts'
// ── DzTable ──
export { default as DzTable } from './DzTable.vue'
export { default as DzTableBody } from './DzTableBody.vue'
export { default as DzTableCell } from './DzTableCell.vue'
export { default as DzTableHeader } from './DzTableHeader.vue'
export { default as DzTableRow } from './DzTableRow.vue'
export type { DzTagEmits, DzTagProps, DzTagSlots } from './DzTag.types.ts'

export { type TagVariantProps, tagVariants } from './DzTag.variants.ts'
// ── DzTag ──
export { default as DzTag } from './DzTag.vue'
export type {
  DzTimelineContext,
  DzTimelineItemProps,
  DzTimelineItemSlots,
  DzTimelineProps,
  DzTimelineSlots,
} from './DzTimeline.types.ts'
export { DZ_TIMELINE_KEY } from './DzTimeline.types.ts'
export { type TimelineVariantProps, timelineVariants } from './DzTimeline.variants.ts'
// ── DzTimeline ──
export { default as DzTimeline } from './DzTimeline.vue'
export { default as DzTimelineItem } from './DzTimelineItem.vue'

export type {
  DzTreeContext,
  DzTreeEmits,
  DzTreeItemProps,
  DzTreeItemSlots,
  DzTreeProps,
  DzTreeSlots,
  TreeNode,
} from './DzTree.types.ts'
export { DZ_TREE_KEY } from './DzTree.types.ts'

export { type TreeVariantProps, treeVariants } from './DzTree.variants.ts'

// ── DzTree ──
export { default as DzTree } from './DzTree.vue'
export { default as DzTreeItem } from './DzTreeItem.vue'
