import type { Page } from '@playwright/test'
import type { Buffer } from 'node:buffer'
import { expect } from '@playwright/test'
import sharp from 'sharp'

/**
 * Pixel-histogram helper — the one assertion in this suite that a DOM-based test
 * cannot make.
 *
 * The landing page once rendered as a fully blank white screen in dark mode only.
 * `DzCursor.vue` carried `:global([data-theme='dark']) .dz-cursor__blob
 * { mix-blend-mode: screen }`; Vue's scoped-CSS compiler dropped the descendant and
 * emitted a bare `[data-theme="dark"] { mix-blend-mode: screen }`. Because
 * `data-theme` lives on <html>, the whole document was screen-blended against the
 * white canvas, so every pixel painted white. The DOM was intact, computed colors
 * were correct, the page scrolled, and the console was clean — so every DOM-based
 * assertion passed. Only the PIXELS were wrong.
 *
 * Counting elements, or checking `opacity`/`visibility`, proves nothing about what
 * is painted: compositing (blend modes, filters, opaque overlays) is invisible to
 * the DOM. A histogram of the rendered viewport is: a blank page collapses toward a
 * single distinct color, a healthy one has thousands.
 *
 * Extracted from `visual.spec.ts` (TASK-FREE3-06) so the functional flows can reuse
 * it — the theme toggle in particular, which is exactly the control that flips the
 * site into the state the original bug lived in.
 */

/** Colors sampled from a rendered screenshot, used to prove something painted. */
export interface Pixels {
  /** Number of distinct RGB triples. A blank/blended-out page collapses toward 1. */
  distinct: number
  /** Mean luminance 0–255 of the dominant color — distinguishes a light vs dark page. */
  dominantLuma: number
  /** Share of the captured area occupied by the single most common color, 0–1. */
  dominantShare: number
}

/** Histogram a PNG buffer (a `page.screenshot()` / `locator.screenshot()` result). */
export async function samplePixels(png: Buffer): Promise<Pixels> {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
  const counts = new Map<string, number>()
  for (let i = 0; i < data.length; i += info.channels) {
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const [color, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!
  const [r, g, bl] = color.split(',').map(Number) as [number, number, number]
  return {
    distinct: counts.size,
    dominantLuma: 0.2126 * r + 0.7152 * g + 0.0722 * bl,
    dominantShare: n / (info.width * info.height),
  }
}

/** Convenience wrapper: histogram the page's current viewport. */
export async function samplePagePixels(page: Page): Promise<Pixels> {
  return samplePixels(await page.screenshot())
}

/**
 * Assert the viewport actually painted, and painted in the expected theme.
 *
 * Thresholds match the ones `visual.spec.ts` has enforced since the blank-page
 * regression: >500 distinct colors, no single color covering ≥90% of the viewport,
 * and a dominant luminance on the correct side of the light/dark divide.
 */
export async function expectPainted(
  page: Page,
  theme: 'light' | 'dark',
  label = 'page',
): Promise<Pixels> {
  const px = await samplePagePixels(page)
  expect(px.distinct, `${label} (${theme}) painted only ${px.distinct} distinct colors — it is blank`)
    .toBeGreaterThan(500)
  expect(
    px.dominantShare,
    `${label} (${theme}): one color covers ${Math.round(px.dominantShare * 100)}% of the viewport`,
  ).toBeLessThan(0.9)
  if (theme === 'dark') {
    expect(px.dominantLuma, `${label}: dark theme must not paint a light background`).toBeLessThan(90)
  }
  else {
    expect(px.dominantLuma, `${label}: light theme must not paint a dark background`).toBeGreaterThan(160)
  }
  return px
}
