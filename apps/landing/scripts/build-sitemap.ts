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
 * Run with `yarn build:sitemap` (from apps/landing); wired ahead of `vite build`.
 *
 * FAIL-LOUD: an empty catalog or a load failure exits non-zero and writes nothing,
 * rather than publishing a partial sitemap that hides pages from crawlers.
 */

import type { BlockDef } from '../src/blocks/registry.ts'
import type { TemplateMeta } from '../src/templates/registry.ts'
import { execFileSync } from 'node:child_process'
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

/**
 * The page component behind each static route (relative to the repo root) — the
 * file whose last commit dates the route's `<lastmod>`. Kept beside
 * `STATIC_ROUTES` so the two lists change together.
 */
const STATIC_ROUTE_FILES: Record<string, string> = {
  '/': 'apps/landing/src/pages/HomePage.vue',
  '/pro': 'apps/landing/src/pages/ProPage.vue',
  '/blocks': 'apps/landing/src/pages/BlocksIndexPage.vue',
  '/animations': 'apps/landing/src/pages/AnimationsPage.vue',
  '/themes': 'apps/landing/src/pages/ThemesPage.vue',
  '/templates': 'apps/landing/src/pages/TemplatesPage.vue',
  '/ai': 'apps/landing/src/pages/AiIdePage.vue',
  '/compare': 'apps/landing/src/pages/ComparePage.vue',
  '/changelog': 'apps/landing/src/pages/ChangelogPage.vue',
}

/**
 * Last-commit date ('YYYY-MM-DD') per repo-relative file, from ONE git pass:
 * `git log --format=%cs --name-only` prints each commit's date followed by its
 * files, so the first date a file appears under is its most recent change.
 * Derived, never typed — a hand-maintained lastmod is exactly the drift this
 * repo keeps re-learning to avoid. Files git does not know (uncommitted) simply
 * get no `<lastmod>`, which is honest: the sitemap spec makes it optional.
 */
function gitLastModified(scope: string): Map<string, string> {
  const dates = new Map<string, string>()
  let output: string
  try {
    output = execFileSync('git', ['log', '--format=%cs', '--name-only', '--', scope], {
      cwd: resolve(LANDING_ROOT, '..', '..'),
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  }
  catch {
    // Not a git checkout (e.g. an exported tarball) — emit no lastmod at all.
    return dates
  }
  let current = ''
  for (const line of output.split('\n')) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(line))
      current = line
    else if (line !== '' && !dates.has(line))
      dates.set(line, current)
  }
  return dates
}

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
  // One git pass dates every landing source file; routes map to their files.
  const modified = gitLastModified('apps/landing/src')
  const entries = [
    ...STATIC_ROUTES.map(path => urlEntry(path, modified.get(STATIC_ROUTE_FILES[path] ?? ''))),
    // Blocks are dated by their SFC's last commit (BlockDef.path is relative to src/blocks/).
    ...blocks.map(block =>
      urlEntry(`/blocks/${block.id}`, modified.get(`apps/landing/src/blocks/${block.path.replace(/^\.\//, '')}`)),
    ),
    // Templates expose `createdAt` (ISO ship date); fall back to the SFC's last commit.
    ...templates.map(template =>
      urlEntry(`/templates/${template.slug}`, template.createdAt ?? modified.get(template.source)),
    ),
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
