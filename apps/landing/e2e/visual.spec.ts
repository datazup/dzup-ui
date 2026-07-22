import { expect, test } from '@playwright/test'
import { samplePixels } from './utils/pixels.ts'

/**
 * Landing home-page render guard — light AND dark.
 *
 * Why this exists: the landing page once rendered as a fully blank white screen in
 * dark mode only, with an intact DOM, correct computed colors, a scrolling page and
 * a clean console — so every DOM-based assertion passed. Only the PIXELS were
 * wrong. The full story lives with the histogram helper in `utils/pixels.ts`.
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
      }
      else {
        expect(px.dominantLuma, 'light theme must not paint a dark background').toBeGreaterThan(160)
      }
    })

    /**
     * Hero snapshot — runs everywhere, including CI (TASK-FREE3-06).
     *
     * `toHaveScreenshot` baselines are per-platform, and for a long time the only
     * ones committed were `…-chromium-win32.png`. CI is `ubuntu-latest`, so this
     * test used to `test.skip()` itself there and the CI job ran with
     * `--grep "renders real pixels"` — a green run was never evidence that the hero
     * looked right on any machine but a Windows developer's.
     *
     * `…-chromium-linux.png` baselines are now committed alongside the win32 ones
     * (generated on the CI runner itself — see
     * `.github/workflows/landing-e2e-snapshots.yml`), so the test executes on both.
     * A platform whose baseline is missing fails loudly rather than skipping;
     * refresh or add one with `yarn test:e2e:landing:update`.
     *
     * This is the finer-grained companion to `renders real pixels` above: the
     * histogram is platform-independent and catches the blank-page compositing class
     * of bug; this catches a hero that renders but renders WRONG.
     */
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
