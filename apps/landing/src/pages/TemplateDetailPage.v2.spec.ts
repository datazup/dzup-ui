/**
 * TASK-TV2-06 — the /templates/:slug stage presence (docs/templates-v2.md).
 *
 * The detail page's preview stage gains an accent glow, a border-beam overlay
 * and a device-switch settle; the pager tints toward its destinations; the
 * "Built with" chips stagger in. jsdom cannot observe CSS animation, so these
 * specs pin the JS-side contract: the derived accent vars, the inert overlay,
 * and the directive wiring — all resolved through the SHARED accent helper so
 * the page can never disagree with the gallery tiles.
 */

import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { resolveTemplateAccent } from '../templates/accent.ts'
import { TEMPLATES } from '../templates/registry.ts'
import TemplateDetailPage from './TemplateDetailPage.vue'

beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe(target: Element): void {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }

      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

const SLUG = TEMPLATES[0]!.slug

async function mountDetail(slug = SLUG) {
  const Blank = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/templates', component: Blank },
      { path: '/templates/:slug', component: Blank },
      { path: '/templates/:slug/preview', component: Blank },
    ],
  })
  await router.push(`/templates/${slug}`)
  await router.isReady()
  const utils = render(
    defineComponent({
      setup: () => () =>
        h(DzThemeProvider, null, { default: () => h(TemplateDetailPage, { slug }) }),
    }),
    { global: { plugins: [router] } },
  )
  await flushPromises()
  return utils
}

describe('tv2-06 detail stage presence', () => {
  it('carries the template accent from the SHARED resolver — never a second mapping', async () => {
    const { container } = await mountDetail()
    const detail = container.querySelector('.detail')
    expect(detail).not.toBeNull()
    expect(detail!.getAttribute('style')).toContain(
      `--tpl-accent: var(--dz-colors-${resolveTemplateAccent(TEMPLATES[0]!)}-500)`,
    )
  })

  it('mounts exactly one inert border-beam overlay inside the stage', async () => {
    const { container } = await mountDetail()
    const beams = container.querySelectorAll('.stage .tpl-beam')
    expect(beams).toHaveLength(1)
    const beam = beams[0]!
    expect(beam.getAttribute('aria-hidden')).toBe('true')
    expect(beam.classList.contains('dz-border-beam')).toBe(true)
    expect(beam.textContent).toBe('')
  })

  it('tints each pager button toward its DESTINATION template', async () => {
    const { container } = await mountDetail()
    const prev = TEMPLATES[TEMPLATES.length - 1]!
    const next = TEMPLATES[1]!
    const prevLink = container.querySelector('.pager-link.is-prev')
    const nextLink = container.querySelector('.pager-link.is-next')
    expect(prevLink!.getAttribute('style')).toContain(
      `--pager-accent: var(--dz-colors-${resolveTemplateAccent(prev)}-500)`,
    )
    expect(nextLink!.getAttribute('style')).toContain(
      `--pager-accent: var(--dz-colors-${resolveTemplateAccent(next)}-500)`,
    )
  })

  it('staggers the built-with chips in via the reveal directive', async () => {
    const { container } = await mountDetail()
    const chips = [...container.querySelectorAll('.chip-row > li')]
    expect(chips.length).toBe(TEMPLATES[0]!.stack.length)
    for (const li of chips) {
      expect(li.classList.contains('dz-reveal')).toBe(true)
      expect(li.classList.contains('dz-reveal--in')).toBe(true)
    }
  })

  it('keeps the device switcher contract: switching still reflows the iframe width', async () => {
    const { container } = await mountDetail()
    const frame = container.querySelector<HTMLIFrameElement>('.preview-frame')
    expect(frame!.style.width).toBe('100%')
    const group = container.querySelector('[aria-label="Preview device width"]')
    const mobile = [...(group?.querySelectorAll('button') ?? [])].find(b =>
      b.textContent?.includes('Mobile'),
    )
    if (!mobile)
      throw new Error('device switcher not rendered')
    mobile.click()
    await flushPromises()
    expect(frame!.style.width).toBe('390px')
  })
})
