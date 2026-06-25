/**
 * TeamMemberBadge — Contract Spec v1 conformance tests.
 *
 * Verifies the public API surface: props, attributes, slots, and
 * accessibility requirements.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TeamMemberBadge from './TeamMemberBadge.vue'
import type { TeamMemberStatus } from './TeamMemberBadge.types.ts'

const ALL_STATUSES: TeamMemberStatus[] = ['idle', 'active', 'completed', 'failed']
const ALL_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

describe('TeamMemberBadge — Contract Spec v1', () => {
  it('renders without errors with required props', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'planner',
        status: 'idle',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it.each(ALL_STATUSES)('accepts status value "%s"', (status) => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'executor',
        status,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('sets data-status attribute from the status prop', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'planner',
        status: 'active',
      },
    })
    expect(wrapper.attributes('data-status')).toBe('active')
  })

  it('sets data-participant-id attribute from the participantId prop', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'participant-xyz',
        role: 'reviewer',
        status: 'completed',
      },
    })
    expect(wrapper.attributes('data-participant-id')).toBe('participant-xyz')
  })

  it('renders role text in the default slot by default', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-002',
        role: 'executor',
        status: 'idle',
      },
    })
    expect(wrapper.text()).toContain('executor')
  })

  it.each(ALL_SIZES)('accepts size "%s"', (size) => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'tester',
        status: 'idle',
        size,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a colored dot element with a background style containing var(--dz-', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-003',
        role: 'planner',
        status: 'active',
      },
    })
    // Find the dot span: a child span without text content
    const spans = wrapper.findAll('span')
    const dotSpan = spans.find((s) => {
      const style = s.attributes('style') ?? ''
      return style.includes('var(--dz-')
    })
    expect(dotSpan).toBeDefined()
    expect(dotSpan!.attributes('style')).toContain('var(--dz-')
  })

  it('has role="status" for accessibility', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'executor',
        status: 'idle',
      },
    })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('has an aria-label combining role and status', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-001',
        role: 'planner',
        status: 'failed',
      },
    })
    expect(wrapper.attributes('aria-label')).toBe('planner – failed')
  })
})
