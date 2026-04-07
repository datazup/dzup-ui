import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateSizeReport } from './component-size-report'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')
const CORE_DIST = resolve(ROOT_DIR, 'packages/core/dist/components')
const hasBuiltDist = existsSync(CORE_DIST)

describe('component-size-report', () => {
  it('generates a size report with components from built dist', () => {
    const report = generateSizeReport(ROOT_DIR)

    expect(report.generated).toBeTruthy()
    expect(report.components).toBeInstanceOf(Array)
    expect(report.totals.core).toBeDefined()
    // TODO: totals.pro support requires pro dist integration (tracked separately)
  })

  it.skipIf(!hasBuiltDist)('discovers core components from dist/components/', () => {
    const report = generateSizeReport(ROOT_DIR)

    const coreComponents = report.components.filter(c => c.package === 'core')
    // We have 146 core .vue files — dist should have many of them
    expect(coreComponents.length).toBeGreaterThan(0)

    // Check a known component exists
    const dzButton = coreComponents.find(c => c.name === 'DzButton')
    expect(dzButton).toBeDefined()
    expect(dzButton!.family).toBe('buttons')
    expect(dzButton!.gzipBytes).toBeGreaterThan(0)
    expect(dzButton!.rawBytes).toBeGreaterThan(dzButton!.gzipBytes)
  })

  it.todo('discovers pro components from dist/components/ (requires pro dist integration)')

  it('sorts components by gzip size descending', () => {
    const report = generateSizeReport(ROOT_DIR)

    for (let i = 1; i < report.components.length; i++) {
      expect(report.components[i - 1]!.gzipBytes).toBeGreaterThanOrEqual(
        report.components[i]!.gzipBytes,
      )
    }
  })

  it('totals sum correctly', () => {
    const report = generateSizeReport(ROOT_DIR)

    const coreComponents = report.components.filter(c => c.package === 'core')
    const expectedCoreGzip = coreComponents.reduce((sum, c) => sum + c.gzipBytes, 0)
    expect(report.totals.core.gzip).toBe(expectedCoreGzip)
    expect(report.totals.core.count).toBe(coreComponents.length)
  })

  it('each component has valid fields', () => {
    const report = generateSizeReport(ROOT_DIR)

    for (const component of report.components.slice(0, 10)) {
      expect(component.name).toMatch(/^Dz[A-Z]/)
      expect(component.package).toBe('core')
      expect(component.family).toBeTruthy()
      expect(component.rawBytes).toBeGreaterThan(0)
      expect(component.gzipBytes).toBeGreaterThan(0)
      expect(component.files.length).toBeGreaterThan(0)
    }
  })
})
