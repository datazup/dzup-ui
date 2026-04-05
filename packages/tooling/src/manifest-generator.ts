/**
 * Manifest-Driven Export Generator (ADR-01)
 *
 * Reads `manifests/public-api.manifest.json` from a package directory
 * and generates the barrel `src/index.ts` with proper exports.
 *
 * Usage:
 *   tsx packages/tooling/src/manifest-generator.ts <package-dir>
 *
 * Example:
 *   tsx packages/tooling/src/manifest-generator.ts packages/core
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'

// --- Types matching actual manifest JSON shape ---

interface ManifestComponentFamily {
  path: string
  exports: string[]
}

interface ManifestComposableEntry {
  path: string
  exports: string[]
}

interface ManifestUtilityEntry {
  path: string
  exports: string[]
}

interface ManifestProviderEntry {
  path: string
  exports: string[]
}

interface ManifestExports {
  components: Record<string, ManifestComponentFamily>
  composables: Record<string, ManifestComposableEntry>
  utilities: Record<string, ManifestUtilityEntry>
  providers?: Record<string, ManifestProviderEntry>
  injectionKeys?: string[]
  variants?: string[]
  runtimeExports?: string[]
  types?: string[]
}

interface Manifest {
  $schema?: string
  package: string
  version: string
  description?: string
  exports: ManifestExports
}

// --- Constants ---

const HEADER = `/**
 * AUTO-GENERATED — Do not edit manually.
 * Generated from public-api.manifest.json (ADR-01).
 * Run: tsx packages/tooling/src/manifest-generator.ts <package-dir>
 */
`

// --- Helpers ---

/**
 * Converts a manifest path (e.g. "./src/components/buttons/index.ts")
 * to a relative import path from src/index.ts (e.g. "./components/buttons/index.ts").
 */
function toRelativeImport(manifestPath: string): string {
  let cleaned = manifestPath
  if (cleaned.startsWith('./src/')) {
    cleaned = `./${cleaned.slice(6)}`
  }
  else if (cleaned.startsWith('src/')) {
    cleaned = `./${cleaned.slice(4)}`
  }
  else if (!cleaned.startsWith('./')) {
    cleaned = `./${cleaned}`
  }
  return cleaned
}

// --- Main ---

function generate(packageDir: string): void {
  const manifestPath = resolve(packageDir, 'manifests/public-api.manifest.json')

  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`)
    process.exit(1)
  }

  const raw = readFileSync(manifestPath, 'utf-8')
  const manifest: Manifest = JSON.parse(raw) as Manifest
  const { exports: me } = manifest

  const sections: string[] = []
  let componentCount = 0
  let composableCount = 0
  let utilityCount = 0

  // Components — keyed by family name, each has a path to re-export (sorted alphabetically)
  if (me.components && Object.keys(me.components).length > 0) {
    const lines: string[] = []
    for (const [family, entry] of Object.entries(me.components).sort(([a], [b]) => a.localeCompare(b))) {
      const familyLabel = family.charAt(0).toUpperCase() + family.slice(1)
      lines.push(`// ${familyLabel} family`)
      lines.push(`export * from '${toRelativeImport(entry.path)}'`)
      lines.push('')
      componentCount += entry.exports.length
    }
    // Trim trailing empty line from last family entry
    const componentBlock = lines.join('\n').replace(/\n+$/, '')
    sections.push(`// ── Components ──\n\n${componentBlock}`)
  }

  // Composables — keyed by name, each has a path
  if (me.composables && Object.keys(me.composables).length > 0) {
    const lines: string[] = []
    for (const [, entry] of Object.entries(me.composables).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`export * from '${toRelativeImport(entry.path)}'`)
      composableCount += entry.exports.length
    }
    sections.push(`// ── Composables ──\n\n${lines.join('\n')}`)
  }

  // Providers — keyed by name, each has a path to re-export
  if (me.providers && Object.keys(me.providers).length > 0) {
    const lines: string[] = []
    let providerCount = 0
    for (const [, entry] of Object.entries(me.providers).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`export * from '${toRelativeImport(entry.path)}'`)
      providerCount += entry.exports.length
    }
    sections.push(`// ── Providers ──\n\n${lines.join('\n')}`)
    componentCount += providerCount
  }

  // Utilities — keyed by name, each has specific exports
  if (me.utilities && Object.keys(me.utilities).length > 0) {
    const lines: string[] = []
    for (const [, entry] of Object.entries(me.utilities).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`export { ${entry.exports.join(', ')} } from '${toRelativeImport(entry.path)}'`)
      utilityCount += entry.exports.length
    }
    sections.push(`// ── Utilities ──\n\n${lines.join('\n')}`)
  }

  const body = sections.length > 0 ? sections.join('\n\n') : 'export {}'
  const output = `${HEADER}\n${body}\n`

  const indexPath = resolve(packageDir, 'src/index.ts')
  const indexDir = dirname(indexPath)

  if (!existsSync(indexDir)) {
    console.error(`Source directory not found: ${indexDir}`)
    process.exit(1)
  }

  writeFileSync(indexPath, output, 'utf-8')

  const relManifest = relative(process.cwd(), manifestPath)
  const relIndex = relative(process.cwd(), indexPath)
  const totalExports = componentCount + composableCount + utilityCount
  console.warn(`Generated ${relIndex} from ${relManifest} (${manifest.package})`)
  console.warn(
    `  ${componentCount} components, `
    + `${composableCount} composables, `
    + `${utilityCount} utilities `
    + `(${totalExports} total exports)`,
  )
}

// CLI entry
const packageDir = process.argv[2]
if (!packageDir) {
  console.error('Usage: tsx packages/tooling/src/manifest-generator.ts <package-dir>')
  console.error('Example: tsx packages/tooling/src/manifest-generator.ts packages/core')
  process.exit(1)
}

generate(packageDir)
