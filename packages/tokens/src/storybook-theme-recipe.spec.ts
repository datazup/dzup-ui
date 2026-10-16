import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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

describe('tree-shaking declaration (UI-DZUP-UI-ARCH-L-09)', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const manifest = (pkg: string): { sideEffects?: unknown } =>
    JSON.parse(readFileSync(resolve(here, '../..', pkg, 'package.json'), 'utf8')) as { sideEffects?: unknown }

  it('tokens declares only its stylesheets as side effects, contracts none', () => {
    // Without the field, non-Rollup bundlers keep every module of the root
    // barrel — this preset included — in a build that imports one constant.
    expect(manifest('tokens').sideEffects).toEqual(['*.css'])
    expect(manifest('contracts').sideEffects).toBe(false)
  })

  it('backs the declaration: no shipped module runs a statement at import time', () => {
    // A bare top-level call (`main()`, `register(...)`) is what `sideEffects:
    // false` would silently drop. The two generator CLIs are not shipped.
    const offenders: string[] = []
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts') || /^generate(?:-dtcg)?\.ts$/.test(entry.name))
          continue
        readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
          if (/^(?:[\w$.]+\(|globalThis\.|window\.|document\.)/.test(line))
            offenders.push(`${full}:${i + 1}`)
        })
      }
    }
    walk(here)
    walk(resolve(here, '../../contracts/src'))
    expect(offenders).toEqual([])
  })
})
