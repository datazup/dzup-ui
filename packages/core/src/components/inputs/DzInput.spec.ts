import { mount } from '@vue/test-utils'
/**
 * DzInput — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzInput from './DzInput.vue'

describe('dzInput — Unit Tests', () => {
  it('renders an <input> element inside a wrapper div', () => {
    const wrapper = mount(DzInput)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('merges consumer class via cn() on the input wrapper', () => {
    const wrapper = mount(DzInput, {
      attrs: { class: 'my-custom-class' },
    })
    // Consumer class is merged into the inner input wrapper via cn(attrs.class)
    expect(wrapper.html()).toContain('my-custom-class')
  })

  it('forwards extra HTML attributes to the root element', () => {
    const wrapper = mount(DzInput, {
      attrs: { 'data-testid': 'email-input' },
    })
    expect(wrapper.attributes('data-testid')).toBe('email-input')
  })

  it('sets disabled attribute on the native input', () => {
    const wrapper = mount(DzInput, {
      props: { disabled: true },
    })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('sets readonly attribute on the native input', () => {
    const wrapper = mount(DzInput, {
      props: { readonly: true },
    })
    expect((wrapper.find('input').element as HTMLInputElement).readOnly).toBe(true)
  })

  it('sets placeholder on the native input', () => {
    const wrapper = mount(DzInput, {
      props: { placeholder: 'Enter text...' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text...')
  })

  it('sets maxlength on the native input', () => {
    const wrapper = mount(DzInput, {
      props: { maxlength: 50 },
    })
    expect(wrapper.find('input').attributes('maxlength')).toBe('50')
  })

  it('sets name on the native input', () => {
    const wrapper = mount(DzInput, {
      props: { name: 'email' },
    })
    expect(wrapper.find('input').attributes('name')).toBe('email')
  })

  it('renders both prefix and suffix slots', () => {
    const wrapper = mount(DzInput, {
      slots: {
        prefix: () => h('span', { 'data-testid': 'prefix-icon' }),
        suffix: () => h('span', { 'data-testid': 'suffix-icon' }),
      },
    })
    expect(wrapper.find('[data-testid="prefix-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suffix-icon"]').exists()).toBe(true)
  })

  it('does not show clear button when clearable=false', () => {
    const wrapper = mount(DzInput, {
      props: { modelValue: 'hello' },
    })
    expect(wrapper.find('button[aria-label="Clear input"]').exists()).toBe(false)
  })

  it('hides clear button when disabled', () => {
    const wrapper = mount(DzInput, {
      props: { clearable: true, modelValue: 'hello', disabled: true },
    })
    expect(wrapper.find('button[aria-label="Clear input"]').exists()).toBe(false)
  })

  it('hides clear button when readonly', () => {
    const wrapper = mount(DzInput, {
      props: { clearable: true, modelValue: 'hello', readonly: true },
    })
    expect(wrapper.find('button[aria-label="Clear input"]').exists()).toBe(false)
  })

  it('applies outline variant classes by default', () => {
    const wrapper = mount(DzInput)
    // Outline variant adds border class to the input wrapper
    expect(wrapper.html()).toContain('border')
  })

  it('applies filled variant classes', () => {
    const wrapper = mount(DzInput, { props: { variant: 'filled' } })
    // Filled variant adds bg-[var(--dz-muted)] class
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('applies invalid styling when error is set', () => {
    const wrapper = mount(DzInput, { props: { error: 'Required' } })
    // Invalid variant adds dz-danger border class
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('uses custom id when provided', () => {
    const wrapper = mount(DzInput, { props: { id: 'my-input' } })
    expect(wrapper.find('input').attributes('id')).toBe('my-input')
  })

  it('generates unique id when not provided', () => {
    const wrapper = mount(DzInput)
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
  })
})
