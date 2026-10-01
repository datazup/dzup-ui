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

/**
 * One visual lane (schema 1.2.0, TASK-S1-O3).
 *
 * A lane is a spec, the directory its committed images live in, the platform
 * those images were captured on, and whether it is a CI gate. The platform lives
 * here and not in `scope` because the three lanes do not agree: the two
 * screen-level lanes are `linux` and the per-component pilot is `win32`. One
 * global could only describe one of them, which is how `yarn test:e2e:visual`
 * came to be a command that would have written 34 new baselines on a
 * developer's machine and called it a verification run.
 */
export interface VisualLane {
  id: string
  spec: string
  snapshotDir: string
  /** The platform this lane's committed images were captured on. */
  capturedOn: string
  /** `gate` must be captured on the authoritative platform; `developer-local` never gates. */
  role: 'gate' | 'developer-local'
  scope: string
  /** What the lane does NOT cover. An unwritten scope is how this lane became unowned. */
  excludes: string
  requires?: string
  notGating?: string
}

/** The one-way ratchet over lanes that are not yet gates (TASK-S1-O3). */
export interface VisualCeilings {
  developerLocalLanes: {
    ceiling: number
    blockedOn?: string
    lanes: string[]
  }
}

export const VISUAL_CEILINGS_PATH = resolve(
  ROOT,
  'packages/tooling/src/validators/visual-baselines-ceilings.json',
)

export function readVisualCeilings(path: string = VISUAL_CEILINGS_PATH): VisualCeilings {
  return JSON.parse(readFileSync(path, 'utf8')) as VisualCeilings
}

/** A stress fixture over a covered family (TASK-R5-O4, schema 1.1.0). See `e2e/visual/coverage.ts`. */
export interface VisualFixture {
  id: string
  family: string
  story: string
  source: string
  components: string[]
  note: string
}

export interface VisualLedger {
  schemaVersion: string
  scope: {
    families: string[]
    fixtures?: VisualFixture[]
    engine: string
    themes: string[]
    direction: string
    viewport: { width: number, height: number }
    /** The platform this ledger GATES on — the one the committed images are for. */
    platform: string
    /** The platform CI runs on. `platform !== ciPlatform` is reported, not failed. */
    ciPlatform: string
    /**
     * The ONE platform the gate runs on (schema 1.2.0, TASK-S1-O3).
     *
     * Distinct from `platform` (what the per-component coverage join gates on
     * today) and from `ciPlatform` (an observation about the workflows). This is
     * the decision. Every lane with `role: "gate"` must be captured here, and
     * `e2e/visual/platform.ts` refuses a run on any other platform rather than
     * letting Playwright answer a missing baseline by writing one.
     */
    authoritativePlatform?: string
    /**
     * The recorded answer to "which platform is authoritative" (TASK-R2-O1).
     *
     * Separate from `platform` on purpose: `platform` is what there are images
     * for and what the digest gate compares against, and writing the
     * authoritative answer into it would make the ledger claim baselines that do
     * not exist. This field is the decision with a date and an owner action on
     * it; TASK-R2-O6 consumes it.
     */
    platformDecision?: {
      decidedBy: string
      decidedAt: string
      authoritative: string
      gatingToday: string
      state: string
      rationale: string
      ownerAction: string
      consumes?: string
      verifiedOn?: string
    }
    note: string
  }
  snapshotDirs: string[]
  /** Per-lane platform + role declarations (schema 1.2.0). Absent in 1.1.0 ledgers. */
  lanes?: VisualLane[]
  baselines: VisualBaselineRecord[]
}

export interface VisualViolation {
  rule: 'changed' | 'orphan' | 'missing' | 'unattributed' | 'coverage' | 'stale' | 'platform' | 'lane' | 'authority'
  level: 'error' | 'report'
  message: string
}

/**
 * The engine and platform Playwright encoded into a baseline's file name.
 *
 * `…-chromium-win32.png` → `{ engine: 'chromium', platform: 'win32' }`. This is
 * not metadata anybody can edit into agreement: it is the path the comparison
 * resolves, so it is the only statement about a baseline's platform that cannot
 * be wrong while the file is where it is.
 */
export function platformSuffixOf(file: string): { engine: string, platform: string } | undefined {
  const match = /-([^-/]+)-([^-/]+)\.png$/.exec(file)
  if (match === null)
    return undefined
  return { engine: match[1]!, platform: match[2]! }
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
 * The platform-authority gates (TASK-S1-O3).
 *
 * These are the half of the platform rule that needs no browser, and they exist
 * because the in-run guard can only refuse a run that someone started. These
 * refuse a *repository state* — a lane declared as a gate for a platform no
 * runner has, a lane whose images are for a platform its declaration does not
 * claim, a lane with nothing in it at all. Each one is a way for the visual
 * lane to be green while proving nothing, which is the failure mode the whole
 * ledger exists to prevent.
 *
 * `files` is passed in rather than re-read so the caller reads the directory
 * once.
 */
export function checkLaneAuthority(ledger: VisualLedger, files: string[]): VisualViolation[] {
  const violations: VisualViolation[] = []
  const authoritative = ledger.scope.authoritativePlatform

  if (authoritative === undefined || authoritative.trim() === '') {
    violations.push({
      rule: 'authority',
      level: 'error',
      message: 'e2e/visual/visual-baselines.json declares no `scope.authoritativePlatform`. '
        + 'A visual lane with no declared platform compares a render against whichever images '
        + 'happen to be on disk and writes one when there are none — a green run that means '
        + 'nothing. Declare the one platform the gate runs on (owner action).',
    })
    return violations
  }

  const lanes = ledger.lanes ?? []
  if (lanes.length === 0) {
    violations.push({
      rule: 'lane',
      level: 'error',
      message: 'e2e/visual/visual-baselines.json declares no `lanes`. Every snapshot directory '
        + 'must belong to a lane that states the platform its images were captured on and '
        + 'whether it gates; without that the harness cannot tell a refusal from a first capture.',
    })
    return violations
  }

  const declaredDirs = new Set(lanes.map(l => l.snapshotDir))
  for (const dir of ledger.snapshotDirs) {
    if (declaredDirs.has(dir))
      continue
    violations.push({
      rule: 'lane',
      level: 'error',
      message: `\`${dir}\` is in \`snapshotDirs\` with no entry in \`lanes\`. An undeclared `
        + `snapshot directory runs unguarded: e2e/visual/platform.ts has no platform to check `
        + `it against, so it would compare — or capture — on any machine.`,
    })
  }

  const knownDirs = new Set(ledger.snapshotDirs)
  for (const lane of lanes) {
    if (!knownDirs.has(lane.snapshotDir)) {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `lane \`${lane.id}\` names \`${lane.snapshotDir}\`, which is not in `
          + `\`snapshotDirs\`. The digest gate never reads that directory, so the lane's images `
          + `are ungoverned.`,
      })
    }

    if (lane.role === 'gate' && lane.capturedOn !== authoritative) {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `lane \`${lane.id}\` is \`role: "gate"\` with \`capturedOn: `
          + `"${lane.capturedOn}"\`, but the authoritative platform is "${authoritative}". `
          + `A gate whose images are for another platform can never pass — it has nothing to `
          + `compare against wherever it runs. Either capture it on ${authoritative} `
          + `(owner action) or demote it to \`role: "developer-local"\` and say so.`,
      })
    }

    if (lane.excludes.trim() === '') {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `lane \`${lane.id}\` declares no \`excludes\`. A scope with no stated gap is `
          + `how this lane became unowned the first time: every reader assumed it covered `
          + `whatever they cared about.`,
      })
    }

    // A lane with no accepted baselines on its own platform is the "nothing to
    // compare" case, caught here with no browser. A run would either register
    // zero snapshot tests and exit 0, or capture the lot.
    const mine = ledger.baselines.filter(
      b => b.file.startsWith(`${lane.snapshotDir}/`) && b.platform === lane.capturedOn,
    )
    if (mine.length === 0) {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `lane \`${lane.id}\` has 0 accepted baselines on its declared platform `
          + `"${lane.capturedOn}". A visual lane with nothing to compare exits 0 and reports `
          + `"no visual regressions" about no pixels — the one outcome worse than a red. `
          + `Capture it, or remove the lane and its snapshotDirs entry.`,
      })
    }

    // The file name is the only unforgeable statement of a baseline's platform.
    for (const record of ledger.baselines) {
      if (!record.file.startsWith(`${lane.snapshotDir}/`))
        continue
      const suffix = platformSuffixOf(record.file)
      if (suffix === undefined) {
        violations.push({
          rule: 'lane',
          level: 'error',
          message: `\`${record.file}\` has no \`-<engine>-<platform>.png\` suffix. Playwright `
            + `writes one for every snapshot; a file without it was not written by the lane.`,
        })
        continue
      }
      if (suffix.platform !== record.platform) {
        violations.push({
          rule: 'lane',
          level: 'error',
          message: `\`${record.file}\` is recorded as \`platform: "${record.platform}"\` and its `
            + `file name says "${suffix.platform}". The file name is what the comparison `
            + `resolves, so the ledger entry is the one that is wrong.`,
        })
      }
      if (suffix.platform !== lane.capturedOn) {
        violations.push({
          rule: 'lane',
          level: 'error',
          message: `\`${record.file}\` is a "${suffix.platform}" image in lane \`${lane.id}\`, `
            + `which declares \`capturedOn: "${lane.capturedOn}"\`. This is what a half-finished `
            + `platform migration looks like: finish it by deleting the ${lane.capturedOn} `
            + `images and setting \`capturedOn\` to "${suffix.platform}", or revert the capture. `
            + `A lane never holds two platforms — cross-platform baselines are not attempted.`,
        })
      }
    }
  }

  // An image on disk in a lane directory whose suffix does not match the lane.
  // The `orphan` rule catches one nobody accepted; this catches one that WAS
  // accepted into the wrong lane.
  for (const file of files) {
    const lane = lanes.find(l => file.startsWith(`${l.snapshotDir}/`))
    if (lane === undefined) {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `\`${file}\` is a baseline in no declared lane. Add the lane, or delete it.`,
      })
      continue
    }
    const suffix = platformSuffixOf(file)
    if (suffix !== undefined && suffix.platform !== lane.capturedOn) {
      violations.push({
        rule: 'lane',
        level: 'error',
        message: `\`${file}\` is on disk as a "${suffix.platform}" image in lane \`${lane.id}\`, `
          + `which is declared for "${lane.capturedOn}".`,
      })
    }
  }

  return violations
}

/**
 * The one-way ratchet over lanes that are not gates yet (TASK-S1-O3).
 *
 * The same two-way handshake `capability-matrix-ceilings.json` uses: the number
 * may not rise, and it may not fall without the ceiling being lowered in the
 * same change. A visual lane that is honest about being developer-local is
 * fine; a repository that quietly grows a second one is how "we have visual
 * regression testing" becomes true in the README and false in CI.
 */
export function checkDeveloperLocalRatchet(
  ledger: VisualLedger,
  ceilings: VisualCeilings,
): VisualViolation[] {
  const actual = (ledger.lanes ?? []).filter(l => l.role === 'developer-local')
  const { ceiling, blockedOn } = ceilings.developerLocalLanes
  const names = actual.map(l => l.id).sort()

  if (actual.length > ceiling) {
    return [{
      rule: 'lane',
      level: 'error',
      message: `${actual.length} developer-local visual lane(s) (${names.join(', ')}), ceiling `
        + `${ceiling}${blockedOn === undefined ? '' : ` — blocked on ${blockedOn}`}. A lane that `
        + `is not captured on the authoritative platform cannot fail a CI run, so adding one `
        + `adds a lane the gate does not have. Capture it on `
        + `${ledger.scope.authoritativePlatform ?? '<authoritative>'} instead, or raise the `
        + `ceiling in packages/tooling/src/validators/visual-baselines-ceilings.json WITH the `
        + `reason it cannot be.`,
    }]
  }

  if (actual.length < ceiling) {
    return [{
      rule: 'lane',
      level: 'error',
      message: `${actual.length} developer-local visual lane(s), ceiling ${ceiling}. Progress is `
        + `recorded, not absorbed: lower \`developerLocalLanes.ceiling\` to ${actual.length} in `
        + `packages/tooling/src/validators/visual-baselines-ceilings.json in the same change, so `
        + `the next lane to slip is visible.`,
    }]
  }

  return []
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
  ceilings: VisualCeilings = readVisualCeilings(),
): VisualViolation[] {
  const violations: VisualViolation[] = []
  const byFile = new Map(ledger.baselines.map(b => [b.file, b]))
  const files = baselineFiles(ledger)
  const onDisk = new Set(files)

  // TASK-S1-O3. Platform authority first: every later gate reasons about images
  // whose platform this one is what establishes.
  violations.push(...checkLaneAuthority(ledger, files))
  violations.push(...checkDeveloperLocalRatchet(ledger, ceilings))

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

  // Fixtures (TASK-R5-O4): the same coverage and staleness rules as a covered
  // component, keyed `fixture:<id>`. A fixture over a family that is not in
  // scope is a declaration nothing drives, so it is an error rather than silence.
  const families = new Set(ledger.scope.families)
  for (const fixture of ledger.scope.fixtures ?? []) {
    const key = `fixture:${fixture.id}`
    if (!families.has(fixture.family)) {
      violations.push({
        rule: 'coverage',
        level: 'error',
        message: `fixture \`${fixture.id}\` extends \`${fixture.family}\`, which is not in `
          + `scope.families — the lane would never drive it.`,
      })
      continue
    }
    const mine = ledger.baselines.filter(b => b.component === key && b.platform === ledger.scope.platform)
    for (const theme of ledger.scope.themes) {
      if (mine.some(b => b.theme === theme))
        continue
      violations.push({
        rule: 'coverage',
        level: 'error',
        message: `fixture \`${fixture.id}\` has no accepted \`${theme}\` baseline on `
          + `${ledger.scope.platform}. Capture it with \`yarn visual:accept --fixture ${fixture.id} `
          + `--theme ${theme} --by … --reason …\`, or remove the fixture from scope.fixtures.`,
      })
    }
    const fixtureCommit = commitFor(fixture.source)
    for (const record of mine) {
      if (evidenceIsCurrent(record.sourceCommit, fixtureCommit))
        continue
      violations.push({
        rule: 'stale',
        level: 'report',
        message: `fixture ${fixture.id} / ${record.theme}: baseline captured at `
          + `${record.sourceCommit.slice(0, 8)}, story last changed at ${fixtureCommit.slice(0, 8)}.`,
      })
    }
  }

  if (ledger.scope.platform !== ledger.scope.ciPlatform) {
    const local = (ledger.lanes ?? []).filter(l => l.role === 'developer-local').map(l => l.id)
    violations.push({
      rule: 'platform',
      level: 'report',
      message: `the per-component coverage join gates on \`${ledger.scope.platform}\` and CI runs `
        + `\`${ledger.scope.ciPlatform}\`. Baselines are platform-locked, so `
        + `${local.length === 0 ? 'that lane' : `lane(s) ${local.join(', ')}`} `
        + `are developer-local evidence and cannot fail a CI run until one accept pass is `
        + `made on ${ledger.scope.authoritativePlatform ?? ledger.scope.ciPlatform}. `
        + `This is REPORTED, not failed: it is an honest declaration, and `
        + `\`developerLocalLanes\` in visual-baselines-ceilings.json is what stops it growing.`,
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
  console.warn(`  authority  ${ledger.scope.authoritativePlatform ?? '(undeclared)'} `
    + `— the one platform a gate lane runs on (TASK-S1-O3)`)
  for (const lane of ledger.lanes ?? []) {
    const n = ledger.baselines.filter(b => b.file.startsWith(`${lane.snapshotDir}/`)).length
    console.warn(`    ${lane.id.padEnd(20)} ${String(n).padStart(2)} on ${lane.capturedOn.padEnd(7)} · ${lane.role}`)
  }

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
