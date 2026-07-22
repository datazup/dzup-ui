import { expect, test } from '@playwright/test'
import { BLOCK_PATH } from './utils/catalog.ts'
import { expectPainted } from './utils/pixels.ts'

/**
 * Phone-viewport flows (TASK-FREE3-06).
 *
 * Runs ONLY under the `mobile-chrome` project (Pixel 7 — 412×839, `isMobile`,
 * `hasTouch`); `playwright.config.ts` routes this file there by name.
 *
 * Before this file, mobile existed in CI purely as Lighthouse perf numbers — and
 * those are warn-gated on LCP (TASK-FREE3-04), so nothing in the pipeline ever
 * DROVE the site at phone width. The drawer in particular is unreachable any
 * other way: `.menu-btn` and `.mobile-sheet` are behind `@media (max-width: 980px)`
 * in TopNav.vue, so a desktop project renders neither, and jsdom applies no media
 * queries at all.
 */

test.describe('mobile', () => {
  test('nav drawer opens, takes focus, navigates, and closes', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Toggle menu' })
    await expect(toggle, 'the hamburger must be visible below the 980px breakpoint').toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    const drawer = page.locator('#mobile-nav')
    await expect(drawer).toBeHidden()

    await toggle.click()
    await expect(drawer).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    // TASK-FREE3-07: opening moves focus INTO the drawer (first focusable), so a
    // keyboard user is not left standing on the toggle while Tab walks them past
    // everything that follows before reaching the menu they just asked for.
    const focusedInDrawer = await page.evaluate(() => {
      const nav = document.getElementById('mobile-nav')
      return !!nav && nav.contains(document.activeElement)
    })
    expect(focusedInDrawer, 'opening the drawer must move focus into it').toBe(true)

    // Non-modal by design — the page behind stays reachable, so there is no focus
    // trap to assert, only the entry move above and the restore below.
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Reopen and navigate: a drawer that survives navigation is a trap, so TopNav
    // closes it on every route landing.
    await toggle.click()
    await expect(drawer).toBeVisible()
    await drawer.getByRole('link', { name: 'Blocks', exact: true }).click()

    await expect(page).toHaveURL(/\/blocks$/)
    await expect(drawer, 'the drawer must close when a route lands').toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('a block detail page renders on a phone without a horizontal overflow', async ({ page }) => {
    await page.goto(BLOCK_PATH, { waitUntil: 'networkidle' })

    await expect(page.locator('#block-detail-title')).toBeVisible()
    await expectPainted(page, 'light', `${BLOCK_PATH} on mobile`)

    // The failure mode a desktop project cannot see: a fixed-width child (a code
    // block, a preview frame, a table) pushing the document wider than the phone,
    // which shows up as a page that scrolls sideways. Compare against the layout
    // viewport, with a pixel of slack for sub-pixel rounding at DPR 2.625.
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(
      overflow.scrollWidth,
      `the page scrolls sideways on a phone: ${overflow.scrollWidth}px of content in a ${overflow.clientWidth}px viewport`,
    ).toBeLessThanOrEqual(overflow.clientWidth + 1)
  })
})
