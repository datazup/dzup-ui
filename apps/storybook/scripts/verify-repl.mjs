/**
 * One-off verification (not wired into CI): serve the static Storybook build and
 * confirm the "Try it now" REPL compiles a real @dzup-ui/core example live.
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../storybook-static', import.meta.url))
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.map': 'application/json' }

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

await new Promise((r) => server.listen(0, r))
const port = server.address().port
const url = `http://localhost:${port}/iframe.html?id=getting-started--docs&viewMode=docs`

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200)) })
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
let ok = false
try {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(6000)
  console.log('[diag] .dz-repl count:', await page.locator('.dz-repl').count())
  console.log('[diag] .vue-repl count:', await page.locator('.vue-repl').count())
  console.log('[diag] overlay text:', JSON.stringify((await page.locator('.dz-repl').first().innerText().catch(() => '')).slice(0, 120)))
  console.log('[diag] frames:', page.frames().map(f => f.url().slice(0, 60)))
  // The REPL preview renders inside a nested sandbox iframe. Poll every frame
  // for the seeded button text until it appears (Vue + compiler + bundle load
  // from CDN/local can take a few seconds).
  const deadline = Date.now() + 45000
  let btn = null
  while (Date.now() < deadline && !btn) {
    for (const frame of page.frames()) {
      try {
        const cand = frame.locator('button', { hasText: 'Clicked' }).first()
        if (await cand.count()) { btn = cand; break }
      }
      catch { /* frame detached mid-poll */ }
    }
    if (!btn)
      await page.waitForTimeout(1000)
  }
  if (btn) {
    console.log('✅ REPL rendered a live DzButton in the sandbox')
    // Styled? (Tailwind browser CDN + tokens loaded → non-transparent bg.)
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor)
    const styled = bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && !!bg
    console.log(`   styling: background-color = ${bg}`, styled ? '(styled ✓)' : '(⚠ unstyled)')
    // Interactive re-render? @click="count++" should update the label live.
    const before = (await btn.innerText()).trim()
    await btn.click()
    await page.waitForTimeout(300)
    const after = (await btn.innerText()).trim()
    console.log(`   reactivity: "${before}" → "${after}"`, before !== after ? '(re-rendered ✓)' : '(⚠ no change)')
    ok = before !== after
  }
  else {
    console.log('❌ DzButton not found within timeout')
  }
}
catch (e) {
  console.log('❌ verification error:', e.message.split('\n')[0])
}
finally {
  await browser.close()
  server.close()
  process.exitCode = ok ? 0 : 1
}
