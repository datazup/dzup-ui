/**
 * Anatomy/emitter alignment validator (TASK-N2-S1, ADR-19).
 *
 * ADR-19's own "Validation hooks" table assigns this to
 * `validate:contract-parity` — *"declared parts/states exist in rendered DOM; no
 * undeclared `data-part`"* — and **that extension was never built**.
 * `contract-parity.ts` checks that a story-imported component has a contract
 * spec and nothing else; it contains no occurrence of the string `anatomy`.
 *
 * So the only thing in the repository that compares an emitted part to a
 * declared one is `expectAnatomy` (`@dzup-ui/testing`), which runs on **rendered
 * DOM**, in **whatever branch a spec happens to mount**, for the **8 components
 * that have an anatomy at all**. TASK-N2-S1 measured the consequence: `DzSelect`
 * — a pilot — emits `options-state`, `options-message` and `options-retry`,
 * declares none of them, and every gate is green, because those three nodes come
 * from `DzOptionsState.vue`, which is not exported, is absent from the ownership
 * manifest, and injects the same three names into **seven** form components.
 *
 * This validator is the source-level half. It is not a substitute for
 * `expectAnatomy` — a static scan cannot know whether a part actually rendered —
 * but it sees every branch of every template, including the ones no spec mounts,
 * and it sees components the manifest does not know about.
 *
 * ## The rules
 *
 * 1. **`undeclared-emission`** — every static `data-part="x"` must be declared by
 *    the emitting component's own `Dz{Name}.anatomy.ts`, by the anatomy of the
 *    `parentComponent` the ownership manifest records for it (a compound part
 *    such as `DzTableRow` is covered by `DzTable`'s declaration, which is how
 *    ADR-19 §3 means a part to be owned), or — for an unmanifested internal
 *    such as `DzOptionsState` — by **every** component that imports it, since
 *    those names land in every one of their DOMs. Held by a **checked-in
 *    ceiling that ratchets down**, the same rule as `maxWithoutAnatomy`.
 * 2. **`unemitted-declaration`** — a declared part that is neither listed in
 *    `optionalParts` nor emitted by any source is a promise with nothing behind
 *    it. **Ceiling zero**: it is always a defect in the declaration or in the
 *    template, and there were never more than one.
 * 3. **Vocabulary extensions** are reported, never failed — ADR-19 §3 says the
 *    vocabulary grows deliberately, and a report is how a maintainer sees the
 *    proposal.
 *
 * Dynamic bindings (`:data-part="…"`) are counted and printed but not resolved:
 * a computed part name is outside what source can decide, and pretending
 * otherwise is the "reports on a proxy and labels it as the thing" failure this
 * program has now recorded four times.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/anatomy-parts.ts
 *
 * Exit code 1 when a rule is over its ceiling.
 */

import type { ManifestAnatomy } from '../ownership/anatomy-source.ts'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ANATOMY_PART_VOCABULARY } from '@dzup-ui/contracts'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const CORE_SRC = resolve(ROOT, 'packages/core/src')
const MANIFEST = resolve(ROOT, 'packages/core/manifests/component-ownership.manifest.json')
const CEILINGS = resolve(dirname(fileURLToPath(import.meta.url)), 'anatomy-parts-ceilings.json')

const VOCABULARY = new Set<string>(ANATOMY_PART_VOCABULARY)

export interface PartEmission {
  /** Emitting component symbol, e.g. `DzTableRow`. */
  symbol: string
  file: string
  line: number
  part: string
}

export interface AnatomyPartsViolation {
  rule: 'undeclared-emission' | 'unemitted-declaration'
  symbol: string
  part: string
  message: string
}

export interface AnatomyPartsReport {
  violations: AnatomyPartsViolation[]
  undeclared: AnatomyPartsViolation[]
  unemitted: AnatomyPartsViolation[]
  ceilings: Ceilings
  /** Part names outside the ADR-19 shared vocabulary — reported, not failed. */
  vocabularyExtensions: { symbol: string, parts: string[] }[]
  /** `:data-part="…"` sites, which source cannot resolve. */
  dynamicEmissions: PartEmission[]
  totals: {
    emittingFiles: number
    declaringFiles: number
    distinctParts: number
    emissions: number
  }
}

export interface Ceilings {
  maxUndeclaredEmissions: number
  maxUnemittedDeclarations: number
}

export function readCeilings(path: string = CEILINGS): Ceilings {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<Ceilings>
  return {
    maxUndeclaredEmissions: raw.maxUndeclaredEmissions ?? 0,
    maxUnemittedDeclarations: raw.maxUnemittedDeclarations ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Source scanning
// ---------------------------------------------------------------------------

/** Recursively collect `*.vue` under `dir`. */
export function collectVueFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules')
        continue
      files.push(...collectVueFiles(full))
    }
    else if (entry.endsWith('.vue')) {
      files.push(full)
    }
  }
  return files
}

/**
 * Static `data-part="x"` sites in one source, with 1-based line numbers.
 *
 * `data-participant-id` is why the attribute name is anchored with `=` and a
 * word boundary rather than matched as a substring: the loose form is what put
 * `TeamMemberBadge` into ADR-19's own measured baseline as a `data-part`
 * emitter, and from there into the reassessment and into this task's brief.
 */
export function staticPartsIn(source: string): { part: string, line: number }[] {
  const found: { part: string, line: number }[] = []
  for (const match of source.matchAll(/\bdata-part\s*=\s*"([^"]*)"/g))
    found.push({ part: match[1] ?? '', line: source.slice(0, match.index).split('\n').length })
  return found
}

/** `:data-part="…"` / `v-bind:data-part="…"` sites — counted, not resolved. */
export function dynamicPartsIn(source: string): { expression: string, line: number }[] {
  const found: { expression: string, line: number }[] = []
  for (const match of source.matchAll(/(?::|v-bind:)data-part\s*=\s*"([^"]*)"/g))
    found.push({ expression: match[1] ?? '', line: source.slice(0, match.index).split('\n').length })
  return found
}

/** `.vue` files this SFC imports by relative path, as absolute paths. */
export function importedVueFiles(vuePath: string, source: string): string[] {
  const files: string[] = []
  for (const match of source.matchAll(/from\s+'([^']*\.vue)'/g)) {
    const target = resolve(dirname(vuePath), match[1] ?? '')
    if (existsSync(target))
      files.push(target)
  }
  return files
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

interface ManifestEntry {
  symbol: string
  kind: string
  parentComponent?: string
}

function symbolOf(vuePath: string): string {
  return basename(vuePath, '.vue')
}

export function checkAnatomyParts(
  srcDir: string = CORE_SRC,
  manifestPath: string = MANIFEST,
  ceilings: Ceilings = readCeilings(),
): AnatomyPartsReport {
  const files = collectVueFiles(srcDir)
  const sources = new Map<string, string>()
  for (const file of files)
    sources.set(file, readFileSync(file, 'utf8'))

  // Declarations, by symbol.
  const anatomies = new Map<string, ManifestAnatomy>()
  for (const file of files) {
    const declaration = file.replace(/\.vue$/, '.anatomy.ts')
    if (!existsSync(declaration))
      continue
    const { anatomy } = parseAnatomySource(readFileSync(declaration, 'utf8'), declaration)
    if (anatomy !== undefined)
      anatomies.set(symbolOf(file), anatomy)
  }

  // Ownership: compound part -> parent component.
  const parents = new Map<string, string>()
  const kinds = new Map<string, string>()
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { entries: ManifestEntry[] }
    for (const entry of manifest.entries) {
      kinds.set(entry.symbol, entry.kind)
      if (entry.parentComponent !== undefined)
        parents.set(entry.symbol, entry.parentComponent)
    }
  }

  // Importers: which SFCs render this one. Used only for components the manifest
  // does not know about — an unexported internal whose parts land in every host.
  const importers = new Map<string, string[]>()
  for (const file of files) {
    for (const imported of importedVueFiles(file, sources.get(file) ?? '')) {
      const list = importers.get(symbolOf(imported)) ?? []
      list.push(symbolOf(file))
      importers.set(symbolOf(imported), list)
    }
  }

  const declaresPart = (symbol: string, part: string): boolean => {
    const anatomy = anatomies.get(symbol)
    return anatomy !== undefined && anatomy.parts !== 'none' && anatomy.parts.includes(part)
  }

  /** Where a part emitted by `symbol` may legitimately be declared. */
  const coveredBy = (symbol: string, part: string): string | undefined => {
    if (declaresPart(symbol, part))
      return symbol

    // A compound part is owned by the component that composes it (ADR-19 §3).
    let cursor = parents.get(symbol)
    const guard = new Set<string>([symbol])
    while (cursor !== undefined && !guard.has(cursor)) {
      if (declaresPart(cursor, part))
        return cursor
      guard.add(cursor)
      cursor = parents.get(cursor)
    }

    // An internal with no manifest entry: its parts reach every host's DOM, so
    // every host must declare them for the emission to be governed anywhere.
    if (!kinds.has(symbol)) {
      const hosts = importers.get(symbol) ?? []
      if (hosts.length > 0 && hosts.every(host => coveredBy(host, part) !== undefined))
        return hosts.join(', ')
    }
    return undefined
  }

  const undeclared: AnatomyPartsViolation[] = []
  const emitted = new Map<string, Set<string>>()
  const dynamicEmissions: PartEmission[] = []
  const distinctParts = new Set<string>()
  let emissions = 0
  let emittingFiles = 0

  for (const file of files) {
    const symbol = symbolOf(file)
    const source = sources.get(file) ?? ''
    const statics = staticPartsIn(source)
    const rel = relative(ROOT, file).replaceAll('\\', '/')

    for (const dynamic of dynamicPartsIn(source))
      dynamicEmissions.push({ symbol, file: rel, line: dynamic.line, part: dynamic.expression })

    if (statics.length === 0)
      continue
    emittingFiles++

    const own = emitted.get(symbol) ?? new Set<string>()
    for (const { part, line } of statics) {
      emissions++
      distinctParts.add(part)
      own.add(part)
      if (coveredBy(symbol, part) === undefined) {
        undeclared.push({
          rule: 'undeclared-emission',
          symbol,
          part,
          message: `${rel}:${line} emits data-part="${part}", which no anatomy declares — not `
            + `${symbol}'s own, not a composing parent's. An undeclared part is a promise nobody `
            + 'reviewed and nothing stops from disappearing (ADR-19 §3).',
        })
      }
    }
    emitted.set(symbol, own)
  }

  // Parts a declaration promises that no source emits. A compound part's
  // emission counts for its parent: DzTable declares `row`, DzTableRow emits it.
  const emittedFor = (symbol: string): Set<string> => {
    const all = new Set(emitted.get(symbol) ?? [])
    for (const [child, parent] of parents) {
      if (parent === symbol) {
        for (const part of emitted.get(child) ?? [])
          all.add(part)
      }
    }
    // Internals this component renders contribute their parts too.
    for (const [child, hosts] of importers) {
      if (hosts.includes(symbol) && !kinds.has(child)) {
        for (const part of emitted.get(child) ?? [])
          all.add(part)
      }
    }
    return all
  }

  const unemitted: AnatomyPartsViolation[] = []
  for (const [symbol, anatomy] of anatomies) {
    if (anatomy.parts === 'none')
      continue
    const optional = new Set(anatomy.optionalParts ?? [])
    const present = emittedFor(symbol)
    for (const part of anatomy.parts) {
      if (optional.has(part) || present.has(part))
        continue
      unemitted.push({
        rule: 'unemitted-declaration',
        symbol,
        part,
        message: `${symbol} declares part "${part}" but no source emits data-part="${part}". `
          + 'Emit it, or list it in optionalParts if it is conditional — a declared part with '
          + 'nothing behind it is exactly the claim ADR-19 exists to make checkable.',
      })
    }
  }

  const vocabularyExtensions: { symbol: string, parts: string[] }[] = []
  for (const [symbol, anatomy] of [...anatomies].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (anatomy.parts === 'none')
      continue
    const outside = anatomy.parts.filter(part => !VOCABULARY.has(part))
    if (outside.length > 0)
      vocabularyExtensions.push({ symbol, parts: outside })
  }

  const violations: AnatomyPartsViolation[] = []
  if (undeclared.length > ceilings.maxUndeclaredEmissions) {
    violations.push({
      rule: 'undeclared-emission',
      symbol: '(ceiling)',
      part: '',
      message: `${undeclared.length} undeclared data-part emissions exceed the checked-in ceiling `
        + `of ${ceilings.maxUndeclaredEmissions}. The ceiling ratchets DOWN: declare the part in `
        + 'the emitting component\'s anatomy (or in the anatomy of the component that composes '
        + 'it) and lower the number in the same change.',
    })
  }
  if (unemitted.length > ceilings.maxUnemittedDeclarations) {
    violations.push({
      rule: 'unemitted-declaration',
      symbol: '(ceiling)',
      part: '',
      message: `${unemitted.length} declared parts are emitted by no source, over the ceiling of `
        + `${ceilings.maxUnemittedDeclarations}.`,
    })
  }

  return {
    violations,
    undeclared,
    unemitted,
    ceilings,
    vocabularyExtensions,
    dynamicEmissions,
    totals: {
      emittingFiles,
      declaringFiles: anatomies.size,
      distinctParts: distinctParts.size,
      emissions,
    },
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = checkAnatomyParts()
  const { totals, ceilings } = report

  if (report.violations.length === 0) {
    console.warn(
      `✓ anatomy-parts: ${totals.emissions} data-part emissions across ${totals.emittingFiles} `
      + `components (${totals.distinctParts} distinct names, ${totals.declaringFiles} anatomy `
      + `declarations); ${report.undeclared.length}/${ceilings.maxUndeclaredEmissions} undeclared, `
      + `${report.unemitted.length}/${ceilings.maxUnemittedDeclarations} declared-but-unemitted`,
    )
    if (report.undeclared.length > 0) {
      console.warn('  still undeclared (under the ceiling, ratchets down):')
      for (const violation of report.undeclared)
        console.warn(`   · ${violation.symbol} — "${violation.part}"`)
    }
    if (report.vocabularyExtensions.length > 0) {
      console.warn('  part names outside the ADR-19 shared vocabulary (reported, not a failure):')
      for (const entry of report.vocabularyExtensions)
        console.warn(`   · ${entry.symbol} — ${entry.parts.join(', ')}`)
    }
    if (report.dynamicEmissions.length > 0) {
      console.warn('  dynamic :data-part bindings, which source cannot resolve:')
      for (const entry of report.dynamicEmissions)
        console.warn(`   · ${entry.file}:${entry.line} — ${entry.part}`)
    }
    process.exit(0)
  }

  for (const violation of [...report.undeclared, ...report.unemitted])
    console.error(`✗ ${violation.message}`)
  for (const violation of report.violations)
    console.error(`\n✗ ${violation.rule}: ${violation.message}`)
  process.exit(1)
}
/* c8 ignore stop */
