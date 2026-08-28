import type { TemplateMeta } from './registry.ts'
import { THUMBNAIL_DIR } from './registry.ts'

/**
 * Thumbnail path derivation, shared by every surface that renders template
 * screenshots (the /templates gallery grid, the hero depth field). Paired
 * thumbnails follow the convention `<thumb>.webp` (light) + `<thumb>-dark.webp`
 * (dark): the registry stores the light path in `thumbnail` (or it defaults to
 * `THUMBNAIL_DIR/<slug>.webp`), and the dark path is derived by inserting
 * `-dark` before the extension.
 *
 * Both files are GUARANTEED to exist for every registry row:
 * `scripts/check-template-previews.ts` fails the build when either is missing
 * (FREE2-09), so neither helper needs a fallback path.
 */

/** The committed light-theme screenshot for a template. */
export function templateThumb(t: TemplateMeta): string {
  return t.thumbnail ?? `${THUMBNAIL_DIR}/${t.slug}.webp`
}

/** Derive the dark-variant path: `foo/bar.webp` → `foo/bar-dark.webp`. */
export function darkThumb(path: string): string {
  return path.replace(/(\.[a-z0-9]+)$/i, '-dark$1')
}

/** The committed dark-theme screenshot for a template. */
export function templateThumbDark(t: TemplateMeta): string {
  return darkThumb(templateThumb(t))
}
