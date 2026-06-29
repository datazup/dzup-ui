import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function loadStoryCanvas(page: Page, storyId: string): Promise<Page> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`, {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('body')).toHaveClass(/sb-show-main/, { timeout: 30_000 })

  return page
}
