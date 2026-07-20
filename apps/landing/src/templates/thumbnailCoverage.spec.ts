/**
 * Thumbnail coverage ratchet (TASK-FREE3-05).
 *
 * Three generators commit binary assets that CI's "Landing generated artifacts
 * unchanged" step deliberately does NOT rebuild-and-diff: `yarn og`,
 * `yarn thumbnails` and `yarn brand-assets` drive Playwright/Chromium, and
 * re-shooting them on a runner would diff on font hinting and GPU rasterisation
 * rather than on content. The exemption is written down in `scripts/README.md`
 * § "Committed screenshot assets".
 *
 * The cost of that exemption is that nothing watches the screenshots. Pixel-diffing
 * them is not wanted — COUNTING them is, and counting is machine-checkable:
 * `scripts/build-og-images.ts` bakes the per-theme totals into
 * `src/generated/ogImages.ts` as `THUMBNAIL_COVERAGE`, and this spec asserts the
 * files on disk never fall BELOW that committed high-water mark, nor below the
 * registry.
 *
 * What this catches that `check-template-previews.ts` does not: that guard runs in
 * the `build` chain (heavy — it boots Vite), while this runs in a bare
 * `yarn test`. A new template shipped with only a light thumbnail fails the pairing
 * assertion here whether or not the author regenerated the manifest — if they did,
 * `light > dark` in the committed numbers; if they did not, `light > dark` on disk.
 */

import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { THUMBNAIL_COVERAGE } from '../generated/ogImages.ts'
import { TEMPLATES } from './registry.ts'

const THUMBS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'templates', 'thumbnails')

/** Committed `.webp` thumbnails on disk, split by theme (`<slug>-dark.webp` = dark). */
function onDisk(): { light: number, dark: number } {
  const names = existsSync(THUMBS_DIR) ? readdirSync(THUMBS_DIR).filter(name => name.endsWith('.webp')) : []
  return {
    light: names.filter(name => !name.endsWith('-dark.webp')).length,
    dark: names.filter(name => name.endsWith('-dark.webp')).length,
  }
}

describe('template thumbnail coverage', () => {
  // Guard against a vacuous pass: an empty registry or an empty directory would
  // make every "does not decrease" assertion below trivially true.
  it('has a non-empty registry and a non-empty thumbnail directory', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)
    expect(onDisk().light).toBeGreaterThan(0)
  })

  it('does not DECREASE from the committed manifest', () => {
    const disk = onDisk()
    expect(disk.light).toBeGreaterThanOrEqual(THUMBNAIL_COVERAGE.light)
    expect(disk.dark).toBeGreaterThanOrEqual(THUMBNAIL_COVERAGE.dark)
  })

  it('ships a dark thumbnail for every light one, on disk and in the manifest', () => {
    expect(onDisk().dark).toBe(onDisk().light)
    expect(THUMBNAIL_COVERAGE.dark).toBe(THUMBNAIL_COVERAGE.light)
  })

  it('covers every template in the registry, in both themes', () => {
    const disk = onDisk()
    expect(disk.light).toBeGreaterThanOrEqual(TEMPLATES.length)
    expect(disk.dark).toBeGreaterThanOrEqual(TEMPLATES.length)
    // The manifest's denominator is `COUNTS.templates`; it must still be the
    // registry size, or the "44/44" the build prints is measuring nothing.
    expect(THUMBNAIL_COVERAGE.templates).toBe(TEMPLATES.length)
  })
})
