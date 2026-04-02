import { mount } from '@vue/test-utils'
/**
 * DzResizable — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzResizable from './DzResizable.vue'

describe('dzResizable — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzResizable, { slots: { default: '<div>Panel</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzResizable, { slots: { default: '<div>Panel</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzResizable, { props: { size }, slots: { default: '<div>Panel</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts direction values', () => {
    for (const direction of ['horizontal', 'vertical'] as const) {
      const wrapper = mount(DzResizable, { props: { direction }, slots: { default: '<div>Panel</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzResizable, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Panel</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
