import type { ColumnDef } from './DzDataGrid.types.ts'
import { DZ_DIRECTION_KEY } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
/**
 * DzDataGrid — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import DzDataGrid from './DzDataGrid.vue'

interface TestRow extends Record<string, unknown> {
  id: number
  name: string
  email: string
  age: number
  status?: string
}

const testColumns = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email' },
  { field: 'age', header: 'Age', sortable: true, align: 'right' as const },
] satisfies ColumnDef<TestRow>[] as ColumnDef<Record<string, unknown>>[]

const filterableColumns = [
  { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' as const },
  { field: 'email', header: 'Email', filterable: true },
  { field: 'age', header: 'Age', sortable: true, filterable: true, filterType: 'number' as const, align: 'right' as const },
  { field: 'status', header: 'Status', filterable: true, filterType: 'select' as const, filterOptions: ['active', 'inactive'] },
] satisfies ColumnDef<TestRow>[] as ColumnDef<Record<string, unknown>>[]

const testData: TestRow[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 30, status: 'active' },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 25, status: 'inactive' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35, status: 'active' },
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
  it('renders a root region and an inner grid table', () => {
    const wrapper = mountGrid()
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
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
    // DzCheckbox renders as button[role="checkbox"] (Reka UI CheckboxRoot)
    expect(wrapper.findAll('button[role="checkbox"]')).toHaveLength(0)
  })

  it('renders checkboxes in multiple selection mode', () => {
    const wrapper = mountGrid({ selectable: 'multiple' })
    // DzCheckbox renders as button[role="checkbox"] (Reka UI CheckboxRoot)
    const checkboxes = wrapper.findAll('button[role="checkbox"]')
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

describe('dzDataGrid — Filtering', () => {
  it('does not render filter icons when filterable=false (default)', () => {
    const wrapper = mountGrid()
    expect(wrapper.findAll('[data-testid="filter-trigger"]')).toHaveLength(0)
  })

  it('renders filter icons when filterable=true on columns', () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const triggers = wrapper.findAll('[data-testid="filter-trigger"]')
    expect(triggers.length).toBeGreaterThan(0)
  })

  it('opens filter popover when filter icon is clicked', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    expect(wrapper.find('[data-testid="filter-popover"]').exists()).toBe(true)
  })

  it('renders text input for text filter type', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    expect(wrapper.find('[data-testid="filter-text-input"]').exists()).toBe(true)
  })

  it('text filtering filters rows (case-insensitive)', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    // After filtering, only Alice should be visible
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('emits update:filters when filter is applied', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    expect(wrapper.emitted('update:filters')).toBeTruthy()
  })

  it('emits filter event when filter is applied', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    expect(wrapper.emitted('filter')).toBeTruthy()
  })

  it('shows active filter indicator', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    // The trigger button should now have data-active attribute
    const updatedTrigger = wrapper.find('[data-testid="filter-trigger"][data-active]')
    expect(updatedTrigger.exists()).toBe(true)
  })

  it('shows clear filter button when filter is active', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    expect(wrapper.find('[data-testid="filter-clear-button"]').exists()).toBe(true)
  })

  it('clear filter button restores all rows', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('alice')
    expect(wrapper.text()).not.toContain('Bob')

    const clearBtn = wrapper.find('[data-testid="filter-clear-button"]')
    await clearBtn.trigger('click')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).toContain('Alice')
  })

  it('filter composes with sorting', async () => {
    const wrapper = mountGrid({ columns: filterableColumns, filterable: true, sortable: true })
    // Apply filter first
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    // DzInput wraps native <input> — target the inner input for setValue
    const input = wrapper.find('[data-testid="filter-text-input"] input')
    await input.setValue('a')
    // Then sort
    const nameHeader = wrapper.findAll('th').find(h => h.text().includes('Name'))
    await nameHeader?.trigger('click')
    expect(wrapper.emitted('sort')).toBeTruthy()
  })

  it('filter composes with pagination', async () => {
    const wrapper = mountGrid({
      columns: filterableColumns,
      filterable: true,
      pagination: { pageSize: 2 },
    })
    // Initially should show pagination
    expect(wrapper.text()).toContain('Showing')
  })
})

describe('dzDataGrid — Accessibility', () => {
  it('has role="region" on root and role="grid" on the table', () => {
    const wrapper = mountGrid()
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
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
    // DzCheckbox renders as button[role="checkbox"] (Reka UI CheckboxRoot)
    const selectAll = wrapper.find('button[aria-label="Select all rows"]')
    expect(selectAll.exists()).toBe(true)
  })
})

/**
 * APG `grid` cell navigation — `D-RES14-1`, implemented by RESIDUAL-15.
 *
 * Every test below **drives the key and asserts where focus landed**, never that a
 * handler exists: RESIDUAL-12's reading of `DzChip` is the reason, and these six
 * rows are the ones RESIDUAL-14 §2.2.4 found published against
 * `reka-ui/dist/RovingFocus/utils.js` reached through a row-selection checkbox.
 *
 * `attachTo: document.body` throughout, because `HTMLElement.focus()` on a detached
 * node leaves `document.activeElement` at `<body>` and every assertion here would
 * pass for the wrong reason.
 */
describe('dzDataGrid — APG grid cell navigation', () => {
  function mountNav(gridProps = {}) {
    const wrapper = mount(DzDataGrid, {
      props: { data: testData, columns: testColumns, ...gridProps },
      attachTo: document.body,
    })
    const table = wrapper.get('[role="grid"]').element as HTMLTableElement
    return { wrapper, table }
  }

  /** Press a key on a cell and settle. Returns the event so consumption can be read. */
  function press(cell: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    ;(cell as HTMLElement).focus()
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
    cell.dispatchEvent(event)
    return event
  }

  it('gives the body exactly one tab stop and puts every other cell at -1', () => {
    const { wrapper, table } = mountNav()
    const bodyCells = [...table.tBodies[0]!.querySelectorAll('td')]

    expect(bodyCells).toHaveLength(9) // 3 rows x 3 columns
    expect(bodyCells.filter(c => c.getAttribute('tabindex') === '0')).toHaveLength(1)
    expect(bodyCells[0]!.getAttribute('tabindex')).toBe('0')

    // Without `sortable`, no header cell was in the tab order before this change
    // and none is now: `tabindex="-1"` adds reachability, not a tab stop.
    expect([...table.tHead!.querySelectorAll('th')].map(c => c.getAttribute('tabindex')))
      .toEqual(['-1', '-1', '-1'])

    wrapper.unmount()
  })

  it('keeps the per-column header tab stops a sortable grid already published', () => {
    const { wrapper, table } = mountNav({ sortable: true })

    // Every sortable column stays at 0 — the published behaviour
    // `DzDataGrid.contract.spec.ts:136`/`:158` and `DzDataGrid.spec.ts:146` assert,
    // and the reason the strict single-tab-stop grid was rejected. With grid-level
    // `sortable` the predicate is `col.sortable !== false`, so all three are in.
    expect([...table.tHead!.querySelectorAll('th')].map(c => c.getAttribute('tabindex')))
      .toEqual(['0', '0', '0'])

    // A column that opts out is reachable by arrow and out of the tab order,
    // which is the pair `tabindex="-1"` buys: it adds no tab stop.
    const optOut = mount(DzDataGrid, {
      props: {
        data: testData,
        sortable: true,
        columns: [
          { field: 'name', header: 'Name' },
          { field: 'email', header: 'Email', sortable: false },
        ] as ColumnDef<Record<string, unknown>>[],
      },
      attachTo: document.body,
    })
    const optOutTable = optOut.get('[role="grid"]').element as HTMLTableElement
    expect([...optOutTable.tHead!.querySelectorAll('th')].map(c => c.getAttribute('tabindex')))
      .toEqual(['0', '-1'])

    press(optOutTable.tHead!.rows[0]!.cells[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(optOutTable.tHead!.rows[0]!.cells[1])

    optOut.unmount()
    wrapper.unmount()
  })

  it('moves focus one cell along the inline axis with ArrowRight and ArrowLeft', () => {
    const { wrapper, table } = mountNav()
    const row = table.tBodies[0]!.rows[1]!

    expect(press(row.cells[0]!, 'ArrowRight').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(row.cells[1])

    expect(press(row.cells[1]!, 'ArrowLeft').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(row.cells[0])

    wrapper.unmount()
  })

  it('mirrors the inline pair in a RTL document, which is what rtl: mirrored declares', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data: testData, columns: testColumns },
      attachTo: document.body,
      global: { provide: { [DZ_DIRECTION_KEY]: ref('rtl') } },
    })
    const table = wrapper.get('[role="grid"]').element as HTMLTableElement
    const row = table.tBodies[0]!.rows[1]!

    // `ArrowRight` is the inline END, which in a RTL document is the PREVIOUS
    // column. The anatomy marks both rows `rtl: 'mirrored'` and declares
    // `rtl.keyboard: 'swap-horizontal'`; this is that, measured.
    press(row.cells[1]!, 'ArrowRight')
    expect(document.activeElement).toBe(row.cells[0])

    press(row.cells[0]!, 'ArrowLeft')
    expect(document.activeElement).toBe(row.cells[1])

    // The block axis does not mirror.
    press(table.tBodies[0]!.rows[0]!.cells[1]!, 'ArrowDown')
    expect(document.activeElement).toBe(table.tBodies[0]!.rows[1]!.cells[1])

    wrapper.unmount()
  })

  it('moves focus between rows with ArrowDown and ArrowUp, and reaches the header', () => {
    const { wrapper, table } = mountNav()
    const rows = table.rows // 0 = header, 1..3 = body

    expect(press(rows[1]!.cells[1]!, 'ArrowDown').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(rows[2]!.cells[1])

    press(rows[2]!.cells[1]!, 'ArrowUp')
    expect(document.activeElement).toBe(rows[1]!.cells[1])

    // One more up is the header row — the only reading of "move focus one row up"
    // from the first body row, and the reason a non-sortable `<th>` now carries
    // `tabindex="-1"`.
    press(rows[1]!.cells[1]!, 'ArrowUp')
    expect(document.activeElement).toBe(rows[0]!.cells[1])
    expect((document.activeElement as HTMLElement).getAttribute('role')).toBe('columnheader')

    wrapper.unmount()
  })

  it('jumps to the first and last cell of the row with Home and End', () => {
    const { wrapper, table } = mountNav()
    const row = table.tBodies[0]!.rows[0]!

    press(row.cells[1]!, 'End')
    expect(document.activeElement).toBe(row.cells[2])

    press(row.cells[2]!, 'Home')
    expect(document.activeElement).toBe(row.cells[0])

    wrapper.unmount()
  })

  it('pages by ten rows and clamps, which is what the page rows say', () => {
    const { wrapper, table } = mountNav()
    const rows = table.rows

    // Three body rows, so a ten-row page lands on the last one rather than
    // past it. Clamping is the assertion: no wrap, and no focus lost.
    press(rows[1]!.cells[0]!, 'PageDown')
    expect(document.activeElement).toBe(rows[3]!.cells[0])

    press(rows[3]!.cells[0]!, 'PageUp')
    expect(document.activeElement).toBe(rows[0]!.cells[0])

    wrapper.unmount()
  })

  it('stops at the edges rather than wrapping, and still consumes the key', () => {
    const { wrapper, table } = mountNav()
    const rows = table.rows
    const lastRow = rows[rows.length - 1]!

    // Right edge.
    const right = press(lastRow.cells[2]!, 'ArrowRight')
    expect(right.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(lastRow.cells[2])

    // Bottom edge.
    press(lastRow.cells[2]!, 'ArrowDown')
    expect(document.activeElement).toBe(lastRow.cells[2])

    // Top edge is the header, not the last row.
    press(rows[0]!.cells[0]!, 'ArrowUp')
    expect(document.activeElement).toBe(rows[0]!.cells[0])

    wrapper.unmount()
  })

  it('moves the body tab stop with the user, so leaving and returning lands where they were', async () => {
    const { wrapper, table } = mountNav()
    const body = table.tBodies[0]!

    press(body.rows[0]!.cells[0]!, 'ArrowDown')
    press(body.rows[1]!.cells[0]!, 'ArrowRight')
    await wrapper.vm.$nextTick()

    const inOrder = [...body.querySelectorAll('td')].filter(c => c.getAttribute('tabindex') === '0')
    expect(inOrder).toHaveLength(1)
    expect(inOrder[0]).toBe(body.rows[1]!.cells[1])

    wrapper.unmount()
  })

  it('counts the selection cell as column 0, so the grid keeps one tab stop with selection on', async () => {
    const { wrapper, table } = mountNav({ selectable: 'multiple' })
    const body = table.tBodies[0]!

    expect(body.rows[0]!.cells).toHaveLength(4) // selection + 3 columns
    expect([...body.querySelectorAll('td')].filter(c => c.getAttribute('tabindex') === '0')).toHaveLength(1)

    press(body.rows[0]!.cells[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(body.rows[0]!.cells[1])
    await wrapper.vm.$nextTick()

    const inOrder = [...body.querySelectorAll('td')].filter(c => c.getAttribute('tabindex') === '0')
    expect(inOrder).toHaveLength(1)
    expect(inOrder[0]).toBe(body.rows[0]!.cells[1])

    wrapper.unmount()
  })

  it('leaves a control inside a cell its own keys', () => {
    const { wrapper, table } = mountNav({ selectable: 'multiple' })
    const checkbox = table.tBodies[0]!.rows[0]!.cells[0]!.querySelector('button[role="checkbox"]')!

    // The key arrives at the checkbox, bubbles to the cell, and the grid declines
    // it: `event.target !== event.currentTarget`. A grid that stole ArrowRight from
    // every control in every cell would be the defect this guard prevents.
    ;(checkbox as HTMLElement).focus()
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    checkbox.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(checkbox)

    wrapper.unmount()
  })

  it('still sorts on Enter and Space, and Shift+Enter still appends', () => {
    const { wrapper, table } = mountNav({ sortable: true })
    const sortable = table.tHead!.rows[0]!.cells[0]!

    press(sortable, 'Enter')
    expect(wrapper.emitted('update:sortModel')).toBeTruthy()

    press(table.tHead!.rows[0]!.cells[2]!, 'Enter', { shiftKey: true })
    expect((wrapper.emitted('update:sortModel')!.at(-1)! as [unknown])[0]).toEqual([
      { field: 'name', direction: 'asc' },
      { field: 'age', direction: 'asc' },
    ])

    // And the sort keys did not also move focus: `handleHeaderKeyDown` prevents
    // them, and navigation names none of them.
    expect(document.activeElement).toBe(table.tHead!.rows[0]!.cells[2])

    wrapper.unmount()
  })

  /**
   * Regression coverage for the binding this packet rewired. The `<th>`'s
   * `@keydown` used to be a conditional call to `handleHeaderKeyDown` and is now
   * `onHeaderCellKeydown`, which runs the sort first and falls through to
   * navigation. The three `when: 'header'` rows and the `when: 'filter open'` row
   * were already backed; these two tests are here because the wire changed, and
   * `Space` and `Escape` are the two declared keys the grid's own unit spec named
   * nowhere.
   */
  it('cycles the sort on Space, the other declared header activation key', () => {
    const { wrapper, table } = mountNav({ sortable: true })

    press(table.tHead!.rows[0]!.cells[0]!, ' ')
    expect(wrapper.emitted('update:sortModel')?.at(-1)?.[0]).toEqual([{ field: 'name', direction: 'asc' }])

    press(table.tHead!.rows[0]!.cells[0]!, ' ')
    expect(wrapper.emitted('update:sortModel')?.at(-1)?.[0]).toEqual([{ field: 'name', direction: 'desc' }])

    wrapper.unmount()
  })

  it('closes the column filter popover on Escape, which the wrapper must not swallow', async () => {
    const wrapper = mount(DzDataGrid, {
      props: { data: testData, columns: filterableColumns, filterable: true },
      attachTo: document.body,
    })
    await wrapper.find('[data-testid="filter-trigger"]').trigger('click')
    expect(wrapper.find('[data-testid="filter-popover"]').exists()).toBe(true)

    await wrapper.find('[data-testid="filter-text-input"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[data-testid="filter-popover"]').exists()).toBe(false)

    wrapper.unmount()
  })
})
