import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const MOBILE_VIEWPORT = { width: 390, height: 844 }
const DESKTOP_VIEWPORT = { width: 1440, height: 1000 }
const HERO_SPLIT_DESCRIPTION
  = 'Copy and two CTAs on the left, a framed product image on the right; stacks to one column on narrow viewports.'

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
}

test('block detail keeps the live preview first across mobile and desktop', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  await page.setViewportSize(MOBILE_VIEWPORT)
  await page.goto('/blocks/hero-split', { waitUntil: 'networkidle' })

  const previewSection = page.locator('.bd-preview-section')
  const detailsSection = page.locator('.bd-details-section')
  await expect(previewSection).toBeVisible()
  await expect(detailsSection).toBeAttached()

  const previewComesFirst = await previewSection.evaluate((preview) => {
    const details = document.querySelector('.bd-details-section')
    return details !== null
      && Boolean(preview.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(previewComesFirst).toBe(true)

  await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('.bp-chips')).toHaveCount(1)
  await expect(page.locator('.block-manifest')).toHaveCount(1)
  await expect(page.getByText(HERO_SPLIT_DESCRIPTION, { exact: true })).toHaveCount(1)

  const previewStageBox = await page.locator('.bp-stage').boundingBox()
  expect(previewStageBox, 'the live preview stage must render').not.toBeNull()
  expect(previewStageBox!.y, 'the live preview must begin in the first mobile viewport')
    .toBeLessThan(MOBILE_VIEWPORT.height)

  const settingsToggle = page.getByRole('button', { name: 'Preview settings' })
  await expect(settingsToggle).toBeVisible()
  await expect(settingsToggle).toHaveAttribute('aria-expanded', 'false')

  const controlsId = await settingsToggle.getAttribute('aria-controls')
  expect(controlsId, 'Preview settings must identify its controlled region').toBeTruthy()
  const controls = page.locator(`#${controlsId}`)
  await expect(controls).toHaveAttribute('data-state', 'closed')
  await expect(controls).toHaveAttribute('aria-hidden', 'true')
  await expectNoHorizontalOverflow(page)

  await settingsToggle.click()
  await expect(settingsToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(controls).toHaveAttribute('data-state', 'open')
  await expect(controls).not.toHaveAttribute('aria-hidden', 'true')
  await expectNoHorizontalOverflow(page)

  await page.setViewportSize(DESKTOP_VIEWPORT)
  await expect(settingsToggle).toBeHidden()
  await expect(controls).toHaveAttribute('data-state', 'open')
  await expect(page.locator('.bp-head-controls')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await page.setViewportSize(MOBILE_VIEWPORT)
  await expect(settingsToggle).toBeVisible()
  await expect(settingsToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(controls).toHaveAttribute('data-state', 'closed')
  await expect(controls).toHaveAttribute('aria-hidden', 'true')
  await expectNoHorizontalOverflow(page)

  expect(consoleErrors).toEqual([])
})
