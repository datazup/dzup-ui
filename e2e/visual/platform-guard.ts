import type { VisualLaneId } from './platform.ts'
import { test } from '@playwright/test'
import { platformVerdict, readPlatformAuthority } from './platform.ts'

/**
 * The in-run half of the authoritative-platform rule (TASK-S1-O3).
 *
 * `platform.ts` decides; this file is what a spec calls, and it exists as a
 * separate module for one reason: it imports `@playwright/test`, and the
 * preflight (`yarn visual:platform`) must be runnable with no runner at all.
 *
 * **Exactly one refusal, not one per spec.** `refusalRegistered` is module
 * scope, and an ES module is evaluated once per process, so the first spec to
 * call `guardVisualLane` on a bad platform registers the refusal test and every
 * other spec in the same run registers nothing. The output of
 * `yarn test:e2e:visual` on the wrong platform is therefore one failing test
 * with one message — which is the whole point, because the alternative
 * (Playwright's own behaviour) is 34 written PNGs and 34 failures.
 *
 * **A guarded spec registers no snapshot tests when the guard refuses.** It does
 * not register them as `skip`: a skipped snapshot test still resolves a snapshot
 * path, still reads as "not applicable" in a report, and Playwright's
 * `updateSnapshots: 'missing'` default is one config edit away from writing
 * again. Not registering is the only state that cannot become a capture.
 *
 * **A lane with nothing to compare is a failure, not a pass.** A spec whose
 * scope resolves to zero snapshots would otherwise exit 0 having proved nothing
 * — the worst outcome available to a visual lane, and worse than a red. The
 * `expectedShots` argument makes that case loud.
 */

let refusalRegistered = false

/** Reset between unit tests. Not used by the lane. */
export function resetRefusalRegistration(): void {
  refusalRegistered = false
}

function registerRefusal(title: string, message: string): void {
  if (refusalRegistered)
    return
  refusalRegistered = true
  test(title, () => {
    throw new Error(message)
  })
}

/**
 * Decide whether this spec may register its snapshot tests.
 *
 * @param laneId       the lane this spec is, as declared in `visual-baselines.json`
 * @param expectedShots how many snapshots the spec is about to register. Zero is
 *                      a refusal: a green run over nothing is not evidence.
 * @returns `true` when the spec may register its snapshot tests.
 */
export function guardVisualLane(laneId: VisualLaneId, expectedShots: number): boolean {
  let verdict
  try {
    verdict = platformVerdict(readPlatformAuthority(), laneId)
  }
  catch (error) {
    // A malformed or undeclared authority is itself a refusal. It must never
    // fall through to "run the lane anyway".
    registerRefusal(
      'visual: REFUSED — the platform authority cannot be read',
      error instanceof Error ? error.message : String(error),
    )
    return false
  }

  if (!verdict.ok) {
    registerRefusal(`visual: REFUSED — ${verdict.reason}`, verdict.message)
    return false
  }

  if (expectedShots <= 0) {
    registerRefusal(
      'visual: REFUSED — the lane has nothing to compare',
      `visual: lane \`${laneId}\` resolved 0 snapshots on `
      + `${verdict.environment.platform}. A visual lane that finds nothing to compare and `
      + `exits 0 reports "no visual regressions" about no pixels, which is the one outcome `
      + `worse than a red. Either scope.families / the lane's screen list is empty, or the `
      + `join against e2e/matrix/targets.generated.ts produced nothing — regenerate with `
      + `\`yarn generate:matrix-targets\`, or narrow the ledger honestly.`,
    )
    return false
  }

  return true
}
