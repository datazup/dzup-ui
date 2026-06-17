import { mount } from '@vue/test-utils'
/**
 * DzDataView — unit/behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzDataView from './DzDataView.vue'

interface Row extends Record<string, unknown> { id: number, name: string, price: number }

const items: Row[] = [
  { id: 1, name: 'Cherry', price: 30 },
  { id: 2, name: 'Apple', price: 10 },
  { id: 3, name: 'Banana', price: 20 },
  { id: 4, name: 'Damson', price: 40 },
  { id: 5, name: 'Elderberry', price: 5 },
]

const itemSlot = `<template #item="{ item, index, layout }">
  <span class="cell" :data-index="index" :data-layout="layout">{{ item.name }}</span>
</template>`

function mountView(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(DzDataView, {
    props: { items, dataKey: 'id', ...props },
    slots: { item: itemSlot, ...slots },
  })
}

describe('dzDataView — item slot', () => {
  it('renders one cell per item with item/index/layout slot props', () => {
    const wrapper = mountView({ layout: 'list' })
    const cells = wrapper.findAll('.cell')
    expect(cells).toHaveLength(items.length)
    expect(cells[0]!.text()).toBe('Cherry')
    expect(cells[0]!.attributes('data-index')).toBe('0')
    expect(cells[0]!.attributes('data-layout')).toBe('list')
  })

  it('passes the active layout to the slot in grid mode', () => {
    const wrapper = mountView({ layout: 'grid' })
    expect(wrapper.find('.cell')!.attributes('data-layout')).toBe('grid')
  })
})

describe('dzDataView — layout', () => {
  it('renders a <ul> list in list layout and DzGrid in grid layout', () => {
    expect(mountView({ layout: 'list' }).find('ul[role="list"]').exists()).toBe(true)
    const grid = mountView({ layout: 'grid' })
    expect(grid.find('ul[role="list"]').exists()).toBe(false)
    expect(grid.find('[role="list"]').exists()).toBe(true)
  })

  it('shows the layout toggle only when layoutToggle is set', () => {
    expect(mountView().find('[aria-label="View layout"]').exists()).toBe(false)
    expect(mountView({ layoutToggle: true }).find('[aria-label="View layout"]').exists()).toBe(true)
  })
})

describe('dzDataView — paging', () => {
  it('slices items to the page window when paginated', () => {
    const wrapper = mountView({ paginator: true, rows: 2, first: 0 })
    expect(wrapper.findAll('.cell')).toHaveLength(2)
    expect(wrapper.findAll('.cell').map(c => c.text())).toEqual(['Cherry', 'Apple'])
  })

  it('honors the first offset and reports absolute index', () => {
    const wrapper = mountView({ paginator: true, rows: 2, first: 2 })
    const cells = wrapper.findAll('.cell')
    expect(cells.map(c => c.text())).toEqual(['Banana', 'Damson'])
    expect(cells[0]!.attributes('data-index')).toBe('2')
  })

  it('shows the paginator only when there is more than one page', () => {
    expect(mountView({ paginator: true, rows: 10 }).findComponent({ name: 'DzPagination' }).exists()).toBe(false)
    expect(mountView({ paginator: true, rows: 2 }).findComponent({ name: 'DzPagination' }).exists()).toBe(true)
  })

  it('emits page + update:first when the next page is requested', async () => {
    const wrapper = mountView({ paginator: true, rows: 2, first: 0 })
    await wrapper.get('button[aria-label="Go to next page"]').trigger('click')
    expect(wrapper.emitted('update:first')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('page')?.at(-1)).toEqual([2])
  })
})

describe('dzDataView — sorting', () => {
  it('sorts ascending by field via the model', () => {
    const wrapper = mountView({ sortField: 'name', sortOrder: 1 })
    expect(wrapper.findAll('.cell').map(c => c.text()))
      .toEqual(['Apple', 'Banana', 'Cherry', 'Damson', 'Elderberry'])
  })

  it('sorts descending and handles numeric fields', () => {
    const wrapper = mountView({ sortField: 'price', sortOrder: -1 })
    expect(wrapper.findAll('.cell').map(c => c.text()))
      .toEqual(['Damson', 'Cherry', 'Banana', 'Apple', 'Elderberry'])
  })

  it('leaves order untouched when sortOrder is 0', () => {
    const wrapper = mountView({ sortField: 'name', sortOrder: 0 })
    expect(wrapper.findAll('.cell').map(c => c.text())).toEqual(items.map(i => i.name))
  })

  it('renders a default sort control from sortOptions and emits on change', async () => {
    const wrapper = mountView({
      sortOptions: [
        { label: 'Name', field: 'name', order: 1 },
        { label: 'Price (high → low)', field: 'price', order: -1 },
      ],
    })
    const select = wrapper.get('select[aria-label="Sort by"]')
    await select.setValue('1')
    expect(wrapper.emitted('sort')?.at(-1)).toEqual([{ sortField: 'price', sortOrder: -1 }])
    expect(wrapper.emitted('update:sortField')?.at(-1)).toEqual(['price'])
    expect(wrapper.emitted('update:sortOrder')?.at(-1)).toEqual([-1])
  })

  it('resets to the first page when a new sort is applied', async () => {
    const wrapper = mountView({
      paginator: true,
      rows: 2,
      first: 2,
      sortOptions: [{ label: 'Name', field: 'name', order: 1 }],
    })
    await wrapper.get('select[aria-label="Sort by"]').setValue('0')
    expect(wrapper.emitted('update:first')?.at(-1)).toEqual([0])
  })

  it('exposes setSort to the #sort slot', async () => {
    const wrapper = mountView({}, {
      sort: `<template #sort="{ setSort }">
        <button class="sort-btn" @click="setSort('name', -1)">sort</button>
      </template>`,
    })
    await wrapper.get('.sort-btn').trigger('click')
    expect(wrapper.emitted('sort')?.at(-1)).toEqual([{ sortField: 'name', sortOrder: -1 }])
  })
})

describe('dzDataView — empty + loading', () => {
  it('renders the built-in empty state for an empty collection', () => {
    const wrapper = mount(DzDataView, { props: { items: [], emptyTitle: 'Nothing here' } })
    expect(wrapper.findComponent({ name: 'DzEmpty' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Nothing here')
    expect(wrapper.find('[role="list"]').exists()).toBe(false)
  })

  it('renders a custom #empty slot', () => {
    const wrapper = mount(DzDataView, {
      props: { items: [] },
      slots: { empty: `<p class="custom-empty">No data</p>` },
    })
    expect(wrapper.find('.custom-empty').exists()).toBe(true)
  })

  it('renders skeleton placeholders while loading and no items', () => {
    const wrapper = mountView({ loading: true, loadingRows: 4 })
    expect(wrapper.findAllComponents({ name: 'DzSkeleton' })).toHaveLength(4)
    expect(wrapper.find('.cell').exists()).toBe(false)
  })

  it('renders a custom #loading slot', () => {
    const wrapper = mountView({ loading: true }, { loading: `<p class="custom-loading">…</p>` })
    expect(wrapper.find('.custom-loading').exists()).toBe(true)
  })
})

describe('dzDataView — keys', () => {
  it('uses dataKey for stable keys (no crash, renders all rows)', () => {
    const wrapper = mountView({ dataKey: 'id' })
    expect(wrapper.findAll('.cell')).toHaveLength(items.length)
  })
})
