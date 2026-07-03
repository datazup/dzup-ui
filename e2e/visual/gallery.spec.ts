import { test, expect } from '@playwright/test'
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
    test(`gallery ${screen.name} ${theme}`, async ({ page }) => {
      // The @storybook/addon-themes decorator does NOT honor the
      // `globals=theme:` query param on a direct iframe load: it re-applies its
      // defaultTheme ('light') to <html data-theme> on every render. A one-shot
      // setAttribute gets clobbered by a later render. So we install a
      // MutationObserver (before any page script runs) that re-pins data-theme
      // to the desired value whenever the addon mutates it. This is the only
      // method that reliably yields a correctly-themed dark snapshot.
      await page.addInitScript((t) => {
        const pin = () => {
          const el = document.documentElement
          if (el.getAttribute('data-theme') !== t) {
            el.setAttribute('data-theme', t)
          }
        }
        const start = () => {
          pin()
          new MutationObserver(pin).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
          })
        }
        if (document.documentElement) {
          start()
        } else {
          document.addEventListener('DOMContentLoaded', start)
        }
      }, theme)

      const canvas = await loadStoryCanvas(page, screen.id, `theme:${theme}`, { waitForMainClass: false })
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
