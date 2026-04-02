import { mount } from '@vue/test-utils'
/**
 * DzCheckboxGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCheckbox from './DzCheckbox.vue'
import DzCheckboxGroup from './DzCheckboxGroup.vue'

describe('dzCheckboxGroup — Unit Tests', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzCheckboxGroup, {
      props: { 'modelValue': [], 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'Option A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'Option B' }),
          h(DzCheckbox, { value: 'c' }, { default: () => 'Option C' }),
        ],
      },
    })

  it('renders checkbox options within a group', () => {
    const wrapper = mountGroup()
    expect(wrapper.findAllComponents(DzCheckbox)).toHaveLength(3)
  })

  it('has role="group" on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('has vertical layout by default', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('data-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('supports horizontal orientation', () => {
    const wrapper = mountGroup({ orientation: 'horizontal' })
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountGroup({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('does not set data-disabled when not disabled', () => {
    const wrapper = mountGroup({ disabled: false })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { modelValue: [] },
      attrs: { class: 'custom-group' },
      slots: {
        default: () => h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.classes()).toContain('custom-group')
  })

  it('forwards aria-label to root element', () => {
    const wrapper = mountGroup({ ariaLabel: 'Fruit selection' })
    expect(wrapper.attributes('aria-label')).toBe('Fruit selection')
  })

  it('forwards aria-labelledby to root element', () => {
    const wrapper = mountGroup({ ariaLabelledby: 'group-label' })
    expect(wrapper.attributes('aria-labelledby')).toBe('group-label')
  })

  it('forwards aria-describedby to root element', () => {
    const wrapper = mountGroup({ ariaDescribedby: 'group-desc' })
    expect(wrapper.attributes('aria-describedby')).toBe('group-desc')
  })

  it('forwards id to root element', () => {
    const wrapper = mountGroup({ id: 'my-group' })
    expect(wrapper.attributes('id')).toBe('my-group')
  })

  it('marks checked checkbox when value is in modelValue', () => {
    const wrapper = mount(DzCheckboxGroup, {
      props: { 'modelValue': ['a'], 'onUpdate:modelValue': () => {} },
      slots: {
        default: () => [
          h(DzCheckbox, { value: 'a' }, { default: () => 'A' }),
          h(DzCheckbox, { value: 'b' }, { default: () => 'B' }),
        ],
      },
    })
    const checkboxes = wrapper.findAllComponents(DzCheckbox)
    expect(checkboxes.at(0)?.attributes('data-state')).toBe('checked')
    expect(checkboxes.at(1)?.attributes('data-state')).toBe('unchecked')
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
