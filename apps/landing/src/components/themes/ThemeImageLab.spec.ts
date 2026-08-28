/**
 * ThemeImageLab + themeImageSampling — the /themes "from image" darkroom
 * (docs/themes-v2.md TASK-THV2-06).
 *
 * The sampling math is tested PURE (synthetic pixel buffers); the component is
 * tested end-to-end with a faked 2d context + Image so the full pick → sample
 * → apply → announce pipeline runs in jsdom. The flight-dot show cannot be
 * asserted positionally here (gBCR is all zeros in jsdom — the component
 * skips the flight by design); presence/absence and gating are what we pin.
 */

import { cleanup, fireEvent, render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useThemeDesigner } from '../../composables/useThemeDesigner.ts'
import ThemeImageLab from './ThemeImageLab.vue'
import { sampleDominantOklch } from './themeImageSampling.ts'

/** A flat pixel buffer of `n` RGBA pixels. */
function pixels(n: number, [r, g, b, a]: [number, number, number, number]): number[] {
  const data: number[] = []
  for (let i = 0; i < n; i++) data.push(r, g, b, a)
  return data
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
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  useThemeDesigner().reset()
})

describe('themeImageSampling (pure)', () => {
  it('finds the dominant chromatic hue and surfaces ranked top bins', () => {
    // 200 saturated reds + 40 saturated blues: red must win, blue must rank.
    const data = [
      ...pixels(200, [230, 60, 60, 255]),
      ...pixels(40, [60, 90, 230, 255]),
    ]
    const sample = sampleDominantOklch(data)
    expect(sample).not.toBeNull()
    expect(sample!.topBins.length).toBeGreaterThanOrEqual(2)
    expect(sample!.topBins[0]!.count).toBeGreaterThan(sample!.topBins[1]!.count)
    expect(sample!.hue).toBe(sample!.topBins[0]!.hue)
    // A saturated red sits in the 15–40° OKLCH hue band.
    expect(sample!.hue).toBeGreaterThan(5)
    expect(sample!.hue).toBeLessThan(60)
  })

  it('returns null for gray, transparent, or extreme-lightness pixels', () => {
    const data = [
      ...pixels(50, [128, 128, 128, 255]), // near-gray → chroma skip
      ...pixels(50, [230, 60, 60, 40]), // transparent → alpha skip
      ...pixels(50, [255, 255, 255, 255]), // too light
      ...pixels(50, [3, 3, 3, 255]), // too dark
    ]
    expect(sampleDominantOklch(data)).toBeNull()
  })
})

describe('themeImageLab (THV2-06)', () => {
  function stubImagePipeline(buffer: number[]): void {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: () => {},
      getImageData: () => ({ data: Uint8ClampedArray.from(buffer) }),
    } as unknown as CanvasRenderingContext2D)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:themes-test'),
      revokeObjectURL: vi.fn(),
    })
    class FakeImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      private srcValue = ''
      get src(): string {
        return this.srcValue
      }

      set src(value: string) {
        this.srcValue = value
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage)
  }

  async function pick(container: Element, file: File): Promise<void> {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    await fireEvent.change(input)
    await flushPromises()
  }

  it('renders the keyboard path: a labelled file input accepting images', () => {
    const { container, getByText } = render(ThemeImageLab)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')
    expect(input?.getAttribute('accept')).toBe('image/*')
    expect(input?.closest('label')).not.toBeNull()
    getByText('Experimental')
  })

  it('applies the sampled palette from a picked image and announces politely', async () => {
    stubImagePipeline(pixels(300, [230, 60, 60, 255]))
    const designer = useThemeDesigner()
    const before = designer.palettes.primary.hue
    const { container } = render(ThemeImageLab)
    await pick(container, new File([''], 'a.png', { type: 'image/png' }))

    const status = container.querySelector('.thv2-image-status')
    expect(status?.textContent).toContain('Applied primary from image')
    expect(status?.getAttribute('aria-live')).toBe('polite')
    // Deliberately NOT role="status" — the copy region owns that pairing.
    expect(status?.getAttribute('role')).toBeNull()
    expect(designer.palettes.primary.hue).not.toBe(before)
    expect(designer.palettes.neutral.chroma).toBeCloseTo(0.012)
    // jsdom gBCR is zeros → the flight self-skips; the APPLY still happened.
    expect(document.querySelectorAll('.thv2-flight-dot')).toHaveLength(0)
  })

  it('shows the thumbnail after a pick and ignores non-image files', async () => {
    stubImagePipeline(pixels(300, [230, 60, 60, 255]))
    const { container } = render(ThemeImageLab)
    expect(container.querySelector('.thv2-thumb')).toBeNull()
    await pick(container, new File([''], 'a.txt', { type: 'text/plain' }))
    expect(container.querySelector('.thv2-thumb')).toBeNull()
    expect(container.querySelector('.thv2-image-status')?.textContent?.trim()).toBe('')
    await pick(container, new File([''], 'a.png', { type: 'image/png' }))
    expect(container.querySelector('.thv2-thumb')).not.toBeNull()
  })

  it('lights the drop zone on dragover and clears it on dragleave', async () => {
    const { container } = render(ThemeImageLab)
    const zone = container.querySelector('.thv2-dropzone')!
    expect(zone.classList.contains('thv2-dropzone--active')).toBe(false)
    await fireEvent.dragOver(zone)
    expect(zone.classList.contains('thv2-dropzone--active')).toBe(true)
    await fireEvent.dragLeave(zone)
    expect(zone.classList.contains('thv2-dropzone--active')).toBe(false)
  })

  it('accepts a dropped image through the same pipeline', async () => {
    stubImagePipeline(pixels(300, [60, 90, 230, 255]))
    const designer = useThemeDesigner()
    const { container } = render(ThemeImageLab)
    const zone = container.querySelector('.thv2-dropzone')!
    await fireEvent.drop(zone, {
      dataTransfer: { files: [new File([''], 'b.png', { type: 'image/png' })] },
    })
    await flushPromises()
    expect(container.querySelector('.thv2-image-status')?.textContent)
      .toContain('Applied primary from image')
    // A saturated blue lands the primary hue in the blue band.
    expect(designer.palettes.primary.hue).toBeGreaterThan(220)
  })
})
