import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook.ts'

const SCREENS = [
  { name: 'dashboard', id: 'visual-refresh-dashboard--dzup-ui' },
  { name: 'form', id: 'visual-refresh-form--dzup-ui' },
  { name: 'datatable', id: 'visual-refresh-data-table--dzup-ui' },
  { name: 'appshell', id: 'visual-refresh-app-shell--dzup-ui' },
  { name: 'sidebar', id: 'visual-refresh-sidebar--dzup-ui' },
  { name: 'settings', id: 'visual-refresh-settings--dzup-ui' },
  { name: 'states', id: 'visual-refresh-states--dzup-ui' },
  { name: 'detail', id: 'visual-refresh-detail--dzup-ui' },
] as const
const THEMES = ['light', 'dark'] as const

test.setTimeout(90_000)

for (const screen of SCREENS) {
  for (const theme of THEMES) {
    test(`gallery ${screen.name} ${theme}`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Pixel baselines are qualified on Chromium/Linux.')
      const canvas = await loadStoryCanvas(page, screen.id, `theme:${theme}`, { waitForMainClass: false })
      await expect(canvas.locator('html')).toHaveAttribute('data-theme', theme)
      const root = canvas.locator('#storybook-root')
      await expect(root).toBeVisible({ timeout: 60_000 })
      await expect(root).toHaveScreenshot(`gallery-${screen.name}-${theme}.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        // Generous stabilization window: this repo lives on a slow NTFS volume
        // where gallery rendering can exceed the 5s default.
        timeout: 30_000,
      })
    })
  }
}
