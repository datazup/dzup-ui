/**
 * themeImageSampling — the pure half of the Theme Designer's "from image"
 * feature (docs/themes-v2.md TASK-THV2-06).
 *
 * Extracted VERBATIM from ThemesPage's `applyImagePalette` sampling loop so it
 * is unit-testable and can surface the runner-up bins: the lab's flight-dot
 * performance colours itself with the top sampled hues, not an invented
 * palette. Same bins, same near-gray/extreme skips, same winner selection —
 * the ONLY addition is the ranked `topBins` list.
 */

import { srgbToOklch } from '../../composables/useThemeDesigner.ts'

export interface SampledBin {
  /** Average hue of the bin's sampled pixels (degrees, rounded). */
  hue: number
  /** Average chroma of the bin's sampled pixels. */
  chroma: number
  /** How many pixels landed in the bin. */
  count: number
}

export interface DominantSample {
  /** The winning bin's average hue (rounded, as the editor applies it). */
  hue: number
  /** The winning bin's average chroma (UNclamped — the caller clamps). */
  chroma: number
  /** The most-populated chromatic bins, winner first (≤5). */
  topBins: SampledBin[]
}

/**
 * Bucket chromatic pixels by hue (24 bins) and rank the most-represented hues.
 * Returns `null` when no chromatic pixel survives the near-gray/extreme skips.
 */
export function sampleDominantOklch(data: Uint8ClampedArray | readonly number[]): DominantSample | null {
  const BINS = 24
  const count = Array.from({ length: BINS }, () => 0)
  const hueSum = Array.from({ length: BINS }, () => 0)
  const chromaSum = Array.from({ length: BINS }, () => 0)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 0
    if (alpha < 128)
      continue
    const { lightness, chroma, hue } = srgbToOklch(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)
    if (chroma < 0.04 || lightness < 0.2 || lightness > 0.9)
      continue // skip near-gray / extremes
    const bin = Math.min(BINS - 1, Math.floor((hue / 360) * BINS))
    count[bin] = (count[bin] ?? 0) + 1
    hueSum[bin] = (hueSum[bin] ?? 0) + hue
    chromaSum[bin] = (chromaSum[bin] ?? 0) + chroma
  }

  const ranked: SampledBin[] = []
  for (let b = 0; b < BINS; b++) {
    const n = count[b] ?? 0
    if (n === 0)
      continue
    ranked.push({
      hue: Math.round((hueSum[b] ?? 0) / n),
      chroma: (chromaSum[b] ?? 0) / n,
      count: n,
    })
  }
  // Stable sort: ties keep bin (hue) order, mirroring the original first-wins
  // scan.
  ranked.sort((a, b) => b.count - a.count)

  const best = ranked[0]
  if (!best)
    return null
  return { hue: best.hue, chroma: best.chroma, topBins: ranked.slice(0, 5) }
}
