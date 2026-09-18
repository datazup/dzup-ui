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

  // -- Direction aliases (TASK-R3-O3) --

  it('accepts `row` and `column` as additive aliases of `horizontal` and `vertical`', () => {
    const pairs = [
      ['row', 'horizontal', 'flex-row'],
      ['column', 'vertical', 'flex-col'],
    ] as const
    for (const [alias, original, expected] of pairs) {
      const viaAlias = mount(DzStack, { props: { direction: alias }, slots: { default: '<div>Item</div>' } })
      const viaOriginal = mount(DzStack, { props: { direction: original }, slots: { default: '<div>Item</div>' } })
      expect(viaAlias.classes(), alias).toContain(expected)
      // The alias is the same component output, not a near-copy of it.
      expect(viaAlias.classes().sort(), alias).toEqual(viaOriginal.classes().sort())
    }
  })

  it('keeps every direction writing-mode relative under dir="rtl" — no -reverse, no physical spacing', () => {
    for (const direction of ['vertical', 'horizontal', 'row', 'column'] as const) {
      const host = mount({
        components: { DzStack },
        template: `<div dir="rtl"><DzStack direction="${direction}"><span>a</span><span>b</span></DzStack></div>`,
      })
      const classes = host.find('div > div').classes().join(' ')
      expect(classes, direction).not.toMatch(/flex-(?:row|col)-reverse/)
      expect(classes, direction).not.toMatch(/(?:^|\s)-?(?:ml|mr|pl|pr|left|right)-/)
      expect(host.findAll('span').map(s => s.text()), direction).toEqual(['a', 'b'])
    }
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
