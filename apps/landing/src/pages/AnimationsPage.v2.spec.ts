/**
 * Animations v2 — "The Theatre" (docs/animations-v2.md, TASK-AV2-*).
 *
 * One spec file accumulating the v2 contracts for /animations, one describe per
 * landed task — the same shape TemplatesPage.v2.spec.ts gave /templates. jsdom
 * cannot observe CSS interpolation, transforms or paint, so every spec pins
 * the TARGET state (attributes, inline vars, structure) — which is the whole
 * JS-side contract; the motion itself is CSS.
 */

import { DzThemeProvider } from '@dzup-ui/core'
import { cleanup, fireEvent, render } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { CATALOG, CATEGORIES, CATEGORY_ACCENTS } from '../gallery/catalog.ts'
import DzCountUp from '../motion/components/DzCountUp.vue'
import AnimationsPage from './AnimationsPage.vue'

/* ==========================================================================
   AutoAnimate's un-cancellable poll timers (TASK-R1-O3 F4 / D155, fixed here)

   `AnimationsPage.vue:556` puts `v-auto-animate` on the bento, so every mount
   hands @formkit/auto-animate the grid AND each card, and it calls `poll()` on
   each of them:

     function poll(el) {                                    // index.mjs:159
       setTimeout(() => {
         intervals.set(el, setInterval(() => lowPriority(updatePos…), 2000))
       }, Math.round(2000 * Math.random()))
     }

   Nothing can clear those. The `setInterval` id is recorded only when the
   OUTER `setTimeout` fires, so an interval created after the directive's
   `unmounted` hook ran is never in `intervals` at all; and `controller.
   destroy()` reaches the per-card ids through `forEach(el, …)`, which reads
   `parent.children` — empty by the time Vue has detached the grid. Every mount
   in this file therefore leaves live 2 s intervals behind, and `lowPriority()`
   (index.mjs:168) ends at `requestAnimationFrame` because jsdom has no
   `requestIdleCallback`.

   In a browser that is harmless: the page is never torn down under them. Under
   `yarn test` the file's jsdom environment IS torn down, the global goes away,
   and each surviving interval raises `ReferenceError: requestAnimationFrame is
   not defined` from a Node timer with no test to attach it to — **127 unhandled
   errors and exit 1 with 552 files passed and 0 tests failed**, measured
   2026-09-22. Alone the file exits 0 because nothing tears the environment down
   before the process ends, which is what made it look like a flake.

   So the timers are tracked at the only place that sees them — the global
   scheduler — filtered to the frames that come from the library, and cleared
   after every test and again when the file ends. Restored in `afterAll`, so no
   other file inherits the wrapper.
   ========================================================================== */

const autoAnimateTimers = new Set<unknown>()
const nativeSetTimeout = globalThis.setTimeout
const nativeSetInterval = globalThis.setInterval

/** True when the current call stack passes through @formkit/auto-animate. */
function scheduledByAutoAnimate(): boolean {
  return new Error('auto-animate timer probe').stack?.includes('auto-animate') === true
}

function clearAutoAnimateTimers(): void {
  for (const id of autoAnimateTimers) {
    clearTimeout(id as Parameters<typeof clearTimeout>[0])
    clearInterval(id as Parameters<typeof clearInterval>[0])
  }
  autoAnimateTimers.clear()
}

beforeAll(() => {
  globalThis.setTimeout = ((handler: TimerHandler, ms?: number, ...args: unknown[]) => {
    const id = nativeSetTimeout(handler as () => void, ms, ...args)
    if (scheduledByAutoAnimate())
      autoAnimateTimers.add(id)
    return id
  }) as unknown as typeof globalThis.setTimeout

  globalThis.setInterval = ((handler: TimerHandler, ms?: number, ...args: unknown[]) => {
    const id = nativeSetInterval(handler as () => void, ms, ...args)
    if (scheduledByAutoAnimate())
      autoAnimateTimers.add(id)
    return id
  }) as unknown as typeof globalThis.setInterval
})

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
  // jsdom ships no Web Animations API, but the bento's AutoAnimate path calls
  // `el.animate()` from a MutationObserver whenever a filter change adds or
  // removes cards. Without this stub every filtering spec dies as an unhandled
  // error inside jsdom's mutation-observer microtask. (The interaction sweep
  // never hit this because it only clicks each page's FIRST representative
  // control — the already-active "All" chip, a no-op filter.) The stub is the
  // minimal surface auto-animate touches: cancel/finished/finish-listener.
  if (typeof Element.prototype.animate !== 'function') {
    Element.prototype.animate = (() => ({
      finished: Promise.resolve(),
      cancel: () => {},
      play: () => {},
      pause: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof Element.prototype.animate
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    // Must FIRE, not just exist — in-view gates (the card loop cap, count-ups)
    // stay dormant under a silent observer (see pages.a11y.spec.ts).
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
  // Unmount first, then clear: `cleanup()` runs the directive's `unmounted`
  // hook, so whatever AutoAnimate can cancel for itself already has been, and
  // what is left here is only the residue described at the top of this file.
  clearAutoAnimateTimers()
  window.localStorage.clear()
  // The page reads location.hash at setup (category preselect) and writes it
  // back on category change — reset so one spec's filter never leaks into the
  // next mount.
  window.history.replaceState(window.history.state, '', window.location.pathname)
})

// Last hook in the file by lint rule (`test/prefer-hooks-in-order`) and by
// intent: the wrappers must survive every test, and nothing may inherit them.
afterAll(() => {
  clearAutoAnimateTimers()
  globalThis.setTimeout = nativeSetTimeout
  globalThis.setInterval = nativeSetInterval
})

/**
 * Mount the page under a DzThemeProvider (core components read the provider
 * context) with a memory router (the hero's "Back to home" DzButton renders a
 * router-link).
 */
async function mountPage() {
  const Blank = { template: '<div />' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/animations', component: Blank },
    ],
  })
  await router.push('/animations')
  await router.isReady()
  const utils = render(
    defineComponent({
      render: () => h(DzThemeProvider, { defaultTheme: 'light' }, () => h(AnimationsPage)),
    }),
    { global: { plugins: [router] } },
  )
  await flushPromises()
  return utils
}

/** The page root carrying the inline atmosphere vars. */
function pageRoot(container: Element): HTMLElement {
  const root = container.querySelector<HTMLElement>('.anim-page')
  expect(root).not.toBeNull()
  return root!
}

describe('av2-01 ambient atmosphere', () => {
  it('renders exactly one aria-hidden atmosphere layer as the first page child', async () => {
    const { container } = await mountPage()
    const layers = container.querySelectorAll('.av2-atmosphere')
    expect(layers).toHaveLength(1)
    expect(layers[0]!.getAttribute('aria-hidden')).toBe('true')
    expect(pageRoot(container).firstElementChild).toBe(layers[0])
  })

  it('settles to the brand pair when the category is "all" (initial load)', async () => {
    const { container } = await mountPage()
    const style = pageRoot(container).getAttribute('style') ?? ''
    expect(style).toContain('--av2-accent: var(--dz-primary)')
    expect(style).toContain('--av2-accent-2: var(--lp-brand-2, var(--dz-primary))')
  })

  it('takes the active category\'s accent pair when a chip is selected, and resets on All', async () => {
    const { container, getByRole } = await mountPage()

    await fireEvent.click(getByRole('button', { name: 'Text' }))
    await flushPromises()
    const [primary, secondary] = CATEGORY_ACCENTS.text!
    let style = pageRoot(container).getAttribute('style') ?? ''
    expect(style).toContain(`--av2-accent: var(--dz-colors-${primary}-500)`)
    expect(style).toContain(`--av2-accent-2: var(--dz-colors-${secondary}-500)`)

    await fireEvent.click(getByRole('button', { name: 'All' }))
    await flushPromises()
    style = pageRoot(container).getAttribute('style') ?? ''
    expect(style).toContain('--av2-accent: var(--dz-primary)')
  })

  it('lands already lit when deep-linked to a category hash', async () => {
    window.history.replaceState(window.history.state, '', '#numbers')
    const { container } = await mountPage()
    const [primary] = CATEGORY_ACCENTS.numbers!
    const style = pageRoot(container).getAttribute('style') ?? ''
    expect(style).toContain(`--av2-accent: var(--dz-colors-${primary}-500)`)
  })
})

describe('av2-02 hero overture', () => {
  it('mounts the depth field as decoration inside the page root', async () => {
    const { container } = await mountPage()
    const field = container.querySelector('.av2-hero-field')
    expect(field).not.toBeNull()
    expect(field!.getAttribute('aria-hidden')).toBe('true')
    expect(field!.hasAttribute('inert')).toBe(true)
    expect(pageRoot(container).contains(field!)).toBe(true)
  })

  it('keeps the h1 text intact through the word cascade + animated gradient', async () => {
    const { container } = await mountPage()
    const h1 = container.querySelector('#animations-title')
    expect(h1).not.toBeNull()
    expect(h1!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Motion, ready to drop in')
    // The gradient span is now the ANIMATED primitive, not the static utility.
    expect(h1!.querySelector('.dz-gradient-text')).not.toBeNull()
    expect(h1!.querySelector('.lp-gradient-text')).toBeNull()
  })

  it('derives every hero stat from the catalog — effects, categories, native upgrades', async () => {
    // test-utils mount (not testing-library) so the DzCountUp *targets* are
    // assertable via props — the count-up tween is timing, the derivation
    // contract is what matters, and no literal numbers belong in this spec.
    const Blank = { template: '<div />' }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Blank },
        { path: '/animations', component: Blank },
      ],
    })
    await router.push('/animations')
    await router.isReady()
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(DzThemeProvider, null, { default: () => h(AnimationsPage) }),
      }),
      { global: { plugins: [router] } },
    )
    await flushPromises()

    const stats = wrapper.find('.hero-stats')
    expect(stats.exists()).toBe(true)
    expect(stats.element.tagName).toBe('DL')
    const labels = stats.findAll('dt').map(dt => dt.text())
    expect(labels).toEqual(['Effects', 'Categories', 'Native-API upgrades'])

    const counters = wrapper
      .findAllComponents(DzCountUp)
      .filter(c => stats.element.contains(c.element))
    expect(counters.map(c => c.props('value'))).toEqual([
      CATALOG.length,
      CATEGORIES.length,
      CATALOG.filter(entry => entry.native).length,
    ])
    wrapper.unmount()
  })
})

describe('av2-04 control booth toolbar', () => {
  it('keeps the aria-pressed chip contract (regression guard)', async () => {
    const { getByRole } = await mountPage()
    const chip = getByRole('button', { name: 'Text' })
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })

  it('splits the result count into one plain SR layer and an aria-hidden odometer layer', async () => {
    const { container } = await mountPage()
    const count = container.querySelector('.result-count')!
    expect(count.getAttribute('aria-live')).toBe('polite')
    // Exactly one polite utterance: the visually-hidden plain sentence.
    const visual = count.querySelector('.result-count-visual')!
    expect(visual.getAttribute('aria-hidden')).toBe('true')
    expect(visual.querySelector('.dz-odometer, [class*="odometer"]')).not.toBeNull()
    expect(count.textContent).toContain('animations')
  })

  it('shows Clear only while filters are active', async () => {
    const { container, getByRole, queryByRole } = await mountPage()
    expect(queryByRole('button', { name: 'Clear' })).toBeNull()
    await fireEvent.click(getByRole('button', { name: 'Numbers' }))
    await flushPromises()
    expect(queryByRole('button', { name: 'Clear' })).not.toBeNull()
    await fireEvent.click(getByRole('button', { name: 'Clear' }))
    await flushPromises()
    // Leave transition keeps the node briefly; the filter state must be reset.
    const style = pageRoot(container).getAttribute('style') ?? ''
    expect(style).toContain('--av2-accent: var(--dz-primary)')
  })

  it('renders the stuck-state sentinel and the reading-progress hairline as decoration', async () => {
    const { container } = await mountPage()
    const sentinel = container.querySelector('.toolbar-sentinel')
    expect(sentinel).not.toBeNull()
    expect(sentinel!.getAttribute('aria-hidden')).toBe('true')
    const hairline = container.querySelector('.toolbar-progress')
    expect(hairline).not.toBeNull()
    expect(hairline!.getAttribute('aria-hidden')).toBe('true')
    // Scroll-linked = user-driven: the hairline persists under the page toggle
    // (the ScrollProgressBar "static-jump" convention).
    expect(hairline!.getAttribute('style')).toContain('scaleX')
  })
})

describe('av2-05 choreography', () => {
  it('plays the fail-open scroll entrance on the initial cohort (motion allowed)', async () => {
    const { container } = await mountPage()
    // The firing IO polyfill reveals every observed card at once — the
    // entrance classes must be PRESENT (fail-open means the directive adds
    // classes on view; content was never hidden before that).
    const entered = container.querySelectorAll('.bento .anim-card.dz-animate-in')
    expect(entered.length).toBeGreaterThan(0)
  })

  it('drops the entrance entirely when the page reduce toggle is on', async () => {
    const { container, getByRole } = await mountPage()
    await fireEvent.click(getByRole('switch', { name: 'Reduce motion in all demos' }))
    await flushPromises()
    // The bento swaps to the TransitionGroup branch, remounting every card
    // with the empty entrance — no dz-animate-in anywhere.
    expect(container.querySelector('.bento .anim-card.dz-animate-in')).toBeNull()
    expect(container.querySelectorAll('.bento .anim-card').length).toBeGreaterThan(0)
  })

  it('rescues a doomed filter with three derived, accented category suggestions', async () => {
    const { container, getByRole, getByLabelText } = await mountPage()
    await fireEvent.update(getByLabelText('Search animations'), 'zzz-no-such-effect')
    await flushPromises()

    const empty = container.querySelector('.empty')
    expect(empty).not.toBeNull()
    const chips = [...empty!.querySelectorAll<HTMLButtonElement>('.empty-suggestions .chip')]
    expect(chips).toHaveLength(3)

    // Each suggestion is a real category label with its own accent vars.
    const labels = new Map(CATEGORIES.map(c => [c.label, c.id]))
    for (const chip of chips) {
      expect(labels.has(chip.textContent!.trim())).toBe(true)
      expect(chip.getAttribute('style')).toContain('--accent:')
    }

    // Clicking one goes through the same activeCategory ref: grid non-empty,
    // hash updated, atmosphere retargeted.
    const first = chips[0]!
    const id = labels.get(first.textContent!.trim())!
    await fireEvent.click(first)
    await flushPromises()
    expect(container.querySelector('.empty')).toBeNull()
    expect(container.querySelectorAll('.bento .anim-card').length).toBeGreaterThan(0)
    expect(window.location.hash).toBe(`#${id}`)
    // The suggestion never offers the already-active (failing) category — with
    // one now active, re-strand and confirm it is excluded.
    await fireEvent.update(getByLabelText('Search animations'), 'zzz-no-such-effect')
    await flushPromises()
    const again = [...container.querySelectorAll<HTMLButtonElement>('.empty-suggestions .chip')]
    expect(again).toHaveLength(3)
    expect(again.map(c => labels.get(c.textContent!.trim()))).not.toContain(id)
    // Regression guard: the aria-pressed chip still owns the state.
    expect(getByRole('button', { name: 'All' })).toBeTruthy()
  })
})

describe('av2 teardown hygiene', () => {
  /**
   * The guard on the guard. The tracker above identifies AutoAnimate's timers
   * by their call stack, which is a string match against a dependency's path —
   * if an upgrade renames the module, moves `poll()` behind a bundled wrapper
   * or starts cancelling its own intervals, this stops matching SILENTLY and
   * the 127 post-teardown `ReferenceError`s come back the next time someone
   * runs the full suite. So the file asserts that it still sees what it is
   * there to clean up.
   *
   * If this ever fails, check `node_modules/@formkit/auto-animate/index.mjs`
   * `poll()` first: a version that clears its own intervals is the good
   * outcome, and then the whole tracker above can be deleted.
   */
  it('still sees the AutoAnimate poll timers it exists to clear', async () => {
    autoAnimateTimers.clear()
    const { container } = await mountPage()
    // Precondition: the AutoAnimate branch of the bento is the one that rendered.
    expect(container.querySelector('.bento')).not.toBeNull()
    expect(autoAnimateTimers.size).toBeGreaterThan(0)
  })
})

describe('av2-06 curtain call', () => {
  it('mounts the finale exactly once, after the gallery', async () => {
    const { container } = await mountPage()
    const finales = container.querySelectorAll('.av2-finale')
    expect(finales).toHaveLength(1)
    const gallery = container.querySelector('.gallery')!
    // Document order: the gallery precedes the finale.
    expect(
      gallery.compareDocumentPosition(finales[0]!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
