import type { TestInfo } from '@playwright/test'
import process from 'node:process'

/**
 * The baseline-acceptance authority rule, enforced inside the run (TASK-N1-O6).
 *
 * **The problem this solves.** Self-hosted `toHaveScreenshot()` compares a
 * render against a committed PNG, and that is all it does. It cannot tell a
 * baseline that was reviewed from one that was overwritten, because after
 * `--update-snapshots` the run is green either way. The comparison is the easy
 * half; the authority is the half that decides whether a green run means
 * anything.
 *
 * So the rule is enforced in two places that fail for different reasons:
 *
 *   1. **Here** — a run that would *write* a baseline must name exactly one
 *      snapshot and carry a reason and an author. `--update-snapshots` across
 *      the lane throws on the first test it reaches. There is no flag, config
 *      value or env var that re-enables the bulk path; `visual:accept` sets
 *      these variables for one snapshot at a time and is the only sanctioned
 *      caller.
 *   2. **`yarn validate:visual-baselines`** — a committed PNG whose digest does
 *      not match the ledger fails the gate, with no browser involved. That is
 *      what catches a baseline edited, replaced or regenerated outside this
 *      guard, including by a Playwright version that changes its encoder.
 *
 * One without the other is not a control. The guard alone is bypassed by
 * writing the PNG by hand; the digest gate alone is satisfied by anyone willing
 * to run the accept tool without reading the diff — which is why the accept
 * tool records *who* and *why* rather than just re-digesting.
 */

/** Reasons that are not reasons. A rejected list, not a suggestion. */
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

const MIN_REASON_LENGTH = 24

const RULE = `
The visual lane refuses to write a baseline without a recorded cause.

  A changed snapshot is a changed product. Accepting one is an act with an
  author and a reason, the same way lowering a perf threshold is — see
  e2e/visual/README.md. A bulk \`--update-snapshots\` would make every one of
  those acts anonymous at once, so it is refused rather than discouraged.

To accept ONE baseline:

  yarn visual:accept --component DzButton --theme dark \\
    --by "<name>" --reason "<what changed in the product, and why it is correct>"

To see what changed first:

  yarn test:e2e:visual:pilot          # writes the diff into playwright-report/
`.trim()

function fail(detail: string): never {
  throw new Error(`${detail}\n\n${RULE}`)
}

/**
 * Refuse to write a baseline unless this run was authorised for exactly this
 * snapshot.
 *
 * Called immediately before every `toHaveScreenshot()` in the per-component
 * lane. A comparison run (`updateSnapshots` is `none` or `missing`) passes
 * straight through — this only governs *bulk* writing.
 *
 * **`missing` is deliberately not blocked here, and is still not a way in.** It
 * is Playwright's default and it writes a first baseline before any assertion
 * this guard could stand in front of — but it also *fails* that test ("A
 * snapshot doesn't exist … writing actual"), and the PNG it leaves behind has
 * no ledger entry, so `validate:visual-baselines` rejects it as an orphan. An
 * unaccepted first capture therefore fails twice, in the run and in the gate.
 */
export function assertBaselineAuthority(info: TestInfo, snapshotArg: string): void {
  const mode = info.config.updateSnapshots

  const accept = process.env.DZUP_VISUAL_ACCEPT
  const reason = (process.env.DZUP_VISUAL_ACCEPT_REASON ?? '').trim()
  const by = (process.env.DZUP_VISUAL_ACCEPT_BY ?? '').trim()

  if (accept === undefined || accept === '') {
    if (mode === 'none' || mode === 'missing')
      return
    fail(
      `Refusing to run with \`--update-snapshots\` (mode: ${mode}). No snapshot was named, `
      + `so this run would rewrite every baseline in the lane at once.`,
    )
  }

  if (accept !== snapshotArg) {
    fail(
      `This run is authorised for \`${accept}\` and reached \`${snapshotArg}\`. `
      + `Acceptance is one snapshot per invocation; run \`visual:accept\` again for the other.`,
    )
  }

  if (mode === 'none') {
    fail(
      `\`${snapshotArg}\` was authorised for acceptance but the run cannot write `
      + `(updateSnapshots: none).`,
    )
  }

  if (by === '') {
    fail(`Accepting \`${snapshotArg}\` requires --by: a baseline has an author or it has nobody.`)
  }

  if (reason.length < MIN_REASON_LENGTH || EMPTY_REASONS.has(reason.toLowerCase())) {
    fail(
      `Accepting \`${snapshotArg}\` requires --reason describing what changed in the product `
      + `and why the new image is correct (at least ${MIN_REASON_LENGTH} characters, and not `
      + `one of the placeholder words). Got: ${reason === '' ? '(empty)' : JSON.stringify(reason)}.`,
    )
  }
}

/** Whether this run is a write run at all. Used to decide the probe path. */
export function isAcceptRun(info: TestInfo): boolean {
  return info.config.updateSnapshots === 'all' || info.config.updateSnapshots === 'changed'
}
