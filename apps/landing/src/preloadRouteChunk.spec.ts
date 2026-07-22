/**
 * Guard for the route-chunk preload map (TASK-FREE3-04).
 *
 * `vite/preload-route-chunk.ts` parses `src/router.ts` to learn which page chunk
 * to `modulepreload` for a given pathname. Deriving the map means it cannot drift
 * when a route is added — but it CAN break silently: reformat the router, switch
 * to double quotes, extract the imports to a helper, and the regex quietly matches
 * nothing. The build stays green, the HTML just stops carrying preloads, and every
 * lazy route goes back to costing an extra round trip on first paint.
 *
 * That is a pure-performance regression with no functional symptom, so nothing
 * else in the suite would catch it. These tests fail loudly instead.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { chunkUrlsFor, MAX_PRELOADED_IMPORT_BYTES, parseLazyRoutes, pathToRegexSource } from '../vite/preload-route-chunk.ts'

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const routerSource = readFileSync(resolve(APP_ROOT, 'src/router.ts'), 'utf8')
const routes = parseLazyRoutes(routerSource)

describe('preload-route-chunk route parsing', () => {
  it('finds every lazily-imported page in the router', () => {
    // One per `() => import('./pages/*.vue')` in router.ts. If the parse breaks,
    // this drops to 0 and the preload silently stops happening.
    const lazyImports = routerSource.match(/import\(['"]\.\/pages\/[\w.-]+\.vue['"]\)/g) ?? []
    expect(routes).toHaveLength(lazyImports.length)
    expect(routes.length).toBeGreaterThanOrEqual(10)
  })

  it('pairs each page with its own path, not a breadcrumb path', () => {
    // The JSON-LD breadcrumbs in router.ts also contain `path:` keys. Pairing an
    // import with the wrong one would preload the wrong chunk on a real page.
    const byPage = new Map(routes.map(r => [r.page, r.path]))
    expect(byPage.get('BlocksIndexPage.vue')).toBe('/blocks')
    expect(byPage.get('BlockDetailPage.vue')).toBe('/blocks/:id')
    expect(byPage.get('BlockPreviewPage.vue')).toBe('/blocks/preview/:id')
    expect(byPage.get('TemplatesPage.vue')).toBe('/templates')
    expect(byPage.get('TemplateDetailPage.vue')).toBe('/templates/:slug')
    expect(byPage.get('ComparePage.vue')).toBe('/compare')
  })

  /**
   * Pattern coverage only — this asserts a rule EXISTS for each measured route,
   * not that the build found a chunk for it. That second half cannot be checked
   * here (there is no bundle in a unit test) and is enforced at build time
   * instead: the plugin throws if a lazy route resolves to zero chunks. Worth
   * being precise about, because the weaker version of this test passed happily
   * while /blocks and /animations were silently shipping no preload at all.
   */
  it('covers all five routes the Lighthouse budget measures', () => {
    // `/` is excluded on purpose: HomePage is a static import, already in the entry.
    const patterns = routes
      .map(r => pathToRegexSource(r.path))
      .filter((p): p is string => p !== null)
      .map(p => new RegExp(p))
    for (const path of ['/blocks', '/templates', '/compare', '/blocks/hero-split'])
      expect(patterns.some(re => re.test(path)), `no preload pattern matches ${path}`).toBe(true)
  })
})

describe('chunkUrlsFor — what gets pulled onto the critical path', () => {
  /** A minimal rollup-shaped bundle: one route facade with two static imports. */
  function bundleWith(importSizes: Record<string, number>) {
    const bundle: Record<string, unknown> = {
      'assets/BlockDetailPage-abc.js': {
        type: 'chunk',
        fileName: 'assets/BlockDetailPage-abc.js',
        facadeModuleId: '/src/pages/BlockDetailPage.vue',
        modules: { '/src/pages/BlockDetailPage.vue': {} },
        code: 'x'.repeat(4000),
        imports: Object.keys(importSizes),
      },
    }
    for (const [name, size] of Object.entries(importSizes))
      bundle[name] = { type: 'chunk', fileName: name, modules: {}, code: 'x'.repeat(size), imports: [] }
    return bundle as never
  }

  it('preloads the facade plus its small static imports', () => {
    const urls = chunkUrlsFor(
      bundleWith({ 'assets/small-1.js': 1000, 'assets/small-2.js': 2000 }),
      'BlockDetailPage.vue',
      '/',
      new Set(),
    )
    expect(urls).toEqual(['/assets/BlockDetailPage-abc.js', '/assets/small-1.js', '/assets/small-2.js'])
  })

  /**
   * The regression this budget exists for. Preloading `/blocks`'s full static set
   * — including a 488 kB chunk — moved FCP 2517 → 2879 ms and LCP 2909 → 3336 ms:
   * the preload competed with the entry chunk, and nothing paints before the entry
   * lands. A preload is a reprioritisation, not extra bandwidth.
   */
  it('drops a static import too heavy to pull forward, but keeps the facade', () => {
    const urls = chunkUrlsFor(
      bundleWith({ 'assets/huge.js': MAX_PRELOADED_IMPORT_BYTES + 1, 'assets/small.js': 500 }),
      'BlockDetailPage.vue',
      '/',
      new Set(),
    )
    expect(urls).toContain('/assets/BlockDetailPage-abc.js')
    expect(urls).toContain('/assets/small.js')
    expect(urls).not.toContain('/assets/huge.js')
  })

  it('skips chunks the HTML already fetches, comparing basenames not paths', () => {
    const urls = chunkUrlsFor(
      bundleWith({ 'assets/vendor-vue-x.js': 500 }),
      'BlockDetailPage.vue',
      '/',
      new Set(['vendor-vue-x.js']),
    )
    expect(urls).toEqual(['/assets/BlockDetailPage-abc.js'])
  })

  /**
   * Rollup sets `facadeModuleId: null` on a chunk it has merged, and it really
   * does that here — /blocks and /animations both lost their facade, so a
   * facade-only lookup found nothing and those two routes shipped with no
   * preload at all while every other route got one. Falling back to "which chunk
   * CONTAINS this module" is what makes them work.
   */
  it('finds a page whose chunk was merged and has no facadeModuleId', () => {
    const bundle = {
      'assets/merged-xyz.js': {
        type: 'chunk',
        fileName: 'assets/merged-xyz.js',
        facadeModuleId: null,
        modules: { '/src/pages/BlocksIndexPage.vue': {}, '/src/other.ts': {} },
        code: 'x'.repeat(28000),
        imports: [],
      },
    } as never
    expect(chunkUrlsFor(bundle, 'BlocksIndexPage.vue', '/', new Set()))
      .toEqual(['/assets/merged-xyz.js'])
  })

  it('returns nothing when the page has no emitted chunk', () => {
    expect(chunkUrlsFor(bundleWith({}), 'NoSuchPage.vue', '/', new Set())).toEqual([])
  })
})

describe('pathToRegexSource', () => {
  it('matches a static route with and without a trailing slash', () => {
    const re = new RegExp(pathToRegexSource('/blocks')!)
    expect(re.test('/blocks')).toBe(true)
    expect(re.test('/blocks/')).toBe(true)
    // Must NOT swallow the detail route — that would preload the index chunk
    // for every block page.
    expect(re.test('/blocks/hero-split')).toBe(false)
  })

  it('matches one segment for a :param, and does not cross a slash', () => {
    const re = new RegExp(pathToRegexSource('/blocks/:id')!)
    expect(re.test('/blocks/hero-split')).toBe(true)
    expect(re.test('/blocks')).toBe(false)
    expect(re.test('/blocks/preview/hero-split')).toBe(false)
  })

  it('declines patterns it cannot represent rather than guessing', () => {
    // The 404 catch-all. A wrong regex here would match every URL on the site and
    // preload NotFoundPage on all of them.
    expect(pathToRegexSource('/:pathMatch(.*)*')).toBeNull()
  })
})
