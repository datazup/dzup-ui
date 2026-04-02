import { mount } from '@vue/test-utils'
/**
 * DzStack -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzStack from './DzStack.vue'

describe('dzStack -- Unit Tests', () => {
  it('renders a <div> element by default', () => {
    const wrapper = mount(DzStack, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('uses flex-col for vertical direction (default)', () => {
    const wrapper = mount(DzStack, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('uses flex-row for horizontal direction', () => {
    const wrapper = mount(DzStack, {
      props: { direction: 'horizontal' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('applies items-start for align="start"', () => {
    const wrapper = mount(DzStack, {
      props: { align: 'start' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-start')
  })

  it('applies items-center for align="center"', () => {
    const wrapper = mount(DzStack, {
      props: { align: 'center' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-center')
  })

  it('applies items-end for align="end"', () => {
    const wrapper = mount(DzStack, {
      props: { align: 'end' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-end')
  })

  it('applies items-stretch for align="stretch"', () => {
    const wrapper = mount(DzStack, {
      props: { align: 'stretch' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('items-stretch')
  })

  it('renders as <ol> when as="ol"', () => {
    const wrapper = mount(DzStack, {
      props: { as: 'ol' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.element.tagName).toBe('OL')
  })

  it('renders multiple children', () => {
    const wrapper = mount(DzStack, {
      slots: {
        default: '<div data-testid="a">A</div><div data-testid="b">B</div>',
      },
    })
    expect(wrapper.find('[data-testid="a"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="b"]').exists()).toBe(true)
  })
})
