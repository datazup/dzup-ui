import type { DzSelectItem } from './DzSelect.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzSelect — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFormField from './DzFormField.vue'
import DzSelect from './DzSelect.vue'

const mockItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
]

describe('dzSelect — Unit Tests', () => {
  it('renders a trigger button', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    expect(trigger.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
      attrs: { class: 'my-select' },
    })
    const trigger = wrapper.find('button')
    expect(trigger.classes()).toContain('my-select')
  })

  it('shows placeholder when no value selected', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, placeholder: 'Choose fruit' },
    })
    expect(wrapper.text()).toContain('Choose fruit')
  })

  it('emits focus on trigger focus', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    await trigger.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur on trigger blur', async () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    await trigger.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('integrates with DzFormField context', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true, error: 'Required' },
      slots: {
        default: () => h(DzSelect, { items: mockItems }),
      },
    })
    const select = wrapper.findComponent(DzSelect)
    expect(select.exists()).toBe(true)
  })

  it('renders with outline variant by default', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems },
    })
    const trigger = wrapper.find('button')
    expect(trigger.classes().some(c => c.includes('border'))).toBe(true)
  })

  it('renders with filled variant', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, variant: 'filled' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with underlined variant', () => {
    const wrapper = mount(DzSelect, {
      props: { items: mockItems, variant: 'underlined' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
