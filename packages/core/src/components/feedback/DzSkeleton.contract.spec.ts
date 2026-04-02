import { mount } from '@vue/test-utils'
/**
 * DzSkeleton — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props,
 * attributes) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzSkeleton from './DzSkeleton.vue'

describe('dzSkeleton — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=text, animate=true)', () => {
    const wrapper = mount(DzSkeleton)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('animate-pulse')
  })

  it('accepts all variant values', () => {
    const variants = ['text', 'circular', 'rectangular'] as const
    for (const variant of variants) {
      const wrapper = mount(DzSkeleton, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Accessibility --

  it('has aria-hidden="true"', () => {
    const wrapper = mount(DzSkeleton)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('has aria-hidden="true" on multi-line wrapper', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 3 } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  // -- Dimensions --

  it('accepts custom width', () => {
    const wrapper = mount(DzSkeleton, { props: { width: '200px' } })
    expect(wrapper.attributes('style')).toContain('width: 200px')
  })

  it('accepts custom height', () => {
    const wrapper = mount(DzSkeleton, { props: { height: '48px' } })
    expect(wrapper.attributes('style')).toContain('height: 48px')
  })

  it('accepts both width and height', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'rectangular', width: '100%', height: '200px' },
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('width: 100%')
    expect(style).toContain('height: 200px')
  })

  // -- Animation --

  it('applies animate-pulse when animate=true (default)', () => {
    const wrapper = mount(DzSkeleton)
    expect(wrapper.classes()).toContain('animate-pulse')
  })

  it('does not apply animate-pulse when animate=false', () => {
    const wrapper = mount(DzSkeleton, { props: { animate: false } })
    expect(wrapper.classes()).not.toContain('animate-pulse')
  })

  // -- Multi-line --

  it('renders multiple lines for text variant with lines > 1', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 3 } })
    const children = wrapper.element.children
    expect(children).toHaveLength(3)
  })

  it('renders single element when lines=1 (default)', () => {
    const wrapper = mount(DzSkeleton)
    // Single div with no child div elements
    expect(wrapper.element.children.length).toBe(0)
  })

  // -- Variant classes --

  it('applies text variant classes', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text' } })
    expect(wrapper.classes().join(' ')).toContain('rounded-[var(--dz-radius-sm)]')
  })

  it('applies circular variant classes', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'circular', width: '48px', height: '48px' },
    })
    expect(wrapper.classes().join(' ')).toContain('rounded-[var(--dz-radius-full)]')
  })

  it('applies rectangular variant classes', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'rectangular' } })
    expect(wrapper.classes().join(' ')).toContain('rounded-[var(--dz-radius-md)]')
  })
})
