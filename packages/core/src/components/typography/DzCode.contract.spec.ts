import { mount } from '@vue/test-utils'
/**
 * DzCode — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCode from './DzCode.vue'

describe('dzCode — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCode, { slots: { default: 'const x = 1' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCode, { slots: { default: 'console.log("hello")' } })
    expect(wrapper.text()).toContain('console.log("hello")')
  })

  it('accepts variant values', () => {
    for (const variant of ['inline', 'block'] as const) {
      const wrapper = mount(DzCode, { props: { variant }, slots: { default: 'code' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts language prop', () => {
    const wrapper = mount(DzCode, {
      props: { language: 'typescript' },
      slots: { default: 'const x: number = 1' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCode, {
      attrs: { class: 'custom-class' },
      slots: { default: 'code' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
