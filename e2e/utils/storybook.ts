import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

interface LoadStoryCanvasOptions {
  waitForMainClass?: boolean
}

export async function loadStoryCanvas(
  page: Page,
  storyId: string,
  globals?: string,
  options: LoadStoryCanvasOptions = {},
): Promise<Page> {
  const params = new URLSearchParams({ id: storyId, viewMode: 'story' })
  if (globals) params.set('globals', globals)

  await page.goto(`/iframe.html?${params.toString()}`, {
    waitUntil: 'domcontentloaded',
  })

  if (options.waitForMainClass ?? true) {
    await expect(page.locator('body')).toHaveClass(/sb-show-main/, { timeout: 60_000 })
  }

  return page
}
