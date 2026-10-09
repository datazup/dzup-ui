/**
 * check-bundle-size.spec.ts — the eager-graph half of the Storybook size metric
 * (UI-LAZY-BUDGET-20261009-R2).
 *
 * The total-on-disk half is a sum and needs no fixture. The eager half is a
 * parser (which `iframe.html` references count), a graph walk (static imports
 * only, never `import()`), and a verdict. Each is pinned here on a tiny static
 * build written to a tmp dir, including the one case the metric exists for: an
 * engine that is supposed to be lazy reaching the entry through a static import.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eagerClosure, entryReferences, evaluate, measure, staticImports } from './check-bundle-size.mjs'

const IFRAME = `<!doctype html><html><head>
<script type="module" src="./vite-inject-mocker-entry.js"></script>
<script type="module" crossorigin src="./assets/iframe-AAAA.js"></script>
<link rel="modulepreload" crossorigin href="./assets/preload-helper-BBBB.js">
<link rel="stylesheet" href="./assets/iframe-CCCC.css">
<link rel="icon" href="./favicon.svg">
<script src="./sb-common-assets/legacy.js"></script>
</head><body></body></html>`

let staticDir: string

function write(rel: string, content: string): void {
  const full = join(staticDir, rel)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, content)
}

beforeAll(() => {
  staticDir = mkdtempSync(join(tmpdir(), 'dzup-sb-size-'))
  write('iframe.html', IFRAME)
  write('vite-inject-mocker-entry.js', 'export {}\n')
  write('assets/preload-helper-BBBB.js', 'export const p = 1\n')
  // The runtime statically imports a vendor chunk and lazily imports mermaid.
  write('assets/iframe-AAAA.js', [
    'import { p } from "./preload-helper-BBBB.js"',
    'import "./vendor-vue-DDDD.js"',
    'const lazy = () => import("./mermaid.core-EEEE.js")',
    'export { p, lazy }',
  ].join('\n'))
  write('assets/vendor-vue-DDDD.js', `export const vue = "${'v'.repeat(2048)}"\n`)
  write('assets/mermaid.core-EEEE.js', `export const mermaid = "${'m'.repeat(65536)}"\n`)
  write('assets/iframe-CCCC.css', 'body{margin:0}\n')
  write('sb-common-assets/legacy.js', 'window.legacy = 1\n')
})

afterAll(() => {
  rmSync(staticDir, { recursive: true, force: true })
})

describe('entryReferences', () => {
  it('keeps module scripts and modulepreloads, once each, and drops the rest', () => {
    expect(entryReferences(IFRAME)).toEqual([
      'vite-inject-mocker-entry.js',
      'assets/iframe-AAAA.js',
      'assets/preload-helper-BBBB.js',
    ])
  })
})

describe('staticImports', () => {
  it('matches static import and re-export forms but never a dynamic import()', () => {
    const source = [
      'import a from "./a.js"',
      'import "./b.js"',
      'export { c } from \'../c.js\'',
      'const d = import("./d.js")',
      'import type { T } from "./types.js"',
    ].join('\n')
    expect(staticImports(source)).toEqual(['./a.js', './b.js', '../c.js', './types.js'])
  })
})

describe('eagerClosure / measure', () => {
  it('walks static imports from the entry and leaves the lazy engine out', () => {
    const measured = measure(staticDir)
    const eagerFiles = measured.eager.map(f => f.rel)
    expect(eagerFiles).toContain('assets/iframe-AAAA.js')
    expect(eagerFiles).toContain('assets/vendor-vue-DDDD.js')
    expect(eagerFiles).toContain('assets/preload-helper-BBBB.js')
    expect(eagerFiles).not.toContain('assets/mermaid.core-EEEE.js')
    expect(measured.eagerBytes).toBeLessThan(measured.totalBytes)
    expect(measured.chunkCount).toBe(6)
  })

  it('negative control: an engine reached statically trips the eager budget and is named', () => {
    // Same build, but the runtime now imports mermaid statically.
    write('assets/iframe-AAAA.js', [
      'import { p } from "./preload-helper-BBBB.js"',
      'import "./vendor-vue-DDDD.js"',
      'import "./mermaid.core-EEEE.js"',
      'export { p }',
    ].join('\n'))
    const measured = measure(staticDir)
    expect(measured.eager.map(f => f.rel)).toContain('assets/mermaid.core-EEEE.js')
    const verdict = evaluate(measured, { maxEagerBytes: 16 * 1024, maxBytes: 1024 * 1024 })
    expect(verdict.ok).toBe(false)
    expect(verdict.findings.find(f => f.name.startsWith('eager'))?.ok).toBe(false)
    expect(verdict.findings.find(f => f.name.startsWith('total'))?.ok).toBe(true)
    // The largest eager chunk is the engine, which is what the printed list leads with.
    expect(measured.eager[0]?.rel).toBe('assets/mermaid.core-EEEE.js')
    expect(eagerClosure(staticDir, ['assets/iframe-AAAA.js']).map(f => f.rel)).toContain('assets/mermaid.core-EEEE.js')
  })

  it('evaluate enforces nothing when no limit is given', () => {
    expect(evaluate(measure(staticDir))).toEqual({ findings: [], ok: true })
  })
})
