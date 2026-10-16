import { mount } from '@vue/test-utils'
/**
 * DzSwitch — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCheckbox from './DzCheckbox.vue'
import DzFormField from './DzFormField.vue'
import DzFormMessage from './DzFormMessage.vue'
import DzRadio from './DzRadio.vue'
import DzRadioGroup from './DzRadioGroup.vue'
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

describe('dzSwitch and sibling choice controls — aria-describedby merging', () => {
  function mountInInvalidField(control: () => ReturnType<typeof h>) {
    return mount(DzFormField, {
      props: { id: 'fld', error: 'Required' },
      slots: {
        default: () => [control(), h(DzFormMessage, null, { default: () => 'Required' })],
      },
    })
  }

  it.each([
    ['DzSwitch', () => h(DzSwitch, { ariaDescribedby: 'hint' }, { default: () => 'Enable' })],
    ['DzCheckbox', () => h(DzCheckbox, { ariaDescribedby: 'hint' }, { default: () => 'Accept' })],
    ['DzRadioGroup', () => h(DzRadioGroup, { ariaDescribedby: 'hint' }, {
      default: () => h(DzRadio, { value: 'a' }, { default: () => 'A' }),
    })],
    ['DzRadio', () => h(DzRadioGroup, null, {
      default: () => h(DzRadio, { value: 'a', ariaDescribedby: 'hint' }, { default: () => 'A' }),
    })],
  ] as const)('%s keeps the field message id beside a consumer hint', (_name, control) => {
    const wrapper = mountInInvalidField(control)
    const described = wrapper.findAll('[aria-describedby~="hint"]')
    expect(described.length).toBeGreaterThan(0)
    for (const el of described)
      expect(el.attributes('aria-describedby')!.split(' ')).toEqual(['hint', 'fld-message'])
    wrapper.unmount()
  })

  it('does not repeat an id the consumer already passed', () => {
    const wrapper = mountInInvalidField(() => h(DzSwitch, { ariaDescribedby: 'fld-message' }, { default: () => 'Enable' }))
    expect(wrapper.get('[aria-describedby]').attributes('aria-describedby')).toBe('fld-message')
    wrapper.unmount()
  })
})
