import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Smoke tests for the Overlays component family.
 *
 * Story title patterns:
 *   - "Core/Overlays/DzDialog"  → "core-overlays-dzdialog"
 *   - "Core/Feedback/DzToast"   → "core-feedback-dztoast"
 *
 * Note: DzModal is not a separate component in this library.
 * The DzDialog compound component covers the modal use case.
 */

test.describe('DzDialog', () => {
  const STORY_ROOT = 'core-overlays-dzdialog'

  test('default story renders trigger button', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const trigger = frame.getByRole('button', { name: /open dialog/i })
    await expect(trigger).toBeVisible()
  })

  test('dialog opens when trigger button is clicked', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const trigger = frame.getByRole('button', { name: /open dialog/i })
    await trigger.click()

    // DzDialogTitle renders the accessible dialog heading
    const dialogTitle = frame.getByRole('heading', { name: /dialog title/i })
    await expect(dialogTitle).toBeVisible()

    // The dialog description should also be visible
    await expect(frame.getByText(/description of what this dialog/i)).toBeVisible()
  })

  test('dialog closes via the Cancel button', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await frame.getByRole('button', { name: /open dialog/i }).click()

    // Wait for dialog to be fully open
    const dialogTitle = frame.getByRole('heading', { name: /dialog title/i })
    await expect(dialogTitle).toBeVisible()

    // Click Cancel (a DzDialogClose button)
    await frame.getByRole('button', { name: /cancel/i }).click()

    // Dialog content should disappear
    await expect(dialogTitle).not.toBeVisible()
  })

  test('dialog closes via Escape key', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await frame.getByRole('button', { name: /open dialog/i }).click()

    const dialogTitle = frame.getByRole('heading', { name: /dialog title/i })
    await expect(dialogTitle).toBeVisible()

    // Escape should dismiss the modal (Reka UI built-in behavior)
    await page.keyboard.press('Escape')

    await expect(dialogTitle).not.toBeVisible()
  })

  test('dialog can be dismissed via the Confirm button', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    await frame.getByRole('button', { name: /open dialog/i }).click()

    const dialogTitle = frame.getByRole('heading', { name: /dialog title/i })
    await expect(dialogTitle).toBeVisible()

    // DzDialogClose wraps the Confirm button
    await frame.getByRole('button', { name: /confirm/i }).click()

    await expect(dialogTitle).not.toBeVisible()
  })

  test('controlled interactive story: open state text updates on open', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    // Initial state shows "Closed"
    await expect(frame.getByText(/state: closed/i)).toBeVisible()

    await frame.getByRole('button', { name: /open controlled dialog/i }).click()

    // State indicator flips to "Open"
    await expect(frame.getByText(/state: open/i)).toBeVisible()
  })

  test('size gallery renders multiple size trigger buttons', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--all-sizes`)

    // Each size has its own trigger button labelled with the size abbreviation
    for (const size of ['SM', 'MD', 'LG', 'XL', 'FULL']) {
      await expect(frame.getByRole('button', { name: size })).toBeVisible()
    }
  })
})

test.describe('DzToast', () => {
  const STORY_ROOT = 'core-feedback-dztoast'

  test('tone gallery story renders toast notifications for all tones', async ({ page }) => {
    // "Tone Gallery" story (export: AllTones → kebab: all-tones)
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--all-tones`)

    // Each tone has its title rendered as visible text
    for (const title of ['Neutral', 'Primary', 'Success', 'Warning', 'Danger', 'Info']) {
      await expect(frame.getByText(title).first()).toBeVisible()
    }
  })

  test('toast with action button renders the action label', async ({ page }) => {
    // "With Action Button" story (export: WithAction → kebab: with-action)
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--with-action`)

    await expect(frame.getByText('Message archived', { exact: true })).toBeVisible()
    await expect(frame.getByRole('button', { name: /undo/i })).toBeVisible()
  })

  test('default interactive story renders tone trigger buttons', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    // The interactive story renders a row of tone trigger buttons
    for (const tone of ['neutral', 'primary', 'success', 'warning', 'danger', 'info']) {
      await expect(frame.getByRole('button', { name: new RegExp(tone, 'i') })).toBeVisible()
    }
  })

  test('clicking a tone trigger fires a toast notification', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    // Click the "success" trigger
    await frame.getByRole('button', { name: /success/i }).click()

    // The toast should appear — its title contains "Success Toast"
    await expect(frame.getByText('Success Toast', { exact: true })).toBeVisible()
  })
})
