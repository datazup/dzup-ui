import { mount } from '@vue/test-utils'
/**
 * DzMultiSelect — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzMultiSelect from './DzMultiSelect.vue'

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('dzMultiSelect — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMultiSelect, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMultiSelect, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
