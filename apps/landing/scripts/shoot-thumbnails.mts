/**
 * shoot-thumbnails — the committed thumbnail pipeline for the Templates gallery.
 *
 * Generates a light + dark screenshot pair for every template in the registry
 * and writes them as optimised WebP into the committed assets dir
 * (`public/templates/thumbnails/<slug>.webp` + `<slug>-dark.webp`). These are
 * the static screenshots the gallery cards show instead of a Lucide glyph
 * (docs/templates.md §2 #1, #2, #14) — generated once at build time, committed,
 * and never rendered live per request (N live iframes is far too heavy).
 *
 * How it works:
 *   1. Spawns the landing app's own **Vite dev server** as a child process
 *      (`vite --no-open`). Running Vite in its own Node process — rather than
 *      importing its API into this tsx-loaded script — keeps Vite's internal
 *      esbuild resolution clean. The dev server reuses `vite.config.ts` verbatim
 *      (the aliases that compile `@dzup-ui/core` from source), so we screenshot
 *      exactly what ships, with no dist artifacts to clean up. The chromeless
 *      `/templates/<slug>/preview` route is the same target the detail page's
 *      <iframe> and "Open fullscreen" use.
 *   2. Drives headless Chromium (Playwright) to each preview route, once with
 *      `?theme=light` and once with `?theme=dark`, at a fixed 1200×750 (16:10)
 *      viewport @2× DPR — matching the gallery card's reserved aspect-ratio so
 *      there is no layout shift when the <img> paints.
 *   3. Re-encodes each capture to WebP with sharp (down-sampling the 2× capture
 *      to 1200×750 for crisp edges at a small file weight).
 *
 * Reproducible + idempotent: same template source → same pixels → same files, so
 * re-running overwrites in place. Contexts run with `reducedMotion: 'reduce'` so
 * entrance animations settle to their resting state (the components honour the
 * real `prefers-reduced-motion` setting — we don't inject CSS, we screenshot
 * what ships).
 *
 * Run with: `yarn thumbnails` (from apps/landing). Re-run after adding or
 * changing a template. See scripts/README.md.
 *
 * FAIL-LOUD contract: if Playwright or its Chromium build is unavailable, this
 * exits non-zero with a clear message and writes NOTHING — the gallery keeps its
 * icon fallback rather than shipping blank/broken images.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEMPLATES, THUMBNAIL_DIR } from '../src/templates/registry.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(__dirname, '..')

/** Gallery aspect ratio (16:10) — mirrors `.tile-preview { aspect-ratio: 16/10 }`. */
const WIDTH = 1200
const HEIGHT = 750
/** Capture at 2× for crisp downsampling, then encode at 1×. */
const SCALE = 2

/** `public/` mirror of the public-URL dir the registry derives (`THUMBNAIL_DIR`). */
const OUT_DIR = resolve(LANDING_ROOT, 'public', THUMBNAIL_DIR.replace(/^\//, ''))

const THEMES = ['light', 'dark'] as const
type Theme = (typeof THEMES)[number]

/** Output filename for a (slug, theme) pair — matches the gallery's convention. */
function fileFor(slug: string, theme: Theme): string {
  return resolve(OUT_DIR, theme === 'dark' ? `${slug}-dark.webp` : `${slug}.webp`)
}

/** Pretty-print a byte count for the per-image weight summary. */
function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`
}

/**
 * Resolve the optional toolchain (Playwright + sharp) at runtime so a missing
 * dependency fails LOUDLY with an actionable message instead of a stack trace at
 * import time — and so a checkout that never runs `yarn thumbnails` doesn't need
 * the heavy native deps installed.
 */
async function loadToolchain() {
  let playwright: typeof import('playwright')
  try {
    playwright = await import('playwright')
  } catch {
    throw new Error(
      'Playwright is not installed. Run `yarn install` then `npx playwright install chromium`.',
    )
  }
  // sharp ships as `export =`, so under Node ESM its factory arrives as the
  // interop `.default` (falling back to the namespace itself). Typed as the
  // factory so `sharp(png).webp()…` checks cleanly downstream.
  let sharp: typeof import('sharp')
  try {
    const mod = (await import('sharp')) as { default?: typeof import('sharp') }
    sharp = mod.default ?? (mod as unknown as typeof import('sharp'))
  } catch {
    throw new Error('sharp is not installed. Run `yarn install` in the repo root.')
  }
  return { chromium: playwright.chromium, sharp }
}

/** Strip ANSI colour codes so we can regex Vite's pretty-printed URL line. */
// eslint-disable-next-line no-control-regex
const ANSI = /\[[0-9;]*m/g

/**
 * Boot the landing app's Vite dev server in a child Node process and resolve its
 * local URL (parsed from the "Local:" banner it prints on ready). `--no-open`
 * stops it popping a browser; Vite auto-picks a free port if the configured one
 * is busy, and we read whichever it actually bound.
 */
function startDevServer(): Promise<{ base: string; child: ChildProcess }> {
  const require = createRequire(import.meta.url)
  // Resolve via package.json so Vite's "exports" map can't block the deep bin path.
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
      const match = text.match(/Local:\s*(https?:\/\/\S+)/i) ?? text.match(/(https?:\/\/localhost:\d+\S*)/i)
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
  if (child.pid === undefined || child.killed) return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}

async function main(): Promise<void> {
  const { chromium, sharp } = await loadToolchain()

  if (TEMPLATES.length === 0) {
    throw new Error('Registry has no templates — nothing to screenshot.')
  }

  await mkdir(OUT_DIR, { recursive: true })

  // 1. Boot the landing app on its own Vite dev server (child process).
  const { base, child } = await startDevServer()
  console.log(`▸ Serving landing app at ${base}`)

  // 2. Launch headless Chromium — fail loudly if the browser build is missing.
  let browser: Awaited<ReturnType<typeof chromium.launch>>
  try {
    browser = await chromium.launch()
  } catch (error) {
    stopDevServer(child)
    throw new Error(
      'Could not launch headless Chromium. Install it with `npx playwright install chromium`.\n' +
        `Underlying error: ${(error as Error).message}`,
    )
  }

  const weights: number[] = []
  try {
    for (const theme of THEMES) {
      // One context per theme: fix the colour scheme + viewport, and pre-seed the
      // `dz-theme` key the FOUC IIFE (index.html) reads so the very first paint is
      // already the right theme. The `?theme=` query param is the source of truth
      // the preview page applies on mount — we assert it landed below.
      const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: SCALE,
        colorScheme: theme,
        reducedMotion: 'reduce',
      })
      await context.addInitScript((t) => {
        try {
          localStorage.setItem('dz-theme', t as string)
        } catch {
          /* private mode / no storage — the query param still applies the theme */
        }
      }, theme)

      const page = await context.newPage()

      for (const template of TEMPLATES) {
        const url = `${base}/templates/${template.slug}/preview?theme=${theme}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })

        // The chromeless preview lazy-loads the per-slug bundle behind a Suspense
        // spinner. Wait until the spinner is gone AND the template has painted,
        // so we never capture the loading state or a blank frame.
        await page.waitForFunction(
          () => {
            const root = document.querySelector('.preview-root')
            const loading = document.querySelector('.preview-loading')
            return !!root && root.children.length > 0 && !loading
          },
          { timeout: 45_000 },
        )

        // Assert the requested theme actually applied — guards against a silent
        // mismatch baking the wrong colours into a "dark" thumbnail.
        const applied = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme'),
        )
        if (applied !== theme) {
          throw new Error(
            `Theme mismatch for "${template.slug}": expected ${theme}, got ${applied ?? 'none'}.`,
          )
        }

        // Let webfonts and any reduced-motion transitions settle before capture.
        await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready)
        await page.waitForTimeout(350)

        // Capture the viewport (not full page) → exactly WIDTH×HEIGHT @2×, then
        // down-sample + encode to WebP for a small, crisp committed asset.
        const png = await page.screenshot({ type: 'png' })
        const webp = await sharp(png)
          .resize(WIDTH, HEIGHT, { fit: 'cover' })
          .webp({ quality: 80, effort: 6 })
          .toBuffer()

        const out = fileFor(template.slug, theme)
        await writeFile(out, webp)
        weights.push(webp.byteLength)
        console.log(`  ✓ ${theme.padEnd(5)} ${template.slug} — ${kb(webp.byteLength)}`)
      }

      await context.close()
    }
  } finally {
    await browser.close()
    stopDevServer(child)
  }

  const total = weights.reduce((a, b) => a + b, 0)
  const avg = total / weights.length
  console.log(
    `\n▸ Done: ${weights.length} images (${TEMPLATES.length} templates × ${THEMES.length} themes)\n` +
      `  Total ${kb(total)} · avg ${kb(avg)} · max ${kb(Math.max(...weights))} per image\n` +
      `  Written to ${OUT_DIR}`,
  )
}

main().catch((error: unknown) => {
  console.error(`\n✗ thumbnails failed: ${(error as Error).message}\n`)
  process.exitCode = 1
})
