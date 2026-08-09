import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook.ts'

const SCREENS = [
  { name: 'appshell', id: 'visual-refresh-app-shell--dzup-ui' },
  { name: 'form', id: 'visual-refresh-form--dzup-ui' },
] as const

// Same nine-case covering array as the Pro browser harness. Pro's unit test
// proves complete pairwise coverage; these OSS snapshots prove the canonical
// Core compositions render those cases deterministically.
const CASES = [
  { id: 'desktop-light-compact-ltr-normal-os-light', theme: 'light', density: 'compact', direction: 'ltr', motion: 'normal', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { id: 'mobile-light-cozy-rtl-reduced-os-dark', theme: 'light', density: 'cozy', direction: 'rtl', motion: 'reduced', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  { id: 'mobile-dark-spacious-ltr-normal-os-dark', theme: 'dark', density: 'spacious', direction: 'ltr', motion: 'normal', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  { id: 'desktop-system-spacious-rtl-reduced-os-light', theme: 'system', density: 'spacious', direction: 'rtl', motion: 'reduced', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { id: 'desktop-dark-compact-rtl-reduced-os-dark', theme: 'dark', density: 'compact', direction: 'rtl', motion: 'reduced', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  { id: 'mobile-system-cozy-ltr-normal-os-light', theme: 'system', density: 'cozy', direction: 'ltr', motion: 'normal', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { id: 'desktop-dark-cozy-ltr-reduced-os-light', theme: 'dark', density: 'cozy', direction: 'ltr', motion: 'reduced', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
  { id: 'mobile-system-compact-rtl-normal-os-dark', theme: 'system', density: 'compact', direction: 'rtl', motion: 'normal', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  { id: 'desktop-light-spacious-ltr-normal-os-light', theme: 'light', density: 'spacious', direction: 'ltr', motion: 'normal', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
] as const

for (const screen of SCREENS) {
  for (const item of CASES) {
    test(`ThemeRecipe matrix ${screen.name} ${item.id}`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Pixel baselines are qualified on Chromium/Linux.')
      await page.setViewportSize(item.viewport)
      await page.emulateMedia({ colorScheme: item.colorScheme })
      const globals = `theme:${item.theme};density:${item.density};direction:${item.direction};motion:${item.motion}`
      const canvas = await loadStoryCanvas(page, screen.id, globals, { waitForMainClass: false })
      const html = canvas.locator('html')
      const expectedTheme = item.theme === 'system' ? item.colorScheme : item.theme
      await expect(html).toHaveAttribute('data-theme', expectedTheme)
      await expect(html).toHaveAttribute('data-theme-mode', item.theme)
      await expect(html).toHaveAttribute('data-density', item.density)
      await expect(html).toHaveAttribute('dir', item.direction)
      await expect(html).toHaveAttribute('data-motion-preview', item.motion)

      const root = canvas.locator('#storybook-root')
      await expect(root).toBeVisible({ timeout: 60_000 })
      const dimensions = await canvas.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }))
      expect(dimensions.documentWidth, 'horizontal overflow').toBeLessThanOrEqual(dimensions.viewportWidth + 1)
      await expect(root).toHaveScreenshot(`theme-recipe-${screen.name}-${item.id}.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        timeout: 30_000,
      })
    })
  }
}
