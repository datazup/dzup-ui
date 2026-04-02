import { mount } from '@vue/test-utils'
/**
 * DzRadioGroup + DzRadio — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzRadio from './DzRadio.vue'
import DzRadioGroup from './DzRadioGroup.vue'

describe('dzRadioGroup — Unit Tests', () => {
  const mountGroup = (props: Record<string, unknown> = {}) =>
    mount(DzRadioGroup, {
      props: { 'modelValue': '', 'onUpdate:modelValue': () => {}, ...props },
      slots: {
        default: () => [
          h(DzRadio, { value: 'a' }, { default: () => 'Option A' }),
          h(DzRadio, { value: 'b' }, { default: () => 'Option B' }),
          h(DzRadio, { value: 'c' }, { default: () => 'Option C' }),
        ],
      },
    })

  it('renders radio options within a group', () => {
    const wrapper = mountGroup()
    expect(wrapper.findAllComponents(DzRadio)).toHaveLength(3)
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

  it('has contain: layout style on root element', () => {
    const wrapper = mountGroup()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      attrs: { class: 'custom-radio-group' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }),
      },
    })
    expect(wrapper.classes()).toContain('custom-radio-group')
  })
})

describe('dzRadio — Unit Tests', () => {
  it('renders a label element as root', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'Option A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.element.tagName).toBe('LABEL')
  })

  it('renders label text from default slot', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'My Option' }),
      },
    })
    expect(wrapper.text()).toContain('My Option')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a', disabled: true }, { default: () => 'A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('data-disabled')).toBe('')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('style')).toContain('contain: layout style')
  })
})
