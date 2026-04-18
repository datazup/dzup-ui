/**
 * DzRunStatusBadge — Unit / behavior tests.
 */
import type { RunStatus } from '@datazup/dzupagent-orchestration-kit'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzRunStatusBadge from './DzRunStatusBadge.vue'

const STATUSES: readonly RunStatus[] = [
  'PENDING',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const

describe('dzRunStatusBadge — Unit Tests', () => {
  it('renders with RUNNING status and default label', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'RUNNING' } })
    expect(wrapper.text()).toBe('Running')
  })

  it('sets data-status attribute to the status value', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'COMPLETED' } })
    expect(wrapper.attributes('data-status')).toBe('COMPLETED')
  })

  it('applies the status CSS var as background color', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'RUNNING' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('var(--dz-status-running)')
  })

  it.each(STATUSES)('renders a human-readable label for %s', (status) => {
    const wrapper = mount(DzRunStatusBadge, { props: { status } })
    const label = wrapper.text()
    expect(label.length).toBeGreaterThan(0)
    expect(label).toBe(label[0] + label.slice(1).toLowerCase())
  })

  it('maps each status to its CSS var', () => {
    const expected: Record<RunStatus, string> = {
      PENDING: '--dz-status-pending',
      RUNNING: '--dz-status-running',
      PAUSED: '--dz-status-paused',
      COMPLETED: '--dz-status-completed',
      FAILED: '--dz-status-failed',
      CANCELLED: '--dz-status-cancelled',
    }
    for (const status of STATUSES) {
      const wrapper = mount(DzRunStatusBadge, { props: { status } })
      expect(wrapper.attributes('style') ?? '').toContain(expected[status])
    }
  })

  it('has role="status" for assistive tech', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'FAILED' } })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('includes status in the aria-label', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'PAUSED' } })
    expect(wrapper.attributes('aria-label')).toContain('Paused')
  })

  it('accepts sm size prop', () => {
    const wrapper = mount(DzRunStatusBadge, { props: { status: 'RUNNING', size: 'sm' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('slot override replaces default label', () => {
    const wrapper = mount(DzRunStatusBadge, {
      props: { status: 'COMPLETED' },
      slots: { default: 'Done!' },
    })
    expect(wrapper.text()).toBe('Done!')
  })
})
