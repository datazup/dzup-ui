import { mount } from '@vue/test-utils'
/**
 * GovernanceBadge — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import GovernanceBadge from './GovernanceBadge.vue'

describe('governanceBadge — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'supervisor' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all 5 coordinator pattern values', () => {
    const patterns = [
      'supervisor',
      'contract_net',
      'blackboard',
      'peer_to_peer',
      'council',
    ] as const
    for (const pattern of patterns) {
      const wrapper = mount(GovernanceBadge, { props: { pattern } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('sets data-pattern attribute', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'blackboard' } })
    expect(wrapper.attributes('data-pattern')).toBe('blackboard')
  })

  it('applies pattern-specific inline style', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'supervisor' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('var(--dz-primary-solid)')
  })

  it('renders human-readable label by default', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'contract_net' } })
    expect(wrapper.text()).toBe('Contract Net')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(GovernanceBadge, { props: { pattern: 'council', size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all variant values', () => {
    const variants = ['solid', 'outline', 'subtle'] as const
    for (const variant of variants) {
      const wrapper = mount(GovernanceBadge, { props: { pattern: 'supervisor', variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(GovernanceBadge, {
      props: { pattern: 'council' },
      slots: { default: 'Custom Label' },
    })
    expect(wrapper.text()).toBe('Custom Label')
  })
})
