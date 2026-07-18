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
 * Run with `yarn build:og` (from apps/landing); wired ahead of `vite build`.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

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

/**
 * Template slugs that actually have a committed `<slug>-dark.webp` (TASK-FREE-13).
 *
 * The gallery derives the dark path by convention (`<slug>.webp` →
 * `<slug>-dark.webp`), but `yarn thumbnails` has only ever produced 28 of the 44
 * dark variants. For the other 16, dark mode requested a file that does not exist:
 * a 404 per card, then an `onerror` fallback to the row's ICON — so those templates
 * silently showed a glyph in dark mode and a real screenshot in light. Inventorying
 * them here lets the page fall back to the LIGHT thumbnail instead, which is a far
 * better answer than an icon, and never requests the missing file at all.
 *
 * Same principle as BLOCK_OG_IDS above: the app only advertises an image the disk
 * actually has.
 */
function darkThumbSlugs(): string[] {
  if (!existsSync(THUMBS_DIR))
    return []
  return readdirSync(THUMBS_DIR)
    .filter(name => name.endsWith('-dark.webp'))
    .map(name => name.replace(/-dark\.webp$/, ''))
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

/** Block ids with a committed OG card (`public/og/<id>.png`, from `yarn og`). */
function blockOgIds(): string[] {
  if (!existsSync(BLOCK_OG_DIR))
    return []
  return readdirSync(BLOCK_OG_DIR)
    .filter(name => name.endsWith('.png'))
    .map(name => name.replace(/\.png$/, ''))
    .sort()
}

function renderModule(blocks: string[], templates: string[], darkThumbs: string[]): string {
  const list = (items: string[]) =>
    items.length === 0 ? '' : `\n  ${items.map(item => `'${item}'`).join(',\n  ')},\n`
  return `/**
 * GENERATED FILE — do not edit by hand. Written by \`scripts/build-og-images.ts\`
 * (runs from the landing \`build\` script ahead of the bundler).
 *
 * Lists exactly which images exist on disk, so the app never advertises one that
 * would 404 — \`src/router.ts\` for share cards, \`TemplatesPage\` for dark-mode
 * gallery thumbnails.
 */

/** Block ids with a committed 1200×630 OG card at \`/og/<id>.png\` (\`yarn og\`). */
export const BLOCK_OG_IDS: ReadonlySet<string> = new Set([${list(blocks)}])

/** Template slugs with a derived 1200×630 PNG at \`/og-templates/<slug>.png\`. */
export const TEMPLATE_OG_SLUGS: ReadonlySet<string> = new Set([${list(templates)}])

/**
 * Template slugs with a committed dark thumbnail at
 * \`/templates/thumbnails/<slug>-dark.webp\`. A slug missing here has no dark
 * screenshot, so the gallery keeps showing its LIGHT thumbnail in dark mode rather
 * than requesting a file that 404s and collapsing to an icon. Regenerate with
 * \`yarn thumbnails\`.
 */
export const TEMPLATE_DARK_THUMB_SLUGS: ReadonlySet<string> = new Set([${list(darkThumbs)}])
`
}

async function main(): Promise<void> {
  const { slugs, converted } = await convertTemplates()
  const blocks = blockOgIds()
  const darkThumbs = darkThumbSlugs()
  await writeFile(OUT_MODULE, renderModule(blocks, slugs, darkThumbs))
  const missingDark = slugs.length - darkThumbs.length
  console.log(
    `✓ build-og-images: ${slugs.length} template cards (${converted} converted, ${slugs.length - converted} current), `
    + `${blocks.length} block cards → src/generated/ogImages.ts`,
  )
  // Surface the gap rather than letting it sit behind a graceful fallback: a
  // silently-degraded dark gallery is exactly the kind of thing that stays broken.
  if (missingDark > 0) {
    console.warn(
      `  ⚠ ${missingDark} of ${slugs.length} templates have no dark thumbnail — those cards `
      + `show their light screenshot in dark mode. Run \`yarn thumbnails\` to fill the gap.`,
    )
  }
}

main().catch((error: unknown) => {
  console.error(`✗ build-og-images failed: ${(error as Error).message}`)
  process.exitCode = 1
})
