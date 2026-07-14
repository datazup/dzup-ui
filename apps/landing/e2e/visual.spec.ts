import { expect, test } from '@playwright/test'
import sharp from 'sharp'

/**
 * Landing home-page render guard — light AND dark.
 *
 * Why this exists: the landing page once rendered as a fully blank white screen in
 * dark mode only. `DzCursor.vue` carried `:global([data-theme='dark']) .dz-cursor__blob
 * { mix-blend-mode: screen }`; Vue's scoped-CSS compiler dropped the descendant and
 * emitted a bare `[data-theme="dark"] { mix-blend-mode: screen }`. Because `data-theme`
 * lives on <html>, the whole document was screen-blended against the white canvas, so
 * every pixel painted white. The DOM was intact, computed colors were correct, the page
 * scrolled, and the console was clean — so every DOM-based assertion passed. Only the
 * PIXELS were wrong.
 *
 * Two consequences shape this file:
 *
 *  1. Theme comes from `prefers-color-scheme` (index.html's FOUC script reads it when
 *     localStorage has no `dz-theme`). Playwright defaults `colorScheme` to LIGHT, so a
 *     suite that never sets it explicitly cannot see dark-mode bugs at all.
 *  2. Counting elements / checking `opacity` and `visibility` proves nothing about what
 *     is painted. Compositing (blend modes, filters) is invisible to the DOM. So the
 *     primary assertion here is a PIXEL HISTOGRAM of the rendered page: a blank page
 *     collapses to ~1 distinct color; a healthy one has thousands.
 */

const THEMES = ['light', 'dark'] as const

/** Colors sampled from the rendered viewport, used to prove the page actually painted. */
interface Pixels {
  /** Number of distinct RGB triples. A blank/blended-out page collapses toward 1. */
  distinct: number
  /** Mean luminance 0–255 of the dominant color — distinguishes a light vs dark page. */
  dominantLuma: number
  /** Share of the viewport occupied by the single most common color, 0–1. */
  dominantShare: number
}

async function samplePixels(png: Buffer): Promise<Pixels> {
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

for (const theme of THEMES) {
  test.describe(`landing home — ${theme}`, () => {
    // Drives index.html's FOUC script, which sets <html data-theme> from the OS
    // preference. This is the switch that was never flipped before.
    test.use({ colorScheme: theme })

    test(`renders real pixels in ${theme} mode`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      await expect(page.locator('.landing-shell')).toBeVisible()

      // The theme actually applied — otherwise the rest of the test is vacuous.
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)

      // Regression guard, exact: a blend mode on the document root composites the
      // ENTIRE page against the canvas. `screen` against white paints everything white.
      // Nothing should ever blend <html> or <body>.
      const rootBlend = await page.evaluate(() => ({
        html: getComputedStyle(document.documentElement).mixBlendMode,
        body: getComputedStyle(document.body).mixBlendMode,
      }))
      expect(rootBlend.html, '<html> must never carry a mix-blend-mode').toBe('normal')
      expect(rootBlend.body, '<body> must never carry a mix-blend-mode').toBe('normal')

      // The load-bearing assertion: the page PAINTED. A blank render (blend wipeout,
      // white-on-white, an opaque overlay) collapses the histogram to a handful of
      // colors. The real page renders several thousand.
      const px = await samplePixels(await page.screenshot())
      expect(px.distinct, `${theme} page painted only ${px.distinct} distinct colors — it is blank`)
        .toBeGreaterThan(500)
      expect(px.dominantShare, `one color covers ${Math.round(px.dominantShare * 100)}% of the viewport`)
        .toBeLessThan(0.9)

      // ...and painted in the RIGHT theme. Dark mode rendering a white page is the
      // precise failure this suite was written for.
      if (theme === 'dark') {
        expect(px.dominantLuma, 'dark theme must not paint a light background').toBeLessThan(90)
      } else {
        expect(px.dominantLuma, 'light theme must not paint a dark background').toBeGreaterThan(160)
      }
    })

    test(`hero snapshot — ${theme}`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const hero = page.locator('section.hero')
      await expect(hero).toBeVisible()

      // Snapshot the hero rather than the full page: the home page is ~10,000px tall
      // and carries scroll-driven reveals and live-updating stats, which make a
      // full-page baseline permanently flaky. The hero alone is enough to catch a
      // theme-wide paint regression.
      await expect(hero).toHaveScreenshot(`home-hero-${theme}.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
        timeout: 30_000,
      })
    })
  })
}
