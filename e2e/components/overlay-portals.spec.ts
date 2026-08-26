import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Overlay portal and focus smoke (TASK-SK-2).
 *
 * `overlays.spec.ts` beside this file already proves overlays **open and
 * close**. This file proves the two things that break when a consumer resolves
 * two copies of `vue` or `reka-ui`, and which an open/close test passes right
 * through:
 *
 *   1. **One portal root.** A duplicate Reka copy renders its own teleport
 *      target, so the same overlay appears twice — two dismissable layers, two
 *      dialog roles, two popper wrappers. The Arabic app shipped exactly this
 *      (two overlays) and it was diagnosed as a styling problem for weeks.
 *   2. **Focus returns to the trigger.** Focus restoration is owned by the
 *      dismissable layer that opened the overlay. When two copies are loaded,
 *      the layer that traps focus is not the layer that releases it, so focus
 *      lands on `<body>` and keyboard users are dropped to the top of the page.
 *
 * `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md` measured the
 * fix: `reka-ui` in `resolve.dedupe`. Deduping `vue` alone does **not** work —
 * pin the single Reka copy and the single Vue follows, not the reverse. Every
 * in-repo consumer now gets that list from
 * `createDzupResolution` (TASK-SK-1); this is the assertion that says so.
 *
 * Selectors are Reka's own internal markers on purpose. They are not a public
 * contract and they are not asserted as one — they are the thing that doubles,
 * which is what makes them the right probe for this specific failure.
 */

/** Reka marks each dismissable layer it mounts; a second copy mounts a second. */
const DISMISSABLE_LAYER = '[data-dismissable-layer]'
/** Reka's floating wrapper for popper-positioned content (tooltip, popover). */
const POPPER_WRAPPER = '[data-reka-popper-content-wrapper]'

test.describe('dzDialog portal and focus', () => {
  const STORY_ROOT = 'core-overlays-dzdialog'

  test('mounts exactly one portal root while open', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    // Nothing portalled before the dialog opens: a layer present at rest would
    // mean an overlay mounted itself without being asked.
    await expect(frame.locator(DISMISSABLE_LAYER)).toHaveCount(0)

    await frame.getByRole('button', { name: /open dialog/i }).click()
    await expect(frame.getByRole('heading', { name: /dialog title/i })).toBeVisible()

    await expect(
      frame.locator(DISMISSABLE_LAYER),
      'two dismissable layers means two reka-ui copies — add reka-ui to resolve.dedupe',
    ).toHaveCount(1)
    await expect(frame.getByRole('dialog')).toHaveCount(1)
  })

  test('returns focus to the trigger when closed', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const trigger = frame.getByRole('button', { name: /open dialog/i })
    await trigger.click()
    await expect(frame.getByRole('heading', { name: /dialog title/i })).toBeVisible()

    // Focus must be inside the dialog while it is open — if it is not, the
    // focus trap belongs to a different copy than the content.
    await expect(frame.locator('[role="dialog"] :focus, [role="dialog"]:focus'))
      .toHaveCount(1)

    await frame.keyboard.press('Escape')
    await expect(frame.getByRole('dialog')).toHaveCount(0)

    await expect(
      trigger,
      'focus did not return to the trigger — the layer that trapped focus is not the one that released it',
    ).toBeFocused()
  })

  test('tears the portal down on close rather than leaving it detached', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await frame.getByRole('button', { name: /open dialog/i }).click()
    await expect(frame.locator(DISMISSABLE_LAYER)).toHaveCount(1)

    await frame.keyboard.press('Escape')

    // A layer left behind keeps its outside-click and Escape handlers alive, so
    // the *next* overlay opens on top of a listener nobody can see.
    await expect(frame.locator(DISMISSABLE_LAYER)).toHaveCount(0)
  })

  test('opening twice does not accumulate portal roots', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const trigger = frame.getByRole('button', { name: /open dialog/i })
    for (let attempt = 0; attempt < 2; attempt++) {
      await trigger.click()
      await expect(frame.getByRole('dialog')).toHaveCount(1)
      await frame.keyboard.press('Escape')
      await expect(frame.getByRole('dialog')).toHaveCount(0)
    }

    await expect(frame.locator(DISMISSABLE_LAYER)).toHaveCount(0)
  })
})

test.describe('dzTooltip portal', () => {
  const STORY_ROOT = 'core-overlays-dztooltip'

  test('mounts exactly one popper wrapper while shown', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await expect(frame.locator(POPPER_WRAPPER)).toHaveCount(0)

    await frame.getByRole('button', { name: /hover me/i }).hover()
    await expect(frame.getByText('This is a tooltip').first()).toBeVisible()

    await expect(
      frame.locator(POPPER_WRAPPER),
      'two popper wrappers means two reka-ui copies — add reka-ui to resolve.dedupe',
    ).toHaveCount(1)
  })

  test('keeps the trigger focusable and does not steal focus', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const trigger = frame.getByRole('button', { name: /hover me/i })
    await trigger.focus()
    await expect(frame.getByText('This is a tooltip').first()).toBeVisible()

    // A tooltip is not a focus target. If focus moved, the content mounted
    // under a different layer than the one that opened it.
    await expect(trigger).toBeFocused()
  })
})
