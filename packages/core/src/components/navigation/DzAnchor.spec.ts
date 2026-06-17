import type { DzAnchorItem } from './DzAnchor.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzAnchor — Unit / behavior tests.
 *
 * Covers scrollspy active tracking (mocked IntersectionObserver), click
 * smooth-scroll, nesting, aria-current, and keyboard focus handoff.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzAnchor from './DzAnchor.vue'

// --- IntersectionObserver capture stub -------------------------------------

let ioCallback: ((entries: Array<{ target: Element, isIntersecting: boolean }>) => void) | null = null

class IOStub {
  constructor(cb: (entries: Array<{ target: Element, isIntersecting: boolean }>) => void) {
    ioCallback = cb
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] { return [] }
}

/** Drive the captured observer callback for a given element id. */
function intersect(id: string, isIntersecting: boolean): void {
  const target = document.getElementById(id)!
  ioCallback?.([{ target, isIntersecting }])
}

/**
 * Dispatch a native click. `detail` is read-only on synthetic test-utils
 * events, so we construct a real MouseEvent (detail 0 = keyboard activation).
 */
function clickLink(el: Element, detail: number): void {
  el.dispatchEvent(new MouseEvent('click', { detail, bubbles: true, cancelable: true }))
}

/** Append heading targets to the document so getElementById resolves them. */
function mountTargets(ids: string[]): void {
  for (const id of ids) {
    const el = document.createElement('section')
    el.id = id
    el.textContent = id
    document.body.appendChild(el)
  }
}

const items: DzAnchorItem[] = [
  { href: '#intro', label: 'Introduction' },
  {
    href: '#usage',
    label: 'Usage',
    children: [{ href: '#install', label: 'Install' }],
  },
  { href: '#api', label: 'API' },
]

beforeEach(() => {
  ioCallback = null
  vi.stubGlobal('IntersectionObserver', IOStub)
  window.scrollTo = vi.fn()
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
  mountTargets(['intro', 'usage', 'install', 'api'])
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('dzAnchor — scrollspy', () => {
  it('marks the in-view section active via the IntersectionObserver callback', async () => {
    const wrapper = mount(DzAnchor, { props: { items } })

    intersect('usage', true)
    await nextTick()

    const usageLink = wrapper.findAll('a').find(a => a.attributes('href') === '#usage')!
    expect(usageLink.attributes('aria-current')).toBe('location')
    // Non-active links carry no aria-current.
    const introLink = wrapper.findAll('a').find(a => a.attributes('href') === '#intro')!
    expect(introLink.attributes('aria-current')).toBeUndefined()
  })

  it('emits change + updates v-model:active on scroll', async () => {
    const wrapper = mount(DzAnchor, { props: { items, active: '' } })

    intersect('api', true)
    await nextTick()

    expect(wrapper.emitted('change')?.[0]).toEqual(['#api'])
    expect(wrapper.emitted('update:active')?.[0]).toEqual(['#api'])
  })
})

describe('dzAnchor — click', () => {
  it('smooth-scrolls to the target and sets it active on click', async () => {
    const wrapper = mount(DzAnchor, { props: { items } })

    const apiLink = wrapper.findAll('a').find(a => a.attributes('href') === '#api')!
    clickLink(apiLink.element, 1)
    await nextTick()

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    )
    expect(apiLink.attributes('aria-current')).toBe('location')
    expect(wrapper.emitted('change')?.[0]).toEqual(['#api'])
  })

  it('respects prefers-reduced-motion (no smooth scroll)', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const wrapper = mount(DzAnchor, { props: { items } })

    clickLink(wrapper.findAll('a')[0]!.element, 1)
    await nextTick()

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    )
  })

  it('moves focus to the target heading on keyboard activation (detail 0)', async () => {
    const wrapper = mount(DzAnchor, { props: { items } })

    const usageLink = wrapper.findAll('a').find(a => a.attributes('href') === '#usage')!
    clickLink(usageLink.element, 0)
    await nextTick()

    const heading = document.getElementById('usage')!
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading)
  })

  it('does not scroll or activate a disabled link', async () => {
    const disabledItems: DzAnchorItem[] = [
      { href: '#intro', label: 'Introduction', disabled: true },
    ]
    const wrapper = mount(DzAnchor, { props: { items: disabledItems } })

    clickLink(wrapper.find('a').element, 1)
    await nextTick()

    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(wrapper.find('a').attributes('aria-current')).toBeUndefined()
  })
})

describe('dzAnchor — nesting', () => {
  it('renders nested children as a nested list', () => {
    const wrapper = mount(DzAnchor, { props: { items } })

    // Install is a child of Usage → there must be a nested <ul data-level="1">.
    const nested = wrapper.find('ul[data-level="1"]')
    expect(nested.exists()).toBe(true)
    expect(nested.text()).toContain('Install')
  })

  it('tracks active state for nested children', async () => {
    const wrapper = mount(DzAnchor, { props: { items } })

    intersect('install', true)
    await nextTick()

    const installLink = wrapper.findAll('a').find(a => a.attributes('href') === '#install')!
    expect(installLink.attributes('aria-current')).toBe('location')
  })
})
