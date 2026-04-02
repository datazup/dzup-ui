import { mount } from '@vue/test-utils'
/**
 * DzSpacer -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzSpacer from './DzSpacer.vue'

describe('dzSpacer -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (size=auto)', () => {
    const wrapper = mount(DzSpacer)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('flex-1')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'auto'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSpacer, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Size mapping --

  it('uses flex-1 for auto size', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'auto' } })
    expect(wrapper.classes()).toContain('flex-1')
  })

  it('uses fixed dimensions for non-auto sizes', () => {
    const wrapper = mount(DzSpacer, { props: { size: 'md' } })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('w-[var(--dz-spacing-4)]')
    expect(classStr).toContain('h-[var(--dz-spacing-4)]')
  })

  // -- Accessibility --

  it('has aria-hidden="true" (decorative element)', () => {
    const wrapper = mount(DzSpacer)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSpacer, {
      attrs: { class: 'my-spacer' },
    })
    expect(wrapper.classes()).toContain('my-spacer')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzSpacer, {
      attrs: { 'data-testid': 'spacer' },
    })
    expect(wrapper.attributes('data-testid')).toBe('spacer')
  })
})
