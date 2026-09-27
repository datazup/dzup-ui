/**
 * The public API surface, read from PACKED declarations (TASK-R1-O3).
 *
 * Ported from `ui/dzup-ui-pro/tools/release/api-surface.mjs` (Pro TASK-REL-01)
 * and adapted: OSS publishes **six** packages, not one, and its baseline is
 * `packages/core/manifests/public-api.manifest.json` rather than a Pro manifest.
 * No Pro code is imported — the forbidden direction — and no Pro path is read
 * at runtime.
 *
 * ## Why the declarations, and why packed
 *
 * Every existing gate in this repository reads the public surface from source.
 * `validate:exports` resolves the `exports` map against `packages/<p>/`;
 * `generate:exports` writes the barrel from the manifest;
 * `validate:published-imports` (TASK-R1-O2) loads every subpath of the tarball
 * under Node and counts its bindings. All three answer "is it reachable".
 * None answers the question a release has to answer: **what shape does the
 * tarball hand a consumer, and how does that differ from last time.**
 *
 * A symbol can be in the barrel and absent from `dist`. A prop can change type
 * without any name changing, which no name-level check can see at all. So this
 * reads the DECLARATIONS, through the TypeScript compiler, from an extracted
 * copy of the packed tarball.
 *
 * ## What a "signature" is here
 *
 * For a plain value or function: the checker's own type string.
 * For an interface or type alias: its members, name and type, sorted.
 * For a Vue component: the three things a consumer can break against —
 * `$props`, `$emit` and `$slots`, taken off the instance type behind the
 * component's construct signature, each rendered as a sorted list.
 *
 * Sorting everywhere is what makes two runs comparable: declaration order in
 * `dist` follows the bundler's module graph, which is not stable across builds
 * and is not part of anybody's compatibility promise.
 *
 * @module @dzup-ui/tooling/release/api-surface
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'

/** The schema version of a recorded surface file. Bump on a shape change. */
export const SURFACE_SCHEMA = 1

export type SymbolKind = 'component' | 'function' | 'interface' | 'type' | 'enum' | 'class' | 'const'

export interface SurfaceSymbol {
  name: string
  kind: SymbolKind
  /** Every `exports` subpath this symbol is reachable through, sorted. */
  subpaths: string[]
  signature: string
  props?: string[]
  emits?: string[]
  slots?: string[]
  /** Declaration file, relative to the package root. */
  source: string
}

export interface PackageSurface {
  package: string
  version: string
  surfaceSchema: number
  /** True when the surface is not safe to diff — see `degradedReason`. */
  degraded: boolean
  degradedReason: string | null
  resolutionErrors: string[]
  /** Exported symbols whose recorded signature is exactly `any`. */
  anySignatures: number
  entryPoints: string[]
  symbols: SurfaceSymbol[]
}

/**
 * How many `any` signatures make a surface untrustworthy, as a share of the
 * symbols recorded.
 *
 * A genuinely-`any` export exists (a few `const` re-exports legitimately widen
 * to `any`), so the threshold is not zero. It is low, because the failure this
 * guards against is total: when `vue` does not resolve, **every**
 * `DefineComponent` collapses at once and the count jumps from a handful to
 * hundreds.
 */
export const ANY_SIGNATURE_CEILING = 0.05

export interface TypeEntryPoint {
  subpath: string
  file: string
}

/** Subpaths whose declarations are entry points to the public surface. */
export function typeEntryPoints(manifest: Record<string, unknown>, packageRoot: string): TypeEntryPoint[] {
  const entries: TypeEntryPoint[] = []
  const exportsField = manifest.exports as Record<string, unknown> | undefined

  const walk = (subpath: string, node: unknown): void => {
    if (typeof node !== 'object' || node === null)
      return
    const types = (node as Record<string, unknown>).types
    if (typeof types === 'string') {
      const abs = resolve(packageRoot, types)
      if (existsSync(abs))
        entries.push({ subpath, file: abs })
      return
    }
    // Nested condition objects (`{ import: { types, default } }`) still carry
    // a `types` leaf; a plain-string target has none and is not a type entry.
    for (const value of Object.values(node as Record<string, unknown>)) {
      if (typeof value === 'object' && value !== null) {
        walk(subpath, value)
        if (entries.some(e => e.subpath === subpath))
          return
      }
    }
  }

  for (const [subpath, target] of Object.entries(exportsField ?? {}))
    walk(subpath, target)

  // A package with no `exports.types` may still declare a root `types`.
  if (entries.length === 0 && typeof manifest.types === 'string') {
    const abs = resolve(packageRoot, manifest.types)
    if (existsSync(abs))
      entries.push({ subpath: '.', file: abs })
  }

  return entries.sort((a, b) => (a.subpath < b.subpath ? -1 : 1))
}

/** Human-readable kind for a symbol, from its declarations. */
export function kindOf(symbol: ts.Symbol, checker: ts.TypeChecker): SymbolKind {
  const flags = symbol.getFlags()
  if (flags & ts.SymbolFlags.Interface)
    return 'interface'
  if (flags & ts.SymbolFlags.TypeAlias)
    return 'type'
  if (flags & ts.SymbolFlags.Enum || flags & ts.SymbolFlags.EnumMember)
    return 'enum'
  if (flags & ts.SymbolFlags.Class)
    return 'class'
  if (flags & ts.SymbolFlags.Function || flags & ts.SymbolFlags.Method)
    return 'function'
  const declaration = symbol.getDeclarations()?.[0]
  if (declaration) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration)
    if (checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length && isComponentType(type, checker))
      return 'component'
    if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length)
      return 'function'
  }
  return 'const'
}

/** A Vue component's construct signature returns an instance carrying `$props`. */
function isComponentType(type: ts.Type, checker: ts.TypeChecker): boolean {
  for (const signature of checker.getSignaturesOfType(type, ts.SignatureKind.Construct)) {
    if (signature.getReturnType().getProperty('$props'))
      return true
  }
  return false
}

/**
 * Make a checker-produced type string comparable between runs.
 *
 * Two rewrites, both found by diffing a surface against a snapshot of **the
 * same tree** and getting 185 phantom signature changes:
 *
 * 1. `typeToString` writes an unresolvable import as its ABSOLUTE path:
 *    `import("C:/…/Temp/dzup-api-surface-Tf9Iau/consumer/node_modules/@dzup-ui/
 *    contracts/dist/anatomy.types").DzClassValue`. The scratch directory is a
 *    fresh `mkdtemp` per run, so every such signature differed from itself on
 *    the next run — and on another machine, and in CI. Everything after the
 *    last `/node_modules/` is the specifier a consumer would write, and it is
 *    stable.
 * 2. TypeScript renders a well-known symbol member as `__@iterator@32`, where
 *    the number is a per-program symbol ordinal. The name is contract; the
 *    ordinal is an implementation detail of the compilation.
 *
 * A diff whose baseline is not reproducible is worse than no diff: it reports
 * hundreds of changes nobody made, and the real one hides among them.
 */
export function normaliseSignature(text: string): string {
  return text
    .replaceAll(/import\("([^"]*)"\)/g, (whole, path: string) => {
      const marker = '/node_modules/'
      const index = path.replaceAll('\\', '/').lastIndexOf(marker)
      return index === -1 ? whole : `import("${path.replaceAll('\\', '/').slice(index + marker.length)}")`
    })
    .replaceAll(/__@([a-z$_][\w$]*)@\d+/gi, '__@$1')
}

/** Sorted `name: type` list for every property of a type. */
export function membersOf(type: ts.Type, checker: ts.TypeChecker, node: ts.Node): string[] {
  return checker
    .getPropertiesOfType(type)
    .map((property) => {
      const declaration = property.getDeclarations()?.[0] ?? node
      const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration)
      const optional = (property.getFlags() & ts.SymbolFlags.Optional) !== 0
      return normaliseSignature(`${property.getName()}${optional ? '?' : ''}: ${checker.typeToString(propertyType, declaration, ts.TypeFormatFlags.NoTruncation)}`)
    })
    .sort()
}

/** Props / emits / slots for a component export. */
function componentShape(type: ts.Type, checker: ts.TypeChecker, node: ts.Node): { props: string[], emits: string[], slots: string[] } {
  for (const signature of checker.getSignaturesOfType(type, ts.SignatureKind.Construct)) {
    const instance = signature.getReturnType()
    const props = instance.getProperty('$props')
    if (!props)
      continue
    const propsType = checker.getTypeOfSymbolAtLocation(props, node)
    const emit = instance.getProperty('$emit')
    const slots = instance.getProperty('$slots')
    return {
      props: membersOf(propsType, checker, node),
      emits: emit
        ? checker
            .getSignaturesOfType(checker.getTypeOfSymbolAtLocation(emit, node), ts.SignatureKind.Call)
            .map(s => normaliseSignature(checker.signatureToString(s, node, ts.TypeFormatFlags.NoTruncation)))
            .sort()
        : [],
      slots: slots ? membersOf(checker.getTypeOfSymbolAtLocation(slots, node), checker, node) : [],
    }
  }
  return { props: [], emits: [], slots: [] }
}

/**
 * Read the public surface of one extracted package.
 *
 * Module-resolution failures are recorded, not thrown, and they set `degraded`.
 * A surface extracted from a tree where `@dzup-ui/contracts` did not resolve is
 * still useful — every name is there — but every type that came through it is
 * `any`, and a diff against it would invent hundreds of signature changes. The
 * consumer of this surface has to be able to tell.
 */
export function readSurface(packageRoot: string): PackageSurface {
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as Record<string, unknown>
  const entries = typeEntryPoints(manifest, packageRoot)

  const program = ts.createProgram(entries.map(e => e.file), {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    // Without DOM the component instance types collapse to errors and every
    // signature comes out `any`, which would read as a wholesale API change.
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
  })
  const checker = program.getTypeChecker()

  const resolutionErrors: string[] = []
  for (const diagnostic of program.getSemanticDiagnostics()) {
    if (diagnostic.code === 2307) {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')
      if (!resolutionErrors.includes(message))
        resolutionErrors.push(message)
    }
  }

  const symbols = new Map<string, SurfaceSymbol>()
  for (const entry of entries) {
    const source = program.getSourceFile(entry.file)
    if (!source)
      continue
    const moduleSymbol = checker.getSymbolAtLocation(source)
    if (!moduleSymbol)
      continue

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      const name = exported.getName()
      const declaration = symbol.getDeclarations()?.[0] ?? source
      const kind = kindOf(symbol, checker)

      const existing = symbols.get(name)
      if (existing) {
        // A symbol reachable from several subpaths is one symbol; record every
        // route to it so a subpath that stops re-exporting it is still visible.
        if (!existing.subpaths.includes(entry.subpath)) {
          existing.subpaths.push(entry.subpath)
          existing.subpaths.sort()
        }
        continue
      }

      let signature: string
      let shape: { props: string[], emits: string[], slots: string[] } | null = null
      if (kind === 'component') {
        shape = componentShape(checker.getTypeOfSymbolAtLocation(symbol, declaration), checker, declaration)
        signature = `props(${shape.props.length}) emits(${shape.emits.length}) slots(${shape.slots.length})`
      }
      else if (kind === 'interface' || kind === 'type') {
        signature = membersOf(checker.getDeclaredTypeOfSymbol(symbol), checker, declaration).join('; ')
      }
      else {
        signature = normaliseSignature(checker.typeToString(
          checker.getTypeOfSymbolAtLocation(symbol, declaration),
          declaration,
          ts.TypeFormatFlags.NoTruncation,
        ))
      }

      symbols.set(name, {
        name,
        kind,
        subpaths: [entry.subpath],
        signature,
        ...(shape ? { props: shape.props, emits: shape.emits, slots: shape.slots } : {}),
        source: relative(packageRoot, declaration.getSourceFile().fileName).replaceAll('\\', '/'),
      })
    }
  }

  const recorded = [...symbols.values()].sort((a, b) => (a.name < b.name ? -1 : 1))

  /*
   * `skipLibCheck: true` suppresses diagnostics inside `.d.ts` files — which is
   * ALL a packed surface contains — so `resolutionErrors` is very nearly always
   * empty and cannot, on its own, tell a healthy surface from a collapsed one.
   * The first run of this tool recorded 1,325 symbols for `@dzup-ui/core` with
   * `degraded: false` and `DzButton` as `"signature": "any"`, because the
   * scratch consumer had no route to `vue`. A diff against that surface would
   * have been confidently, uniformly empty.
   *
   * So degradation is measured from the OUTPUT instead of from the compiler's
   * willingness to complain: a surface in which a large share of signatures are
   * `any` is not comparable, whatever the diagnostics say.
   */
  const anySignatures = recorded.filter(s => s.signature === 'any').length
  const anyRatio = recorded.length === 0 ? 0 : anySignatures / recorded.length

  return {
    package: String(manifest.name ?? 'unknown'),
    version: String(manifest.version ?? 'unknown'),
    surfaceSchema: SURFACE_SCHEMA,
    degraded: resolutionErrors.length > 0 || anyRatio > ANY_SIGNATURE_CEILING,
    degradedReason: resolutionErrors.length > 0
      ? `${resolutionErrors.length} module(s) did not resolve`
      : anyRatio > ANY_SIGNATURE_CEILING
        ? `${anySignatures} of ${recorded.length} signatures are \`any\` (${(anyRatio * 100).toFixed(1)} % > ${(ANY_SIGNATURE_CEILING * 100).toFixed(0)} %) — the declarations did not resolve their dependencies, and this surface is not safe to diff`
        : null,
    resolutionErrors: resolutionErrors.slice(0, 20),
    anySignatures,
    entryPoints: entries.map(e => e.subpath),
    symbols: recorded,
  }
}

/** Counts by kind, for the report's summary row. */
export function countKinds(surface: Pick<PackageSurface, 'symbols'>): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const symbol of surface.symbols)
    counts[symbol.kind] = (counts[symbol.kind] ?? 0) + 1
  return counts
}
