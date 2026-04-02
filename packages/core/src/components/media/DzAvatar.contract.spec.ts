import { mount } from '@vue/test-utils'
/**
 * DzAvatar — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzAvatar from './DzAvatar.vue'

describe('dzAvatar — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAvatar)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzAvatar, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts shape values', () => {
    for (const shape of ['circle', 'square'] as const) {
      const wrapper = mount(DzAvatar, { props: { shape } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('displays fallback text when no src', () => {
    const wrapper = mount(DzAvatar, { props: { fallback: 'JD' } })
    expect(wrapper.text()).toContain('JD')
  })

  it('renders default slot (custom fallback)', () => {
    const wrapper = mount(DzAvatar, {
      slots: { default: '<span data-testid="custom">Custom</span>' },
    })
    expect(wrapper.find('[data-testid="custom"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAvatar, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
