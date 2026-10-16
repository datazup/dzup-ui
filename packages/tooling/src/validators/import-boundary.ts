/**
 * Import Boundary Validator
 *
 * Scans all .ts and .vue files in packages/ and enforces the dependency rules:
 *   - tokens    -> no deps on contracts, core, compat
 *   - contracts -> tokens types only (no core, compat)
 *   - core      -> tokens + contracts only (no compat)
 *   - compat    -> core + contracts + tokens
 *   - No deep imports into other packages (only through public exports)
 *   - No relative import that leaves its own package (`../../../testing/src/…`)
 *     unless RELATIVE_SOURCE_READS names the pair and says why
 *   - Every directory under packages/ with a package.json is scanned; one with
 *     no ALLOWED_DEPS row is itself a violation (UI-DZUP-UI-ARCH-M-04)
 *
 * Usage:
 *   tsx packages/tooling/src/validators/import-boundary.ts
 *
 * Exit code 1 if violations found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
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

/**
 * Package directories that are part of the monorepo, derived from
 * `packages/<dir>/package.json` rather than written down: a hand-kept list
 * silently omitted testing, mcp and nuxt, so their imports were never checked.
 */
const PACKAGE_NAMES: readonly string[] = readdirSync(PACKAGES_DIR)
  .filter(entry => existsSync(join(PACKAGES_DIR, entry, 'package.json')))
  .sort()
type PackageName = string

/**
 * Allowed @dzup-ui/* dependencies for each package.
 * A package directory with no row here is reported, not waved through.
 */
const ALLOWED_DEPS: Readonly<Record<PackageName, readonly PackageName[]>> = {
  tokens: [],
  contracts: ['tokens'],
  core: ['tokens', 'contracts'],
  compat: ['tokens', 'contracts', 'core'],
  codemods: ['tokens', 'contracts', 'core', 'compat'],
  // Published, framework-free test helpers: a consumer installs them without
  // the component library, so they import no other package at runtime.
  testing: [],
  // Published MCP server: it serves generated docs data and imports no package.
  mcp: [],
  // Published Nuxt module: registers Core's components and injects Core's
  // theme script; the ownership diagnostics come from contracts.
  nuxt: ['tokens', 'contracts', 'core'],
  // Private, never published: the generators and validators here exist to read
  // the component packages (ownership, capability and quality matrices, perf
  // tier fixtures, published-import checks).
  tooling: ['tokens', 'contracts', 'core'],
}

/**
 * Relative imports that deliberately cross into another package's source, by
 * importing package → imported package, each with its reason. Anything not
 * named here that leaves its own package root fails the gate.
 */
const RELATIVE_SOURCE_READS: Readonly<Record<PackageName, Readonly<Record<PackageName, string>>>> = {
  tooling: {
    contracts: 'private validators read contract source so a gate never depends on a stale build',
    core: 'i18n and sanitizer validators check Core\'s source of truth, not a possibly stale dist',
    testing: 'security-corpus, security-conformance and resolution gates run the published helpers from source',
    tokens: 'DTCG and design.md checks walk the token source modules themselves',
  },
}

/** Regex to match @dzup-ui/ imports, including deep imports */
const DZUP_IMPORT_RE = /(?:from\s|import\s*\(?)['"](@dzup-ui\/[^'"]+)['"]/g

/** Regex to extract the package name from a @dzup-ui/ path */
const PACKAGE_NAME_RE = /^@dzup-ui\/([\w-]+)/

/** Regex to match relative specifiers that climb at least one directory */
const RELATIVE_IMPORT_RE = /(?:from\s|import\s*\(?)['"](\.\.\/[^'"]*)['"]/g

/** Deep import pattern: @dzup-ui/pkg/anything-beyond-root */
const DEEP_IMPORT_RE = /^@dzup-ui\/[\w-]+\/.+/

const exportKeysCache = new Map<string, ReadonlySet<string>>()

/**
 * Subpaths a package publishes through its `exports` map (`./forms` etc.).
 * Importing one of them is the public API, not a deep import.
 */
function exportKeys(pkg: string): ReadonlySet<string> {
  let keys = exportKeysCache.get(pkg)
  if (keys === undefined) {
    try {
      const manifest = JSON.parse(readFileSync(join(PACKAGES_DIR, pkg, 'package.json'), 'utf-8')) as { exports?: unknown }
      keys = new Set(typeof manifest.exports === 'object' && manifest.exports !== null ? Object.keys(manifest.exports) : [])
    }
    catch {
      keys = new Set()
    }
    exportKeysCache.set(pkg, keys)
  }
  return keys
}

function isDeepImport(importPath: string, importedPkg: string): boolean {
  if (!DEEP_IMPORT_RE.test(importPath))
    return false
  const subpath = `.${importPath.slice(`@dzup-ui/${importedPkg}`.length)}`
  return !exportKeys(importedPkg).has(subpath)
}

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

      // Skip node_modules, dist, .git and fixture inputs (not shipped code)
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git' || entry === '__fixtures__') {
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
  const firstSegment = rel.split(sep)[0]
  if (firstSegment !== undefined && PACKAGE_NAMES.includes(firstSegment)) {
    return firstSegment
  }
  return undefined
}

/**
 * The package a relative specifier lands in when it leaves `pkg`, or
 * `undefined` when it stays inside its own package root (or lands outside
 * packages/ entirely, e.g. a hoisted node_modules path, which is not a
 * package boundary).
 */
function relativeTargetPackage(filePath: string, specifier: string, pkg: PackageName): PackageName | undefined {
  const target = relative(PACKAGES_DIR, resolve(dirname(filePath), specifier))
  const [first, second] = target.split(sep)
  if (first === undefined || first === '..' || first === pkg || second === 'node_modules')
    return undefined
  return PACKAGE_NAMES.includes(first) ? first : undefined
}

// --- Validation ---

function validateFile(filePath: string): Violation[] {
  const violations: Violation[] = []
  const pkg = detectPackage(filePath)

  if (pkg === undefined) {
    return violations
  }

  if (/\.(?:spec|test)\.ts$/.test(filePath)) {
    return violations
  }

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const allowed = ALLOWED_DEPS[pkg] ?? []
  const relativeReads = RELATIVE_SOURCE_READS[pkg] ?? {}

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
    if (trimmed.startsWith('`') || trimmed.startsWith('\'') || trimmed.startsWith(String.fromCharCode(34))) {
      continue
    }

    // Relative specifiers that leave the package: the @dzup-ui/ check below
    // cannot see `../../../testing/src/x.ts`, which is the same edge spelled
    // so that no gate reads it.
    for (const relativeMatch of line.matchAll(RELATIVE_IMPORT_RE)) {
      const specifier = relativeMatch[1]
      if (specifier === undefined)
        continue
      const targetPkg = relativeTargetPackage(filePath, specifier, pkg)
      if (targetPkg === undefined || relativeReads[targetPkg] !== undefined)
        continue
      violations.push({
        file: relative(ROOT, filePath),
        line: i + 1,
        importPath: specifier,
        reason: `Relative import leaves package "${pkg}" for "${targetPkg}". Import "@dzup-ui/${targetPkg}" through its exports`
          + `${allowed.includes(targetPkg) ? '' : ` (and "${pkg}" may not depend on it at all)`}, or record the pair in RELATIVE_SOURCE_READS with a reason.`,
      })
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

      const importedPkg = pkgMatch[1]

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

      // Check: no deep imports into OTHER packages beyond their exports map
      if (isDeepImport(importPath, importedPkg)) {
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
    if (ALLOWED_DEPS[pkgName] === undefined) {
      allViolations.push({
        file: `packages/${pkgName}/package.json`,
        line: 1,
        importPath: `@dzup-ui/${pkgName}`,
        reason: `Package "${pkgName}" has no ALLOWED_DEPS row. Declare which packages it may import, so its imports are checked rather than ignored.`,
      })
    }

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
