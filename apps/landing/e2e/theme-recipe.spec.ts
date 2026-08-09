import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const AXE_SOURCE = readFileSync(
  new URL('../../../node_modules/axe-core/axe.min.js', import.meta.url),
  'utf8',
)

interface ThemeBootstrapEvidence {
  theme: string | undefined
  radius: string
}

declare global {
  interface Window {
    __landingRecipeBootstrap?: ThemeBootstrapEvidence | null
    axe: {
      run: (root: Document) => Promise<{
        violations: Array<{ id: string, nodes: Array<{ target: string[] }> }>
      }>
    }
  }
}

test('ThemeRecipeV1 persists, follows system mode, shares, resets, and remains accessible', async ({ page }) => {
  await page.goto('/themes', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Theme Designer', level: 1 })).toBeVisible()

  await page.getByLabel('Color mode').getByText('Dark', { exact: true }).click()
  await page.getByRole('button', { name: 'Violet', exact: true }).click()
  await page.getByLabel('Density').getByText('Compact', { exact: true }).click()
  await page.getByLabel('Direction').getByText('RTL', { exact: true }).click()
  await page.getByLabel('Motion preview').getByText('Reduced', { exact: true }).click()
  await page.getByLabel('Corner radius scale').evaluate((element: HTMLInputElement) => {
    element.value = '1.35'
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })

  const applied = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    mode: document.documentElement.dataset.themeMode,
    density: document.documentElement.dataset.density,
    direction: document.documentElement.dir,
    motion: document.documentElement.dataset.motionPreview,
    radius: getComputedStyle(document.documentElement).getPropertyValue('--dz-radius-lg').trim(),
    primary: getComputedStyle(document.documentElement).getPropertyValue('--dz-colors-primary-500').trim(),
  }))
  expect(applied).toMatchObject({
    theme: 'dark',
    mode: 'dark',
    density: 'compact',
    direction: 'rtl',
    motion: 'reduced',
    radius: '0.8438rem',
  })
  expect(applied.primary).toContain('292.0')

  await page.getByText('Serialized ThemeRecipeV1', { exact: true }).click()
  const exported = JSON.parse(await page.getByTestId('theme-recipe-export').textContent())
  expect(exported).toMatchObject({
    version: 1,
    preset: 'custom',
    density: 'compact',
    direction: 'rtl',
    motion: 'reduced',
  })
  const shareUrl = await page.getByRole('link', { name: 'Open share URL' }).getAttribute('href')
  expect(shareUrl).toContain('?theme=')

  await page.addInitScript(() => {
    window.__landingRecipeBootstrap = null
    const setProperty = CSSStyleDeclaration.prototype.setProperty
    CSSStyleDeclaration.prototype.setProperty = function (name, value, priority) {
      setProperty.call(this, name, value, priority)
      if (name === '--dz-radius-lg' && !document.querySelector('#app > *')) {
        window.__landingRecipeBootstrap = {
          theme: document.documentElement.dataset.theme,
          radius: value ?? '',
        }
      }
    }
  })
  await page.reload({ waitUntil: 'networkidle' })
  const persisted = await page.evaluate(() => ({
    recipe: JSON.parse(localStorage.getItem('dz-theme-recipe-v1') ?? 'null'),
    bootstrap: window.__landingRecipeBootstrap,
    direction: document.documentElement.dir,
    motion: document.documentElement.dataset.motionPreview,
  }))
  expect(persisted.recipe).toMatchObject({ version: 1, density: 'compact' })
  expect(persisted.bootstrap).toMatchObject({ theme: 'dark', radius: '0.8438rem' })
  expect(persisted.direction).toBe('rtl')
  expect(persisted.motion).toBe('reduced')

  await page.emulateMedia({ colorScheme: 'dark' })
  await page.getByLabel('Color mode').getByText('System', { exact: true }).click()
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', 'system')
  expect(await page.evaluate(() => localStorage.getItem('dz-theme'))).toBe('system')

  await page.evaluate(() => {
    localStorage.removeItem('dz-theme-recipe-v1')
    localStorage.removeItem('dz-theme')
  })
  await page.goto(shareUrl!, { waitUntil: 'networkidle' })
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('data-motion-preview', 'reduced')

  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  const reset = await page.evaluate(() => ({
    recipe: JSON.parse(localStorage.getItem('dz-theme-recipe-v1') ?? 'null'),
    density: document.documentElement.dataset.density,
    direction: document.documentElement.dir,
    motion: document.documentElement.dataset.motionPreview,
  }))
  expect(reset.recipe).toMatchObject({ version: 1, preset: 'dzup' })
  expect(reset).toMatchObject({ density: 'cozy', direction: 'ltr', motion: 'normal' })

  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  await page.addScriptTag({ content: AXE_SOURCE })
  const violations = await page.evaluate(async () => {
    const result = await window.axe.run(document)
    return result.violations.map(violation => ({
      id: violation.id,
      targets: violation.nodes.slice(0, 3).map(node => node.target.join(' ')),
    }))
  })
  expect(violations).toEqual([])
})
