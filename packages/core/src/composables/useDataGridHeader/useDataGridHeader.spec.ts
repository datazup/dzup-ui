/**
 * useDataGridHeader — header logic against a minimal DzDataGrid context
 * double (UI-DZUP-UI-CODE-M-02).
 */
import type { ColumnDef, DzDataGridContext, DzDataGridFilter } from '../../components/data/DzDataGrid.types.ts'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useDataGridHeader } from './useDataGridHeader.ts'

type Col = ColumnDef<Record<string, unknown>>

function makeCtx() {
  const filters = ref<DzDataGridFilter[]>([])
  const ctx = {
    filterable: ref(true),
    filters,
    sort: vi.fn(),
    setFilter: vi.fn((column: string, filter: DzDataGridFilter) => {
      filters.value = [...filters.value.filter(f => f.column !== column), filter]
    }),
    clearFilter: vi.fn((column: string) => {
      filters.value = filters.value.filter(f => f.column !== column)
    }),
  }
  return { ctx, header: useDataGridHeader({ ctx: ctx as unknown as DzDataGridContext }) }
}

const event = () => ({ stopPropagation: vi.fn() }) as unknown as Event

describe('useDataGridHeader', () => {
  it('opens, switches and closes the filter popover', () => {
    const { header } = makeCtx()
    header.toggleFilterPopover(event(), 'name')
    expect(header.openFilterField.value).toBe('name')
    header.toggleFilterPopover(event(), 'age')
    expect(header.openFilterField.value).toBe('age')
    header.toggleFilterPopover(event(), 'age')
    expect(header.openFilterField.value).toBeNull()

    header.toggleFilterPopover(event(), 'name')
    header.handleFilterKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(header.openFilterField.value).toBeNull()
  })

  it('applies text, number and select filters with the right operator', () => {
    const { ctx, header } = makeCtx()
    header.handleFilterInput('name', 'ada', { field: 'name' } as Col)
    expect(ctx.setFilter).toHaveBeenLastCalledWith('name', { column: 'name', value: 'ada', operator: 'contains' })

    header.handleFilterInput('age', '42', { field: 'age', filterType: 'number' } as Col)
    expect(ctx.setFilter).toHaveBeenLastCalledWith('age', { column: 'age', value: 42, operator: 'contains' })
    header.handleOperatorChange('age', 'gt')
    expect(header.getFilterOperator('age')).toBe('gt')
    expect(header.getFilterValue('age')).toBe(42)

    header.handleFilterInput('role', 'admin', { field: 'role', filterType: 'select' } as Col)
    expect(header.getFilterOperator('role')).toBe('equals')
    expect(header.hasActiveFilter('role')).toBe(true)
  })

  it('clears a filter on empty input and on the clear action', () => {
    const { ctx, header } = makeCtx()
    header.handleFilterInput('name', 'ada', { field: 'name' } as Col)
    header.handleFilterInput('name', '', { field: 'name' } as Col)
    expect(ctx.clearFilter).toHaveBeenCalledWith('name')
    expect(header.hasActiveFilter('name')).toBe(false)

    header.handleFilterInput('name', 'ada', { field: 'name' } as Col)
    const e = event()
    header.handleClearFilter(e, 'name')
    expect(e.stopPropagation).toHaveBeenCalled()
    expect(header.hasActiveFilter('name')).toBe(false)
    expect(header.getFilterValue('name')).toBe('')
  })

  it('ignores an operator change when the column has no value', () => {
    const { ctx, header } = makeCtx()
    header.handleOperatorChange('age', 'lt')
    expect(ctx.setFilter).not.toHaveBeenCalled()
  })

  it('forwards shift for multi-sort from click and Enter/Space', () => {
    const { ctx, header } = makeCtx()
    header.handleHeaderClick(new MouseEvent('click', { shiftKey: true }), 'name')
    expect(ctx.sort).toHaveBeenLastCalledWith('name', true)
    header.handleHeaderKeyDown(new KeyboardEvent('keydown', { key: ' ' }), 'age')
    expect(ctx.sort).toHaveBeenLastCalledWith('age', false)
    header.handleHeaderKeyDown(new KeyboardEvent('keydown', { key: 'a' }), 'age')
    expect(ctx.sort).toHaveBeenCalledTimes(2)
  })

  it('resolves filterability, alignment and width style', () => {
    const { ctx, header } = makeCtx()
    expect(header.isColumnFilterable({ field: 'a' } as Col)).toBe(true)
    expect(header.isColumnFilterable({ field: 'a', filterable: false } as Col)).toBe(false)
    ctx.filterable.value = false
    expect(header.isColumnFilterable({ field: 'a' } as Col)).toBe(false)

    expect(header.getAlignClass('right')).toBe('text-right')
    expect(header.getAlignClass()).toBe('text-left')
    expect(header.getColumnStyle({ field: 'a', width: 120 } as Col)).toBe('width: 120px; min-width: 120px')
    expect(header.getColumnStyle({ field: 'a' } as Col)).toBeUndefined()
  })
})
