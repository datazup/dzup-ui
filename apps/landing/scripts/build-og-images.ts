/**
 * build-og-images — makes every `og:image` the router advertises actually exist
 * (TASK-FREE-08). Before this step, all 87 block detail pages pointed at
 * `/og/<id>.png` while `public/og/` did not exist, and the 44 template pages
 * pointed at WebP thumbnails, which X/Twitter and LinkedIn do not reliably
 * render as share cards. Advertising a 404 (or unrenderable) image is strictly
 * worse than advertising none.
 *
 * Two jobs, both cheap (sharp only — no Playwright, no browser):
 *
 *   1. Convert each committed light-mode template thumbnail
 *      (`public/templates/thumbnails/<slug>.webp`) into a 1200×630 PNG share
 *      card at `public/og-templates/<slug>.png`. Incremental: a PNG newer than
 *      its WebP is skipped, so repeat builds cost milliseconds. The WebP stays
 *      the on-page rendering; the PNG exists purely for `og:image`.
 *      (`public/og-templates/` is gitignored — it is derived on every build.)
 *
 *   2. Inventory `public/og/*.png` — the per-block OG cards the OPTIONAL, heavy
 *      `yarn og` (scripts/shoot-og.mts) screenshots and commits. Most checkouts
 *      have none, and that must not 404: the router only advertises a per-block
 *      card when this manifest says the file exists, and falls back to the
 *      site-wide `og-default.png` otherwise.
 *
 * Output: `src/generated/ogImages.ts` — committed, so a bare `vite build`, a
 * `yarn test` and a fresh clone all resolve it without running this script
 * first (see `src/generated/README.md`). It lists exactly which per-block cards
 * and per-template PNGs exist; `src/router.ts` reads it to decide each route's
 * `og:image`.
 *
 *   3. Count the committed template thumbnails per theme and bake the totals into
 *      the same generated module as `THUMBNAIL_COVERAGE` (TASK-FREE3-05). The
 *      screenshot generators (`yarn og` / `yarn thumbnails` / `yarn brand-assets`)
 *      are deliberately EXEMPT from CI's byte-diff drift guard — re-shooting them
 *      on a runner would diff on machine noise, not on content (see
 *      `scripts/README.md` § "Committed screenshot assets"). Pixels therefore go
 *      unchecked, but their COUNT does not: `src/templates/thumbnailCoverage.spec.ts`
 *      fails when coverage falls below this committed manifest, so the next batch
 *      of templates cannot quietly ship with half its thumbnails missing.
 *
 * Run with `yarn build:og` (from apps/landing); wired ahead of `vite build`.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { COUNTS } from '../src/generated/counts.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')
const THUMBS_DIR = resolve(LANDING_ROOT, 'public', 'templates', 'thumbnails')
const OG_TEMPLATES_DIR = resolve(LANDING_ROOT, 'public', 'og-templates')
const BLOCK_OG_DIR = resolve(LANDING_ROOT, 'public', 'og')
const OUT_MODULE = resolve(LANDING_ROOT, 'src', 'generated', 'ogImages.ts')

/** Canonical Open Graph card size (1.91:1). */
const WIDTH = 1200
const HEIGHT = 630

/** Light-mode template thumbnails — the OG render source (`-dark` variants are on-page only). */
function templateThumbs(): string[] {
  if (!existsSync(THUMBS_DIR))
    return []
  return readdirSync(THUMBS_DIR)
    .filter(name => name.endsWith('.webp') && !name.endsWith('-dark.webp'))
    .sort()
}

/** True when `out` is missing or older than `src` — i.e. needs (re)converting. */
function stale(src: string, out: string): boolean {
  if (!existsSync(out))
    return true
  return statSync(out).mtimeMs < statSync(src).mtimeMs
}

async function convertTemplates(): Promise<{ slugs: string[], converted: number }> {
  const thumbs = templateThumbs()
  if (thumbs.length === 0)
    return { slugs: [], converted: 0 }
  mkdirSync(OG_TEMPLATES_DIR, { recursive: true })

  let converted = 0
  const slugs: string[] = []
  for (const name of thumbs) {
    const slug = name.replace(/\.webp$/, '')
    const src = resolve(THUMBS_DIR, name)
    const out = resolve(OG_TEMPLATES_DIR, `${slug}.png`)
    if (stale(src, out)) {
      await sharp(src)
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
        .png({ compressionLevel: 9 })
        .toFile(out)
      converted += 1
    }
    slugs.push(slug)
  }
  return { slugs, converted }
}

/**
 * Committed template thumbnails per theme (`yarn thumbnails`). The denominator is
 * `COUNTS.templates` — itself derived from `TEMPLATES.length` by `build-counts.ts`,
 * which the build chain and CI's drift step both run BEFORE this script — so the
 * ratio is never a typed number.
 */
function thumbnailCoverage(): { light: number, dark: number, templates: number } {
  const names = existsSync(THUMBS_DIR) ? readdirSync(THUMBS_DIR).filter(name => name.endsWith('.webp')) : []
  return {
    light: names.filter(name => !name.endsWith('-dark.webp')).length,
    dark: names.filter(name => name.endsWith('-dark.webp')).length,
    templates: COUNTS.templates,
  }
}

/** Block ids with a committed OG card (`public/og/<id>.png`, from `yarn og`). */
function blockOgIds(): string[] {
  if (!existsSync(BLOCK_OG_DIR))
    return []
  return readdirSync(BLOCK_OG_DIR)
    .filter(name => name.endsWith('.png'))
    .map(name => name.replace(/\.png$/, ''))
    .sort()
}

function renderModule(
  blocks: string[],
  templates: string[],
  coverage: { light: number, dark: number, templates: number },
): string {
  const list = (items: string[]) =>
    items.length === 0 ? '' : `\n  ${items.map(item => `'${item}'`).join(',\n  ')},\n`
  return `/**
 * GENERATED FILE — do not edit by hand. Written by \`scripts/build-og-images.ts\`
 * (runs from the landing \`build\` script ahead of the bundler).
 *
 * Lists exactly which share-card images exist on disk, so \`src/router.ts\` never
 * advertises an \`og:image\` that would 404. (Dark gallery thumbnails are no longer
 * inventoried here: \`scripts/check-template-previews.ts\` fails the build unless
 * EVERY template has both a light and a dark thumbnail, so the gallery derives the
 * dark path unconditionally — FREE2-09.)
 */

/** Block ids with a committed 1200×630 OG card at \`/og/<id>.png\` (\`yarn og\`). */
export const BLOCK_OG_IDS: ReadonlySet<string> = new Set([${list(blocks)}])

/** Template slugs with a derived 1200×630 PNG at \`/og-templates/<slug>.png\`. */
export const TEMPLATE_OG_SLUGS: ReadonlySet<string> = new Set([${list(templates)}])

/**
 * Committed template screenshot coverage at the last \`yarn build:og\` — the
 * high-water mark \`src/templates/thumbnailCoverage.spec.ts\` asserts against.
 * The screenshot generators are exempt from CI's byte-diff drift guard (machine
 * noise); this COUNT is the part CI can honestly check. \`templates\` is
 * \`COUNTS.templates\`, i.e. \`TEMPLATES.length\`.
 */
export const THUMBNAIL_COVERAGE = {
  templates: ${coverage.templates},
  light: ${coverage.light},
  dark: ${coverage.dark},
} as const
`
}

async function main(): Promise<void> {
  const { slugs, converted } = await convertTemplates()
  const blocks = blockOgIds()
  const coverage = thumbnailCoverage()
  await writeFile(OUT_MODULE, renderModule(blocks, slugs, coverage))
  console.log(
    `✓ build-og-images: ${slugs.length} template cards (${converted} converted, ${slugs.length - converted} current), `
    + `${blocks.length} block cards → src/generated/ogImages.ts`,
  )
  // Per-kind coverage line (TASK-FREE3-05): the screenshots themselves are not
  // diffed in CI, so make their presence a number somebody can read in the log.
  console.log(
    `  coverage — templates: ${coverage.light}/${coverage.templates} light, `
    + `${coverage.dark}/${coverage.templates} dark thumbs; `
    + `blocks: ${blocks.length}/${COUNTS.blocks} OG cards (optional, \`yarn og\`)`,
  )
}

main().catch((error: unknown) => {
  console.error(`✗ build-og-images failed: ${(error as Error).message}`)
  process.exitCode = 1
})
