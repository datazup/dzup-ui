import { mount } from '@vue/test-utils'
/**
 * DzRunStatusBadge — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzRunStatusBadge from './DzRunStatusBadge.vue'

describe('dzRunStatusBadge — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'PENDING' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical run status values', () => {
    const statuses = ['PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'] as const
    for (const status of statuses) {
      const wrapper = mount(DzRunStatusBadge, { props: { status } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzRunStatusBadge, { props: { status: 'RUNNING', size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders a human-readable label by default', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'COMPLETED' } })
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'RUNNING' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
