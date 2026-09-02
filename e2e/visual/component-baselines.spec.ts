import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook.ts'
import { assertBaselineAuthority } from './authority.ts'
import { readVisualLedger, visualShots, visualTargetsWithoutStory } from './coverage.ts'

/**
 * Per-component visual baselines (TASK-N1-O6).
 *
 * The third visual spec, and the first one that is about *components*. The two
 * that came before it snapshot whole demo screens — `gallery.spec.ts` and
 * `theme-recipe-matrix.spec.ts` — which proves the compositions hold and says
 * nothing about which component moved when one of them changes. TASK-N1-O3 made
 * that concrete: it changed geometry on 24 components and the only reason
 * anybody can say what moved is that the task measured it by hand.
 *
 * **Scope: per-component story snapshots, not per-surface.** The story driven
 * for each component is the one `e2e/matrix/targets.generated.ts` already picks
 * for the browser matrix, so the two lanes cover the same component in the same
 * state and a diff here can be read next to a matrix cell there. Coverage is
 * declared by *family* in `visual-baselines.json`; every component in an opted-in
 * family is covered automatically, and every component outside one reads
 * `not-covered` in the capability matrix rather than `unknown`.
 *
 * **Determinism, and what it costs.** Baselines are platform-locked: Playwright
 * writes `…-{project}-{platform}.png`, so a Linux baseline and a Windows one are
 * different files and never compared to each other. That is correct — font
 * rasterisation genuinely differs — and it means the *authoritative* platform is
 * a decision, recorded in the ledger's `scope`, not an accident of who ran the
 * lane last. See `e2e/visual/README.md`.
 *
 * Determinism inside one platform is bought here, not assumed: fixed viewport,
 * `prefers-reduced-motion` on, `animations: 'disabled'`, caret hidden, CSS-pixel
 * scale, and a wait on `document.fonts.ready` so the first paint is never the
 * fallback face. `DZUP_VISUAL_PROBE=<dir>` writes the raw bytes instead of
 * comparing, which is how the stability evidence in the handoff was measured.
 */

const ledger = readVisualLedger()
const SHOTS = visualShots(ledger)
const PROBE_DIR = process.env.DZUP_VISUAL_PROBE

// A covered component with no story is a coverage gap, and a gap that is not
// visible is not a gap anybody closes. `fixme` rather than `skip`, for the
// reason e2e/matrix/fixtures.ts gives: a skip reads as "not applicable".
for (const component of visualTargetsWithoutStory(ledger)) {
  test.fixme(`visual ${component} — unrun: no story to drive`, () => {
    throw new Error('unreachable')
  })
}

for (const shot of SHOTS) {
  test(shot.title, async ({ page, browserName }) => {
    test.skip(
      browserName !== ledger.scope.engine,
      `Baselines are qualified on ${ledger.scope.engine} only; see e2e/visual/README.md.`,
    )

    await page.setViewportSize(ledger.scope.viewport)
    // The OS-level preference as well as the Storybook global: `theme:system`
    // stories resolve against the media query, and a lane that set only the
    // global would snapshot a component in light mode under a dark label.
    await page.emulateMedia({ colorScheme: shot.theme, reducedMotion: 'reduce' })

    const globals = `theme:${shot.theme};direction:${ledger.scope.direction}`
    const canvas = await loadStoryCanvas(page, shot.story, globals, { waitForMainClass: false })

    await expect(canvas.locator('html')).toHaveAttribute('data-theme', shot.theme)
    const root = canvas.locator('#storybook-root')
    await expect(root).toBeVisible({ timeout: 60_000 })
    await expect(root.locator('> *')).not.toHaveCount(0)

    // Web fonts: the story paints once with the fallback face and again with
    // Nunito Sans. Without this the first run of a cold build and every run
    // after it disagree on every glyph, which reads as component drift.
    await page.evaluate(async () => {
      await document.fonts.ready
    })

    if (PROBE_DIR !== undefined && PROBE_DIR !== '') {
      // Byte-stability probe: capture, write, compare digests outside the run.
      // Deliberately not `toHaveScreenshot` — that hides the bytes behind a
      // comparison, and the question here is whether the bytes are stable.
      const target = resolve(PROBE_DIR, `${shot.arg}.png`)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, await root.screenshot({
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
        timeout: 30_000,
      }))
      return
    }

    assertBaselineAuthority(test.info(), shot.arg)

    await expect(root).toHaveScreenshot(`${shot.arg}.png`, {
      // Zero tolerance. The two screen-level specs run at
      // `maxDiffPixelRatio: 0.01`, which on a 200x60 button canvas is 120 px —
      // enough to lose a whole glyph. A component canvas is small enough that
      // the honest threshold is "not one pixel", and the probe in this file is
      // what proved that threshold is reachable on this host.
      maxDiffPixels: 0,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      timeout: 30_000,
    })
  })
}
