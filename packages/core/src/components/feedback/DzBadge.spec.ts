import { mount } from '@vue/test-utils'
/**
 * DzBadge — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzBadge from './DzBadge.vue'

describe('dzBadge — Unit Tests', () => {
  it('renders a <span> element', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Tag' } })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzBadge, {
      attrs: { class: 'my-badge' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.classes()).toContain('my-badge')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzBadge, {
      attrs: { 'data-testid': 'status-badge' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.attributes('data-testid')).toBe('status-badge')
  })

  it('applies solid+primary variant classes', () => {
    const wrapper = mount(DzBadge, {
      props: { variant: 'solid', tone: 'primary' },
      slots: { default: 'Tag' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-primary)]')
    expect(classStr).toContain('text-[var(--dz-primary-foreground)]')
  })

  it('applies outline+danger variant classes', () => {
    const wrapper = mount(DzBadge, {
      props: { variant: 'outline', tone: 'danger' },
      slots: { default: 'Tag' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('border-[var(--dz-danger)]')
    expect(classStr).toContain('text-[var(--dz-danger)]')
  })

  it('applies subtle+success variant classes', () => {
    const wrapper = mount(DzBadge, {
      props: { variant: 'subtle', tone: 'success' },
      slots: { default: 'Tag' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-success-muted)]')
    expect(classStr).toContain('text-[var(--dz-success)]')
  })

  it('applies sm size classes', () => {
    const wrapper = mount(DzBadge, {
      props: { size: 'sm' },
      slots: { default: 'Tag' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('px-[var(--dz-spacing-1.5)]')
  })

  it('applies lg size classes', () => {
    const wrapper = mount(DzBadge, {
      props: { size: 'lg' },
      slots: { default: 'Tag' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('px-[var(--dz-spacing-3)]')
  })

  it('has full border radius (pill shape)', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Tag' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('rounded-[var(--dz-radius-full)]')
  })

  it('includes inline-flex for alignment', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Tag' } })
    expect(wrapper.classes()).toContain('inline-flex')
  })

  it('has select-none to prevent text selection', () => {
    const wrapper = mount(DzBadge, { slots: { default: 'Tag' } })
    expect(wrapper.classes()).toContain('select-none')
  })
})
