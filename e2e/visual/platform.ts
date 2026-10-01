import type { VisualLane } from './coverage.ts'
import { createRequire } from 'node:module'
import process from 'node:process'
import { readVisualLedger } from './coverage.ts'

/**
 * The authoritative-platform rule for the visual lane (TASK-S1-O3).
 *
 * **The problem this solves.** A visual baseline is platform-locked by
 * construction: Playwright resolves a comparison against
 * `{arg}-{project}-{platform}.png`, so a linux image and a win32 image are
 * different files that are never compared to each other. That is correct — font
 * rasterisation, subpixel antialiasing and scrollbar metrics genuinely differ —
 * and it has a consequence nobody had wired up before this task:
 *
 *   Running the lane on a platform the baselines were not captured on does not
 *   produce a comparison. It produces *nothing to compare*, and Playwright's
 *   default `updateSnapshots: 'missing'` fills that hole by **writing the actual
 *   render as a new baseline** and failing the test. One `yarn test:e2e:visual`
 *   on the wrong machine is therefore a 34-file unauthorised capture wearing the
 *   costume of a verification run.
 *
 * So the running platform is compared against a **declared** authority before a
 * browser is launched, and a mismatch is refused — once, by name — rather than
 * diffed. The authority is data, in `visual-baselines.json`:
 *
 *   - `scope.authoritativePlatform` — the one platform the gate runs on. Today
 *     `linux`, because 18 of 18 jobs in `.github/workflows/` are
 *     `runs-on: ubuntu-latest` and no other runner exists. Changing it is an
 *     owner act, and it costs a capture pass.
 *   - `lanes[].capturedOn` — the platform each lane's committed images are for.
 *   - `lanes[].role` — `gate` (must run on the authoritative platform) or
 *     `developer-local` (honest evidence, explicitly not a CI gate).
 *
 * Three lanes, two platforms, one authority: the two screen-level lanes are
 * linux and are gates; the per-component pilot is win32 and is developer-local
 * until an owner captures it on linux.
 *
 * This module deliberately does **not** import `@playwright/test`, so the same
 * logic runs as a one-second preflight (`yarn visual:platform`) with no runner,
 * no Storybook build and no browser. `platform-guard.ts` is the in-run half.
 */

export type { VisualLane }

/** Every lane id this module knows how to guard. Spec files pass one of these. */
export type VisualLaneId = 'gallery' | 'theme-recipe' | 'component-baselines'

/**
 * What a capture is bound to, beyond the platform name.
 *
 * The platform is the coarse key and the only one Playwright puts in the path,
 * but it is not the whole environment: a Playwright upgrade can change the PNG
 * encoder and an engine change can change the renderer. Recording the descriptor
 * next to the refusal means a "same platform, different bytes" failure is
 * diagnosable from the log instead of from someone's memory of their machine.
 */
export interface CaptureEnvironment {
  readonly platform: string
  readonly arch: string
  readonly engine: string
  readonly playwright: string
  readonly node: string
}

/** The platform this process is running on. The single source of "where am I". */
export function runningPlatform(): string {
  return process.platform
}

function playwrightVersion(): string {
  try {
    return createRequire(import.meta.url)('@playwright/test/package.json').version as string
  }
  catch {
    return 'unknown'
  }
}

/** The running environment, for the refusal message and the handoff. */
export function captureEnvironment(engine: string): CaptureEnvironment {
  return {
    platform: runningPlatform(),
    arch: process.arch,
    engine,
    playwright: playwrightVersion(),
    node: process.version,
  }
}

export function describeEnvironment(env: CaptureEnvironment): string {
  return `${env.engine}/${env.platform}-${env.arch} · playwright ${env.playwright} · node ${env.node}`
}

/** The ledger's platform authority, read once. */
export interface PlatformAuthority {
  readonly authoritative: string
  readonly ciPlatform: string
  readonly engine: string
  readonly lanes: readonly VisualLane[]
}

export function readPlatformAuthority(): PlatformAuthority {
  const ledger = readVisualLedger()
  const authoritative = ledger.scope.authoritativePlatform
  if (authoritative === undefined || authoritative.trim() === '') {
    throw new Error(
      'e2e/visual/visual-baselines.json declares no `scope.authoritativePlatform`. '
      + 'The visual lane refuses to run without one: a lane with no declared platform '
      + 'compares a render against whatever images happen to be on disk, which is how a '
      + 'green run comes to mean nothing. Declare it (owner action) and re-run.',
    )
  }
  const lanes = ledger.lanes
  if (lanes === undefined || lanes.length === 0) {
    throw new Error(
      'e2e/visual/visual-baselines.json declares no `lanes`. Each visual spec must declare '
      + 'the platform its committed images were captured on and whether it is a gate; '
      + 'without that the harness cannot tell a refusal from a first capture.',
    )
  }
  return { authoritative, ciPlatform: ledger.scope.ciPlatform, engine: ledger.scope.engine, lanes }
}

export function laneById(authority: PlatformAuthority, id: VisualLaneId): VisualLane {
  const lane = authority.lanes.find(l => l.id === id)
  if (lane === undefined) {
    throw new Error(
      `No lane \`${id}\` in e2e/visual/visual-baselines.json \`lanes\`. A spec that guards `
      + `itself against a lane declaration that does not exist would run unguarded, so this `
      + `is an error rather than a default. Declared lanes: `
      + `${authority.lanes.map(l => l.id).join(', ')}.`,
    )
  }
  return lane
}

/** The outcome of the platform check for one lane. */
export type PlatformVerdict
  = | { readonly ok: true, readonly lane: VisualLane, readonly environment: CaptureEnvironment }
    | { readonly ok: false, readonly lane: VisualLane, readonly environment: CaptureEnvironment, readonly reason: string, readonly message: string }

/**
 * Decide whether this lane may compare on this platform.
 *
 * Two independent conditions, both of which must hold, and which fail for
 * different reasons:
 *
 *  1. **`gate` lanes run only on the authoritative platform.** A gate that runs
 *     somewhere else is not gating anything — it is comparing against images
 *     that do not exist for it.
 *  2. **Every lane runs only on the platform its own images were captured on.**
 *     This is the one that catches a `developer-local` lane too: the
 *     per-component pilot's images are win32, so it refuses on linux exactly as
 *     loudly as the gallery lane refuses on win32. A lane is never allowed to
 *     "fall back" to capturing, because Playwright's fallback for a missing
 *     baseline is to write one.
 */
export function platformVerdict(
  authority: PlatformAuthority,
  laneId: VisualLaneId,
  engine: string = authority.engine,
): PlatformVerdict {
  const lane = laneById(authority, laneId)
  const environment = captureEnvironment(engine)
  const running = environment.platform

  if (lane.role === 'gate' && lane.capturedOn !== authority.authoritative) {
    return {
      ok: false,
      lane,
      environment,
      reason: 'lane-declares-a-gate-off-the-authoritative-platform',
      message: refusal(
        `lane \`${lane.id}\` is declared \`role: "gate"\` with `
        + `\`capturedOn: "${lane.capturedOn}"\`, but the authoritative platform is `
        + `"${authority.authoritative}". A gate whose images are for another platform can `
        + `never pass. Fix the declaration in e2e/visual/visual-baselines.json (owner action).`,
        authority,
        lane,
        environment,
      ),
    }
  }

  if (running !== lane.capturedOn) {
    return {
      ok: false,
      lane,
      environment,
      reason: 'platform-mismatch',
      message: refusal(
        `visual: baselines for lane \`${lane.id}\` are authoritative on `
        + `"${lane.capturedOn}"; this run is on "${running}". `
        + `Re-run on ${lane.capturedOn}, or re-declare the authoritative platform in `
        + `e2e/visual/visual-baselines.json (owner action).`,
        authority,
        lane,
        environment,
      ),
    }
  }

  return { ok: true, lane, environment }
}

/**
 * The rule for a **capture**, which is deliberately not the rule for a run.
 *
 * `platformVerdict` refuses anywhere but the lane's own `capturedOn`, because a
 * comparison against another platform's images is not a comparison. Accepting is
 * the act that *establishes* a platform, so it has one extra opening: the
 * authoritative platform is always a legal place to capture, even for a lane
 * whose `capturedOn` is still something else. That is exactly the owner step
 * that promotes the per-component lane from win32 to linux, and without this
 * opening the harness would forbid the migration it exists to enable.
 *
 * A third platform is still refused. "Capture wherever you happen to be" is how
 * a lane acquires images nobody can reproduce.
 */
export function acceptVerdict(
  authority: PlatformAuthority,
  laneId: VisualLaneId,
  engine: string = authority.engine,
): PlatformVerdict {
  const lane = laneById(authority, laneId)
  const environment = captureEnvironment(engine)
  const running = environment.platform

  if (running === lane.capturedOn || running === authority.authoritative)
    return { ok: true, lane, environment }

  return {
    ok: false,
    lane,
    environment,
    reason: 'capture-platform-not-permitted',
    message: refusal(
      `visual: refusing to capture a baseline for lane \`${lane.id}\` on "${running}". `
      + `A capture is legal on that lane's own platform ("${lane.capturedOn}") or on the `
      + `authoritative platform ("${authority.authoritative}") — nowhere else. An image `
      + `captured on a third platform is one nobody can reproduce or review.`,
      authority,
      lane,
      environment,
    ),
  }
}

/**
 * How a baseline for this lane is captured — which is not the same answer for
 * every lane, and pretending it was would be the kind of confident-wrong
 * instruction that gets followed.
 *
 * Only the per-component lane has an acceptance tool. `yarn visual:accept`
 * takes `--component` or `--fixture` and drives
 * `e2e/visual/component-baselines.spec.ts`; it cannot address a
 * `gallery-<screen>-<theme>` or `theme-recipe-<screen>-<case>` snapshot at all.
 * The 34 screen-level baselines predate the authority rule and were committed
 * by hand. That is a real gap, raised as an owner decision in
 * `docs/program-2026-09-22-architecture/reports/TASK-S1-O3-handoff.md`; until it
 * is closed, this message says so instead of printing a command that does not
 * work.
 */
function captureInstruction(lane: VisualLane): string[] {
  if (lane.id === 'component-baselines') {
    return [
      `  To capture \`${lane.id}\` on ${lane.capturedOn} (OWNER, one snapshot per invocation):`,
      '    yarn visual:accept --component <DzName> --theme <light|dark> \\',
      '      --by "<name>" --reason "<what changed, and why the new image is correct>"',
    ]
  }
  return [
    `  Capturing \`${lane.id}\` (OWNER): this lane has NO per-snapshot acceptance tool.`,
    '    `yarn visual:accept` addresses --component / --fixture in the per-component lane',
    '    only. The screen-level baselines predate the authority rule and were committed by',
    `    hand. Capture is: run the lane on ${lane.capturedOn}, review every diff, commit the`,
    '    images with the reason in the commit message. See the TASK-S1-O3 handoff, owner',
    '    decision D-S1O3-2.',
  ]
}

function refusal(
  headline: string,
  authority: PlatformAuthority,
  lane: VisualLane,
  environment: CaptureEnvironment,
): string {
  const lanes = authority.lanes
    .map(l => `    ${l.id.padEnd(20)} ${l.capturedOn.padEnd(7)} ${l.role}`)
    .join('\n')
  return [
    headline,
    '',
    '  Why this is a refusal and not a diff:',
    '    A baseline is platform-locked — Playwright resolves',
    '    `{arg}-{project}-{platform}.png`, so images for another platform are not',
    '    "close enough to compare", they are absent. Playwright\'s default answer to',
    '    an absent baseline is to WRITE one, which would turn this verification run',
    '    into an unattributed capture of every snapshot in the lane. Capturing a',
    '    baseline is an owner act with an author and a reason (e2e/visual/README.md).',
    '',
    `  authoritative platform   ${authority.authoritative}   (CI runs ${authority.ciPlatform})`,
    `  this run                 ${describeEnvironment(environment)}`,
    '',
    '  lanes                    platform  role',
    lanes,
    '',
    ...captureInstruction(lane),
    '',
    '  See e2e/visual/README.md and',
    '  docs/program-2026-09-22-architecture/reports/TASK-S1-O3-handoff.md.',
  ].join('\n')
}
