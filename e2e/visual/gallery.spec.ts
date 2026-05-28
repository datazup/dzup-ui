import { test, expect } from '@playwright/test'

const SCREENS = [
  { name: 'dashboard', id: 'visual-refresh-dashboard--dzup-ui' },
  { name: 'form', id: 'visual-refresh-form--dzup-ui' },
  { name: 'datatable', id: 'visual-refresh-data-table--dzup-ui' },
] as const
const THEMES = ['light', 'dark'] as const

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

      // Storybook's iframe keeps a live HMR connection open, so the page never
      // reaches 'networkidle'. Wait for DOM ready instead, then settle.
      await page.goto(`/iframe.html?id=${screen.id}&globals=theme:${theme}`, {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForTimeout(1500)
      await expect(page).toHaveScreenshot(`gallery-${screen.name}-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
        // Generous stabilization window: this repo lives on a slow NTFS volume
        // where fullPage rendering can exceed the 5s default.
        timeout: 30_000,
      })
    })
  }
}
