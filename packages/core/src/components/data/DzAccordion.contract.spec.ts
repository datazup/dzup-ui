import { mount } from '@vue/test-utils'
/**
 * DzAccordion — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzAccordion from './DzAccordion.vue'

describe('dzAccordion — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAccordion, {
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzAccordion, {
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzAccordion, {
      props: { ariaLabel: 'FAQ' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.html()).toContain('FAQ')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzAccordion, {
        props: { size },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts variant values', () => {
    const variants = ['default', 'bordered', 'separated'] as const
    for (const variant of variants) {
      const wrapper = mount(DzAccordion, {
        props: { variant },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAccordion, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAccordion, {
      slots: { default: '<div>Accordion Item</div>' },
    })
    expect(wrapper.text()).toContain('Accordion Item')
  })
})
