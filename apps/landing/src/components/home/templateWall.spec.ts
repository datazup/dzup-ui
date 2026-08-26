/**
 * TemplateWall (docs/landing-v2.md TASK-LV2-07) — the home page's first
 * imagery, held to the registry's own guarantees:
 *
 *   - every card's light AND dark thumbnail exists ON DISK (the same class of
 *     proof `check-template-previews.ts` gives the gallery — re-proven here for
 *     the wall's subset so a registry reorder can't route the wall at a file
 *     that was never generated);
 *   - every card links to a real registry slug;
 *   - the subset is deterministic (no sampling), split across two rows;
 *   - the duplicated marquee run is aria-hidden AND inert, so the wall's link
 *     cards never become invisible tab stops.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { getTemplate, TEMPLATES } from '../../templates/registry.ts'
import { WALL_COUNT, wallRows } from './templateWall.ts'
import TemplateWall from './TemplateWall.vue'

const PUBLIC_DIR = resolve(__dirname, '../../../public')

describe('wallRows', () => {
  it('covers exactly WALL_COUNT distinct, real registry templates', () => {
    const [a, b] = wallRows()
    const slugs = [...a, ...b].map(c => c.slug)
    expect(slugs.length).toBe(WALL_COUNT)
    expect(new Set(slugs).size).toBe(WALL_COUNT)
    for (const slug of slugs)
      expect(getTemplate(slug), `${slug} must be a registry template`).toBeDefined()
  })

  it('is deterministic — first WALL_COUNT in registry order, alternating rows', () => {
    const [a, b] = wallRows()
    const expected = TEMPLATES.slice(0, WALL_COUNT).map(t => t.slug)
    expect(a.map(c => c.slug)).toEqual(expected.filter((_, i) => i % 2 === 0))
    expect(b.map(c => c.slug)).toEqual(expected.filter((_, i) => i % 2 === 1))
  })

  it('every card thumbnail — light and dark — exists on disk', () => {
    const [a, b] = wallRows()
    for (const card of [...a, ...b]) {
      expect(existsSync(resolve(PUBLIC_DIR, `.${card.thumb}`)), `${card.thumb} missing`).toBe(true)
      expect(existsSync(resolve(PUBLIC_DIR, `.${card.thumbDark}`)), `${card.thumbDark} missing`).toBe(true)
    }
  })
})

describe('templateWall (component)', () => {
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
  }

  async function renderWall(): Promise<HTMLElement> {
    const Blank = { template: '<div />' }
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: Blank },
        { path: '/templates', component: Blank },
        { path: '/templates/:slug', component: Blank },
      ],
    })
    await router.push('/')
    await router.isReady()
    const { container } = render(defineComponent({
      setup: () => () => h(DzThemeProvider, null, { default: () => h(TemplateWall) }),
    }), { global: { plugins: [router] } })
    return container as HTMLElement
  }

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders every wall card as a real link with lazy, dimensioned imagery', async () => {
    stubEnv()
    const container = await renderWall()
    // Count only the accessible run (the duplicate is aria-hidden + inert).
    const links = [...container.querySelectorAll<HTMLAnchorElement>('.wall-card')]
      .filter(a => !a.closest('[aria-hidden="true"]'))
    expect(links.length).toBe(WALL_COUNT)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/templates\/[a-z0-9-]+$/)
      const img = link.querySelector('img')!
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('width')).toBeTruthy()
      expect(img.getAttribute('height')).toBeTruthy()
      expect(img.getAttribute('alt')).toBe('')
    }
  })

  it('keeps duplicated marquee runs out of the tab order (inert)', async () => {
    stubEnv()
    const container = await renderWall()
    const hiddenRuns = container.querySelectorAll('.dz-marquee__run[aria-hidden="true"]')
    expect(hiddenRuns.length).toBeGreaterThan(0)
    for (const run of hiddenRuns)
      expect(run.hasAttribute('inert')).toBe(true)
  })

  it('offers the browse-all CTA with the honest total', async () => {
    stubEnv()
    const container = await renderWall()
    const all = container.querySelector('.wall-all')!
    expect(all.getAttribute('href')).toBe('/templates')
    expect(all.textContent).toContain(String(TEMPLATES.length))
  })
})
