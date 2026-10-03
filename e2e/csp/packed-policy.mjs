import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { createConsumer, linkConsumerDependencies, packPackage, root, runYarn } from '../../packages/testing/tests/run-resolution-consumer.mjs'

const require = createRequire(join(root, 'package.json'))
const ids = ['button', 'loading-button', 'alert', 'input', 'checkbox', 'color-picker']

async function main() {
  const consumer = createConsumer('dzup-csp-packed-')
  console.warn(`Packed CSP evidence: ${consumer}`)
  // Build current sources even if a previous dist exists. Clean checkouts need
  // no private preparation, and a restored static style cannot use stale dist.
  for (const name of ['contracts', 'tokens', 'core']) {
    runYarn(['workspace', `@dzup-ui/${name}`, 'build'])
    packPackage(name, consumer)
  }
  linkConsumerDependencies(consumer)
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ type: 'module' }))
  // Run inside the extracted consumer, with public exports and native Node
  // resolution. No repository aliases, TypeScript loader or hydration script.
  writeFileSync(join(consumer, 'render.mjs'), `
import { writeFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DzButton } from '@dzup-ui/core/buttons'
import { DzAlert } from '@dzup-ui/core/feedback'
import { DzInput } from '@dzup-ui/core/inputs'
import { DzCheckbox, DzColorPicker } from '@dzup-ui/core/forms'
const cases = [
  ['button', DzButton, {}], ['loading-button', DzButton, { loading: true }],
  ['alert', DzAlert, {}], ['input', DzInput, {}],
  ['checkbox', DzCheckbox, {}], ['color-picker', DzColorPicker, {}],
]
const html = await renderToString(createSSRApp({
  render: () => h('section', { id: 'library' }, cases.map(([id, component, props]) =>
    h('div', { id }, [h(component, props, { default: () => 'Packed SSR evidence' })]))),
}))
writeFileSync('ssr.html', html)
`)
  execFileSync(process.execPath, [join(consumer, 'render.mjs')], { cwd: consumer, stdio: 'inherit', timeout: 60_000 })
  const html = readFileSync(join(consumer, 'ssr.html'), 'utf8')
  assert.doesNotMatch(html, /\sstyle\s*=/i)
  assert.doesNotMatch(html, /<style\b/i)
  // Execute the public instructions, never supply hidden utility generation.
  // The token-only fallback reproduces the original main.ts instructions.
  const guide = readFileSync(join(root, 'apps/docs/guide/getting-started.md'), 'utf8')
  const css = guide.match(/```css\n([\s\S]*?)```/)?.[1] ?? '@import "@dzup-ui/tokens/css";\n'
  mkdirSync(join(consumer, 'src'))
  writeFileSync(join(consumer, 'src/style.css'), css)
  writeFileSync(join(consumer, 'index.html'), `<!doctype html><html><head><link rel="stylesheet" href="./src/style.css"></head><body>${html}<div id="policy-control" style="contain:layout style"></div></body></html>`)
  // These resets are inside interactive/bound-style branches. Exercise actual
  // packed components after mounting, separately from the static SSR oracle.
  writeFileSync(join(consumer, 'src/resets.css'), `${css}
@layer base {
  td, input[type="color"] { padding: 11px; border: 3px solid; }
  input[type="color"] { appearance: auto; }
}
#table [data-virtual] { max-height: 88px; overflow-y: auto; }
`)
  writeFileSync(join(consumer, 'src/resets.mjs'), `
import { createApp, h } from 'vue'
import { DzTable, DzTableBody, DzTableRow, DzTableCell } from '@dzup-ui/core/data'
import { DzColorPicker } from '@dzup-ui/core/forms'
createApp({ render: () => h('section', [
  h('div', { id: 'table' }, [h(DzTable, { virtualScroll: true, maxHeight: '88px', overscan: 0 }, {
    default: () => h(DzTableBody, {}, { default: () => Array.from({ length: 100 }, (_, index) =>
      h(DzTableRow, { key: index }, { default: () => h(DzTableCell, {}, { default: () => String(index) }) })) }),
  })]),
  h('div', { id: 'color' }, [h(DzColorPicker, { portalDisabled: true })]),
]) }).mount('#app')
`)
  writeFileSync(join(consumer, 'resets.html'), '<!doctype html><html><head><link rel="stylesheet" href="./src/resets.css"></head><body><div id="app"></div><script type="module" src="./src/resets.mjs"></script></body></html>')
  const { build } = require('vite')
  // The existing landing workspace declares the Tailwind build plugin.
  const landingRequire = createRequire(join(root, 'apps/landing/package.json'))
  const tailwind = (await import(pathToFileURL(landingRequire.resolve('@tailwindcss/vite')).href)).default
  const stage = join(consumer, 'site')
  await build({
    configFile: false,
    root: consumer,
    // Both policy mounts serve identical bytes with mount-relative assets.
    base: './',
    plugins: [tailwind()],
    build: {
      outDir: stage,
      assetsInlineLimit: 0,
      modulePreload: { polyfill: false },
      rollupOptions: { input: [join(consumer, 'index.html'), join(consumer, 'resets.html')] },
    },
    logLevel: 'warn',
  })

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const strict = url.pathname.startsWith('/strict/')
    const local = url.pathname.replace(/^\/(?:strict|open)\//, '')
    const file = resolve(stage, local || 'index.html')
    if (!file.startsWith(`${stage}/`) || !existsSync(file)) {
      response.writeHead(404)
      response.end()
      return
    }
    const headers = { 'content-type': file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html' }
    if (strict)
      headers['content-security-policy'] = `default-src 'self'; style-src 'self'; style-src-attr 'none'; script-src ${local === 'resets.html' ? "'self'" : "'none'"}; object-src 'none'; base-uri 'none'`
    response.writeHead(200, headers)
    response.end(readFileSync(file))
  })
  await new Promise((done, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', done)
  })
  let browser
  try {
    browser = await require('playwright').chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.addInitScript(() => {
      globalThis.__violations = []
      document.addEventListener('securitypolicyviolation', (event) => {
        globalThis.__violations.push(`${event.effectiveDirective}|${event.blockedURI}`)
      })
    })
    async function read(mount) {
      const response = await page.goto(`http://127.0.0.1:${server.address().port}/${mount}/`)
      assert.equal(response.status(), 200)
      const policy = response.headers()['content-security-policy']
      if (mount === 'strict')
        assert.ok(policy?.includes('style-src-attr \'none\''))
      else
        assert.equal(policy, undefined)
      return page.evaluate((ids) => {
        const properties = ['contain', 'display', 'position', 'height', 'padding', 'border', 'color', 'backgroundColor']
        const expected = document.createElement('div')
        expected.style.backgroundColor = 'var(--dz-primary-solid)'
        expected.style.height = 'var(--dz-button-md-height)'
        document.body.append(expected)
        const buttonTokens = getComputedStyle(expected)
        const expectedButton = { backgroundColor: buttonTokens.backgroundColor, height: buttonTokens.height }
        expected.style.height = 'var(--dz-input-md-height)'
        expected.style.backgroundColor = 'var(--dz-input-bg)'
        expected.style.border = '1px solid var(--dz-input-border)'
        const inputTokens = getComputedStyle(expected)
        const expectedInput = { height: inputTokens.height, backgroundColor: inputTokens.backgroundColor, border: inputTokens.border }
        expected.remove()
        const input = getComputedStyle(document.querySelector('#input [data-part="control"]'))
        return {
          libraryStyles: document.querySelectorAll('#library [style], #library style').length,
          styles: ids.map((id) => {
            const el = document.querySelector(`#${id} [data-part="root"]`) ?? document.querySelector(`#${id} > *`)
            const computed = getComputedStyle(el)
            return Object.fromEntries(properties.map(property => [property, computed[property]]))
          }),
          token: getComputedStyle(document.documentElement).getPropertyValue('--dz-primary').trim(),
          expectedButton,
          expectedInput,
          input: { display: input.display, height: input.height, backgroundColor: input.backgroundColor, border: input.border },
          control: getComputedStyle(document.querySelector('#policy-control')).contain,
          violations: globalThis.__violations,
        }
      }, ids)
    }
    const open = await read('open')
    const strict = await read('strict')
    assert.equal(open.libraryStyles, 0)
    assert.equal(strict.libraryStyles, 0)
    assert.ok(strict.token, 'external token CSS must load')
    assert.equal(open.styles[0].display, 'inline-flex', 'documented Button must have generated utilities')
    assert.equal(open.styles[0].backgroundColor, open.expectedButton.backgroundColor)
    assert.equal(open.styles[0].height, open.expectedButton.height)
    assert.equal(open.input.display, 'flex', 'documented Input must have generated utilities')
    for (const property of ['height', 'backgroundColor', 'border'])
      assert.equal(open.input[property], open.expectedInput[property], `Input ${property} must match its design token`)
    assert.deepEqual(strict.input, open.input)
    assert.equal(strict.token, open.token)
    assert.deepEqual(strict.styles, open.styles)
    for (const style of strict.styles)
      assert.equal(style.contain, 'layout style')
    assert.equal(open.control, 'layout style')
    assert.equal(strict.control, 'none')
    assert.deepEqual(open.violations, [])
    assert.deepEqual(strict.violations, ['style-src-attr|inline'], 'only the deliberate parser control may violate CSP')
    async function readResets(mount) {
      await page.goto(`http://127.0.0.1:${server.address().port}/${mount}/resets.html`)
      await page.locator('#table .dz-virtual-spacer td').waitFor()
      await page.locator('#table [data-virtual]').evaluate((el) => {
        el.scrollTop = 440
        el.dispatchEvent(new Event('scroll'))
      })
      await page.waitForFunction(() => document.querySelectorAll('#table .dz-virtual-spacer td').length === 2)
      await page.locator('#color [data-part="trigger"]').click()
      await page.locator('#color input[type="color"]').waitFor({ state: 'visible' })
      return page.evaluate(() => {
        const elements = [...document.querySelectorAll('#table .dz-virtual-spacer td'), document.querySelector('#color input[type="color"]')]
        return elements.map((el) => {
          const style = getComputedStyle(el)
          return {
            padding: style.padding,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
            appearance: style.appearance,
            inlineStyle: el.getAttribute('style'),
          }
        })
      })
    }
    const openResets = await readResets('open')
    const strictResets = await readResets('strict')
    assert.equal(openResets.length, 3, 'both table spacers and the open native color input must be exercised')
    assert.deepEqual(strictResets, openResets)
    for (const reset of strictResets) {
      assert.equal(reset.padding, '0px')
      assert.deepEqual(reset.borders, ['0px', '0px', '0px', '0px'])
      assert.equal(reset.inlineStyle, null, 'reset elements must use external utilities')
    }
    assert.equal(strictResets[2].appearance, 'none')
    writeFileSync(join(consumer, 'policy-summary.json'), `${JSON.stringify({ open, strict, openResets, strictResets }, null, 2)}\n`)
    console.warn('Packed pre-hydration strict-CSP policy passed (Chromium)')
  }
  finally {
    await browser?.close()
    await new Promise(done => server.close(done))
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
