import { mount } from '@vue/test-utils'
/**
 * DzTransfer — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTransfer from './DzTransfer.vue'

const source = [
  { key: '1', label: 'Item A' },
  { key: '2', label: 'Item B' },
]

describe('dzTransfer — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTransfer, { props: { source } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTransfer, { props: { source, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTransfer, {
      props: { source },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
