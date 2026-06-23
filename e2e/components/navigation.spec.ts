import { expect, test } from '@playwright/test'

/**
 * Smoke tests for the Navigation component family.
 *
 * Story title pattern: "Core/Navigation/DzTabs"
 * Storybook URL ID:    "core-navigation-dztabs"
 *
 * DzTabs is a compound component consisting of:
 *   DzTabs > DzTabList > DzTabTrigger (×N) + DzTabContent (×N)
 *
 * Keyboard behaviour (ARIA Tabs pattern):
 *   - ArrowRight / ArrowLeft navigate between tab triggers in the tab list
 *   - Tab moves focus from the tab list into the active panel
 */

const STORY_ROOT = 'core-navigation-dztabs'

test.describe('DzTabs', () => {
  test('default story loads and first tab panel is visible', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The default story starts on the "account" tab
    await expect(frame.getByRole('tab', { name: /account/i })).toBeVisible()
    await expect(frame.getByText(/manage your account settings/i)).toBeVisible()
  })

  test('clicking a tab trigger switches the visible panel', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--interactive`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Initially on tab1 (Account)
    const tab2 = frame.getByRole('tab', { name: /billing/i })
    await expect(tab2).toBeVisible()

    await tab2.click()

    // Panel for Billing should now be visible
    await expect(frame.getByText(/billing history/i)).toBeVisible()

    // Original Account panel should no longer be visible
    await expect(frame.getByText(/account settings and profile/i)).not.toBeVisible()
  })

  test('switching tabs updates the active tab indicator', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--interactive`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const teamTab = frame.getByRole('tab', { name: /team/i })
    await teamTab.click()

    // ARIA selected state on the activated tab
    await expect(teamTab).toHaveAttribute('aria-selected', 'true')

    // Previously active tab should no longer be selected
    const accountTab = frame.getByRole('tab', { name: /account/i })
    await expect(accountTab).toHaveAttribute('aria-selected', 'false')
  })

  test('Tab key reaches the active tab (roving tabindex entry point)', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--default`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // The active "Account" tab must be the single roving tab stop.
    const accountTab = frame.getByRole('tab', { name: /account/i })
    await expect(accountTab).toHaveAttribute('aria-selected', 'true')
    await expect(accountTab).toHaveAttribute('tabindex', '0')

    // Inactive tabs must be removed from the Tab sequence.
    await expect(frame.getByRole('tab', { name: /password/i })).toHaveAttribute('tabindex', '-1')
    await expect(frame.getByRole('tab', { name: /notifications/i })).toHaveAttribute('tabindex', '-1')

    // Pressing Tab from a focusable element before the tablist must land on the
    // active tab — the bug this guards against was that every tab had
    // tabindex="-1", so keyboard focus skipped the whole tablist. We inject a
    // real preceding input to establish an in-canvas focus origin (a reliable
    // alternative to tabbing across the Storybook iframe boundary).
    await frame.locator('body').evaluate(() => {
      const input = document.createElement('input')
      input.setAttribute('data-test-pre', '')
      document.body.insertBefore(input, document.body.firstChild)
    })
    await frame.locator('input[data-test-pre]').click()
    await page.keyboard.press('Tab')
    await expect(accountTab).toBeFocused()
  })

  test('exactly one tab is a tab stop after arrow navigation', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--accessibility`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const firstTab = frame.getByRole('tab', { name: /first/i })
    await firstTab.focus()
    await page.keyboard.press('ArrowRight')

    const secondTab = frame.getByRole('tab', { name: /second/i })
    await expect(secondTab).toBeFocused()

    // After moving, the focused tab owns the only tabindex="0".
    const zeroTabs = frame.locator('[role="tab"][tabindex="0"]')
    await expect(zeroTabs).toHaveCount(1)
    await expect(secondTab).toHaveAttribute('tabindex', '0')
  })

  test('disabled tab is never the roving tab stop', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--disabled-tab`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const disabledTab = frame.getByRole('tab', { name: /disabled/i })
    await expect(disabledTab).toHaveAttribute('tabindex', '-1')

    // The active tab is the entry point instead.
    const activeTab = frame.getByRole('tab', { name: /active/i })
    await expect(activeTab).toHaveAttribute('tabindex', '0')
  })

  test('ArrowRight moves focus to the next tab trigger', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--accessibility`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Focus the first tab trigger
    const firstTab = frame.getByRole('tab', { name: /first/i })
    await firstTab.focus()
    await expect(firstTab).toBeFocused()

    // Arrow Right should move focus to the second tab
    await page.keyboard.press('ArrowRight')

    const secondTab = frame.getByRole('tab', { name: /second/i })
    await expect(secondTab).toBeFocused()
  })

  test('ArrowLeft moves focus back to the previous tab trigger', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--accessibility`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Start on the first tab, move right, then back left
    const firstTab = frame.getByRole('tab', { name: /first/i })
    await firstTab.focus()

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowLeft')

    await expect(firstTab).toBeFocused()
  })

  test('ArrowRight skips disabled tabs', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--accessibility`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Accessibility story has tabs: First, Second, Disabled, Fourth
    const secondTab = frame.getByRole('tab', { name: /second/i })
    await secondTab.focus()

    // Press ArrowRight from Second — the Disabled tab should be skipped
    await page.keyboard.press('ArrowRight')

    // Focus should land on Fourth (the one after the disabled tab)
    const fourthTab = frame.getByRole('tab', { name: /fourth/i })
    await expect(fourthTab).toBeFocused()
  })

  test('variant gallery renders all three variants', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--all-variants`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    // Each variant group has "Overview" tab triggers
    const overviewTabs = frame.getByRole('tab', { name: /overview/i })
    // Three variants × 1 Overview tab each = 3
    await expect(overviewTabs).toHaveCount(3)
  })

  test('disabled tab trigger cannot be selected', async ({ page }) => {
    await page.goto(`/?path=/story/${STORY_ROOT}--disabled-tab`)

    const frame = page.frameLocator('#storybook-preview-iframe')

    const disabledTab = frame.getByRole('tab', { name: /disabled/i })
    await expect(disabledTab).toBeVisible()
    await expect(disabledTab).toBeDisabled()

    // Clicking a disabled tab should not change the selected state
    await disabledTab.click({ force: true })
    await expect(disabledTab).toHaveAttribute('aria-selected', 'false')
  })
})
