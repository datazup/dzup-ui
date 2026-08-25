/**
 * useRevealAndFocus — unit tests (TASK-FORM-OSS-04).
 *
 * The behaviour worth pinning is the failure it exists to stop: `focus()` on an
 * element inside a hidden panel does nothing, silently, and the caller has no
 * way to find out. So the function reports what actually holds focus rather
 * than what it tried to focus — a form that gets `null` back can fall back to
 * its error summary instead of stranding the user with no focus at all.
 */

import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { revealAndFocus, useRevealAndFocus } from './useRevealAndFocus.ts'

function panelWith(html: string): HTMLElement {
  const panel = document.createElement('div')
  panel.innerHTML = html
  document.body.append(panel)
  return panel
}

describe('revealAndFocus', () => {
  it('focuses the first match inside the container', async () => {
    const panel = panelWith('<input id="email"><input id="name">')

    const focused = await revealAndFocus(panel, 'input', { reducedMotion: true })

    expect(focused).toBe(panel.querySelector('#email'))
    expect(document.activeElement).toBe(focused)
    panel.remove()
  })

  it('returns null when nothing matches, rather than pretending it focused', async () => {
    const panel = panelWith('<span>no fields here</span>')
    expect(await revealAndFocus(panel, 'input', { reducedMotion: true })).toBeNull()
    panel.remove()
  })

  it('returns null when the element could not take focus', async () => {
    // This is the case the whole composable exists for: `focus()` on a node
    // inside a `display: none` panel is a no-op with no error and no signal.
    const panel = panelWith('<input id="hidden">')
    const input = panel.querySelector<HTMLInputElement>('#hidden')!
    vi.spyOn(input, 'focus').mockImplementation(() => {})

    expect(await revealAndFocus(panel, 'input', { reducedMotion: true })).toBeNull()
    panel.remove()
  })

  it('accepts a ref as well as an element', async () => {
    const panel = panelWith('<input id="a">')
    const container = ref<HTMLElement | null>(panel)

    expect(await revealAndFocus(container, 'input', { reducedMotion: true }))
      .toBe(panel.querySelector('#a'))
    panel.remove()
  })

  it('returns null for a container that is not there', async () => {
    expect(await revealAndFocus(ref(null), 'input', { reducedMotion: true })).toBeNull()
    expect(await revealAndFocus(null, 'input', { reducedMotion: true })).toBeNull()
  })

  it('waits for the reveal transition, then focuses', async () => {
    const panel = panelWith('<input id="late">')
    const pending = revealAndFocus(panel, 'input', { timeout: 1000 })

    // Not yet: the panel is still transitioning open.
    await Promise.resolve()
    expect(document.activeElement).not.toBe(panel.querySelector('#late'))

    panel.dispatchEvent(new Event('transitionend'))
    expect(await pending).toBe(panel.querySelector('#late'))
    panel.remove()
  })

  it('focuses anyway when the transition never ends', async () => {
    // A `transitionend` that never fires must not leave the user with no focus.
    // Slightly early focus is recoverable; never focusing is not.
    vi.useFakeTimers()
    const panel = panelWith('<input id="stuck">')
    const pending = revealAndFocus(panel, 'input', { timeout: 50 })

    await vi.advanceTimersByTimeAsync(60)
    vi.useRealTimers()

    expect(await pending).toBe(panel.querySelector('#stuck'))
    panel.remove()
  })

  it('skips the wait entirely under reduced motion', async () => {
    // There is no transition to wait for, so waiting for one would be a delay
    // with nothing on the other end of it.
    const panel = panelWith('<input id="fast">')
    const focused = await revealAndFocus(panel, 'input', { reducedMotion: true, timeout: 10_000 })
    expect(focused).toBe(panel.querySelector('#fast'))
    panel.remove()
  })
})

describe('useRevealAndFocus', () => {
  it('binds the container once and reveals into it repeatedly', async () => {
    const panel = panelWith('<input id="one"><input id="two">')
    const { focusInside } = useRevealAndFocus(ref(panel), { reducedMotion: true })

    expect(await focusInside('#one')).toBe(panel.querySelector('#one'))
    expect(await focusInside('#two')).toBe(panel.querySelector('#two'))
    panel.remove()
  })

  it('lets a call override the defaults it was built with', async () => {
    const panel = panelWith('<input id="x">')
    const { focusInside } = useRevealAndFocus(ref(panel), { reducedMotion: false, timeout: 5000 })

    // Without the override this would wait five seconds for a transition that
    // is not coming.
    expect(await focusInside('#x', { reducedMotion: true })).toBe(panel.querySelector('#x'))
    panel.remove()
  })
})
