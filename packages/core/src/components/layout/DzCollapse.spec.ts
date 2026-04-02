import { mount } from '@vue/test-utils'
/**
 * DzCollapse — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzCollapse from './DzCollapse.vue'

describe('dzCollapse — Unit Tests', () => {
  it('renders a <div> with role="region"', () => {
    const wrapper = mount(DzCollapse, { slots: { default: 'content' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('sets data-state="closed" when collapsed', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-state')).toBe('closed')
  })

  it('sets data-state="open" when expanded', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-state')).toBe('open')
  })

  it('sets aria-hidden when collapsed', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('does not set aria-hidden when expanded', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('renders slot content', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: '<p>Inner content</p>' },
    })
    expect(wrapper.find('p').text()).toBe('Inner content')
  })

  it('applies overflow hidden style', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('style')).toContain('overflow')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzCollapse, {
      props: { id: 'collapse-1' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('id')).toBe('collapse-1')
  })
})
