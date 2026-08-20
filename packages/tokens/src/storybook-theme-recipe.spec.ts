import { describe, expect, it } from 'vitest'
import {
  applyStorybookThemeRecipe,
  createStorybookThemeRecipeFoucCache,
  normalizeStorybookThemeRecipeGlobals,
  STORYBOOK_THEME_RECIPE_GLOBAL_TYPES,
  STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS,
  themeRecipeFromStorybookGlobals,
  themeRecipeToStorybookGlobals,
} from './storybook-theme-recipe.ts'
import { createThemeRecipePreset } from './theme-recipe.ts'

describe('storybook ThemeRecipeV1 preset', () => {
  it('publishes deterministic toolbar axes and defaults', () => {
    expect(Object.keys(STORYBOOK_THEME_RECIPE_GLOBAL_TYPES)).toEqual([
      'theme',
      'density',
      'direction',
      'motion',
    ])
    expect(STORYBOOK_THEME_RECIPE_GLOBAL_TYPES.theme.toolbar.items.map(item => item.value)).toEqual([
      'system',
      'light',
      'dark',
    ])
    expect(STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS).toEqual({
      theme: 'system',
      density: 'cozy',
      direction: 'ltr',
      motion: 'normal',
    })
  })

  it('normalizes untrusted globals axis-by-axis', () => {
    expect(normalizeStorybookThemeRecipeGlobals({
      theme: 'dark',
      density: 'invalid',
      direction: 'rtl',
      motion: null,
    })).toEqual({
      theme: 'dark',
      density: 'cozy',
      direction: 'rtl',
      motion: 'normal',
    })
  })

  it('round-trips the four Storybook axes through ThemeRecipeV1', () => {
    const recipe = themeRecipeFromStorybookGlobals({
      theme: 'dark',
      density: 'compact',
      direction: 'rtl',
      motion: 'reduced',
    })
    expect(themeRecipeToStorybookGlobals(recipe)).toEqual({
      theme: 'dark',
      density: 'compact',
      direction: 'rtl',
      motion: 'reduced',
    })
  })

  it('applies system mode and every non-color axis to an explicit target', () => {
    const attributes = new Map<string, string>()
    const variables = new Map<string, string>()
    const result = applyStorybookThemeRecipe({
      style: { setProperty: (name, value) => variables.set(name, value) },
      setAttribute: (name, value) => attributes.set(name, value),
    }, {
      theme: 'system',
      density: 'spacious',
      direction: 'rtl',
      motion: 'reduced',
    }, true)

    expect(result.resolvedMode).toBe('dark')
    expect(attributes).toEqual(new Map([
      ['data-theme', 'dark'],
      ['data-theme-mode', 'system'],
      ['data-density', 'spacious'],
      ['data-motion-preview', 'reduced'],
      ['dir', 'rtl'],
    ]))
    expect(variables.get('--dz-spacing-4')).toBe('1.12rem')
  })

  it('creates a deterministic two-mode FOUC cache', () => {
    const recipe = createThemeRecipePreset('slate', {
      mode: 'dark',
      direction: 'rtl',
      motion: 'reduced',
    })
    const first = createStorybookThemeRecipeFoucCache(recipe)
    const second = createStorybookThemeRecipeFoucCache(recipe)
    expect(second).toEqual(first)
    expect(first).toMatchObject({
      version: 1,
      mode: 'dark',
      density: 'compact',
      direction: 'rtl',
      motion: 'reduced',
    })
    expect(first.light['--dz-shadow-md']).not.toBe(first.dark['--dz-shadow-md'])
  })
})
