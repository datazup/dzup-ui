import { mount } from '@vue/test-utils'
/**
 * DzGrid -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzGrid from './DzGrid.vue'

describe('dzGrid -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (cols=1, gap=md)', () => {
    const wrapper = mount(DzGrid, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.classes()).toContain('grid')
    expect(wrapper.classes()).toContain('grid-cols-1')
  })

  it('accepts all canonical cols values', () => {
    const colValues = [1, 2, 3, 4, 5, 6, 12] as const
    for (const cols of colValues) {
      const wrapper = mount(DzGrid, {
        props: { cols },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.classes()).toContain(`grid-cols-${cols}`)
    }
  })

  it('accepts all canonical gap values', () => {
    const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const gap of gaps) {
      const wrapper = mount(DzGrid, {
        props: { gap },
        slots: { default: '<div>Item</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Responsive cols --

  it('accepts responsive cols object', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: { sm: 1, md: 2, lg: 4 } },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('grid')
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('sm:grid-cols-1')
    expect(classStr).toContain('md:grid-cols-2')
    expect(classStr).toContain('lg:grid-cols-4')
  })

  // -- Dynamic element --

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzGrid, {
      props: { as: 'section' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzGrid, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- Rows --

  it('sets grid-template-rows when rows prop is provided', () => {
    const wrapper = mount(DzGrid, {
      props: { rows: 3 },
      slots: { default: '<div>Item</div>' },
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-rows')
    expect(style).toContain('repeat(3')
  })

  it('does not set grid-template-rows when rows is not provided', () => {
    const wrapper = mount(DzGrid, { slots: { default: '<div>Item</div>' } })
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzGrid, {
      attrs: { class: 'my-grid' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.classes()).toContain('my-grid')
  })

  // -- ARIA --

  it('forwards aria-label', () => {
    const wrapper = mount(DzGrid, {
      props: { ariaLabel: 'Product grid' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Product grid')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzGrid, {
      slots: { default: '<div data-testid="grid-item">Content</div>' },
    })
    expect(wrapper.find('[data-testid="grid-item"]').exists()).toBe(true)
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzGrid, {
      attrs: { 'data-testid': 'grid' },
      slots: { default: '<div>Item</div>' },
    })
    expect(wrapper.attributes('data-testid')).toBe('grid')
  })
})
