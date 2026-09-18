import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * One ordinary landing route, right-to-left, end to end (TASK-R5-O4; APP-1).
 *
 * APP-1 found that no landing route could render RTL, so a reversed arrow key in
 * `BlockCategoryNav` and 27 physical declarations survived unseen. It fixed the
 * handler to read `useDzDirection()`. The landing has since gained a Direction
 * control — but the control wrote `<html dir>` only, and nothing provided the
 * direction to the library's provider contract, so `useDzDirection()` kept
 * answering `ltr` and the APP-1 fix was inert on every route. This spec is the
 * route-level proof the matrix was missing: document, layout and keyboard all
 * agree, in a real browser.
 *
 * Titles carry `rtl` so the lane is `yarn test:e2e:landing --grep rtl`.
 */

async function chooseDirection(page: Page, label: 'LTR' | 'RTL'): Promise<void> {
  await page.goto('/themes', { waitUntil: 'networkidle' })
  await page.getByLabel('Direction').getByText(label, { exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', label.toLowerCase())
}

/** The category tabs in DOM order, with their on-screen x position. */
async function categoryTabs(page: Page): Promise<Array<{ id: string, x: number }>> {
  const tabs = page.getByRole('tablist', { name: 'Block categories' }).getByRole('tab')
  await expect(tabs.nth(1)).toBeVisible()
  return tabs.evaluateAll(elements => elements.map(element => ({
    id: element.id,
    x: element.getBoundingClientRect().left,
  })))
}

/**
 * Make the first tab the roving tab stop, press `key`, and return the id focus
 * moved to. A click rather than `focus()`: the nav tracks its roving stop on
 * selection and key presses, not on focus, so a programmatic focus would leave
 * the previous stop in charge of where the next key goes.
 */
async function pressFromFirstTab(page: Page, key: string): Promise<string> {
  const tabs = await categoryTabs(page)
  await page.locator(`#${tabs[0]!.id}`).click()
  await expect(page.locator(`#${tabs[0]!.id}`)).toBeFocused()
  await page.keyboard.press(key)
  return page.evaluate(() => document.activeElement?.id ?? '')
}

test('rtl: /blocks renders right-to-left end to end — document, mirrored layout, arrow keys', async ({ page }) => {
  await chooseDirection(page, 'RTL')
  await page.goto('/blocks', { waitUntil: 'networkidle' })

  // 1. The document. Persisted by the recipe, reflected by the provider.
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  // 2. The layout mirrors: the first category sits to the RIGHT of the second.
  const tabs = await categoryTabs(page)
  expect(tabs.length).toBeGreaterThan(2)
  expect(tabs[0]!.x).toBeGreaterThan(tabs[1]!.x)

  // 3. The keyboard follows reading order (APG tabs): in RTL the next tab is to
  //    the left, so ArrowLeft advances and ArrowRight goes back (wrapping).
  expect(await pressFromFirstTab(page, 'ArrowLeft')).toBe(tabs[1]!.id)
  expect(await pressFromFirstTab(page, 'ArrowRight')).toBe(tabs[tabs.length - 1]!.id)

  // 4. Nothing overflows the inline axis the wrong way.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
})

test('rtl control: the same route in ltr advances with ArrowRight — the assertions discriminate', async ({ page }) => {
  await chooseDirection(page, 'LTR')
  await page.goto('/blocks', { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

  const tabs = await categoryTabs(page)
  expect(tabs[0]!.x).toBeLessThan(tabs[1]!.x)
  expect(await pressFromFirstTab(page, 'ArrowRight')).toBe(tabs[1]!.id)
  expect(await pressFromFirstTab(page, 'ArrowLeft')).toBe(tabs[tabs.length - 1]!.id)
})
