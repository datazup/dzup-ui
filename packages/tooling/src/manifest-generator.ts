/**
 * Manifest-Driven Export Renderer and Barrel Drift Check (ADR-01)
 *
 * Reads `manifests/public-api.manifest.json` from a package directory and
 * renders the barrel `src/index.ts` that manifest describes.
 *
 * The CLI NEVER WRITES. `src/index.ts` is maintained by hand: it carries
 * ordering and comments the renderer cannot reproduce, and the version this
 * script used to write over it failed lint, so CI had to `git checkout` the
 * tree back after running it. The CLI now compares the export lines of the
 * committed barrel with the rendered ones and exits 1 on any difference, so
 * `yarn generate:exports:core` on a clean tree produces no diff. The symbol-level
 * check in both directions (manifest → barrel and barrel → manifest) is
 * `yarn validate:exports`.
 *
 * Usage:
 *   tsx packages/tooling/src/manifest-generator.ts <package-dir>
 *
 * Example:
 *   tsx packages/tooling/src/manifest-generator.ts packages/core
 */

import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
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
 * Rendered from public-api.manifest.json (ADR-01) for comparison only.
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

export interface BarrelRender {
  manifestPath: string
  indexPath: string
  package: string
  output: string
  counts: { components: number, composables: number, utilities: number }
}

/**
 * Render the barrel a package's manifest describes, **without writing it**.
 *
 * Split out of `generate()` by TASK-R1-O3 so that `release:api-diff` can answer
 * "what would `yarn generate:exports` change?" by rendering and comparing,
 * instead of running the generator over the working tree and restoring the file
 * afterwards. A release tool that mutates the tree it is measuring is the
 * problem, not the measurement.
 *
 * Note what the renderer actually emits, because it decides what the drift
 * question means: components, composables and providers are emitted as
 * `export * from '<family index>'` — the manifest's per-entry `exports` arrays
 * are **documentation of intent, not the emitted names**. Only `utilities` is
 * enumerated by name. So a symbol missing from the manifest's name lists is a
 * stale *document*; a missing **path** is what changes the barrel.
 */
export function renderBarrel(packageDir: string): BarrelRender {
  const manifestPath = resolve(packageDir, 'manifests/public-api.manifest.json')

  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`)
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

  // Side-effect import of the package's base stylesheet. This is what makes Vite
  // emit `dist/core.css` (paired with `build.lib.cssFileName` in vite.config.ts).
  //
  // The committed barrel carries the same import by hand; it is rendered here so
  // the rendered barrel stays a complete description of the package entry.
  const stylesEntry = resolve(packageDir, 'src/styles/base.css')
  const styleImport = existsSync(stylesEntry) ? `import './styles/base.css'\n\n` : ''

  const body = sections.length > 0 ? sections.join('\n\n') : 'export {}'
  const output = `${HEADER}\n${styleImport}${body}\n`

  return {
    manifestPath,
    indexPath: resolve(packageDir, 'src/index.ts'),
    package: manifest.package,
    output,
    counts: { components: componentCount, composables: composableCount, utilities: utilityCount },
  }
}

/** Export lines of a barrel, as a set — order and comments are the hand-maintained part. */
export function barrelExportLines(text: string): Set<string> {
  return new Set(text.split(/\r?\n/).filter(line => line.startsWith('export ')))
}

export interface BarrelCheck {
  render: BarrelRender
  /** Export lines the committed barrel has and the manifest would not emit. */
  onlyInBarrel: string[]
  /** Export lines the manifest would emit and the committed barrel lacks. */
  onlyInManifest: string[]
}

/** Compare the committed barrel's export lines with the rendered ones. Reads only. */
export function checkBarrel(packageDir: string): BarrelCheck {
  const render = renderBarrel(packageDir)
  const current = existsSync(render.indexPath) ? readFileSync(render.indexPath, 'utf-8') : ''
  const now = barrelExportLines(current)
  const next = barrelExportLines(render.output)
  return {
    render,
    onlyInBarrel: [...now].filter(line => !next.has(line)).sort(),
    onlyInManifest: [...next].filter(line => !now.has(line)).sort(),
  }
}

function check(packageDir: string): void {
  let result: BarrelCheck
  try {
    result = checkBarrel(packageDir)
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  const { render, onlyInBarrel, onlyInManifest } = result
  const relManifest = relative(process.cwd(), render.manifestPath)
  const relIndex = relative(process.cwd(), render.indexPath)
  const { components, composables, utilities } = render.counts

  if (onlyInBarrel.length === 0 && onlyInManifest.length === 0) {
    console.warn(`${relIndex} agrees with ${relManifest} (${render.package}) — nothing written; the barrel is maintained by hand`)
    console.warn(
      `  ${components} components, `
      + `${composables} composables, `
      + `${utilities} utilities `
      + `(${components + composables + utilities} total exports)`,
    )
    return
  }

  console.error(`${relIndex} and ${relManifest} disagree on export lines (${render.package}). Nothing was written; edit one of them by hand.`)
  for (const line of onlyInBarrel)
    console.error(`  only in barrel:   ${line}`)
  for (const line of onlyInManifest)
    console.error(`  only in manifest: ${line}`)
  process.exit(1)
}

// CLI entry.
//
// Guarded since TASK-R1-O3: `renderBarrel` is now imported by
// `src/release/api-diff.ts`, and an unguarded CLI block runs — and exits 1 with
// a usage message — on `import`, not only on `tsx <this file>`. Same pattern as
// the release modules and the validators.
const invokedDirectly = process.argv[1] !== undefined
  && /manifest-generator\.(?:ts|js|mjs)$/.test(process.argv[1].replaceAll('\\', '/'))

if (invokedDirectly) {
  const packageDir = process.argv[2]
  if (!packageDir) {
    console.error('Usage: tsx packages/tooling/src/manifest-generator.ts <package-dir>')
    console.error('Example: tsx packages/tooling/src/manifest-generator.ts packages/core')
    process.exit(1)
  }
  check(packageDir)
}
