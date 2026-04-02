import { mount } from '@vue/test-utils'
/**
 * DzToggleButton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzToggleButton from './DzToggleButton.vue'

describe('dzToggleButton — Unit Tests', () => {
  it('renders a <button> element', () => {
    const wrapper = mount(DzToggleButton, { slots: { default: 'Bold' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('sets aria-pressed="false" when not pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: false },
      slots: { default: 'Toggle' },
    })
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('sets aria-pressed="true" when pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: true },
      slots: { default: 'Toggle' },
    })
    expect(wrapper.attributes('aria-pressed')).toBe('true')
  })

  it('toggles model value on click', async () => {
    const wrapper = mount(DzToggleButton, {
      props: { 'modelValue': false, 'onUpdate:modelValue': (v: boolean) => wrapper.setProps({ modelValue: v }) },
      slots: { default: 'Toggle' },
    })
    await wrapper.trigger('click')
    expect(wrapper.props('modelValue')).toBe(true)
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: false, disabled: true },
      slots: { default: 'Toggle' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('emits change event with new pressed value', async () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: false },
      slots: { default: 'Toggle' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([true])
  })

  it('sets data-state to off when not pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: false },
      slots: { default: 'Toggle' },
    })
    expect(wrapper.attributes('data-state')).toBe('off')
  })

  it('sets data-state to on when pressed', () => {
    const wrapper = mount(DzToggleButton, {
      props: { modelValue: true },
      slots: { default: 'Toggle' },
    })
    expect(wrapper.attributes('data-state')).toBe('on')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzToggleButton, {
      attrs: { class: 'my-class' },
      slots: { default: 'Toggle' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('renders prefix and suffix slots', () => {
    const wrapper = mount(DzToggleButton, {
      slots: {
        prefix: '<span data-testid="pre">P</span>',
        default: 'Label',
        suffix: '<span data-testid="suf">S</span>',
      },
    })
    expect(wrapper.find('[data-testid="pre"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suf"]').exists()).toBe(true)
  })
})
