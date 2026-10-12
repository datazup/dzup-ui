import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { openTarget, RUNNABLE_TARGETS } from './fixtures'

async function open(page: Page, component: string) {
  const target = RUNNABLE_TARGETS.find(target => target.component === component)!
  return openTarget(page, { ...target, story: target.story.replace(/--.*$/, '--large') })
}

test.describe('DzCommandPalette', () => {
  test('r11 data: large command filtering, selection, empty and recovery', async ({ page }) => {
    const canvas = await open(page, 'DzCommandPalette')
    const trigger = canvas.getByRole('button', { name: 'Open data palette' })
    await trigger.click()
    await expect(canvas.getByRole('option')).toHaveCount(100)
    await canvas.getByRole('combobox').fill('Command 100')
    await expect(canvas.getByRole('option')).toHaveCount(1)
    await canvas.getByRole('option').click()
    await expect(canvas.locator('[data-testid="selected"]')).toHaveText('command-100')
    await canvas.getByRole('button', { name: 'Clear data' }).click()
    await trigger.click()
    await expect(canvas.getByText('No commands', { exact: true })).toBeVisible()
    await expect(canvas.getByRole('option')).toHaveCount(0)
    await canvas.keyboard.press('Escape')
    await canvas.getByRole('button', { name: 'Restore data' }).click()
    await trigger.click()
    await expect(canvas.getByRole('option')).toHaveCount(100)
  })
})

test.describe('DzMegaMenu', () => {
  test('r11 data: large catalog, empty replacement and recovery', async ({ page }) => {
    const canvas = await open(page, 'DzMegaMenu')
    await canvas.getByRole('menuitem', { name: 'Catalog', exact: true }).click()
    await expect(canvas.locator('[data-part="item"]')).toHaveCount(100)
    await expect(canvas.getByRole('menuitem', { name: 'Product 100', exact: true })).toBeVisible()
    await canvas.getByRole('button', { name: 'Clear data' }).click()
    await expect(canvas.getByRole('menuitem')).toHaveCount(0)
    await canvas.getByRole('button', { name: 'Restore data' }).click()
    await canvas.getByRole('menuitem', { name: 'Catalog', exact: true }).click()
    await expect(canvas.locator('[data-part="item"]')).toHaveCount(100)
  })
})

test.describe('DzSidebar', () => {
  test('r11 data: large routes, activation, empty replacement and recovery', async ({ page }) => {
    const canvas = await open(page, 'DzSidebar')
    await expect(canvas.getByRole('button', { name: /^Route \d+$/ })).toHaveCount(100)
    await canvas.getByRole('button', { name: 'Route 100', exact: true }).click()
    await expect(canvas.locator('[data-testid="selected"]')).toHaveText('route-100')
    await canvas.getByRole('button', { name: 'Clear data' }).click()
    await expect(canvas.getByRole('button', { name: /^Route \d+$/ })).toHaveCount(0)
    await canvas.getByRole('button', { name: 'Restore data' }).click()
    await expect(canvas.getByRole('button', { name: /^Route \d+$/ })).toHaveCount(100)
  })
})

test.describe('DzOrderList', () => {
  test('r11 data: large reorder payload, empty replacement and recovery', async ({ page }) => {
    const canvas = await open(page, 'DzOrderList')
    const rows = canvas.locator('[data-part="item"]')
    await expect(rows).toHaveCount(100)
    await rows.first().click()
    await canvas.getByRole('button', { name: 'Move to bottom', exact: true }).click()
    await expect(rows.last()).toContainText('Task 1')
    await expect(canvas.locator('[data-testid="moved"]')).toHaveText('0:99')
    await canvas.getByRole('button', { name: 'Clear data' }).click()
    await expect(rows).toHaveCount(0)
    await expect(canvas.getByText('No tasks', { exact: true })).toBeVisible()
    await canvas.getByRole('button', { name: 'Restore data' }).click()
    await expect(rows).toHaveCount(100)
    await expect(rows.first()).toContainText('Task 1')
  })
})

test.describe('DzTour', () => {
  test('r11 data: fifty-step navigation, empty replacement and recovery', async ({ page }) => {
    const canvas = await open(page, 'DzTour')
    await canvas.getByRole('button', { name: 'Start data tour' }).click()
    await expect(canvas.getByRole('dialog')).toContainText('Step 1')
    const next = canvas.getByRole('button', { name: 'Next', exact: true })
    await expect(next).toBeInViewport()
    await next.click()
    await expect(canvas.getByRole('dialog')).toContainText('Step 2')
    await expect(canvas.locator('[data-testid="changed"]')).toHaveText('1')
    await canvas.keyboard.press('Escape')
    await canvas.getByRole('button', { name: 'Clear data' }).click()
    await canvas.getByRole('button', { name: 'Start data tour' }).click()
    await expect(canvas.getByRole('dialog')).toHaveCount(0)
    await canvas.getByRole('button', { name: 'Restore data' }).click()
    await expect(canvas.getByRole('dialog')).toContainText('Step 1')
    await expect(canvas.locator('[data-part="item-indicator"]')).toHaveCount(50)
  })
})

for (const component of ['DzMention', 'DzMultiSelect', 'DzTreeSelect']) {
  test.describe(component, () => {
    test('r11 data: large options, empty, loading, error and retry recovery', async ({ page }) => {
      const canvas = await open(page, component)
      const input = canvas.getByRole('combobox')
      async function show() {
        if (component === 'DzMention') {
          // Escape dismisses that token until it changes; start a new mention.
          await input.fill('')
          await input.fill('@')
          await input.focus()
        }
        else if (await input.getAttribute('aria-expanded') !== 'true') {
          await input.press('ArrowDown')
        }
      }
      const rows = canvas.getByRole(component === 'DzTreeSelect' ? 'treeitem' : 'option')
      await show()
      await expect(rows).toHaveCount(100)
      await input.press('Escape')
      await canvas.getByRole('button', { name: 'Clear data' }).click()
      await show()
      await expect(rows).toHaveCount(0)
      await expect(canvas.locator('[data-options-state="empty"]')).toBeVisible()
      await input.press('Escape')
      await canvas.getByRole('button', { name: 'Load data' }).click()
      await show()
      await expect(canvas.locator('[data-options-state="loading"]')).toBeVisible()
      await expect(rows).toHaveCount(0)
      await input.press('Escape')
      await canvas.getByRole('button', { name: 'Fail data' }).click()
      await show()
      await expect(canvas.locator('[data-options-state="error"]')).toContainText('Directory unavailable')
      await canvas.getByRole('button', { name: 'Try again', exact: true }).click()
      await expect(canvas.locator('[data-testid="retries"]')).toHaveText('1')
      await expect(rows).toHaveCount(100)
      await expect(canvas.locator('[data-options-state]')).toHaveCount(0)
    })
  })
}
