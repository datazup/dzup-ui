/**
 * Entry-barrel export discovery (TASK-OSS-P0-01).
 *
 * The ownership manifest's first authority is *what the package actually
 * exports*, which is the transitive closure of its entry barrels — not the
 * hand-maintained `public-api.manifest.json`. The two are compared, and a
 * disagreement is reported as evidence rather than silently resolved: the
 * committed Core barrel currently re-exports three composables the public-api
 * manifest does not list, and that drift is precisely what P0 exists to surface.
 *
 * This is a deliberately small ES-module re-export reader, not a TypeScript
 * parser. It understands the four forms the repo's generated and hand-written
 * barrels actually use:
 *
 *   export * from './x.ts'
 *   export { a, b as c } from './x.ts'
 *   export type { T } from './x.ts'
 *   export { default as DzButton } from './DzButton.vue'
 *
 * plus local declarations (`export const/function/class/interface/type/enum`).
 * Anything it cannot read is reported through {@link ModuleExportScan.unreadable}
 * so a silent miss cannot be mistaken for "this package exports nothing there".
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/** One discovered export, with the file that declared it. */
export interface DiscoveredExport {
  symbol: string
  /** Absolute path of the module that declares (or re-exports) the symbol. */
  declaredIn: string
  /** True when the export was written as `export type` / `export interface`. */
  typeOnly: boolean
}

export interface ModuleExportScan {
  /** symbol → discovery record. First declaration wins; barrels are visited depth-first. */
  exports: Map<string, DiscoveredExport>
  /** Modules that were referenced but could not be resolved on disk. */
  unreadable: string[]
}

/** `export * from '<spec>'` — no namespace form; the repo does not use one. */
const STAR_RE = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g

/** `export [type] { … } [from '<spec>']` — the brace body is captured verbatim. */
const NAMED_RE = /export\s+(type\s+)?\{([^}]*)\}\s*(?:from\s+['"]([^'"]+)['"])?/g

/** `export const X` / `export function X` / `export async function X` / … */
const DECL_RE
  = /export\s+(?:declare\s+)?(?:async\s+)?(const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g

/**
 * Resolve a relative module specifier against the importing file.
 *
 * The repo mandates explicit extensions (CLAUDE.md rule 5), so the common case
 * is a direct hit; the extension probes exist only so a specifier written
 * without one still resolves instead of being reported unreadable.
 */
function resolveSpecifier(fromFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith('.'))
    return undefined

  const base = resolve(dirname(fromFile), specifier)
  const candidates = [base, `${base}.ts`, `${base}.vue`, `${base}/index.ts`]
  return candidates.find(candidate => existsSync(candidate))
}

/**
 * Parse one brace body (`a, b as c, type T, default as D`) into exported names.
 * The *exported* name is what consumers import, so `b as c` yields `c`.
 */
export function parseNamedClause(body: string): { symbol: string, typeOnly: boolean }[] {
  const out: { symbol: string, typeOnly: boolean }[] = []
  for (const rawPart of body.split(',')) {
    const part = rawPart.trim()
    if (part === '')
      continue

    const typeOnly = part.startsWith('type ')
    const withoutType = typeOnly ? part.slice(5).trim() : part
    const asIndex = withoutType.search(/\sas\s/)
    const symbol = (asIndex === -1 ? withoutType : withoutType.slice(asIndex + 4)).trim()
    if (symbol !== '' && symbol !== 'default')
      out.push({ symbol, typeOnly })
  }
  return out
}

/**
 * Walk a barrel and everything it re-exports.
 *
 * `.vue` files are terminal: their default export is named by the re-exporting
 * barrel (`export { default as DzButton }`), so there is nothing further to read.
 */
export function scanModuleExports(entry: string): ModuleExportScan {
  const exports = new Map<string, DiscoveredExport>()
  const unreadable: string[] = []
  const visited = new Set<string>()

  const visit = (file: string): void => {
    if (visited.has(file) || file.endsWith('.vue'))
      return
    visited.add(file)

    if (!existsSync(file)) {
      unreadable.push(file)
      return
    }

    const source = readFileSync(file, 'utf8')
    const record = (symbol: string, declaredIn: string, typeOnly: boolean): void => {
      if (!exports.has(symbol))
        exports.set(symbol, { symbol, declaredIn, typeOnly })
    }

    NAMED_RE.lastIndex = 0
    for (const match of source.matchAll(NAMED_RE)) {
      const clauseTypeOnly = match[1] !== undefined
      const specifier = match[3]
      // A bare specifier (`export type { Orientation } from '@dzup-ui/contracts'`)
      // is a real re-export of another package's symbol through this barrel: the
      // symbol belongs in the manifest, attributed to the package it came from.
      const external = specifier !== undefined && !specifier.startsWith('.')
      const target = specifier === undefined
        ? file
        : external ? specifier : resolveSpecifier(file, specifier)

      if (target === undefined) {
        unreadable.push(`${file} → ${specifier}`)
        continue
      }
      for (const { symbol, typeOnly } of parseNamedClause(match[2] ?? ''))
        record(symbol, target, clauseTypeOnly || typeOnly)
    }

    DECL_RE.lastIndex = 0
    for (const match of source.matchAll(DECL_RE)) {
      const keyword = match[1] ?? ''
      record(match[2] ?? '', file, keyword === 'type' || keyword === 'interface')
    }

    STAR_RE.lastIndex = 0
    for (const match of source.matchAll(STAR_RE)) {
      const target = resolveSpecifier(file, match[1] ?? '')
      if (target === undefined) {
        unreadable.push(`${file} → ${match[1]}`)
        continue
      }
      visit(target)
    }
  }

  visit(entry)
  return { exports, unreadable }
}
