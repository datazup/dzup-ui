/**
 * verify-repl.mjs — CI gate for the embedded "Try it now" playground.
 *
 * The REPL is the most fragile surface in this Storybook: it depends on a custom
 * compiler-sfc resolution, a sandbox import map, a CDN Tailwind build, a
 * MutationObserver theme bridge, and a set of stylesheets whose filenames are
 * agreed on in TWO places (scripts/build-playground.mjs writes them,
 * stories/_blocks/playground.config.ts links them). Nothing in the type system
 * or the build ties those two ends together — a stale filename produces a silent
 * 404 and a half-styled editor, which is exactly what shipped for months.
 *
 * So this asserts the whole chain end-to-end against the real static build:
 *
 *   1. ZERO failed requests (any 4xx/5xx or network failure, in the docs page or
 *      the nested REPL sandbox iframe) — this is what catches a linked-but-never-
 *      written stylesheet.
 *   2. The sandbox compiles and mounts a live DzButton from @dzup-ui/core.
 *   3. It is STYLED (Tailwind browser JIT + tokens resolved → real background).
 *   4. It is REACTIVE (@click="count++" re-renders the label).
 *   5. It RE-THEMES: flipping Storybook's `data-theme` to dark repaints the
 *      sandbox (theme prop → html.className → bridge → [data-theme]) without a
 *      reload.
 *
 * Usage: `yarn workspace @dzup-ui/storybook verify:repl` (after `build`).
 * Exits non-zero on any failure. Wired into the `storybook` CI job.
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../storybook-static', import.meta.url))
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.map': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }

if (!existsSync(root)) {
  console.error(`❌ ${root} does not exist — run \`yarn workspace @dzup-ui/storybook build\` first.`)
  process.exit(1)
}

const failures = []
function fail(msg) {
  failures.push(msg)
  console.log(`❌ ${msg}`)
}
const pass = msg => console.log(`✅ ${msg}`)

// TASK-FREE2-12 — the per-component "Open in playground" affordance. Its snippets
// are DERIVED (build-playground-snippets.mjs) and only compile-validated at build
// time; compile-validation proves a snippet parses, not that it mounts. So a
// cross-family sample is driven in the real browser REPL here: navigate to the
// component's docs page, expand the collapsed playground, and assert the seeded
// component actually renders in the sandbox. One simple, one compound, one form
// control — the three shapes most likely to expose a bad auto-conversion.
const PLAYGROUND_SAMPLES = [
  { id: 'core-buttons-dzbutton--docs', label: 'DzButton (simple)', find: f => f.locator('button', { hasText: 'Save' }) },
  { id: 'core-data-dztable--docs', label: 'DzTable (compound)', find: f => f.locator('table') },
  { id: 'core-forms-dzselect--docs', label: 'DzSelect (form control)', find: f => f.locator('[role="combobox"]') },
]

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0])
    const path = normalize(join(root, url === '/' ? '/index.html' : url))
    if (!path.startsWith(root))
      return res.writeHead(403).end()
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' }).end(body)
  }
  catch {
    res.writeHead(404).end('not found')
  }
})

await new Promise(r => server.listen(0, r))
const port = server.address().port
const origin = `http://localhost:${port}`
const url = `${origin}/iframe.html?id=getting-started--docs&viewMode=docs`

const browser = await chromium.launch()
const page = await browser.newPage()

// ── Requirement: the playground must load with ZERO 404s. ────────────────────
// A missing stylesheet is a *successful* HTTP exchange with a 404 status, so
// `requestfailed` alone would never see it — we must watch responses too. Both
// listeners cover every frame in the page, including the REPL's nested sandbox
// iframe, which is where the playground assets are actually requested from.
const badResponses = []
page.on('response', (r) => {
  if (r.status() >= 400)
    badResponses.push(`${r.status()} ${r.url().replace(origin, '')}`)
})
page.on('requestfailed', (r) => {
  // `net::ERR_ABORTED` is what a cancelled navigation/preload looks like; it is
  // not a broken asset, so don't fail the build on it.
  const err = r.failure()?.errorText ?? 'failed'
  if (!err.includes('ERR_ABORTED'))
    badResponses.push(`${err} ${r.url().replace(origin, '')}`)
})
page.on('pageerror', e => console.log('[pageerror]', e.message.slice(0, 200)))

try {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })

  // The preview renders inside a nested sandbox iframe; poll every frame for the
  // seeded button (Vue + compiler + the local bundle take a few seconds).
  const deadline = Date.now() + 60000
  let btn = null
  while (Date.now() < deadline && !btn) {
    for (const frame of page.frames()) {
      try {
        const cand = frame.locator('button', { hasText: 'Clicked' }).first()
        if (await cand.count()) {
          btn = cand
          break
        }
      }
      catch { /* frame detached mid-poll */ }
    }
    if (!btn)
      await page.waitForTimeout(500)
  }

  if (!btn) {
    fail('the REPL never rendered a live DzButton (sandbox failed to compile or mount)')
  }
  else {
    pass('REPL compiled and mounted a live DzButton in the sandbox')

    // Styled? Tailwind browser JIT + tokens.css + core.css all resolved.
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor)
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)')
      pass(`DzButton is styled (background-color: ${bg})`)
    else
      fail(`DzButton rendered UNSTYLED (background-color: ${bg}) — tokens/Tailwind did not resolve`)

    // Reactive? @click="count++" must re-render the label.
    const before = (await btn.textContent())?.trim()
    await btn.click()
    await page.waitForTimeout(300)
    const after = (await btn.textContent())?.trim()
    if (before !== after)
      pass(`DzButton re-renders on click ("${before}" → "${after}")`)
    else
      fail(`DzButton did not re-render on click (still "${before}") — the sandbox is not live`)

    // Re-themes? Storybook's toolbar writes data-theme on the docs <html>; the
    // DzRepl observer mirrors it into the sandbox without reloading.
    const themeOf = () => btn.evaluate(el => ({
      theme: el.ownerDocument.documentElement.getAttribute('data-theme'),
      bg: getComputedStyle(el.ownerDocument.body).backgroundColor,
    }))
    const light = await themeOf()
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await page.waitForTimeout(1500)
    const dark = await themeOf()
    if (dark.theme === 'dark' && dark.bg !== light.bg)
      pass(`sandbox re-themed live (body ${light.bg} → ${dark.bg})`)
    else
      fail(`sandbox did not re-theme on toolbar change (data-theme=${dark.theme}, body ${light.bg} → ${dark.bg})`)
  }

  if (badResponses.length) {
    fail(`${badResponses.length} failed request(s) from the Storybook page / REPL sandbox:`)
    for (const r of [...new Set(badResponses)])
      console.log(`     ${r}`)
  }
  else {
    pass('zero failed requests (no 404s) from the docs page or the sandbox iframe')
  }

  // ── TASK-FREE2-12: per-component "Open in playground" deep links ────────────
  for (const sample of PLAYGROUND_SAMPLES) {
    const p = await browser.newPage()
    const bad = []
    p.on('response', (r) => {
      if (r.status() >= 400)
        bad.push(`${r.status()} ${r.url().replace(origin, '')}`)
    })
    p.on('requestfailed', (r) => {
      const err = r.failure()?.errorText ?? 'failed'
      if (!err.includes('ERR_ABORTED'))
        bad.push(`${err} ${r.url().replace(origin, '')}`)
    })
    try {
      await p.goto(`${origin}/iframe.html?id=${sample.id}&viewMode=docs`, { waitUntil: 'load', timeout: 60000 })

      // The playground is collapsed by default (booting @vue/repl on all 139 pages
      // would be a real perf regression) — expand it, then poll for the component.
      // The docs app hydrates asynchronously, so wait for the affordance to attach
      // rather than reading its count the instant the page's `load` event fires.
      const toggle = p.getByRole('button', { name: /try it live/i }).first()
      try {
        await toggle.waitFor({ state: 'attached', timeout: 30000 })
      }
      catch {
        fail(`${sample.label}: no "Try it live" button on ${sample.id} — the per-component playground affordance did not render`)
        continue
      }
      await toggle.click()

      const deadline = Date.now() + 60000
      let el = null
      while (Date.now() < deadline && !el) {
        for (const frame of p.frames()) {
          try {
            const cand = sample.find(frame).first()
            if (await cand.count()) {
              el = cand
              break
            }
          }
          catch { /* frame detached mid-poll */ }
        }
        if (!el)
          await p.waitForTimeout(500)
      }

      if (!el)
        fail(`${sample.label}: the ${sample.id} playground never mounted its seeded component — the derived snippet failed to compile or run`)
      else
        pass(`${sample.label}: ${sample.id} playground compiled and mounted its seeded component`)

      if (bad.length) {
        fail(`${sample.label}: ${bad.length} failed request(s) on ${sample.id}:`)
        for (const r of [...new Set(bad)])
          console.log(`     ${r}`)
      }
    }
    finally {
      await p.close()
    }
  }
}
catch (e) {
  fail(`verification error: ${e.message.split('\n')[0]}`)
}
finally {
  await browser.close()
  server.close()
}

console.log(failures.length ? `\n${failures.length} check(s) failed — the playground is broken.` : '\nPlayground OK.')
process.exitCode = failures.length ? 1 : 0
