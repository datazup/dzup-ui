import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook.ts'

// A contrasting host family exposes the ambiguous Tailwind font-[var(...)]
// shorthand: class-name tests alone cannot tell family from weight.
const HOST_CSS = `
  #storybook-root {
    font-family: serif;
    font-weight: 500;
    --dz-font-sans: Arial, sans-serif;
    --dz-font-light: 350;
    --dz-font-semibold: 650;
    --dz-font-bold: 750;
  }
`

for (const theme of ['light', 'dark'] as const) {
  test(`DzText resolves its family token and preserves inherited weight (${theme})`, async ({ page }) => {
    await loadStoryCanvas(page, 'core-typography-dztext--default', `theme:${theme}`)
    await page.addStyleTag({ content: HOST_CSS })
    const text = page.locator('#storybook-root p')
    await expect(text).toBeVisible()
    await text.screenshot({ path: test.info().outputPath('DzText.png'), animations: 'disabled', caret: 'hide' })
    await test.info().attach(`DzText-${theme}`, {
      path: test.info().outputPath('DzText.png'),
      contentType: 'image/png',
    })
    await expect(text).toHaveCSS('font-family', 'Arial, sans-serif')
    await expect(text).toHaveCSS('font-weight', '500')

    // Isolate the family utility from size/weight presets and the heading UA
    // rule: it must emit no weight declaration of its own.
    await text.evaluate((element) => {
      const probe = document.createElement('span')
      probe.id = 'family-only'
      probe.className = Array.from(element.classList).filter(c => c.includes('--dz-font-sans')).join(' ')
      probe.textContent = 'Family utility alone'
      element.parentElement!.append(probe)
    })
    await expect(page.locator('#family-only')).toHaveCSS('font-family', 'Arial, sans-serif')
    await expect(page.locator('#family-only')).toHaveCSS('font-weight', '500')
  })

  for (const [size, weight] of [['xs', '650'], ['lg', '650'], ['xl', '750'], ['4xl', '750']] as const) {
    test(`DzHeading ${size} resolves family and weight tokens (${theme})`, async ({ page }) => {
      await loadStoryCanvas(page, 'core-typography-dzheading--default', `theme:${theme}`)
      // Drive the existing story's public props without adding a test-only story.
      await page.goto(`${page.url()}&args=size:${size}`)
      await page.addStyleTag({ content: HOST_CSS })
      const heading = page.locator('#storybook-root h2')
      await expect(heading).toBeVisible()
      await heading.screenshot({ path: test.info().outputPath('DzHeading.png'), animations: 'disabled', caret: 'hide' })
      await test.info().attach(`DzHeading-${size}-${theme}`, {
        path: test.info().outputPath('DzHeading.png'),
        contentType: 'image/png',
      })
      await expect(heading).toHaveCSS('font-family', 'Arial, sans-serif')
      await expect(heading).toHaveCSS('font-weight', weight)
    })
  }

  for (const [component, tag] of [['dztext', 'p'], ['dzheading', 'h2']] as const) {
    test(`${component} explicit weight overrides the preset (${theme})`, async ({ page }) => {
      await loadStoryCanvas(page, `core-typography-${component}--default`, `theme:${theme}`)
      await page.goto(`${page.url()}&args=weight:light`)
      await page.addStyleTag({ content: HOST_CSS })
      const element = page.locator(`#storybook-root ${tag}`)
      await expect(element).toHaveCSS('font-family', 'Arial, sans-serif')
      await expect(element).toHaveCSS('font-weight', '350')
    })
  }
}
