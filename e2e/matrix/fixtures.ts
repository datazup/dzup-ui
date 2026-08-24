import type { Page } from '@playwright/test'
import type { MatrixCondition } from '../../playwright.config'
import type { MatrixTarget } from './targets.generated'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'
import { MATRIX_TARGETS } from './targets.generated'

/**
 * Shared setup for the three-engine browser matrix (TASK-OSS-P5-03).
 *
 * Every spec in this directory runs once per `matrix-{engine}-{condition}`
 * project. The condition is not read from an environment variable or inferred
 * from the project name — it is on the project's own `metadata`, so the suite
 * and the config cannot disagree about which condition is in force.
 */

export interface MatrixProjectInfo {
  engine: string
  condition: MatrixCondition
}

/** The engine and condition of the project this test is running under. */
export function matrixProject(): MatrixProjectInfo {
  const metadata = test.info().project.metadata as Partial<MatrixProjectInfo>
  const { engine, condition } = metadata
  if (engine === undefined || condition === undefined) {
    throw new Error(
      `A matrix spec ran under project "${test.info().project.name}", which carries no `
      + `{engine, condition} metadata. Matrix specs must run under a matrix-* project; `
      + `the base engine projects exclude this directory for that reason.`,
    )
  }
  return { engine, condition }
}

/**
 * The components this lane covers.
 *
 * Tier A is deliberately absent: the reassessment's browser matrix asks for
 * "sampled visual" on presentational components and "required" from Tier B up,
 * and running 55 badges and separators through 18 engine/condition cells would
 * buy sampling nobody reads at a cost that gets the whole lane switched off.
 * They keep the single chromium default lane the existing `e2e/components`
 * suites already give them.
 */
export const LANE_TARGETS: readonly MatrixTarget[] = MATRIX_TARGETS.filter(t => t.tier !== 'A')

/** Targets with a story to drive. The rest are reported by {@link declareUnrun}. */
export const RUNNABLE_TARGETS: readonly MatrixTarget[] = LANE_TARGETS.filter(
  (t): t is MatrixTarget & { story: string } => t.story !== null,
)

/**
 * Register a failing-visible test for every target the lane cannot drive.
 *
 * `test.fixme` rather than `test.skip`: a skip reads as "not applicable here",
 * which is exactly the claim a component with no story has not earned. A fixme
 * is a cell the report prints with the reason attached, which is what
 * TASK-OSS-P5-06 means by `unrun`.
 */
export function declareUnrun(): void {
  for (const target of LANE_TARGETS) {
    if (target.story !== null)
      continue
    test.fixme(
      `${target.component} — unrun: no story to drive`,
      () => {
        throw new Error('unreachable')
      },
    )
  }
}

/**
 * Open a target's story under the current condition.
 *
 * `rtl` is passed as a Storybook global rather than as a context option because
 * direction is a document property, and the `direction` global already wires
 * `DzProvider` with an Arabic locale — which is the thing under test, not
 * `dir="rtl"` on a wrapper div.
 */
export async function openTarget(page: Page, target: MatrixTarget): Promise<Page> {
  const { condition } = matrixProject()
  const globals = condition === 'rtl' ? 'direction:rtl' : undefined
  try {
    return await loadStoryCanvas(page, target.story!, globals)
  }
  catch (error) {
    // Storybook answers an unknown story id by swapping a class on <body> and
    // rendering its own error page, so the raw failure is a 60-second timeout
    // waiting for `sb-show-main` — which reads as "the component is broken".
    // It is almost always a story id that does not exist, and saying so is the
    // difference between a five-minute fix and an afternoon.
    const cls = await page.locator('body').getAttribute('class').catch(() => null)
    if (cls?.includes('sb-show-errordisplay') === true) {
      throw new Error(
        `Storybook has no story \`${target.story}\` for ${target.component}. `
        + `e2e/matrix/targets.generated.ts is derived from the story sources — re-run `
        + `\`yarn generate:matrix-targets\`, and check toStoryExportId() against the id `
        + `Storybook actually built.`,
      )
    }
    throw error
  }
}

/** The story canvas root. */
export function canvas(page: Page) {
  return page.locator('#storybook-root')
}

interface KnownFailure {
  component: string
  condition: string
  measured: { engine: string, overflowPx?: number }
  reason: string
}

const KNOWN_FAILURES = JSON.parse(
  readFileSync(new URL('./known-failures.json', import.meta.url), 'utf8'),
) as { entries: KnownFailure[] }

/**
 * The ledger entry for one cell, if it has one.
 *
 * The ledger is deliberately not an "expected failures" list the suite quietly
 * honours: `conditions.spec.ts` turns a hit into `test.fail()`, which makes
 * Playwright fail the run when the cell starts passing. Fixing a component
 * therefore breaks the build until somebody deletes its line, which is the only
 * way a list like this ever gets shorter.
 */
export function knownFailure(component: string, condition: string): KnownFailure | undefined {
  return KNOWN_FAILURES.entries.find(
    e => e.component === component && e.condition === condition,
  )
}

/**
 * Assert the story actually rendered something.
 *
 * Counting element children rather than reaching for `not.toBeEmpty()`, which
 * measures **text**: an icon-only `DzCopyButton` renders a button and an SVG
 * and no text at all, so `toBeEmpty()` calls it empty and the assertion fails
 * on eleven perfectly correct components. Storybook sets `sb-show-main` before
 * the Vue app has necessarily committed, so `loadStoryCanvas` proves the page
 * loaded and this proves the story did.
 */
export async function expectRendered(page: Page): Promise<void> {
  await expect(page.locator('#storybook-root > *')).not.toHaveCount(0)
}
