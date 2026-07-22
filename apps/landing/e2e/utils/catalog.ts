import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Real catalog URLs for the e2e flows, derived rather than hard-coded.
 *
 * The flows need a live deep route (a block detail page, a template detail page)
 * to direct-load and to render on a phone viewport. Pinning `'/blocks/hero-split'`
 * into a spec makes the suite fail for the wrong reason the day that block is
 * renamed — a red e2e run that says nothing about the app.
 *
 * `public/sitemap.xml` is the right source: it is generated from the same
 * registries the router resolves against (`scripts/build-sitemap.ts`), it is
 * committed, and CI diffs it against a fresh regeneration ("Landing generated
 * artifacts unchanged"), so it cannot silently drift from the routes that exist.
 * A rename therefore moves the sitemap and this helper together.
 *
 * Read at module load, in Node — this runs in the Playwright test process, not in
 * the browser.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const SITEMAP = resolve(HERE, '../../public/sitemap.xml')

/** Every root-relative path the sitemap advertises, in document order. */
function sitemapPaths(): string[] {
  const xml = readFileSync(SITEMAP, 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1]!)
    .map((url) => {
      try {
        return new URL(url).pathname
      }
      catch {
        return url
      }
    })
}

const PATHS = sitemapPaths()

/** First path matching `pattern`, or a loud failure — an empty sitemap is a bug. */
function firstPath(pattern: RegExp, what: string): string {
  const hit = PATHS.find(path => pattern.test(path))
  if (!hit) {
    throw new Error(
      `[e2e/catalog] no ${what} URL in ${SITEMAP}. The sitemap is generated from the `
      + 'block/template registries — regenerate it with `yarn workspace @dzup-ui/landing build:sitemap`.',
    )
  }
  return hit
}

/** A real `/blocks/:id` page (the first the catalog lists). */
export const BLOCK_PATH = firstPath(/^\/blocks\/(?!preview\/)[^/]+$/, 'block detail')

/** That block's registry id, e.g. `hero-centered`. */
export const BLOCK_ID = BLOCK_PATH.split('/').pop()!

/**
 * That block's human title, e.g. "Centered hero" — the text the ⌘K palette
 * actually renders for its row, and therefore the text a visitor searches by.
 *
 * Read from the block's own `/r/<id>.json` registry item rather than re-declared
 * here. Like the sitemap, `public/r/` is generated from `blocks/registry.ts` and
 * diffed against a fresh regeneration in CI, so it cannot drift from the catalog.
 */
export const BLOCK_TITLE: string = (() => {
  const item = JSON.parse(
    readFileSync(resolve(HERE, `../../public/r/${BLOCK_ID}.json`), 'utf8'),
  ) as { title?: string }
  if (!item.title)
    throw new Error(`[e2e/catalog] /r/${BLOCK_ID}.json has no title`)
  return item.title
})()

/** A real `/templates/:slug` page (the first the catalog lists). */
export const TEMPLATE_PATH = firstPath(/^\/templates\/[^/]+$/, 'template detail')

/**
 * A path that is guaranteed NOT to resolve, for the 404 flow. Two shapes matter and
 * they take different code paths: a bare unknown path falls through to the router's
 * catch-all, while an unknown catalog id is rewritten by `resolveBlockId` →
 * `toNotFound` — which must preserve the address bar rather than redirect.
 */
export const UNKNOWN_PATH = '/this-page-does-not-exist-e2e'
export const UNKNOWN_BLOCK_PATH = '/blocks/this-block-does-not-exist-e2e'
