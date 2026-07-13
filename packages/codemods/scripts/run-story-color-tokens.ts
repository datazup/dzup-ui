/**
 * Apply the `story-color-tokens` transform across the story corpus (TASK-DS-05).
 *
 * Usage:
 *   tsx packages/codemods/scripts/run-story-color-tokens.ts --dry-run
 *   tsx packages/codemods/scripts/run-story-color-tokens.ts
 *
 * Exits non-zero when any literal could not be classified, or when the
 * transform emits a `--dz-*` token that `packages/tokens/dist/tokens.css` does
 * not actually define. Guessing a token name is the one failure mode a codemod
 * like this must not have.
 */

import type { UnclassifiedLiteral } from '../src/transforms/story-color-tokens.ts'
import { globSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { transformStoryColors } from '../src/transforms/story-color-tokens.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')
const STORIES_GLOB = 'packages/core/stories/**/*.stories.ts'
const TOKENS_CSS = resolve(ROOT, 'packages/tokens/dist/tokens.css')

const dryRun = process.argv.includes('--dry-run')

/** Every `--dz-*` custom property the repo actually defines. */
function definedTokens(): Set<string> {
  const names = new Set<string>()
  const sources = [
    readFileSync(TOKENS_CSS, 'utf8'),
    // Component-local anatomy tokens (ADR-17's hybrid model) live in core.
    ...globSync('packages/core/src/**/*.{ts,vue,css}', { cwd: ROOT })
      .map(f => readFileSync(resolve(ROOT, f), 'utf8')),
  ]
  for (const src of sources) {
    for (const m of src.matchAll(/(--dz-[a-z0-9-]+)\s*:/gi)) names.add(m[1]!)
  }
  return names
}

/** `var(--dz-x)` references in `code` that were not already in `source`. */
function introducedTokens(source: string, code: string): Set<string> {
  const before = new Set([...source.matchAll(/var\((--dz-[a-z0-9-]+)\)/gi)].map(m => m[1]!))
  const after = new Set([...code.matchAll(/var\((--dz-[a-z0-9-]+)\)/gi)].map(m => m[1]!))
  for (const t of before) after.delete(t)
  return after
}

// --- Main --------------------------------------------------------------------

const known = definedTokens()
const files = globSync(STORIES_GLOB, { cwd: ROOT })

const allUnclassified: Array<UnclassifiedLiteral & { file: string }> = []
const unknownTokens = new Map<string, string[]>()
const preExistingUnknown = new Map<string, string[]>()
const changedFiles: Array<[string, number]> = []

for (const rel of files) {
  const abs = resolve(ROOT, rel)
  const source = readFileSync(abs, 'utf8')
  const { code, unclassified, replaced } = transformStoryColors(source)

  for (const u of unclassified) allUnclassified.push({ ...u, file: rel })

  // Every token this transform *introduces* must exist. Tokens the story
  // already referenced are somebody else's bug — reported, not fatal.
  for (const name of introducedTokens(source, code)) {
    if (!known.has(name)) {
      if (!unknownTokens.has(name))
        unknownTokens.set(name, [])
      unknownTokens.get(name)!.push(rel)
    }
  }
  for (const m of source.matchAll(/var\((--dz-[a-z0-9-]+)\)/gi)) {
    const name = m[1]!
    if (!known.has(name)) {
      if (!preExistingUnknown.has(name))
        preExistingUnknown.set(name, [])
      if (!preExistingUnknown.get(name)!.includes(rel))
        preExistingUnknown.get(name)!.push(rel)
    }
  }

  if (code !== source) {
    changedFiles.push([rel, replaced])
    if (!dryRun)
      writeFileSync(abs, code)
  }
}

// --- Report ------------------------------------------------------------------

const verb = dryRun ? 'would change' : 'changed'
console.warn(`story-color-tokens: ${verb} ${changedFiles.length} of ${files.length} story files\n`)
for (const [f, n] of changedFiles.sort((a, b) => b[1] - a[1]).slice(0, 15))
  console.warn(`  ${String(n).padStart(3)} class lists  ${relative('packages/core/stories', f)}`)
if (changedFiles.length > 15)
  console.warn(`  … and ${changedFiles.length - 15} more`)

let failed = false

if (preExistingUnknown.size > 0) {
  console.warn(`\n! ${preExistingUnknown.size} token(s) referenced by stories but defined nowhere (pre-existing, not introduced here):\n`)
  for (const [name, where] of preExistingUnknown)
    console.warn(`  ${name}  → ${where.join(', ')}`)
}

if (unknownTokens.size > 0) {
  failed = true
  console.error(`\n✗ transform emitted ${unknownTokens.size} token(s) not defined in tokens.css:\n`)
  for (const [name, where] of unknownTokens)
    console.error(`  ${name}  (${where.length} file(s), e.g. ${where[0]})`)
}

if (allUnclassified.length > 0) {
  failed = true
  // Group by reason so the hand-resolution list reads as work items.
  const byReason = new Map<string, Array<UnclassifiedLiteral & { file: string }>>()
  for (const u of allUnclassified) {
    if (!byReason.has(u.reason))
      byReason.set(u.reason, [])
    byReason.get(u.reason)!.push(u)
  }
  console.error(`\n✗ ${allUnclassified.length} literal(s) left for a human, grouped by reason:\n`)
  for (const [reason, items] of [...byReason].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  ${reason} — ${items.length}`)
    for (const i of items) console.error(`      ${i.file}:${i.line}  ${i.utility}`)
  }
  console.error('\nResolve each by hand, then re-run. This transform never guesses.')
}

if (failed)
  process.exit(1)

console.warn('\n✓ every literal classified; every emitted token exists in tokens.css')
