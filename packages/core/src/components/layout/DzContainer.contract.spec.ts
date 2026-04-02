import { mount } from '@vue/test-utils'
/**
 * DzContainer -- Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots,
 * class merging) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzContainer from './DzContainer.vue'

describe('dzContainer -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (maxWidth=xl, padding=true, centered=true)', () => {
    const wrapper = mount(DzContainer, { slots: { default: 'Content' } })
    expect(wrapper.text()).toContain('Content')
    expect(wrapper.classes()).toContain('mx-auto')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.classes()).toContain('max-w-screen-xl')
  })

  it('accepts all canonical maxWidth values', () => {
    const widths = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const
    for (const maxWidth of widths) {
      const wrapper = mount(DzContainer, {
        props: { maxWidth },
        slots: { default: 'Content' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzContainer, {
      props: { as: 'section' },
      slots: { default: 'Content' },
    })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('renders as div by default', () => {
    const wrapper = mount(DzContainer, { slots: { default: 'Content' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  // -- Padding --

  it('applies padding classes when padding=true', () => {
    const wrapper = mount(DzContainer, {
      props: { padding: true },
      slots: { default: 'Content' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('px-')
  })

  it('omits padding classes when padding=false', () => {
    const wrapper = mount(DzContainer, {
      props: { padding: false },
      slots: { default: 'Content' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).not.toContain('px-')
  })

  // -- Centering --

  it('applies mx-auto when centered=true', () => {
    const wrapper = mount(DzContainer, {
      props: { centered: true },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('mx-auto')
  })

  it('omits mx-auto when centered=false', () => {
    const wrapper = mount(DzContainer, {
      props: { centered: false },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).not.toContain('mx-auto')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzContainer, {
      attrs: { class: 'my-custom-class' },
      slots: { default: 'Content' },
    })
    expect(wrapper.classes()).toContain('my-custom-class')
  })

  // -- ARIA --

  it('forwards aria-label', () => {
    const wrapper = mount(DzContainer, {
      props: { ariaLabel: 'Main content' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Main content')
  })

  it('forwards id attribute', () => {
    const wrapper = mount(DzContainer, {
      props: { id: 'main-container' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('id')).toBe('main-container')
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzContainer, { slots: { default: 'Hello World' } })
    expect(wrapper.text()).toContain('Hello World')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzContainer, {
      attrs: { 'data-testid': 'container' },
      slots: { default: 'Content' },
    })
    expect(wrapper.attributes('data-testid')).toBe('container')
  })
})
