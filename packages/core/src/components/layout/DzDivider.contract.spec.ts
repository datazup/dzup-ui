import { mount } from '@vue/test-utils'
/**
 * DzDivider -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDivider from './DzDivider.vue'

describe('dzDivider -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (orientation=horizontal, decorative=false)', () => {
    const wrapper = mount(DzDivider)
    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.attributes('role')).toBe('separator')
  })

  it('accepts all canonical orientation values', () => {
    const orientations = ['horizontal', 'vertical'] as const
    for (const orientation of orientations) {
      const wrapper = mount(DzDivider, { props: { orientation } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Element rendering --

  it('renders as <hr> when horizontal', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'horizontal' } })
    expect(wrapper.element.tagName).toBe('HR')
  })

  it('renders as <div> when vertical', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- ARIA roles --

  it('sets role="separator" when not decorative', () => {
    const wrapper = mount(DzDivider, { props: { decorative: false } })
    expect(wrapper.attributes('role')).toBe('separator')
  })

  it('sets role="none" when decorative', () => {
    const wrapper = mount(DzDivider, { props: { decorative: true } })
    expect(wrapper.attributes('role')).toBe('none')
  })

  it('sets aria-orientation when not decorative', () => {
    const wrapper = mount(DzDivider, {
      props: { orientation: 'vertical', decorative: false },
    })
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })

  it('omits aria-orientation when decorative', () => {
    const wrapper = mount(DzDivider, {
      props: { orientation: 'vertical', decorative: true },
    })
    expect(wrapper.attributes('aria-orientation')).toBeUndefined()
  })

  // -- Styling --

  it('applies horizontal styles', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'horizontal' } })
    expect(wrapper.classes()).toContain('h-px')
    expect(wrapper.classes()).toContain('w-full')
  })

  it('applies vertical styles', () => {
    const wrapper = mount(DzDivider, { props: { orientation: 'vertical' } })
    expect(wrapper.classes()).toContain('w-px')
    expect(wrapper.classes()).toContain('h-full')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDivider, {
      attrs: { class: 'my-divider' },
    })
    expect(wrapper.classes()).toContain('my-divider')
  })

  // -- ARIA labels --

  it('forwards aria-label', () => {
    const wrapper = mount(DzDivider, {
      props: { ariaLabel: 'Section separator' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Section separator')
  })

  it('forwards id attribute', () => {
    const wrapper = mount(DzDivider, {
      props: { id: 'main-divider' },
    })
    expect(wrapper.attributes('id')).toBe('main-divider')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzDivider, {
      attrs: { 'data-testid': 'divider' },
    })
    expect(wrapper.attributes('data-testid')).toBe('divider')
  })
})
