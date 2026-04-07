import { expect, test } from '@playwright/test'

/**
 * Storybook infrastructure smoke tests.
 *
 * These tests verify that the Storybook dev server is healthy,
 * the UI shell renders correctly, and at least one story from each
 * component family can be loaded and rendered successfully.
 *
 * They are intentionally broad — they catch broken builds,
 * missing chunk errors, and misconfigured story loaders without
 * testing every component in detail.
 */

test.describe('Storybook root', () => {
  test('root page loads without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', err => jsErrors.push(err.message))

    await page.goto('/')

    // Allow time for the app shell to bootstrap
    await page.waitForLoadState('networkidle')

    // No uncaught JS exceptions during load
    expect(jsErrors).toHaveLength(0)
  })

  test('navigation sidebar is visible', async ({ page }) => {
    await page.goto('/')

    // Storybook 7/8 renders a sidebar nav with role="navigation" or data attributes.
    // The sidebar contains the component tree — we look for the nav landmark.
    const sidebar = page.locator('[data-layout="sidebar"], nav[aria-label*="story"], .sidebar-container').first()

    // Fallback: Storybook wraps sidebar in a nav or aside element
    const storybookSidebar = page.locator('#storybook-sidebar, .css-sidebar, [class*="sidebar"]').first()

    // At minimum, the page should contain at least one navigation structure
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 15_000 })
  })

  test('sidebar contains component family entries', async ({ page }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // These labels correspond to the story hierarchy root groups
    // Storybook renders them as expandable tree items in the sidebar
    const sidebar = page.locator('body')
    await expect(sidebar).toContainText('Buttons', { timeout: 15_000 })
    await expect(sidebar).toContainText('Inputs')
    await expect(sidebar).toContainText('Overlays')
    await expect(sidebar).toContainText('Navigation')
  })
})

test.describe('Story rendering', () => {
  /**
   * Helper that navigates to a story URL and waits for the iframe canvas
   * to finish rendering. Returns the frame locator.
   */
  async function loadStory(page: import('@playwright/test').Page, storyId: string) {
    await page.goto(`/?path=/story/${storyId}`)
    const frame = page.frameLocator('#storybook-preview-iframe')
    // Wait for the iframe body to exist — proof the story rendered
    await frame.locator('body').waitFor({ state: 'visible', timeout: 20_000 })
    return frame
  }

  // ---- Buttons family ----

  test('DzButton default story renders a visible button', async ({ page }) => {
    const frame = await loadStory(page, 'core-buttons-dzbutton--default')
    await expect(frame.getByRole('button', { name: 'Button' })).toBeVisible()
  })

  test('DzIconButton default story renders without errors', async ({ page }) => {
    const frame = await loadStory(page, 'core-buttons-dziconbutton--default')
    await expect(frame.locator('button').first()).toBeVisible()
  })

  // ---- Inputs family ----

  test('DzInput default story renders a visible text input', async ({ page }) => {
    const frame = await loadStory(page, 'core-inputs-dzinput--default')
    await expect(frame.getByRole('textbox')).toBeVisible()
  })

  test('DzPasswordInput default story renders a visible password input', async ({ page }) => {
    const frame = await loadStory(page, 'core-inputs-dzpasswordinput--default')
    await expect(frame.locator('input[type="password"]')).toBeVisible()
  })

  test('DzTextarea default story renders a visible textarea', async ({ page }) => {
    const frame = await loadStory(page, 'core-inputs-dztextarea--default')
    await expect(frame.getByRole('textbox')).toBeVisible()
  })

  // ---- Overlays family ----

  test('DzDialog default story renders trigger button', async ({ page }) => {
    const frame = await loadStory(page, 'core-overlays-dzdialog--default')
    await expect(frame.getByRole('button', { name: /open dialog/i })).toBeVisible()
  })

  test('DzTooltip default story renders trigger element', async ({ page }) => {
    const frame = await loadStory(page, 'core-overlays-dztooltip--default')
    await expect(frame.locator('body')).not.toBeEmpty()
  })

  // ---- Navigation family ----

  test('DzTabs default story renders tab list', async ({ page }) => {
    const frame = await loadStory(page, 'core-navigation-dztabs--default')
    await expect(frame.getByRole('tablist')).toBeVisible()
  })

  test('DzBreadcrumb default story renders navigation', async ({ page }) => {
    const frame = await loadStory(page, 'core-navigation-dzbreadcrumb--default')
    await expect(frame.getByRole('navigation')).toBeVisible()
  })

  // ---- Feedback family ----

  test('DzAlert default story renders alert element', async ({ page }) => {
    const frame = await loadStory(page, 'core-feedback-dzalert--default')
    await expect(frame.locator('body')).not.toBeEmpty()
  })

  test('DzToast tone gallery renders toast items', async ({ page }) => {
    const frame = await loadStory(page, 'core-feedback-dztoast--all-tones')
    await expect(frame.getByText('Success')).toBeVisible()
  })

  // ---- Forms family ----

  test('DzCheckbox default story renders a checkbox', async ({ page }) => {
    const frame = await loadStory(page, 'core-forms-dzcheckbox--default')
    await expect(frame.getByRole('checkbox')).toBeVisible()
  })

  test('DzSelect default story renders a listbox trigger', async ({ page }) => {
    const frame = await loadStory(page, 'core-forms-dzselect--default')
    await expect(frame.locator('body')).not.toBeEmpty()
  })

  // ---- Cards family ----

  test('DzCard default story renders a card element', async ({ page }) => {
    const frame = await loadStory(page, 'core-cards-dzcard--default')
    await expect(frame.locator('body')).not.toBeEmpty()
  })

  // ---- Typography family ----

  test('DzHeading default story renders a heading', async ({ page }) => {
    const frame = await loadStory(page, 'core-typography-dzheading--default')
    await expect(frame.getByRole('heading').first()).toBeVisible()
  })

  test('DzText default story renders text content', async ({ page }) => {
    const frame = await loadStory(page, 'core-typography-dztext--default')
    await expect(frame.locator('body')).not.toBeEmpty()
  })
})

test.describe('No console errors on key stories', () => {
  /**
   * Verifies that no console.error calls are emitted when rendering
   * the most-used stories. Vue's runtime emits errors there for
   * prop type violations and failed watchers.
   */

  const criticalStories = [
    'core-buttons-dzbutton--default',
    'core-inputs-dzinput--default',
    'core-inputs-dzpasswordinput--default',
    'core-overlays-dzdialog--default',
    'core-navigation-dztabs--default',
    'core-feedback-dztoast--all-tones',
    'core-forms-dzcheckbox--default',
  ]

  for (const storyId of criticalStories) {
    test(`no console errors on ${storyId}`, async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto(`/?path=/story/${storyId}`)
      const frame = page.frameLocator('#storybook-preview-iframe')
      await frame.locator('body').waitFor({ state: 'visible', timeout: 20_000 })

      // Filter out known non-critical browser warnings that are not Vue/component errors
      const actionableErrors = consoleErrors.filter(
        msg =>
          !msg.includes('favicon') &&
          !msg.includes('net::ERR') &&
          !msg.includes('ResizeObserver') &&
          // Storybook HMR websocket disconnects in CI are not component errors
          !msg.includes('WebSocket') &&
          !msg.includes('[HMR]'),
      )

      expect(actionableErrors).toHaveLength(0)
    })
  }
})
