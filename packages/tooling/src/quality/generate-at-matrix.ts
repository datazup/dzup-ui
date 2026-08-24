/**
 * Manual AT task-matrix generator (TASK-OSS-P5-04).
 *
 * Writes one `e2e/at-matrix/{Component}.md` per Tier B–D component and the
 * `e2e/at-matrix/index.json` that `validate:at-matrix` and the capability
 * matrix read.
 *
 * **The generator owns the header; the human owns the rows.** Each file is
 * split by a marker: everything above `<!-- results -->` is regenerated from
 * the quality matrix and the APG pattern, and everything below it is preserved
 * verbatim. So re-running this after a pattern changes updates the tasks
 * without touching a single recorded run, and a recorded run cannot be lost to
 * a regeneration — which is the failure mode that turns an evidence file into a
 * file nobody trusts.
 *
 * `index.json` is derived from the rows, so it cannot claim a result the
 * markdown does not show.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-at-matrix.ts
 */

import type { AtMatrixEntry, AtMatrixIndex, AtResult, AtResultRow } from './at-matrix.ts'
import type { QualityMatrixRow } from './generate-quality-matrix.ts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import {
  AT_MATRIX_SCHEMA_VERSION,
  AT_PAIRS,
  AT_RESULTS,
  tasksFor,
} from './at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'
import { lastCommitFor } from './git.ts'

export const AT_MATRIX_DIR = resolve(ROOT, 'e2e/at-matrix')
export const AT_MATRIX_INDEX = resolve(AT_MATRIX_DIR, 'index.json')

/** Everything below this line is a human's; the generator never rewrites it. */
export const RESULTS_MARKER = '<!-- results: append-only. The generator never rewrites below here. -->'

/** The generated header for one component. */
export function renderHeader(row: QualityMatrixRow): string {
  const tasks = tasksFor({ pattern: row.pattern, traits: row.traits, wcag: row.wcag })

  const taskRows = tasks
    .map(t => `| \`${t.id}\` | ${t.task} | ${t.expect} |`)
    .join('\n')

  const pairRows = AT_PAIRS
    .map(p => `| \`${p.id}\` | ${p.at} + ${p.browser} (${p.platform}) | ${p.purpose} |`)
    .join('\n')

  return `<!-- AUTO-GENERATED HEADER — do not edit. Written by \`yarn generate:at-matrix\`. -->

# ${row.component} — manual AT task matrix

**Tier ${row.tier} · APG pattern \`${row.pattern}\` · source \`${row.source}\`**

Automated checks cover semantics, contrast and DOM relationships. They do not
cover whether somebody using a screen reader can tell what happened. These
tasks are the part a human has to do.

Record every run as a **new row** in the results table. Never edit a row that is
already there: the history is what distinguishes a new regression from a
known one.

## Tasks

| id | Do this | The AT must |
|---|---|---|
${taskRows}

## Pairs

| id | Pairing | What it exposes |
|---|---|---|
${pairRows}

## How to record a run

Append one row per \`{task, pair}\` you actually drove. \`result\` is one of
${AT_RESULTS.map(r => `\`${r}\``).join(', ')}. \`unrun\` means the AT or the
device was not available — it is a fact, not a placeholder, and it must not be
written as \`fail\`. \`sourceCommit\` is the repository HEAD you observed;
\`validate:at-matrix\` marks a row stale when the component has changed since.

${RESULTS_MARKER}

## Results

| pair | result | versions | tester | date | sourceCommit | notes |
|---|---|---|---|---|---|---|
${AT_PAIRS.map(p => `| ${p.id} | unrun | - | - | - | - | not executed |`).join('\n')}
`
}

/** Parse the results table below the marker. */
export function parseResults(markdown: string): AtResultRow[] {
  const below = markdown.split(RESULTS_MARKER)[1]
  if (below === undefined)
    return []

  const rows: AtResultRow[] = []
  for (const line of below.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|'))
      continue
    const cells = trimmed.slice(1, -1).split('|').map(c => c.trim())
    if (cells.length !== 7)
      continue
    // Skip the header and its separator.
    if (cells[0] === 'pair' || /^-+$/.test(cells[0] ?? ''))
      continue
    rows.push({
      pair: cells[0]!,
      result: cells[1] as AtResult,
      versions: cells[2]!,
      tester: cells[3]!,
      date: cells[4]!,
      sourceCommit: cells[5]!,
      notes: cells[6]!,
    })
  }
  return rows
}

/**
 * Write or refresh one component's file, preserving everything below the
 * marker.
 */
export function renderFile(row: QualityMatrixRow, existing: string | undefined): string {
  const header = renderHeader(row)
  if (existing === undefined)
    return header

  const below = existing.split(RESULTS_MARKER)[1]
  if (below === undefined) {
    // A file with no marker predates this format, or was hand-written. Keep it
    // whole rather than discarding somebody's records to impose a shape.
    return existing
  }
  return `${header.split(RESULTS_MARKER)[0]!}${RESULTS_MARKER}${below}`
}

/** Build the index from the files on disk. */
export function buildAtIndex(
  rows: readonly QualityMatrixRow[],
  read: (component: string) => string | undefined,
): AtMatrixIndex {
  const entries: AtMatrixEntry[] = rows
    .filter(row => row.tier !== 'A')
    .sort((a, b) => compareSymbols(a.component, b.component))
    .map((row) => {
      const markdown = read(row.component)
      return {
        component: row.component,
        tier: row.tier,
        pattern: row.pattern,
        file: `e2e/at-matrix/${row.component}.md`,
        tasks: tasksFor({ pattern: row.pattern, traits: row.traits, wcag: row.wcag })
          .map(t => t.id),
        rows: markdown === undefined ? [] : parseResults(markdown),
        componentCommit: lastCommitFor(row.source),
      }
    })

  return {
    schemaVersion: AT_MATRIX_SCHEMA_VERSION,
    generatedFrom: [
      'packages/core/docs/quality-matrix.json',
      'e2e/at-matrix/*.md',
    ],
    pairs: AT_PAIRS,
    entries,
  }
}

/** Serialize with a trailing newline. */
export function serializeIndex(index: AtMatrixIndex): string {
  return `${JSON.stringify(index, null, 2)}\n`
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }

  mkdirSync(AT_MATRIX_DIR, { recursive: true })

  const targets = matrix.components.filter(row => row.tier !== 'A')
  let created = 0
  for (const row of targets) {
    const path = resolve(AT_MATRIX_DIR, `${row.component}.md`)
    const existing = existsSync(path) ? readFileSync(path, 'utf8') : undefined
    if (existing === undefined)
      created++
    writeFileSync(path, renderFile(row, existing), 'utf8')
  }

  const index = buildAtIndex(matrix.components, (component) => {
    const path = resolve(AT_MATRIX_DIR, `${component}.md`)
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
  })
  writeFileSync(AT_MATRIX_INDEX, serializeIndex(index), 'utf8')

  const executed = index.entries.flatMap(e => e.rows).filter(r => r.result !== 'unrun').length
  const total = index.entries.flatMap(e => e.rows).length
  console.warn(
    `at-matrix: ${targets.length} Tier B–D components (${created} file(s) created), `
    + `${executed}/${total} rows executed`,
  )
  console.warn(`  → e2e/at-matrix/`)
}
/* c8 ignore stop */
