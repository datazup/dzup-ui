import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { openTarget, RUNNABLE_TARGETS } from './fixtures'

async function open(page: Page, component: string) {
  const target = RUNNABLE_TARGETS.find(target => target.component === component)!
  const story = component === 'DzCommandPalette'
    ? 'core-overlays-dzcommandpalette--keyboard-contract'
    : component === 'DzTreeSelect'
      ? 'core-forms-dztreeselect--keyboard-contract'
      : target.story
  return openTarget(page, { ...target, story })
}

async function activeText(canvas: Page, input: Locator) {
  const id = await input.getAttribute('aria-activedescendant')
  if (!id)
    return null
  return canvas.locator(`[id="${id}"]`).textContent()
}

test.describe('DzCommandPalette', () => {
  test('r11 popup: both global shortcuts, result navigation, execution and dismissal', async ({ page }) => {
    const canvas = await open(page, 'DzCommandPalette')
    for (const modifier of ['Control', 'Meta']) {
      await canvas.getByRole('button', { name: 'Before palette' }).focus()
      await canvas.keyboard.press(`${modifier}+k`)
      const input = canvas.getByRole('combobox')
      await expect(input).toBeFocused()
      await expect.poll(() => activeText(canvas, input)).toContain('New File')
      await input.press('ArrowDown')
      await expect.poll(() => activeText(canvas, input)).toContain('Open File')
      await input.press('ArrowUp')
      await expect.poll(() => activeText(canvas, input)).toContain('New File')
      await input.press('Enter')
      await expect(canvas.getByRole('dialog')).toHaveCount(0)
      await expect(canvas.locator('#storybook-root strong')).toHaveText('new-file')
    }
    await canvas.keyboard.press('Control+k')
    await expect(canvas.getByRole('combobox')).toBeFocused()
    await canvas.keyboard.press('Escape')
    await expect(canvas.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('DzMultiSelect', () => {
  test('r11 popup: navigation, toggle, retained popup, Escape preservation and Backspace removal', async ({ page }) => {
    const canvas = await open(page, 'DzMultiSelect')
    const input = canvas.getByRole('combobox')
    await input.focus()
    await input.press('Escape')
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect.poll(() => activeText(canvas, input)).toContain('React')
    await input.press('ArrowDown')
    await expect.poll(() => activeText(canvas, input)).toContain('Vue')
    await input.press('ArrowUp')
    await expect.poll(() => activeText(canvas, input)).toContain('React')
    await input.press('End')
    await expect.poll(() => activeText(canvas, input)).toContain('Preact')
    await input.press('Home')
    await expect.poll(() => activeText(canvas, input)).toContain('React')
    await input.press('Enter')
    await expect(canvas.getByRole('button', { name: 'Remove React', exact: true })).toBeVisible()
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await input.press('Enter')
    await expect(canvas.getByRole('button', { name: 'Remove React', exact: true })).toHaveCount(0)
    await input.press('ArrowDown')
    await input.press('Enter')
    await expect(canvas.getByRole('button', { name: 'Remove Vue', exact: true })).toBeVisible()
    await input.press('Escape')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.getByRole('button', { name: 'Remove Vue', exact: true })).toBeVisible()
    await input.press('Backspace')
    await expect(canvas.getByRole('button', { name: 'Remove Vue', exact: true })).toHaveCount(0)
    await input.press('ArrowUp')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('DzTreeSelect', () => {
  test('r11 popup: endpoints, vertical traversal, branch actions, both selection keys, Escape and native Tab', async ({ page }) => {
    const canvas = await open(page, 'DzTreeSelect')
    const input = canvas.getByRole('combobox')
    await input.focus()
    await input.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await input.press('End')
    await expect.poll(() => activeText(canvas, input)).toContain('Dairy')
    await input.press('Home')
    await expect.poll(() => activeText(canvas, input)).toContain('Fruit')
    await input.press('ArrowLeft')
    await expect(canvas.getByText('Apple', { exact: true })).toHaveCount(0)
    await input.press('ArrowRight')
    await expect(canvas.getByText('Apple', { exact: true })).toBeVisible()
    await input.press('ArrowDown')
    await expect.poll(() => activeText(canvas, input)).toContain('Apple')
    await input.press('ArrowUp')
    await expect.poll(() => activeText(canvas, input)).toContain('Fruit')
    await input.press('Escape')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.locator('#storybook-root strong')).toHaveText('none')
    for (const key of ['Enter', 'Space']) {
      await input.press('ArrowUp')
      await input.press('End')
      await input.press(key)
      await expect(input).toHaveAttribute('aria-expanded', 'false')
      await expect(canvas.locator('#storybook-root strong')).toHaveText('dairy')
    }
    await input.press('ArrowDown')
    await input.press('Tab')
    await expect(canvas.getByRole('button', { name: 'After tree' })).toBeFocused()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.locator('#storybook-root strong')).toHaveText('dairy')
  })
})

for (const component of ['DzDatePicker', 'DzDateRangePicker']) {
  test.describe(component, () => {
    test('r11 popup: held contract — downward arrow opens a closed calendar trigger', async ({ page }) => {
      const canvas = await open(page, component)
      const trigger = canvas.locator('[data-part="trigger"]')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await trigger.focus()
      await trigger.press('ArrowDown')
      test.fail(true, 'R11-05B F7/F8: declared closed-trigger arrow does not open the calendar; cell remains unrun')
      expect(await trigger.getAttribute('aria-expanded')).toBe('true')
    })
  })
}

test.describe('DzPersonaSelector', () => {
  test('r11 popup: held contract — Space selects the highlighted persona', async ({ page }) => {
    const canvas = await open(page, 'DzPersonaSelector')
    const input = canvas.getByRole('combobox')
    await input.focus()
    await input.press('ArrowDown')
    await expect.poll(() => activeText(canvas, input)).toContain('Ada Lovelace')
    await input.press('Space')
    test.fail(true, 'R11-05B F9: editable Combobox treats Space as text; the declared listbox activation does not happen')
    expect(await input.inputValue()).toBe('Ada Lovelace')
  })
})
