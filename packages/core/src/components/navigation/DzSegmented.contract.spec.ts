import { mount } from '@vue/test-utils'
/**
 * DzSegmented — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzSegmented from './DzSegmented.vue'

const items = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('dzSegmented — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSegmented, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzSegmented, { props: { items } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSegmented, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('displays item labels', () => {
    const wrapper = mount(DzSegmented, { props: { items } })
    expect(wrapper.text()).toContain('Day')
    expect(wrapper.text()).toContain('Week')
    expect(wrapper.text()).toContain('Month')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSegmented, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
