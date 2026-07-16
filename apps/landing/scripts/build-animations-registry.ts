/**
 * build-animations-registry — generates the shadcn-style registry for the
 * animation gallery (docs/animations.md §3.2, §5; Task N10, Open Decision D2-3).
 *
 * This is GROUNDWORK ONLY: it emits the registry-item JSON that a future
 * copy-paste CLI / MCP server (D2-3) would serve. No CLI is wired here. It mirrors
 * the Blocks generator (`scripts/build-registry.ts`) so the two catalogs project
 * into the same shadcn-vue schema and a single CLI could later serve both.
 *
 * Emits, into `apps/landing/public/r/animations/` (served verbatim as
 * `/r/animations/*`):
 *   • `<id>.json` — one `registry-item.json` per effect, the payload a future
 *     `add https://<host>/r/animations/<id>.json` would fetch (its snippet(s)
 *     inlined as `files[]` — one file per variant where a variant matrix exists,
 *     else the single fallback `code`);
 *   • `registry.json` — the index listing every item.
 *
 * GENERATED, NEVER HAND-EDITED: `public/r/animations/*` is a pure projection of
 * the `CATALOG` array. The shaping lives in `src/gallery/registryItem.ts` (shared
 * with its Vitest guard, `registryItem.spec.ts`); this script only loads the
 * catalog and writes the files. The out dir is wiped first so a removed/renamed
 * effect leaves no stale artifact.
 *
 * Why a Vite SSR load: `src/gallery/catalog.ts` imports the `vue` runtime and
 * wires each effect to a `defineAsyncComponent(() => import('./demos/*.vue'))`
 * loader — which a bare Node process can't resolve. So, exactly as
 * `scripts/build-registry.ts` does for Blocks, we spin up Vite in middleware mode
 * (reusing `vite.config.ts`) and `ssrLoadModule` the catalog to read the real
 * `CATALOG` (the data fields populated; the lazy demo loaders never invoked).
 *
 * Run with: `yarn build:animations-registry` (from apps/landing). Wired ahead of
 * `vite build` alongside the Blocks registry. See scripts/README.md.
 *
 * FAIL-LOUD: an empty catalog or a load failure exits non-zero and writes
 * nothing, rather than publishing a partial/empty registry.
 */

import type { CatalogEntry } from '../src/gallery/catalog.ts'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { buildRegistryIndex, toRegistryItem } from '../src/gallery/registryItem.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** `public/` root — served verbatim as `/*`. */
const PUBLIC_DIR = resolve(LANDING_ROOT, 'public')

/** Out dir mirroring the public-URL path the registry is served from. */
const OUT_DIR = resolve(PUBLIC_DIR, 'r', 'animations')

/** Pretty JSON with a trailing newline (POSIX-friendly, clean diffs). */
function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/**
 * Load the real `CATALOG` via a throwaway Vite SSR server so the catalog's `vue`
 * imports + `.vue` demo loaders resolve. The server runs in middleware mode, so
 * it binds no port; we always close it.
 */
async function loadCatalog(): Promise<CatalogEntry[]> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const mod = (await server.ssrLoadModule('/src/gallery/catalog.ts')) as {
      CATALOG: CatalogEntry[]
    }
    return mod.CATALOG
  }
  finally {
    await server.close()
  }
}

async function main(): Promise<void> {
  const catalog = await loadCatalog()
  if (catalog.length === 0) {
    throw new Error('Animation catalog has no effects — nothing to generate.')
  }

  // Wipe + recreate so a deleted/renamed effect can never leave a stale artifact.
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  // Per effect: a registry-item JSON.
  for (const entry of catalog) {
    await writeFile(resolve(OUT_DIR, `${entry.id}.json`), toJson(toRegistryItem(entry)))
  }

  // The registry index listing every item.
  await writeFile(resolve(OUT_DIR, 'registry.json'), toJson(buildRegistryIndex(catalog)))

  console.log(
    `▸ Animations registry: wrote registry.json + ${catalog.length} item(s) to ${OUT_DIR}`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ build-animations-registry failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
