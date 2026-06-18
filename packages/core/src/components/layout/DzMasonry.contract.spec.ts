import { mount } from '@vue/test-utils'
/**
 * DzMasonry -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzMasonry from './DzMasonry.vue'

const items = {
  default: Array.from({ length: 6 }, (_, i) => `<div class="item">Item ${i + 1}</div>`).join(''),
}

describe('dzMasonry -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders the CSS multi-column fast path by default (sequential)', () => {
    const wrapper = mount(DzMasonry, { slots: items })
    // Default columns=3 -> columns-3 utility on the root.
    expect(wrapper.classes()).toContain('columns-3')
    // CSS path keeps a single flat child list (no column wrappers).
    expect(wrapper.find('.dz-masonry__column').exists()).toBe(false)
  })

  it('accepts all canonical column counts in the CSS path', () => {
    const counts = [1, 2, 3, 4, 5, 6] as const
    for (const columns of counts) {
      const wrapper = mount(DzMasonry, { props: { columns }, slots: items })
      expect(wrapper.classes()).toContain(`columns-${columns}`)
    }
  })

  it('accepts all canonical gap values', () => {
    const gaps = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const gap of gaps) {
      const wrapper = mount(DzMasonry, { props: { gap }, slots: items })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Responsive columns --

  it('accepts a responsive columns object keyed by breakpoint', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: { xs: 1, md: 2, lg: 3 } },
      slots: items,
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('columns-1')
    expect(classStr).toContain('md:columns-2')
    expect(classStr).toContain('lg:columns-3')
  })

  // -- Gap tokens --

  it('publishes the resolved gap as the --dz-masonry-gap custom property', () => {
    const wrapper = mount(DzMasonry, { props: { gap: 'lg' }, slots: items })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('--dz-masonry-gap')
    expect(style).toContain('var(--dz-spacing-6)')
  })

  // -- Dynamic element --

  it('renders as the specified HTML element via "as"', () => {
    const wrapper = mount(DzMasonry, { props: { as: 'section' }, slots: items })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzMasonry, { slots: items })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- Measured-JS path --

  it('renders one wrapper per column in the measured-JS path', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 3, sequential: false },
      slots: items,
    })
    expect(wrapper.findAll('.dz-masonry__column')).toHaveLength(3)
  })

  it('preserves every item across columns in the measured-JS path', () => {
    const wrapper = mount(DzMasonry, {
      props: { columns: 3, sequential: false },
      slots: items,
    })
    expect(wrapper.findAll('.dz-masonry__item')).toHaveLength(6)
  })

  // -- a11y: ordered mode keeps source order via the CSS path --

  it('ordered mode forces the CSS path even when sequential is false', () => {
    const wrapper = mount(DzMasonry, {
      props: { sequential: false, ordered: true, columns: 3 },
      slots: items,
    })
    expect(wrapper.find('.dz-masonry__column').exists()).toBe(false)
    expect(wrapper.classes()).toContain('columns-3')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMasonry, {
      attrs: { class: 'my-wall' },
      slots: items,
    })
    expect(wrapper.classes()).toContain('my-wall')
  })

  // -- ARIA --

  it('forwards aria-label', () => {
    const wrapper = mount(DzMasonry, {
      props: { ariaLabel: 'Photo wall' },
      slots: items,
    })
    expect(wrapper.attributes('aria-label')).toBe('Photo wall')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzMasonry, {
      slots: { default: '<div data-testid="masonry-item">Content</div>' },
    })
    expect(wrapper.find('[data-testid="masonry-item"]').exists()).toBe(true)
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzMasonry, {
      attrs: { 'data-testid': 'masonry' },
      slots: items,
    })
    expect(wrapper.attributes('data-testid')).toBe('masonry')
  })
})
