import { mount } from '@vue/test-utils'
/**
 * DzSwitch — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSwitch from './DzSwitch.vue'

describe('dzSwitch — Unit Tests', () => {
  it('renders a label element as root', () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'Enable' },
    })
    expect(wrapper.element.tagName).toBe('LABEL')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSwitch, {
      attrs: { class: 'my-switch' },
      slots: { default: 'sw' },
    })
    expect(wrapper.classes()).toContain('my-switch')
  })

  it('reflects modelValue changes via data-state attribute', async () => {
    const wrapper = mount(DzSwitch, {
      props: { 'modelValue': false, 'onUpdate:modelValue': () => {} },
      slots: { default: 'sw' },
    })
    expect(wrapper.attributes('data-state')).toBe('unchecked')

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.attributes('data-state')).toBe('checked')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(DzSwitch, {
      props: { disabled: true, modelValue: false },
      slots: { default: 'sw' },
    })
    const switchRoot = wrapper.find('button')
    await switchRoot.trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'sw' },
    })
    const switchRoot = wrapper.find('button')
    await switchRoot.trigger('focus')
    await switchRoot.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('renders label text from default slot', () => {
    const wrapper = mount(DzSwitch, {
      slots: { default: 'Dark mode' },
    })
    expect(wrapper.text()).toContain('Dark mode')
  })

  it('renders without label when no default slot', () => {
    const wrapper = mount(DzSwitch)
    expect(wrapper.exists()).toBe(true)
  })
})
