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
 * The two conditions no engine can emulate, expressed as the stylesheet the
 * user agent would carry (TASK-R2-O5).
 *
 * **`text-200` — WCAG 1.4.4 Resize Text.** The criterion is about the user
 * raising the *default font size*, which is a user-stylesheet change to the root
 * em, not a zoom factor and not a viewport change. `zoom-400` already covers the
 * viewport axis (SC 1.4.10 Reflow) and cannot stand in for this one: at 200 %
 * text the layout keeps its 1280 CSS px of width while every `rem`-sized box and
 * every token-driven type size doubles, which is the state a fixed-height
 * control or a `overflow: hidden` label actually breaks in. Percentages resolve
 * against the parent, and `html`'s parent is the initial containing block, so
 * `200%` is exactly the browser default doubled however the page spells its own
 * root size.
 *
 * **`spacing` — WCAG 1.4.12 Text Spacing.** These are the criterion's four
 * numbers verbatim (line height 1.5×, paragraph spacing 2×, letter spacing
 * 0.12×, word spacing 0.16× the font size), in the same shape as the WAI's own
 * text-spacing bookmarklet. `em` units are used so each value stays relative to
 * the element's own font size, which is what "times the font size" means; a
 * fixed `px` sheet would under-apply on large text and over-apply on small.
 *
 * Both are applied with `!important` for the same reason the WAI bookmarklet
 * does: the criterion is about what happens when a *user* overrides the author,
 * and an override the author's specificity defeats is not the condition.
 */
const CONDITION_STYLESHEET: Partial<Record<MatrixCondition, string>> = {
  'text-200': 'html { font-size: 200% !important }',
  'spacing': [
    '*, *::before, *::after {',
    '  line-height: 1.5 !important;',
    '  letter-spacing: 0.12em !important;',
    '  word-spacing: 0.16em !important;',
    '}',
    'p, li, dd, dt, blockquote, figcaption { margin-block-end: 2em !important }',
  ].join('\n'),
}

/**
 * Install the current condition's user stylesheet, if it has one.
 *
 * Called from {@link openTarget} rather than from a `beforeEach`, so every spec
 * in this directory gets the condition by opening a story — the same way the
 * `rtl` global arrives. A spec that navigates by hand and skips this would
 * silently measure the default rendering under a condition project's name,
 * which is why `expectConditionEngaged` exists beside it.
 */
export async function applyConditionStyles(page: Page): Promise<void> {
  const css = CONDITION_STYLESHEET[matrixProject().condition]
  if (css === undefined)
    return
  // Injected by hand rather than through `addStyleTag` so the element carries a
  // marker: `withConditionSuspended` below needs to find this sheet and only
  // this one, and a lane that measured "with" and "without" by loading the story
  // twice would pay for a second render and still compare two renders.
  await page.evaluate((content) => {
    const style = document.createElement('style')
    style.setAttribute('data-dz-condition', '')
    style.textContent = content
    document.head.append(style)
  }, css)
}

/**
 * Run `fn` with the condition's user stylesheet switched off, then switch it
 * back on.
 *
 * This is what makes `text-200` and `spacing` measure the *condition* rather
 * than the component's resting state: a box that already clips its text at the
 * default font size is a defect, but it is not a 1.4.4 defect, and a lane that
 * could not tell the two apart would report 88 components' worth of pre-existing
 * design decisions as WCAG failures on its first run. `CSSStyleSheet.disabled`
 * is the switch, so nothing is removed and re-parsed between the two reads.
 */
export async function withConditionSuspended<T>(page: Page, fn: () => Promise<T>): Promise<T> {
  await setConditionDisabled(page, true)
  try {
    return await fn()
  }
  finally {
    await setConditionDisabled(page, false)
  }
}

async function setConditionDisabled(page: Page, disabled: boolean): Promise<void> {
  await page.evaluate((value) => {
    for (const style of document.querySelectorAll<HTMLStyleElement>('style[data-dz-condition]')) {
      if (style.sheet !== null)
        style.sheet.disabled = value
    }
  }, disabled)
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
    const loaded = await loadStoryCanvas(page, target.story!, globals)
    await applyConditionStyles(loaded)
    return loaded
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
  measured: Record<string, unknown>
  reason: string
}

const KNOWN_FAILURES = JSON.parse(
  readFileSync(new URL('./known-failures.json', import.meta.url), 'utf8'),
) as { entries: KnownFailure[] }

interface EngineRatchet {
  version: string
  conditionsRun: string[]
  notReproducing: KnownFailure[]
  engineOnly: KnownFailure[]
}

const ENGINE_RATCHETS = JSON.parse(
  readFileSync(new URL('./engine-ratchets.json', import.meta.url), 'utf8'),
) as { engines: Record<string, EngineRatchet | undefined> }

function match(entries: readonly KnownFailure[], component: string, condition: string) {
  return entries.find(e => e.component === component && e.condition === condition)
}

/**
 * The ledger entry for one cell, if it has one.
 *
 * The ledger is deliberately not an "expected failures" list the suite quietly
 * honours: `conditions.spec.ts` turns a hit into `test.fail()`, which makes
 * Playwright fail the run when the cell starts passing. Fixing a component
 * therefore breaks the build until somebody deletes its line, which is the only
 * way a list like this ever gets shorter.
 *
 * **Two ledgers, one rule (TASK-N1-O2).** `known-failures.json` is
 * cross-engine: its 46 entries were measured on chromium, and running the lane
 * on firefox reproduced all 46 with the same numbers, so an entry there is an
 * expectation for *every* engine. `engine-ratchets.json` records only what one
 * engine measures differently — `notReproducing` withdraws a cross-engine
 * expectation for one engine, `engineOnly` adds one. Without that split, the
 * two WebKit divergences measured on 2026-08-31 would each fail the run as an
 * "unexpected pass" and the only ways to silence them would be to weaken the
 * chromium ratchet or to skip the cell. Both are the failure this file exists
 * to prevent, so the divergence is recorded instead, with its measurement.
 */
export function knownFailure(component: string, condition: string): KnownFailure | undefined {
  const { engine } = matrixProject()
  const ratchet = ENGINE_RATCHETS.engines[engine]

  if (ratchet !== undefined) {
    if (match(ratchet.notReproducing, component, condition) !== undefined)
      return undefined
    const own = match(ratchet.engineOnly, component, condition)
    if (own !== undefined)
      return own
  }

  return match(KNOWN_FAILURES.entries, component, condition)
}

// ---------------------------------------------------------------------------
// Motion policy (ADR-20 §7, TASK-R5-O3)
// ---------------------------------------------------------------------------

/**
 * The value the reduced-motion condition forces through `__DZ_MOTION__`.
 *
 * It is a `DzMotionPreference` (`'system' | 'reduced' | 'full'`), NOT the
 * attribute value components emit (`data-dz-motion="reduce"`). The two spellings
 * differ by one letter, and `dzMotionTestMode()` ignores anything that is not a
 * valid preference — so a typo here silently releases the forced mode. That is
 * exactly the seeded failure the motion-policy spec was proven against.
 */
export const FORCED_MOTION_PREFERENCE = 'reduced'

/**
 * Force the library's deterministic motion mode for every document this page
 * loads (`packages/core/src/composables/provider/useDzMotion.ts`).
 *
 * `addInitScript` runs before any of the page's own scripts, which is why the
 * channel is a global rather than a call to `setDzMotionTestMode`: no module of
 * the library exists yet when the value has to be in place, and `useDzMotion`
 * reads it lazily inside its computed, on first render.
 */
export async function forceMotionPolicy(page: Page, preference: string = FORCED_MOTION_PREFERENCE): Promise<void> {
  await page.addInitScript((value) => {
    ;(globalThis as { __DZ_MOTION__?: string }).__DZ_MOTION__ = value
  }, preference)
}

interface MotionMetaRecord {
  name: string
  kind: 'public-component' | 'compound-part'
  parentComponent?: string
  source: string
  providerHooks?: string[]
}

/** One lane target whose rendered tree reads the motion policy. */
export interface MotionTarget {
  component: string
  target: MatrixTarget & { story: string }
  /** The records that call `useDzMotion` / `useDzMotionAttribute` — the target itself or its compound parts. */
  parts: readonly string[]
  /**
   * `attribute` when a part binds `data-dz-motion` (`useDzMotionAttribute`), so
   * the policy reaches CSS and is observable in the DOM; `script` when the policy
   * is only read in script (`DzAnchor` passes `behavior` to `window.scrollTo`).
   */
  emits: 'attribute' | 'script'
}

const COMPONENT_META = JSON.parse(
  readFileSync(new URL('../../packages/core/docs/component-meta.json', import.meta.url), 'utf8'),
) as { components: MotionMetaRecord[] }

const motionParts = COMPONENT_META.components.filter(r =>
  (r.providerHooks ?? []).includes('useDzMotion')
  && !r.source.replace(/\\/g, '/').startsWith('packages/core/src/providers/'))

function emitsAttribute(record: MotionMetaRecord): boolean {
  const source = readFileSync(new URL(`../../${record.source}`, import.meta.url), 'utf8')
  return /\buseDzMotionAttribute\s*\(/.test(source)
}

/**
 * The lane targets that consume the motion policy, DERIVED from the generated
 * `component-meta.json` rather than listed by hand.
 *
 * `providerHooks` is re-derived from source by `validate:component-meta`, so a
 * component that adopts `useDzMotion` joins this list on the next regeneration
 * and its motion-policy test then fails until somebody writes the one-line
 * recipe that reveals its animated node. A compound part (`DzDialogContent`) is
 * credited to the component whose story renders it (`DzDialog`).
 */
export const MOTION_TARGETS: readonly MotionTarget[] = (() => {
  const byOwner = new Map<string, MotionMetaRecord[]>()
  for (const record of motionParts) {
    const owner = record.kind === 'compound-part' && record.parentComponent !== undefined
      ? record.parentComponent
      : record.name
    byOwner.set(owner, [...(byOwner.get(owner) ?? []), record])
  }
  const out: MotionTarget[] = []
  for (const [component, parts] of [...byOwner.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const target = RUNNABLE_TARGETS.find(t => t.component === component)
    if (target === undefined)
      continue
    out.push({
      component,
      target: target as MatrixTarget & { story: string },
      parts: parts.map(p => p.name).sort(),
      emits: parts.some(emitsAttribute) ? 'attribute' : 'script',
    })
  }
  return out
})()

/**
 * Motion consumers this lane does not drive — Tier A, or no story — named so
 * the report says what is NOT browser-proven instead of implying full coverage.
 */
export const MOTION_CONSUMERS_OUTSIDE_LANE: readonly string[] = [...new Set(
  motionParts.map(r => (r.kind === 'compound-part' && r.parentComponent !== undefined ? r.parentComponent : r.name)),
)].filter(name => !MOTION_TARGETS.some(t => t.component === name)).sort()

/**
 * Wait until Storybook has finished rendering the story, including its `play`
 * function.
 *
 * `loadStoryCanvas` waits for `sb-show-main`, which Storybook sets BEFORE `play`
 * runs. A story such as `DzCommandPalette`'s opens and closes its own dialog in
 * `play`; revealing the component while that is still running races the story.
 * The preview's current render moves through `playing` → `played` →
 * `completing` (Storybook's own wait for animations) → `completed` and settles
 * on `finished` — measured on the built Storybook 10 preview, 2026-09-17, where
 * a wait for `completed` alone timed out on every story because the phase had
 * already moved past it.
 */
export async function storyCompleted(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const preview = (globalThis as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } })
      .__STORYBOOK_PREVIEW__
    const phase = preview?.currentRender?.phase
    return phase === 'completed' || phase === 'finished' || phase === 'errored' || phase === 'aborted'
  }, undefined, { timeout: 30_000 })
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
