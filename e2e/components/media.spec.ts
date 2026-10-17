import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * DzCarousel navigation under a real pointer.
 *
 * The Prev/Next arrows are composed into the default slot. They used to render
 * inside the sliding track, whose `transform` made it their containing block:
 * the arrows slid out of the viewport with the track and were clipped, so a
 * real click on "Next slide" in the default story landed on the page behind it
 * (Playwright reported `#storybook-root` intercepting the pointer). jsdom specs
 * cannot see this — they do not lay out or hit-test.
 */

const STORY_ROOT = 'core-media-dzcarousel'

test.describe('DzCarousel', () => {
  // The default story's play function ends on slide 2 (it drives the arrows
  // with userEvent, which dispatches events without hit-testing — so it passed
  // while a real pointer could not reach the arrow).
  test('the Next and Previous arrows take a real click in the default story', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)
    const dots = frame.getByRole('tab')
    const next = frame.getByRole('button', { name: 'Next slide' })
    const previous = frame.getByRole('button', { name: 'Previous slide' })
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true')

    await previous.click()
    await expect(dots.nth(0)).toHaveAttribute('aria-selected', 'true')

    await next.click()
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true')

    await next.click()
    await expect(dots.nth(2)).toHaveAttribute('aria-selected', 'true')
  })

  test('the arrows and dots stay inside the carousel after navigating', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--default`)
    const root = frame.locator('[data-part="root"]').first()
    const dots = frame.getByRole('tab')
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true')
    await frame.getByRole('button', { name: 'Next slide' }).click()
    await expect(dots.nth(2)).toHaveAttribute('aria-selected', 'true')

    const rootBox = (await root.boundingBox())!
    for (const name of ['Previous slide', 'Next slide']) {
      const box = (await frame.getByRole('button', { name }).boundingBox())!
      expect(box.x, name).toBeGreaterThanOrEqual(rootBox.x)
      expect(box.x + box.width, name).toBeLessThanOrEqual(rootBox.x + rootBox.width)
    }
    await expect(dots.nth(0)).toBeInViewport()
  })
})
