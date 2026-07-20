/**
 * build-animations-registry — generates the shadcn-style registry for the
 * animation gallery (docs/animations.md §3.2, §5; Task N10, Open Decision D2-3).
 *
 * This is GROUNDWORK ONLY: it emits the registry-item JSON that a future
 * copy-paste CLI / MCP server (D2-3) would serve. No CLI is wired here. It mirrors
 * the Blocks generator (`scripts/build-registry.ts`) so the two catalogs project
 * into the same CANONICAL shadcn schema and a single CLI could later serve both.
 *
 * Emits, into `apps/landing/public/r/animations/` (served verbatim as
 * `/r/animations/*`):
 *   • `<id>.json` — one `registry-item.json` per effect, the payload a future
 *     `add https://<host>/r/animations/<id>.json` would fetch (its snippet(s)
 *     inlined as `files[]` — one file per variant where a variant matrix exists,
 *     else the single fallback `code` — plus every landing-local motion primitive
 *     those snippets import, bundled as additional files so the item is a
 *     self-contained copy-paste unit; see `src/gallery/registryItem.ts`);
 *   • `registry.json` — the index listing every item;
 *   • `motion-tokens.css` — the motion module's `tokens.css` (keyframes +
 *     `--dz-anim-*` custom properties), emitted ONCE and pointed at by the items
 *     that need it via `meta.stylesheet`, rather than inlined 59 times.
 *
 * GENERATED, NEVER HAND-EDITED: `public/r/animations/*` is a pure projection of
 * the `CATALOG` array. The shaping lives in `src/gallery/registryItem.ts` (shared
 * with its Vitest guard, `registryItem.spec.ts`); this script only loads the
 * catalog and writes the files. The out dir is wiped first so a removed/renamed
 * effect leaves no stale artifact.
 *
 * Why a Vite SSR load: `src/gallery/catalog.ts` imports the `vue` runtime and
 * wires each effect to a `defineAsyncComponent(() => import('./demos/*.vue'))`
 * loader — which a bare Node process can't resolve, and `src/gallery/
 * motionSources.ts` carries an `import.meta.glob` only Vite can evaluate. So,
 * exactly as `scripts/build-registry.ts` does for Blocks, we spin up Vite in
 * middleware mode (reusing `vite.config.ts`) and `ssrLoadModule` both: the
 * catalog for the real `CATALOG` (the data fields populated; the lazy demo
 * loaders never invoked) and `motionSources.ts` for each primitive's source.
 *
 * Run with: `yarn build:animations-registry` (from apps/landing). Wired ahead of
 * `vite build` alongside the Blocks registry. See scripts/README.md.
 *
 * FAIL-LOUD: an empty catalog or a load failure exits non-zero and writes
 * nothing, rather than publishing a partial/empty registry.
 */

import type { CatalogEntry } from '../src/gallery/catalog.ts'
import type { MotionSourceLookup } from '../src/gallery/registryItem.ts'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import {
  buildRegistryIndex,
  MOTION_STYLESHEET_FILE,
  MOTION_STYLESHEET_SOURCE,
  toRegistryItem,
} from '../src/gallery/registryItem.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** `public/` root — served verbatim as `/*`. */
const PUBLIC_DIR = resolve(LANDING_ROOT, 'public')

/** Out dir mirroring the public-URL path the registry is served from. */
const OUT_DIR = resolve(PUBLIC_DIR, 'r', 'animations')

/** The landing-local motion module the effects' primitives are bundled from. */
const MOTION_DIR = resolve(LANDING_ROOT, 'src', 'motion')

/** Pretty JSON with a trailing newline (POSIX-friendly, clean diffs). */
function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/** What one Vite SSR load yields: the catalog plus the motion source lookup. */
interface LoadedCatalog {
  catalog: CatalogEntry[]
  getMotionSource: MotionSourceLookup
}

/**
 * Load the real `CATALOG` and the motion source map via a throwaway Vite SSR
 * server, so the catalog's `vue` imports + `.vue` demo loaders and
 * `motionSources.ts`'s `import.meta.glob` all resolve. The server runs in
 * middleware mode, so it binds no port; we always close it.
 */
async function loadCatalog(): Promise<LoadedCatalog> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const catalogModule = (await server.ssrLoadModule('/src/gallery/catalog.ts')) as {
      CATALOG: CatalogEntry[]
    }
    const motionModule = (await server.ssrLoadModule('/src/gallery/motionSources.ts')) as {
      getMotionSource: MotionSourceLookup
    }
    return { catalog: catalogModule.CATALOG, getMotionSource: motionModule.getMotionSource }
  }
  finally {
    await server.close()
  }
}

async function main(): Promise<void> {
  const { catalog, getMotionSource } = await loadCatalog()
  if (catalog.length === 0) {
    throw new Error('Animation catalog has no effects — nothing to generate.')
  }

  // Read straight off disk, not through the `?raw` glob: Vite's CSS pipeline can
  // resolve `?raw` on a stylesheet to an empty string, which would publish a
  // blank file behind a live `meta.stylesheet` URL.
  const stylesheet = await readFile(resolve(MOTION_DIR, MOTION_STYLESHEET_SOURCE), 'utf8')
  if (stylesheet.trim() === '') {
    throw new Error(
      `Motion stylesheet "${MOTION_STYLESHEET_SOURCE}" is empty — items reference it `
      + `via meta.stylesheet, so publishing it blank would ship a dead URL.`,
    )
  }

  // Wipe + recreate so a deleted/renamed effect can never leave a stale artifact.
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  // Per effect: a registry-item JSON.
  for (const entry of catalog) {
    await writeFile(
      resolve(OUT_DIR, `${entry.id}.json`),
      toJson(toRegistryItem(entry, getMotionSource)),
    )
  }

  // The registry index listing every item.
  await writeFile(
    resolve(OUT_DIR, 'registry.json'),
    toJson(buildRegistryIndex(catalog, getMotionSource)),
  )

  // The shared motion stylesheet, emitted once (see registryItem.ts's policy note).
  await writeFile(resolve(OUT_DIR, MOTION_STYLESHEET_FILE), stylesheet)

  console.log(
    `▸ Animations registry: wrote registry.json + ${MOTION_STYLESHEET_FILE} + `
    + `${catalog.length} item(s) to ${OUT_DIR}`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ build-animations-registry failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
