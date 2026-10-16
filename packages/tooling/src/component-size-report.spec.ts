import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { generateSizeReport } from './component-size-report'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')
const CORE_DIST = resolve(ROOT_DIR, 'packages/core/dist/components')
const hasBuiltDist = existsSync(CORE_DIST)

/**
 * The report's shape, order and totals are pinned on a fixture dist
 * (UI-DZUP-UI-TEST-L-06). The CI unit job builds nothing, so specs that read
 * the real `packages/core/dist` there walked zero components: the sort loop
 * and the per-field checks passed over an empty list and proved nothing.
 */
describe('component-size-report on a fixture dist', () => {
  let root: string

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'dz-size-report-'))
    const write = (family: string, file: string, body: string) => {
      const dir = join(root, 'packages/core/dist/components', family)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, file), body)
    }
    // Varied, low-redundancy bodies so the gzip sizes differ by component.
    const body = (seed: number, length: number) =>
      Array.from({ length }, (_, i) => `export const v${seed}_${i} = ${(i * 7919 + seed) % 104729};`).join('\n')
    write('buttons', 'DzButton.vue.js', body(1, 40))
    write('buttons', 'DzButton.variants.js', body(2, 10))
    write('buttons', 'DzIconButton.vue.js', body(3, 5))
    write('data', 'DzTable.vue.js', body(4, 120))
    write('data', 'index.js', 'export {}') // not a component file
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('discovers each component once, grouping its files', () => {
    const report = generateSizeReport(root)
    expect(report.generated).toBeTruthy()
    expect(report.components.map(c => c.name).sort()).toEqual(['DzButton', 'DzIconButton', 'DzTable'])
    const button = report.components.find(c => c.name === 'DzButton')!
    expect(button.family).toBe('buttons')
    expect(button.files.sort()).toEqual(['DzButton.variants.js', 'DzButton.vue.js'])
  })

  it('sorts components by gzip size descending', () => {
    const report = generateSizeReport(root)
    expect(report.components.map(c => c.name)).toEqual(['DzTable', 'DzButton', 'DzIconButton'])
    for (let i = 1; i < report.components.length; i++)
      expect(report.components[i - 1]!.gzipBytes).toBeGreaterThanOrEqual(report.components[i]!.gzipBytes)
  })

  it('totals sum correctly', () => {
    const report = generateSizeReport(root)
    expect(report.totals.core.count).toBe(3)
    expect(report.totals.core.gzip).toBe(report.components.reduce((sum, c) => sum + c.gzipBytes, 0))
    expect(report.totals.core.raw).toBe(report.components.reduce((sum, c) => sum + c.rawBytes, 0))
  })

  it('each component has valid fields', () => {
    const report = generateSizeReport(root)
    expect(report.components).toHaveLength(3)
    for (const component of report.components) {
      expect(component.name).toMatch(/^Dz[A-Z]/)
      expect(component.package).toBe('core')
      expect(component.family).toBeTruthy()
      expect(component.rawBytes).toBeGreaterThan(component.gzipBytes)
      expect(component.gzipBytes).toBeGreaterThan(0)
      expect(component.files.length).toBeGreaterThan(0)
    }
  })
})

describe('component-size-report on the built core dist', () => {
  it.skipIf(!hasBuiltDist)('discovers core components from dist/components/', () => {
    const report = generateSizeReport(ROOT_DIR)

    const coreComponents = report.components.filter(c => c.package === 'core')
    expect(coreComponents.length).toBeGreaterThan(0)
    expect(report.totals.core.count).toBe(coreComponents.length)

    // Check a known component exists
    const dzButton = coreComponents.find(c => c.name === 'DzButton')
    expect(dzButton).toBeDefined()
    expect(dzButton!.family).toBe('buttons')
    expect(dzButton!.gzipBytes).toBeGreaterThan(0)
    expect(dzButton!.rawBytes).toBeGreaterThan(dzButton!.gzipBytes)
  })
})
