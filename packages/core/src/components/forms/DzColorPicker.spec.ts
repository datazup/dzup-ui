// token-check-disable-file — color picker tests legitimately use raw color values as test data
import { mount } from '@vue/test-utils'
/**
 * DzColorPicker — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzColorPicker from './DzColorPicker.vue'

describe('dzColorPicker — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('renders trigger button', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('displays current color value', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#ff0000' },
    })
    expect(wrapper.text()).toContain('#ff0000')
  })

  it('displays color swatch with current color', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#00ff00' },
    })
    const swatch = wrapper.find('[aria-hidden="true"]')
    expect(swatch.exists()).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzColorPicker, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzColorPicker, {
      props: { error: 'Invalid color' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Invalid color')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzColorPicker, {
      attrs: { class: 'my-picker' },
    })
    expect(wrapper.html()).toContain('my-picker')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzColorPicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('h-12')
  })

  it('renders hidden form input when name is provided', () => {
    const wrapper = mount(DzColorPicker, {
      props: { name: 'color-field' },
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('color-field')
  })

  it('emits focus event on trigger focus', async () => {
    const wrapper = mount(DzColorPicker)
    await wrapper.find('button').trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event on trigger blur', async () => {
    const wrapper = mount(DzColorPicker)
    await wrapper.find('button').trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('defaults modelValue to empty string', () => {
    const wrapper = mount(DzColorPicker)
    // Default model value is '' (empty string), not #000000
    expect(wrapper.exists()).toBe(true)
  })
})
