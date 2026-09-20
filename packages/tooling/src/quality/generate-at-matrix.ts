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
// Relative into contracts' SOURCE rather than the `@dzup-ui/contracts`
// specifier, for the reason `generate-quality-matrix.ts` states: this runs under
// `tsx` with no build step, and `requiredAtPairs` is a runtime value, not a
// type. The package specifier resolves to `dist/`, which need not exist and need
// not be current.
import { requiredAtPairs } from '../../../contracts/src/quality-tiers.ts'
import { parseAnatomySource } from '../ownership/anatomy-source.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import {
  ALL_TASKS,
  AT_MATRIX_SCHEMA_VERSION,
  AT_PAIRS,
  AT_RESULTS,
  optedOutTasksFor,
  tasksFor,
} from './at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'
import { lastCommitFor } from './git.ts'

export const AT_MATRIX_DIR = resolve(ROOT, 'e2e/at-matrix')
export const AT_MATRIX_INDEX = resolve(AT_MATRIX_DIR, 'index.json')

/** Everything below this line is a human's; the generator never rewrites it. */
export const RESULTS_MARKER = '<!-- results: append-only. The generator never rewrites below here. -->'

/**
 * The keys a tester is expected to drive, cited from the component's own
 * declared keyboard contract (TASK-R5-O5).
 *
 * The `navigate` task says *"move through the collection with the pattern's own
 * keys"*, which asks the tester to know the APG pattern from memory and to
 * guess where this component departs from it. It departs often — `DzMenu` is
 * assigned APG `menu` and implements no roving index at all — and a tester
 * driving the pattern instead of the component reports a failure against a
 * behaviour nobody promised.
 *
 * So the scaffold cites the **contract**, which is the same declaration the
 * documentation page renders and the capability matrix measures the unit spec
 * against. One source, three readers; a tester who finds the table wrong has
 * found a defect in the component or in the contract, and either is worth
 * having.
 */
export function renderKeyboardCitation(row: QualityMatrixRow): string {
  const anatomyPath = row.source.replace(/\.vue$/, '.anatomy.ts')
  const abs = resolve(ROOT, anatomyPath)
  const contract = existsSync(abs)
    ? parseAnatomySource(readFileSync(abs, 'utf8'), anatomyPath).anatomy?.keyboard
    : undefined

  if (contract === undefined) {
    return `## Declared keyboard contract

**None declared.** \`${row.component}\` has no machine-readable keyboard contract, so the keys below
are whatever the APG \`${row.pattern}\` pattern names and whatever the component happens to do. Drive
the pattern, and record any difference you find as a note — that difference is the contract nobody
has written down yet.

`
  }

  if (contract === 'none') {
    return `## Declared keyboard contract

\`${row.component}\` declares \`keyboard: 'none'\` in \`${anatomyPath}\` — an explicit claim that it
has no keyboard behaviour of its own. Any key that appears to do something here is either the
platform's or its container's, and is worth a note.

`
  }

  const rows = contract
    .map((b) => {
      const key = b.key === ' ' ? '`Space`' : b.key.startsWith('<') ? `any ${b.key.slice(1, -1)} key` : `\`${b.key}\``
      const chord = [...(b.modifiers ?? []).map(m => `\`${m}\``), key].join(' + ')
      return `| ${chord} | ${b.when ?? '—'} | ${b.action} |`
    })
    .join('\n')

  return `## Declared keyboard contract

Drive **these** keys, not the pattern's from memory. They are declared in
\`${anatomyPath}\` and are the same rows the component's documentation page publishes. A key that
does not do what this table says is a defect in the component **or** in the contract — record which,
in a note.

| Key | Where | Must |
|---|---|---|
${rows}

`
}

/** The generated header for one component. */
export function renderHeader(row: QualityMatrixRow): string {
  const tasks = tasksFor({ pattern: row.pattern, traits: row.traits, wcag: row.wcag })

  const taskRows = tasks
    .map(t => `| \`${t.id}\` | ${t.task} | ${t.expect} |`)
    .join('\n')

  const required = new Set(requiredAtPairs(row.tier))
  const pairRows = AT_PAIRS
    .map(p => `| \`${p.id}\` | ${required.has(p.id) ? '**required**' : 'optional'} `
      + `| ${p.at} + ${p.browser} (${p.platform}) | ${p.purpose} |`)
    .join('\n')

  const optOuts = optedOutTasksFor(row.component)
  const optOutSection = optOuts.length === 0
    ? ''
    : `### Tasks this component does not owe

The \`${row.pattern}\` pattern implies ${optOuts.length === 1 ? 'a task' : 'tasks'} this component has
no surface for. ${optOuts.length === 1 ? 'It is' : 'They are'} excluded from the table above and from
what qualification requires — recorded here rather than dropped silently, because an obligation that
disappears without a reason is how a matrix stops being read.

${optOuts.map(o => `- \`${o.task}\` — ${o.why}`).join('\n')}

`

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

${optOutSection}${renderKeyboardCitation(row)}## Pairs

A **required** pairing holds this component's evidence state: its \`at-manual\` row
cannot read \`pass\` until every task above has passed on every required pairing.
Which ones are required follows the tier, from \`requiredAtPairs()\` in
\`@dzup-ui/contracts\` — Tier ${row.tier} requires ${required.size} of ${AT_PAIRS.length}.
An **optional** pairing is still worth running and is still recorded if you run
it; it simply does not gate qualification.

| id | Tier ${row.tier} | Pairing | What it exposes |
|---|---|---|---|
${pairRows}

## How to record a run

Append one row per \`{task, pair}\` you actually drove. \`result\` is one of
${AT_RESULTS.map(r => `\`${r}\``).join(', ')}. \`unrun\` means the AT or the
device was not available — it is a fact, not a placeholder, and it must not be
written as \`fail\`. \`sourceCommit\` is the repository HEAD you observed;
\`validate:at-matrix\` marks a row stale when the component has changed since.

\`task\` is one of the ids in the Tasks table above, or \`${ALL_TASKS}\` for a row
that covers every task at once. The generated rows below use \`${ALL_TASKS}\`:
they say "nobody has run this pairing", which is true of every task equally.
**Leave them in place and append beneath them** — they are the matrix's
denominator, and a run that replaces one instead of following it destroys the
record it was supposed to add to.

${RESULTS_MARKER}

## Results

| pair | task | result | versions | tester | date | sourceCommit | notes |
|---|---|---|---|---|---|---|---|
${AT_PAIRS.map(p => `| ${p.id} | ${ALL_TASKS} | unrun | - | - | - | - | not executed |`).join('\n')}
`
}

/**
 * Parse the results table below the marker.
 *
 * Accepts **both** row widths. The eight-column form is the current one, with
 * `task` in position 2 (TASK-R2-O2); the seven-column form is the original and
 * is read as a row covering {@link ALL_TASKS}, which is what it always meant.
 *
 * The tolerance is not politeness, it is the append-only guarantee. A recorded
 * run is somebody's screen-reader session and the only copy of it; a parser that
 * silently skipped the old width would drop those rows out of `index.json`,
 * which would read as "never executed" — the same falsehood this task exists to
 * remove, arriving from the other direction.
 */
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
    if (cells.length !== 8 && cells.length !== 7)
      continue
    // Skip the header and its separator.
    if (cells[0] === 'pair' || /^-+$/.test(cells[0] ?? ''))
      continue
    const wide = cells.length === 8
    rows.push({
      pair: cells[0]!,
      task: wide ? cells[1]! : ALL_TASKS,
      result: (wide ? cells[2] : cells[1]) as AtResult,
      versions: (wide ? cells[3] : cells[2])!,
      tester: (wide ? cells[4] : cells[3])!,
      date: (wide ? cells[5] : cells[4])!,
      sourceCommit: (wide ? cells[6] : cells[5])!,
      notes: (wide ? cells[7] : cells[6])!,
    })
  }
  return rows
}

/**
 * Upgrade a results table that carries **no human record** to the current row
 * width, and leave every other table exactly as it is.
 *
 * The generator never rewrites below {@link RESULTS_MARKER}; that rule is what
 * makes the scaffold trustworthy, and adding a column does not suspend it. But
 * the 534 rows in this repository today were all written by the generator and
 * all read `unrun` — they are the scaffold's own default, not anybody's
 * evidence — and leaving them at seven columns would mean the first tester to
 * append an eight-column row sees a table with two shapes in it.
 *
 * So the migration is conditional and the condition is the one that matters:
 * **every row is `unrun`**. One recorded run anywhere in the table and the whole
 * table is left untouched, to be widened by hand or not at all. A row that
 * somebody drove is never rewritten by a tool, including this one.
 */
export function migrateResultsTable(below: string): string {
  const rows = parseResults(`${RESULTS_MARKER}${below}`)
  if (rows.length === 0 || rows.some(r => r.result !== 'unrun'))
    return below
  if (!below.includes('| pair | result |'))
    return below

  return below
    .replace(
      '| pair | result | versions | tester | date | sourceCommit | notes |',
      '| pair | task | result | versions | tester | date | sourceCommit | notes |',
    )
    .replace('|---|---|---|---|---|---|---|', '|---|---|---|---|---|---|---|---|')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('|') || !trimmed.endsWith('|'))
        return line
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim())
      if (cells.length !== 7 || cells[1] !== 'unrun')
        return line
      return `| ${cells[0]} | ${ALL_TASKS} | ${cells.slice(1).join(' | ')} |`
    })
    .join('\n')
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
  return `${header.split(RESULTS_MARKER)[0]!}${RESULTS_MARKER}${migrateResultsTable(below)}`
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
        tasks: tasksFor({
          pattern: row.pattern,
          traits: row.traits,
          wcag: row.wcag,
          component: row.component,
        }).map(t => t.id),
        requiredPairs: requiredAtPairs(row.tier),
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
