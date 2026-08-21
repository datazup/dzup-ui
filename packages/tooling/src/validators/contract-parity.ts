/**
 * Contract Parity Validator (TASK-FREE-16)
 *
 * Every component the docs put in front of a user must have a contract spec, so
 * a showcased component cannot quietly drift away from the contract it advertises.
 *
 * **This replaces `sandbox-contract-parity.ts`**, which asserted the same thing
 * against `apps/sandbox` — an app abandoned on 2026-06-09, superseded by the
 * Storybook, built by nothing and deployed nowhere, yet still gating every PR.
 * The sandbox was deleted; this validator is what its gate covered, ported to a
 * live source. Measured at the time of the port:
 *
 *     components with a .vue          203
 *     imported by the sandbox         150
 *     imported by the story corpus    203
 *     imported by the sandbox ONLY      0   ← the sandbox covered nothing unique
 *
 * So this is not a like-for-like port but a strictly stronger one: it holds 203
 * components to the bar the sandbox held 150 to. The port also let the old
 * validator's `KNOWN_UNCOVERED` exemption list be dropped entirely — every entry
 * in it (`DzAppShell`, `DzSidebar*`) had since gained a spec, and a stale
 * exemption list is how a gate quietly stops gating.
 *
 * Type-only imports (`*Props`, `*Slots`, `*Emits`) are skipped: they have no
 * implementation to contract against.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/contract-parity.ts
 *
 * Exit code 1 if any story-imported component lacks contract coverage.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const STORIES_DIR = resolve(ROOT, 'packages/core/stories')
/**
 * Where a `Dz*.vue` may live.
 *
 * `packages/core/src/providers` was added by TASK-OSS-P4-02. Until then this
 * validator looked only inside `**\/src/components`, so `DzThemeProvider` —
 * a public component the story corpus imports, and one whose defect surface is
 * an entire application's theme — was invisible to it in both directions: it
 * was never counted as a component, and a spec placed beside it would never
 * have been found. Widening the list surfaced exactly two components, and both
 * gained a spec in the same change.
 */
const COMPONENT_ROOTS = [
  resolve(ROOT, 'packages/core/src/components'),
  resolve(ROOT, 'packages/core/src/providers'),
  resolve(ROOT, 'packages/compat/src/components'),
]

/**
 * Compound sub-parts whose names do not share a prefix with the spec that covers
 * them. Everything else resolves by prefix (`DzCardBody` → `DzCard`).
 */
export const COMPOUND_PARENTS: Record<string, string> = {
  DzTabContent: 'DzTabs',
  DzTabList: 'DzTabs',
  DzTabTrigger: 'DzTabs',
  DzFormDescription: 'DzFormField',
  DzFormLabel: 'DzFormField',
  DzFormMessage: 'DzFormField',
}

export interface ParityViolation {
  symbol: string
  file: string
  line: number
}

/**
 * Component imports, from either the stories' relative paths
 * (`'../../src/components/data'`, `'../../src/providers'`) or a package
 * specifier.
 */
const IMPORT_RE
  = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]*(?:src\/(?:components|providers)|@dzup-ui\/(?:core|compat))[^'"]*)['"]/g

export function walk(dir: string, predicate: (path: string) => boolean): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  }
  catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    let stats
    try {
      stats = statSync(full)
    }
    catch {
      continue
    }
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git')
        continue
      out.push(...walk(full, predicate))
    }
    else if (predicate(full)) {
      out.push(full)
    }
  }
  return out
}

export function extractImportedSymbols(content: string): { symbol: string, line: number }[] {
  const results: { symbol: string, line: number }[] = []
  for (const match of content.matchAll(IMPORT_RE)) {
    const line = content.slice(0, match.index ?? 0).split('\n').length
    for (const raw of match[1]!.split(',')) {
      const symbol = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (symbol)
        results.push({ symbol, line })
    }
  }
  return results
}

/** Components that exist in the source tree (have a `<Symbol>.vue`). */
export function collectComponentNames(roots: string[] = COMPONENT_ROOTS): Set<string> {
  const names = new Set<string>()
  for (const root of roots) {
    for (const file of walk(root, p => p.endsWith('.vue'))) {
      const base = file.split(/[\\/]/).pop()!.replace(/\.vue$/, '')
      if (/^Dz[A-Z]/.test(base))
        names.add(base)
    }
  }
  return names
}

/** Names of every `<X>.contract.spec.ts`, without the suffix. */
export function collectContractSpecNames(roots: string[] = COMPONENT_ROOTS): Set<string> {
  const names = new Set<string>()
  for (const root of roots) {
    for (const spec of walk(root, p => p.endsWith('.contract.spec.ts')))
      names.add(spec.split(/[\\/]/).pop()!.replace('.contract.spec.ts', ''))
  }
  return names
}

/**
 * Covered when the symbol has its own spec, an explicitly mapped parent's spec,
 * or a spec whose name is a strict prefix (the parent family).
 */
export function isCovered(symbol: string, specNames: Set<string>): boolean {
  if (specNames.has(symbol))
    return true
  const explicitParent = COMPOUND_PARENTS[symbol]
  if (explicitParent && specNames.has(explicitParent))
    return true
  for (const name of specNames) {
    if (symbol.startsWith(name) && symbol !== name)
      return true
  }
  return false
}

export function checkContractParity(storiesDir: string = STORIES_DIR): ParityViolation[] {
  const componentNames = collectComponentNames()
  const specNames = collectContractSpecNames()
  const violations: ParityViolation[] = []
  const seen = new Set<string>()

  for (const file of walk(storiesDir, p => p.endsWith('.ts') || p.endsWith('.vue'))) {
    const content = readFileSync(file, 'utf8')
    for (const { symbol, line } of extractImportedSymbols(content)) {
      if (!componentNames.has(symbol) || isCovered(symbol, specNames))
        continue
      if (seen.has(symbol))
        continue
      seen.add(symbol)
      violations.push({ symbol, file: relative(ROOT, file).replaceAll('\\', '/'), line })
    }
  }
  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkContractParity()
  if (violations.length === 0) {
    console.warn(
      '✓ contract-parity: every component the story corpus showcases has contract coverage '
      + '(its own spec, or its parent family\'s).',
    )
    process.exit(0)
  }
  console.error(`\nFound ${violations.length} showcased component(s) with no contract spec:\n`)
  for (const v of violations)
    console.error(`  ${v.symbol}  (imported by ${v.file}:${v.line})`)
  console.error(
    '\nAdd a *.contract.spec.ts for the component (or its parent family) so a component the '
    + 'docs showcase cannot drift away from its contract.',
  )
  process.exit(1)
}
/* c8 ignore stop */
