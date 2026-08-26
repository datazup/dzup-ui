import { expect, test } from '@playwright/test'

/**
 * Overlay portal and focus smoke for the landing app (TASK-SK-2).
 *
 * The landing app is the highest-blast-radius overlay consumer in this
 * repository — 18 overlay families across 69 files, on a public site — and until
 * TASK-SK-1 its Vite config set no `resolve.dedupe` at all. Neither did any
 * other consumer.
 *
 * That matters because `@floating-ui/vue`, a direct dependency of
 * `@dzup-ui/core`, resolves its own `vue@3.5.39` while the workspace packages
 * and every app resolve `vue@3.5.31`; `yarn why reka-ui` likewise reports
 * `reka-ui@2.9.2` under two distinct `@dzup-ui/core` peer contexts. Two copies
 * are available to be loaded, and nothing was pinning one.
 *
 * `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md` measured the
 * failure and the fix: with two Reka copies, an overlay renders twice and focus
 * restoration lands on `<body>`; adding **`reka-ui`** to `resolve.dedupe` fixes
 * it, and deduping `vue` alone does not. This file asserts the outcome on the
 * real routes rather than trusting the config to keep saying so.
 *
 * The Storybook-side equivalent is `e2e/components/overlay-portals.spec.ts`,
 * which runs the same checks on three engines against the component library.
 * This one runs against the app that ships.
 */

/** Reka marks each dismissable layer it mounts; a second copy mounts a second. */
const DISMISSABLE_LAYER = '[data-dismissable-layer]'
/** Reka's floating wrapper for popper-positioned content. */
const POPPER_WRAPPER = '[data-reka-popper-content-wrapper]'

test.describe('create dialog', () => {
  test('mounts one portal root and returns focus to its trigger', async ({ page }) => {
    await page.goto('/blocks/create-dialog', { waitUntil: 'networkidle' })

    const trigger = page.getByRole('button', { name: 'New project' }).first()
    await expect(trigger).toBeVisible()

    // Nothing portalled at rest.
    await expect(page.locator(DISMISSABLE_LAYER)).toHaveCount(0)

    await trigger.click()
    await expect(page.getByText('Create a new project')).toBeVisible()

    await expect(
      page.locator(DISMISSABLE_LAYER),
      'two dismissable layers means two reka-ui copies reached the bundle',
    ).toHaveCount(1)
    await expect(page.getByRole('dialog')).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    // The layer that trapped focus must be the one that releases it.
    await expect(
      trigger,
      'focus did not return to the trigger after the dialog closed',
    ).toBeFocused()

    // And it must not leave a detached layer holding live outside-click and
    // Escape handlers behind it.
    await expect(page.locator(DISMISSABLE_LAYER)).toHaveCount(0)
  })
})

test.describe('tooltip toolbar', () => {
  test('mounts one popper wrapper and never steals focus', async ({ page }) => {
    await page.goto('/blocks/tooltip-toolbar', { waitUntil: 'networkidle' })

    const bold = page.getByRole('button', { name: 'Bold' }).first()
    await expect(bold).toBeVisible()

    await expect(page.locator(POPPER_WRAPPER)).toHaveCount(0)

    await bold.focus()
    // The tooltip reveals on keyboard focus, which is the path a mouse-only
    // test would miss and the one accessibility depends on.
    await expect(page.locator(POPPER_WRAPPER)).toHaveCount(1)

    await expect(
      bold,
      'the tooltip took focus — its content mounted under a different layer than its trigger',
    ).toBeFocused()
  })
})
