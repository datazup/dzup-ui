import { mount } from '@vue/test-utils'
/**
 * DzButtonGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzButton from './DzButton.vue'
import DzButtonGroup from './DzButtonGroup.vue'

describe('dzButtonGroup', () => {
  it('renders a <div> with role="group"', () => {
    const wrapper = mount(DzButtonGroup, {
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('applies horizontal orientation classes by default', () => {
    const wrapper = mount(DzButtonGroup, {
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('applies vertical orientation classes', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { orientation: 'vertical' },
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('sets aria-label', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { ariaLabel: 'Formatting options' },
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Formatting options')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { disabled: true },
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('passes tone to child buttons via context', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { tone: 'danger' },
      slots: {
        default: () => h(DzButton, null, { default: () => 'Delete' }),
      },
    })
    const btn = wrapper.findComponent(DzButton)
    expect(btn.attributes('data-tone')).toBe('danger')
  })

  it('renders multiple children', () => {
    const wrapper = mount(DzButtonGroup, {
      slots: {
        default: () => [
          h(DzButton, null, { default: () => 'A' }),
          h(DzButton, null, { default: () => 'B' }),
          h(DzButton, null, { default: () => 'C' }),
        ],
      },
    })
    const buttons = wrapper.findAllComponents(DzButton)
    expect(buttons).toHaveLength(3)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzButtonGroup, {
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzButtonGroup, {
      attrs: { class: 'my-group' },
      slots: { default: () => h(DzButton, null, { default: () => 'A' }) },
    })
    expect(wrapper.classes()).toContain('my-group')
  })
})
