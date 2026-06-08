/**
 * Sandbox Contract Parity Validator
 *
 * Scans `apps/sandbox/src/**\/*.vue` and `*.ts` for symbols imported from
 * `@dzup-ui/core` (and `@dzup-ui/compat`). For each symbol that corresponds to
 * an actual component (a `<Symbol>.vue` file under `packages/{core,compat}/src/components`),
 * asserts that a contract spec exists — either `<Symbol>.contract.spec.ts` or
 * a parent's contract spec (e.g. `DzCardBody` is covered by `DzCard.contract.spec.ts`).
 *
 * Type-only imports (`*Props`, `*Slots`, `*Emits`, `*Context`, `*Variants`, etc.)
 * are skipped — they have no implementation file to contract against.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/sandbox-contract-parity.ts
 *
 * Exit code 1 if any sandbox-imported component lacks contract coverage.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const SANDBOX_SRC = resolve(ROOT, 'apps/sandbox/src')
const COMPONENT_ROOTS = [
  resolve(ROOT, 'packages/core/src/components'),
  resolve(ROOT, 'packages/compat/src/components'),
]

/**
 * Compound subcomponents whose naming doesn't share a clean prefix with the
 * parent spec — covered by the listed parent's `.contract.spec.ts`.
 */
const COMPOUND_PARENTS: Record<string, string> = {
  DzTabContent: 'DzTabs',
  DzTabList: 'DzTabs',
  DzTabTrigger: 'DzTabs',
  DzFormDescription: 'DzFormField',
  DzFormLabel: 'DzFormField',
  DzFormMessage: 'DzFormField',
}

/**
 * Components known to lack a contract spec — listed here so the parity check
 * fails on *regressions*, not on pre-existing tech debt. Drop an entry from
 * this list as soon as a `.contract.spec.ts` is added for it.
 */
const KNOWN_UNCOVERED = new Set<string>([
  'DzAppShell',
  'DzSidebar',
  'DzSidebarFooter',
  'DzSidebarHeader',
  'DzSidebarItem',
  'DzSidebarSection',
])

interface Violation {
  symbol: string
  file: string
  line: number
}

function walk(dir: string, predicate: (path: string) => boolean): string[] {
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

const IMPORT_RE = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"](@dzup-ui\/(?:core|compat))['"]/g

function extractImportedSymbols(content: string): { symbol: string, line: number }[] {
  const results: { symbol: string, line: number }[] = []
  for (const match of content.matchAll(IMPORT_RE)) {
    const block = match[1]!
    const line = content.slice(0, match.index ?? 0).split('\n').length
    const symbols = block
      .split(',')
      .map(s => s.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim())
      .filter(Boolean)
    for (const symbol of symbols) {
      results.push({ symbol, line })
    }
  }
  return results
}

/** Components present in the source tree (have a `<Symbol>.vue` file). */
function collectComponentNames(): Set<string> {
  const names = new Set<string>()
  for (const root of COMPONENT_ROOTS) {
    const vueFiles = walk(root, p => p.endsWith('.vue'))
    for (const file of vueFiles) {
      const base = file.split(/[\\/]/).pop()!.replace(/\.vue$/, '')
      if (/^Dz[A-Z]/.test(base))
        names.add(base)
    }
  }
  return names
}

/** Names of all `<X>.contract.spec.ts` files (without the suffix). */
function collectContractSpecNames(): Set<string> {
  const names = new Set<string>()
  for (const root of COMPONENT_ROOTS) {
    const specs = walk(root, p => p.endsWith('.contract.spec.ts'))
    for (const spec of specs) {
      const base = spec.split(/[\\/]/).pop()!.replace('.contract.spec.ts', '')
      names.add(base)
    }
  }
  return names
}

/**
 * A symbol is covered if its own spec exists, or a strict prefix (the parent
 * component family) has a spec. E.g. `DzCardBody` is covered by `DzCard`.
 */
function isCovered(symbol: string, specNames: Set<string>): boolean {
  if (specNames.has(symbol))
    return true
  if (KNOWN_UNCOVERED.has(symbol))
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

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Scanning sandbox imports for contract parity...')

  const sandboxFiles = walk(SANDBOX_SRC, p => p.endsWith('.vue') || p.endsWith('.ts'))
  const componentNames = collectComponentNames()
  const specNames = collectContractSpecNames()

  const violations: Violation[] = []
  const seen = new Set<string>()

  for (const file of sandboxFiles) {
    const content = readFileSync(file, 'utf8')
    const imports = extractImportedSymbols(content)
    for (const { symbol, line } of imports) {
      // Skip anything that isn't a real component implementation
      if (!componentNames.has(symbol))
        continue
      if (isCovered(symbol, specNames))
        continue
      const key = `${symbol}::${file}`
      if (seen.has(key))
        continue
      seen.add(key)
      violations.push({ symbol, file: relative(ROOT, file), line })
    }
  }

  if (violations.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`OK — every component imported by the sandbox has matching contract coverage (own spec or parent family spec).`)
    return
  }

  console.error(`\nFound ${violations.length} sandbox import(s) without a matching contract spec:\n`)
  for (const v of violations) {
    console.error(`  ${v.symbol}  (imported by ${v.file}:${v.line})`)
  }

  console.error(`\nAdd a *.contract.spec.ts for the component (or its parent family) so the sandbox showcase cannot drift away from the contract.`)
  process.exit(1)
}

main()
