import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { openTarget, RUNNABLE_TARGETS, storyCompleted } from './fixtures'

/**
 * WCAG 2.2 SC 2.5.7 Dragging Movements, measured in a browser (TASK-R2-O5).
 *
 * **What this lane exists to fix.** `packages/core/docs/wcag-deviations.json` is
 * the library's published SC 2.5.7 record: nine drag surfaces, six declared met
 * and three declared open. Every one of those verdicts was reached by reading
 * source — TASK-N1-O3 §6.3 — and nothing has ever asked a browser. TASK-N2-D2
 * recorded the consequence as finding F-3: the only *generated* signal near this
 * criterion, the capability matrix's `non-drag-alternative` cell, measures
 * whether a keyboard path is asserted, which is SC 2.1.1, and it therefore
 * disagrees with the audit on four of the nine surfaces while citing 2.5.7.
 *
 * So this file drives the criterion's own sentence: *can the functionality be
 * achieved by a **single pointer without dragging**?* Every interaction below is
 * a pointer press and release at one position — `page.mouse.click`, never a
 * `down … move … up` — and each surface's probe reads the value that the drag
 * itself changes.
 *
 * **The assertion is two-way, and that is the point.** The expected result is
 * not a constant: it is `surface.state === 'met'`, read out of the record. A
 * surface the record calls met must prove it in each engine, or the record is
 * overstating. A surface the record calls a gap must still be a gap, or the
 * record is stale — the day somebody lands the affordance, this test goes red
 * and the only way to make it green is to flip that surface to `met` and name
 * its single-pointer path, which `crossCheckWcagDeviations` then holds to the
 * ceiling. Neither direction can drift silently, which a hand-maintained JSON
 * file otherwise always does.
 *
 * **That day came on 2026-09-19.** Owner decision D117 option A put a stepper
 * pair on all three resize surfaces, this lane went red against the old record
 * exactly as designed, and the record was flipped to `met` with
 * `singlePointerNoDrag` named per surface — which forced `openGaps` and
 * `ceiling` to `0` together through `crossCheckWcagDeviations`. Not one
 * expectation in this file was edited to accommodate the change: the expected
 * value is still `surface.state === 'met'`, read out of the record.
 *
 * **Scope.** It runs under the `default` condition only (see
 * `CONDITION_ONLY_SPECS` in `playwright.config.ts`): nothing about a
 * single-pointer path changes under forced colours or reduced motion, and paying
 * for it in every condition would be paying to re-measure the same thing.
 */

interface WcagSurface {
  component: string
  operation: string
  singlePointerNoDrag: string | null
  state: 'met' | 'gap'
  gapReason?: string
}

const DEVIATIONS = JSON.parse(
  readFileSync(new URL('../../packages/core/docs/wcag-deviations.json', import.meta.url), 'utf8'),
) as { criterion: { id: string }, surfaces: WcagSurface[] }

/**
 * One surface's probe: perform a single-pointer, non-drag interaction and answer
 * whether the operation the drag performs actually happened.
 *
 * `story` overrides the lane's default story where the drag surface is not in
 * it — `DzTable`'s default story renders no resize handle at all, so measuring
 * the criterion there would measure nothing and pass.
 */
interface NonDragProbe {
  story?: string
  /** What the drag changes, in one sentence, for the failure message. */
  observes: string
  probe: (page: Page) => Promise<boolean>
}

/** Read every `aria-valuenow` in the canvas as one string. */
async function sliderValues(page: Page): Promise<string> {
  return page.evaluate(() =>
    [...document.querySelectorAll('#storybook-root [role="slider"]')]
      .map(el => el.getAttribute('aria-valuenow') ?? '')
      .join('|'))
}

/**
 * Click a box at a fraction of its width, and report whether `read` changed.
 *
 * The click is placed away from the centre on purpose: a thumb, a divider or a
 * handle usually sits where the value currently is, so a centred click can be
 * both a correct implementation and a no-op.
 */
async function clickAtFraction(
  page: Page,
  selector: string,
  fraction: number,
  read: (page: Page) => Promise<string>,
): Promise<boolean> {
  const before = await read(page)
  const target = page.locator(selector).first()
  const box = await target.boundingBox()
  if (box === null)
    throw new Error(`${selector} has no box in this story — the probe cannot click it`)
  await page.mouse.click(box.x + box.width * fraction, box.y + box.height / 2)
  await page.waitForTimeout(150)
  return (await read(page)) !== before
}

const PROBES: Record<string, NonDragProbe> = {
  // The press must land on the TRACK, not on `[role="slider"]`: in Reka the
  // slider role is on the THUMB, and the criterion's whole question is whether a
  // press somewhere other than the thumb sets the value. A probe aimed at the
  // role attribute measures the thumb refusing to move itself — which is what
  // this lane reported on its first run, and it was the probe that was wrong.
  DzSlider: {
    observes: 'the slider value',
    probe: page => clickAtFraction(page, '#storybook-root [data-part="control"]', 0.85, sliderValues),
  },
  DzRangeSlider: {
    observes: 'either thumb value',
    probe: page => clickAtFraction(page, '#storybook-root [data-part="control"]', 0.9, sliderValues),
  },
  DzImageComparison: {
    observes: 'the divider position',
    // `[data-part="control"]` here is the divider grip; the tap surface is the
    // image, which is the component root.
    probe: async (page) => {
      // A third probe defect, measured 2026-09-19 (TASK-R2-O5, **D129**). This
      // story's images are REMOTE — `picsum.photos` — and the component maps a
      // press to a position through the ROOT'S BOX, which the images size. A
      // press landing before they have painted therefore reads a box of no
      // height and the divider does not move: the cell failed twice in a cold
      // full-lane run and then passed three times running once the images were
      // cached. Waiting for the image is not weakening the assertion — a
      // genuinely broken tap-to-place still fails, and an image that never
      // arrives still fails — it stops the lane measuring the network.
      await page.locator('#storybook-root img').first().evaluate(
        (img: HTMLImageElement) => img.complete
          ? undefined
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            }),
      ).catch(() => undefined)
      return clickAtFraction(page, '#storybook-root [data-part="root"]', 0.2, sliderValues)
    },
  },
  DzKnob: {
    observes: 'the knob value',
    // A knob is round: a press at the top of its box is a different angle from
    // wherever the value currently points, on any starting value in the story.
    probe: async (page) => {
      const before = await sliderValues(page)
      const box = await page.locator('#storybook-root [role="slider"]').first().boundingBox()
      if (box === null)
        throw new Error('DzKnob has no box in this story')
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.1)
      await page.waitForTimeout(150)
      return (await sliderValues(page)) !== before
    },
  },
  DzOrderList: {
    observes: 'the order of the items',
    probe: async (page) => {
      const list = page.locator('#storybook-root')
      const before = ((await list.textContent()) ?? '').trim()
      // Two single taps, neither of them a drag: make an item current, then use
      // the always-visible move control that is the component's declared
      // single-pointer path.
      await page.locator('#storybook-root li').first().click()
      const move = page.locator(
        '#storybook-root button[aria-label*="down" i], #storybook-root button[aria-label*="bottom" i]',
      ).first()
      if (await move.count() === 0)
        return false
      await move.click()
      await page.waitForTimeout(150)
      return ((await list.textContent()) ?? '').trim() !== before
    },
  },
  DzFileUpload: {
    observes: 'the file picker opening',
    // The drop zone's non-drag path is the picker a plain click opens. A
    // `filechooser` event is the only observable proof that it opened; the
    // dialog itself is chrome no page script can see.
    probe: async (page) => {
      const zone = page.locator('#storybook-root [role="button"]').first()
      try {
        const [chooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 5_000 }),
          zone.click(),
        ])
        return chooser !== undefined
      }
      catch {
        return false
      }
    },
  },
  DzResizable: {
    observes: 'the size of the panes',
    probe: page => clickResizeSurface(page, '#storybook-root [data-part="separator"]'),
  },
  DzSplitter: {
    observes: 'the size of the panes',
    probe: page => clickResizeSurface(page, '#storybook-root [data-part="separator"]'),
  },
  DzTable: {
    story: 'core-data-dztable--column-resizing',
    observes: 'the width of the column',
    probe: page => clickResizeSurface(page, '#storybook-root [data-dz-resize-handle]'),
  },
}

/**
 * The resize probe, shared by the three surfaces the record calls gaps.
 *
 * It is written to pass the moment *any* of the affordances under consideration
 * ships, so that it measures the criterion rather than one design: it presses
 * the handle once (a tap-to-place or double-tap design answers that), then, if
 * the press revealed or focused a control, presses that control once as well (a
 * stepper or preset-menu design answers that). Both are single pointer presses
 * with no movement while the button is down. If the observed geometry has not
 * changed after either, the surface has no single-pointer path.
 */
async function clickResizeSurface(page: Page, handleSelector: string): Promise<boolean> {
  const geometry = async (): Promise<string> =>
    page.evaluate(() =>
      [...document.querySelectorAll('#storybook-root *')]
        .filter(el => el.getAttribute('data-part') === 'panel' || el.tagName === 'TH')
        .map(el => Math.round(el.getBoundingClientRect().width))
        .join('|'))

  const before = await geometry()
  const handle = page.locator(handleSelector).first()
  const box = await handle.boundingBox()
  if (box === null)
    throw new Error(`${handleSelector} has no box in this story — the probe cannot press it`)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(150)
  if ((await geometry()) !== before)
    return true

  // Second single press: whatever the first press revealed. A stepper, a preset
  // menu item, a numeric field's increment — all are buttons. Since 2026-09-19
  // the three resize surfaces answer with `[data-dz-resize-step]`, the stepper
  // pair owner decision D117 option A put on the handle; the selector was
  // written before that pick and deliberately admits any of the four candidate
  // designs, so it still measures the criterion rather than one implementation.
  const revealed = page.locator(
    '#storybook-root [role="separator"] button, #storybook-root [data-part="separator"] button, '
    + '[role="menu"] [role="menuitem"], #storybook-root [data-dz-resize-step]',
  ).first()
  if (await revealed.count() === 0)
    return false
  await revealed.click()
  await page.waitForTimeout(150)
  return (await geometry()) !== before
}

test.describe(`SC ${DEVIATIONS.criterion.id} — single pointer, no dragging`, () => {
  for (const surface of DEVIATIONS.surfaces) {
    const target = RUNNABLE_TARGETS.find(t => t.component === surface.component)
    const probe = PROBES[surface.component]

    if (target === undefined || probe === undefined) {
      // Declared rather than skipped: a surface this lane cannot drive is a
      // surface whose published verdict rests on source reading alone, and the
      // report has to say so.
      test.fixme(
        `${surface.component} — unrun: ${target === undefined ? 'no lane target' : 'no probe recipe'}`,
        () => {
          throw new Error('unreachable')
        },
      )
      continue
    }

    test(`${surface.component} — ${surface.operation}`, async ({ page }) => {
      await openTarget(page, probe.story === undefined ? target : { ...target, story: probe.story })
      // Wait for the story's own `play` function, not just for the canvas.
      // `DzImageComparison`'s play focuses the grip and presses ArrowRight; a
      // probe that pressed before it ran measured a component that had not
      // mounted its pointer handlers yet and reported the library's one working
      // tap-to-place surface as a 2.5.7 failure. Measured, not guessed: the same
      // press on a settled page moves the divider from 51 to 20.
      await storyCompleted(page)
      const achieved = await probe.probe(page)

      // SC 2.5.8 for the affordance this lane just pressed.
      //
      // The `touch` condition measures every pointer target at 24 x 24 CSS px,
      // but it skips an element at `opacity: 0` as a visually-hidden native
      // control — and the steppers rest at `opacity: 0` so that the resting
      // rendering stays unchanged. It also opens each component's DEFAULT
      // story, and `DzTable`'s renders no resize handle at all. Both holes meet
      // here: this is the only lane that opens the column-resizing story, and a
      // box is a box whether or not it is painted, so the measurement is honest
      // without pretending to hover anything. Without this, closing a 2.5.7 gap
      // with controls nothing measures would look exactly like closing it
      // properly.
      const undersized = await page.locator('#storybook-root [data-dz-resize-step]')
        .evaluateAll(els => els
          .map(el => el.getBoundingClientRect())
          .filter(r => r.width < 24 || r.height < 24)
          .map(r => `${r.width} x ${r.height}`))
      expect(
        undersized,
        `${surface.component}'s single-pointer controls are under 24 x 24 CSS px (SC 2.5.8)`,
      ).toEqual([])

      expect(
        achieved,
        surface.state === 'met'
          ? `${surface.component} is published as meeting SC 2.5.7 `
          + `("${surface.singlePointerNoDrag}") but a single pointer press did not change `
          + `${probe.observes}`
          : `${surface.component} is published as an open SC 2.5.7 gap, and a single pointer press `
            + `changed ${probe.observes}. The affordance exists: flip the surface to \`met\` in `
            + `packages/core/docs/wcag-deviations.json, name the path in \`singlePointerNoDrag\`, `
            + `and lower \`openGaps\` and \`ceiling\` together.`,
      ).toBe(surface.state === 'met')
    })
  }
})
