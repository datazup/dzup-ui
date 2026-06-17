import { mount } from '@vue/test-utils'
/**
 * DzMention — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzMention from './DzMention.vue'

const triggers = [
  {
    char: '@',
    options: [
      { label: 'Alice', value: 'alice' },
      { label: 'Bob', value: 'bob' },
    ],
  },
]

describe('dzMention — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a textarea by default (multiline)', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })

  it('renders a single-line input when multiline is false', () => {
    const wrapper = mount(DzMention, { props: { triggers, multiline: false } })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMention, { props: { triggers, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all input variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzMention, { props: { triggers, variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('exposes the combobox role with listbox popup', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    const control = wrapper.find('[role="combobox"]')
    expect(control.exists()).toBe(true)
    expect(control.attributes('aria-haspopup')).toBe('listbox')
    expect(control.attributes('aria-autocomplete')).toBe('list')
  })

  it('merges consumer class via cn() onto the control', () => {
    const wrapper = mount(DzMention, {
      props: { triggers },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.find('textarea').classes()).toContain('custom-class')
  })

  it('renders the placeholder', () => {
    const wrapper = mount(DzMention, { props: { triggers, placeholder: 'Write…' } })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Write…')
  })

  it('renders an error message with role="alert"', () => {
    const wrapper = mount(DzMention, { props: { triggers, error: 'Required' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Required')
  })

  it('reflects disabled state on the control', () => {
    const wrapper = mount(DzMention, { props: { triggers, disabled: true } })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('passes the name attribute through for form integration', () => {
    const wrapper = mount(DzMention, { props: { triggers, name: 'comment' } })
    expect(wrapper.find('textarea').attributes('name')).toBe('comment')
  })
})
