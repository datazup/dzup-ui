import type { OutputBundle, OutputChunk } from 'rollup'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * preloadRouteChunk — kill the lazy-route waterfall on first paint (TASK-FREE3-04).
 *
 * ## The problem
 *
 * Every route except `/` is `() => import('./pages/X.vue')`, so its chunk is
 * discovered only by EXECUTING the entry chunk. On a cold load that serialises:
 *
 *     index.html → entry (139 kB gz, download + parse + execute) → route chunk → render
 *
 * The route chunks are tiny — BlockDetailPage is 1.9 kB gzip — so this costs
 * almost nothing in bytes and almost everything in latency: the browser cannot
 * even *ask* for those 1.9 kB until ~1.2 s of entry has landed and run. Measured
 * on `/blocks/hero-split` (Lighthouse mobile, 4× CPU, throttled 4G): FCP 2467 ms,
 * LCP 3869 ms. The 1.4 s gap is almost entirely this round trip — the LCP element
 * is a plain `<p>` that renders the instant its route chunk arrives.
 *
 * ## The fix
 *
 * Emit a tiny inline script in `<head>` that matches `location.pathname` against
 * the route table and injects `<link rel="modulepreload">` for that route's chunk
 * immediately — so it downloads *in parallel with* the entry instead of after it.
 * It runs before the entry script is even fetched, which is the whole point.
 *
 * ## Why the map is derived, never written down
 *
 * The route→chunk map is parsed out of `src/router.ts` at build time. A
 * hand-maintained copy is exactly the kind of thing that silently rots: someone
 * adds a route, forgets the map, and the only symptom is a route that is quietly
 * slower than its neighbours — invisible in CI, invisible in review. Deriving it
 * means adding a route to the router is the only thing anyone has to do, and
 * `preload-route-chunk.spec.ts` fails the build if this parse ever stops finding
 * the routes that are really there.
 */

/** One route the router lazy-loads: its path pattern and its page component. */
interface LazyRoute {
  /** vue-router path pattern, e.g. `/blocks/:id`. */
  path: string
  /** Page file as written in the dynamic import, e.g. `BlockDetailPage.vue`. */
  page: string
}

/**
 * Pull `{ path, component: () => import('./pages/X.vue') }` pairs out of the
 * router source.
 *
 * Each `import()` is paired with the NEAREST PRECEDING `path:`. That is not a
 * guess: route objects always declare `path` before `component`, and the only
 * other `path:` keys in the file sit inside breadcrumb JSON-LD *after* the
 * component of the route that owns them — so they can never be the nearest
 * preceding match for the next route's import.
 */
export function parseLazyRoutes(source: string): LazyRoute[] {
  const routes: LazyRoute[] = []
  const importRe = /component:\s*\(\)\s*=>\s*import\(['"]\.\/pages\/([\w.-]+\.vue)['"]\)/g

  for (const match of source.matchAll(importRe)) {
    const before = source.slice(0, match.index)
    const paths = [...before.matchAll(/path:\s*'([^']+)'/g)]
    const nearest = paths.at(-1)
    if (!nearest)
      continue
    routes.push({ path: nearest[1]!, page: match[1]! })
  }
  return routes
}

/**
 * vue-router pattern → an anchored RegExp source matching the same pathnames.
 *
 * Only the two shapes this app actually uses are supported — static segments and
 * `:param`. Anything else (the `:pathMatch(.*)*` catch-all, optional/repeatable
 * modifiers) returns null and is simply not preloaded: an unpreloaded route is
 * merely as slow as it was before, whereas a WRONG regex would preload the wrong
 * chunk on a real page. Degrading to "no gain" beats degrading to "wrong bytes".
 */
export function pathToRegexSource(path: string): string | null {
  if (/[(*?+]/.test(path))
    return null
  const body = path
    .split('/')
    .filter(Boolean)
    .map(seg => (seg.startsWith(':') ? '[^/]+' : escapeLiteral(seg)))
    .join('/')
  return body ? `^/${body}/?$` : null
}

function escapeLiteral(segment: string): string {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Static segments first, so `/blocks/preview/:id` is tested before `/blocks/:id`. */
function bySpecificity(a: LazyRoute, b: LazyRoute): number {
  const statics = (r: LazyRoute) => r.path.split('/').filter(s => s && !s.startsWith(':')).length
  const params = (r: LazyRoute) => r.path.split('/').filter(s => s.startsWith(':')).length
  return statics(b) - statics(a) || params(a) - params(b)
}

/**
 * Preloaded bytes are not free — a preload is a *reprioritisation*, not extra
 * bandwidth. On a throttled link every byte pulled forward competes with the
 * entry chunk, and nothing paints at all until the entry lands.
 *
 * Measured, `/blocks` (Lighthouse mobile, 3 interleaved rounds): preloading the
 * route's full static-import set — 13 chunks, one of them 488 kB raw — pushed FCP
 * from 2517 ms to 2879 ms and LCP from 2909 ms to 3336 ms. It made the page
 * WORSE. `/templates`, whose imports are all small, improved by 317 ms on the
 * same change. The difference is purely the weight pulled forward.
 *
 * So: skip any single static import above this size. The facade chunk is always
 * preloaded regardless — it is the one that removes the discovery round trip,
 * and it is invariably tiny (BlockDetailPage is 4 kB raw).
 */
export const MAX_PRELOADED_IMPORT_BYTES = 60_000

/**
 * The emitted chunk for a page component, plus its *small* static-import chunks.
 *
 * `chunk.imports` is static-only — dynamic imports live in `chunk.dynamicImports`
 * and are correctly left out, so a lazily-mounted subtree (BlockPreview) is never
 * dragged back onto the critical path by this plugin.
 *
 * `already` holds the chunks the HTML links itself (the entry and its vendor
 * modulepreloads). Re-listing them would be harmless — browsers dedupe by URL —
 * but it makes the injected map bigger and the intent harder to read.
 */
export function chunkUrlsFor(bundle: OutputBundle, page: string, base: string, already: Set<string>): string[] {
  const chunks = Object.values(bundle).filter((c): c is OutputChunk => c.type === 'chunk')
  // Prefer the chunk whose FACADE is the page — that is the module the router
  // imports. But a page Rollup has merged with others has `facadeModuleId: null`
  // (this really happens here: /blocks and /animations both lost their facade),
  // so fall back to whichever chunk CONTAINS the page module. Matching only on
  // the facade silently preloaded nothing for those two routes.
  const chunk = chunks.find(c => c.facadeModuleId?.endsWith(`/pages/${page}`))
    ?? chunks.find(c => Object.keys(c.modules ?? {}).some(id => id.endsWith(`/pages/${page}`)))
  if (!chunk)
    return []

  const sizeOf = (fileName: string): number => {
    const c = bundle[fileName]
    return c && c.type === 'chunk' ? c.code.length : 0
  }

  const imports = chunk.imports.filter(f => sizeOf(f) <= MAX_PRELOADED_IMPORT_BYTES)

  // Compare basenames: `chunk.imports` carries the `assets/` prefix, the HTML's
  // hrefs carry `base`, and neither is a substring of the other.
  return [chunk.fileName, ...imports]
    .filter(f => !already.has(f.split('/').pop()!))
    .map(f => base + f)
}

export function preloadRouteChunk(routerPath = 'src/router.ts'): Plugin {
  let root = ''
  let base = '/'

  return {
    name: 'dzup-preload-route-chunk',
    apply: 'build',
    configResolved(config) {
      root = config.root
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle)
          return html

        const source = readFileSync(resolve(root, routerPath), 'utf8')
        const entries: Array<[string, string[]]> = []

        // Whatever the HTML already fetches on its own — the entry script and the
        // vendor chunks Vite modulepreloads — needs no second link.
        const already = new Set(
          [...html.matchAll(/(?:src|href)="[^"]*?\/([\w.-]+\.js)"/g)].map(m => m[1]!),
        )

        for (const route of parseLazyRoutes(source).sort(bySpecificity)) {
          const pattern = pathToRegexSource(route.path)
          if (!pattern)
            continue
          const urls = chunkUrlsFor(ctx.bundle, route.page, base, already)
          if (!urls.length) {
            // Fail the build rather than ship a route that quietly lost its
            // preload. This exact case already happened once: /blocks and
            // /animations resolved to nothing because Rollup had merged away
            // their facade chunks, and the only symptom was two routes being
            // silently slower than their neighbours. Nothing else would catch it.
            throw new Error(
              `[preload-route-chunk] no chunk found for ${route.page} (route ${route.path}).\n`
              + `  The route is lazily imported but its chunk could not be located in the bundle,\n`
              + `  so it would ship with no modulepreload and pay an extra round trip on first paint.`,
            )
          }
          entries.push([pattern, urls])
        }

        if (!entries.length)
          return html

        // Inlined rather than a module: this must run during head parsing, before
        // the entry <script type="module"> is fetched, or it has preloaded nothing.
        const script
          = `<script>(function(){var m=${JSON.stringify(entries)},p=location.pathname,i,j,l;`
            + `for(i=0;i<m.length;i++){if(new RegExp(m[i][0]).test(p)){`
            + `for(j=0;j<m[i][1].length;j++){l=document.createElement('link');`
            + `l.rel='modulepreload';l.crossOrigin='';l.href=m[i][1][j];`
            + `document.head.appendChild(l)}break}}})()</script>`

        return html.replace('</head>', `    ${script}\n  </head>`)
      },
    },
  }
}
