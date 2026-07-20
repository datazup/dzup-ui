/**
 * build-sitemap — generates `sitemap.xml` + `robots.txt` for the landing app
 * (docs/landing.md §8, SEO). Closes the loop on the per-route head SEO already in
 * `src/router.ts`: crawlers set per-route titles/canonicals only if they discover
 * the routes, and the 90 per-block + per-template detail pages are reachable only
 * via in-page anchors/JS. A generated sitemap enumerates every indexable URL so
 * classic + AI crawlers (alongside the existing `llms.txt`) find them all.
 *
 * Emits, into `apps/landing/public/` (served verbatim as static `/*`):
 *   • `sitemap.xml` — one `<url>` per indexable route: the static marketing pages,
 *     every `/blocks/<id>` and every `/templates/<slug>`. Preview surfaces
 *     (`/blocks/preview/:id`, `/templates/:slug/preview`) are excluded — they carry
 *     `noindex` / are bare duplicates of their canonical pages.
 *   • `robots.txt` — allows the crawl, disallows the preview surfaces and points at
 *     the sitemap.
 *
 * All URLs use `SITE_ORIGIN` (src/config.ts), the same origin as index.html's
 * `<link rel="canonical">`, so sitemap entries match each page's self-canonical.
 *
 * Why a Vite SSR load: `src/blocks/registry.ts` / `src/templates/registry.ts` pair
 * each item with its `?raw` source via module-level `import.meta.glob`, which only
 * a Vite transform resolves. So — exactly like build-registry.ts — we spin up Vite
 * in middleware mode and `ssrLoadModule` the registries to read the real ids/slugs
 * (the lazy component loaders are never invoked).
 *
 * GENERATED, NEVER HAND-EDITED — a pure projection of the route table + registries.
 * Run with `yarn build:sitemap` (from apps/landing); wired ahead of `vite build`,
 * and re-run + `git diff --exit-code`d by the "Landing generated artifacts
 * unchanged" step in CI (TASK-FREE3-05) — a route added without rebuilding used to
 * ship a stale committed sitemap silently.
 *
 * DETERMINISM IS A HARD REQUIREMENT, because of that guard: the same source tree
 * must produce the same bytes on any machine, in any checkout. This file used to
 * emit a `<lastmod>` per URL derived from `git log --format=%cs --name-only`, and
 * that failed all three ways at once:
 *   • a MERGE commit lists every file under the pathspec, so one `git merge`
 *     re-dated all 140 URLs to the merge date (measured: 185 changed lines on a
 *     tree with no landing source edits at all);
 *   • `%cs` is the COMMITTER date, which a rebase rewrites — the same commit is
 *     dated differently in two clones;
 *   • CI clones shallow (`fetch-depth: 1`), where `git log` knows almost nothing.
 * A PR adding a block could not have passed either: the dev generates the sitemap
 * while the new SFC is still untracked (no lastmod), commits, and CI regenerates it
 * with a lastmod. So the git-derived lastmod — and the STATIC_ROUTE_FILES map that
 * fed it — are gone.
 *
 * What remains is `TemplateMeta.createdAt`: declared, committed registry data, and
 * therefore stable. Static routes and block pages carry NO `<lastmod>` — the spec
 * makes it optional, and Google explicitly discounts an unreliable one, so no
 * signal beats a signal that changes on every merge.
 *
 * FAIL-LOUD: an empty catalog or a load failure exits non-zero and writes nothing,
 * rather than publishing a partial sitemap that hides pages from crawlers.
 */

import type { BlockDef } from '../src/blocks/registry.ts'
import type { TemplateMeta } from '../src/templates/registry.ts'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { SITE_ORIGIN } from '../src/config.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** `public/` root — served verbatim as `/*` (where sitemap.xml + robots.txt land). */
const PUBLIC_DIR = resolve(LANDING_ROOT, 'public')

/**
 * The indexable static routes (src/router.ts). Excludes the JS-only redirect
 * catch-all and both preview surfaces (`/blocks/preview/:id` is `noindex`,
 * `/templates/:slug/preview` is a bare duplicate) — those are disallowed in
 * robots.txt instead. Kept in sync with the route table by hand: it changes far
 * less often than the registries, and enumerating router internals from a script
 * would be more fragile than one visible list.
 */
const STATIC_ROUTES = ['/', '/pro', '/blocks', '/animations', '/themes', '/templates', '/ai', '/compare', '/changelog']

/** Load the real registries via a throwaway Vite SSR server (see file header). */
async function loadRegistries(): Promise<{ blocks: BlockDef[], templates: TemplateMeta[] }> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const blocksMod = (await server.ssrLoadModule('/src/blocks/registry.ts')) as {
      BLOCKS: BlockDef[]
    }
    const templatesMod = (await server.ssrLoadModule('/src/templates/registry.ts')) as {
      TEMPLATES: TemplateMeta[]
    }
    return { blocks: blocksMod.BLOCKS, templates: templatesMod.TEMPLATES }
  }
  finally {
    await server.close()
  }
}

/** Escape the five XML entities so an id/slug can never break the document. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** One `<url>` entry; `lastmod` (ISO 'YYYY-MM-DD') is emitted only when known. */
function urlEntry(path: string, lastmod?: string): string {
  const loc = xmlEscape(`${SITE_ORIGIN}${path}`)
  const lm = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ''
  return `  <url>\n    <loc>${loc}</loc>${lm}\n  </url>`
}

function buildSitemap(blocks: BlockDef[], templates: TemplateMeta[]): string {
  const entries = [
    // No `<lastmod>` for static routes or blocks — see the determinism note in the
    // file header. Nothing declared and committed dates them.
    ...STATIC_ROUTES.map(path => urlEntry(path)),
    ...blocks.map(block => urlEntry(`/blocks/${block.id}`)),
    // Templates declare `createdAt` (ISO ship date) in the registry: committed data,
    // stable across clones, so it is the one lastmod worth emitting.
    ...templates.map(template => urlEntry(`/templates/${template.slug}`, template.createdAt)),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

function buildRobots(): string {
  return [
    '# dzup-ui landing — generated by scripts/build-sitemap.ts, do not hand-edit.',
    'User-agent: *',
    'Allow: /',
    '',
    '# Chrome-free preview surfaces are noindex/bare duplicates of their',
    '# canonical pages — keep them out of the index.',
    'Disallow: /blocks/preview/',
    'Disallow: /templates/*/preview',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n')
}

async function main(): Promise<void> {
  const { blocks, templates } = await loadRegistries()
  if (blocks.length === 0 || templates.length === 0) {
    throw new Error(
      `Registries look empty (blocks=${blocks.length}, templates=${templates.length}) — refusing to write a partial sitemap.`,
    )
  }

  await writeFile(resolve(PUBLIC_DIR, 'sitemap.xml'), buildSitemap(blocks, templates))
  await writeFile(resolve(PUBLIC_DIR, 'robots.txt'), buildRobots())

  const urlCount = STATIC_ROUTES.length + blocks.length + templates.length
  console.log(
    `✓ build-sitemap: ${urlCount} URLs (${STATIC_ROUTES.length} static, ${blocks.length} blocks, ${templates.length} templates) → sitemap.xml + robots.txt`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ build-sitemap failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
