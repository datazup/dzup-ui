import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  useDzDirection,
  useDzLocale,
  useDzMessages,
  useDzMotion,
  useDzNonce,
  useDzPortalTarget,
  useDzTestIds,
} from '../composables/provider/index.ts'
import { anatomy } from './DzProvider.anatomy.ts'
import DzProvider from './DzProvider.vue'

/**
 * DzProvider — Contract Spec v1 conformance tests.
 *
 * A provider's contract is unusual: almost none of it is rendered, so the
 * things a consumer can rely on are (a) that it renders **nothing**, and (b)
 * that each prop reaches exactly the composable that reads it. Both are checked
 * here rather than inferred from the unit suite, because both are promises a
 * refactor could break silently — a wrapper element would go unnoticed by every
 * behavioural test in `DzProvider.spec.ts`.
 */

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('dir')
})

describe('dzProvider — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzProvider, { slots: { default: '<span>child</span>' } })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Anatomy ──

  it('conforms to its declared anatomy', () => {
    const wrapper = mount(DzProvider, { slots: { default: '<span>child</span>' } })
    expectAnatomy(wrapper, anatomy)
  })

  it('emits no element of its own', () => {
    // `parts: 'none'` is the promise the shadow-DOM recipe and every layout
    // composition depend on: a provider between a flex container and its
    // children must not become a flex item.
    const wrapper = mount(DzProvider, {
      slots: { default: '<span data-testid="a">A</span><span data-testid="b">B</span>' },
    })
    // Two slot roots stay two roots: nothing wrapped them, and no element the
    // provider owns appears between them.
    expect(wrapper.findAll('span')).toHaveLength(2)
    expect(wrapper.html()).not.toContain('<div')
    expect(wrapper.html()).not.toContain('data-part')
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzProvider, { slots: { default: '<p>Application</p>' } })
    expect(wrapper.text()).toBe('Application')
  })

  // ── Props reach the composables that read them ──

  it('routes every prop to its composable', () => {
    const seen: Record<string, unknown> = {}

    const Child = defineComponent({
      setup() {
        seen.locale = useDzLocale().value
        seen.direction = useDzDirection().value
        seen.portal = useDzPortalTarget().value
        seen.nonce = useDzNonce().value
        seen.motion = useDzMotion().preference.value
        seen.message = useDzMessages().read('DzPagination.next', 'Next')
        seen.testId = useDzTestIds().testId('root')
        return () => h('div')
      },
    })

    mount(DzProvider, {
      props: {
        locale: 'ar-EG',
        direction: 'auto',
        messages: { DzPagination: { next: 'التالي' } },
        portal: '#dz-portal',
        motion: 'reduced',
        nonce: 'nonce-1',
        testIdPrefix: 'e2e',
      },
      slots: { default: () => h(Child) },
    })

    expect(seen).toEqual({
      locale: 'ar-EG',
      direction: 'rtl',
      portal: '#dz-portal',
      nonce: 'nonce-1',
      motion: 'reduced',
      message: 'التالي',
      testId: { 'data-testid': 'e2e-root' },
    })
  })

  // ── Defaults ──

  it('leaves every concern at its documented default when no prop is set', () => {
    const seen: Record<string, unknown> = {}

    const Child = defineComponent({
      setup() {
        seen.locale = useDzLocale().value
        seen.direction = useDzDirection().value
        seen.portal = useDzPortalTarget().value
        seen.nonce = useDzNonce().value
        seen.testId = useDzTestIds().testId('root')
        return () => h('div')
      },
    })

    mount(DzProvider, { slots: { default: () => h(Child) } })

    expect(seen).toEqual({
      locale: 'en-US',
      direction: 'ltr',
      portal: undefined,
      nonce: undefined,
      testId: undefined,
    })
  })
})
