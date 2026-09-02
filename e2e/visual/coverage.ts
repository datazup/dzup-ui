import { readFileSync } from 'node:fs'
import { MATRIX_TARGETS } from '../matrix/targets.generated.ts'

/**
 * What the per-component visual lane covers, and who accepted each baseline
 * (TASK-N1-O6).
 *
 * The scope is **not** a list of components. It is a list of *families*, joined
 * against `e2e/matrix/targets.generated.ts` — the same generated target list the
 * browser matrix drives. That join is the whole reason a per-component visual
 * lane costs almost nothing to extend: a family opts in, and every public
 * component in it is covered by the story the browser matrix already picked for
 * it. Naming components individually would have created a second, hand-kept
 * inventory that drifts the first time somebody adds a component.
 *
 * See `e2e/visual/README.md` for the review/update workflow and the authority
 * rule that governs changing a baseline.
 */

export const VISUAL_LEDGER_PATH = new URL('./visual-baselines.json', import.meta.url)

/** A theme a covered component is snapshotted in. */
export type VisualTheme = 'light' | 'dark'

/** The themes every covered component owes. Light + dark × LTR is the floor. */
export const VISUAL_THEMES: readonly VisualTheme[] = ['light', 'dark']

/**
 * One accepted baseline.
 *
 * `reason`, `acceptedBy` and `sourceCommit` are not decoration: the validator
 * rejects an entry without them, which is what makes accepting a baseline an
 * act with an author rather than a file that changed.
 */
export interface VisualBaselineRecord {
  /** File name inside the `*-snapshots` directory, exactly as Playwright wrote it. */
  readonly file: string
  /** SHA-256 of the PNG, lowercase hex. The gate compares this, not the mtime. */
  readonly sha256: string
  readonly component: string
  readonly theme: VisualTheme
  readonly story: string
  readonly engine: string
  /** Playwright's platform suffix — baselines are platform-locked by construction. */
  readonly platform: string
  /** Repository HEAD the capture was taken at. Drives staleness. */
  readonly sourceCommit: string
  /** Whether the tree was dirty at capture. A dirty capture is not release evidence. */
  readonly worktreeDirty: boolean
  readonly acceptedBy: string
  readonly acceptedAt: string
  /** Why this image is the correct appearance. Free prose, but required. */
  readonly reason: string
  /** The digest this entry replaced, or `null` for a first capture. */
  readonly replaces: string | null
}

export interface VisualLedger {
  readonly schemaVersion: string
  readonly scope: {
    /** Families whose components owe a baseline. Everything else is `not-covered`. */
    readonly families: readonly string[]
    readonly engine: string
    readonly themes: readonly VisualTheme[]
    readonly direction: string
    readonly viewport: { readonly width: number, readonly height: number }
    /**
     * The platform this ledger gates on — Playwright's snapshot suffix.
     *
     * Baselines are platform-locked by construction, so "which platform is
     * authoritative" is a decision somebody makes, not a property of the run
     * that happened last. Recording it is what lets the capability matrix say
     * `covered` and mean something checkable.
     */
    readonly platform: string
    /** The platform CI runs. When it differs from `platform`, the lane is not a CI gate. */
    readonly ciPlatform: string
    readonly note: string
  }
  readonly snapshotDirs: readonly string[]
  readonly baselines: readonly VisualBaselineRecord[]
}

export function readVisualLedger(path: URL | string = VISUAL_LEDGER_PATH): VisualLedger {
  return JSON.parse(readFileSync(path, 'utf8')) as VisualLedger
}

/** One snapshot the lane is expected to take. */
export interface VisualShot {
  readonly component: string
  readonly family: string
  readonly story: string
  readonly theme: VisualTheme
  /** The `arg` Playwright interpolates into the snapshot path, without `.png`. */
  readonly arg: string
  /** The test title, which `visual:accept` greps for to run exactly one. */
  readonly title: string
}

/**
 * Every snapshot the covered families owe, in a stable order.
 *
 * A covered component with `story: null` is a real gap and is reported by the
 * validator rather than silently dropped — the browser matrix takes the same
 * position with `declareUnrun()`.
 */
export function visualShots(ledger: VisualLedger = readVisualLedger()): readonly VisualShot[] {
  const families = new Set(ledger.scope.families)
  return MATRIX_TARGETS
    .filter(target => families.has(target.family))
    .flatMap(target =>
      ledger.scope.themes.map(theme => ({
        component: target.component,
        family: target.family,
        story: target.story ?? '',
        theme,
        arg: `component-${target.component}-${theme}`,
        title: `visual ${target.component} ${theme}`,
      })),
    )
    .filter(shot => shot.story !== '')
}

/** Covered components that have no story to drive — a gap, not an exemption. */
export function visualTargetsWithoutStory(
  ledger: VisualLedger = readVisualLedger(),
): readonly string[] {
  const families = new Set(ledger.scope.families)
  return MATRIX_TARGETS
    .filter(target => families.has(target.family) && target.story === null)
    .map(target => target.component)
}
