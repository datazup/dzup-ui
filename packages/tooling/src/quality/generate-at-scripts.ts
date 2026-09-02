/**
 * Executable AT test-script generator (TASK-N1-O4).
 *
 * The AT matrix scaffold (TASK-OSS-P5-04) generates, per Tier B–D component,
 * the TASKS a tester owes and the PAIRS they owe them on. It does not generate
 * anything a person can actually execute: "Move through the collection with
 * the pattern's own keys or gestures" is an obligation, not an instruction.
 *
 * This generator writes the instruction. For each Tier C/D component it joins
 * the scaffold's task list to the hand-authored steps in `at-scripts.data.ts`
 * and emits `e2e/at-matrix/scripts/{Component}.at-script.md` — the story to
 * open, the keys to press, and the announcement the AT must produce.
 *
 * **It is not second machinery.** It writes no result, reads no result, and
 * touches nothing under the scaffold's append-only marker. Its whole job is to
 * keep the scripts bound to the scaffold: if a component's pattern changes and
 * the scaffold grows a task, this generator fails until a step exists for it,
 * so the scripts cannot quietly fall behind the obligations.
 *
 * Three checks run on every invocation, and each is a script-QA check rather
 * than a test result:
 *
 *   1. **coverage** — every Tier C/D component has a script, and every scaffold
 *      task has exactly one step. No step names a task the scaffold does not.
 *   2. **story resolution** — every story id a step names exists in the built
 *      Storybook index. A tester sent to a story id Storybook does not know
 *      gets an error page and a wasted session.
 *   3. **drift** — in `--check` mode, the files on disk equal what the data
 *      would produce.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-at-scripts.ts
 *   tsx packages/tooling/src/quality/generate-at-scripts.ts --check
 *
 * Exit code 1 when a check fails.
 */

import type { AtMatrixIndex } from './at-matrix.ts'
import type { AtScriptEntry } from './at-scripts.data.ts'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { AT_PAIRS } from './at-matrix.ts'
import { AT_SCRIPTS } from './at-scripts.data.ts'
import { AT_MATRIX_INDEX } from './generate-at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'

export const AT_SCRIPTS_DIR = resolve(ROOT, 'e2e/at-matrix/scripts')

/** Where the built Storybook index lives, when a build is present. */
const STORYBOOK_INDEX = resolve(ROOT, 'apps/storybook/storybook-static/index.json')

/** Storybook dev server; the static preview the e2e lanes use is 6106. */
const STORYBOOK_ORIGIN = 'http://127.0.0.1:6006'

export interface ScriptViolation {
  rule: 'coverage' | 'task' | 'story' | 'drift'
  message: string
}

/** `/iframe.html?id=…` — the canvas without the Storybook chrome. */
export function storyUrl(storyId: string): string {
  return `${STORYBOOK_ORIGIN}/iframe.html?id=${storyId}&viewMode=story`
}

/** Every story id a script names, entry story included. */
export function storyIdsOf(entry: AtScriptEntry): string[] {
  const ids = new Set<string>([entry.story])
  for (const step of entry.steps) {
    if (step.story !== undefined)
      ids.add(step.story)
  }
  return [...ids]
}

/**
 * Coverage and task checks. Pure, so the checks are the same whether they run
 * from the generator or from `--check`.
 */
export function checkScripts(
  scripts: readonly AtScriptEntry[],
  index: AtMatrixIndex,
  expected: readonly string[],
  knownStoryIds: ReadonlySet<string> | undefined,
): ScriptViolation[] {
  const violations: ScriptViolation[] = []
  const scripted = new Map(scripts.map(s => [s.component, s]))

  for (const component of expected) {
    if (!scripted.has(component)) {
      violations.push({
        rule: 'coverage',
        message: `${component} is Tier C or D and has no AT script. A tester cannot execute `
          + `its cells without one.`,
      })
    }
  }

  for (const entry of scripts) {
    if (!expected.includes(entry.component)) {
      violations.push({
        rule: 'coverage',
        message: `${entry.component} has a script but is not Tier C or D. Either the tier moved `
          + `or the script names a component that does not exist.`,
      })
      continue
    }

    const scaffold = index.entries.find(e => e.component === entry.component)
    if (scaffold === undefined) {
      violations.push({
        rule: 'coverage',
        message: `${entry.component} has a script but no entry in e2e/at-matrix/index.json. `
          + `Run \`yarn generate:at-matrix\` first.`,
      })
      continue
    }

    const covered = entry.steps.map(s => s.task)
    for (const task of scaffold.tasks) {
      const times = covered.filter(t => t === task).length
      if (times === 0) {
        violations.push({
          rule: 'task',
          message: `${entry.component} owes the scaffold task \`${task}\` and the script has no `
            + `step for it. The scaffold decides what is owed; this file only says how.`,
        })
      }
      else if (times > 1) {
        violations.push({
          rule: 'task',
          message: `${entry.component} has ${times} steps for task \`${task}\`. One step per task, `
            + `so a run row maps to a step without ambiguity.`,
        })
      }
    }
    for (const task of new Set(covered)) {
      if (!scaffold.tasks.includes(task)) {
        violations.push({
          rule: 'task',
          message: `${entry.component} has a step for \`${task}\`, which its pattern does not `
            + `imply. Add it to the scaffold's pattern, or drop the step — do not invent an `
            + `obligation here.`,
        })
      }
    }

    if (knownStoryIds !== undefined) {
      for (const id of storyIdsOf(entry)) {
        if (!knownStoryIds.has(id)) {
          violations.push({
            rule: 'story',
            message: `${entry.component} sends the tester to \`${id}\`, which the built Storybook `
              + `index does not contain. Storybook answers an unknown id with its own error page, `
              + `which reads as "the component is broken".`,
          })
        }
      }
    }
  }

  return violations
}

/** Render one component's script. */
export function renderScript(
  entry: AtScriptEntry,
  meta: { tier: string, pattern: string, source: string, tasks: readonly string[] },
): string {
  const setup = entry.setup.map(line => `- ${line}`).join('\n')

  const pairRows = AT_PAIRS
    .map(p => `| \`${p.id}\` | ${p.at} + ${p.browser} (${p.platform}) | ${p.purpose} |`)
    .join('\n')

  const steps = entry.steps.map((step, i) => {
    const n = i + 1
    const story = step.story ?? entry.story
    const head = `### Step ${n} — task \`${step.task}\`\n\n`
      + `**Open:** [\`${story}\`](${storyUrl(story)})\n`

    if (step.notApplicable !== undefined)
      return `${head}\n**Not applicable.** ${step.notApplicable}\n`

    const press = step.press.map(p => `1. ${p}`).join('\n')
    const expect = step.expect.map(e => `- [ ] ${e}`).join('\n')
    return `${head}\n**Do:**\n\n${press}\n\n**The AT must:**\n\n${expect}\n\n`
      + `**Read from:** ${step.apg}\n`
  }).join('\n')

  const defects = entry.knownDefects.length === 0
    ? 'None on the register for this component. Anything that fails here is new — file it.\n'
    : `${entry.knownDefects
      .map(d => `- **${d.id}** — affects \`${d.affects.join('`, `')}\`. ${d.summary}`)
      .join('\n')}\n`

  return `<!-- AUTO-GENERATED — do not edit. Written by \`yarn generate:at-scripts\` from
     packages/tooling/src/quality/at-scripts.data.ts. Edit the data, not this file. -->

# ${entry.component} — AT test script

**Tier ${meta.tier} · APG pattern \`${meta.pattern}\` · source \`${meta.source}\`**

Read [\`README.md\`](./README.md) first — it carries the AT-by-AT key reference,
the recording rules, and what to do when a step fails.

Record the run in [\`../${entry.component}.md\`](../${entry.component}.md), as a
**new row** below the append-only marker. Never edit a row that is already there.

## Before you start

${setup}

## Pairs this component owes

Drive the whole script once per pair. A pair you did not run is \`unrun\`, which
is a fact; it is never \`fail\`.

| id | Pairing | What it exposes |
|---|---|---|
${pairRows}

## Steps

The scaffold says this component owes ${meta.tasks.length} task(s):
${meta.tasks.map(t => `\`${t}\``).join(', ')}. There is exactly one step per task.

${steps}

## Known open defects — read this AFTER you have recorded your result

These are already on the register. If a step failed for one of these reasons,
say so in the row's \`notes\` and reference the id; do **not** file it as a new
defect. If a step failed for any other reason, it **is** new — file it.

${defects}
`
}

/** The shared preamble every script points at. */
export function renderReadme(entries: readonly {
  component: string
  tier: string
  pattern: string
  taskCount: number
}[]): string {
  const rows = entries
    .map(e => `| [\`${e.component}\`](./${e.component}.at-script.md) | ${e.tier} | \`${e.pattern}\` `
      + `| ${e.taskCount} | ${e.taskCount * AT_PAIRS.length} |`)
    .join('\n')

  const totalSteps = entries.reduce((sum, e) => sum + e.taskCount, 0)

  return `<!-- AUTO-GENERATED — do not edit. Written by \`yarn generate:at-scripts\`. -->

# AT test scripts — Tier C/D

Executable scripts for the ${entries.length} Tier C/D components, one per file.
They are the "how" for the obligations in \`e2e/at-matrix/{Component}.md\`, which
stays the only place a result is ever written.

**Nothing in this directory records a result.** Results are append-only rows in
the scaffold file, and only a human writes them.

## Running Storybook

\`\`\`bash
yarn storybook              # http://127.0.0.1:6006
\`\`\`

Every step links to \`/iframe.html?id=…\`, which is the story canvas without the
Storybook chrome — so the AT reads the component and not the sidebar. If you
prefer the full Storybook UI, drop \`iframe.html\` from the URL and open the
story from the sidebar instead; the story ids are the same.

If you are running the built static preview instead of the dev server, the port
is **6106**, not 6006.

## The AT commands the steps assume

| Instruction in a step | NVDA | JAWS | VoiceOver (macOS) | VoiceOver (iOS) | TalkBack |
|---|---|---|---|---|---|
| "Tab to X" | Tab | Tab | Tab | swipe right until X | swipe right until X |
| "Activate" | Enter / Space | Enter / Space | VO+Space | double-tap | double-tap |
| Arrow keys inside a widget | Arrows in focus mode | Arrows in forms mode | VO+Arrows | swipe / rotor | swipe / explore |
| Toggle browse vs focus mode | NVDA+Space | Insert+Z | n/a | n/a | n/a |
| Next link | \`k\` | \`k\` | rotor → Links | rotor → Links | reading control → Links |
| Next table | \`t\` | \`t\` | rotor → Tables | rotor → Tables | reading control → Controls |
| Next landmark | \`d\` | \`r\` | rotor → Landmarks | rotor → Landmarks | reading control → Headings |
| Move between table cells | Ctrl+Alt+Arrows | Ctrl+Alt+Arrows | VO+Arrows | swipe | swipe |

Turn on your AT's speech log before you start (NVDA: Speech Viewer; JAWS:
speech history, Insert+Space then H; VoiceOver: the caption panel). A step that
asks whether something was announced **once** cannot be answered from memory.

## How to record

One row per \`{component, pair}\` in \`e2e/at-matrix/{Component}.md\`, below the
append-only marker:

\`\`\`text
| <pair> | <result> | <AT + browser versions> | <your name> | <YYYY-MM-DD> | <git HEAD> | <notes> |
\`\`\`

- \`result\` is one of \`unrun\`, \`pass\`, \`fail\`, \`partial\`, \`blocked\`.
  \`pass\` means **every** step passed. If one step failed, the row is \`partial\`
  (or \`fail\`), and the notes say which step.
- \`versions\` must be real version numbers — "NVDA 2026.1, Firefox 151.0", not
  "NVDA, Firefox". \`validate:at-matrix\` rejects a non-\`unrun\` row with a dash
  in it, because a result with nothing behind it is worse than \`unrun\`.
- \`sourceCommit\` is the repository HEAD you observed: \`git rev-parse HEAD\`.
  Record it **before** you start, and record whether the worktree was clean
  (\`git status --short\`) in the notes. A run from a dirty worktree is still a
  run; it is just not release evidence.
- **Never edit a row that is already there.** Append. The history is what tells
  a new regression from a known one.

## When a step fails

1. Finish the rest of the steps. A failed step is not a reason to abandon the
   pair — the remaining steps are still evidence.
2. Read the script's "Known open defects" section at the bottom. If it explains
   the failure, reference the defect id in the notes and stop there.
3. If it does not, **file a defect**. A failed step creates a defect entry;
   never a silent re-run, and never a second attempt recorded as the first.
   Record what you heard, verbatim, and what the step said you should have.

## The scripts

| Component | Tier | Pattern | Steps | Cells (steps x ${AT_PAIRS.length} pairs) |
|---|---|---|---|---|
${rows}

**${entries.length} components · ${totalSteps} steps · ${totalSteps * AT_PAIRS.length} step-runs
across all six pairs.** The matrix itself counts a coarser cell — one per
\`{component, pair}\` — so these ${entries.length} components are
**${entries.length * AT_PAIRS.length} of the scaffold's 534 cells**.
`
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const check = process.argv.includes('--check')

  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('✗ quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }
  if (!existsSync(AT_MATRIX_INDEX)) {
    console.error('✗ e2e/at-matrix/index.json is missing. Run `yarn generate:at-matrix` first.')
    process.exit(1)
  }

  const index = JSON.parse(readFileSync(AT_MATRIX_INDEX, 'utf8')) as AtMatrixIndex
  const targets = matrix.components.filter(row => row.tier === 'C' || row.tier === 'D')
  const expected = targets.map(row => row.component)

  let knownStoryIds: Set<string> | undefined
  if (existsSync(STORYBOOK_INDEX)) {
    const built = JSON.parse(readFileSync(STORYBOOK_INDEX, 'utf8')) as { entries: Record<string, unknown> }
    knownStoryIds = new Set(Object.keys(built.entries))
  }

  const violations = checkScripts(AT_SCRIPTS, index, expected, knownStoryIds)

  const rendered = new Map<string, string>()
  for (const entry of AT_SCRIPTS) {
    const row = targets.find(r => r.component === entry.component)
    const scaffold = index.entries.find(e => e.component === entry.component)
    if (row === undefined || scaffold === undefined)
      continue
    rendered.set(`${entry.component}.at-script.md`, renderScript(entry, {
      tier: row.tier,
      pattern: row.pattern,
      source: row.source,
      tasks: scaffold.tasks,
    }))
  }
  rendered.set('README.md', renderReadme(
    AT_SCRIPTS
      .filter(e => expected.includes(e.component))
      .map((e) => {
        const row = targets.find(r => r.component === e.component)!
        return {
          component: e.component,
          tier: row.tier,
          pattern: row.pattern,
          taskCount: e.steps.length,
        }
      }),
  ))

  if (check) {
    const onDisk = existsSync(AT_SCRIPTS_DIR) ? readdirSync(AT_SCRIPTS_DIR) : []
    for (const [name, body] of rendered) {
      const path = resolve(AT_SCRIPTS_DIR, name)
      if (!existsSync(path)) {
        violations.push({ rule: 'drift', message: `e2e/at-matrix/scripts/${name} does not exist.` })
      }
      else if (readFileSync(path, 'utf8') !== body) {
        violations.push({
          rule: 'drift',
          message: `e2e/at-matrix/scripts/${name} differs from what the data produces. Edit `
            + `at-scripts.data.ts and re-run \`yarn generate:at-scripts\`.`,
        })
      }
    }
    for (const name of onDisk) {
      if (!rendered.has(name)) {
        violations.push({
          rule: 'drift',
          message: `e2e/at-matrix/scripts/${name} is not produced by the data and would be `
            + `removed by a regeneration.`,
        })
      }
    }
  }
  else {
    mkdirSync(AT_SCRIPTS_DIR, { recursive: true })
    for (const name of existsSync(AT_SCRIPTS_DIR) ? readdirSync(AT_SCRIPTS_DIR) : []) {
      if (!rendered.has(name))
        rmSync(resolve(AT_SCRIPTS_DIR, name), { recursive: true, force: true })
    }
    for (const [name, body] of rendered)
      writeFileSync(resolve(AT_SCRIPTS_DIR, name), body, 'utf8')
  }

  const steps = AT_SCRIPTS.reduce((sum, e) => sum + e.steps.length, 0)
  console.warn('AT test scripts — TASK-N1-O4\n')
  console.warn(`  Tier C/D components    ${expected.length}`)
  console.warn(`  scripted               ${AT_SCRIPTS.length}`)
  console.warn(`  steps                  ${steps}`)
  console.warn(`  matrix cells covered   ${expected.length * AT_PAIRS.length} of 534`)
  console.warn(`  story resolution       ${knownStoryIds === undefined
    ? 'UNVERIFIED — no built Storybook index; run `yarn storybook:build`'
    : `checked against ${knownStoryIds.size} built stories`}`)
  console.warn(`  mode                   ${check ? 'check' : 'write'}`)

  if (violations.length === 0) {
    console.warn(`\n✓ at-scripts: ${AT_SCRIPTS.length}/${expected.length} components scripted, `
      + `every scaffold task covered, every story id resolves.`)
    process.exit(0)
  }

  console.error('')
  for (const v of violations)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${violations.length} at-script violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
