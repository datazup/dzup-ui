import { expect, test } from '@playwright/test'
import { measureVerticalClipping } from '../matrix/clipping.ts'

test('screen-reader announcements stay outside visible clipping evidence', async ({ page }) => {
  for (const hiding of ['clip: rect(0, 0, 0, 0)', 'clip-path: inset(50%)']) {
    await page.setContent(`<div id="storybook-root"><span role="status" style="position: absolute; width: 1px; height: 1px; overflow: hidden; line-height: 48px; ${hiding}">5 suggestions available</span></div>`)
    await expect(page.getByRole('status')).toHaveText('5 suggestions available')
    expect(await measureVerticalClipping(page)).toEqual([])
  }
})

test('a visible box still reports vertically clipped text', async ({ page }) => {
  await page.setContent('<div id="storybook-root"><span style="display: block; width: 200px; height: 1px; overflow: hidden; line-height: 48px">Visible option label</span></div>')
  expect(await measureVerticalClipping(page)).toEqual([
    expect.objectContaining({ tag: 'span', clientHeight: 1 }),
  ])
})

test('the sr-only class alone never exempts visible clipped content', async ({ page }) => {
  await page.setContent('<div id="storybook-root"><span class="sr-only" style="display: block; width: 200px; height: 1px; overflow: hidden; line-height: 48px">Visible option label</span></div>')
  expect(await measureVerticalClipping(page)).toEqual([
    expect.objectContaining({ tag: 'span', clientHeight: 1 }),
  ])
})
