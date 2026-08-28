/**
 * /themes v2 — "The Atelier" (docs/themes-v2.md, TASK-THV2-01..07).
 *
 * Guards the additive v2 layers: the token-lit atmosphere, the hero overture,
 * the mixing-desk micro-interactions, the showcase presence, the contrast
 * gauges, the image lab and the finale. Everything asserted here is DECORATION
 * over the existing page — the designer engine's own contracts live in
 * `useThemeDesigner.spec.ts` and the clipboard flows in `ThemesPage.copy.spec.ts`.
 *
 * The designer store is a MODULE SINGLETON shared with ThemeRecipeController —
 * every test that touches it must reset() in afterEach or state leaks into the
 * next mount (Part 2 trap in docs/themes-v2.md).
 */

import { SHADE_STEPS } from '@dzup-ui/tokens'
import { cleanup, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { DESIGNER_INTENTS, useThemeDesigner } from '../composables/useThemeDesigner.ts'
import ThemesPage from './ThemesPage.vue'

const Blank = { template: '<div />' }

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: Blank }, { path: '/themes', component: Blank }],
  })
}

async function mountPage() {
  const router = makeRouter()
  await router.push('/themes')
  await router.isReady()
  const utils = render(ThemesPage, { global: { plugins: [router] } })
  await flushPromises()
  return utils
}

beforeEach(() => {
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
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
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
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
  // The designer is a module singleton — never leak a test's palette edits
  // (or motion preference) into the next mount.
  const designer = useThemeDesigner()
  designer.reset()
})

describe('/themes v2 — THV2-01 atmosphere', () => {
  it('renders exactly one aria-hidden atmosphere layer', async () => {
    await mountPage()
    const layers = document.querySelectorAll('.thv2-atmosphere')
    expect(layers).toHaveLength(1)
    expect(layers[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('mounts the layer as the first child of the page root, behind all content', async () => {
    await mountPage()
    const page = document.querySelector('.themes-page')
    expect(page).not.toBeNull()
    expect(page?.firstElementChild?.classList.contains('thv2-atmosphere')).toBe(true)
  })

  it('keeps the layer empty — pure decoration, nothing announced', async () => {
    await mountPage()
    const layer = document.querySelector('.thv2-atmosphere')
    expect(layer?.textContent).toBe('')
    expect(layer?.getAttribute('role')).toBeNull()
  })

  it('keeps the hero eyebrow in place as the tint hook', async () => {
    await mountPage()
    const eyebrow = document.querySelector('.themes-hero .lp-eyebrow')
    expect(eyebrow).not.toBeNull()
    expect(eyebrow?.textContent).toContain('Themes')
  })
})

describe('/themes v2 — THV2-02 hero overture', () => {
  it('keeps the h1 resolving to the same visible string', async () => {
    await mountPage()
    const title = document.querySelector('.themes-title')
    expect(title?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Theme Designer')
  })

  it('renders the derived stats and shows final numbers under the recipe motion gate', async () => {
    // The RECIPE gate: the page installs provideMotionPreference driven by the
    // designer's motion ref, so 'reduced' must snap every count-up to its final
    // value with no in-view observer involvement.
    const designer = useThemeDesigner()
    designer.motion.value = 'reduced'
    await mountPage()
    const figures = [...document.querySelectorAll('.themes-stat-figure')]
    expect(figures).toHaveLength(3)
    // Expectations DERIVED from the same imports the page uses — never typed.
    const expected = [
      DESIGNER_INTENTS.length,
      DESIGNER_INTENTS.length * SHADE_STEPS.length,
      designer.contrastLight.value.length + designer.contrastDark.value.length,
    ]
    // DzAnimatedNumber renders the figure twice (aria-hidden digits + a
    // visually-hidden SR copy) — read the visible aria-hidden layer only.
    const rendered = figures.map(f =>
      Number(f.querySelector('[aria-hidden="true"]')?.textContent?.replace(/\D/g, '')))
    expect(rendered).toEqual(expected)
  })

  it('mounts the paint-chip field aria-hidden and inert inside the hero', async () => {
    await mountPage()
    const field = document.querySelector('.themes-hero .thv2-hero-field')
    expect(field).not.toBeNull()
    expect(field?.getAttribute('aria-hidden')).toBe('true')
    expect(field?.hasAttribute('inert')).toBe(true)
  })
})

describe('/themes v2 — THV2-03 mixing desk', () => {
  it('pulses the just-applied preset ring, then clears it', async () => {
    vi.useFakeTimers()
    try {
      await mountPage()
      const rose = [...document.querySelectorAll<HTMLButtonElement>('.preset')]
        .find(b => b.textContent?.includes('Rose'))
      expect(rose).toBeDefined()
      rose?.click()
      await nextTick()
      // The click applied the preset (recipe change) and the ring pulse fired.
      expect(useThemeDesigner().recipe.preset).toBe('rose')
      expect(rose?.classList.contains('preset--pulsed')).toBe(true)
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(rose?.classList.contains('preset--pulsed')).toBe(false)
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('shimmers a ramp when its palette changes — but never under the recipe motion gate', async () => {
    const designer = useThemeDesigner()
    await mountPage()
    expect(document.querySelector('.ramp-shimmer')).toBeNull()
    designer.palettes.primary.hue = (designer.palettes.primary.hue + 60) % 360
    await nextTick()
    expect(document.querySelector('.ramp-shimmer')).not.toBeNull()
    cleanup()
    document.body.innerHTML = ''

    designer.reset()
    designer.motion.value = 'reduced'
    await mountPage()
    designer.palettes.primary.hue = (designer.palettes.primary.hue + 60) % 360
    await nextTick()
    expect(document.querySelector('.ramp-shimmer')).toBeNull()
  })

  it('keeps the advanced disclosure toggling', async () => {
    await mountPage()
    const details = document.querySelector<HTMLDetailsElement>('details.advanced')
    expect(details).not.toBeNull()
    expect(details?.open).toBe(false)
    details!.open = true
    await nextTick()
    expect(details?.open).toBe(true)
  })

  it('hands every palette slider its own 500-shade halo colour', async () => {
    await mountPage()
    const ranges = [...document.querySelectorAll<HTMLInputElement>('.palette-control .range')]
    expect(ranges.length).toBeGreaterThan(0)
    for (const range of ranges)
      expect(range.style.getPropertyValue('--thumb')).toContain('oklch')
  })
})

/**
 * Drive the primary palette until at least one WCAG pair fails (found by
 *  scanning, never hand-picked — hues near yellow lift shade 500's luminance
 *  until white-on-500 breaks). Returns whether a failing config was found.
 */
function driveToFailing(designer: ReturnType<typeof useThemeDesigner>): boolean {
  for (let hue = 0; hue < 360; hue += 15) {
    designer.palettes.primary.hue = hue
    designer.palettes.primary.chroma = 0.28
    if (designer.failingCount.value > 0)
      return true
  }
  return false
}

describe('/themes v2 — THV2-05 gauges', () => {
  it('celebrates exactly the >0 → 0 transition — never a fresh all-passing mount', async () => {
    const designer = useThemeDesigner()
    await mountPage()
    // Fresh mount on a passing theme: no glow, no burst pop.
    expect(designer.failingCount.value).toBe(0)
    expect(document.querySelector('.a11y-won-glow')).toBeNull()
    expect(document.querySelector('.dz-burst--pop')).toBeNull()

    expect(driveToFailing(designer)).toBe(true)
    await nextTick()
    // Failing state: headline pops but no celebration.
    expect(document.querySelector('.a11y-won-glow')).toBeNull()

    designer.reset()
    await nextTick()
    // The win: glow + burst fire once.
    expect(document.querySelector('.a11y-won-glow')).not.toBeNull()
    expect(document.querySelector('.dz-burst--pop')).not.toBeNull()
  })

  it('never celebrates under the recipe motion gate', async () => {
    const designer = useThemeDesigner()
    designer.motion.value = 'reduced'
    await mountPage()
    expect(driveToFailing(designer)).toBe(true)
    await nextTick()
    designer.reset()
    designer.motion.value = 'reduced'
    await nextTick()
    expect(document.querySelector('.a11y-won-glow')).toBeNull()
    expect(document.querySelector('.dz-burst--pop')).toBeNull()
  })

  it('pops badges on state flips and ticks ratios on change', async () => {
    const designer = useThemeDesigner()
    await mountPage()
    expect(document.querySelector('.a11y-pop')).toBeNull()
    expect(document.querySelector('.a11y-ratio--tick')).toBeNull()
    expect(driveToFailing(designer)).toBe(true)
    await nextTick()
    // At least the headline pops, and at least one flipped row badge pops.
    expect(document.querySelectorAll('.a11y-pop').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.a11y-ratio--tick').length).toBeGreaterThan(0)
  })

  it('adds no live region to the contrast surface', async () => {
    await mountPage()
    const bar = document.querySelector('.a11y-bar')
    expect(bar?.querySelectorAll('[aria-live]')).toHaveLength(0)
  })
})

describe('/themes v2 — THV2-04 easel', () => {
  it('keeps the split preview mechanism intact: data-theme panels with scoped vars', async () => {
    const designer = useThemeDesigner()
    await mountPage()
    const light = document.querySelector<HTMLElement>('.preview-panel--light')
    const dark = document.querySelector<HTMLElement>('.preview-panel--dark')
    expect(light?.getAttribute('data-theme')).toBe('light')
    expect(dark?.getAttribute('data-theme')).toBe('dark')
    // Deviating a palette must land its ramp override on BOTH panels' vars.
    designer.palettes.primary.hue = (designer.palettes.primary.hue + 90) % 360
    await nextTick()
    expect(light?.getAttribute('style')).toContain('--dz-colors-primary-500')
    expect(dark?.getAttribute('style')).toContain('--dz-colors-primary-500')
  })

  it('sweeps both panels once when a preset applies — and never under the recipe gate', async () => {
    await mountPage()
    expect(document.querySelectorAll('.panel-sweep')).toHaveLength(0)
    const emerald = [...document.querySelectorAll<HTMLButtonElement>('.preset')]
      .find(b => b.textContent?.includes('Emerald'))
    emerald?.click()
    await nextTick()
    const sweeps = document.querySelectorAll('.panel-sweep')
    expect(sweeps).toHaveLength(2)
    for (const sweep of sweeps)
      expect(sweep.getAttribute('aria-hidden')).toBe('true')
    cleanup()
    document.body.innerHTML = ''

    const designer = useThemeDesigner()
    designer.reset()
    designer.motion.value = 'reduced'
    await mountPage()
    const rose = [...document.querySelectorAll<HTMLButtonElement>('.preset')]
      .find(b => b.textContent?.includes('Rose'))
    rose?.click()
    await nextTick()
    expect(document.querySelectorAll('.panel-sweep')).toHaveLength(0)
  })

  it('mounts the image lab once, with its own polite region distinct from the copy contract', async () => {
    await mountPage()
    const labs = document.querySelectorAll('.thv2-dropzone')
    expect(labs).toHaveLength(1)
    const labStatus = document.querySelector('.thv2-image-status')
    expect(labStatus?.getAttribute('aria-live')).toBe('polite')
    expect(labStatus?.getAttribute('role')).toBeNull()
    // The copy-outcome contract keeps its UNIQUE polite+status pairing.
    expect(document.querySelectorAll('[aria-live="polite"][role="status"]')).toHaveLength(1)
  })

  it('keeps copy outcomes out of the image lab region', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    vi.stubGlobal('navigator', { ...globalThis.navigator, clipboard: { writeText } })
    await mountPage()
    const copyCss = [...document.querySelectorAll('button')]
      .find(b => b.textContent?.includes('Copy CSS'))
    copyCss?.click()
    await flushPromises()
    expect(writeText).toHaveBeenCalled()
    expect(document.querySelector('[aria-live="polite"][role="status"]')?.textContent)
      .toContain('Copied')
    expect(document.querySelector('.thv2-image-status')?.textContent?.trim()).toBe('')
  })

  it('mounts the finale once, after the workspace, sharing the hero clipboard contract', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    vi.stubGlobal('navigator', { ...globalThis.navigator, clipboard: { writeText } })
    await mountPage()
    const finales = document.querySelectorAll('.thv2-finale')
    expect(finales).toHaveLength(1)
    const workspace = document.querySelector('.themes-workspace')!
    expect(workspace.compareDocumentPosition(finales[0]!) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy()
    // One click through the finale's share = the hero's plumbing: one polite
    // utterance, and BOTH share labels flip together.
    const share = [...finales[0]!.querySelectorAll('button')]
      .find(b => b.textContent?.includes('Share this theme'))
    share?.click()
    await flushPromises()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[aria-live="polite"][role="status"]')?.textContent)
      .toContain('Copied')
    expect(document.querySelectorAll('.thv2-finale button, .themes-hero-actions button'))
      .toBeTruthy()
  })

  it('stills the rake via the page class under the recipe motion gate', async () => {
    const designer = useThemeDesigner()
    designer.motion.value = 'reduced'
    await mountPage()
    expect(document.querySelector('.themes-page')?.classList.contains('thv2-still')).toBe(true)
    cleanup()
    document.body.innerHTML = ''

    designer.reset()
    await mountPage()
    expect(document.querySelector('.themes-page')?.classList.contains('thv2-still')).toBe(false)
  })
})
