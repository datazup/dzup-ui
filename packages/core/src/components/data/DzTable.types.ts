/**
 * DzTable — type definitions for the compound Table family.
 *
 * DzTable is a simple semantic table wrapper with styling.
 * For advanced features (sorting, pagination, selection), use DzDataGrid.
 *
 * DzTable provides context to sub-parts via inject (ADR-08).
 *
 * @module @dzip-ui/core/components/data/DzTable
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzTable sub-parts via inject */
export interface DzTableContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** Whether rows have striped backgrounds */
  striped: Ref<boolean>
  /** Whether rows are hoverable */
  hoverable: Ref<boolean>
  /** Table density */
  density: Ref<TableDensity>
}

/** Typed injection key for DzTable context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TABLE_KEY: InjectionKey<DzTableContext> = Symbol('dz-table')

// ---------------------------------------------------------------------------
// Variant types
// ---------------------------------------------------------------------------

/** Table density options */
export type TableDensity = 'compact' | 'default' | 'comfortable'

/** Visual variants for the DzTable component */
export type TableVariant = 'default' | 'bordered' | 'striped'

// ---------------------------------------------------------------------------
// DzTable Props
// ---------------------------------------------------------------------------

/** Props for the DzTable root component */
export interface DzTableProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: TableVariant
  /** Whether rows have striped backgrounds */
  striped?: boolean
  /** Whether rows are hoverable */
  hoverable?: boolean
  /** Table density */
  density?: TableDensity
  /** Loading state */
  loading?: boolean
}

// ---------------------------------------------------------------------------
// DzTable Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTable */
export interface DzTableSlots {
  /** Table header, body, and footer sub-parts */
  default: () => unknown
  /** Caption for the table */
  caption?: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableHeader Props
// ---------------------------------------------------------------------------

/** Props for the DzTableHeader component */
export interface DzTableHeaderProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzTableHeader */
export interface DzTableHeaderSlots {
  /** Table header rows */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableBody Props
// ---------------------------------------------------------------------------

/** Props for the DzTableBody component */
export interface DzTableBodyProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzTableBody */
export interface DzTableBodySlots {
  /** Table body rows */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableRow Props
// ---------------------------------------------------------------------------

/** Props for the DzTableRow component */
export interface DzTableRowProps {
  /** Whether this row is currently selected */
  selected?: boolean
}

/** Slot definitions for DzTableRow */
export interface DzTableRowSlots {
  /** Table cells */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableCell Props
// ---------------------------------------------------------------------------

/** Props for the DzTableCell component */
export interface DzTableCellProps {
  /** Whether this cell is a header cell (<th> vs <td>) */
  header?: boolean
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Column span */
  colspan?: number
  /** Row span */
  rowspan?: number
}

/** Slot definitions for DzTableCell */
export interface DzTableCellSlots {
  /** Cell content */
  default: () => unknown
}
