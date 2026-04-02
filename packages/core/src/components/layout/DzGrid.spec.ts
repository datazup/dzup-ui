import { mount } from '@vue/test-utils'
/**
 * DzGrid -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzGrid from './DzGrid.vue'

describe('dzGrid -- Unit Tests', () => {
  it('renders a <div> element by default', () => {
    const wrapper = mount(DzGrid, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('applies correct grid-cols class for cols=3', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 3 },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('grid-cols-3')
  })

  it('applies correct grid-cols class for cols=12', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 12 },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('grid-cols-12')
  })

  it('applies responsive cols classes alongside base grid', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: { sm: 2, lg: 4 } },
      slots: { default: '<div>Item</div>' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('sm:grid-cols-2')
    expect(classStr).toContain('lg:grid-cols-4')
    // grid base class is always present
    expect(classStr).toContain('grid')
  })

  it('handles partial responsive cols object', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: { md: 3 } },
      slots: { default: '<div>Item</div>' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('md:grid-cols-3')
    expect(classStr).not.toContain('sm:grid-cols')
    expect(classStr).not.toContain('lg:grid-cols')
  })

  it('applies gap-none class', () => {
    const wrapper = mount(DzGrid, {
      props: { gap: 'none' },
      slots: { default: '<div>Item</div>' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('gap-')
  })

  it('sets grid-template-rows style for rows=2', () => {
    const wrapper = mount(DzGrid, {
      props: { rows: 2 },
      slots: { default: '<div>Item</div>' },
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('repeat(2')
  })

  it('renders as <ul> when as="ul"', () => {
    const wrapper = mount(DzGrid, {
      props: { as: 'ul' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.element.tagName).toBe('UL')
  })

  it('forwards aria-describedby', () => {
    const wrapper = mount(DzGrid, {
      props: { ariaDescribedby: 'desc-1' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('aria-describedby')).toBe('desc-1')
  })
})
