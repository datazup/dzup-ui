import { expect, test } from '@playwright/test'
import { openTarget, RUNNABLE_TARGETS } from './fixtures'

test.describe('DzCombobox', () => {
  test('declared keyboard actions: navigates, selects, preserves value on Escape and exits on native Tab', async ({ page }) => {
    const target = RUNNABLE_TARGETS.find(target => target.component === 'DzCombobox')!
    const canvas = await openTarget(page, target)
    const input = canvas.getByRole('combobox')
    await input.focus()
    await input.press('Escape')
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    const highlighted = async () => {
      const id = await input.getAttribute('aria-activedescendant')
      return canvas.locator(`[id="${id}"]`).textContent()
    }
    await expect.poll(highlighted).toContain('New York')
    await input.press('ArrowDown')
    await expect.poll(highlighted).toContain('Los Angeles')
    await input.press('ArrowUp')
    await expect.poll(highlighted).toContain('New York')
    await input.press('End')
    await expect.poll(highlighted).toContain('San Jose')
    await input.press('Home')
    await expect.poll(highlighted).toContain('New York')
    await input.press('Enter')
    await expect(input).toHaveValue('New York')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toBeFocused()
    await input.press('ArrowUp')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await input.press('End')
    await input.press('Escape')
    await expect(input).toHaveValue('New York')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toBeFocused()
    await input.press('ArrowDown')
    await input.press('Tab')
    await expect(input).not.toBeFocused()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(input).toHaveValue('New York')
    await expect(canvas.getByRole('option')).toHaveCount(0)
  })
})
