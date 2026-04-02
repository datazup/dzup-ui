import { mount } from '@vue/test-utils'
/**
 * DzRadioGroup — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzRadioGroup from './DzRadioGroup.vue'

describe('dzRadioGroup — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzRadioGroup, {
      slots: { default: '<div>Radios</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzRadioGroup, {
      slots: { default: '<div>Radios</div>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzRadioGroup, {
        props: { size },
        slots: { default: '<div>Radios</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { ariaLabel: 'Size options' },
      slots: { default: '<div>Radios</div>' },
    })
    expect(wrapper.html()).toContain('Size options')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRadioGroup, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Radios</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
