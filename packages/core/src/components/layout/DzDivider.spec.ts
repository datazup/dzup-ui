import { mount } from '@vue/test-utils'
/**
 * DzDivider -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzDivider from './DzDivider.vue'

describe('dzDivider -- Unit Tests', () => {
  it('renders as <hr> by default (horizontal)', () => {
    const wrapper = mount(DzDivider)
    expect(wrapper.element.tagName).toBe('HR')
  })

  it('renders as <div> when vertical', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('has role="separator" by default', () => {
    const wrapper = mount(DzDivider)
    expect(wrapper.attributes('role')).toBe('separator')
  })

  it('has role="none" when decorative', () => {
    const wrapper = mount(DzDivider, { props: { decorative: true } })
    expect(wrapper.attributes('role')).toBe('none')
  })

  it('sets aria-orientation="horizontal" by default', () => {
    const wrapper = mount(DzDivider)
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
  })

  it('sets aria-orientation="vertical" when vertical', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('omits aria-orientation when decorative', () => {
    const wrapper = mount(DzDivider, { props: { decorative: true } })
    expect(wrapper.attributes('aria-orientation')).toBeUndefined()
  })

  it('applies shrink-0 base class', () => {
    const wrapper = mount(DzDivider)
    expect(wrapper.classes()).toContain('shrink-0')
  })

  it('uses border token variable in class', () => {
    const wrapper = mount(DzDivider)
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-border)]')
  })

  it('applies h-px and w-full for horizontal', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'horizontal' } })
    expect(wrapper.classes()).toContain('h-px')
    expect(wrapper.classes()).toContain('w-full')
  })

  it('applies w-px and h-full for vertical', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.classes()).toContain('w-px')
    expect(wrapper.classes()).toContain('h-full')
  })
})
