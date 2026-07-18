/**
 * Export-map target validation.
 *
 * A package's `exports` map is a contract with consumers: every declared target
 * must exist in the published tarball. The manifest validator (validate-exports.ts)
 * only ever checked JS/DTS *source* symbols, so a target like
 *
 *   "./styles": "./dist/core.css"
 *
 * — a plain string, not a `{ types, import }` object — was never checked at all.
 * `@dzup-ui/core` shipped that line for months while the build emitted no CSS.
 *
 * This module walks EVERY leaf of the exports map (string targets, condition
 * objects, fallback arrays, nested subpaths) plus the legacy `main`/`module`/
 * `types` fields, and asserts each resolves to a file on disk.
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

/** A single resolved leaf of an `exports` map. */
export interface ExportTarget {
  /** The subpath key, e.g. "." or "./styles". */
  subpath: string
  /** Condition keys walked to reach this leaf, e.g. ["import"]. Empty for a plain string target. */
  conditions: string[]
  /** The declared target path, e.g. "./dist/core.css". */
  target: string
}

export interface ExportTargetError {
  subpath: string
  conditions: string[]
  target: string
  message: string
}

export interface PackageExportsJson {
  name?: string
  exports?: unknown
  main?: string
  module?: string
  types?: string
  private?: boolean
}

export interface ValidateResult {
  errors: ExportTargetError[]
  /** Number of leaf targets checked. */
  checked: number
  /**
   * True when the package has no `dist/` at all, so dist-targeted checks were
   * skipped. Callers running post-build should treat this as an error — see
   * `requireBuilt`.
   */
  skippedUnbuilt: boolean
}

/**
 * Recursively walks an `exports` field and returns every leaf target string.
 *
 * Handles all four shapes the Node resolution spec allows:
 *   - sugar string:      "exports": "./dist/index.js"
 *   - subpath keys:      { ".": …, "./styles": … }        (keys starting with ".")
 *   - condition keys:    { "types": …, "import": … }      (everything else)
 *   - fallback arrays:   { "import": ["./a.js", "./b.js"] }
 *   - `null` (blocked subpath) yields nothing.
 */
export function collectExportTargets(
  exportsField: unknown,
  subpath = '.',
  conditions: string[] = [],
): ExportTarget[] {
  if (exportsField === null || exportsField === undefined)
    return []

  if (typeof exportsField === 'string')
    return [{ subpath, conditions, target: exportsField }]

  if (Array.isArray(exportsField))
    return exportsField.flatMap(entry => collectExportTargets(entry, subpath, conditions))

  if (typeof exportsField !== 'object')
    return []

  return Object.entries(exportsField as Record<string, unknown>).flatMap(([key, value]) =>
    key.startsWith('.')
      // A subpath key: replaces the subpath, conditions reset.
      ? collectExportTargets(value, key, conditions)
      // A condition key: same subpath, deeper condition chain.
      : collectExportTargets(value, subpath, [...conditions, key]),
  )
}

/** Recursively lists files under `dir`, as paths relative to `dir` with POSIX separators. */
function listFiles(dir: string, prefix = ''): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.'))
      continue
    const abs = join(dir, name)
    const rel = prefix === '' ? name : `${prefix}/${name}`
    if (statSync(abs).isDirectory())
      out.push(...listFiles(abs, rel))
    else
      out.push(rel)
  }
  return out
}

/**
 * Resolves a target that contains a `*` wildcard. Node substitutes the same
 * string into every `*` in the target, so we check that AT LEAST ONE file
 * matches the pattern — an exports wildcard that matches nothing is dead.
 */
function wildcardMatches(packageDir: string, target: string): boolean {
  const cleaned = target.replace(/^\.\//, '')
  const root = cleaned.split('/')[0] ?? ''
  const searchRoot = resolve(packageDir, root)
  if (!existsSync(searchRoot))
    return false

  // `*` in an exports target matches across path segments.
  const pattern = new RegExp(`^${cleaned.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+')}$`)
  const base = statSync(searchRoot).isDirectory() ? searchRoot : packageDir
  const rootPrefix = base === searchRoot ? `${root}/` : ''

  return listFiles(base).some(file => pattern.test(`${rootPrefix}${file}`))
}

/**
 * Validates that every target in a package's export map exists on disk.
 *
 * With `requireBuilt`, a missing `dist/` is an ERROR rather than a skip. Pass it
 * when running after `yarn build` — otherwise an unbuilt tree would silently
 * report "0 errors", which is exactly the failure mode this module exists to
 * prevent.
 */
export function validatePackageExportMap(
  packageDir: string,
  pkgJson: PackageExportsJson,
  { requireBuilt = false }: { requireBuilt?: boolean } = {},
): ValidateResult {
  const errors: ExportTargetError[] = []

  const targets: ExportTarget[] = [
    ...collectExportTargets(pkgJson.exports),
    // The legacy fields are the same contract for older resolvers.
    ...(['main', 'module', 'types'] as const).flatMap((field): ExportTarget[] => {
      const value = pkgJson[field]
      return typeof value === 'string'
        ? [{ subpath: field, conditions: [], target: value }]
        : []
    }),
  ]

  if (targets.length === 0)
    return { errors, checked: 0, skippedUnbuilt: false }

  const distDir = resolve(packageDir, 'dist')
  const distMissing = !existsSync(distDir)
  const needsDist = targets.some(t => t.target.replace(/^\.\//, '').startsWith('dist/'))

  if (distMissing && needsDist && !requireBuilt)
    return { errors, checked: 0, skippedUnbuilt: true }

  for (const { subpath, conditions, target } of targets) {
    // Node requires export targets to be relative specifiers starting with "./".
    if (!target.startsWith('./')) {
      errors.push({ subpath, conditions, target, message: `target must start with "./" (got "${target}")` })
      continue
    }

    const exists = target.includes('*')
      ? wildcardMatches(packageDir, target)
      : existsSync(resolve(packageDir, target))

    if (!exists) {
      errors.push({
        subpath,
        conditions,
        target,
        message: target.includes('*')
          ? `no file matches wildcard target ${target}`
          : `file does not exist: ${relative(packageDir, resolve(packageDir, target)).split(sep).join('/')}`,
      })
    }
  }

  return { errors, checked: targets.length, skippedUnbuilt: false }
}
