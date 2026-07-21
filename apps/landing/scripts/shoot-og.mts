import type { Buffer } from 'node:buffer'
import type { ChildProcess } from 'node:child_process'
import type { BlockDef } from '../src/blocks/registry.ts'
/**
 * shoot-og — the committed Open Graph (social share) image pipeline for the
 * per-block SEO pages (docs/blocks.md §3.5, §1.2 #7, Task I4).
 *
 * Generates ONE 1200×630 OG card per block and writes it as a PNG into the
 * committed assets dir (`public/og/<id>.png`). The per-block detail route
 * (`/blocks/:id`, BlockDetailPage) references `/og/<id>.png` as its `og:image`
 * / `twitter:image` via the router's `meta.head` resolver, so a shared link
 * renders a real picture of the block instead of the generic site card.
 *
 * The render source is the SAME chrome-free `/blocks/preview/:id` route that
 * backs the iframe and "open in new tab" (one route, three uses — §3.5), so the
 * share card is a faithful, zero-drift screenshot of what actually ships — no
 * Satori/HTML-to-image second renderer to keep in sync.
 *
 * How it works (mirrors shoot-thumbnails.mts):
 *   1. Loads the block ids from the registry via a throwaway Vite SSR server —
 *      `src/blocks/registry.ts` pairs each block with its `?raw` source through a
 *      module-level `import.meta.glob`, which only a Vite transform resolves, so
 *      a bare Node import sees an empty catalog (same reason build-registry.ts
 *      uses `ssrLoadModule`).
 *   2. Spawns the landing app's own Vite dev server in a child process and drives
 *      headless Chromium (Playwright) to each `/blocks/preview/<id>?theme=light`
 *      at a fixed 1200×630 viewport @2× DPR (the canonical OG aspect ratio).
 *   3. Down-samples the 2× capture to 1200×630 and encodes a compact PNG (sharp).
 *
 * Reproducible + idempotent: same block source → same pixels → same file, so
 * re-running overwrites in place. The out dir is wiped first so a removed/renamed
 * block can never leave a stale card behind. Contexts run with
 * `reducedMotion: 'reduce'` so entrance animations settle before capture.
 *
 * Run with: `yarn og` (from apps/landing). Re-run after adding or changing a
 * block. It is a SEPARATE step from `vite build` (Playwright + Chromium are heavy
 * and optional), exactly like `yarn thumbnails`. See scripts/README.md.
 *
 * FAIL-LOUD contract: if the catalog is empty, or Playwright / its Chromium build
 * is unavailable, this exits non-zero with a clear message and writes NOTHING —
 * the detail pages keep falling back to the generic site OG card rather than
 * referencing blank/broken images.
 */
import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** Canonical Open Graph card size (1.91:1). */
const WIDTH = 1200
const HEIGHT = 630
/** Capture at 2× for crisp downsampling, then encode at 1×. */
const SCALE = 2

/** `public/og/` — served verbatim as `/og/*`, where the detail route points its og:image. */
const OUT_DIR = resolve(LANDING_ROOT, 'public', 'og')

/** Pretty-print a byte count for the per-image weight summary. */
function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`
}

/**
 * Load the real `BLOCKS` (id + title only is used here) via a throwaway Vite SSR
 * server so `import.meta.glob` is transformed. Middleware mode binds no port; we
 * always close it. Mirrors build-registry.ts's `loadCatalog`.
 */
async function loadBlocks(): Promise<BlockDef[]> {
  const server = await createServer({
    root: LANDING_ROOT,
    logLevel: 'warn',
    appType: 'custom',
    server: { middlewareMode: true },
  })
  try {
    const mod = (await server.ssrLoadModule('/src/blocks/registry.ts')) as { BLOCKS: BlockDef[] }
    return mod.BLOCKS
  }
  finally {
    await server.close()
  }
}

/**
 * Resolve the optional toolchain (Playwright + sharp) at runtime so a missing
 * dependency fails LOUDLY with an actionable message instead of a stack trace at
 * import time. Identical contract to shoot-thumbnails.mts.
 */
async function loadToolchain() {
  let playwright: typeof import('playwright')
  try {
    playwright = await import('playwright')
  }
  catch {
    throw new Error(
      'Playwright is not installed. Run `yarn install` then `npx playwright install chromium`.',
    )
  }
  let sharp: typeof import('sharp')
  try {
    const mod = (await import('sharp')) as { default?: typeof import('sharp') }
    sharp = mod.default ?? (mod as unknown as typeof import('sharp'))
  }
  catch {
    throw new Error('sharp is not installed. Run `yarn install` in the repo root.')
  }
  return { chromium: playwright.chromium, sharp }
}

/** Strip ANSI colour codes so we can regex Vite's pretty-printed URL line. */

const ANSI = /\[[0-9;]*m/g

/**
 * Boot the landing app's Vite dev server in a child Node process and resolve its
 * local URL (parsed from the "Local:" banner). Mirrors shoot-thumbnails.mts.
 */
function startDevServer(): Promise<{ base: string, child: ChildProcess }> {
  const require = createRequire(import.meta.url)
  const viteBin = resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js')

  const child = spawn(process.execPath, [viteBin, '--no-open', '--clearScreen', 'false'], {
    cwd: LANDING_ROOT,
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return new Promise((resolveUrl, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Vite dev server did not become ready within 60s.'))
    }, 60_000)

    let stderr = ''
    const onData = (buf: Buffer) => {
      const text = buf.toString().replace(ANSI, '')
      const match = text.match(/Local:\s*(https?:\/\/\S+)/i) ?? text.match(/(https?:\/\/localhost:\d\S*)/i)
      if (match) {
        clearTimeout(timeout)
        child.stdout?.off('data', onData)
        resolveUrl({ base: match[1]!.replace(/\/$/, ''), child })
      }
    }
    child.stdout?.on('data', onData)
    child.stderr?.on('data', (b: Buffer) => {
      stderr += b.toString()
    })
    child.on('exit', (code) => {
      clearTimeout(timeout)
      reject(new Error(`Vite dev server exited early (code ${code}).\n${stderr}`))
    })
  })
}

/** Kill the dev server and its child processes (esbuild) — tree-kill on Windows. */
function stopDevServer(child: ChildProcess): void {
  if (child.pid === undefined || child.killed)
    return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' })
  }
  else {
    child.kill('SIGTERM')
  }
}

async function main(): Promise<void> {
  const blocks = await loadBlocks()
  if (blocks.length === 0) {
    throw new Error('Registry has no blocks — nothing to screenshot.')
  }

  const { chromium, sharp } = await loadToolchain()

  // Wipe + recreate so a deleted/renamed block can never leave a stale OG card.
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  // 1. Boot the landing app on its own Vite dev server (child process).
  const { base, child } = await startDevServer()
  console.log(`▸ Serving landing app at ${base}`)

  // 2. Launch headless Chromium — fail loudly if the browser build is missing.
  let browser: Awaited<ReturnType<typeof chromium.launch>>
  try {
    browser = await chromium.launch()
  }
  catch (error) {
    stopDevServer(child)
    throw new Error(
      'Could not launch headless Chromium. Install it with `npx playwright install chromium`.\n'
      + `Underlying error: ${(error as Error).message}`,
    )
  }

  const weights: number[] = []
  try {
    // One light-themed context: a single OG card per block (the share image is
    // theme-agnostic — light reads cleanest on most social surfaces). Pre-seed the
    // `dz-theme` key the FOUC IIFE reads so the very first paint is already light.
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: SCALE,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    })
    await context.addInitScript(() => {
      try {
        localStorage.setItem('dz-theme', 'light')
      }
      catch {
        /* private mode / no storage — the ?theme query param still applies it */
      }
    })

    const page = await context.newPage()

    for (const block of blocks) {
      const url = `${base}/blocks/preview/${block.id}?theme=light`
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })

      // The chromeless preview lazily loads the block component into the frame.
      // Wait until that frame has painted real content, so we never capture an
      // empty box.
      await page.waitForFunction(
        () => {
          const frame = document.querySelector('.block-preview-frame')
          return !!frame && frame.children.length > 0
        },
        { timeout: 45_000 },
      )

      // Assert light actually applied — guards against a silent theme mismatch.
      const applied = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
      if (applied !== 'light') {
        throw new Error(`Theme mismatch for "${block.id}": expected light, got ${applied ?? 'none'}.`)
      }

      // Let webfonts and any reduced-motion transitions settle before capture.
      await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready)
      await page.waitForTimeout(350)

      // Capture the viewport (not full page) → exactly WIDTH×HEIGHT @2×, then
      // down-sample + encode to a compact PNG for the committed asset.
      const png = await page.screenshot({ type: 'png' })
      const out = await sharp(png)
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
        .png({ compressionLevel: 9 })
        .toBuffer()

      await writeFile(resolve(OUT_DIR, `${block.id}.png`), out)
      weights.push(out.byteLength)
      console.log(`  ✓ ${block.id} — ${kb(out.byteLength)}`)
    }

    await context.close()
  }
  finally {
    await browser.close()
    stopDevServer(child)
  }

  const total = weights.reduce((a, b) => a + b, 0)
  const avg = total / weights.length
  console.log(
    `\n▸ Done: ${weights.length} OG cards (1200×630)\n`
    + `  Total ${kb(total)} · avg ${kb(avg)} · max ${kb(Math.max(...weights))} per image\n`
    + `  Written to ${OUT_DIR}`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ og failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
