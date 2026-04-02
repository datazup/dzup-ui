import { mount } from '@vue/test-utils'
/**
 * DzSegmented — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSegmented from './DzSegmented.vue'

const items = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
]

describe('dzSegmented — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzSegmented, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders all item labels', () => {
    const wrapper = mount(DzSegmented, { props: { items } })
    expect(wrapper.text()).toContain('List')
    expect(wrapper.text()).toContain('Grid')
    expect(wrapper.text()).toContain('Table')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSegmented, {
      attrs: { class: 'my-class' },
      props: { items },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('sets aria-label when provided', () => {
    const wrapper = mount(DzSegmented, {
      props: { items, ariaLabel: 'View mode' },
    })
    expect(wrapper.attributes('aria-label')).toBe('View mode')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzSegmented, {
      props: { items, id: 'seg-1' },
    })
    expect(wrapper.attributes('id')).toBe('seg-1')
  })
})
