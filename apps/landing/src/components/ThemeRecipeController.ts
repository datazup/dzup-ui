import type { ThemeRecipeV1 } from '@dzup-ui/tokens'
import { useTheme } from '@dzup-ui/core/providers'
import {
  applyThemeRecipe,
  normalizeThemeRecipe,
  serializeThemeRecipe,
  themeRecipeFromUrl,
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

function readInitialRecipe(): { recipe: ThemeRecipeV1 | null, fromUrl: boolean } {
  if (typeof window === 'undefined')
    return { recipe: null, fromUrl: false }

  try {
    const shared = themeRecipeFromUrl(window.location.href)
    if (shared)
      return { recipe: shared, fromUrl: true }
  }
  catch {
    // An invalid share token must not suppress a valid persisted preference.
  }

  try {
    const stored = window.localStorage.getItem(LANDING_RECIPE_STORAGE_KEY)
    return {
      recipe: stored ? normalizeThemeRecipe(JSON.parse(stored) as unknown) : null,
      fromUrl: false,
    }
  }
  catch {
    return { recipe: null, fromUrl: false }
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
    const initial = readInitialRecipe()
    if (initial.recipe)
      designer.replaceRecipe(initial.recipe)

    // An explicit shared recipe is the navigation intent and therefore owns its
    // mode. Otherwise the provider's persisted `dz-theme` remains authoritative.
    if (initial.fromUrl)
      provider.setTheme(designer.mode.value)
    else
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
