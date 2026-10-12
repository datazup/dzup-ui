import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { openTarget, RUNNABLE_TARGETS } from './fixtures'

async function open(page: Page, component: string) {
  const target = RUNNABLE_TARGETS.find(target => target.component === component)!
  return openTarget(page, { ...target, story: target.story.replace(/--.*$/, '--keyboard-contract') })
}

async function walk(page: Page, stops: Locator[], groupExit?: { before: Locator, container: Locator }) {
  await stops[0]!.focus()
  for (const stop of stops.slice(1)) {
    await page.keyboard.press('Tab')
    await expect(stop).toBeFocused()
  }
  for (const stop of stops.slice(0, -1).reverse()) {
    await page.keyboard.press('Shift+Tab')
    // Firefox may land on the Reka group's own container while its tabindex changes.
    // That owned layout control is permitted only at this boundary; assert exit, never skip other stops.
    if (groupExit && stop === groupExit.before && await groupExit.container.evaluate(el => el === document.activeElement)) {
      await expect(groupExit.container).toBeFocused()
      await page.keyboard.press('Shift+Tab')
    }
    await expect(stop).toBeFocused()
  }
}

test.describe('DzSidebar', () => {
  test('r11 native: actual Tab order, disabled exclusion and Enter/Space item/group actions', async ({ page }) => {
    const canvas = await open(page, 'DzSidebar')
    const before = canvas.getByRole('button', { name: 'Before sidebar', exact: true })
    const after = canvas.getByRole('button', { name: 'After sidebar', exact: true })
    const group = canvas.getByRole('button', { name: 'Workspace', exact: true })
    const dashboard = canvas.getByRole('button', { name: 'Dashboard', exact: true })
    const settings = canvas.getByRole('button', { name: 'Settings', exact: true })
    await expect(canvas.getByRole('button', { name: 'Archived', exact: true })).toBeDisabled()
    await walk(canvas, [before, group, dashboard, settings, after])
    await canvas.keyboard.press('Tab')
    await expect(group).toBeFocused()
    await group.press('Enter')
    await expect(group).toHaveAttribute('aria-expanded', 'false')
    await expect(dashboard).toHaveCount(0)
    await canvas.keyboard.press('Tab')
    await expect(after).toBeFocused()
    await canvas.keyboard.press('Shift+Tab')
    await expect(group).toBeFocused()
    await group.press('Space')
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await canvas.keyboard.press('Tab')
    await expect(dashboard).toBeFocused()
    await dashboard.press('Enter')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('dashboard:1')
    await dashboard.press('Space')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('dashboard:2')
    await canvas.keyboard.press('Tab')
    await expect(settings).toBeFocused()
    await settings.press('Space')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('settings:3')
    await settings.press('Enter')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('settings:4')
    await expect(canvas.locator('[data-testid="disabled-actions"]')).toHaveText('0')
  })
})

test.describe('DzDataView', () => {
  test('r11 native: actual forward/reverse Tab through sort, layout and item controls in both layouts', async ({ page }) => {
    const canvas = await open(page, 'DzDataView')
    const before = canvas.getByRole('button', { name: 'Before view', exact: true })
    const after = canvas.getByRole('button', { name: 'After view', exact: true })
    const sort = canvas.getByRole('combobox')
    const alpha = canvas.getByRole('button', { name: 'Open Alpha', exact: true })
    const beta = canvas.getByRole('button', { name: 'Open Beta', exact: true })
    const layout = canvas.locator('[aria-label="View layout"]')
    let count = 0
    for (const name of ['List', 'Grid']) {
      const chosen = layout.getByRole('button', { name, exact: true })
      await chosen.focus()
      await chosen.press('Space')
      await expect(canvas.locator('[data-layout]')).toHaveAttribute('data-layout', name.toLowerCase())
      await walk(canvas, [before, sort, chosen, alpha, beta, after], { before: sort, container: layout })
      await alpha.focus()
      for (const key of ['Enter', 'Space']) {
        await alpha.press(key)
        await expect(canvas.locator('[data-testid="actions"]')).toHaveText(`alpha:${++count}`)
      }
    }
  })
})

test.describe('DzTable', () => {
  test('r11 native: actual Tab through header/cells, disabled exclusion and no table tab stop', async ({ page }) => {
    const canvas = await open(page, 'DzTable')
    const before = canvas.getByRole('button', { name: 'Before table', exact: true })
    const after = canvas.getByRole('button', { name: 'After table', exact: true })
    const header = canvas.getByRole('button', { name: 'Header action', exact: true })
    const alpha = canvas.getByRole('button', { name: 'Open Alpha', exact: true })
    const beta = canvas.getByRole('button', { name: 'Open Beta', exact: true })
    await expect(canvas.getByRole('table')).not.toHaveAttribute('tabindex', '0')
    await expect(canvas.getByRole('button', { name: 'Archived', exact: true })).toBeDisabled()
    await walk(canvas, [before, header, alpha, beta, after])
    await header.focus()
    await header.press('Enter')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('header:1')
    await alpha.focus()
    await alpha.press('Space')
    await expect(canvas.locator('[data-testid="actions"]')).toHaveText('alpha:2')
  })
})
