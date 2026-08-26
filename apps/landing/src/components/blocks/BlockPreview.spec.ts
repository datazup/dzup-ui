/**
 * BlockPreview interaction sweep.
 *
 * `BlockPreview` is the single most-used component on the site — the /blocks
 * index mounts 87 of them and `/blocks/:id` makes one the page's primary content
 * — and it was also its least-exercised: 8 of 31 functions ran, at full statement
 * coverage. Everything the component RENDERS was covered; nothing a visitor
 * DOES to it was. The gap is entirely "nobody ever clicked it", the same shape
 * `blocks/interactions.spec.ts` was written to close for the blocks themselves.
 *
 * The preview-first detail route made that gap matter more: its controls are now
 * the first interactive thing on the page rather than a secondary affordance on a
 * gallery card, and the redesign added several of them.
 *
 * What this drives, one control at a time:
 *   • the settings disclosure and its `matchMedia` breakpoint sync
 *   • the viewport / theme / direction segmented controls
 *   • the resize handle, by pointer drag AND by keyboard
 *   • copy-as-markdown, copy-as-prompt, and the Code tab's own copy
 *   • the "open in new tab" / "open in v0" handoffs
 *   • the component chips' reverse-lookup emit
 *
 * It asserts observable outcomes — a width readout that moves, an `aria-expanded`
 * that flips, a `dir` that mirrors, clipboard text that is actually the block's
 * source — rather than merely that a handler did not throw. `interactions.spec.ts`
 * is the "nothing breaks" floor; this is the "the control does its job" layer.
 */

import type { BlockDef } from '../../blocks/registry.ts'
import { DzThemeProvider } from '@dzup-ui/core'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { BLOCKS } from '../../blocks/registry.ts'
import BlockPreview from './BlockPreview.vue'

/**
 * Listeners registered against the preview's own breakpoint query, so the test
 * can cross the breakpoint the way the browser would. `syncPreviewControls` is
 * only reachable through this — it is a `change` handler, never called directly.
 */
type MediaListener = (event: { matches: boolean }) => void
const mediaListeners = new Set<MediaListener>()
let narrowViewport = false

function installMatchMedia(): void {
  mediaListeners.clear()
  narrowViewport = false
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === '(max-width: 560px)' && narrowViewport
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: MediaListener) => void mediaListeners.add(listener),
    removeEventListener: (_type: string, listener: MediaListener) => void mediaListeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

/** Cross the 560px breakpoint and notify, exactly as the browser does. */
function setNarrowViewport(value: boolean): void {
  narrowViewport = value
  for (const listener of mediaListeners) listener({ matches: value })
}

/**
 * The stage measures its own content box to bound the drag. jsdom reports 0 for
 * every layout box, which would clamp every width to `MIN_WIDTH` and make the
 * resize assertions vacuous — so give the stage a real width.
 *
 * This patches `HTMLElement.prototype`, which is the whole document's geometry,
 * not this component's. The descriptors are captured and restored in `afterAll`:
 * a layout stub left installed is exactly the kind of cross-file bleed that makes
 * some OTHER suite's resize test fail depending on how files were scheduled, and
 * chasing that back to here would be miserable.
 */
const patchedGeometry: Array<[keyof HTMLElement, PropertyDescriptor | undefined]> = []

function stubStageGeometry(px = 1200): void {
  const measured = (el: HTMLElement): number =>
    el.classList.contains('bp-stage') || el.classList.contains('bp-frame') ? px : 0

  patchedGeometry.push(
    ['clientWidth', Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')],
    ['getBoundingClientRect', Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect')],
  )
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains('bp-stage') ? px : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: HTMLElement) {
      const width = measured(this)
      return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) }
    },
  })
}

function restoreStageGeometry(): void {
  for (const [key, descriptor] of patchedGeometry) {
    if (descriptor)
      Object.defineProperty(HTMLElement.prototype, key, descriptor)
    else
      Reflect.deleteProperty(HTMLElement.prototype, key)
  }
  patchedGeometry.length = 0
}

const clipboard = { writeText: vi.fn(async (_text: string) => {}) }

beforeAll(() => {
  stubStageGeometry()
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver
  }
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] { return [] }
      root = null
      rootMargin = ''
      thresholds = []
    } as unknown as typeof IntersectionObserver
  }
  // Element.setPointerCapture / releasePointerCapture do not exist in jsdom, and
  // the drag handler calls both. Without them the very first pointerdown throws
  // and the whole drag path stays unmeasured.
  if (typeof Element.prototype.setPointerCapture !== 'function') {
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}
  }
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard })
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

beforeEach(() => {
  installMatchMedia()
  clipboard.writeText.mockClear()
})

afterAll(() => {
  restoreStageGeometry()
})

/** A block with several components, so the chips and their counts are real. */
const block: BlockDef = BLOCKS.find(b => b.components.length > 1) ?? BLOCKS[0]!

function mountPreview(props: Record<string, unknown> = {}) {
  const selected: string[] = []
  const utils = render(defineComponent({
    setup: () => () => h(DzThemeProvider, null, {
      default: () => h(BlockPreview, {
        block,
        ...props,
        onSelectComponent: (name: string) => void selected.push(name),
      }),
    }),
  }))
  return { ...utils, selected }
}

/**
 * The drag handle carries the live width as `aria-valuenow`, so it doubles as the
 * readout this file asserts against. It is a `separator`, not a `slider`: the
 * value it exposes is a container width, not a form value.
 */
function widthHandle(container: ParentNode): HTMLElement {
  return container.querySelector<HTMLElement>('[role="separator"]')!
}

/**
 * One option of a DzSegmented control, found by its label.
 *
 * Queried by `aria-label` rather than by role: DzSegmented is built on Reka's
 * ToggleGroup, whose items are buttons in a roving-focus group — not the radios a
 * segmented control looks like. Binding the assertion to the accessible NAME
 * keeps it honest either way if that primitive changes underneath.
 */
function segment(container: ParentNode, label: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[aria-label="${label}"]`)
  if (el === null)
    throw new Error(`no segmented option labelled "${label}" in the rendered preview`)
  return el
}

describe('blockPreview — settings disclosure', () => {
  it('starts open on a wide viewport and collapses when the breakpoint is crossed', async () => {
    const { container } = mountPreview()
    const toggle = container.querySelector<HTMLElement>('[aria-expanded]')!

    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    setNarrowViewport(true)
    await nextTick()
    expect(
      toggle.getAttribute('aria-expanded'),
      'crossing to a narrow viewport must collapse the secondary controls',
    ).toBe('false')

    setNarrowViewport(false)
    await nextTick()
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('toggles by click, independently of the breakpoint', async () => {
    const { container } = mountPreview()
    const toggle = container.querySelector<HTMLElement>('[aria-expanded]')!

    await fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    await fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('blockPreview — viewport, theme and direction', () => {
  it('pins the frame width from the viewport presets', async () => {
    const { container } = mountPreview()
    const handle = widthHandle(container)
    // `stubStageGeometry` gives the stage a 1200px content box, so that is what
    // the Desktop ("full") preset must resolve to.
    await nextTick()
    expect(handle.getAttribute('aria-valuenow')).toBe('1200')

    await fireEvent.click(segment(container, 'Mobile'))
    await nextTick()
    expect(handle.getAttribute('aria-valuenow'), 'Mobile preset is 390px').toBe('390')

    await fireEvent.click(segment(container, 'Tablet'))
    await nextTick()
    expect(handle.getAttribute('aria-valuenow'), 'Tablet preset is 768px').toBe('768')

    await fireEvent.click(segment(container, 'Desktop'))
    await nextTick()
    expect(
      handle.getAttribute('aria-valuenow'),
      'Desktop releases the pin and fills the container again',
    ).toBe('1200')
  })

  it('mirrors the stage when direction flips to RTL, and only the stage', async () => {
    const { container } = mountPreview()

    expect(container.querySelector('.bp-stage')!.getAttribute('dir')).toBe('ltr')

    await fireEvent.click(segment(container, 'RTL'))
    await nextTick()

    expect(container.querySelector('.bp-stage')!.getAttribute('dir')).toBe('rtl')
    expect(
      container.querySelector('.block-preview')!.getAttribute('dir'),
      'the flip must not escape the stage onto the surrounding chrome',
    ).toBeNull()
  })

  it('overrides the stage theme without touching the document', async () => {
    const { container } = mountPreview()
    const stage = () => container.querySelector('.bp-stage')!.getAttribute('data-theme')

    expect(stage()).toBe('light')

    await fireEvent.click(segment(container, 'Dark'))
    await nextTick()
    expect(stage()).toBe('dark')
    expect(
      document.documentElement.getAttribute('data-theme'),
      'a per-preview override must never re-theme the site',
    ).not.toBe('dark')

    // Choosing the value that equals the global theme clears the override, so the
    // preview follows the site again rather than staying pinned to light.
    await fireEvent.click(segment(container, 'Light'))
    await nextTick()
    expect(stage()).toBe('light')
  })
})

describe('blockPreview — resize handle', () => {
  it('resizes by pointer drag', async () => {
    const { container } = mountPreview()
    const handle = widthHandle(container)

    await fireEvent.pointerDown(handle, { clientX: 1200, pointerId: 1 })
    await fireEvent.pointerMove(handle, { clientX: 800, pointerId: 1 })
    await nextTick()

    const during = Number(handle.getAttribute('aria-valuenow'))
    expect(during, 'dragging inward must narrow the frame').toBeLessThan(1200)
    expect(during, 'and must not fall through the 320px floor').toBeGreaterThanOrEqual(320)

    await fireEvent.pointerUp(handle, { clientX: 800, pointerId: 1 })
    await nextTick()
    expect(handle.getAttribute('aria-valuenow')).toBe(String(during))
  })

  it('clamps a drag past the minimum rather than inverting the frame', async () => {
    const { container } = mountPreview()
    const handle = widthHandle(container)

    await fireEvent.pointerDown(handle, { clientX: 1200, pointerId: 1 })
    await fireEvent.pointerMove(handle, { clientX: -5000, pointerId: 1 })
    await fireEvent.pointerUp(handle, { clientX: -5000, pointerId: 1 })
    await nextTick()

    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(320)
  })

  it('resizes by keyboard, which is the only route for a non-pointer user', async () => {
    const { container } = mountPreview()
    const handle = widthHandle(container)

    await fireEvent.click(segment(container, 'Tablet'))
    await nextTick()
    expect(handle.getAttribute('aria-valuenow')).toBe('768')

    await fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    await nextTick()
    const narrower = Number(handle.getAttribute('aria-valuenow'))
    expect(narrower).toBeLessThan(768)

    await fireEvent.keyDown(handle, { key: 'ArrowRight' })
    await nextTick()
    expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(narrower)

    await fireEvent.keyDown(handle, { key: 'Home' })
    await nextTick()
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(320)

    await fireEvent.keyDown(handle, { key: 'End' })
    await nextTick()
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(1200)

    // An unhandled key must fall through untouched — the handler returns before
    // preventDefault so the browser keeps its own behaviour.
    const before = handle.getAttribute('aria-valuenow')
    await fireEvent.keyDown(handle, { key: 'a' })
    await nextTick()
    expect(handle.getAttribute('aria-valuenow')).toBe(before)
  })
})

describe('blockPreview — copy and handoff actions', () => {
  it('copies the block as markdown and announces it distinctly', async () => {
    const { container, getByRole } = mountPreview()

    await fireEvent.click(getByRole('button', { name: 'Copy block as markdown' }))
    await flushPromises()

    expect(clipboard.writeText).toHaveBeenCalledOnce()
    const status = container.querySelector('[aria-live]')!
    expect(
      status.textContent,
      'the icon-only copy buttons sound identical without a distinct message',
    ).toContain('Copied')
  })

  it('copies the AI prompt, which carries the block and its docs URL', async () => {
    const { getByRole } = mountPreview()

    await fireEvent.click(getByRole('button', { name: 'Copy block as AI prompt' }))
    await flushPromises()

    const written = clipboard.writeText.mock.calls[0]![0]
    expect(written).toContain(block.title)
    expect(written).toContain('llms.txt')
  })

  it('copies the Code tab source, not the markdown wrapper', async () => {
    const { container, getByRole } = mountPreview()

    // Reka's tabs use automatic activation: the panel switches on FOCUS, not on
    // click. Clicking alone leaves the Preview panel mounted and the assertion
    // below hunting for a control that was never rendered.
    await fireEvent.focus(getByRole('tab', { name: /code/i }))
    await flushPromises()
    await fireEvent.click(segment(container, 'Copy the code shown below'))
    await flushPromises()

    const written = clipboard.writeText.mock.calls[0]![0]
    expect(written).not.toContain('```')
    expect(written.length).toBeGreaterThan(0)
  })

  it('hands the block to v0, or offers nothing rather than a dead link', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    const { container } = mountPreview()

    const v0 = container.querySelector<HTMLElement>('[aria-label="Open in v0"]')
    // The control is deliberately conditional: with no registry host resolved
    // there is no URL to hand over, and the block hides the action instead of
    // linking somewhere broken. Both states are correct — a silently dead button
    // is the only wrong one.
    if (v0 === null) {
      expect(open).not.toHaveBeenCalled()
      return
    }

    await fireEvent.click(v0)
    expect(open).toHaveBeenCalledOnce()
    const [, target, features] = open.mock.calls[0]!
    expect(target).toBe('_blank')
    expect(features).toContain('noopener')
  })

  it('opens the full-screen stage, which is a second live copy of the block', async () => {
    const { container } = mountPreview()

    await fireEvent.click(segment(container, 'Open preview full screen'))
    await flushPromises()

    // The dialog is Teleported, so it is found on the screen rather than in the
    // container the preview rendered into.
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog.textContent).toContain(block.title)
  })

  it('opens the standalone preview in a new tab with the opener severed', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    const { getByRole } = mountPreview()

    await fireEvent.click(getByRole('button', { name: 'Open preview in new tab' }))

    expect(open).toHaveBeenCalledOnce()
    const [url, target, features] = open.mock.calls[0]!
    expect(url).toContain(`/blocks/preview/${block.id}`)
    expect(target).toBe('_blank')
    expect(features, 'a tab opened without noopener keeps a live window.opener').toContain('noopener')
  })
})

describe('blockPreview — component chips', () => {
  it('emits the reverse lookup for the component the visitor picked', async () => {
    const { container, selected } = mountPreview()
    const chip = within(container.querySelector<HTMLElement>('.bp-chips')!)
      .getAllByRole('button')[0]!

    await fireEvent.click(chip)

    expect(selected).toEqual([block.components[0]])
  })

  it('labels each chip with the number of blocks it leads to', () => {
    const { container } = mountPreview()
    const chip = within(container.querySelector<HTMLElement>('.bp-chips')!)
      .getAllByRole('button')[0]!

    expect(chip.getAttribute('aria-label')).toMatch(/Show \d+ blocks? using /)
  })
})

describe('blockPreview — heading bridge', () => {
  it('emits no bridge headings at the default level, where none are needed', () => {
    const { container } = mountPreview()
    const section = container.querySelector('.block-preview')!

    expect(section.querySelectorAll('h1, h2')).toHaveLength(0)
    expect(section.querySelector('h3'), 'the title itself is the h3').toBeTruthy()
  })

  it('bridges h1 to the block\'s own h4 when the preview titles the page', () => {
    const { container } = mountPreview({ headingLevel: 1 })
    const section = container.querySelector('.block-preview')!
    const levels = [...section.querySelectorAll('h1, h2, h3, h4')]
      .map(el => Number(el.tagName[1]))

    expect(levels[0], 'the preview title is the page h1').toBe(1)
    expect(
      levels.slice(0, 3),
      'h2 and h3 must exist between the h1 and the block content authored at h4',
    ).toEqual([1, 2, 3])
    for (let i = 1; i < levels.length; i += 1)
      expect(levels[i]! <= levels[i - 1]! + 1, `h${levels[i - 1]} → h${levels[i]} skips a level`).toBe(true)
  })
})

describe('stage presence (TASK-BV2-06)', () => {
  it('mounts the border beam as inert chrome and runs the one-lap intro', async () => {
    const { container } = mountPreview()
    await flushPromises()
    const beam = container.querySelector('.bp-beam')
    expect(beam).not.toBeNull()
    expect(beam!.getAttribute('aria-hidden')).toBe('true')
    expect(beam!.classList.contains('dz-border-beam')).toBe(true)
    // Freshly live: the intro lap is armed (motion allowed in this harness).
    expect(beam!.classList.contains('is-intro')).toBe(true)
    // The overlay lives OUTSIDE the block's own subtree, inside the frame.
    expect(beam!.closest('.bp-frame')).not.toBeNull()
  })

  it('never arms the intro under the page-level reduced-motion override', async () => {
    // provideMotionPreference must wrap the mount (the OS matchMedia read is a
    // module singleton — the provide override is the supported spec hook).
    const { provideMotionPreference } = await import('../../motion/index.ts')
    const utils = render(defineComponent({
      setup() {
        provideMotionPreference(true)
        return () => h(DzThemeProvider, null, {
          default: () => h(BlockPreview, { block }),
        })
      },
    }))
    await flushPromises()
    const beam = utils.container.querySelector('.bp-beam')
    expect(beam).not.toBeNull()
    expect(beam!.classList.contains('is-intro')).toBe(false)
  })
})
