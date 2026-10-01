/**
 * Which consumer override wins, before and after changeset #33
 * (DZUP-UI-CHANGESET-AUDIT-20260926-R1, owner decision D180).
 *
 * `the-six-cascade-layers-the-styling-contract-promised` ships as a `patch`. It
 * is a `patch` only if no consumer override that won before loses after, and
 * none that lost before wins after. This renders the same overrides against two
 * packed stages and compares the winner cell by cell.
 *
 * A stage is a directory written by `e2e/styling/pack-styles.mjs`
 * (`DZUP_STYLE_STAGE=<dir> node e2e/styling/pack-styles.mjs`), so both sides are
 * the CSS inside a `yarn pack` tarball, not source.
 *
 * Usage (from the repository root, so `@playwright/test` resolves):
 *   node docs/qa/changeset-audit-2026-09-26/layer-precedence-diff.mjs \
 *     --before <stage> --after <stage> [--out <file.json>] [--engines chromium,firefox,webkit]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { chromium, firefox, webkit } from '@playwright/test'

const ENGINES = { chromium, firefox, webkit }

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? fallback : process.argv[index + 1]
}

function readStage(dir) {
  const paths = JSON.parse(readFileSync(join(dir, 'stylesheets.json'), 'utf8'))
  return { tokens: readFileSync(paths.tokensCss, 'utf8'), core: readFileSync(paths.coreCss, 'utf8') }
}

/**
 * One property per kind of library rule #33 touched or could have touched.
 * Each consumer rule uses a selector at least as specific as the library's, so
 * inside a shared layer the consumer wins on source order or specificity, and
 * across layers only layer order decides.
 */
const PROPERTIES = [
  {
    id: 'component-opacity',
    owner: 'dz-components rule `.dz-tab-close-btn { opacity: 0 }`',
    consumer: '.dz-tab-close-btn { opacity: 0.25 }',
    consumerValue: '0.25',
    read: () => getComputedStyle(document.querySelector('.dz-tab-close-btn')).opacity,
  },
  {
    id: 'reset-box-sizing',
    owner: '`*, *::before, *::after { box-sizing: border-box }` (dz-base before, dz-reset after)',
    consumer: '.probe { box-sizing: content-box }',
    consumerValue: 'content-box',
    read: () => getComputedStyle(document.querySelector('.probe')).boxSizing,
  },
  {
    id: 'reset-body-margin',
    owner: '`body { margin: 0 }` (dz-base before, dz-reset after)',
    consumer: 'body { margin: 7px }',
    consumerValue: '7px',
    read: () => getComputedStyle(document.body).marginTop,
  },
  {
    id: 'token-text-xs',
    owner: '`--dz-text-xs` in dz-tokens',
    consumer: ':root { --dz-text-xs: 9px }',
    consumerValue: '9px',
    read: () => getComputedStyle(document.documentElement).getPropertyValue('--dz-text-xs').trim(),
  },
]

/** Where a consumer writes: unlayered, each ADR-19 slot, and a layer of its own. */
const CONSUMER_LAYERS = [null, 'dz-reset', 'dz-tokens', 'dz-base', 'dz-components', 'dz-utilities', 'dz-overrides', 'app']
const POSITIONS = ['after', 'before']
const LIBRARY_ORDERS = [['tokens', 'core'], ['core', 'tokens']]

function consumerSheet(layer, rule) {
  return layer === null ? rule : `@layer ${layer} { ${rule} }`
}

function documentOf(sheets) {
  return `<!DOCTYPE html><html><head>${sheets.map(css => `<style>${css}</style>`).join('')}</head>`
    + '<body><button class="dz-tab-close-btn" data-part="close">x</button><div class="probe"></div></body></html>'
}

async function measure(page, stage) {
  const cells = []
  for (const order of LIBRARY_ORDERS) {
    const library = order.map(name => stage[name])
    for (const property of PROPERTIES) {
      await page.setContent(documentOf(library))
      const libraryValue = await page.evaluate(property.read)
      for (const layer of CONSUMER_LAYERS) {
        for (const position of POSITIONS) {
          const consumer = consumerSheet(layer, property.consumer)
          const sheets = position === 'after' ? [...library, consumer] : [consumer, ...library]
          await page.setContent(documentOf(sheets))
          const value = await page.evaluate(property.read)
          cells.push({
            libraryOrder: order.join('>'),
            property: property.id,
            consumerLayer: layer ?? 'unlayered',
            position,
            value,
            libraryValue,
            winner: value === property.consumerValue ? 'consumer' : value === libraryValue ? 'library' : 'other',
          })
        }
      }
    }
  }
  return cells
}

async function main() {
  const before = readStage(option('before'))
  const after = readStage(option('after'))
  const engines = option('engines', 'chromium,firefox,webkit').split(',')
  const result = { generatedAt: new Date().toISOString(), engines: {}, differences: [], unavailable: {} }

  for (const name of engines) {
    let browser
    try {
      browser = await ENGINES[name].launch()
    }
    catch (error) {
      result.unavailable[name] = String(error.message).split('\n')[0]
      continue
    }
    const page = await browser.newPage()
    const cells = { before: await measure(page, before), after: await measure(page, after) }
    await browser.close()
    result.engines[name] = cells

    for (const [index, was] of cells.before.entries()) {
      const now = cells.after[index]
      if (was.winner !== now.winner || was.value !== now.value)
        result.differences.push({ engine: name, ...was, value: undefined, winner: undefined, libraryValue: undefined, before: `${was.winner} (${was.value})`, after: `${now.winner} (${now.value})` })
    }
  }

  const out = option('out')
  if (out)
    writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

  const measured = Object.keys(result.engines)
  console.warn(`engines measured: ${measured.join(', ') || 'none'}`)
  for (const [name, reason] of Object.entries(result.unavailable))
    console.warn(`engine unavailable: ${name}: ${reason}`)
  console.warn(`cells per engine per stage: ${measured.length ? result.engines[measured[0]].before.length : 0}`)
  console.warn(`differences: ${result.differences.length}`)
  for (const d of result.differences)
    console.warn(`  ${d.engine} ${d.libraryOrder} ${d.property} consumer=${d.consumerLayer} ${d.position}: ${d.before} -> ${d.after}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
