import { mount } from '@vue/test-utils'
/**
 * DzTagsInput — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTagsInput from './DzTagsInput.vue'

describe('dzTagsInput — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTagsInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a text input', () => {
    const wrapper = mount(DzTagsInput)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTagsInput, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all input variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTagsInput, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTagsInput, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })

  it('renders the placeholder on the text input', () => {
    const wrapper = mount(DzTagsInput, { props: { placeholder: 'Add a tag' } })
    expect(wrapper.find('input[type="text"]').attributes('placeholder')).toBe('Add a tag')
  })

  it('renders committed tokens as chips from the model', () => {
    const wrapper = mount(DzTagsInput, { props: { value: ['vue', 'ts'] } })
    expect(wrapper.text()).toContain('vue')
    expect(wrapper.text()).toContain('ts')
    expect(wrapper.findAll('[data-dz-tag]')).toHaveLength(2)
  })

  it('exposes a group role with a live status region', () => {
    const wrapper = mount(DzTagsInput, { props: { value: ['a'] } })
    expect(wrapper.find('[role="group"]').exists()).toBe(true)
    const status = wrapper.find('[aria-live="polite"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toContain('1 tag')
  })

  it('renders an error message with role="alert"', () => {
    const wrapper = mount(DzTagsInput, { props: { error: 'Required' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Required')
  })

  it('reflects disabled state on the input', () => {
    const wrapper = mount(DzTagsInput, { props: { disabled: true } })
    expect(wrapper.find('input[type="text"]').attributes('disabled')).toBeDefined()
  })

  it('wires aria-invalid when invalid', () => {
    const wrapper = mount(DzTagsInput, { props: { invalid: true } })
    expect(wrapper.find('input[type="text"]').attributes('aria-invalid')).toBe('true')
  })
})
