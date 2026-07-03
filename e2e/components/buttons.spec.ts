import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Smoke tests for the Buttons component family.
 *
 * Story title pattern: "Core/Buttons/DzButton"
 * Storybook URL ID:    "core-buttons-dzbutton"
 *
 * Stories render through Storybook's direct iframe route so queries are scoped
 * to the rendered canvas rather than the manager shell.
 */

const STORY_ROOT = 'core-buttons-dzbutton'

test.describe('DzButton', () => {
  test('default story loads and button is visible', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)

    const button = frame.getByRole('button', { name: 'Button' })
    await expect(button).toBeVisible()
  })

  test('click triggers interaction — counter increments', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--interactive`)

    // The story play function clicks once during setup.
    const button = frame.getByRole('button', { name: /clicked 1 times/i })
    await expect(button).toBeVisible()

    await button.click()

    await expect(frame.getByRole('button', { name: /clicked 2 times/i })).toBeVisible()
  })

  test('disabled button is not clickable and has disabled attribute', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--disabled`)

    const button = frame.getByRole('button', { name: /disabled/i })
    await expect(button).toBeVisible()
    await expect(button).toBeDisabled()
  })

  test('solid variant story loads without errors', async ({ page }) => {
    // "Default" story uses variant=solid by default via meta args
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)
    await expect(frame.getByRole('button')).toBeVisible()
  })

  test('outline variant story loads without errors', async ({ page }) => {
    // AllVariants (kebab: all-variants) gallery includes outline
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--all-variants`)
    await expect(frame.getByRole('button', { name: /outline/i })).toBeVisible()
  })

  test('ghost variant story loads without errors', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--all-variants`)
    await expect(frame.getByRole('button', { name: /ghost/i })).toBeVisible()
  })

  test('loading state story renders spinner', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--loading`)

    // The loading story renders a button whose text reads "Saving..."
    const button = frame.getByRole('button', { name: /saving/i })
    await expect(button).toBeVisible()

    // Loading buttons carry aria-busy="true" per contract
    await expect(button).toHaveAttribute('aria-busy', 'true')
  })

  test('all tone variants are visible in the Tone Gallery', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--all-tones`)

    for (const tone of ['Neutral', 'Primary', 'Success', 'Warning', 'Danger', 'Info']) {
      await expect(frame.getByRole('button', { name: tone })).toBeVisible()
    }
  })
})
