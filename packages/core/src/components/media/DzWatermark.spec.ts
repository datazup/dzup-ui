import type { MockInstance } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzWatermark — Unit / behavior tests.
 *
 * jsdom has no canvas backend, so we stub `getContext`/`toDataURL` with a
 * recording 2D context. This lets us assert the tiling math (rotate, gap, line
 * layout) that drives the generated background.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzWatermark from './DzWatermark.vue'

/**
 * Wait for a condition rather than a fixed sleep (UI-DZUP-UI-TEST-M-03): portalled
 * content lands a tick or two after mount, and a loaded host makes any fixed
 * interval either too short or wasted.
 */
async function settle(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion, { timeout: 5000, interval: 10 })
}

interface RecordingCtx {
  rotate: MockInstance
  fillText: MockInstance
  translate: MockInstance
  drawImage: MockInstance
  fillStyle: string
}

let ctx: RecordingCtx
let getContextSpy: MockInstance
let toDataURLSpy: MockInstance
interface ImageLike {
  src: string
  onload: (() => void) | null
  onerror: (() => void) | null
}
let lastImage: ImageLike | null

beforeEach(() => {
  lastImage = null
  // jsdom's <img> never fires load for assigned src; record the instance so the
  // image-mark test can drive the async decode deterministically.
  class ImageStub implements ImageLike {
    crossOrigin = ''
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    #src = ''
    get src(): string {
      return this.#src
    }

    set src(value: string) {
      this.#src = value
      // eslint-disable-next-line ts/no-this-alias
      lastImage = this
    }
  }
  ;(globalThis as { Image: unknown }).Image = ImageStub

  ctx = {
    font: '',
    fillStyle: '',
    textAlign: '',
    textBaseline: '',
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
  } as unknown as RecordingCtx

  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  toDataURLSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockReturnValue('data:image/png;base64,MOCK')
})

afterEach(() => {
  getContextSpy.mockRestore()
  toDataURLSpy.mockRestore()
})

describe('dzWatermark — Unit Tests', () => {
  it('renders a <div> root with a relative position context', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'x' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('relative')
  })

  it('paints the generated tile as a repeating background image', async () => {
    const wrapper = mount(DzWatermark, { props: { content: 'CONFIDENTIAL' } })
    await flushPromises()
    const overlay = wrapper.find('[aria-hidden="true"]')
    expect(overlay.attributes('style')).toContain('background-image')
    expect(overlay.attributes('style')).toContain('data:image/png;base64,MOCK')
  })

  it('derives the tile background-size from the gap (single number → both axes)', async () => {
    // markWidth = 50 (mocked), 1 line → markHeight = ceil(16 * 1.2) = 20
    const wrapper = mount(DzWatermark, { props: { content: 'x', gap: 30 } })
    await flushPromises()
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).toContain('background-size: 80px 50px')
  })

  it('derives the tile background-size from a [x, y] gap tuple', async () => {
    const wrapper = mount(DzWatermark, { props: { content: 'x', gap: [40, 60] } })
    await flushPromises()
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).toContain('background-size: 90px 80px')
  })

  it('applies the rotate prop when drawing the mark', async () => {
    mount(DzWatermark, { props: { content: 'x', rotate: -45 } })
    await flushPromises()
    expect(ctx.rotate).toHaveBeenCalledWith((-45 * Math.PI) / 180)
  })

  it('defaults the rotation to -22 degrees', async () => {
    mount(DzWatermark, { props: { content: 'x' } })
    await flushPromises()
    expect(ctx.rotate).toHaveBeenCalledWith((-22 * Math.PI) / 180)
  })

  it('draws one line per entry for multi-line content', async () => {
    mount(DzWatermark, { props: { content: ['Acme Inc.', 'Do not distribute'] } })
    await flushPromises()
    expect(ctx.fillText).toHaveBeenCalledTimes(2)
    expect(ctx.fillText).toHaveBeenCalledWith('Acme Inc.', 0, expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Do not distribute', 0, expect.any(Number))
  })

  it('grows the tile height with the number of lines', async () => {
    const wrapper = mount(DzWatermark, { props: { content: ['a', 'b', 'c'], gap: 0 } })
    await flushPromises()
    // 3 lines → markHeight = ceil(16 * 1.2 * 3) = 58, gap 0 → tileHeight 58
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).toContain('background-size: 50px 58px')
  })

  it('regenerates the tile when content changes', async () => {
    const wrapper = mount(DzWatermark, { props: { content: 'one' } })
    await flushPromises()
    ctx.fillText.mockClear()
    await wrapper.setProps({ content: 'two' })
    await flushPromises()
    expect(ctx.fillText).toHaveBeenCalledWith('two', 0, expect.any(Number))
  })

  it('renders no background when there is no content', async () => {
    const wrapper = mount(DzWatermark, { props: {} })
    await flushPromises()
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).not.toContain('background-image')
  })

  it('applies the zIndex prop to the overlay', async () => {
    const wrapper = mount(DzWatermark, { props: { content: 'x', zIndex: 42 } })
    await flushPromises()
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).toContain('z-index: 42')
  })

  it('renders an image mark via canvas drawImage', async () => {
    const wrapper = mount(DzWatermark, { props: { image: '/logo.png' } })
    await flushPromises()
    // Drive the async Image decode captured by the stub.
    expect(lastImage).not.toBeNull()
    lastImage?.onload?.()
    await flushPromises()
    expect(ctx.drawImage).toHaveBeenCalled()
    const style = wrapper.find('[aria-hidden="true"]').attributes('style') ?? ''
    expect(style).toContain('data:image/png;base64,MOCK')
  })

  describe('tamper resistance (observe)', () => {
    it('re-attaches the overlay if it is removed when observe is on', async () => {
      const wrapper = mount(DzWatermark, {
        props: { content: 'x', observe: true },
        attachTo: document.body,
      })
      await flushPromises()
      const root = wrapper.element
      const overlay = wrapper.find('[aria-hidden="true"]').element
      overlay.remove()
      expect(root.contains(overlay)).toBe(false)
      // MutationObserver callbacks are microtask-scheduled; wait for the re-insert.
      await settle(() => expect(root.contains(overlay)).toBe(true))
      wrapper.unmount()
    })

    const tampers: Array<[string, (el: HTMLElement) => void]> = [
      ['display:none', el => void (el.style.display = 'none')],
      ['visibility:hidden', el => void (el.style.visibility = 'hidden')],
      ['opacity:0', el => void (el.style.opacity = '0')],
      ['a cleared background image', el => void (el.style.backgroundImage = '')],
      ['a removed class', el => el.removeAttribute('class')],
    ]

    async function mountTampered(observe: boolean, tamper: (el: HTMLElement) => void) {
      const wrapper = mount(DzWatermark, {
        props: { content: 'x', observe },
        attachTo: document.body,
      })
      await flushPromises()
      const overlay = wrapper.find('[aria-hidden="true"]').element as HTMLElement
      const original = {
        className: overlay.getAttribute('class'),
        backgroundImage: overlay.style.backgroundImage,
      }
      expect(original.className).toBeTruthy()
      expect(original.backgroundImage).toContain('MOCK')
      tamper(overlay)
      return { wrapper, overlay, original }
    }

    for (const [label, tamper] of tampers) {
      it(`restores the overlay after ${label} when observe is on`, async () => {
        const { wrapper, overlay, original } = await mountTampered(true, tamper)
        await settle(() => {
          expect(overlay.getAttribute('class')).toBe(original.className)
          expect(overlay.style.backgroundImage).toBe(original.backgroundImage)
          expect(overlay.style.display).toBe('')
          expect(overlay.style.visibility).toBe('')
          expect(overlay.style.opacity).toBe('')
        })
        wrapper.unmount()
      })

      it(`leaves ${label} in place when observe is off`, async () => {
        const { wrapper, overlay, original } = await mountTampered(false, tamper)
        await flushPromises()
        const restored = overlay.getAttribute('class') === original.className
          && overlay.style.backgroundImage === original.backgroundImage
          && overlay.style.display === ''
          && overlay.style.visibility === ''
          && overlay.style.opacity === ''
        expect(restored).toBe(false)
        wrapper.unmount()
      })
    }

    it('does not loop on its own restoring writes', async () => {
      const observed = vi.spyOn(MutationObserver.prototype, 'observe')
      const { wrapper, overlay } = await mountTampered(true, el => void (el.style.display = 'none'))
      await settle(() => expect(overlay.style.display).toBe(''))
      await flushPromises()
      const calls = observed.mock.calls.length
      await flushPromises()
      await flushPromises()
      // A feedback loop would keep re-entering reapply() and re-observing.
      expect(observed.mock.calls.length).toBe(calls)
      observed.mockRestore()
      wrapper.unmount()
    })

    it('does not re-attach the overlay when observe is off', async () => {
      const wrapper = mount(DzWatermark, {
        props: { content: 'x', observe: false },
        attachTo: document.body,
      })
      await flushPromises()
      const root = wrapper.element
      const overlay = wrapper.find('[aria-hidden="true"]').element
      overlay.remove()
      // Nothing should re-insert it, so there is no condition to wait for: drain
      // the queued observer work and assert the absence.
      await flushPromises()
      expect(root.contains(overlay)).toBe(false)
      wrapper.unmount()
    })
  })
})
