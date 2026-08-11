/**
 * External Import Validation Script
 *
 * Asserts that every bare import a BUILT package emits is a dependency that
 * package DECLARES — and that nothing from node_modules got inlined into dist.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * Two failure modes, both of which shipped and neither of which any existing
 * gate could see. `validate:peers` checks that declared peers resolve; nothing
 * checked the other direction — that what dist actually imports is declared.
 *
 *   1. Bundled-in dependency. `qrcode-generator` was a declared dependency of
 *      @dzup-ui/core but missing from the hand-maintained externals list in
 *      tooling/src/vite.ts, so Rollup inlined it. Under `preserveModules` that
 *      emitted `import E from "../../node_modules/qrcode-generator/dist/qrcode.js"`
 *      into dist/components/media/DzQRCode.vue.js — a path that exists in the
 *      repo but NOT in the published tarball (`files: [dist]`). Importing the
 *      package barrel died with ERR_MODULE_NOT_FOUND for every consumer.
 *
 *   2. Undeclared runtime dependency. @floating-ui/vue was a devDependency and
 *      @internationalized/date was declared nowhere, yet 7 source files import
 *      them. Correctly externalized, so dist emitted bare imports for packages
 *      the consumer's installer was never told to install — the same
 *      ERR_MODULE_NOT_FOUND, reached from the opposite direction.
 *
 * Run AFTER a build; skips packages with no dist/ and says so.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-externals.ts
 *
 * Exit code 1 if any package inlines node_modules or imports something undeclared.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

// --- Types ---

interface PackageJson {
  name: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

interface Violation {
  kind: 'inlined' | 'undeclared'
  file: string
  specifier: string
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')
const PACKAGES_DIR = resolve(ROOT, 'packages')

/**
 * Node builtins are always available to a consumer and never belong in
 * package.json. Everything else must be declared.
 */
const BUILTIN_PREFIX = 'node:'

/**
 * Test files that ended up inside dist. They are never reachable from a package
 * entry, so their imports are not something a consumer can hit — a package
 * shipping its own specs is a `files`/build-exclude problem for a different
 * gate, not a broken-import one. Scanning them only produces noise
 * (`vitest`, `vue` from @dzup-ui/codemods' shipped __tests__ directory).
 */
const TEST_FILE_RE = /(?:^|\/)__tests__\/|\.(?:spec|test)\.js$/

// --- Helpers ---

/**
 * Every module specifier this file genuinely imports — static `import`/`export …
 * from`, side-effect `import '…'`, and dynamic `import('…')`.
 *
 * Parsed with the TypeScript scanner rather than pattern-matched, because two
 * hand-rolled attempts both produced false failures on real files here:
 *
 *   • A plain regex matched `import('tailwindcss')` inside an `@type {…}` JSDoc
 *     annotation in @dzup-ui/tokens, and the `import { X } from 'dzup-ui'`
 *     examples in @dzup-ui/codemods' JSDoc.
 *
 *   • A comment-stripping lexer still broke on @dzup-ui/codemods, where a regex
 *     literal containing a quote character flipped string parity for the rest of
 *     the file, so `prefix === 'from' || prefix === 'to'` on line 184 of
 *     story-color-tokens.js read as an import of " || prefix === ".
 *
 * An AST has no opinion to get wrong: a specifier counts only when the grammar
 * says it sits in import position.
 */
function importSpecifiers(source: string, fileName: string): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ESNext,
    /* setParentNodes */ false,
    ts.ScriptKind.JS,
  )

  const found: string[] = []

  const visit = (node: ts.Node): void => {
    // import … from '…'  /  export … from '…'  /  import '…'
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier !== undefined
      && ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text)
    }

    // import('…')
    if (
      ts.isCallExpression(node)
      && node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const arg = node.arguments[0]
      if (arg !== undefined && ts.isStringLiteral(arg))
        found.push(arg.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

function readPackageJson(dir: string): PackageJson | null {
  const pkgPath = resolve(dir, 'package.json')
  if (!existsSync(pkgPath))
    return null
  return JSON.parse(readFileSync(pkgPath, 'utf-8')) as PackageJson
}

/** Every `.js` file under `dir`, recursively. */
function jsFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...jsFiles(full))
    else if (entry.name.endsWith('.js'))
      out.push(full)
  }
  return out
}

/**
 * The package name a bare specifier belongs to — `@scope/pkg/sub` → `@scope/pkg`,
 * `pkg/sub` → `pkg`. Returns null for relative and absolute specifiers.
 */
function packageNameOf(specifier: string): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('/'))
    return null
  const parts = specifier.split('/')
  if (specifier.startsWith('@'))
    return parts.length >= 2 ? parts.slice(0, 2).join('/') : null
  return parts[0] ?? null
}

function checkPackage(dir: string, pkg: PackageJson): Violation[] | null {
  const distDir = resolve(dir, 'dist')
  if (!existsSync(distDir) || !statSync(distDir).isDirectory())
    return null

  const declared = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ])

  const violations: Violation[] = []

  for (const file of jsFiles(distDir)) {
    const rel = relative(ROOT, file).replace(/\\/g, '/')
    if (TEST_FILE_RE.test(rel))
      continue

    for (const specifier of importSpecifiers(readFileSync(file, 'utf-8'), rel)) {
      // A relative path that reaches into node_modules means Rollup inlined a
      // dependency instead of externalizing it. The path will not exist once
      // the package is packed.
      if (specifier.includes('node_modules/')) {
        violations.push({ kind: 'inlined', file: rel, specifier })
        continue
      }

      if (specifier.startsWith(BUILTIN_PREFIX))
        continue

      const name = packageNameOf(specifier)
      if (name === null || name === pkg.name)
        continue

      if (!declared.has(name))
        violations.push({ kind: 'undeclared', file: rel, specifier })
    }
  }

  return violations
}

// --- Main ---

function main(): void {
  console.warn('External import validation\n')

  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => resolve(PACKAGES_DIR, d.name))

  let checked = 0
  let skipped = 0
  const failures: Array<{ name: string, violations: Violation[] }> = []

  for (const dir of packageDirs) {
    const pkg = readPackageJson(dir)
    if (pkg === null)
      continue

    const violations = checkPackage(dir, pkg)
    if (violations === null) {
      console.warn(`  SKIP  ${pkg.name} — no dist/ (build first)`)
      skipped++
      continue
    }

    checked++
    if (violations.length === 0) {
      console.warn(`  PASS  ${pkg.name}`)
      continue
    }

    console.warn(`  FAIL  ${pkg.name} — ${violations.length} violation(s)`)
    failures.push({ name: pkg.name, violations })
  }

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Results: ${checked - failures.length} passed, ${failures.length} failed, ${skipped} skipped`)

  if (failures.length === 0) {
    console.warn('\nExternal import validation passed.')
    process.exit(0)
  }

  for (const { name, violations } of failures) {
    console.error(`\n${name}`)

    // Collapse to one line per (kind, specifier) — preserveModules repeats the
    // same bad import across many emitted chunks, and 1,200 identical lines
    // buries the actual finding.
    const grouped = new Map<string, { kind: Violation['kind'], specifier: string, files: string[] }>()
    for (const v of violations) {
      const key = `${v.kind}::${v.specifier}`
      const existing = grouped.get(key)
      if (existing === undefined)
        grouped.set(key, { kind: v.kind, specifier: v.specifier, files: [v.file] })
      else existing.files.push(v.file)
    }

    for (const { kind, specifier, files } of grouped.values()) {
      const where = files.length === 1 ? files[0] : `${files[0]} (+${files.length - 1} more)`

      if (kind === 'inlined') {
        console.error(`  INLINED     ${specifier}`)
        console.error(`              in ${where}`)
        console.error(`              → a dependency got bundled instead of externalized.`)
        console.error(`                This path does not exist in the published tarball.`)
        console.error(`                Declare it in package.json dependencies.`)
      }
      else {
        console.error(`  UNDECLARED  ${specifier}`)
        console.error(`              in ${where}`)
        console.error(`              → dist imports it, but package.json does not declare it.`)
        console.error(`                Consumers will hit ERR_MODULE_NOT_FOUND.`)
        console.error(`                Add it to dependencies (or peerDependencies).`)
      }
    }
  }

  console.error(`\nExternal import validation FAILED for ${failures.length} package(s).`)
  process.exit(1)
}

main()
