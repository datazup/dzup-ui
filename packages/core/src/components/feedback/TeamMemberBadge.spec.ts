/**
 * TeamMemberBadge — Behavior tests.
 *
 * Verifies status-to-token mapping and slot prop forwarding.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { TEAM_MEMBER_STATUS_TOKENS } from './TeamMemberBadge.tokens.ts'
import TeamMemberBadge from './TeamMemberBadge.vue'

describe('teamMemberBadge — behavior', () => {
  it('maps idle status to the muted-foreground token in the dot style', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-idle',
        role: 'watcher',
        status: 'idle',
      },
    })
    const spans = wrapper.findAll('span')
    const dotSpan = spans.find((s) => {
      const style = s.attributes('style') ?? ''
      return style.includes('background-color')
    })
    expect(dotSpan).toBeDefined()
    expect(dotSpan!.attributes('style')).toContain(TEAM_MEMBER_STATUS_TOKENS.idle)
    expect(TEAM_MEMBER_STATUS_TOKENS.idle).toBe('var(--dz-muted-foreground)')
  })

  it('maps failed status to the danger token in the dot style', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-fail',
        role: 'executor',
        status: 'failed',
      },
    })
    const spans = wrapper.findAll('span')
    const dotSpan = spans.find((s) => {
      const style = s.attributes('style') ?? ''
      return style.includes('background-color')
    })
    expect(dotSpan).toBeDefined()
    expect(dotSpan!.attributes('style')).toContain(TEAM_MEMBER_STATUS_TOKENS.failed)
    expect(TEAM_MEMBER_STATUS_TOKENS.failed).toBe('var(--dz-danger)')
  })

  it('default slot receives role and status as slot props', () => {
    let capturedRole: string | undefined
    let capturedStatus: string | undefined

    mount(TeamMemberBadge, {
      props: {
        participantId: 'p-slot',
        role: 'planner',
        status: 'active',
      },
      slots: {
        default: ({ role, status }: { role: string, status: string }) => {
          capturedRole = role
          capturedStatus = status
          return role
        },
      },
    })

    expect(capturedRole).toBe('planner')
    expect(capturedStatus).toBe('active')
  })

  it('maps active status to the success token in the dot style', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-active',
        role: 'runner',
        status: 'active',
      },
    })
    const spans = wrapper.findAll('span')
    const dotSpan = spans.find((s) => {
      const style = s.attributes('style') ?? ''
      return style.includes('background-color')
    })
    expect(dotSpan).toBeDefined()
    expect(dotSpan!.attributes('style')).toContain(TEAM_MEMBER_STATUS_TOKENS.active)
    expect(TEAM_MEMBER_STATUS_TOKENS.active).toBe('var(--dz-success)')
  })

  it('maps completed status to the success token in the dot style', () => {
    const wrapper = mount(TeamMemberBadge, {
      props: {
        participantId: 'p-done',
        role: 'finalizer',
        status: 'completed',
      },
    })
    const spans = wrapper.findAll('span')
    const dotSpan = spans.find((s) => {
      const style = s.attributes('style') ?? ''
      return style.includes('background-color')
    })
    expect(dotSpan).toBeDefined()
    expect(dotSpan!.attributes('style')).toContain(TEAM_MEMBER_STATUS_TOKENS.completed)
    expect(TEAM_MEMBER_STATUS_TOKENS.completed).toBe('var(--dz-success)')
  })
})
