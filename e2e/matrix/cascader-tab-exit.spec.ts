import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

test.describe('DzCascader native Tab', () => {
  for (const scenario of [
    { from: 'option', key: 'Tab', destination: 'After cascader' },
    { from: 'option', key: 'Shift+Tab', destination: 'Before cascader' },
    { from: 'searchbox', key: 'Tab', destination: 'After cascader' },
  ] as const) {
    test(`${scenario.from} ${scenario.key} exits and supports reopening`, async ({ page }) => {
      const canvas = await loadStoryCanvas(page, 'core-forms-dzcascader--tab-exit')
      const trigger = canvas.getByRole('combobox')
      await trigger.click()
      const origin = canvas.getByRole(scenario.from)
      await origin.focus()
      await expect(origin).toBeFocused()
      await page.keyboard.press(scenario.key)
      await expect(canvas.getByRole('button', { name: scenario.destination })).toBeFocused()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(canvas.getByRole('option')).toHaveCount(0)
      await trigger.click()
      await expect(canvas.getByRole('option')).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
    })
  }
})
