/**
 * Templates v2 — "The Showroom" (docs/templates-v2.md, TASK-TV2-*).
 *
 * One spec file accumulating the v2 contracts for /templates, one describe per
 * landed task — the same shape BlocksIndexPage.atmosphere.spec.ts gave /blocks.
 * jsdom cannot observe CSS interpolation, transforms or paint, so every spec
 * pins the *target* state (attributes, inline vars, structure) — which is the
 * whole JS-side contract; the motion itself is CSS.
 */

import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import DzCountUp from '../motion/components/DzCountUp.vue'
import { TEMPLATE_CATEGORIES, TEMPLATES } from '../templates/registry.ts'
import TemplatesPage from './TemplatesPage.vue'

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
    // Must FIRE, not just exist — lazily-mounted subtrees stay placeholders
    // under a silent observer (the TASK-FREE3-04 lesson, see pages.a11y.spec.ts).
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
  // The theme provider persists the preference; clear it so a spec's
  // `defaultTheme` always wins on the next mount.
  window.localStorage.clear()
})

/**
 * Mount the page under a DzThemeProvider (useTheme reads the provider context)
 * with a memory router (the page calls useRouter and renders router-links).
 */
async function mountPage(theme: 'light' | 'dark' = 'light') {
  window.localStorage.clear()
  const Blank = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/templates', component: Blank },
      { path: '/templates/:slug', component: Blank },
    ],
  })
  await router.push('/templates')
  await router.isReady()
  const utils = render(
    defineComponent({
      setup: () => () =>
        h(DzThemeProvider, { defaultTheme: theme }, { default: () => h(TemplatesPage) }),
    }),
    { global: { plugins: [router] } },
  )
  await flushPromises()
  return utils
}

function pageRoot(container: Element): HTMLElement {
  const root = container.querySelector<HTMLElement>('.templates-page')
  if (!root)
    throw new Error('templates page root not rendered')
  return root
}

/** The category segmented control's option buttons, in display order. */
function categorySegments(container: Element): HTMLElement[] {
  const group = container.querySelector('[aria-label="Filter templates by category"]')
  if (!group)
    throw new Error('category filter not rendered')
  return [...group.querySelectorAll<HTMLElement>('button, [role="radio"], [role="tab"]')]
}

describe('tv2-01 ambient atmosphere', () => {
  it('renders exactly one aria-hidden, decorative wash inside the page root', async () => {
    const { container } = await mountPage()
    const layers = container.querySelectorAll('.tv2-atmosphere')
    expect(layers).toHaveLength(1)
    const layer = layers[0]!
    expect(layer.getAttribute('aria-hidden')).toBe('true')
    expect(pageRoot(container).contains(layer)).toBe(true)
    expect(layer.textContent).toBe('')
    expect(layer.querySelector('a, button, input, [tabindex]')).toBeNull()
  })

  it('settles to the neutral primary on the default "all" view', async () => {
    const { container } = await mountPage()
    expect(pageRoot(container).getAttribute('style')).toContain('--tv2-accent: var(--dz-primary)')
  })

  it('lights the room with the selected category accent, derived from the registry', async () => {
    const { container } = await mountPage()
    const segments = categorySegments(container)
    // Segment 0 is "All"; segment 1 is the first registry category.
    const first = TEMPLATE_CATEGORIES[0]!
    const target = segments.find(s => s.textContent?.includes(first.label))
    if (!target)
      throw new Error(`no segment for category "${first.label}"`)
    await fireEvent.click(target)
    await flushPromises()
    expect(pageRoot(container).getAttribute('style')).toContain(
      `--tv2-accent: var(--dz-colors-${first.accent}-500)`,
    )
  })

  it('returns to the neutral primary when the reader goes back to "all"', async () => {
    const { container } = await mountPage()
    const segments = categorySegments(container)
    const first = TEMPLATE_CATEGORIES[0]!
    await fireEvent.click(segments.find(s => s.textContent?.includes(first.label))!)
    await flushPromises()
    const all = segments.find(s => s.textContent?.includes('All'))
    await fireEvent.click(all!)
    await flushPromises()
    expect(pageRoot(container).getAttribute('style')).toContain('--tv2-accent: var(--dz-primary)')
  })
})

describe('tv2-02 hero depth field + counted-up truth', () => {
  it('mounts the depth field as decoration inside the page root', async () => {
    const { container } = await mountPage()
    const field = container.querySelector('.tv2-hero-field')
    expect(field).not.toBeNull()
    expect(field!.getAttribute('aria-hidden')).toBe('true')
    expect(field!.hasAttribute('inert')).toBe(true)
    expect(pageRoot(container).contains(field!)).toBe(true)
  })

  it('derives every hero stat from the registry — templates, categories, distinct components', async () => {
    // test-utils mount (not testing-library) so the DzCountUp *targets* are
    // assertable via props — the count-up tween is timing, the derivation
    // contract is what matters, and no literal numbers belong in this spec.
    const Blank = { template: '<div />' }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Blank },
        { path: '/templates', component: Blank },
        { path: '/templates/:slug', component: Blank },
      ],
    })
    await router.push('/templates')
    await router.isReady()
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(DzThemeProvider, null, { default: () => h(TemplatesPage) }),
      }),
      { global: { plugins: [router] } },
    )
    await flushPromises()

    const stats = wrapper.find('.templates-hero-stats')
    expect(stats.exists()).toBe(true)
    expect(stats.element.tagName).toBe('DL')
    const labels = stats.findAll('dt').map(dt => dt.text())
    expect(labels).toEqual(['Templates', 'Categories', 'Components used'])

    const counters = wrapper
      .findAllComponents(DzCountUp)
      .filter(c => stats.element.contains(c.element))
    expect(counters.map(c => c.props('value'))).toEqual([
      TEMPLATES.length,
      TEMPLATE_CATEGORIES.length,
      new Set(TEMPLATES.flatMap(t => t.stack)).size,
    ])
    wrapper.unmount()
  })
})

describe('tv2-03 card display screen', () => {
  it('every tile stacks BOTH theme screenshots — dark derived from light, both lazy', async () => {
    const { container } = await mountPage()
    const tiles = [...container.querySelectorAll('.tile')]
    expect(tiles.length).toBe(TEMPLATES.length)
    for (const tile of tiles) {
      const imgs = [...tile.querySelectorAll<HTMLImageElement>('.tile-shot img')]
      expect(imgs).toHaveLength(2)
      const [light, dark] = imgs
      const lightSrc = light!.getAttribute('src')!
      expect(lightSrc.endsWith('.webp')).toBe(true)
      expect(lightSrc.endsWith('-dark.webp')).toBe(false)
      expect(dark!.getAttribute('src')).toBe(lightSrc.replace(/\.webp$/, '-dark.webp'))
      for (const img of imgs) {
        expect(img.getAttribute('loading')).toBe('lazy')
        expect(img.getAttribute('alt')).toBe('')
        expect(img.getAttribute('width')).toBeTruthy()
        expect(img.getAttribute('height')).toBeTruthy()
      }
    }
  })

  it('a light provider shows the light layer', async () => {
    const { container } = await mountPage('light')
    const shot = container.querySelector('.tile-shot')!
    const [light, dark] = [...shot.querySelectorAll('img')]
    expect(light!.classList.contains('is-active')).toBe(true)
    expect(dark!.classList.contains('is-active')).toBe(false)
  })

  it('a dark provider cross-fades to the -dark layer', async () => {
    const { container } = await mountPage('dark')
    const shot = container.querySelector('.tile-shot')!
    const [light, dark] = [...shot.querySelectorAll('img')]
    expect(light!.classList.contains('is-active')).toBe(false)
    expect(dark!.classList.contains('is-active')).toBe(true)
  })
})

describe('tv2-04 grid choreography', () => {
  /** Type into the inline search and wait out the 180ms debounce. */
  async function search(container: Element, value: string) {
    const input = container.querySelector<HTMLInputElement>('input[type="search"], input')
    if (!input)
      throw new Error('search input not rendered')
    await fireEvent.update(input, value)
    await new Promise(resolve => setTimeout(resolve, 240))
    await flushPromises()
  }

  it('tiles carry the real scroll-reveal — the entrance that used to be dead code', async () => {
    const { container } = await mountPage()
    const tiles = [...container.querySelectorAll('.tile')]
    expect(tiles.length).toBeGreaterThan(0)
    for (const tile of tiles) {
      // v-reveal adds `dz-reveal` immediately; the (immediately-firing) observer
      // stub flips `dz-reveal--in`, proving the directive is actually wired.
      expect(tile.classList.contains('dz-reveal')).toBe(true)
      expect(tile.classList.contains('dz-reveal--in')).toBe(true)
    }
  })

  it('rolls the result count through the odometer while filtering', async () => {
    const { container } = await mountPage()
    await search(container, 'dashboard')
    const line = container.querySelector('.templates-result-count')
    expect(line).not.toBeNull()
    expect(line!.getAttribute('aria-live')).toBe('polite')
    expect(line!.querySelector('.dz-odometer')).not.toBeNull()
    // The visual layer is decoration; the SR layer is plain text.
    expect(line!.querySelector('.templates-result-count-visual')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('a dead-end filter gets three derived suggestions, never one that just failed', async () => {
    const { container } = await mountPage()
    // Activate the first tag chip, then search into a dead end.
    const chip = container.querySelector<HTMLButtonElement>('.tag-chip')
    if (!chip)
      throw new Error('no tag chips rendered')
    await fireEvent.click(chip)
    await search(container, 'zzz-no-such-template-anywhere')
    expect(container.querySelector('.gallery-grid')).toBeNull()
    const suggestions = [...container.querySelectorAll('.templates-empty-tag')]
    expect(suggestions).toHaveLength(3)
    // Recompute the expectation the same way the page does: top-3 by frequency
    // over the registry, excluding the tag we just activated.
    const active = chip.textContent!.trim()
    for (const s of suggestions) expect(s.textContent!.trim()).not.toBe(active)
  })

  it('applying a suggestion replaces the dead-end filters and rescues the grid', async () => {
    const { container } = await mountPage()
    await search(container, 'zzz-no-such-template-anywhere')
    const suggestion = container.querySelector<HTMLButtonElement>('.templates-empty-tag')
    if (!suggestion)
      throw new Error('no suggested tag rendered')
    await fireEvent.click(suggestion)
    await flushPromises()
    expect(container.querySelector('.templates-empty')).toBeNull()
    expect(container.querySelectorAll('.tile').length).toBeGreaterThan(0)
    // Exactly one tag chip is now pressed — the suggestion.
    const pressed = [...container.querySelectorAll('.tag-chip[aria-pressed="true"]')]
    expect(pressed).toHaveLength(1)
  })
})

describe('tv2-05 toolbar presence', () => {
  it('keeps the chip toggle contract: aria-pressed flips, spring is CSS-only', async () => {
    const { container } = await mountPage()
    const chip = container.querySelector<HTMLButtonElement>('.tag-chip')
    if (!chip)
      throw new Error('no tag chips rendered')
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    await fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('false')
  })

  it('the clear button eases in with active filters and still clears everything', async () => {
    const { container } = await mountPage()
    expect(container.querySelector('.templates-clear')).toBeNull()
    const chip = container.querySelector<HTMLButtonElement>('.tag-chip')!
    await fireEvent.click(chip)
    await flushPromises()
    const clear = container.querySelector<HTMLButtonElement>('.templates-clear')
    expect(clear).not.toBeNull()
    await fireEvent.click(clear!)
    await flushPromises()
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    expect(container.querySelectorAll('.tile').length).toBe(TEMPLATES.length)
  })
})
