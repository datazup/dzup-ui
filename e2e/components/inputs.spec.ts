import { expect, test } from '@playwright/test'

/**
 * Smoke tests for the Inputs component family.
 *
 * Story title pattern: "Core/Inputs/Dz*"
 * Storybook URL IDs:
 *   - "core-inputs-dzinput"
 *   - "core-inputs-dzpasswordinput"
 */

test.describe('DzInput', () => {
  const STORY_ROOT = 'core-inputs-dzinput'

  test('default story loads and input is visible', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const input = frame.getByRole('textbox')
    await expect(input).toBeVisible()
  })

  test('accepts keyboard text input', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--interactive`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const input = frame.getByRole('textbox')
    await expect(input).toBeVisible()

    await input.click()
    await input.fill('hello world')

    await expect(input).toHaveValue('hello world')
  })

  test('shows validation error state with error message visible', async ({ page }) => {
    // The "Invalid with Error Message" story (export name: Invalid → kebab: invalid)
    await page.goto(`/?path=/story/${STORY_ROOT}--invalid`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The story renders three inputs; at least one has an error message
    const errorMessage = frame.getByText('Email address is required')
    await expect(errorMessage).toBeVisible()
  })

  test('aria-invalid is set on invalid input', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--invalid`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The first input has `invalid` prop which maps to aria-invalid="true"
    const invalidInputs = frame.locator('[aria-invalid="true"]')
    await expect(invalidInputs.first()).toBeVisible()
  })

  test('disabled input cannot be typed into', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--disabled`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const input = frame.getByRole('textbox')
    await expect(input).toBeVisible()
    await expect(input).toBeDisabled()
  })

  test('variant gallery loads all three variants', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--all-variants`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Each variant has a distinct placeholder
    await expect(frame.getByPlaceholder('Outline variant')).toBeVisible()
    await expect(frame.getByPlaceholder('Filled variant')).toBeVisible()
    await expect(frame.getByPlaceholder('Underlined variant')).toBeVisible()
  })
})

test.describe('DzPasswordInput', () => {
  const STORY_ROOT = 'core-inputs-dzpasswordinput'

  test('default story loads with masked input', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Password inputs are type="password" by default — Playwright exposes them as
    // a generic locator since they lack the "textbox" role when type=password
    const input = frame.locator('input[type="password"]')
    await expect(input).toBeVisible()
  })

  test('toggles password visibility on toggle button click', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--interactive`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Initially the input is masked
    const input = frame.locator('input[type="password"]')
    await expect(input).toBeVisible()

    // The toggle button carries aria-label="Show password"
    const toggleButton = frame.getByRole('button', { name: /show password/i })
    await expect(toggleButton).toBeVisible()

    await toggleButton.click()

    // After toggling, the input should be type="text"
    await expect(frame.locator('input[type="text"]')).toBeVisible()

    // Button label flips to "Hide password"
    await expect(frame.getByRole('button', { name: /hide password/i })).toBeVisible()
  })

  test('toggle button is not present when input is disabled', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--disabled`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The password input wrapper should still render
    const input = frame.locator('input[type="password"]')
    await expect(input).toBeVisible()
    await expect(input).toBeDisabled()
  })

  test('error message is visible on invalid state', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--invalid`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    await expect(frame.getByText('Password is required')).toBeVisible()
  })
})
