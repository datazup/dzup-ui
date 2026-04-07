import { expect, test } from '@playwright/test'

/**
 * Smoke tests for the Buttons component family.
 *
 * Story title pattern: "Core/Buttons/DzButton"
 * Storybook URL ID:    "core-buttons-dzbutton"
 *
 * Stories render inside a Storybook iframe. We use
 * page.frameLocator('#storybook-preview-iframe') to scope all
 * queries to the rendered story canvas.
 */

const STORY_ROOT = 'core-buttons-dzbutton'

test.describe('DzButton', () => {
  test('default story loads and button is visible', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const button = frame.getByRole('button', { name: 'Button' })
    await expect(button).toBeVisible()
  })

  test('click triggers interaction — counter increments', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--interactive`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The interactive story shows "Clicked 0 times" initially
    const button = frame.getByRole('button', { name: /clicked 0 times/i })
    await expect(button).toBeVisible()

    await button.click()

    // After one click the label should read "Clicked 1 times"
    await expect(frame.getByRole('button', { name: /clicked 1 times/i })).toBeVisible()
  })

  test('disabled button is not clickable and has disabled attribute', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--disabled`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const button = frame.getByRole('button', { name: /disabled/i })
    await expect(button).toBeVisible()
    await expect(button).toBeDisabled()
  })

  test('solid variant story loads without errors', async ({ page }) => {
    // "Default" story uses variant=solid by default via meta args
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')
    await expect(frame.getByRole('button')).toBeVisible()
  })

  test('outline variant story loads without errors', async ({ page }) => {
    // AllVariants (kebab: all-variants) gallery includes outline
    await page.goto(`/?path=/story/${STORY_ROOT}--all-variants`)

    const frame = page.frameLocator('#storybook-preview-iframe')
    await expect(frame.getByRole('button', { name: /outline/i })).toBeVisible()
  })

  test('ghost variant story loads without errors', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--all-variants`)

    const frame = page.frameLocator('#storybook-preview-iframe')
    await expect(frame.getByRole('button', { name: /ghost/i })).toBeVisible()
  })

  test('loading state story renders spinner', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--loading`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The loading story renders a button whose text reads "Saving..."
    const button = frame.getByRole('button', { name: /saving/i })
    await expect(button).toBeVisible()

    // Loading buttons carry aria-busy="true" per contract
    await expect(button).toHaveAttribute('aria-busy', 'true')
  })

  test('all tone variants are visible in the Tone Gallery', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--all-tones`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    for (const tone of ['Neutral', 'Primary', 'Success', 'Warning', 'Danger', 'Info']) {
      await expect(frame.getByRole('button', { name: tone })).toBeVisible()
    }
  })
})
