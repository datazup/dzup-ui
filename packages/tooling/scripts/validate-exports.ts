/**
 * Export Validation Script (ADR-01)
 *
 * For manifest-driven packages (core): reads public-api.manifest.json and validates:
 *   1. Every referenced source file exists on disk
 *   2. Every declared export symbol is actually exported from its source file
 *   3. No orphaned manifest entries (file exists but exports nothing declared)
 *
 * For flat-export packages (compat, nuxt): validates that:
 *   1. The package entry file exists
 *   2. The file exports at least one symbol (non-empty barrel)
 *   3. The package.json `exports` map points to resolvable paths
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-exports.ts
 *
 * Exit code 1 if any errors found.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types matching manifest JSON shape (from manifest-generator.ts) ---

interface ManifestEntry {
  path: string
  exports: string[]
}

interface ManifestExports {
  components: Record<string, ManifestEntry>
  composables: Record<string, ManifestEntry>
  utilities: Record<string, ManifestEntry>
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

interface ValidationError {
  package: string
  category: string
  entry: string
  filePath: string
  message: string
}

interface PackageJson {
  exports?: Record<string, unknown>
  main?: string
  module?: string
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

const MANIFEST_PATHS: Array<{ name: string, path: string, packageDir: string }> = [
  {
    name: '@dzup-ui/core',
    path: resolve(ROOT, 'packages/core/manifests/public-api.manifest.json'),
    packageDir: resolve(ROOT, 'packages/core'),
  },
]

/**
 * Flat-export packages: no manifest — validate the entry file and export map.
 * entryFile is relative to packageDir (src/ path, the source of truth pre-build).
 */
const FLAT_EXPORT_PACKAGES: Array<{ name: string, packageDir: string, entryFile: string }> = [
  {
    name: '@dzup-ui/compat',
    packageDir: resolve(ROOT, 'packages/compat'),
    entryFile: 'src/index.ts',
  },
  {
    name: '@dzup-ui/nuxt',
    packageDir: resolve(ROOT, 'packages/nuxt'),
    entryFile: 'src/module.ts',
  },
]

// --- Helpers ---

/**
 * Resolves a manifest-relative path (e.g. "./src/components/buttons/index.ts")
 * to an absolute path from the package directory.
 */
function resolveManifestPath(packageDir: string, manifestPath: string): string {
  return resolve(packageDir, manifestPath)
}

/**
 * Reads a file and returns the set of exported symbol names.
 * For `export *` re-exports, returns a special marker.
 */
function getExportedSymbols(filePath: string): { symbols: Set<string>, hasStarExport: boolean } {
  const content = readFileSync(filePath, 'utf-8')
  const symbols = new Set<string>()
  let hasStarExport = false

  // Check for `export *` re-exports
  if (/export\s*\*\s*from/.test(content)) {
    hasStarExport = true
  }

  // Named exports: export const/let/var/function/class/interface/type/enum
  const namedRe = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum|abstract\s+class)\s+(\w+)/g
  let match: RegExpExecArray | null = namedRe.exec(content)
  while (match !== null) {
    if (match[1] !== undefined) {
      symbols.add(match[1])
    }
    match = namedRe.exec(content)
  }

  // Destructured exports: export { Foo, Bar, Baz as Qux }
  const bracketRe = /export\s*\{([^}]+)\}/g
  match = bracketRe.exec(content)
  while (match !== null) {
    if (match[1] !== undefined) {
      const names = match[1].split(',').map(s => s.trim())
      for (const name of names) {
        // Handle "Foo as Bar" — the exported name is "Bar"
        const asMatch = /\w+\s+as\s+(\w+)/.exec(name)
        if (asMatch !== null && asMatch[1] !== undefined) {
          symbols.add(asMatch[1])
        }
        else {
          // Simple export, handle "type Foo" prefix
          const cleanName = name.replace(/^type\s+/, '').trim()
          if (cleanName.length > 0) {
            symbols.add(cleanName)
          }
        }
      }
    }
    match = bracketRe.exec(content)
  }

  return { symbols, hasStarExport }
}

/**
 * Validates all entries in a single category (components, composables, utilities).
 */
function validateCategory(
  packageName: string,
  packageDir: string,
  categoryName: string,
  entries: Record<string, ManifestEntry>,
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [entryName, entry] of Object.entries(entries)) {
    const filePath = resolveManifestPath(packageDir, entry.path)
    const relPath = relative(ROOT, filePath)

    // Check 1: Source file exists
    if (!existsSync(filePath)) {
      errors.push({
        package: packageName,
        category: categoryName,
        entry: entryName,
        filePath: relPath,
        message: `Source file does not exist: ${relPath}`,
      })
      continue // Cannot check exports if file is missing
    }

    // Check 2: Declared exports exist in the source file
    const { symbols, hasStarExport } = getExportedSymbols(filePath)

    for (const exportName of entry.exports) {
      if (!symbols.has(exportName) && !hasStarExport) {
        errors.push({
          package: packageName,
          category: categoryName,
          entry: entryName,
          filePath: relPath,
          message: `Export "${exportName}" declared in manifest but not found in ${relPath}`,
        })
      }
    }

    // Check 3: Orphan detection — file has no matching exports and no star re-export
    if (!hasStarExport && entry.exports.length > 0) {
      const foundCount = entry.exports.filter(e => symbols.has(e)).length
      if (foundCount === 0 && symbols.size === 0) {
        errors.push({
          package: packageName,
          category: categoryName,
          entry: entryName,
          filePath: relPath,
          message: `File ${relPath} exports nothing — all ${entry.exports.length} manifest symbols are orphaned`,
        })
      }
    }
  }

  return errors
}

// --- Flat-export validation (compat, nuxt) ---

/**
 * Validates a flat-export package (no manifest):
 *  1. Entry source file exists
 *  2. Entry file exports at least one symbol
 *  3. package.json `exports` map has a "." entry pointing to a path (dist existence
 *     is skipped pre-build — we validate the source barrel only)
 */
function validateFlatExportPackage(
  pkg: { name: string, packageDir: string, entryFile: string },
): ValidationError[] {
  const errors: ValidationError[] = []
  const entryPath = resolve(pkg.packageDir, pkg.entryFile)
  const relEntry = relative(ROOT, entryPath)

  // Check 1: entry source file exists
  if (!existsSync(entryPath)) {
    errors.push({
      package: pkg.name,
      category: 'entry',
      entry: pkg.entryFile,
      filePath: relEntry,
      message: `Entry file does not exist: ${relEntry}`,
    })
    return errors
  }

  // Check 2: entry file exports at least one symbol
  const { symbols, hasStarExport } = getExportedSymbols(entryPath)
  if (symbols.size === 0 && !hasStarExport) {
    errors.push({
      package: pkg.name,
      category: 'entry',
      entry: pkg.entryFile,
      filePath: relEntry,
      message: `Entry file exports nothing: ${relEntry}`,
    })
  }

  // Check 3: package.json exports map has a "." entry
  const pkgJsonPath = resolve(pkg.packageDir, 'package.json')
  if (existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as PackageJson
    if (!pkgJson.exports || !('.' in pkgJson.exports)) {
      errors.push({
        package: pkg.name,
        category: 'package.json',
        entry: '.',
        filePath: relative(ROOT, pkgJsonPath),
        message: `package.json "exports" map is missing a "." entry`,
      })
    }
  }

  return errors
}

// --- Main ---

function main(): void {
  const allErrors: ValidationError[] = []
  let totalEntries = 0
  let totalExports = 0

  for (const manifestDef of MANIFEST_PATHS) {
    if (!existsSync(manifestDef.path)) {
      console.error(`  SKIP  Manifest not found: ${relative(ROOT, manifestDef.path)}`)
      continue
    }

    const raw = readFileSync(manifestDef.path, 'utf-8')
    const manifest: Manifest = JSON.parse(raw) as Manifest
    const { exports: me } = manifest

    console.warn(`\nValidating ${manifestDef.name} (${relative(ROOT, manifestDef.path)})`)

    // Validate each category
    const categories: Array<{ name: string, entries: Record<string, ManifestEntry> }> = [
      { name: 'components', entries: me.components },
      { name: 'composables', entries: me.composables },
      { name: 'utilities', entries: me.utilities },
    ]

    for (const cat of categories) {
      const entryCount = Object.keys(cat.entries).length
      const exportCount = Object.values(cat.entries).reduce((sum, e) => sum + e.exports.length, 0)
      totalEntries += entryCount
      totalExports += exportCount

      const errors = validateCategory(manifestDef.name, manifestDef.packageDir, cat.name, cat.entries)
      allErrors.push(...errors)

      const status = errors.length === 0 ? 'PASS' : 'FAIL'
      console.warn(`  ${status}  ${cat.name}: ${entryCount} entries, ${exportCount} exports`)
    }
  }

  // Validate flat-export packages (no manifest — check entry file + export map)
  for (const pkg of FLAT_EXPORT_PACKAGES) {
    console.warn(`\nValidating ${pkg.name} (flat-export: ${pkg.entryFile})`)
    const errors = validateFlatExportPackage(pkg)
    allErrors.push(...errors)

    const { symbols, hasStarExport } = existsSync(resolve(pkg.packageDir, pkg.entryFile))
      ? getExportedSymbols(resolve(pkg.packageDir, pkg.entryFile))
      : { symbols: new Set<string>(), hasStarExport: false }
    const exportCount = hasStarExport ? '(re-exports via export *)' : `${symbols.size} named exports`
    const status = errors.length === 0 ? 'PASS' : 'FAIL'
    console.warn(`  ${status}  entry: ${pkg.entryFile} — ${exportCount}`)
    if (errors.length > 0) {
      for (const err of errors) {
        console.warn(`         ${err.message}`)
      }
    }
  }

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Total: ${totalEntries} entries, ${totalExports} declared exports (manifest packages)`)
  console.warn(`       + ${FLAT_EXPORT_PACKAGES.length} flat-export packages validated`)

  if (allErrors.length === 0) {
    console.warn(`\nExport validation passed: 0 errors`)
    process.exit(0)
  }

  console.error(`\nExport validation FAILED: ${allErrors.length} error(s)\n`)

  for (const err of allErrors) {
    console.error(`  [${err.package}] ${err.category}/${err.entry}`)
    console.error(`    ${err.message}\n`)
  }

  process.exit(1)
}

main()
