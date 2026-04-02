import { mount } from '@vue/test-utils'
/**
 * DzCheckbox — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCheckbox from './DzCheckbox.vue'
import DzCheckboxGroup from './DzCheckboxGroup.vue'

describe('dzCheckbox — Unit Tests', () => {
  it('renders a label element as root', () => {
    const wrapper = mount(DzCheckbox, {
      slots: { default: 'Accept terms' },
    })
    expect(wrapper.element.tagName).toBe('LABEL')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCheckbox, {
      attrs: { class: 'my-checkbox' },
      slots: { default: 'cb' },
    })
    expect(wrapper.classes()).toContain('my-checkbox')
  })

  it('reflects modelValue changes via data-state attribute', async () => {
    const wrapper = mount(DzCheckbox, {
      props: { 'modelValue': false, 'onUpdate:modelValue': () => {} },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-state')).toBe('unchecked')

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.attributes('data-state')).toBe('checked')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(DzCheckbox, {
      props: { disabled: true, modelValue: false },
      slots: { default: 'cb' },
    })
    const checkboxRoot = wrapper.find('button')
    await checkboxRoot.trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzCheckbox, {
      slots: { default: 'cb' },
    })
    const checkboxRoot = wrapper.find('button')
    await checkboxRoot.trigger('focus')
    await checkboxRoot.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
})

describe('dzCheckboxGroup — Unit Tests', () => {
  it('renders children in a group', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { 'modelValue': [], 'onUpdate:modelValue': () => {} },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'B' }),
        ],
      },
    })
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.findAllComponents(DzCheckbox)).toHaveLength(2)
  })

  it('has vertical orientation by default', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [] },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.attributes('data-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('supports horizontal orientation', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [], orientation: 'horizontal' },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('renders checkbox with value prop inside group', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { 'modelValue': ['apple'], 'onUpdate:modelValue': () => {} },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'apple' }, { default: () => 'Apple' }),
        ],
      },
    })

    const checkbox = wrapper.findComponent(DzCheckbox)
    // Checkbox should show as checked when its value is in the group model
    expect(checkbox.attributes('data-state')).toBe('checked')
  })

  it('disables all children when group is disabled', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [], disabled: true },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })

    const checkbox = wrapper.findComponent(DzCheckbox)
    expect(checkbox.attributes('data-disabled')).toBe('')
  })
})
