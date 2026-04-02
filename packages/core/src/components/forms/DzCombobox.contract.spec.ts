import { mount } from '@vue/test-utils'
/**
 * DzCombobox — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCombobox from './DzCombobox.vue'

const items = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
]

describe('dzCombobox — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCombobox, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCombobox, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
