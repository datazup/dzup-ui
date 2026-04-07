/**
 * Declaration File (.d.ts) Validator
 *
 * For each publishable package validates that:
 *   1. dist/ directories exist (skip with warning if not — pre-build state)
 *   2. Every .js file in dist/ has a corresponding .d.ts file
 *      (Vite SFC runtime chunks are excluded from this check for Vue packages)
 *   3. The root declaration file (dist/index.d.ts or dist/module.d.ts for nuxt)
 *      contains at least one export statement
 *
 * Covers all 6 publishable packages: contracts, tokens, core, compat, codemods, nuxt.
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

interface PackageDef {
  name: string
  distDir: string
  /** Filename of the root declaration file inside distDir (default: "index.d.ts") */
  rootDts?: string
  /** Whether to apply Vite SFC chunk exclusion (Vue packages only) */
  hasViteChunks?: boolean
  /** Optional path to public-api.manifest.json — used only for index.d.ts export coverage */
  manifestPath?: string
}

const PACKAGES: PackageDef[] = [
  {
    name: '@dzip-ui/contracts',
    distDir: resolve(ROOT, 'packages/contracts/dist'),
  },
  {
    name: '@dzip-ui/tokens',
    distDir: resolve(ROOT, 'packages/tokens/dist'),
  },
  {
    name: '@dzip-ui/core',
    distDir: resolve(ROOT, 'packages/core/dist'),
    hasViteChunks: true,
    manifestPath: resolve(ROOT, 'packages/core/manifests/public-api.manifest.json'),
  },
  {
    name: '@dzip-ui/compat',
    distDir: resolve(ROOT, 'packages/compat/dist'),
    hasViteChunks: true,
  },
  {
    name: '@dzip-ui/codemods',
    distDir: resolve(ROOT, 'packages/codemods/dist'),
  },
  {
    name: '@dzip-ui/nuxt',
    distDir: resolve(ROOT, 'packages/nuxt/dist'),
    rootDts: 'module.d.ts',
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
 * Pass `hasViteChunks: true` for Vue (Vite-built) packages to skip SFC runtime chunks.
 */
function validateDtsParity(
  packageName: string,
  distDir: string,
  hasViteChunks = false,
): { errors: ValidationError[], jsCount: number, dtsCount: number, chunkCount: number } {
  const errors: ValidationError[] = []
  const allFiles = collectFiles(distDir)

  const allJsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
  const jsFiles = hasViteChunks ? allJsFiles.filter(f => !isViteChunk(f)) : allJsFiles
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
 * Reads the root declaration file and checks that it contains export statements.
 * For manifest-backed packages (core), also verifies category coverage.
 * For manifest-less packages, only verifies that exports exist (non-empty barrel).
 */
function validateRootDtsExports(
  packageName: string,
  distDir: string,
  rootDtsName: string,
  manifest: Manifest | null,
): ValidationError[] {
  const errors: ValidationError[] = []
  const rootDts = resolve(distDir, rootDtsName)

  if (!existsSync(rootDts)) {
    errors.push({
      package: packageName,
      file: relative(ROOT, rootDts),
      message: `Root declaration file missing: ${relative(ROOT, rootDts)}`,
    })
    return errors
  }

  const content = readFileSync(rootDts, 'utf-8')

  // Check that the root .d.ts contains at least one export statement
  if (!/export[\s{*]/.test(content)) {
    errors.push({
      package: packageName,
      file: relative(ROOT, rootDts),
      message: `Root ${rootDtsName} contains no export statements`,
    })
    return errors
  }

  // For manifest-less packages, the above check is sufficient
  if (manifest === null) {
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
        file: relative(ROOT, rootDts),
        message: `Category "${cat.name}" has ${allSymbols.length} declared exports but none found in ${rootDtsName} (no direct symbols or re-export paths match)`,
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
    // Gracefully handle pre-build state
    if (!existsSync(pkg.distDir) || !statSync(pkg.distDir).isDirectory()) {
      console.warn(`  SKIP  ${pkg.name} — dist/ not found (run build first)`)
      skippedCount++
      continue
    }

    // Load manifest if available (core only)
    let manifest: Manifest | null = null
    if (pkg.manifestPath !== undefined) {
      if (!existsSync(pkg.manifestPath)) {
        console.warn(`  SKIP  ${pkg.name} — manifest not found: ${relative(ROOT, pkg.manifestPath)}`)
        skippedCount++
        continue
      }
      const raw = readFileSync(pkg.manifestPath, 'utf-8')
      manifest = JSON.parse(raw) as Manifest
    }

    const rootDtsName = pkg.rootDts ?? 'index.d.ts'
    console.warn(`Validating ${pkg.name} (${relative(ROOT, pkg.distDir)})`)

    // Check 1: .js → .d.ts parity
    const { errors: parityErrors, jsCount, dtsCount, chunkCount } = validateDtsParity(
      pkg.name,
      pkg.distDir,
      pkg.hasViteChunks ?? false,
    )
    allErrors.push(...parityErrors)
    totalJs += jsCount
    totalDts += dtsCount

    const chunkNote = chunkCount > 0 ? ` (${chunkCount} Vite chunks skipped)` : ''
    const parityStatus = parityErrors.length === 0 ? 'PASS' : 'FAIL'
    console.warn(`  ${parityStatus}  .d.ts parity: ${jsCount} .js files, ${dtsCount} .d.ts files, ${parityErrors.length} missing${chunkNote}`)

    // Check 2: root declaration file export coverage
    const rootErrors = validateRootDtsExports(pkg.name, pkg.distDir, rootDtsName, manifest)
    allErrors.push(...rootErrors)

    const rootStatus = rootErrors.length === 0 ? 'PASS' : 'FAIL'
    console.warn(`  ${rootStatus}  ${rootDtsName} export coverage`)
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
