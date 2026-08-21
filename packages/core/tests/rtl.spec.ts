import { expectRtl, forwardArrow } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { anatomy as buttonAnatomy } from '../src/components/buttons/DzButton.anatomy.ts'
import DzButton from '../src/components/buttons/DzButton.vue'
import { anatomy as tableAnatomy } from '../src/components/data/DzTable.anatomy.ts'
import DzTable from '../src/components/data/DzTable.vue'
import { anatomy as inputAnatomy } from '../src/components/inputs/DzInput.anatomy.ts'
import DzInput from '../src/components/inputs/DzInput.vue'
import { useTabs } from '../src/composables/useTabs/index.ts'
import DzProvider from '../src/providers/DzProvider.vue'

/**
 * RTL conformance (TASK-OSS-P4-05, ADR-19 §`rtl`).
 *
 * Three claims, and they are checked in different places on purpose:
 *
 *   1. **A component that declares `mirrors: 'layout'` renders no physical
 *      left/right utility.** Source-level, so it runs here and catches a
 *      regression the day it is written. `yarn validate:rtl` applies the same
 *      rule repo-wide from the manifest.
 *   2. **A component that declares `keyboard: 'swap-horizontal'` actually
 *      swaps.** Behavioural, and the one most likely to be got wrong: APG's
 *      tabs pattern is written as "previous/next", and hard-coding ArrowRight
 *      as next means an Arabic user pressing the key that points at the next
 *      tab gets the previous one.
 *   3. **The resolved physical edge is correct.** NOT checked here — jsdom does
 *      no layout, so `getComputedStyle` cannot resolve a class-driven
 *      `margin-inline-start`. `expectRtlComputed` throws rather than passing
 *      vacuously, and belongs to the browser lane.
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
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-theme')
})

/** Mount `component` inside a provider declaring an RTL locale. */
function underRtl(component: unknown, props: Record<string, unknown> = {}, slots = {}) {
  return mount(
    defineComponent({
      setup: () => () => h(
        DzProvider,
        { locale: 'ar-EG' },
        { default: () => h(component as never, props, slots) },
      ),
    }),
    { attachTo: document.body },
  )
}

describe('declared layout mirroring', () => {
  it('dzButton renders no physical utility', () => {
    expectRtl(underRtl(DzButton, {}, { default: () => 'حفظ' }), buttonAnatomy.rtl)
  })

  it('dzInput renders no physical utility', () => {
    expectRtl(underRtl(DzInput, { modelValue: 'قيمة', clearable: true }), inputAnatomy.rtl)
  })

  it('dzTable renders no physical utility', () => {
    // The one this packet actually fixed: `headerCell` and `cell` were
    // `text-left`, so every cell in an Arabic table aligned against the wrong
    // edge while the table itself mirrored.
    expectRtl(underRtl(DzTable, {}, { default: () => h('tbody') }), tableAnatomy.rtl)
  })

  it('refuses to pass when a component declares nothing', () => {
    // A helper that quietly succeeded on an undeclared component would let the
    // rollout look finished while most of the catalog says nothing at all.
    expect(() => expectRtl(underRtl(DzButton), undefined)).toThrow(/no RTL declaration/)
  })

  it('reports the physical utility and its logical replacement', () => {
    const el = document.createElement('div')
    el.className = 'ms-2 pl-4 text-left'
    expect(() => expectRtl(el, { mirrors: 'layout', keyboard: 'none' }))
      .toThrow(/`pl-4`.*`ps`/s)
  })
})

describe('the direction the provider resolves', () => {
  it('reflects dir="rtl" onto <html> for an Arabic locale', () => {
    underRtl(DzButton, {}, { default: () => 'حفظ' })
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  })
})

describe('keyboard: swap-horizontal', () => {
  /** Drive `useTabs` inside a provider and return its keydown handler. */
  function tabsUnder(locale: string) {
    let api!: ReturnType<typeof useTabs>
    const Child = defineComponent({
      setup() {
        api = useTabs({ modelValue: 'a', orientation: 'horizontal' })
        api.registerTab({ id: 'a', label: 'A' })
        api.registerTab({ id: 'b', label: 'B' })
        api.registerTab({ id: 'c', label: 'C' })
        return () => h('div')
      },
    })
    mount(defineComponent({
      setup: () => () => h(DzProvider, { locale }, { default: () => h(Child) }),
    }))
    return api
  }

  it('advances on ArrowRight in a left-to-right document', async () => {
    const tabs = tabsUnder('en-US')
    tabs.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(tabs.activeTab.value).toBe('b')
  })

  it('advances on ArrowLeft in a right-to-left document', async () => {
    // The defect this catches: in Arabic the *next* tab is to the left, so the
    // key that points at it must be the one that reaches it.
    const tabs = tabsUnder('ar-EG')
    tabs.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await nextTick()
    expect(tabs.activeTab.value).toBe('b')
  })

  it('retreats on ArrowRight in a right-to-left document', async () => {
    const tabs = tabsUnder('ar-EG')
    tabs.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await nextTick()
    tabs.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(tabs.activeTab.value).toBe('a')
  })

  it('forwardArrow names the key that advances', () => {
    expect(forwardArrow('ltr')).toBe('ArrowRight')
    expect(forwardArrow('rtl')).toBe('ArrowLeft')
  })
})
