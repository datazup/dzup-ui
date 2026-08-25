/**
 * The v2 back half (docs/landing-v2.md TASK-LV2-08): StatsSection,
 * FreeVsProV2 and CommunityCTAV2 — copy/value parity with the v1 sections
 * they fork, plus the motion contracts (decorative layers stay decorative,
 * derived numbers stay derived).
 */
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { FACTS, LINKS } from '../../config.ts'
import { PRO_FACTS } from '../../data.ts'
import CommunityCTAV2 from './CommunityCTAV2.vue'
import FreeVsProV2 from './FreeVsProV2.vue'
import StatsSection from './StatsSection.vue'

function stubEnv(): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
  class NoopObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): [] {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', NoopObserver)
  vi.stubGlobal('ResizeObserver', NoopObserver)
}

async function renderWithRouter(component: unknown): Promise<HTMLElement> {
  const Blank = { template: '<div />' }
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: Blank }, { path: '/pro', component: Blank }],
  })
  await router.push('/')
  await router.isReady()
  const { container } = render(defineComponent({
    setup: () => () => h(component as never),
  }), { global: { plugins: [router] } })
  return container as HTMLElement
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('statsSection (TASK-LV2-08)', () => {
  it('keeps the derived figures in the accessible names — odometers are presentation', async () => {
    stubEnv()
    const container = await renderWithRouter(StatsSection)
    const labels = [...container.querySelectorAll('a.stat')].map(a => a.getAttribute('aria-label'))
    expect(labels.some(l => l?.includes(`${FACTS.freeComponents} free components`))).toBe(true)
    expect(labels.some(l => l?.includes(`${FACTS.families} component families`))).toBe(true)
    expect(labels.some(l => l?.includes(`${PRO_FACTS.published} published Pro components`))).toBe(true)
  })

  it('rolls every fixed figure through a DzOdometer with the CLS reservation intact', async () => {
    stubEnv()
    const container = await renderWithRouter(StatsSection)
    // Three fixed figures always render an odometer (live metrics may degrade).
    expect(container.querySelectorAll('.dz-odometer').length).toBeGreaterThanOrEqual(3)
    for (const value of container.querySelectorAll<HTMLElement>('.stat-value'))
      expect(value.style.getPropertyValue('--reserve')).toMatch(/ch$/)
  })
})

describe('freeVsProV2 (TASK-LV2-08)', () => {
  it('keeps both plans with v1 copy and inventory-derived points', async () => {
    stubEnv()
    const container = await renderWithRouter(FreeVsProV2)
    expect(container.textContent).toContain('Start free')
    expect(container.textContent).toContain('Go Pro')
    expect(container.textContent).toContain(`${FACTS.freeComponents} MIT-licensed components`)
    expect(container.textContent).toContain(`${PRO_FACTS.published} published exports`)
  })

  it('renders the Pro heading through the gradient text without losing the words', async () => {
    stubEnv()
    const container = await renderWithRouter(FreeVsProV2)
    const gradient = container.querySelector('.dz-gradient-text, [class*=gradient]')
    expect(gradient?.textContent).toContain('Go Pro')
  })
})

describe('communityCTAV2 (TASK-LV2-08)', () => {
  it('keeps all three v1 destinations', async () => {
    stubEnv()
    const container = await renderWithRouter(CommunityCTAV2)
    const hrefs = [...container.querySelectorAll('a')].map(a => a.getAttribute('href'))
    expect(hrefs).toContain(LINKS.gettingStarted)
    expect(hrefs).toContain(LINKS.github)
    expect(hrefs).toContain(LINKS.issues)
  })

  it('keeps the particle field decorative and behind the content', async () => {
    stubEnv()
    const container = await renderWithRouter(CommunityCTAV2)
    const particles = container.querySelector('.dz-particles')!
    expect(particles.getAttribute('aria-hidden')).toBe('true')
    // The magnetic wrapper hosts the primary CTA — the button keeps its box.
    const slot = container.querySelector('.community-cta-slot')!
    expect(slot.querySelector('a')?.getAttribute('href')).toBe(LINKS.gettingStarted)
  })
})
