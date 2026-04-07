/**
 * Import Boundary Validator
 *
 * Scans all .ts and .vue files in packages/ and enforces the dependency rules:
 *   - tokens    -> no deps on contracts, core, compat
 *   - contracts -> tokens types only (no core, compat)
 *   - core      -> tokens + contracts only (no compat)
 *   - compat    -> core + contracts + tokens
 *   - No deep imports into other packages (only through public exports)
 *
 * Usage:
 *   tsx packages/tooling/src/validators/import-boundary.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types ---

interface Violation {
  file: string
  line: number
  importPath: string
  reason: string
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const PACKAGES_DIR = resolve(ROOT, 'packages')

/** Package names that are part of the monorepo */
const PACKAGE_NAMES = ['tokens', 'contracts', 'core', 'compat', 'codemods', 'tooling'] as const
type PackageName = typeof PACKAGE_NAMES[number]

/**
 * Allowed @dzup-ui/* dependencies for each package.
 * If a package is not listed, it has no allowed cross-package imports.
 */
const ALLOWED_DEPS: Record<PackageName, readonly PackageName[]> = {
  tokens: [],
  contracts: ['tokens'],
  core: ['tokens', 'contracts'],
  compat: ['tokens', 'contracts', 'core'],
  codemods: ['tokens', 'contracts', 'core', 'compat'],
  tooling: [],
}

/** Regex to match @dzup-ui/ imports, including deep imports */
const DZUP_IMPORT_RE = /(?:from\s|import\s*\(?)['"](@dzup-ui\/[^'"]+)['"]/g

/** Regex to extract the package name from a @dzup-ui/ path */
const PACKAGE_NAME_RE = /^@dzup-ui\/([\w-]+)/

/** Deep import pattern: @dzup-ui/pkg/anything-beyond-root */
const DEEP_IMPORT_RE = /^@dzup-ui\/[\w-]+\/.+/

// --- File scanning ---

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []

  function walk(currentDir: string): void {
    let entries: string[]
    try {
      entries = readdirSync(currentDir)
    }
    catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry)

      // Skip node_modules, dist, .git
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') {
        continue
      }

      let stat
      try {
        stat = statSync(fullPath)
      }
      catch {
        continue
      }

      if (stat.isDirectory()) {
        walk(fullPath)
      }
      else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

function detectPackage(filePath: string): PackageName | undefined {
  const rel = relative(PACKAGES_DIR, filePath)
  const firstSegment = rel.split('/')[0]
  if (PACKAGE_NAMES.includes(firstSegment as PackageName)) {
    return firstSegment as PackageName
  }
  return undefined
}

// --- Validation ---

function validateFile(filePath: string): Violation[] {
  const violations: Violation[] = []
  const pkg = detectPackage(filePath)

  if (pkg === undefined) {
    return violations
  }

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const allowed = ALLOWED_DEPS[pkg]

  let inBlockComment = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined)
      continue

    // Track multi-line comment state
    if (inBlockComment) {
      if (line.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    // Check for block comment start
    const blockStart = line.indexOf('/*')
    const blockEnd = line.indexOf('*/')
    if (blockStart !== -1 && (blockEnd === -1 || blockEnd < blockStart)) {
      inBlockComment = true
      continue
    }

    // Skip single-line comments: lines that are just comments
    const trimmed = line.trimStart()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
      continue
    }

    // Reset regex lastIndex for each line
    DZUP_IMPORT_RE.lastIndex = 0
    let match: RegExpExecArray | null = DZUP_IMPORT_RE.exec(line)

    while (match !== null) {
      const importPath = match[1]
      if (importPath === undefined) {
        match = DZUP_IMPORT_RE.exec(line)
        continue
      }

      const pkgMatch = PACKAGE_NAME_RE.exec(importPath)
      if (pkgMatch === null || pkgMatch[1] === undefined) {
        match = DZUP_IMPORT_RE.exec(line)
        continue
      }

      const importedPkg = pkgMatch[1] as PackageName

      // Self-imports are allowed (a package can import from itself)
      if (importedPkg === pkg) {
        match = DZUP_IMPORT_RE.exec(line)
        continue
      }

      // Check: is this an allowed dependency?
      if (!allowed.includes(importedPkg)) {
        violations.push({
          file: relative(ROOT, filePath),
          line: i + 1,
          importPath,
          reason: `Package "${pkg}" cannot import from "@dzup-ui/${importedPkg}". Allowed: ${allowed.length > 0 ? allowed.map(a => `@dzup-ui/${a}`).join(', ') : 'none'}`,
        })
      }

      // Check: no deep imports into OTHER packages
      if (DEEP_IMPORT_RE.test(importPath)) {
        violations.push({
          file: relative(ROOT, filePath),
          line: i + 1,
          importPath,
          reason: `Deep import into "${importPath}" is forbidden. Import from the package root "@dzup-ui/${importedPkg}" instead.`,
        })
      }

      match = DZUP_IMPORT_RE.exec(line)
    }
  }

  return violations
}

// --- Main ---

function main(): void {
  const allViolations: Violation[] = []

  for (const pkgName of PACKAGE_NAMES) {
    const pkgSrcDir = resolve(PACKAGES_DIR, pkgName, 'src')
    const files = collectFiles(pkgSrcDir, ['.ts', '.vue'])

    for (const file of files) {
      const violations = validateFile(file)
      allViolations.push(...violations)
    }
  }

  if (allViolations.length === 0) {
    console.warn('Import boundary check passed: 0 violations')
    process.exit(0)
  }

  console.error(`Import boundary violations found: ${allViolations.length}\n`)

  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}`)
    console.error(`    import: ${v.importPath}`)
    console.error(`    reason: ${v.reason}\n`)
  }

  process.exit(1)
}

main()
