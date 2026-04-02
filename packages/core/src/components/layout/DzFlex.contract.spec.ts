import { mount } from '@vue/test-utils'
/**
 * DzFlex -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzFlex from './DzFlex.vue'

describe('dzFlex -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (direction=row, gap=md)', () => {
    const wrapper = mount(DzFlex, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-row')
  })

  it('accepts all canonical direction values', () => {
    const directions = ['row', 'column', 'row-reverse', 'column-reverse'] as const
    for (const direction of directions) {
      const wrapper = mount(DzFlex, {
        props: { direction },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical align values', () => {
    const aligns = ['start', 'center', 'end', 'stretch', 'baseline'] as const
    for (const align of aligns) {
      const wrapper = mount(DzFlex, {
        props: { align },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical justify values', () => {
    const justifies = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const
    for (const justify of justifies) {
      const wrapper = mount(DzFlex, {
        props: { justify },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical gap values', () => {
    const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const gap of gaps) {
      const wrapper = mount(DzFlex, {
        props: { gap },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Inline --

  it('uses inline-flex when inline=true', () => {
    const wrapper = mount(DzFlex, {
      props: { inline: true },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('inline-flex')
  })

  it('uses flex when inline=false', () => {
    const wrapper = mount(DzFlex, {
      props: { inline: false },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex')
  })

  // -- Wrap --

  it('applies flex-wrap when wrap=true', () => {
    const wrapper = mount(DzFlex, {
      props: { wrap: true },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('flex-wrap')
  })

  // -- Dynamic element --

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzFlex, {
      props: { as: 'nav' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.element.tagName).toBe('NAV')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzFlex, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFlex, {
      attrs: { class: 'my-flex' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('my-flex')
  })

  // -- ARIA --

  it('forwards aria-label', () => {
    const wrapper = mount(DzFlex, {
      props: { ariaLabel: 'Toolbar' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Toolbar')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzFlex, {
      slots: { default: '<span data-testid="flex-child">Content</span>' },
    })
    expect(wrapper.find('[data-testid="flex-child"]').exists()).toBe(true)
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzFlex, {
      attrs: { 'data-testid': 'flex-container' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('data-testid')).toBe('flex-container')
  })
})
