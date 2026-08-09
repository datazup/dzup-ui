import { describe, expect, it } from 'vitest'
import {
  applyThemeRecipe,
  createDefaultThemeRecipe,
  createThemeRecipePreset,
  decodeThemeRecipe,
  encodeThemeRecipe,
  normalizeThemeRecipe,
  serializeThemeRecipe,
  ThemeRecipeError,
  themeRecipeFromUrl,
  themeRecipeToCssText,
  themeRecipeToCssVariables,
  themeRecipeToUrl,
  validateThemeRecipe,
} from './theme-recipe.ts'

describe('theme recipe v1', () => {
  it('round-trips through canonical JSON and base64url encoding', () => {
    const recipe = createThemeRecipePreset('violet', {
      mode: 'dark',
      direction: 'rtl',
      motion: 'reduced',
    })
    expect(normalizeThemeRecipe(JSON.parse(serializeThemeRecipe(recipe)))).toEqual(recipe)
    expect(decodeThemeRecipe(encodeThemeRecipe(recipe))).toEqual(recipe)
  })

  it('uses deterministic field and palette ordering', () => {
    const recipe = createThemeRecipePreset('emerald')
    const first = serializeThemeRecipe(recipe)
    const second = serializeThemeRecipe({
      ...recipe,
      palettes: Object.fromEntries(Object.entries(recipe.palettes).reverse()) as typeof recipe.palettes,
    })
    expect(second).toBe(first)
    expect(first.indexOf('"primary"')).toBeLessThan(first.indexOf('"neutral"'))
    expect(first.indexOf('"version"')).toBeLessThan(first.indexOf('"preset"'))
  })

  it('rejects malformed and future-version recipes', () => {
    expect(validateThemeRecipe({ version: 1 })).toBe(false)
    expect(() => normalizeThemeRecipe({ version: 1, unexpected: true })).toThrow(ThemeRecipeError)
    expect(() => normalizeThemeRecipe({ version: 2 })).toThrowError(
      expect.objectContaining({ code: 'UNSUPPORTED_VERSION' }),
    )
    expect(() => decodeThemeRecipe('not-valid!')).toThrowError(
      expect.objectContaining({ code: 'INVALID_ENCODING' }),
    )

    const recipe = createDefaultThemeRecipe()
    expect(validateThemeRecipe({ ...recipe, radius: Number.POSITIVE_INFINITY })).toBe(false)
    expect(validateThemeRecipe({
      ...recipe,
      palettes: { ...recipe.palettes, privateAccent: { hue: 10, chroma: 0.1 } },
    })).toBe(false)
  })

  it('migrates default and legacy Theme Designer shapes', () => {
    expect(normalizeThemeRecipe()).toEqual(createDefaultThemeRecipe())
    const migrated = normalizeThemeRecipe({
      p: { primary: [18, 0.19] },
      r: 1.6,
      d: 'comfortable',
      s: 1.4,
      f: 'rounded',
    })
    expect(migrated).toMatchObject({
      version: 1,
      preset: 'custom',
      radius: 1.6,
      density: 'cozy',
      shadow: 1.4,
      font: 'rounded',
    })
    expect(migrated.palettes.primary).toEqual({ hue: 18, chroma: 0.19 })
  })

  it('generates complete light and dark CSS variable maps', () => {
    const recipe = createThemeRecipePreset('slate')
    const light = themeRecipeToCssVariables(recipe, 'light')
    const dark = themeRecipeToCssVariables(recipe, 'dark')
    expect(light['--dz-colors-primary-500']).toBe('oklch(0.550 0.1500 235.0)')
    expect(light['--dz-radius-lg']).toBe('0.4375rem')
    expect(light['--dz-spacing-4']).toBe('0.9rem')
    expect(light['--dz-shadow-md']).not.toBe(dark['--dz-shadow-md'])
    expect(light['--dz-font-sans']).toBeDefined()

    const darkCss = themeRecipeToCssText(recipe, 'dark', '[data-theme="dark"]')
    expect(darkCss).toContain('[data-theme="dark"] {')
    expect(darkCss).toContain(`--dz-shadow-md: ${dark['--dz-shadow-md']};`)
  })

  it('normalizes into a detached recipe and preserves runtime preferences across presets', () => {
    const input = createThemeRecipePreset('emerald', {
      mode: 'dark',
      direction: 'rtl',
      motion: 'reduced',
    })
    const normalized = normalizeThemeRecipe(input)
    normalized.palettes.primary.hue = 42
    expect(input.palettes.primary.hue).toBe(165)
    expect(normalized).toMatchObject({ mode: 'dark', direction: 'rtl', motion: 'reduced' })
  })

  it('applies to an explicit target without requiring document or window', () => {
    const attributes = new Map<string, string>()
    const variables = new Map<string, string>()
    const target = {
      style: { setProperty: (name: string, value: string) => variables.set(name, value) },
      setAttribute: (name: string, value: string) => attributes.set(name, value),
    }
    const recipe = createThemeRecipePreset('mono', {
      mode: 'system',
      direction: 'rtl',
      motion: 'reduced',
    })
    applyThemeRecipe(target, recipe, 'dark')
    expect(attributes).toEqual(new Map([
      ['data-theme', 'dark'],
      ['data-theme-mode', 'system'],
      ['data-density', 'cozy'],
      ['data-motion-preview', 'reduced'],
      ['dir', 'rtl'],
    ]))
    expect(variables.get('--dz-colors-primary-500')).toContain('286.0')
  })

  it('encodes and decodes a shareable URL without global location state', () => {
    const recipe = createThemeRecipePreset('rose', { mode: 'light' })
    const url = themeRecipeToUrl('https://example.test/themes?keep=1', recipe)
    expect(url).toContain('keep=1')
    expect(themeRecipeFromUrl(url)).toEqual(recipe)
    expect(themeRecipeFromUrl('https://example.test/themes')).toBeNull()
  })
})
