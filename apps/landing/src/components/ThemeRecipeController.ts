import type { ThemeRecipeV1 } from '@dzup-ui/tokens'
import { useTheme } from '@dzup-ui/core/providers'
import {
  applyThemeRecipe,
  normalizeThemeRecipe,
  serializeThemeRecipe,
  themeRecipeToCssVariables,
} from '@dzup-ui/tokens'
import { defineComponent, watch } from 'vue'
import { useThemeDesigner } from '../composables/useThemeDesigner.ts'

export const LANDING_RECIPE_STORAGE_KEY = 'dz-theme-recipe-v1'
export const LANDING_RECIPE_FOUC_CACHE_KEY = 'dz-theme-recipe-css-v1'

interface FouCCache {
  version: 1
  light: Record<string, string>
  dark: Record<string, string>
  density: ThemeRecipeV1['density']
  direction: ThemeRecipeV1['direction']
  motion: ThemeRecipeV1['motion']
}

function readPersistedRecipe(): ThemeRecipeV1 | null {
  if (typeof window === 'undefined')
    return null
  try {
    const stored = window.localStorage.getItem(LANDING_RECIPE_STORAGE_KEY)
    return stored ? normalizeThemeRecipe(JSON.parse(stored) as unknown) : null
  }
  catch {
    return null
  }
}

function persistRecipe(recipe: ThemeRecipeV1): void {
  if (typeof window === 'undefined')
    return
  try {
    const cache: FouCCache = {
      version: 1,
      light: themeRecipeToCssVariables(recipe, 'light'),
      dark: themeRecipeToCssVariables(recipe, 'dark'),
      density: recipe.density,
      direction: recipe.direction,
      motion: recipe.motion,
    }
    window.localStorage.setItem(LANDING_RECIPE_STORAGE_KEY, serializeThemeRecipe(recipe))
    window.localStorage.setItem(LANDING_RECIPE_FOUC_CACHE_KEY, JSON.stringify(cache))
  }
  catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

/** Applies and persists the app-owned recipe beneath the sole theme provider. */
export default defineComponent({
  name: 'ThemeRecipeController',
  setup() {
    const designer = useThemeDesigner()
    const provider = useTheme()
    const persisted = readPersistedRecipe()
    if (persisted)
      designer.replaceRecipe(persisted)

    // The provider's persisted `dz-theme` preference wins at startup. Shared
    // recipe URLs loaded later can still intentionally set a different mode.
    designer.mode.value = provider.theme.value

    watch(provider.theme, (next) => {
      if (designer.mode.value !== next)
        designer.mode.value = next
    })

    watch(
      () => designer.recipe,
      (next) => {
        if (provider.theme.value !== next.mode)
          provider.setTheme(next.mode)
        if (typeof document !== 'undefined')
          applyThemeRecipe(document.documentElement, next, provider.resolvedTheme.value)
        persistRecipe(next)
      },
      { deep: true, immediate: true },
    )

    watch(provider.resolvedTheme, (resolved) => {
      if (typeof document !== 'undefined')
        applyThemeRecipe(document.documentElement, designer.recipe, resolved)
      persistRecipe(designer.recipe)
    })

    return () => null
  },
})
