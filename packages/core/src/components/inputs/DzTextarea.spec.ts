import { mount } from '@vue/test-utils'
/**
 * DzTextarea — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzTextarea from './DzTextarea.vue'

describe('dzTextarea — Unit Tests', () => {
  it('renders a <textarea> element inside a wrapper div', () => {
    const wrapper = mount(DzTextarea)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('sets disabled attribute on the native textarea', () => {
    const wrapper = mount(DzTextarea, {
      props: { disabled: true },
    })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).disabled).toBe(true)
  })

  it('sets readonly attribute on the native textarea', () => {
    const wrapper = mount(DzTextarea, {
      props: { readonly: true },
    })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).readOnly).toBe(true)
  })

  it('sets placeholder on the native textarea', () => {
    const wrapper = mount(DzTextarea, {
      props: { placeholder: 'Describe here...' },
    })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Describe here...')
  })

  it('sets maxlength on the native textarea', () => {
    const wrapper = mount(DzTextarea, {
      props: { maxlength: 200 },
    })
    expect(wrapper.find('textarea').attributes('maxlength')).toBe('200')
  })

  it('sets name on the native textarea', () => {
    const wrapper = mount(DzTextarea, {
      props: { name: 'description' },
    })
    expect(wrapper.find('textarea').attributes('name')).toBe('description')
  })

  it('uses custom id when provided', () => {
    const wrapper = mount(DzTextarea, { props: { id: 'my-textarea' } })
    expect(wrapper.find('textarea').attributes('id')).toBe('my-textarea')
  })

  it('generates unique id when not provided', () => {
    const wrapper = mount(DzTextarea)
    const id = wrapper.find('textarea').attributes('id')
    expect(id).toBeTruthy()
  })

  it('applies outline variant classes by default', () => {
    const wrapper = mount(DzTextarea)
    const textarea = wrapper.find('textarea')
    expect(textarea.classes().some(c => c.includes('border'))).toBe(true)
  })

  it('applies filled variant classes', () => {
    const wrapper = mount(DzTextarea, { props: { variant: 'filled' } })
    const textarea = wrapper.find('textarea')
    expect(textarea.classes().some(c => c.includes('border-0') || c.includes('bg-'))).toBe(true)
  })

  it('applies invalid styling when error is set', () => {
    const wrapper = mount(DzTextarea, { props: { error: 'Required' } })
    const textarea = wrapper.find('textarea')
    expect(textarea.classes().some(c => c.includes('danger'))).toBe(true)
  })

  it('applies resize-none class when autoResize is true', () => {
    const wrapper = mount(DzTextarea, { props: { autoResize: true } })
    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('resize-none')
  })

  it('applies resize-y class when autoResize is false', () => {
    const wrapper = mount(DzTextarea, { props: { autoResize: false } })
    const textarea = wrapper.find('textarea')
    expect(textarea.classes()).toContain('resize-y')
  })

  it('forwards extra HTML attributes to the textarea', () => {
    const wrapper = mount(DzTextarea, {
      attrs: { 'data-testid': 'bio-field' },
    })
    expect(wrapper.find('textarea').attributes('data-testid')).toBe('bio-field')
  })
})
