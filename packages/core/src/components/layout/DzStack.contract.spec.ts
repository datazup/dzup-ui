import { mount } from '@vue/test-utils'
/**
 * DzStack -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzStack from './DzStack.vue'

describe('dzStack -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (direction=vertical, gap=md)', () => {
    const wrapper = mount(DzStack, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('renders horizontal stack as flex-row', () => {
    const wrapper = mount(DzStack, {
      props: { direction: 'horizontal' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('accepts all canonical gap values', () => {
    const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const gap of gaps) {
      const wrapper = mount(DzStack, {
        props: { gap },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical align values', () => {
    const aligns = ['start', 'center', 'end', 'stretch'] as const
    for (const align of aligns) {
      const wrapper = mount(DzStack, {
        props: { align },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Dynamic element --

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzStack, {
      props: { as: 'ul' },
      slots: { default: '<li>Item</li>' },
    })
    expect(wrapper.element.tagName).toBe('UL')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzStack, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStack, {
      attrs: { class: 'my-stack' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('my-stack')
  })

  // -- ARIA --

  it('forwards aria-label', () => {
    const wrapper = mount(DzStack, {
      props: { ariaLabel: 'Action list' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Action list')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzStack, {
      slots: { default: '<span data-testid="stack-child">Content</span>' },
    })
    expect(wrapper.find('[data-testid="stack-child"]').exists()).toBe(true)
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzStack, {
      attrs: { 'data-testid': 'stack' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('data-testid')).toBe('stack')
  })
})
