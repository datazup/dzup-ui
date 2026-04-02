import { mount } from '@vue/test-utils'
/**
 * DzTree — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTree from './DzTree.vue'

const items = [
  { key: '1', label: 'Root', children: [{ key: '1-1', label: 'Child' }] },
]

describe('dzTree — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTree, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzTree, {
      props: { items, ariaLabel: 'File tree' },
    })
    expect(wrapper.html()).toContain('File tree')
  })

  it('displays node labels', () => {
    const wrapper = mount(DzTree, { props: { items } })
    expect(wrapper.text()).toContain('Root')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTree, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
