import type { CoordinatorPattern } from './GovernanceBadge.types.ts'
/**
 * GovernanceBadge — Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GovernanceBadge from './GovernanceBadge.vue'

const PATTERNS: readonly CoordinatorPattern[] = [
  'supervisor',
  'contract_net',
  'blackboard',
  'peer_to_peer',
  'council',
] as const

const EXPECTED_LABELS: Readonly<Record<CoordinatorPattern, string>> = {
  supervisor: 'Supervisor',
  contract_net: 'Contract Net',
  blackboard: 'Blackboard',
  peer_to_peer: 'Peer to Peer',
  council: 'Council',
}

const EXPECTED_TOKENS: Readonly<Record<CoordinatorPattern, string>> = {
  supervisor: '--dz-primary',
  contract_net: '--dz-info',
  blackboard: '--dz-warning-solid',
  peer_to_peer: '--dz-success',
  council: '--dz-foreground',
}

describe('governanceBadge — Unit Tests', () => {
  it.each(PATTERNS)('maps pattern %s to a human-readable label', (pattern) => {
    const wrapper = mount(GovernanceBadge, { props: { pattern } })
    expect(wrapper.text()).toBe(EXPECTED_LABELS[pattern])
  })

  it.each(PATTERNS)('sets data-pattern attribute for %s', (pattern) => {
    const wrapper = mount(GovernanceBadge, { props: { pattern } })
    expect(wrapper.attributes('data-pattern')).toBe(pattern)
  })

  it.each(PATTERNS)('applies pattern-specific CSS token for %s', (pattern) => {
    const wrapper = mount(GovernanceBadge, { props: { pattern } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain(EXPECTED_TOKENS[pattern])
  })

  it('sets role="img" for assistive tech', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'supervisor' } })
    expect(wrapper.attributes('role')).toBe('img')
  })

  it('includes pattern label in aria-label', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'council' } })
    expect(wrapper.attributes('aria-label')).toContain('Council')
  })

  it('default slot overrides label', () => {
    const wrapper = mount(GovernanceBadge, {
      props: { pattern: 'blackboard' },
      slots: { default: 'Override' },
    })
    expect(wrapper.text()).toBe('Override')
  })

  it('applies pattern color as background and border in inline style', () => {
    const wrapper = mount(GovernanceBadge, { props: { pattern: 'peer_to_peer' } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('var(--dz-success)')
    expect(style).toContain('var(--dz-primary-foreground)')
  })
})
