/**
 * Token reference integrity — the `--dz-*` runtime ABI, checked from the
 * consuming side (TASK-R5-O7; closes N1-O3 **D4**).
 *
 * `validate:tokens` proves the token *maps* are internally sound and
 * `validate:tokens:dtcg` proves the interchange file describes them. Neither
 * ever looked at the other end of the wire: a component that writes
 * `var(--dz-spacing-1-5)` when the scale emits `--dz-spacing-1_5` names a
 * custom property that does not exist, the browser drops the whole declaration,
 * and every gate in the repo stays green. That is not hypothetical — N1-O3 §4.6
 * found **31** such references, **26** of them carrying no fallback, and five
 * components (DzTree, DzTreeItem, DzTreeSelect, DzBreadcrumb, DzRating) had been
 * rendering collapsed onto their own text for months because of it.
 *
 * This gate closes the loop, and it deliberately reuses the DTCG gate's own
 * `parseCssDeclarations` / `declarationsFromTokenMaps` rather than growing a
 * second CSS parser: if the two gates ever disagreed about what `tokens.css`
 * declares, the disagreement would be the bug.
 *
 * ── The three outcomes for a reference ──
 *
 * 1. **Declared** — the name is declared by `tokens.css` (the shipped ABI) or by
 *    library CSS/inline style in `packages/core/src`. Fine.
 * 2. **Undeclared with a fallback** — `var(--dz-listbox-bg, var(--dz-background))`.
 *    This renders correctly today and is a deliberate *consumer hook*: a
 *    custom property the library never sets but promises to honour if a consumer
 *    does. Legitimate, but only when someone wrote it down — so it must appear in
 *    `token-reference-allowlist.json` with the component that owns it and the
 *    fallback it degrades to. An undocumented hook is indistinguishable from a
 *    typo that happens to have a fallback.
 * 3. **Undeclared with no fallback** — always a defect. The declaration is
 *    discarded at parse time and the property silently keeps its inherited or
 *    initial value. Never allowlistable.
 *
 * ── Two ratchets, reported in the same pass ──
 *
 * The declared set and the referenced set are both already in memory, so the
 * two reports the 08-11 package matrix asks for cost one subtraction each:
 *
 * - **unused** — emitted into `tokens.css` and referenced by no source or doc
 *   anywhere in the repo. Not a failure (a design system legitimately ships a
 *   complete scale), but a ceiling that may only fall.
 * - **alias cycles** — `--dz-a: var(--dz-b)` where following the chain returns to
 *   `--dz-a`. Always zero: a cycle makes every name on it resolve to nothing.
 *
 * Usage: `tsx packages/tooling/src/token-checks/token-references.ts`
 * Exit 1 on any unknown reference, undocumented hook, cycle, or ceiling breach.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { declarationsFromTokenMaps, parseCssDeclarations } from './dtcg-round-trip.js'

// --- Paths ---

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../../../')
const CORE_SRC = resolve(ROOT, 'packages/core/src')
const TOKENS_CSS = resolve(ROOT, 'packages/tokens/dist/tokens.css')
const ALLOWLIST_PATH = resolve(HERE, 'token-reference-allowlist.json')
const CEILINGS_PATH = resolve(HERE, 'token-reference-ceilings.json')

/**
 * Where a reference may be *used* for the purpose of the unused-token report.
 * Wider than the gate's own scope on purpose: a token the docs site demonstrates
 * but no component consumes is documented, not dead.
 */
const USAGE_ROOTS = [
  'packages/core/src',
  'packages/core/stories',
  'packages/tokens/src',
  'apps/docs',
  'apps/landing/src',
  'apps/storybook/stories',
  'docs',
]

const SOURCE_EXTENSIONS = /\.(?:vue|ts|tsx|css|md|mdx)$/
/** The gate's own scope: library component source. */
const GATE_EXTENSIONS = /\.(?:vue|ts|css)$/
const SKIP_DIRS = new Set(['node_modules', 'dist', 'storybook-static', 'coverage', '.turbo'])

// --- Types ---

export interface TokenReference {
  readonly name: string
  readonly hasFallback: boolean
  readonly file: string
  readonly line: number
}

export interface ReferenceViolation {
  readonly rule: 'unknown-token' | 'undocumented-hook' | 'stale-allowlist' | 'alias-cycle' | 'ceiling'
  readonly symbol: string
  readonly message: string
}

export interface ReferenceReport {
  readonly violations: readonly ReferenceViolation[]
  readonly declared: number
  readonly declaredByTokensCss: number
  readonly referenced: number
  readonly filesScanned: number
  readonly hooks: number
  readonly unused: readonly string[]
  readonly cycles: readonly string[]
  readonly cssSource: string
}

interface AllowlistEntry {
  readonly token: string
  readonly owner: string
  readonly fallback: string
  readonly reason: string
}

// --- Source scanning ---

function walk(dir: string, extensions: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir))
    return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.'))
        continue
      walk(full, extensions, out)
    }
    else if (extensions.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

const blankRun = (text: string): string => text.replace(/[^\n]/g, ' ')

/**
 * Replace comment bodies with spaces, preserving every newline so line numbers
 * survive. Masking matters: `DzBlockUI.anatomy.ts` documents its hooks in prose
 * as `var(--dz-blockui-x, <fallback>)`, and an unmasked scan reports
 * `--dz-blockui-x` as a missing token — a defect that exists only in a sentence.
 *
 * Only *full-line* `//` comments are masked. A trailing `//` is left alone
 * because masking it could hide a real reference, and this gate must never
 * under-report.
 */
export function maskComments(text: string): string {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, blankRun)
  out = out.replace(/<!--[\s\S]*?-->/g, blankRun)
  out = out.replace(/^([ \t]*)\/\/[^\n]*/gm, (match, indent: string) => indent + blankRun(match.slice(indent.length)))
  return out
}

function lineStarts(text: string): number[] {
  const starts = [0]
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n')
      starts.push(i + 1)
  }
  return starts
}

function lineAt(starts: readonly number[], index: number): number {
  let low = 0
  let high = starts.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if ((starts[mid] ?? 0) <= index)
      low = mid
    else high = mid - 1
  }
  return low + 1
}

const REFERENCE_RE = /var\(\s*(--dz-[\w-]+)/g
const DECLARATION_RE = /(--dz-[\w-]+)['"]?\s*:/g

/**
 * Whether this `var(` has a top-level fallback argument — a comma at paren
 * depth 1. Scanned rather than regexed because a fallback is routinely another
 * `var()`: `var(--dz-listbox-bg, var(--dz-background))`.
 */
function hasTopLevelFallback(text: string, varIndex: number): boolean {
  let depth = 0
  for (let i = varIndex + 3; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '(') {
      depth += 1
    }
    else if (ch === ')') {
      depth -= 1
      if (depth === 0)
        return false
    }
    else if (ch === ',' && depth === 1) {
      return true
    }
  }
  return false
}

export function referencesIn(text: string, file: string): TokenReference[] {
  const masked = maskComments(text)
  const starts = lineStarts(masked)
  const found: TokenReference[] = []
  REFERENCE_RE.lastIndex = 0
  let match: RegExpExecArray | null = REFERENCE_RE.exec(masked)
  while (match !== null) {
    found.push({
      name: match[1] ?? '',
      hasFallback: hasTopLevelFallback(masked, match.index),
      file,
      line: lineAt(starts, match.index),
    })
    match = REFERENCE_RE.exec(masked)
  }
  return found
}

export function declarationsIn(text: string): string[] {
  const masked = maskComments(text)
  const names: string[] = []
  DECLARATION_RE.lastIndex = 0
  let match: RegExpExecArray | null = DECLARATION_RE.exec(masked)
  while (match !== null) {
    names.push(match[1] ?? '')
    match = DECLARATION_RE.exec(masked)
  }
  return names
}

// --- Alias cycles ---

const ALIAS_HEAD_RE = /^var\(\s*(--dz-[\w-]+)/

/**
 * Follow `--dz-a: var(--dz-b)` chains and report any name that reaches itself.
 * Reported once per cycle, keyed by the alphabetically first member so the same
 * cycle cannot be counted twice from two entry points.
 */
export function aliasCycles(values: ReadonlyMap<string, string>): string[] {
  const cycles = new Set<string>()
  for (const start of values.keys()) {
    const seen: string[] = []
    let current: string | undefined = start
    while (current !== undefined) {
      if (seen.includes(current)) {
        // Rotate the ring to start at its alphabetically first member before
        // keying it. Without this the same cycle is recorded once per entry
        // point — a -> b -> c, b -> c -> a and c -> a -> b are one cycle
        // reported three times, which would inflate the count against a
        // ceiling of zero and name a different "first" token each run.
        const ring = seen.slice(seen.indexOf(current))
        const smallest = [...ring].sort()[0] ?? ''
        const pivot = ring.indexOf(smallest)
        const canonical = [...ring.slice(pivot), ...ring.slice(0, pivot)]
        cycles.add(`${smallest}: ${[...canonical, smallest].join(' -> ')}`)
        break
      }
      seen.push(current)
      const value: string | undefined = values.get(current)
      const next = value === undefined ? null : ALIAS_HEAD_RE.exec(value.trim())
      current = next === null ? undefined : next[1]
    }
  }
  return [...cycles].sort()
}

// --- The check ---

export function checkTokenReferences(): ReferenceReport {
  const violations: ReferenceViolation[] = []

  // 1. What the shipped ABI declares. Same parser the DTCG gate uses.
  const usingDist = existsSync(TOKENS_CSS)
  const cssDeclarations = usingDist
    ? parseCssDeclarations(readFileSync(TOKENS_CSS, 'utf8'))
    : declarationsFromTokenMaps()
  const cssSource = usingDist ? 'dist/tokens.css' : 'token maps (dist not built)'

  const abiValues = new Map<string, string>()
  for (const declaration of cssDeclarations)
    abiValues.set(declaration.name, declaration.value)
  const declared = new Set(abiValues.keys())
  const declaredByTokensCss = declared.size

  // 2. What library CSS and inline styles declare on top of it (component tier).
  const gateFiles = walk(CORE_SRC, GATE_EXTENSIONS)
  for (const file of gateFiles) {
    for (const name of declarationsIn(readFileSync(file, 'utf8')))
      declared.add(name)
  }

  // 3. Every reference in the gate's scope.
  const references: TokenReference[] = []
  for (const file of gateFiles)
    references.push(...referencesIn(readFileSync(file, 'utf8'), relative(ROOT, file).split(sep).join('/')))

  // 4. Classify.
  const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')) as { hooks: AllowlistEntry[] }
  const hooks = new Map(allowlist.hooks.map(hook => [hook.token, hook]))
  const hooksSeen = new Set<string>()

  for (const reference of references) {
    if (declared.has(reference.name))
      continue
    const at = `${reference.file}:${reference.line}`
    if (!reference.hasFallback) {
      violations.push({
        rule: 'unknown-token',
        symbol: reference.name,
        message: `${at} references var(${reference.name}) with no fallback, and nothing declares that `
          + 'custom property. The browser discards the whole declaration and the property silently keeps '
          + 'its inherited value. Fix the name, or declare the token.',
      })
      continue
    }
    if (!hooks.has(reference.name)) {
      violations.push({
        rule: 'undocumented-hook',
        symbol: reference.name,
        message: `${at} references var(${reference.name}, …), which nothing declares. The fallback makes it `
          + 'render, so this is either a deliberate consumer hook or a typo wearing a safety net. If it is a '
          + 'hook, add it to packages/tooling/src/token-checks/token-reference-allowlist.json with its owner '
          + 'and fallback, and document it in apps/storybook/stories/Styling-Cookbook.mdx.',
      })
      continue
    }
    hooksSeen.add(reference.name)
  }

  // 5. An allowlist entry that no longer matches anything is a licence nobody revoked.
  for (const hook of allowlist.hooks) {
    if (!hooksSeen.has(hook.token) && !declared.has(hook.token)) {
      violations.push({
        rule: 'stale-allowlist',
        symbol: hook.token,
        message: 'is allowlisted as a consumer hook but no longer referenced anywhere in packages/core/src. '
          + 'Remove the entry — the ratchet only falls.',
      })
    }
  }

  // 6. Unused report, measured across the whole repo, not just the gate scope.
  const usedAnywhere = new Set<string>()
  let filesScanned = gateFiles.length
  for (const root of USAGE_ROOTS) {
    for (const file of walk(resolve(ROOT, root), SOURCE_EXTENSIONS)) {
      filesScanned += 1
      for (const reference of referencesIn(readFileSync(file, 'utf8'), file))
        usedAnywhere.add(reference.name)
    }
  }
  const unused = [...abiValues.keys()].filter(name => !usedAnywhere.has(name)).sort()

  // 7. Alias cycles.
  const cycles = aliasCycles(abiValues)
  for (const cycle of cycles) {
    violations.push({
      rule: 'alias-cycle',
      symbol: cycle.split(':')[0] ?? cycle,
      message: `alias chain returns to itself (${cycle}). Every name on the ring resolves to nothing.`,
    })
  }

  // 8. Ceilings.
  const ceilings = JSON.parse(readFileSync(CEILINGS_PATH, 'utf8')) as {
    maxUnusedTokens: number
    maxAliasCycles: number
  }
  if (unused.length > ceilings.maxUnusedTokens) {
    violations.push({
      rule: 'ceiling',
      symbol: 'maxUnusedTokens',
      message: `${unused.length} emitted tokens are referenced by no source or doc, above the ceiling of `
        + `${ceilings.maxUnusedTokens}. Either consume them or stop emitting them; the ceiling only falls. `
        + `New since the ceiling was set: ${unused.slice(0, 8).join(', ')}${unused.length > 8 ? ', …' : ''}`,
    })
  }
  if (cycles.length > ceilings.maxAliasCycles) {
    violations.push({
      rule: 'ceiling',
      symbol: 'maxAliasCycles',
      message: `${cycles.length} alias cycles, ceiling ${ceilings.maxAliasCycles}.`,
    })
  }

  return {
    violations,
    declared: declared.size,
    declaredByTokensCss,
    referenced: new Set(references.map(reference => reference.name)).size,
    filesScanned,
    hooks: hooksSeen.size,
    unused,
    cycles,
    cssSource,
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = checkTokenReferences()
  if (report.violations.length === 0) {
    console.warn(
      `✓ token-references: ${report.referenced} distinct --dz-* referenced across `
      + `${report.filesScanned} files; ${report.declared} declared `
      + `(${report.declaredByTokensCss} from ${report.cssSource}); `
      + `${report.hooks} documented consumer hooks; `
      + `${report.unused.length} unused at ceiling; ${report.cycles.length} alias cycles`,
    )
    process.exit(0)
  }
  const byRule = new Map<string, ReferenceViolation[]>()
  for (const violation of report.violations) {
    const bucket = byRule.get(violation.rule) ?? []
    bucket.push(violation)
    byRule.set(violation.rule, bucket)
  }
  console.error(`✗ token-references FAILED — ${report.violations.length} issue(s)`)
  for (const rule of [...byRule.keys()].sort()) {
    const bucket = byRule.get(rule) ?? []
    console.error(`\n  [${rule}] ${bucket.length}`)
    for (const violation of bucket)
      console.error(`    ${violation.symbol}: ${violation.message}`)
  }
  process.exit(1)
}
/* c8 ignore stop */
