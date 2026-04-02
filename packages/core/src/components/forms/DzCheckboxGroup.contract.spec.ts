import { mount } from '@vue/test-utils'
/**
 * DzCheckboxGroup — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCheckboxGroup from './DzCheckboxGroup.vue'

describe('dzCheckboxGroup — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCheckboxGroup, {
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has role="group" on root element', () => {
    const wrapper = mount(DzCheckboxGroup, {
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCheckboxGroup, {
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { disabled: true },
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-orientation', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { orientation: 'horizontal' },
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCheckboxGroup, {
        props: { size },
        slots: { default: '<div>Checkboxes</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { ariaLabel: 'Fruit selection' },
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Fruit selection')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCheckboxGroup, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Checkboxes</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
