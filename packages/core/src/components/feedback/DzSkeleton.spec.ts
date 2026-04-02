import { mount } from '@vue/test-utils'
/**
 * DzSkeleton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSkeleton from './DzSkeleton.vue'

describe('dzSkeleton — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzSkeleton)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSkeleton, {
      attrs: { class: 'my-skeleton' },
    })
    expect(wrapper.classes()).toContain('my-skeleton')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzSkeleton, {
      attrs: { 'data-testid': 'skeleton-placeholder' },
    })
    expect(wrapper.attributes('data-testid')).toBe('skeleton-placeholder')
  })

  it('uses muted background color token', () => {
    const wrapper = mount(DzSkeleton)
    expect(wrapper.classes().join(' ')).toContain('bg-[var(--dz-muted)]')
  })

  it('renders 3 lines for text variant with lines=3', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 3 } })
    // Root is the flex container; its direct children are the skeleton lines
    const children = wrapper.element.children
    expect(children).toHaveLength(3)
  })

  it('last line is shorter (75%) for multi-line text', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 3 } })
    const lastChild = wrapper.element.children[2] as HTMLElement
    expect(lastChild.style.width).toBe('75%')
  })

  it('first lines are 100% width for multi-line text', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 3 } })
    const children = wrapper.element.children
    expect((children[0] as HTMLElement).style.width).toBe('100%')
    expect((children[1] as HTMLElement).style.width).toBe('100%')
  })

  it('multi-line container has flex-col layout', () => {
    const wrapper = mount(DzSkeleton, { props: { variant: 'text', lines: 2 } })
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('applies custom width via style', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'circular', width: '64px', height: '64px' },
    })
    expect(wrapper.attributes('style')).toContain('width: 64px')
    expect(wrapper.attributes('style')).toContain('height: 64px')
  })

  it('does not apply inline style when no custom dimensions', () => {
    const wrapper = mount(DzSkeleton)
    const style = wrapper.attributes('style')
    if (style) {
      expect(style).not.toContain('width:')
      expect(style).not.toContain('height:')
    }
  })

  it('circular variant has full border radius', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'circular', width: '48px', height: '48px' },
    })
    expect(wrapper.classes().join(' ')).toContain('rounded-[var(--dz-radius-full)]')
  })

  it('rectangular variant has medium border radius', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'rectangular', width: '100%', height: '200px' },
    })
    expect(wrapper.classes().join(' ')).toContain('rounded-[var(--dz-radius-md)]')
  })

  it('custom width overrides line width in multi-line', () => {
    const wrapper = mount(DzSkeleton, {
      props: { variant: 'text', lines: 2, width: '300px' },
    })
    const children = wrapper.element.children
    expect((children[0] as HTMLElement).style.width).toBe('300px')
    expect((children[1] as HTMLElement).style.width).toBe('300px')
  })
})
