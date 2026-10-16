import { mount } from '@vue/test-utils'
/**
 * DzCheckbox — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCheckbox from './DzCheckbox.vue'
import DzCheckboxGroup from './DzCheckboxGroup.vue'
import DzFormField from './DzFormField.vue'

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

  // UI-DZUP-UI-TEST-M-05: the standalone (non-group) path writes the model and
  // emits change; the disabled negative below is only meaningful beside these.
  it('toggles the standalone v-model and emits change on each click', async () => {
    const wrapper = mount(DzCheckbox, {
      props: { modelValue: false },
      slots: { default: 'cb' },
    })
    const checkboxRoot = wrapper.find('button')
    await checkboxRoot.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
    expect(wrapper.attributes('data-state')).toBe('checked')

    await wrapper.setProps({ modelValue: true })
    await checkboxRoot.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([false])
  })

  it('moves an indeterminate checkbox to checked', async () => {
    const wrapper = mount(DzCheckbox, {
      props: { modelValue: false, indeterminate: true },
      slots: { default: 'cb' },
    })
    expect(wrapper.attributes('data-state')).toBe('indeterminate')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(DzCheckbox, {
      props: { disabled: true, modelValue: false },
      slots: { default: 'cb' },
    })
    const checkboxRoot = wrapper.find('button')
    await checkboxRoot.trigger('click')
    expect(wrapper.emitted('change')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
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

  it('inherits required from an enclosing DzFormField', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true },
      slots: {
        default: () => h(DzCheckbox, null, { default: () => 'Accept terms' }),
      },
    })
    // Reka renders aria-required on the role="checkbox" element
    expect(wrapper.find('[role="checkbox"]').attributes('aria-required')).toBe('true')
  })

  it('inherits disabled from an enclosing DzFormField', () => {
    const wrapper = mount(DzFormField, {
      props: { disabled: true },
      slots: {
        default: () => h(DzCheckbox, null, { default: () => 'Accept terms' }),
      },
    })
    const checkbox = wrapper.findComponent(DzCheckbox)
    expect(checkbox.attributes('data-disabled')).toBe('')
  })
})
