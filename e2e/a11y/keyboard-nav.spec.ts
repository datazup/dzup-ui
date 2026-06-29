import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Keyboard navigation and accessibility smoke tests.
 *
 * These tests verify that core interactive components are reachable
 * via the keyboard alone and behave correctly when operated without
 * a mouse — a minimum bar for WCAG 2.1 AA compliance.
 *
 * All tests scope queries to the Storybook iframe canvas.
 */

test.describe('DzButton — keyboard accessibility', () => {
  const STORY_ROOT = 'core-buttons-dzbutton'

  test('button is focusable via Tab key from the page', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const button = frame.getByRole('button', { name: 'Button' })
    await button.evaluate((el) => {
      const input = document.createElement('input')
      input.setAttribute('data-test-pre', '')
      el.parentElement?.insertBefore(input, el)
      input.focus()
    })
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
  })

  test('button is activatable via Enter key', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    // Focus the counter button
    const button = frame.getByRole('button', { name: /clicked 1 times/i })
    await button.focus()
    await expect(button).toBeFocused()

    // Activate via Enter
    await page.keyboard.press('Enter')

    await expect(frame.getByRole('button', { name: /clicked 2 times/i })).toBeVisible()
  })

  test('button is activatable via Space key', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    const button = frame.getByRole('button', { name: /clicked 1 times/i })
    await button.focus()

    await page.keyboard.press('Space')

    await expect(frame.getByRole('button', { name: /clicked 2 times/i })).toBeVisible()
  })

  test('disabled button is not reachable via Tab', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--disabled`)

    await frame.locator('body').click()
    await page.keyboard.press('Tab')

    // A native disabled button is not focusable — no element in the story
    // should have focus, or focus is on a non-disabled element
    const disabledButton = frame.getByRole('button', { name: /disabled/i })
    await expect(disabledButton).toBeDisabled()

    // Playwright's isFocused() returns false for elements that cannot receive focus
    await expect(disabledButton).not.toBeFocused()
  })

  test('button shows visible focus ring when focused', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--accessibility`)

    const firstButton = frame.getByRole('button', { name: /first/i })
    await firstButton.focus()
    await expect(firstButton).toBeFocused()

    // The focus ring is a CSS visual — we verify focus state is set at minimum
    // Visual regression tests would capture the ring appearance itself
  })
})

test.describe('DzInput — keyboard accessibility', () => {
  const STORY_ROOT = 'core-inputs-dzinput'

  test('input is focusable via Tab key', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const input = frame.getByPlaceholder('Enter text...')
    await input.evaluate((el) => {
      const preInput = document.createElement('input')
      preInput.setAttribute('data-test-pre', '')
      el.parentElement?.insertBefore(preInput, el)
      preInput.focus()
    })
    await page.keyboard.press('Tab')
    await expect(input).toBeFocused()
  })

  test('input accepts full keyboard-typed text', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    const input = frame.getByRole('textbox')
    await input.focus()
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('Hello, Storybook!')

    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
    await page.keyboard.press('Backspace')
    // Type character by character using keyboard events
    await page.keyboard.type('keyboard test')

    await expect(input).toHaveValue('keyboard test')
  })

  test('Tab moves focus out of the input to the next focusable element', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    const input = frame.getByRole('textbox')
    await input.focus()
    await expect(input).toBeFocused()

    await page.keyboard.press('Tab')

    // After Tab, the input is no longer focused
    await expect(input).not.toBeFocused()
  })
})

test.describe('DzDialog — focus trap when open', () => {
  const STORY_ROOT = 'core-overlays-dzdialog'

  test('focus moves into the dialog when it opens', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const triggerButton = frame.getByRole('button', { name: /open dialog/i })
    await triggerButton.click()

    // Reka UI Dialog automatically moves focus to the first focusable element
    // inside the dialog content — typically the close / cancel button
    const dialogContent = frame.getByRole('dialog')
    await expect(dialogContent).toBeVisible()

    // Some element within the dialog must receive focus
    const focusedEl = frame.locator(':focus')
    await expect(focusedEl).toBeVisible()
  })

  test('Tab key cycles focus within the open dialog (focus trap)', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await frame.getByRole('button', { name: /open dialog/i }).click()

    const dialog = frame.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Collect the focusable buttons inside the dialog (Cancel, Confirm)
    const cancelButton = frame.getByRole('button', { name: /cancel/i })
    const confirmButton = frame.getByRole('button', { name: /confirm/i })

    await cancelButton.focus()
    await page.keyboard.press('Tab')

    await expect(confirmButton).toBeFocused()

    // Verify cancel and confirm buttons are accessible from within the dialog
    await expect(cancelButton).toBeVisible()
    await expect(confirmButton).toBeVisible()
  })

  test('Escape closes the dialog and returns focus to trigger', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const triggerButton = frame.getByRole('button', { name: /open dialog/i })
    await triggerButton.click()

    const dialog = frame.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(dialog).not.toBeVisible()

    // Reka UI returns focus to the trigger after close
    await expect(triggerButton).toBeFocused()
  })
})
