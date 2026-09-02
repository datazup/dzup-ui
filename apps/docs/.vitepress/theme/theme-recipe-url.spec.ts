/**
 * theme-recipe-url.spec.ts — TASK-N2-D3.
 *
 * `<theme_builder>` requires the URL round trip to be "proven with a spec".
 * These are the proofs, and they are deliberately about the *round trip* rather
 * than about ThemeRecipe's internals: `packages/tokens/src/theme-recipe.spec.ts`
 * already owns encode/decode, and duplicating it here would be a second test of
 * the same thing rather than a test of the thing this packet built.
 */
import type { ThemeRecipeV1 } from '@dzup-ui/tokens'
import {
  createDefaultThemeRecipe,
  createThemeRecipePreset,
  serializeThemeRecipe,
  THEME_RECIPE_PRESETS,
} from '@dzup-ui/tokens'
import { describe, expect, it } from 'vitest'
import {
  consumerSnippets,
  recipeFromUrl,
  recipeToUrl,
  sandboxPayload,
  THEME_URL_PARAM,
  urlWithoutRecipe,
  validateRecipe,
} from './theme-recipe-url.ts'

const PAGE = 'https://example.test/guide/theme-builder'

/** A recipe that differs from the default on every axis a control can move. */
function customised(): ThemeRecipeV1 {
  const recipe = createDefaultThemeRecipe()
  recipe.preset = 'custom'
  recipe.palettes.primary = { hue: 212.5, chroma: 0.1875 }
  recipe.palettes.neutral = { hue: 44, chroma: 0.0125 }
  recipe.radius = 1.65
  recipe.shadow = 0.35
  recipe.density = 'spacious'
  recipe.font = 'serif'
  recipe.mode = 'dark'
  recipe.direction = 'rtl'
  recipe.motion = 'reduced'
  return recipe
}

describe('theme recipe URL round trip', () => {
  it('reproduces every axis of a customised recipe after a reload', () => {
    const before = customised()
    const url = recipeToUrl(PAGE, before)
    const after = recipeFromUrl(url)

    expect(after.fromUrl).toBe(true)
    expect(after.error).toBeUndefined()
    // Byte equality of the canonical serialisation, not a field-by-field
    // comparison: the contract fixes field AND palette order, so this asserts
    // the ordering survives the trip as well as the values.
    expect(serializeThemeRecipe(after.recipe)).toBe(serializeThemeRecipe(before))
  })

  it('round-trips every shipped preset', () => {
    for (const preset of THEME_RECIPE_PRESETS) {
      if (preset === 'custom')
        continue
      const before = createThemeRecipePreset(preset)
      const after = recipeFromUrl(recipeToUrl(PAGE, before))
      expect(serializeThemeRecipe(after.recipe), preset).toBe(serializeThemeRecipe(before))
      expect(after.recipe.preset, preset).toBe(preset)
    }
  })

  it('is stable under repeated encode/decode cycles', () => {
    let recipe = customised()
    const first = recipeToUrl(PAGE, recipe)
    for (let i = 0; i < 5; i++) {
      recipe = recipeFromUrl(recipeToUrl(PAGE, recipe)).recipe
    }
    expect(recipeToUrl(PAGE, recipe)).toBe(first)
  })

  it('preserves the rest of the URL and touches only the theme parameter', () => {
    const url = recipeToUrl(`${PAGE}?preview=DzAlert#controls`, customised())
    const parsed = new URL(url)
    expect(parsed.pathname).toBe('/guide/theme-builder')
    expect(parsed.searchParams.get('preview')).toBe('DzAlert')
    expect(parsed.hash).toBe('#controls')
    expect(parsed.searchParams.get(THEME_URL_PARAM)).toBeTruthy()
  })

  it('produces a URL-safe token — no percent-encoding survives in the parameter', () => {
    const url = new URL(recipeToUrl(PAGE, customised()))
    const raw = url.search.split(`${THEME_URL_PARAM}=`)[1] ?? ''
    expect(raw).toMatch(/^[\w-]+$/)
  })

  it('returns the default recipe, and says so, when the URL carries no theme', () => {
    const result = recipeFromUrl(PAGE)
    expect(result.fromUrl).toBe(false)
    expect(result.error).toBeUndefined()
    expect(serializeThemeRecipe(result.recipe)).toBe(serializeThemeRecipe(createDefaultThemeRecipe()))
  })

  it('removes the parameter and leaves the rest intact', () => {
    const withTheme = recipeToUrl(`${PAGE}?preview=DzCard`, customised())
    const cleared = new URL(urlWithoutRecipe(withTheme))
    expect(cleared.searchParams.get(THEME_URL_PARAM)).toBeNull()
    expect(cleared.searchParams.get('preview')).toBe('DzCard')
  })
})

describe('validation is ThemeRecipe\'s, surfaced rather than re-implemented', () => {
  it('reports a truncated token with the code and message ThemeRecipe raised', () => {
    const truncated = `${PAGE}?${THEME_URL_PARAM}=not-a-real-token!!`
    const result = recipeFromUrl(truncated)
    expect(result.fromUrl).toBe(false)
    expect(result.error?.code).toBe('INVALID_ENCODING')
    expect(result.error?.message).toContain('Theme recipe URL token')
    // Falls back to something usable rather than rendering nothing.
    expect(result.recipe.version).toBe(1)
  })

  it('reports a future recipe version rather than silently migrating it', () => {
    const result = validateRecipe({ ...createDefaultThemeRecipe(), version: 2 })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('UNSUPPORTED_VERSION')
  })

  it('rejects an out-of-range axis with ThemeRecipe\'s own bounds', () => {
    // radius is bounded [0, 2] by `validateThemeRecipe`; nothing here restates
    // that bound, which is the point of the test.
    const result = validateRecipe({ ...createDefaultThemeRecipe(), radius: 9 })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('INVALID_RECIPE')
  })

  it('normalizes a valid recipe into canonical order', () => {
    const result = validateRecipe(customised())
    expect(result.ok).toBe(true)
    expect(Object.keys(result.normalized!)).toEqual([
      'version',
      'preset',
      'palettes',
      'radius',
      'shadow',
      'density',
      'font',
      'mode',
      'direction',
      'motion',
    ])
  })
})

describe('the sandbox payload comes from applyThemeRecipe, not from a second expander', () => {
  it('carries every attribute applyThemeRecipe sets, and the resolved mode', () => {
    const { attributes, variables } = sandboxPayload(customised(), false)
    expect(attributes).toEqual({
      'data-theme': 'dark',
      'data-theme-mode': 'dark',
      'data-density': 'spacious',
      'data-motion-preview': 'reduced',
      'dir': 'rtl',
    })
    expect(Object.keys(variables).length).toBeGreaterThan(0)
    expect(Object.keys(variables).every(name => name.startsWith('--dz-'))).toBe(true)
  })

  it('resolves `system` against the supplied preference rather than reading the DOM', () => {
    const recipe = { ...createDefaultThemeRecipe(), mode: 'system' as const }
    expect(sandboxPayload(recipe, true).attributes['data-theme']).toBe('dark')
    expect(sandboxPayload(recipe, false).attributes['data-theme']).toBe('light')
    // The recipe's own stored intent is unchanged either way.
    expect(sandboxPayload(recipe, true).attributes['data-theme-mode']).toBe('system')
  })
})

describe('consumer snippets', () => {
  it('emit CSS a consumer can paste, for the resolved mode', () => {
    const { css } = consumerSnippets(customised(), false)
    expect(css.startsWith(':root {')).toBe(true)
    expect(css).toContain('--dz-colors-primary-500:')
    expect(css.trimEnd().endsWith('}')).toBe(true)
  })

  it('emit the canonical recipe JSON, which decodes back to the same theme', () => {
    const before = customised()
    const { recipe } = consumerSnippets(before, false)
    const parsed = validateRecipe(JSON.parse(recipe))
    expect(parsed.ok).toBe(true)
    expect(serializeThemeRecipe(parsed.normalized!)).toBe(serializeThemeRecipe(before))
  })

  it('follow the system preference for the CSS snippet when the recipe says `system`', () => {
    const recipe = { ...createDefaultThemeRecipe(), mode: 'system' as const }
    expect(consumerSnippets(recipe, true).css).not.toBe(consumerSnippets(recipe, false).css)
  })
})
