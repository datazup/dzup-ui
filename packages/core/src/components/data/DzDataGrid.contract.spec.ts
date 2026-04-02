import { mount } from '@vue/test-utils'
/**
 * DzDataGrid — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDataGrid from './DzDataGrid.vue'

const columns = [{ field: 'name', header: 'Name' }]
const data = [{ name: 'Alice' }, { name: 'Bob' }]

describe('dzDataGrid — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzDataGrid, { props: { data, columns } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzDataGrid, { props: { data, columns, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzDataGrid, { props: { data, columns } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data, columns, ariaLabel: 'User list' },
    })
    expect(wrapper.html()).toContain('User list')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data, columns },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('accepts density values', () => {
    const densities = ['compact', 'default', 'comfortable'] as const
    for (const density of densities) {
      const wrapper = mount(DzDataGrid, { props: { data, columns, density } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('shows loading state when loading=true', () => {
    const wrapper = mount(DzDataGrid, { props: { data, columns, loading: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts filterable prop', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data, columns, filterable: true },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts filters prop', () => {
    const wrapper = mount(DzDataGrid, {
      props: {
        data,
        columns,
        filterable: true,
        filters: [{ column: 'name', value: 'Alice', operator: 'contains' as const }],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders filter UI when filterable=true and column.filterable=true', () => {
    const filterColumns = [{ field: 'name', header: 'Name', filterable: true }]
    const wrapper = mount(DzDataGrid, {
      props: { data, columns: filterColumns, filterable: true },
    })
    const triggers = wrapper.findAll('[data-testid="filter-trigger"]')
    expect(triggers.length).toBeGreaterThan(0)
  })

  it('does not render filter UI when filterable=false', () => {
    const wrapper = mount(DzDataGrid, {
      props: { data, columns, filterable: false },
    })
    expect(wrapper.findAll('[data-testid="filter-trigger"]')).toHaveLength(0)
  })

  it('emits update:filters event', async () => {
    const filterColumns = [{ field: 'name', header: 'Name', filterable: true }]
    const wrapper = mount(DzDataGrid, {
      props: { data, columns: filterColumns, filterable: true },
    })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    const input = wrapper.find('[data-testid="filter-text-input"]')
    await input.setValue('test')
    await input.trigger('input')
    expect(wrapper.emitted('update:filters')).toBeTruthy()
  })

  it('emits filter event', async () => {
    const filterColumns = [{ field: 'name', header: 'Name', filterable: true }]
    const wrapper = mount(DzDataGrid, {
      props: { data, columns: filterColumns, filterable: true },
    })
    const trigger = wrapper.find('[data-testid="filter-trigger"]')
    await trigger.trigger('click')
    const input = wrapper.find('[data-testid="filter-text-input"]')
    await input.setValue('test')
    await input.trigger('input')
    expect(wrapper.emitted('filter')).toBeTruthy()
  })
})
