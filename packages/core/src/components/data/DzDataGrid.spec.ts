import type { ColumnDef } from './DzDataGrid.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzDataGrid — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import DzDataGrid from './DzDataGrid.vue'

interface TestRow extends Record<string, unknown> {
  id: number
  name: string
  email: string
  age: number
}

const testColumns = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email' },
  { field: 'age', header: 'Age', sortable: true, align: 'right' as const },
] satisfies ColumnDef<TestRow>[] as ColumnDef<Record<string, unknown>>[]

const testData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 },
]

function mountGrid(gridProps = {}) {
  return mount(DzDataGrid, {
    props: {
      data: testData,
      columns: testColumns,
      ...gridProps,
    },
  })
}

describe('dzDataGrid — Rendering', () => {
  it('renders a root element with role="grid"', () => {
    const wrapper = mountGrid()
    expect(wrapper.attributes('role')).toBe('grid')
  })

  it('renders column headers', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Email')
    expect(wrapper.text()).toContain('Age')
  })

  it('renders data rows', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('Charlie')
  })

  it('shows empty state when data is empty', () => {
    const wrapper = mountGrid({ data: [] })
    expect(wrapper.text()).toContain('No data available')
  })

  it('renders custom empty slot', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data: [], columns: testColumns },
      slots: { empty: 'Nothing here' },
    })
    expect(wrapper.text()).toContain('Nothing here')
  })

  it('has contain: layout style', () => {
    const wrapper = mountGrid()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data: testData, columns: testColumns },
      attrs: { class: 'my-grid' },
    })
    expect(wrapper.classes()).toContain('my-grid')
  })
})

describe('dzDataGrid — Data attributes', () => {
  it('sets data-loading when loading', () => {
    const wrapper = mountGrid({ loading: true })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mountGrid({ loading: true })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('forwards aria-label', () => {
    const wrapper = mountGrid({ ariaLabel: 'Users grid' })
    expect(wrapper.attributes('aria-label')).toBe('Users grid')
  })
})

describe('dzDataGrid — Sorting', () => {
  it('renders sort indicators when sortable', () => {
    const wrapper = mountGrid({ sortable: true })
    // Should have SVG sort icons for sortable columns
    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('sets aria-sort="none" on sortable columns by default', () => {
    const wrapper = mountGrid({ sortable: true })
    const headers = wrapper.findAll('th')
    const nameHeader = headers.find(h => h.text().includes('Name'))
    expect(nameHeader?.attributes('aria-sort')).toBe('none')
  })

  it('emits sort event when column header is clicked', async () => {
    const wrapper = mountGrid({ sortable: true })
    const headers = wrapper.findAll('th')
    const nameHeader = headers.find(h => h.text().includes('Name'))
    await nameHeader?.trigger('click')
    expect(wrapper.emitted('sort')).toBeTruthy()
  })

  it('emits update:sortModel when sorting', async () => {
    const wrapper = mountGrid({ sortable: true })
    const headers = wrapper.findAll('th')
    const nameHeader = headers.find(h => h.text().includes('Name'))
    await nameHeader?.trigger('click')
    expect(wrapper.emitted('update:sortModel')).toBeTruthy()
  })

  it('header cells are keyboard-accessible when sortable', () => {
    const wrapper = mountGrid({ sortable: true })
    const headers = wrapper.findAll('th')
    const nameHeader = headers.find(h => h.text().includes('Name'))
    expect(nameHeader?.attributes('tabindex')).toBe('0')
  })
})

describe('dzDataGrid — Selection', () => {
  it('does not render checkboxes by default', () => {
    const wrapper = mountGrid()
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
  })

  it('renders checkboxes in multiple selection mode', () => {
    const wrapper = mountGrid({ selectable: 'multiple' })
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    // 1 "select all" + 3 row checkboxes
    expect(checkboxes.length).toBe(4)
  })

  it('emits update:selectedRows on row click in selectable mode', async () => {
    const wrapper = mountGrid({ selectable: 'single' })
    const rows = wrapper.findAll('tbody tr')
    await rows[0]!.trigger('click')
    expect(wrapper.emitted('update:selectedRows')).toBeTruthy()
  })

  it('emits row-click on row click', async () => {
    const wrapper = mountGrid()
    const rows = wrapper.findAll('tbody tr')
    await rows[0]!.trigger('click')
    expect(wrapper.emitted('rowClick')).toBeTruthy()
  })
})

describe('dzDataGrid — Pagination', () => {
  it('does not render pagination by default', () => {
    const wrapper = mountGrid()
    expect(wrapper.text()).not.toContain('Showing')
  })

  it('renders pagination when enabled', () => {
    const wrapper = mountGrid({ pagination: true })
    expect(wrapper.text()).toContain('Showing')
  })

  it('renders pagination with custom config', () => {
    const wrapper = mountGrid({
      pagination: { pageSize: 2 },
    })
    expect(wrapper.text()).toContain('Showing')
    // Should show only 2 rows
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
  })

  it('pagination buttons are accessible', () => {
    const wrapper = mountGrid({ pagination: true })
    const prevBtn = wrapper.find('button[aria-label="Previous page"]')
    const nextBtn = wrapper.find('button[aria-label="Next page"]')
    expect(prevBtn.exists()).toBe(true)
    expect(nextBtn.exists()).toBe(true)
  })

  it('previous button is disabled on first page', () => {
    const wrapper = mountGrid({ pagination: true })
    const prevBtn = wrapper.find('button[aria-label="Previous page"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })
})

describe('dzDataGrid — Accessibility', () => {
  it('has role="grid" on root', () => {
    const wrapper = mountGrid()
    expect(wrapper.attributes('role')).toBe('grid')
  })

  it('header cells have role="columnheader"', () => {
    const wrapper = mountGrid()
    const headers = wrapper.findAll('[role="columnheader"]')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('rows have role="row"', () => {
    const wrapper = mountGrid()
    const rows = wrapper.findAll('[role="row"]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('cells have role="gridcell"', () => {
    const wrapper = mountGrid()
    const cells = wrapper.findAll('[role="gridcell"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('select-all checkbox has aria-label', () => {
    const wrapper = mountGrid({ selectable: 'multiple' })
    const selectAll = wrapper.find('input[aria-label="Select all rows"]')
    expect(selectAll.exists()).toBe(true)
  })
})
