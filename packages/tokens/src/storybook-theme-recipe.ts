import type {
  ThemeRecipeApplyTarget,
  ThemeRecipeDensity,
  ThemeRecipeDirection,
  ThemeRecipeMode,
  ThemeRecipeMotion,
  ThemeRecipeV1,
} from './theme-recipe.js'
import {
  applyThemeRecipe,
  createDefaultThemeRecipe,
  normalizeThemeRecipe,
  resolveThemeRecipeMode,
  THEME_RECIPE_DENSITIES,
  THEME_RECIPE_DIRECTIONS,
  THEME_RECIPE_MODES,
  THEME_RECIPE_MOTIONS,
  themeRecipeToCssVariables,
} from './theme-recipe.js'

/** Shared browser storage used by the OSS and Pro Storybook hosts. */
export const STORYBOOK_THEME_RECIPE_STORAGE_KEY = 'dz-storybook-theme-recipe-v1'
export const STORYBOOK_THEME_RECIPE_FOUC_CACHE_KEY = 'dz-storybook-theme-recipe-css-v1'

/** The four runtime axes Storybook exposes in its global toolbar. */
export interface StorybookThemeRecipeGlobals {
  theme: ThemeRecipeMode
  density: ThemeRecipeDensity
  direction: ThemeRecipeDirection
  motion: ThemeRecipeMotion
}

export const STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS: StorybookThemeRecipeGlobals = {
  theme: 'system',
  density: 'cozy',
  direction: 'ltr',
  motion: 'normal',
}

/**
 * Framework-neutral Storybook global-type preset.
 *
 * The tokens package owns the values and defaults so OSS and Pro cannot drift;
 * each Storybook host owns only its Vue decorator and manager palette.
 */
export const STORYBOOK_THEME_RECIPE_GLOBAL_TYPES = {
  theme: {
    description: 'Color mode preference',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush' as const,
      items: [
        { value: 'system', title: 'System', right: 'OS' },
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
  density: {
    description: 'ThemeRecipe density',
    toolbar: {
      title: 'Density',
      icon: 'component' as const,
      items: [
        { value: 'compact', title: 'Compact' },
        { value: 'cozy', title: 'Cozy' },
        { value: 'spacious', title: 'Spacious' },
      ],
      dynamicTitle: true,
    },
  },
  direction: {
    description: 'Text direction',
    toolbar: {
      title: 'Direction',
      icon: 'transfer' as const,
      items: [
        { value: 'ltr', title: 'Left-to-right', right: 'LTR' },
        { value: 'rtl', title: 'Right-to-left', right: 'RTL' },
      ],
      dynamicTitle: true,
    },
  },
  motion: {
    description: 'Motion preference preview',
    toolbar: {
      title: 'Motion',
      icon: 'lightning' as const,
      items: [
        { value: 'normal', title: 'Normal' },
        { value: 'reduced', title: 'Reduced' },
      ],
      dynamicTitle: true,
    },
  },
}

function includesValue<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T)
}

/** Normalize untrusted Storybook globals, falling back axis-by-axis. */
export function normalizeStorybookThemeRecipeGlobals(
  value: Readonly<Record<string, unknown>> = {},
  fallback: StorybookThemeRecipeGlobals = STORYBOOK_THEME_RECIPE_INITIAL_GLOBALS,
): StorybookThemeRecipeGlobals {
  return {
    theme: includesValue(THEME_RECIPE_MODES, value.theme) ? value.theme : fallback.theme,
    density: includesValue(THEME_RECIPE_DENSITIES, value.density) ? value.density : fallback.density,
    direction: includesValue(THEME_RECIPE_DIRECTIONS, value.direction) ? value.direction : fallback.direction,
    motion: includesValue(THEME_RECIPE_MOTIONS, value.motion) ? value.motion : fallback.motion,
  }
}

/** Project a canonical recipe into Storybook's four global axes. */
export function themeRecipeToStorybookGlobals(
  recipeInput: ThemeRecipeV1,
): StorybookThemeRecipeGlobals {
  const recipe = normalizeThemeRecipe(recipeInput)
  return {
    theme: recipe.mode,
    density: recipe.density,
    direction: recipe.direction,
    motion: recipe.motion,
  }
}

/** Build the canonical dzup preset represented by Storybook globals. */
export function themeRecipeFromStorybookGlobals(
  value: Readonly<Record<string, unknown>> = {},
  baseInput: ThemeRecipeV1 = createDefaultThemeRecipe(),
): ThemeRecipeV1 {
  const base = normalizeThemeRecipe(baseInput)
  const globals = normalizeStorybookThemeRecipeGlobals(
    value,
    themeRecipeToStorybookGlobals(base),
  )
  return normalizeThemeRecipe({
    ...base,
    mode: globals.theme,
    density: globals.density,
    direction: globals.direction,
    motion: globals.motion,
  })
}

export interface AppliedStorybookThemeRecipe {
  recipe: ThemeRecipeV1
  resolvedMode: Exclude<ThemeRecipeMode, 'system'>
  variables: Record<string, string>
}

/** Apply Storybook globals through the canonical ThemeRecipeV1 runtime. */
export function applyStorybookThemeRecipe(
  target: ThemeRecipeApplyTarget,
  globals: Readonly<Record<string, unknown>>,
  systemPrefersDark: boolean,
): AppliedStorybookThemeRecipe {
  const recipe = themeRecipeFromStorybookGlobals(globals)
  const resolvedMode = resolveThemeRecipeMode(recipe.mode, systemPrefersDark)
  const variables = applyThemeRecipe(target, recipe, resolvedMode)
  return { recipe, resolvedMode, variables }
}

/** Serializable pre-render cache consumed by Storybook's FOUC bootstrap. */
export interface StorybookThemeRecipeFoucCacheV1 {
  version: 1
  mode: ThemeRecipeMode
  light: Record<string, string>
  dark: Record<string, string>
  density: ThemeRecipeDensity
  direction: ThemeRecipeDirection
  motion: ThemeRecipeMotion
}

export function createStorybookThemeRecipeFoucCache(
  recipeInput: ThemeRecipeV1,
): StorybookThemeRecipeFoucCacheV1 {
  const recipe = normalizeThemeRecipe(recipeInput)
  return {
    version: 1,
    mode: recipe.mode,
    light: themeRecipeToCssVariables(recipe, 'light'),
    dark: themeRecipeToCssVariables(recipe, 'dark'),
    density: recipe.density,
    direction: recipe.direction,
    motion: recipe.motion,
  }
}
