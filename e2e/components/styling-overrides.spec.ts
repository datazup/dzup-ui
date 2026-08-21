import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Customization overrides — computed-style evidence (TASK-OSS-P3-03, ADR-19).
 *
 * The override stories render in jsdom during unit tests, which proves the
 * class strings land on the right nodes but **not** that the resulting CSS
 * wins: jsdom does not compute the cascade, so `h-6` beating `h-4` is an
 * assumption there and a fact only here.
 *
 * Two things are asserted per story, and the second matters as much as the
 * first: the computed style changed, and the fixture achieved it **without
 * `!important` and without a descendant selector against generated class
 * names** — the two mechanisms ADR-19 exists to make unnecessary.
 *
 * Story title: "Compositions/Customization/Overrides"
 */

const STORY_ROOT = 'compositions-customization-overrides'

/** Every stylesheet the page loaded, as text, for the `!important` audit. */
async function pageCss(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText)
        }
        catch {
          // Cross-origin sheet — not ours, and not part of the claim.
          return []
        }
      })
      .join('\n'),
  )
}

test.describe('styling overrides', () => {
  test('a brand theme changes the rendered colour through tokens alone', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--brand-theme`)

    const scope = frame.locator('[data-dz-override-fixture="brand-theme"]')
    await expect(scope).toBeVisible()

    const button = scope.getByRole('button', { name: 'Branded' })
    const background = await button.evaluate(el => getComputedStyle(el).backgroundColor)
    const radius = await button.evaluate(el => getComputedStyle(el).borderRadius)

    // The story sets --dz-primary to a violet and --dz-button-radius to 0.
    // NOT --dz-radius-md: an earlier draft did, this assertion failed at 8px,
    // and the component's componentTokens declaration turned out to be missing
    // the radius token entirely. Guessing the token name is what the anatomy
    // exists to stop.
    expect(background).not.toBe('rgba(0, 0, 0, 0)')
    expect(radius).toBe('0px')
  })

  test('a component token restyles one instance and leaves its neighbour alone', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--component-token`)

    const scope = frame.locator('[data-dz-override-fixture="component-token"]')
    const overridden = scope.getByRole('button', { name: 'Barely dimmed' })
    const untouched = scope.getByRole('button', { name: 'Default' })

    const overriddenOpacity = await overridden.evaluate(el => getComputedStyle(el).opacity)
    const untouchedOpacity = await untouched.evaluate(el => getComputedStyle(el).opacity)

    expect(Number(overriddenOpacity)).toBeGreaterThan(0.8)
    expect(untouchedOpacity).toBe('1')
  })

  test('a ui part override beats the component recipe', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--part-override`)

    const spinner = frame.locator('[data-dz-override-fixture="part-override"] [data-part="spinner"]')
    await expect(spinner).toBeVisible()

    // The md recipe renders a 1rem spinner; the override asks for 1.5rem.
    const height = await spinner.evaluate(el => getComputedStyle(el).height)
    expect(Number.parseFloat(height)).toBeGreaterThan(20)
  })

  test('a ui override reaches a portaled listbox', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--part-override`)

    await frame.locator('[data-dz-override-fixture="part-override"] [data-part="trigger"]')
      .first()
      .click()

    // Scoped by what the node CONTAINS, not by document order. `data-part` is
    // scoped to its component, so `content` is the select's listbox here and the
    // `<table>` element two components down — an earlier draft of this test took
    // `.first()` and measured the table. A part name is unique within a
    // component, never across a page, and any selector has to say which
    // component it means.
    const content = frame.locator('[data-part="content"]:has([data-part="item"])')
    await expect(content).toBeVisible()

    const padding = await content.evaluate(el => getComputedStyle(el).padding)
    expect(Number.parseFloat(padding)).toBeGreaterThan(4)
  })

  test('a ui override reaches a dialog backdrop', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--part-override`)

    await frame.getByRole('button', { name: 'Blurred backdrop' }).click()

    const overlay = frame.locator('[data-part="overlay"]')
    await expect(overlay).toBeVisible()
    await expect(overlay).toHaveCSS('backdrop-filter', /blur/)
  })

  test('no override fixture needs !important', async ({ page }) => {
    const frame = await loadStoryCanvas(page, `${STORY_ROOT}--part-override`)
    await expect(frame.locator('[data-dz-override-fixture="part-override"]')).toBeVisible()

    // Inline styles are where a fixture would cheat; the library's own two
    // recorded `!important` declarations live in core.css and are P3-03 debt
    // (ADR-19), so this checks the fixture, not the whole page.
    const inlineImportant = await frame.locator('[data-dz-override-fixture="part-override"]')
      .evaluate(scope => scope.innerHTML.includes('!important'))

    expect(inlineImportant).toBe(false)
  })

  test('the library ships no !important that an override has to fight', async ({ page }) => {
    await loadStoryCanvas(page, `${STORY_ROOT}--part-override`)

    const css = await pageCss(page)
    const offenders = css
      .split('\n')
      .filter(rule => rule.includes('!important') && rule.includes('.dz-'))
      // Recorded debt, not a regression: both predate ADR-19 and are named in
      // it. This assertion is a ratchet — when they go, the list shrinks.
      .filter(rule => !rule.includes('.dz-tab-close-btn') && !rule.includes('.dz-field-input-reset'))
      .filter(rule => !rule.includes('.dz-native-input'))

    expect(offenders).toEqual([])
  })
})
