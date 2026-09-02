/**
 * Accept exactly one visual baseline, with a cause and an author (TASK-N1-O6).
 *
 * This is the only sanctioned way a baseline PNG in this repository changes.
 * `yarn test:e2e:update` used to be `playwright test --update-snapshots`, which
 * rewrote every baseline in the repository in one anonymous act; it now refuses
 * and points here.
 *
 * **The shape of the rule is borrowed from the perf baselines.** A perf
 * threshold may only ratchet downward, and moving one is a decision with a
 * number behind it. A visual baseline has no ordering to ratchet along — a
 * different image is not "worse" — so the equivalent constraint is *cardinality
 * plus attribution*: one snapshot per invocation, and neither `--reason` nor
 * `--by` is optional. Sixteen changed baselines cost sixteen invocations and
 * sixteen sentences. That is the point, not an oversight: the cost of accepting
 * a change should scale with how much changed, which is exactly what
 * `--update-snapshots` destroys.
 *
 * Usage:
 *   yarn visual:accept --component DzButton --theme dark \
 *     --by "E. Isic" --reason "Target-size floor raised the icon slot to 24px (N1-O3 V8)."
 *
 *   yarn visual:accept --component DzButton --theme dark --record-only --by … --reason …
 *       Re-digest and record an image already on disk, without running a browser.
 *
 *   yarn visual:accept --bootstrap --by … --reason …
 *       Record every baseline that has NO entry yet. Adds only; it can never
 *       re-accept a file whose digest already disagrees with the ledger, so the
 *       "a changed baseline needs a stated cause" rule survives it.
 */

import type { VisualBaselineRecord, VisualLedger } from '../validators/visual-baselines.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  baselineFiles,
  digestOf,
  MIN_REASON_LENGTH,
  readLedger,
  VISUAL_LEDGER_PATH,
} from '../validators/visual-baselines.ts'
import { lastCommitFor } from './git.ts'

const PILOT_SNAPSHOT_DIR = 'e2e/visual/component-baselines.spec.ts-snapshots'
const PILOT_SPEC = 'e2e/visual/component-baselines.spec.ts'

/** Placeholder reasons, refused here as well as in the in-run guard. */
const EMPTY_REASONS = new Set([
  'update',
  'updated',
  'update snapshot',
  'update snapshots',
  'updated snapshots',
  'fix',
  'fixed',
  'wip',
  'n/a',
  'na',
  'none',
  'no reason',
  'baseline',
  'new baseline',
  'accept',
  'accepted',
  'chore',
  'refresh',
])

function arg(name: string): string | undefined {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index !== -1 && index + 1 < process.argv.length)
    return process.argv[index + 1]
  const inline = process.argv.find(a => a.startsWith(`${flag}=`))
  return inline === undefined ? undefined : inline.slice(flag.length + 1)
}

function die(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function git(args: string[]): string {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
  }
  catch {
    return ''
  }
}

function serialize(ledger: VisualLedger): string {
  return `${JSON.stringify(ledger, null, 2)}\n`
}

/** Sort key: file path, so two machines write the same ledger. */
function sortBaselines(records: VisualBaselineRecord[]): VisualBaselineRecord[] {
  return [...records].sort((a, b) => a.file.localeCompare(b.file))
}

/** Parse a baseline file name back into engine + platform. */
function describe(file: string, prefix: string): { engine: string, platform: string } {
  const stem = file.slice(prefix.length, -'.png'.length)
  const parts = stem.split('-')
  return { engine: parts[0] ?? 'unknown', platform: parts.slice(1).join('-') || 'unknown' }
}

interface Attribution {
  by: string
  reason: string
  at: string
  sourceCommit: string
  worktreeDirty: boolean
}

function attribution(): Attribution {
  const by = (arg('by') ?? '').trim()
  const reason = (arg('reason') ?? '').trim()

  if (by === '')
    die('--by is required. An accepted baseline has an author or it has nobody.')
  if (reason.length < MIN_REASON_LENGTH || EMPTY_REASONS.has(reason.toLowerCase())) {
    die(
      `--reason must describe what changed in the product and why the new image is correct `
      + `(at least ${MIN_REASON_LENGTH} characters, not a placeholder word). `
      + `Got: ${reason === '' ? '(empty)' : JSON.stringify(reason)}`,
    )
  }

  return {
    by,
    reason,
    at: new Date().toISOString().slice(0, 10),
    sourceCommit: git(['rev-parse', 'HEAD']) || 'unknown',
    worktreeDirty: git(['status', '--porcelain']) !== '',
  }
}

/** Record (or re-record) one file in the ledger. */
function record(
  ledger: VisualLedger,
  file: string,
  fields: Omit<VisualBaselineRecord, 'sha256' | 'replaces' | 'acceptedBy' | 'acceptedAt'
  | 'reason' | 'sourceCommit' | 'worktreeDirty'>,
  who: Attribution,
): { entry: VisualBaselineRecord, previous: string | null } {
  const full = resolve(ROOT, file)
  if (!existsSync(full))
    die(`no image at ${file} — nothing to accept.`)

  const previous = ledger.baselines.find(b => b.file === file)?.sha256 ?? null
  const entry: VisualBaselineRecord = {
    ...fields,
    file,
    sha256: digestOf(full),
    sourceCommit: who.sourceCommit,
    worktreeDirty: who.worktreeDirty,
    acceptedBy: who.by,
    acceptedAt: who.at,
    reason: who.reason,
    replaces: previous,
  }

  ledger.baselines = sortBaselines([
    ...ledger.baselines.filter(b => b.file !== file),
    entry,
  ])
  return { entry, previous }
}

/* c8 ignore start -- CLI entry point. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const ledger = readLedger()
  const who = attribution()

  if (process.argv.includes('--bootstrap')) {
    // Adds only. A file whose digest already disagrees with its entry is left
    // alone and reported, so bootstrap can never be used to launder a change.
    const known = new Set(ledger.baselines.map(b => b.file))
    const added: string[] = []
    for (const file of baselineFiles(ledger)) {
      if (known.has(file))
        continue
      const dir = file.slice(0, file.lastIndexOf('/'))
      const name = file.slice(file.lastIndexOf('/') + 1)
      const isPilot = dir === PILOT_SNAPSHOT_DIR
      const stem = name.slice(0, -'.png'.length)
      const parts = stem.split('-')
      const engine = parts.at(-2) ?? 'unknown'
      const platform = parts.at(-1) ?? 'unknown'
      const component = isPilot ? parts[1] ?? 'unknown' : 'n/a — screen-level snapshot'
      const theme = isPilot ? parts[2] ?? 'unknown' : 'n/a'
      const fileCommit = lastCommitFor(file)
      record(ledger, file, {
        component,
        theme,
        story: isPilot ? '' : dir,
        engine,
        platform,
      // A committed image's capture commit is the commit that last touched the
      // IMAGE; stamping today's HEAD would make a months-old baseline read as
      // freshly captured, which is the one thing the staleness column exists to
      // prevent. An image git has never seen has no such commit, and HEAD is
      // then the honest answer rather than `unknown`.
      }, { ...who, sourceCommit: fileCommit === 'unknown' ? who.sourceCommit : fileCommit })
      added.push(file)
    }
    writeFileSync(VISUAL_LEDGER_PATH, serialize(ledger), 'utf8')
    console.warn(`visual:accept --bootstrap: recorded ${added.length} previously unaccepted `
      + `baseline(s).`)
    for (const file of added)
      console.warn(`  + ${file}`)
    process.exit(0)
  }

  const component = arg('component')
  const theme = arg('theme')
  if (component === undefined || theme === undefined)
    die('--component and --theme are both required (one snapshot per invocation, by design).')
  if (!ledger.scope.themes.includes(theme))
    die(`--theme must be one of ${ledger.scope.themes.join(', ')}.`)

  if (!/^[A-Z]\w+$/.test(component))
    die(`--component must be a bare component name (got ${JSON.stringify(component)}).`)

  const snapshotArg = `component-${component}-${theme}`
  const title = `visual ${component} ${theme}`

  if (!process.argv.includes('--record-only')) {
    console.warn(`visual:accept: capturing \`${snapshotArg}\` …`)
    try {
      // `node node_modules/@playwright/test/cli.js` rather than the `playwright`
      // bin shim, for the reason apps/landing's scripts already give: on
      // Windows the shim is a `.cmd`, and Node refuses to spawn a `.cmd`
      // without `shell: true` (the CVE-2024-27980 fix). Going through a shell
      // instead would put the free-text `--reason` on a command line.
      execFileSync(
        process.execPath,
        [
          resolve(ROOT, 'node_modules/@playwright/test/cli.js'),
          'test',
          PILOT_SPEC,
          `--project=${ledger.scope.engine}`,
          '--update-snapshots=all',
          // End-anchored only: Playwright greps the full title PATH — project
          // name and file included — so a leading `^` matches nothing and
          // silently selects zero tests. `$` alone is enough to keep
          // `visual DzButton light` off `visual DzButtonGroup light`, and the
          // in-run guard refuses any snapshot but the named one if it were not.
          // No escaping: a title is `visual Dz<Name> <theme>`, word characters
          // and spaces only, which is checked below.
          '--grep',
          `${title}$`,
          '--output=.pw-out/visual-accept',
          '--reporter=line',
        ],
        {
          cwd: ROOT,
          stdio: 'inherit',
          env: {
            ...process.env,
            STORYBOOK_E2E_STATIC: process.env.STORYBOOK_E2E_STATIC ?? '1',
            STORYBOOK_E2E_PREBUILT: process.env.STORYBOOK_E2E_PREBUILT ?? '1',
            // The in-run guard reads these. It refuses any snapshot but this one,
            // so `--grep` and the guard have to agree before a byte is written.
            DZUP_VISUAL_ACCEPT: snapshotArg,
            DZUP_VISUAL_ACCEPT_REASON: who.reason,
            DZUP_VISUAL_ACCEPT_BY: who.by,
          },
        },
      )
    }
    catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      die(
        `the capture run failed for \`${snapshotArg}\`. Nothing was recorded. `
        + `Build Storybook first (yarn storybook:build) or pass --record-only if the image `
        + `is already on disk.`,
      )
    }
  }

  const dir = resolve(ROOT, PILOT_SNAPSHOT_DIR)
  const prefix = `${snapshotArg}-`
  const found = existsSync(dir)
    ? readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    : []
  if (found.length === 0)
    die(`no image matching ${prefix}*.png under ${PILOT_SNAPSHOT_DIR}.`)

  const story = (() => {
    const targets = readFileSync(resolve(ROOT, 'e2e/matrix/targets.generated.ts'), 'utf8')
    const hit = new RegExp(`component: '${component}'[^\\n]*story: '([^']+)'`).exec(targets)
    return hit?.[1] ?? ''
  })()

  for (const name of found) {
    const file = `${PILOT_SNAPSHOT_DIR}/${name}`
    const { engine, platform } = describe(name, prefix)
    const { entry, previous } = record(
      ledger,
      file,
      { component, theme, story, engine, platform },
      who,
    )
    console.warn(
      `${previous === null ? 'first capture' : `replaces ${previous.slice(0, 12)}`} → `
      + `${entry.sha256.slice(0, 12)}  ${file}`,
    )
  }

  writeFileSync(VISUAL_LEDGER_PATH, serialize(ledger), 'utf8')
  console.warn(`\n✓ accepted by ${who.by} at ${who.sourceCommit.slice(0, 8)}`
    + `${who.worktreeDirty ? ' (worktree dirty — not release evidence)' : ''}`)
  console.warn(`  reason: ${who.reason}`)
}
/* c8 ignore stop */
