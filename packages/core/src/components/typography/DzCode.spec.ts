import { mount } from '@vue/test-utils'
/**
 * DzCode — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzCode from './DzCode.vue'

describe('dzCode — Unit Tests', () => {
  it('renders inline <code> element by default', () => {
    const wrapper = mount(DzCode, { slots: { default: 'x = 1' } })
    expect(wrapper.element.tagName).toBe('CODE')
  })

  it('renders <pre> element for block variant', () => {
    const wrapper = mount(DzCode, {
      props: { variant: 'block' },
      slots: { default: 'const x = 1' },
    })
    expect(wrapper.element.tagName).toBe('PRE')
    expect(wrapper.find('code').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCode, {
      attrs: { class: 'my-class' },
      slots: { default: 'code' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzCode, {
      attrs: { 'data-testid': 'my-code' },
      slots: { default: 'code' },
    })
    expect(wrapper.attributes('data-testid')).toBe('my-code')
  })

  it('sets data-language attribute when language provided', () => {
    const wrapper = mount(DzCode, {
      props: { language: 'typescript' },
      slots: { default: 'code' },
    })
    expect(wrapper.attributes('data-language')).toBe('typescript')
  })

  it('sets id attribute when provided', () => {
    const wrapper = mount(DzCode, {
      props: { id: 'code-1' },
      slots: { default: 'code' },
    })
    expect(wrapper.attributes('id')).toBe('code-1')
  })

  it('applies inline variant classes by default', () => {
    const wrapper = mount(DzCode, { slots: { default: 'code' } })
    expect(wrapper.classes().join(' ')).toContain('inline-block')
  })

  it('applies block variant classes', () => {
    const wrapper = mount(DzCode, {
      props: { variant: 'block' },
      slots: { default: 'code' },
    })
    expect(wrapper.classes().join(' ')).toContain('overflow-x-auto')
  })
})
