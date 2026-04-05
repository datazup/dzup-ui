/* eslint-disable no-console */
/**
 * Per-Component Bundle Size Report
 *
 * Analyzes the built dist/ artifacts to report individual component sizes.
 * Helps developers identify which components contribute most to bundle size
 * and track size changes across versions.
 *
 * Usage:
 *   npx tsx packages/tooling/src/component-size-report.ts
 *   npx tsx packages/tooling/src/component-size-report.ts --ci
 *   npx tsx packages/tooling/src/component-size-report.ts --top=20
 *
 * @module @dzip-ui/tooling/component-size-report
 */

import type { Buffer } from 'node:buffer'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentSizeEntry {
  name: string
  family: string
  package: 'core'
  rawBytes: number
  gzipBytes: number
  files: string[]
}

export interface SizeReport {
  generated: string
  components: ComponentSizeEntry[]
  totals: {
    core: { raw: number, gzip: number, count: number }
  }
}

// ---------------------------------------------------------------------------
// Size Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getGzipSize(content: Buffer): number {
  return gzipSync(content, { level: 9 }).length
}

// ---------------------------------------------------------------------------
// Component Discovery
// ---------------------------------------------------------------------------

function discoverComponents(distDir: string, pkg: 'core'): ComponentSizeEntry[] {
  const componentsDir = join(distDir, 'components')
  if (!existsSync(componentsDir))
    return []

  const entries: ComponentSizeEntry[] = []
  const families = readdirSync(componentsDir).filter(f =>
    statSync(join(componentsDir, f)).isDirectory(),
  )

  for (const family of families) {
    const familyDir = join(componentsDir, family)
    const files = readdirSync(familyDir).filter(f => f.endsWith('.js'))

    // Group files by component name (e.g., DzButton.vue.js, DzButton.variants.js → DzButton)
    const componentMap = new Map<string, string[]>()

    for (const file of files) {
      // Extract component name: DzButton.vue.js → DzButton, DzButton.variants.js → DzButton
      const match = /^(Dz[A-Za-z]+)\./.exec(file)
      if (!match?.[1])
        continue

      const componentName = match[1]
      const existing = componentMap.get(componentName) ?? []
      existing.push(file)
      componentMap.set(componentName, existing)
    }

    for (const [name, componentFiles] of componentMap) {
      let rawBytes = 0
      let gzipBytes = 0

      for (const file of componentFiles) {
        const filePath = join(familyDir, file)
        const content = readFileSync(filePath)
        rawBytes += content.length
        gzipBytes += getGzipSize(content)
      }

      entries.push({
        name,
        family,
        package: pkg,
        rawBytes,
        gzipBytes,
        files: componentFiles,
      })
    }
  }

  return entries.sort((a, b) => b.gzipBytes - a.gzipBytes)
}

// ---------------------------------------------------------------------------
// Report Generation
// ---------------------------------------------------------------------------

export function generateSizeReport(rootDir: string): SizeReport {
  const coreDistDir = join(rootDir, 'packages/core/dist')

  const coreComponents = discoverComponents(coreDistDir, 'core')
  const components = [...coreComponents].sort((a, b) => b.gzipBytes - a.gzipBytes)

  const coreTotals = coreComponents.reduce(
    (acc, c) => ({ raw: acc.raw + c.rawBytes, gzip: acc.gzip + c.gzipBytes, count: acc.count + 1 }),
    { raw: 0, gzip: 0, count: 0 },
  )

  return {
    generated: new Date().toISOString(),
    components,
    totals: { core: coreTotals },
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printHumanReport(report: SizeReport, topN: number): void {
  console.log('\n=== Per-Component Bundle Size Report ===\n')

  const shown = topN > 0 ? report.components.slice(0, topN) : report.components
  const maxNameLen = Math.max(...shown.map(c => c.name.length), 15)

  console.log(
    `${'Component'.padEnd(maxNameLen + 2)}${'Family'.padEnd(16)}${'Pkg'.padEnd(6)}${'Raw'.padStart(10)}${'Gzip'.padStart(10)}${'Files'.padStart(6)}`,
  )
  console.log('─'.repeat(maxNameLen + 50))

  for (const component of shown) {
    console.log(
      `${component.name.padEnd(maxNameLen + 2)}${component.family.padEnd(16)}${component.package.padEnd(6)}${formatBytes(component.rawBytes).padStart(10)}${formatBytes(component.gzipBytes).padStart(10)}${String(component.files.length).padStart(6)}`,
    )
  }

  if (topN > 0 && report.components.length > topN) {
    console.log(`\n  ... and ${report.components.length - topN} more components`)
  }

  console.log(`\n${'─'.repeat(maxNameLen + 50)}`)
  console.log(
    `Core:  ${report.totals.core.count} components, ${formatBytes(report.totals.core.raw)} raw, ${formatBytes(report.totals.core.gzip)} gzip`,
  )
}

function printCiReport(report: SizeReport): void {
  const output = {
    generated: report.generated,
    totals: {
      core: {
        count: report.totals.core.count,
        rawBytes: report.totals.core.raw,
        gzipBytes: report.totals.core.gzip,
        rawLabel: formatBytes(report.totals.core.raw),
        gzipLabel: formatBytes(report.totals.core.gzip),
      },
    },
    components: report.components.map(c => ({
      name: c.name,
      family: c.family,
      package: c.package,
      rawBytes: c.rawBytes,
      gzipBytes: c.gzipBytes,
      rawLabel: formatBytes(c.rawBytes),
      gzipLabel: formatBytes(c.gzipBytes),
    })),
  }
  console.log(JSON.stringify(output, null, 2))
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2)
  const ciMode = args.includes('--ci')
  const topArg = args.find(a => a.startsWith('--top='))
  const topN = topArg ? Number.parseInt(topArg.split('=')[1] ?? '0', 10) : 30
  const rootDir = resolve(import.meta.dirname, '..', '..', '..')

  const report = generateSizeReport(rootDir)

  if (ciMode) {
    printCiReport(report)
  }
  else {
    printHumanReport(report, topN)
  }
}

const isDirectRun = process.argv[1]?.includes('component-size-report')
if (isDirectRun) {
  main()
}
