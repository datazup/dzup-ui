/**
 * Visual-baseline authority gate (TASK-N1-O6).
 *
 * **What this exists to catch, that Playwright cannot.** `toHaveScreenshot()`
 * compares a render against a committed PNG. After somebody runs
 * `--update-snapshots`, that comparison passes — the baseline moved and the run
 * is green, which is the same signal as "nothing changed". Every self-hosted
 * visual lane has this hole; the hosted services (Chromatic, Argos) sell the
 * patch for it, which is a review UI with an approver identity attached to each
 * accepted image.
 *
 * The patch here is a committed digest ledger. Every baseline PNG in the
 * repository has an entry in `e2e/visual/visual-baselines.json` carrying its
 * SHA-256, the commit it was captured at, who accepted it and why. This gate
 * fails when:
 *
 *   - a PNG's bytes disagree with the digest recorded for it (`changed`) — the
 *     unexplained-change case, and the one the task asks to be proven;
 *   - a PNG has no entry at all (`orphan`) — an unaccepted first capture, which
 *     is what `--update-snapshots` and a plain first run both leave behind;
 *   - an entry names a file that is gone (`missing`);
 *   - an entry has no reason, no author or no source commit (`unattributed`);
 *   - a component in a covered family owes a theme it has no baseline for
 *     (`coverage`).
 *
 * It **reports** rather than fails when a covered baseline is stale (the
 * component moved after the capture) or when the gating platform is not CI's:
 * both are visible states somebody must act on, and a gate that failed on them
 * would be switched off the week it landed. That split is the same one
 * `validate:capability-matrix` and `validate:at-matrix` already make.
 *
 * No browser is involved, so this runs inside `validate:all` in milliseconds.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/visual-baselines.ts
 *   tsx packages/tooling/src/validators/visual-baselines.ts --all
 *
 * Exit code 1 if a hard gate fails.
 */

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { evidenceIsCurrent, lastCommitFor } from '../quality/git.ts'

export const VISUAL_LEDGER_PATH = resolve(ROOT, 'e2e/visual/visual-baselines.json')

/** The shortest reason that can carry a cause. Mirrors the in-run guard. */
export const MIN_REASON_LENGTH = 24

export interface VisualBaselineRecord {
  file: string
  sha256: string
  component: string
  theme: string
  story: string
  engine: string
  platform: string
  sourceCommit: string
  worktreeDirty: boolean
  acceptedBy: string
  acceptedAt: string
  reason: string
  replaces: string | null
}

export interface VisualLedger {
  schemaVersion: string
  scope: {
    families: string[]
    engine: string
    themes: string[]
    direction: string
    viewport: { width: number, height: number }
    platform: string
    ciPlatform: string
    note: string
  }
  snapshotDirs: string[]
  baselines: VisualBaselineRecord[]
}

export interface VisualViolation {
  rule: 'changed' | 'orphan' | 'missing' | 'unattributed' | 'coverage' | 'stale' | 'platform'
  level: 'error' | 'report'
  message: string
}

/** SHA-256 of a file, lowercase hex. */
export function digestOf(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

/** Read the committed ledger. */
export function readLedger(path: string = VISUAL_LEDGER_PATH): VisualLedger {
  return JSON.parse(readFileSync(path, 'utf8')) as VisualLedger
}

/** Every baseline PNG on disk, as repo-relative paths, sorted. */
export function baselineFiles(ledger: VisualLedger): string[] {
  const out: string[] = []
  for (const dir of ledger.snapshotDirs) {
    const full = resolve(ROOT, dir)
    if (!existsSync(full))
      continue
    for (const entry of readdirSync(full)) {
      if (entry.endsWith('.png'))
        out.push(`${dir}/${entry}`)
    }
  }
  return out.sort()
}

/** Components a covered family owes a baseline for, from the quality matrix. */
export function coveredComponents(ledger: VisualLedger): { component: string, source: string }[] {
  const path = resolve(ROOT, 'packages/core/docs/quality-matrix.json')
  if (!existsSync(path))
    return []
  const quality = JSON.parse(readFileSync(path, 'utf8')) as {
    components: { component: string, family: string, source: string }[]
  }
  const families = new Set(ledger.scope.families)
  return quality.components
    .filter(row => families.has(row.family))
    .map(row => ({ component: row.component, source: row.source }))
    .sort((a, b) => a.component.localeCompare(b.component))
}

/**
 * Run the gates. Pure apart from reading the PNGs it is gating.
 *
 * `commitFor` is injected so the unit test can drive staleness without a git
 * checkout, the same way `generate-capability-matrix` treats `lastCommitFor`.
 */
export function checkVisualBaselines(
  ledger: VisualLedger,
  commitFor: (path: string) => string = lastCommitFor,
): VisualViolation[] {
  const violations: VisualViolation[] = []
  const byFile = new Map(ledger.baselines.map(b => [b.file, b]))
  const onDisk = new Set(baselineFiles(ledger))

  for (const record of ledger.baselines) {
    const full = resolve(ROOT, record.file)
    if (!existsSync(full)) {
      violations.push({
        rule: 'missing',
        level: 'error',
        message: `\`${record.file}\` is recorded as an accepted baseline and does not exist. `
          + `Restore it, or delete the ledger entry in the same change that deletes the image.`,
      })
      continue
    }

    const actual = digestOf(full)
    if (actual !== record.sha256) {
      violations.push({
        rule: 'changed',
        level: 'error',
        message: `\`${record.file}\` changed with no recorded cause.\n`
          + `      accepted: ${record.sha256}\n`
          + `      on disk:  ${actual}\n`
          + `      A changed baseline is a changed product. Accept it explicitly:\n`
          + `        yarn visual:accept --component ${record.component} --theme ${record.theme} `
          + `--by "<name>" --reason "<what changed and why the new image is correct>"\n`
          + `      or restore the image. There is no bulk path, by design.`,
      })
    }

    const unattributed: string[] = []
    if (record.reason.trim().length < MIN_REASON_LENGTH)
      unattributed.push(`reason (needs ${MIN_REASON_LENGTH}+ chars, got ${record.reason.trim().length})`)
    if (record.acceptedBy.trim() === '')
      unattributed.push('acceptedBy')
    if (record.acceptedAt.trim() === '')
      unattributed.push('acceptedAt')
    if (record.sourceCommit.trim() === '')
      unattributed.push('sourceCommit')
    if (unattributed.length > 0) {
      violations.push({
        rule: 'unattributed',
        level: 'error',
        message: `\`${record.file}\` is accepted without ${unattributed.join(', ')}. `
          + `An accepted baseline has an author and a cause or it is just a file that changed.`,
      })
    }
  }

  for (const file of onDisk) {
    if (byFile.has(file))
      continue
    violations.push({
      rule: 'orphan',
      level: 'error',
      message: `\`${file}\` is a baseline nobody accepted — no entry in `
        + `e2e/visual/visual-baselines.json. This is what a plain first run and a bulk `
        + `\`--update-snapshots\` both leave behind. Accept it with \`yarn visual:accept\`, `
        + `or delete it.`,
    })
  }

  // Coverage: a covered component owes every declared theme on the gating
  // platform. A component in a covered family with no baseline is the failure
  // this whole ledger exists to make visible, so it is an error and not a note.
  for (const { component, source } of coveredComponents(ledger)) {
    const mine = ledger.baselines.filter(
      b => b.component === component && b.platform === ledger.scope.platform,
    )
    for (const theme of ledger.scope.themes) {
      if (mine.some(b => b.theme === theme))
        continue
      violations.push({
        rule: 'coverage',
        level: 'error',
        message: `${component} is in a covered family (${ledger.scope.families.join(', ')}) and `
          + `has no accepted \`${theme}\` baseline on ${ledger.scope.platform}. Capture it, or `
          + `narrow \`scope.families\`. A covered component with no baseline reads `
          + `\`covered\` nowhere and is exactly the gap this ledger exists to show.`,
      })
    }

    const componentCommit = commitFor(source)
    for (const record of mine) {
      if (evidenceIsCurrent(record.sourceCommit, componentCommit))
        continue
      violations.push({
        rule: 'stale',
        level: 'report',
        message: `${component} / ${record.theme}: baseline captured at `
          + `${record.sourceCommit.slice(0, 8)}, component last changed at `
          + `${componentCommit.slice(0, 8)}. The image is a pass about different code.`,
      })
    }
  }

  if (ledger.scope.platform !== ledger.scope.ciPlatform) {
    violations.push({
      rule: 'platform',
      level: 'report',
      message: `this ledger gates on \`${ledger.scope.platform}\` and CI runs `
        + `\`${ledger.scope.ciPlatform}\`. Baselines are platform-locked, so the per-component `
        + `lane is developer-local evidence and cannot fail a CI run until one accept pass is `
        + `made on ${ledger.scope.ciPlatform}.`,
    })
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const ledger = readLedger()
  const violations = checkVisualBaselines(ledger)

  const errors = violations.filter(v => v.level === 'error')
  const reports = violations.filter(v => v.level === 'report')
  const files = baselineFiles(ledger)

  console.warn('Visual baselines — TASK-N1-O6\n')
  console.warn(`  scope      families [${ledger.scope.families.join(', ')}] · `
    + `${ledger.scope.engine} · ${ledger.scope.themes.join('+')} · ${ledger.scope.direction} · `
    + `${ledger.scope.platform}`)
  console.warn(`  baselines  ${files.length} on disk, ${ledger.baselines.length} accepted`)

  for (const v of reports.filter(v => v.rule === 'platform'))
    console.warn(`\n  ! ${v.message}`)

  const stale = reports.filter(v => v.rule === 'stale')
  if (stale.length > 0) {
    console.warn(`\n  ${stale.length} stale baseline(s)`)
    if (showAll) {
      for (const v of stale)
        console.warn(`    · ${v.message}`)
    }
  }

  if (errors.length === 0) {
    console.warn('\n✓ visual-baselines: every baseline is accounted for, with a cause and an author.')
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${errors.length} visual-baseline violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
