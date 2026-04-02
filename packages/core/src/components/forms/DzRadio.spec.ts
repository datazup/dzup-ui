import { mount } from '@vue/test-utils'
/**
 * DzRadio — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzRadio from './DzRadio.vue'
import DzRadioGroup from './DzRadioGroup.vue'

/** Helper: mount a DzRadio within a DzRadioGroup (required context) */
function mountRadio(radioProps: Record<string, unknown> = {}, groupProps: Record<string, unknown> = {}) {
  return mount(DzRadioGroup, {
    props: { 'modelValue': '', 'onUpdate:modelValue': () => {}, ...groupProps },
    slots: {
      default: () => h(DzRadio, { value: 'test', ...radioProps }, { default: () => 'Test Option' }),
    },
  })
}

describe('dzRadio — Unit Tests', () => {
  it('renders a label element as root', () => {
    const wrapper = mountRadio()
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.element.tagName).toBe('LABEL')
  })

  it('renders label text from default slot', () => {
    const wrapper = mountRadio()
    expect(wrapper.text()).toContain('Test Option')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountRadio({ disabled: true })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('data-disabled')).toBe('')
  })

  it('does not set data-disabled when not disabled', () => {
    const wrapper = mountRadio({ disabled: false })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('data-disabled')).toBeUndefined()
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountRadio()
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a', class: 'custom-radio' }, { default: () => 'A' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.classes()).toContain('custom-radio')
  })

  it('forwards aria-label to RadioGroupItem', () => {
    const wrapper = mountRadio({ ariaLabel: 'Test radio option' })
    const radio = wrapper.findComponent(DzRadio)
    // aria-label should be present somewhere in the component tree
    expect(radio.html()).toContain('aria-label')
  })

  it('forwards id to RadioGroupItem', () => {
    const wrapper = mountRadio({ id: 'radio-1' })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.html()).toContain('radio-1')
  })

  it('renders multiple radios within a group', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => [
          h(DzRadio, { value: 'a' }, { default: () => 'A' }),
          h(DzRadio, { value: 'b' }, { default: () => 'B' }),
          h(DzRadio, { value: 'c' }, { default: () => 'C' }),
        ],
      },
    })
    expect(wrapper.findAllComponents(DzRadio)).toHaveLength(3)
  })

  it('renders without label when no default slot is provided', () => {
    const wrapper = mount(DzRadioGroup, {
      props: { modelValue: '' },
      slots: {
        default: () => h(DzRadio, { value: 'a' }),
      },
    })
    const radio = wrapper.findComponent(DzRadio)
    expect(radio.exists()).toBe(true)
  })
})
