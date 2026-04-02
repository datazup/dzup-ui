import { mount } from '@vue/test-utils'
/**
 * DzSpacer -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSpacer from './DzSpacer.vue'

describe('dzSpacer -- Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzSpacer)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('uses flex-1 for auto size (default)', () => {
    const wrapper = mount(DzSpacer)
    expect(wrapper.classes()).toContain('flex-1')
  })

  it('has aria-hidden="true"', () => {
    const wrapper = mount(DzSpacer)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('applies xs spacing token classes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'xs' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-1)]')
    expect(classStr).toContain('h-[var(--dz-spacing-1)]')
  })

  it('applies sm spacing token classes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'sm' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-2)]')
    expect(classStr).toContain('h-[var(--dz-spacing-2)]')
  })

  it('applies md spacing token classes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'md' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-4)]')
    expect(classStr).toContain('h-[var(--dz-spacing-4)]')
  })

  it('applies lg spacing token classes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'lg' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-6)]')
    expect(classStr).toContain('h-[var(--dz-spacing-6)]')
  })

  it('applies xl spacing token classes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'xl' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-8)]')
    expect(classStr).toContain('h-[var(--dz-spacing-8)]')
  })

  it('applies shrink-0 for fixed sizes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'md' } })
    expect(wrapper.classes()).toContain('shrink-0')
  })
})
