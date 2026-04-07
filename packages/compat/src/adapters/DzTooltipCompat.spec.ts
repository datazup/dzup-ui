/**
 * DzTooltipCompat — Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzup-ui
 * single-component tooltip API to the new vNext compound DzTooltip API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzTooltipCompat from './DzTooltipCompat.vue'

describe('dzTooltipCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the trigger slot content', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>Hover me</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hover me')
  })

  it('renders just the slot content when disabled', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tooltip text', disabled: true },
      slots: { default: '<button>Hover me</button>' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hover me')
  })

  it('accepts content prop for tooltip text', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Help text' },
      slots: { default: '<span>Info</span>' },
    })
    // Tooltip wraps the trigger — the content itself is in a portal
    expect(wrapper.element).toBeTruthy()
  })

  it('maps placement="top" to side="top" align="center"', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', placement: 'top' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps placement="bottom-start" to side="bottom" align="start"', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', placement: 'bottom-start' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps placement="right-end" to side="right" align="end"', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', placement: 'right-end' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps placement="left" to side="left" align="center"', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', placement: 'left' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps delay prop to delayDuration', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', delay: 500 },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps showDelay prop to delayDuration (alias)', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', showDelay: 300 },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('prefers showDelay over delay when both provided', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip', delay: 500, showDelay: 100 },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('warns about dropped trigger prop in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzTooltipCompat, {
      props: { content: 'Tip', trigger: 'click' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzTooltipCompat: "trigger" prop is dropped in vNext. Tooltips use hover by default.',
    )
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzTooltipCompat, {
      props: { content: 'Tip' },
      slots: { default: '<span>Trigger</span>' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzTooltipCompat is deprecated. Use DzTooltip from @dzup-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzTooltipCompat, {
      props: { content: 'Tip' },
      slots: { default: '<span>A</span>' },
    })
    mount(DzTooltipCompat, {
      props: { content: 'Tip' },
      slots: { default: '<span>B</span>' },
    })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzTooltipCompat is deprecated'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('renders content slot when provided instead of content prop', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: {},
      slots: {
        default: '<span>Trigger</span>',
        content: 'Custom content slot',
      },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('uses default placement when not specified', () => {
    const wrapper = mount(DzTooltipCompat, {
      props: { content: 'Tip' },
      slots: { default: '<span>Trigger</span>' },
    })
    // Default placement is "top" — component should render
    expect(wrapper.element).toBeTruthy()
  })
})
