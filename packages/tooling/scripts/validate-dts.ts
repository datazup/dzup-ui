/**
 * Declaration File (.d.ts) Validator
 *
 * Reads public-api.manifest.json from core and pro packages,
 * then validates that:
 *   1. dist/ directories exist (skip with warning if not — pre-build state)
 *   2. Every .js file in dist/ has a corresponding .d.ts file
 *   3. The root dist/index.d.ts contains export statements for major
 *      manifest categories (components, composables, utilities)
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-dts.ts
 *
 * Exit code 1 if any errors found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types ---

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
  file: string
  message: string
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

const PACKAGES: Array<{ name: string, manifestPath: string, distDir: string }> = [
  {
    name: '@dzip-ui/core',
    manifestPath: resolve(ROOT, 'packages/core/manifests/public-api.manifest.json'),
    distDir: resolve(ROOT, 'packages/core/dist'),
  },
]

// --- Helpers ---

/**
 * Recursively collects all files under a directory.
 */
function collectFiles(dir: string): string[] {
  const results: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath))
    }
    else {
      results.push(fullPath)
    }
  }

  return results
}

/**
 * Returns true if a .js file is a Vite-internal chunk that does not need
 * its own .d.ts file.  Vite splits Vue SFCs into `.vue.js` / `.vue2.js`
 * runtime chunks, and emits helpers in `_virtual/`.  The type information
 * for these lives in the corresponding `Component.d.ts` produced by
 * vite-plugin-dts, so a 1:1 `.js → .d.ts` check would be a false positive.
 */
function isViteChunk(filePath: string): boolean {
  const rel = relative(ROOT, filePath)
  // SFC render/setup chunks: DzButton.vue.js, DzButton.vue2.js
  if (/\.vue\d*\.js$/.test(filePath)) {
    return true
  }
  // Vite virtual helper modules (_virtual/_plugin-vue_export-helper.js)
  if (rel.includes('_virtual/')) {
    return true
  }
  return false
}

/**
 * Checks that every non-chunk .js file in dist/ has a corresponding .d.ts file.
 */
function validateDtsParity(
  packageName: string,
  distDir: string,
): { errors: ValidationError[], jsCount: number, dtsCount: number, chunkCount: number } {
  const errors: ValidationError[] = []
  const allFiles = collectFiles(distDir)

  const allJsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
  const jsFiles = allJsFiles.filter(f => !isViteChunk(f))
  const chunkCount = allJsFiles.length - jsFiles.length
  const dtsFiles = new Set(allFiles.filter(f => f.endsWith('.d.ts') || f.endsWith('.d.mts')))

  for (const jsFile of jsFiles) {
    // Convert .js → .d.ts and .mjs → .d.mts
    const dtsFile = jsFile.endsWith('.mjs')
      ? jsFile.replace(/\.mjs$/, '.d.mts')
      : jsFile.replace(/\.js$/, '.d.ts')

    if (!dtsFiles.has(dtsFile)) {
      errors.push({
        package: packageName,
        file: relative(ROOT, jsFile),
        message: `Missing .d.ts for ${relative(ROOT, jsFile)} (expected ${relative(ROOT, dtsFile)})`,
      })
    }
  }

  return { errors, jsCount: jsFiles.length, dtsCount: dtsFiles.size, chunkCount }
}

/**
 * Reads dist/index.d.ts and checks that it contains export statements
 * covering the major categories declared in the manifest.
 */
function validateIndexDtsExports(
  packageName: string,
  distDir: string,
  manifest: Manifest,
): ValidationError[] {
  const errors: ValidationError[] = []
  const indexDts = resolve(distDir, 'index.d.ts')

  if (!existsSync(indexDts)) {
    errors.push({
      package: packageName,
      file: relative(ROOT, indexDts),
      message: `Root declaration file missing: ${relative(ROOT, indexDts)}`,
    })
    return errors
  }

  const content = readFileSync(indexDts, 'utf-8')

  // Check that the index.d.ts contains at least one export statement
  if (!/export\s/.test(content)) {
    errors.push({
      package: packageName,
      file: relative(ROOT, indexDts),
      message: 'Root index.d.ts contains no export statements',
    })
    return errors
  }

  // Collect all `export * from '...'` re-export paths (resolved to dist/)
  const starReExportPaths = new Set<string>()
  const starRe = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g
  let reMatch = starRe.exec(content)
  while (reMatch !== null) {
    if (reMatch[1] !== undefined) {
      // Resolve relative to dist dir, normalizing .ts → .d.ts for matching
      const resolved = resolve(distDir, reMatch[1])
      starReExportPaths.add(resolved)
    }
    reMatch = starRe.exec(content)
  }

  // For each manifest category, verify that at least one symbol is reachable —
  // either by direct name in the index.d.ts OR via a `export *` re-export whose
  // path covers the manifest entry's directory.
  const categories: Array<{ name: string, entries: Record<string, ManifestEntry> }> = [
    { name: 'components', entries: manifest.exports.components },
    { name: 'composables', entries: manifest.exports.composables },
    { name: 'utilities', entries: manifest.exports.utilities },
  ]

  for (const cat of categories) {
    const entryNames = Object.keys(cat.entries)
    if (entryNames.length === 0) {
      continue
    }

    // Collect all declared export symbols from this category
    const allSymbols: string[] = []
    for (const entry of Object.values(cat.entries)) {
      allSymbols.push(...entry.exports)
    }

    if (allSymbols.length === 0) {
      continue
    }

    // Check 1: Does any symbol name appear directly in the content?
    const directHit = allSymbols.some(symbol => content.includes(symbol))
    if (directHit) {
      continue
    }

    // Check 2: Do any `export *` re-exports cover the manifest entry paths?
    // Manifest paths are like "./src/components/buttons/index.ts" — in dist
    // they become "./components/buttons/index.ts" (src/ stripped).
    const coveredByReExport = Object.values(cat.entries).some((entry) => {
      // Convert manifest source path to dist-relative path
      const distRelative = entry.path.replace(/^\.\/src\//, './')
      const resolved = resolve(distDir, distRelative)
      return starReExportPaths.has(resolved)
    })

    if (!coveredByReExport) {
      errors.push({
        package: packageName,
        file: relative(ROOT, indexDts),
        message: `Category "${cat.name}" has ${allSymbols.length} declared exports but none found in index.d.ts (no direct symbols or re-export paths match)`,
      })
    }
  }

  return errors
}

// --- Main ---

function main(): void {
  const allErrors: ValidationError[] = []
  let totalJs = 0
  let totalDts = 0
  let skippedCount = 0

  console.warn('Declaration file (.d.ts) validation\n')

  for (const pkg of PACKAGES) {
    // Check manifest exists
    if (!existsSync(pkg.manifestPath)) {
      console.warn(`  SKIP  ${pkg.name} — manifest not found: ${relative(ROOT, pkg.manifestPath)}`)
      skippedCount++
      continue
    }

    // Gracefully handle pre-build state
    if (!existsSync(pkg.distDir) || !statSync(pkg.distDir).isDirectory()) {
      console.warn(`  SKIP  ${pkg.name} — dist/ not found (run build first)`)
      skippedCount++
      continue
    }

    const raw = readFileSync(pkg.manifestPath, 'utf-8')
    const manifest: Manifest = JSON.parse(raw) as Manifest

    console.warn(`Validating ${pkg.name} (${relative(ROOT, pkg.distDir)})`)

    // Check 1: .js → .d.ts parity (excludes Vite SFC chunks)
    const { errors: parityErrors, jsCount, dtsCount, chunkCount } = validateDtsParity(pkg.name, pkg.distDir)
    allErrors.push(...parityErrors)
    totalJs += jsCount
    totalDts += dtsCount

    const parityStatus = parityErrors.length === 0 ? 'PASS' : 'FAIL'
    console.warn(`  ${parityStatus}  .d.ts parity: ${jsCount} .js files, ${dtsCount} .d.ts files, ${parityErrors.length} missing (${chunkCount} Vite chunks skipped)`)

    // Check 2: index.d.ts export coverage
    const indexErrors = validateIndexDtsExports(pkg.name, pkg.distDir, manifest)
    allErrors.push(...indexErrors)

    const indexStatus = indexErrors.length === 0 ? 'PASS' : 'FAIL'
    console.warn(`  ${indexStatus}  index.d.ts export coverage`)
  }

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Total: ${totalJs} .js files, ${totalDts} .d.ts files`)

  if (skippedCount > 0) {
    console.warn(`Skipped: ${skippedCount} package(s) — run build first to validate.`)
  }

  if (allErrors.length === 0) {
    console.warn(`\nDeclaration file validation passed: 0 errors`)
    process.exit(0)
  }

  console.error(`\nDeclaration file validation FAILED: ${allErrors.length} error(s)\n`)

  for (const err of allErrors) {
    console.error(`  [${err.package}] ${err.file}`)
    console.error(`    ${err.message}\n`)
  }

  process.exit(1)
}

main()
