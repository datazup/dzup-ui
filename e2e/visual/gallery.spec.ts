import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook.ts'
import { guardVisualLane } from './platform-guard.ts'

/**
 * Screen-level visual baselines — 8 demo screens × light/dark.
 *
 * Baselines are committed for `chromium-linux` and this lane is a **gate**
 * (`lanes[gallery]` in `e2e/visual/visual-baselines.json`). On any other
 * platform `guardVisualLane` registers one refusal and this file registers no
 * snapshot tests at all — see `e2e/visual/platform.ts` for why "no snapshot
 * tests" rather than "skipped snapshot tests" is the only safe state.
 */

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

if (guardVisualLane('gallery', SCREENS.length * THEMES.length)) {
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
}
