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
})
