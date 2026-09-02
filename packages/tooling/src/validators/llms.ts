/**
 * `yarn validate:llms` — the freshness gate for the agent-facing `llms.txt` /
 * `llms-full.txt` documents (TASK-N2-A3, gap A5-1).
 *
 * WHY THIS GATE EXISTS
 *
 * `llms.txt` is the file coding agents actually read, and — through
 * `@dzup-ui/mcp`'s `list_components` / `get_component` — the file every MCP
 * client answers component questions from. Until this packet it had no
 * freshness gate of any kind. `apps/storybook/scripts/validate-llms.mjs`
 * existed but checked only *structure* (balanced fences, square tables, one H1)
 * and could not tell a correct document from one describing a catalog that no
 * longer exists.
 *
 * FOUR DOCUMENTS, TWO SUBJECTS — and they are deliberately different
 *
 *   packages/core/docs/llms.txt        the component API index      (committed)
 *   packages/core/docs/llms-full.txt   the full component API       (committed)
 *   apps/landing/public/llms.txt       the ready-made BLOCKS index  (committed)
 *   apps/landing/public/llms-full.txt  the BLOCKS catalog + source  (committed)
 *
 * The task's `<stop_conditions>` asked whether the two shipped copies differ in
 * a way that implies an intentional per-app difference. They do — one documents
 * components, one documents blocks, they cross-link, and `llmsText.ts` says so
 * in prose. They were **not** unified. Both are gated here instead, because
 * "generated but ungated" was the actual defect in both.
 *
 * CLAUSE GROUPS
 *
 *   A. freshness (components) — committed output vs a fresh render of
 *      `component-meta.json` + the curated intro source.
 *   B. freshness (blocks)     — delegated to `build-registry.ts --check-llms`,
 *      which loads the same catalog through Vite and compares WITHOUT writing.
 *      `packages/tooling` may not depend on `@dzup-ui/*`, so this is the same
 *      delegation `validate:mcp` uses for `packages/mcp`.
 *   C. structural             — balanced fences, square GFM tables, exactly one
 *      H1. Absorbed verbatim from the deleted `validate-llms.mjs`, and now
 *      applied to all four documents rather than two.
 *   D. parseability           — the generated index and full document are
 *      re-parsed with the SAME expectations `@dzup-ui/mcp` has, and every
 *      `public-component` in the ownership manifest must be found in both. This
 *      is the clause that keeps A1's finding F1 closed.
 *   E. reachability           — `apps/storybook/scripts/build-llms.mjs` must
 *      still copy both files into the served `public/` dir, matched by the CALL
 *      and not by a substring (N2-A2 finding F-4: a clause that matches a
 *      filename can be satisfied by a comment).
 *   F. no second extractor    — `build-llms.mjs` must not import TypeScript or
 *      read a `.types.ts`. It was a 567-line second extractor; constraint B9
 *      says there is one.
 *   G. curated-source hygiene — the hand-written intro source may not state a
 *      catalog count. Its ancestor hard-coded "the 11 component families" while
 *      the catalog had 12.
 *   H. ratchets               — downward-only extraction debt.
 *
 * Usage: tsx packages/tooling/src/validators/llms.ts [--all] [--no-blocks]
 *   --all       print every message rather than the first 40
 *   --no-blocks skip clause group B (the ~20 s Vite catalog load)
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as curatedContent from '../llms/llms-content.ts'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
export const CEILINGS_PATH = resolve(ROOT, 'packages/tooling/src/validators/llms-ceilings.json')

export interface LlmsCeilings {
  publicComponentsUnreachableFromLlms: { ceiling: number }
  componentsWithoutDescription: { ceiling: number }
  publicComponentsWithNoMembers: { ceiling: number }
  publicComponentsWithoutExampleInLlms: { ceiling: number }
}

export interface Report {
  errors: string[]
  notes: string[]
}

// ── C. structural checks (absorbed from apps/storybook/scripts/validate-llms.mjs)

/**
 * Structural problems in one markdown document.
 *
 * These files are consumed by machines, so a ragged table or an unbalanced
 * fence silently corrupts everything downstream of it. Table columns are split
 * on UNESCAPED pipes only — `\|` inside a cell is a literal, which every union
 * type in the props tables relies on.
 */
export function structuralProblems(name: string, text: string): string[] {
  const lines = text.split(/\r?\n/)
  const errors: string[] = []

  let fences = 0
  for (const l of lines) {
    if (l.trim().startsWith('```'))
      fences++
  }
  if (fences % 2 !== 0)
    errors.push(`${name}: unbalanced code fences (${fences})`)

  let inFence = false
  let table: string[] = []
  let tableStart = 0
  const flush = (): void => {
    if (table.length >= 2) {
      const cols = table.map(r => r.split(/(?<!\\)\|/).length)
      if (new Set(cols).size !== 1)
        errors.push(`${name}: table at line ${tableStart} has ragged columns: ${cols.join(',')}`)
    }
    table = []
  }
  lines.forEach((l, i) => {
    if (l.trim().startsWith('```'))
      inFence = !inFence
    if (inFence)
      return
    if (/^\s*\|.*\|\s*$/.test(l)) {
      if (table.length === 0)
        tableStart = i + 1
      table.push(l.trim())
    }
    else {
      flush()
    }
  })
  flush()

  const h1 = lines.filter(l => l.startsWith('# ')).length
  if (h1 !== 1)
    errors.push(`${name}: expected exactly one H1, found ${h1}`)

  return errors
}

// ── D. parseability, mirroring @dzup-ui/mcp's own parsers ───────────────────

/**
 * Component names an MCP client can discover from the index.
 *
 * A deliberate re-implementation of `parseComponentIndex` from
 * `@dzup-ui/mcp/registry`, NOT an import: `packages/tooling` is declared with no
 * `@dzup-ui/*` dependencies, and a gate that imports the thing it is checking
 * cannot catch a change to it. Two independent readers of one format is the
 * same design `validate:tokens:dtcg` uses for the DTCG round-trip.
 */
export function indexComponentNames(md: string): string[] {
  const out: string[] = []
  let family = ''
  for (const line of md.split(/\r?\n/)) {
    const fam = /^##\s+(\S.*)$/.exec(line)
    if (fam) {
      family = fam[1]!.trim()
      continue
    }
    if (family === 'Conventions' || family === '')
      continue
    const head = /^-\s+\*\*([A-Z][A-Za-z0-9]*)\*\*/.exec(line)
    if (head)
      out.push(head[1]!)
  }
  return out
}

/** Component names that have a `### Name` section in the full document. */
export function fullSectionNames(md: string): string[] {
  const out: string[] = []
  for (const line of md.split(/\r?\n/)) {
    const m = /^###\s+([A-Z][A-Za-z0-9]*)\s*$/.exec(line)
    if (m)
      out.push(m[1]!)
  }
  return out
}

/** Components in the index that carry no ` — description` after the bold name. */
export function indexEntriesWithoutDescription(md: string): string[] {
  const out: string[] = []
  let family = ''
  for (const line of md.split(/\r?\n/)) {
    const fam = /^##\s+(\S.*)$/.exec(line)
    if (fam) {
      family = fam[1]!.trim()
      continue
    }
    if (family === 'Conventions' || family === '')
      continue
    const head = /^-\s+\*\*([A-Z][A-Za-z0-9]*)\*\*(.*)$/.exec(line)
    if (head && head[2]!.trim().replace(/^[—–-]\s*/, '') === '')
      out.push(head[1]!)
  }
  return out
}

// ── G. curated-source hygiene ───────────────────────────────────────────────

/**
 * Catalog counts hard-typed into curated prose that is actually rendered.
 *
 * The fifth sighting of the hand-typed-facts class in this program, and the one
 * this gate's own ancestor committed: `build-llms.mjs` documented "the 11
 * component families" above a `FAMILY_LABELS` map that was missing the 12th.
 *
 * Two deliberate narrowings, each of which the first run of this clause forced:
 *
 *   1. Only rendered strings are scanned, not the whole source file. The first
 *      version read the file as text and failed on a code comment that
 *      describes the historical defect. A comment is not a claim to a reader
 *      of `llms.txt`.
 *   2. Two or more digits. Every catalog count in this repository is ≥ 2
 *     digits (144 · 208 · 64 · 87 · 12), while single digits in this prose are
 *     framework versions — "the Vue 3 component library" is not a count. A
 *     hand-typed single-digit count would slip through; that is a stated limit,
 *     not an oversight.
 */
export function hardTypedCounts(strings: readonly string[]): string[] {
  const out: string[] = []
  const re = /\b\d{2,}\s+(components?|families|props|events|slots|blocks|tokens|variants|tiers)\b/gi
  for (const s of strings) {
    for (const m of s.matchAll(re))
      out.push(m[0])
  }
  return out
}

/** Every string a module exports, flattened out of scalars, arrays and records. */
export function exportedStrings(mod: Record<string, unknown>): string[] {
  const out: string[] = []
  const walk = (value: unknown): void => {
    if (typeof value === 'string')
      out.push(value)
    else if (Array.isArray(value))
      value.forEach(walk)
    else if (value !== null && typeof value === 'object')
      Object.values(value).forEach(walk)
  }
  Object.values(mod).forEach(walk)
  return out
}

// ── Inputs ──────────────────────────────────────────────────────────────────

interface OwnershipEntry { symbol: string, kind: string }

function readText(rel: string): string | null {
  const abs = resolve(ROOT, rel)
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null
}

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(ROOT, rel), 'utf8')) as T
}

/** The four documents this gate governs, as `[label, repo-relative path]`. */
export const DOCUMENTS: ReadonlyArray<readonly [string, string]> = [
  ['components index', 'packages/core/docs/llms.txt'],
  ['components full', 'packages/core/docs/llms-full.txt'],
  ['blocks index', 'apps/landing/public/llms.txt'],
  ['blocks full', 'apps/landing/public/llms-full.txt'],
] as const

const BUILD_LLMS = 'apps/storybook/scripts/build-llms.mjs'
const CURATED = 'packages/tooling/src/llms/llms-content.ts'

// ── The run ─────────────────────────────────────────────────────────────────

export interface CheckOptions {
  /** Skip clause group B (the ~20 s Vite catalog load). */
  skipBlocks?: boolean
  /** Override the curated strings clause G scans. Tests use this; the CLI never does. */
  curatedStrings?: readonly string[]
}

export function checkLlmsDocs(opts: CheckOptions = {}): Report & { stats: Record<string, number> } {
  const r: Report = { errors: [], notes: [] }
  const stats: Record<string, number> = {}
  const curatedStrings = opts.curatedStrings
    ?? exportedStrings(curatedContent as unknown as Record<string, unknown>)

  // ── A. freshness, components ──────────────────────────────────────────────
  try {
    const out = execFileSync(
      process.execPath,
      [
        resolve(ROOT, 'node_modules/tsx/dist/cli.mjs'),
        resolve(ROOT, 'packages/tooling/src/llms/generate-llms.ts'),
        '--check',
      ],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
    r.notes.push(out.trim())
  }
  catch (err) {
    const e = err as { stderr?: string, stdout?: string, message?: string }
    r.errors.push(
      `[freshness/components] the committed llms docs disagree with a fresh render:\n`
      + `${(e.stderr ?? e.stdout ?? e.message ?? '').trim()}`,
    )
  }

  // ── B. freshness, blocks ─────────────────────────────────────────────────
  if (opts.skipBlocks === true) {
    r.notes.push(
      '  · blocks freshness SKIPPED (--no-blocks). The two apps/landing/public/llms*.txt '
      + 'files were not compared against the BLOCKS catalog on this run.',
    )
  }
  else {
    try {
      const out = execFileSync(
        process.execPath,
        [
          resolve(ROOT, 'node_modules/tsx/dist/cli.mjs'),
          resolve(ROOT, 'apps/landing/scripts/build-registry.ts'),
          '--check-llms',
        ],
        { cwd: resolve(ROOT, 'apps/landing'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      )
      r.notes.push(out.trim())
    }
    catch (err) {
      const e = err as { stderr?: string, stdout?: string, message?: string }
      r.errors.push(
        `[freshness/blocks] apps/landing/public/llms*.txt disagree with the BLOCKS catalog:\n`
        + `${(e.stderr ?? e.stdout ?? e.message ?? '').trim()}`,
      )
    }
  }

  // ── C. structural ────────────────────────────────────────────────────────
  const texts = new Map<string, string>()
  for (const [label, path] of DOCUMENTS) {
    const text = readText(path)
    if (text === null) {
      r.errors.push(`[structure] ${path} (${label}) does not exist.`)
      continue
    }
    texts.set(path, text)
    for (const problem of structuralProblems(path, text))
      r.errors.push(`[structure] ${problem}`)
  }

  // ── D. parseability + coverage ───────────────────────────────────────────
  const indexText = texts.get('packages/core/docs/llms.txt')
  const fullText = texts.get('packages/core/docs/llms-full.txt')
  const ownership = readJson<{ entries: OwnershipEntry[] }>(
    'packages/core/manifests/component-ownership.manifest.json',
  )
  const publicComponents = ownership.entries
    .filter(e => e.kind === 'public-component')
    .map(e => e.symbol)
    .sort()
  stats.publicComponents = publicComponents.length

  let unreachable: string[] = publicComponents
  if (indexText !== undefined && fullText !== undefined) {
    const indexed = new Set(indexComponentNames(indexText))
    const sectioned = new Set(fullSectionNames(fullText))
    stats.indexEntries = indexed.size
    stats.fullSections = sectioned.size
    unreachable = publicComponents.filter(s => !indexed.has(s) || !sectioned.has(s))
    if (unreachable.length > 0) {
      r.notes.push(
        `  · ${unreachable.length} public component(s) not discoverable through the index and `
        + `full document: ${unreachable.slice(0, 12).join(', ')}`,
      )
    }
    const missingDesc = indexEntriesWithoutDescription(indexText)
    stats.entriesWithoutDescription = missingDesc.length
    if (missingDesc.length > 0)
      r.notes.push(`  · index entries with no description: ${missingDesc.join(', ')}`)

    // Every component section must state either a usage snippet or an explicit
    // absence. A silent gap would read to an agent as "this component has no
    // example", which is a different claim from "no story exists".
    const noUsage = publicComponents.filter((name) => {
      const start = fullText.indexOf(`\n### ${name}\n`)
      if (start === -1)
        return true
      const rest = fullText.slice(start + 1)
      const end = rest.search(/\n###?\s/)
      const section = end === -1 ? rest : rest.slice(0, end)
      return !section.includes('**Usage**') && !section.includes('No published Storybook story')
    })
    stats.publicComponentsWithoutExample = noUsage.length
    if (noUsage.length > 0)
      r.notes.push(`  · public components with neither a usage snippet nor a stated absence: ${noUsage.join(', ')}`)

    // A section with NO Props, Events or Slots table at all. The extractor
    // returned an empty member set for that component — it did not fail, so
    // `validate:component-meta`'s `unclassifiable` ratchet is blind to it, and
    // an agent reading this document is told the component has no API rather
    // than being told nothing. Measured here because this is the document the
    // agent reads. See the TASK-N2-A3 handoff, finding F-1.
    const noMembers = publicComponents.filter((name) => {
      const start = fullText.indexOf(`\n### ${name}\n`)
      if (start === -1)
        return false
      const rest = fullText.slice(start + 1)
      const end = rest.search(/\n###?\s/)
      const section = end === -1 ? rest : rest.slice(0, end)
      return !section.includes('**Props**')
        && !section.includes('**Events**')
        && !section.includes('**Slots**')
    })
    stats.publicComponentsWithNoMembers = noMembers.length
    if (noMembers.length > 0) {
      r.notes.push(
        `  · public components published with NO props, events or slots — the extractor `
        + `returned nothing for them: ${noMembers.join(', ')}`,
      )
    }
  }
  else {
    stats.publicComponentsWithoutExample = publicComponents.length
    stats.publicComponentsWithNoMembers = -1
  }
  stats.publicComponentsUnreachable = unreachable.length

  // ── E. reachability: the served copies must still be produced ────────────
  const buildLlms = readText(BUILD_LLMS)
  if (buildLlms === null) {
    r.errors.push(`[reachability] ${BUILD_LLMS} does not exist.`)
  }
  else {
    // Match the CALL and both destination paths, never a bare filename — a
    // substring clause is satisfied by a comment (N2-A2 finding F-4).
    const copies = /await\s+copyFile\(\s*from\s*,\s*resolve\(\s*appRoot\s*,\s*dest\s*\)\s*\)/.test(buildLlms)
    const declares = /'packages\/core\/docs\/llms\.txt'\s*,\s*'public\/llms\.txt'/.test(buildLlms)
      && /'packages\/core\/docs\/llms-full\.txt'\s*,\s*'public\/llms-full\.txt'/.test(buildLlms)
    if (!copies || !declares) {
      r.errors.push(
        `[reachability] ${BUILD_LLMS} no longer copies the generated llms docs into `
        + `apps/storybook/public/. Storybook serves that directory and the landing build nests `
        + `the result at /storybook/, so without the copy the deployed /storybook/llms.txt is `
        + `stale or missing and every MCP client's list_components / get_component answers from `
        + `whatever was last built — while a local checkout keeps working through the `
        + `packages/core/docs fallback, so the failure is invisible in development.`,
      )
    }

    // ── F. no second extractor (constraint B9) ────────────────────────────
    if (/from\s+'typescript'/.test(buildLlms) || /\.types\.ts/.test(buildLlms.replace(/^\s*\*.*$/gm, ''))) {
      r.errors.push(
        `[b9] ${BUILD_LLMS} parses component sources again. There is exactly one component-API `
        + `extraction in this repository (packages/core/docs/component-meta.json). A field this `
        + `script needs is added to packages/tooling/src/meta/ and regenerated, never re-derived `
        + `here — that second extractor is what shipped 43 components' worth of blind spot.`,
      )
    }
  }

  // ── G. curated-source hygiene ────────────────────────────────────────────
  if (!existsSync(resolve(ROOT, CURATED))) {
    r.errors.push(`[curated] ${CURATED} does not exist — the intro prose has no source.`)
  }
  else {
    const counts = hardTypedCounts(curatedStrings)
    stats.curatedStrings = curatedStrings.length
    if (counts.length > 0) {
      r.errors.push(
        `[curated] ${CURATED} states a catalog count in hand-written prose: `
        + `${counts.map(c => `"${c}"`).join(', ')}. Every number in llms.txt must come from the `
        + `artifact; a hand-typed one is the drift this gate exists to prevent.`,
      )
    }
  }

  // ── H. ratchets ──────────────────────────────────────────────────────────
  const ceilings = readJson<LlmsCeilings>('packages/tooling/src/validators/llms-ceilings.json')
  const ratchets: Array<[keyof LlmsCeilings, number]> = [
    ['publicComponentsUnreachableFromLlms', stats.publicComponentsUnreachable!],
    ['componentsWithoutDescription', stats.entriesWithoutDescription ?? -1],
    ['publicComponentsWithNoMembers', stats.publicComponentsWithNoMembers ?? -1],
    ['publicComponentsWithoutExampleInLlms', stats.publicComponentsWithoutExample!],
  ]
  for (const [key, value] of ratchets) {
    if (value < 0)
      continue
    const ceiling = ceilings[key].ceiling
    if (value > ceiling) {
      r.errors.push(
        `[ratchet] \`${key}\` is ${value}, above the ceiling of ${ceiling}. Ratchets move one way only.`,
      )
    }
    else if (value < ceiling) {
      r.errors.push(
        `[ratchet] \`${key}\` fell to ${value} (ceiling ${ceiling}). Lower it in `
        + `packages/tooling/src/validators/llms-ceilings.json so the improvement is held.`,
      )
    }
  }

  return { ...r, stats }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const all = process.argv.includes('--all')
  const skipBlocks = process.argv.includes('--no-blocks')
  const { errors, notes, stats } = checkLlmsDocs({ skipBlocks })

  console.warn('llms docs — TASK-N2-A3\n')
  for (const [label, path] of DOCUMENTS) {
    const abs = resolve(ROOT, path)
    const size = existsSync(abs) ? `${readFileSync(abs).length} B` : 'MISSING'
    console.warn(`  ${label.padEnd(18)} ${path.padEnd(36)} ${size}`)
  }
  console.warn('')
  for (const n of notes)
    console.warn(n)
  console.warn(
    `\n  ratchets: publicComponentsUnreachableFromLlms ${stats.publicComponentsUnreachable} · `
    + `componentsWithoutDescription ${stats.entriesWithoutDescription} · `
    + `publicComponentsWithNoMembers ${stats.publicComponentsWithNoMembers} · `
    + `publicComponentsWithoutExampleInLlms ${stats.publicComponentsWithoutExample}`,
  )

  if (errors.length > 0) {
    console.error('')
    for (const e of (all ? errors : errors.slice(0, 40)))
      console.error(`✗ ${e}`)
    if (!all && errors.length > 40)
      console.error(`  …and ${errors.length - 40} more (run with --all)`)
    process.exitCode = 1
  }
  else {
    console.warn(
      `\n✓ llms: both documents fresh against the metadata artifact, structurally sound, and `
      + `every one of the ${stats.publicComponents} public components discoverable by an MCP client.`,
    )
  }
}
/* c8 ignore stop */
