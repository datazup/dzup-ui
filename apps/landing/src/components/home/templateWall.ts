import type { TemplateMeta } from '../../templates/registry.ts'
import { TEMPLATES, THUMBNAIL_DIR } from '../../templates/registry.ts'

/**
 * The template wall's card set (docs/landing-v2.md TASK-LV2-07).
 *
 * A marquee row stays legible (and cheap) at ~14 cards; two counter-scrolling
 * rows means 28 of the 44 templates appear on the home page. The subset is
 * DETERMINISTIC — the first `WALL_COUNT` in registry order, split alternately
 * so both rows draw from the whole range — never sampled (no Math.random in
 * this app, and a stable set keeps visual baselines stable). Every card's
 * thumbnails are build-guaranteed: `scripts/check-template-previews.ts` fails
 * the build if any registry template is missing its light or dark webp, and
 * the spec next to this module re-proves existence for the wall's own set.
 */

export const WALL_COUNT = 28

export interface WallCard {
  slug: string
  name: string
  /** Light-theme thumbnail path (public/); dark variant is `-dark` suffixed. */
  thumb: string
  thumbDark: string
}

function toCard(t: TemplateMeta): WallCard {
  const light = t.thumbnail ?? `${THUMBNAIL_DIR}/${t.slug}.webp`
  return {
    slug: t.slug,
    name: t.name,
    thumb: light,
    thumbDark: light.replace(/(\.[a-z0-9]+)$/i, '-dark$1'),
  }
}

/** The two rows: alternate assignment over the first WALL_COUNT templates. */
export function wallRows(): [WallCard[], WallCard[]] {
  const picked = TEMPLATES.slice(0, WALL_COUNT).map(toCard)
  const a: WallCard[] = []
  const b: WallCard[] = []
  picked.forEach((card, i) => (i % 2 === 0 ? a : b).push(card))
  return [a, b]
}
