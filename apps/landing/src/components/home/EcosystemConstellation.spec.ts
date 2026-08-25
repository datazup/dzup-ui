/**
 * EcosystemConstellation (docs/landing-v2.md TASK-LV2-06) — the offerings
 * section drawn as a hub-and-spoke graph, without losing the card semantics.
 *
 * The truth rules under test:
 *   - every ECOSYSTEM offering's card content renders in BOTH layouts;
 *   - beams (edges) exist only in the wide layout and only one per SHIPPED
 *     offering — a planned surface never gets an edge;
 *   - planned tiles are never links.
 */
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { ECOSYSTEM } from '../../data.ts'
import EcosystemConstellation from './EcosystemConstellation.vue'

const AVAILABLE = ECOSYSTEM.filter(item => item.status === 'available')
const PLANNED = ECOSYSTEM.filter(item => item.status === 'planned')

function stubEnv({ wide = false } = {}): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width') ? wide : false,
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

async function renderConstellation(): Promise<HTMLElement> {
  const Blank = { template: '<div />' }
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Blank },
      ...AVAILABLE.map(item => ({ path: item.href!, component: Blank })),
    ],
  })
  await router.push('/')
  await router.isReady()
  const { container } = render(defineComponent({
    setup: () => () => h(EcosystemConstellation),
  }), { global: { plugins: [router] } })
  await nextTick()
  return container as HTMLElement
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('ecosystemConstellation (TASK-LV2-06)', () => {
  it('renders every offering with full card content in the narrow (grid) layout', async () => {
    stubEnv({ wide: false })
    const container = await renderConstellation()
    for (const item of ECOSYSTEM) {
      expect(container.textContent).toContain(item.title)
      expect(container.textContent).toContain(item.blurb)
    }
    // No graph chrome narrow: no hub, no beams.
    expect(container.querySelector('.hub-card')).toBeNull()
    expect(container.querySelectorAll('svg.dz-beam').length).toBe(0)
  })

  it('renders every offering PLUS the hub and one beam per shipped offering when wide', async () => {
    stubEnv({ wide: true })
    const container = await renderConstellation()
    for (const item of ECOSYSTEM)
      expect(container.textContent).toContain(item.title)

    expect(container.querySelector('.hub-card')).not.toBeNull()
    const beams = container.querySelectorAll('svg.dz-beam')
    expect(beams.length).toBe(AVAILABLE.length)
    // Each beam is decorative by contract.
    for (const beam of beams)
      expect(beam.getAttribute('aria-hidden')).toBe('true')
  })

  it('links shipped offerings and never links planned ones', async () => {
    stubEnv({ wide: true })
    const container = await renderConstellation()
    for (const item of AVAILABLE) {
      const node = container.querySelector(`[data-eco-node='${item.title}']`)!
      expect(node.tagName).toBe('A')
      expect(node.getAttribute('href')).toBe(item.href)
    }
    for (const item of PLANNED) {
      const node = container.querySelector(`[data-eco-node='${item.title}']`)!
      expect(node.tagName).not.toBe('A')
      expect(node.classList.contains('tile--planned')).toBe(true)
    }
  })

  it('keeps the section heading anchor id the nav and a11y suites rely on', async () => {
    stubEnv({ wide: false })
    const container = await renderConstellation()
    expect(container.querySelector('#ecosystem-title')).not.toBeNull()
  })
})
