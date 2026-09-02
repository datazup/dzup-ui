/**
 * theme-recipe-url.ts — the theme builder's non-visual half (TASK-N2-D3).
 *
 * **There is no theming logic in this file.** Every operation on a recipe —
 * validating, normalizing, migrating, expanding to CSS variables, deciding which
 * `data-*` attributes a recipe implies, encoding to and from a URL — is a call
 * into `@dzup-ui/tokens`. This module resolves a browser URL, catches the error
 * `ThemeRecipe` already throws, and formats two consumer snippets from strings
 * `ThemeRecipe` already produced.
 *
 * That constraint is the task's own stop condition ("no new theming logic
 * outside ThemeRecipe", "if ThemeRecipe lacks something you need, that is a
 * tokens-package feature request"), and it is a live risk rather than a
 * hypothetical one: this lane has already found a second component-API
 * extractor, a second `llms` structural validator, a second component-page
 * renderer and — while this packet was running — a second theme designer in
 * `apps/landing`. Nothing here recomputes a colour.
 *
 * It is a separate file from the `.vue` component so it can be unit-tested;
 * `vitest.config.ts`'s `include` was widened to reach it, deliberately and for
 * the same reason constraint B6 says a new app must be added to the lint target
 * deliberately.
 */
import type {
  ThemeRecipeApplyTarget,
  ThemeRecipeMode,
  ThemeRecipeV1,
} from '@dzup-ui/tokens'
import {
  applyThemeRecipe,
  createDefaultThemeRecipe,
  normalizeThemeRecipe,
  resolveThemeRecipeMode,
  serializeThemeRecipe,
  ThemeRecipeError,
  themeRecipeFromUrl,
  themeRecipeToCssText,
  themeRecipeToUrl,
} from '@dzup-ui/tokens'

/** The query parameter the builder reads and writes. */
export const THEME_URL_PARAM = 'theme'

export interface RecipeFromUrlResult {
  /** The recipe to show. Always usable — the default when the URL carries none. */
  recipe: ThemeRecipeV1
  /** True when the URL actually carried a token. */
  fromUrl: boolean
  /**
   * The message `ThemeRecipe` itself produced when a token failed, verbatim.
   *
   * Surfaced rather than swallowed: a shared link that silently reverts to the
   * default theme is worse than one that says the link is broken, and it is the
   * only way a reader can tell the difference between "this preset" and "your
   * URL was truncated by a chat client".
   */
  error?: { code: string, message: string }
}

/**
 * Read a recipe out of a URL, falling back to the default.
 *
 * `themeRecipeFromUrl` throws `ThemeRecipeError` on a malformed token, an
 * unsupported version or a recipe that fails `validateThemeRecipe`. All three
 * are caught here and reported; none is repaired, because repairing an invalid
 * recipe would be inventing design intent the sender did not express.
 */
export function recipeFromUrl(urlValue: string): RecipeFromUrlResult {
  try {
    const parsed = themeRecipeFromUrl(urlValue, THEME_URL_PARAM)
    if (parsed === null)
      return { recipe: createDefaultThemeRecipe(), fromUrl: false }
    return { recipe: parsed, fromUrl: true }
  }
  catch (error) {
    if (error instanceof ThemeRecipeError) {
      return {
        recipe: createDefaultThemeRecipe(),
        fromUrl: false,
        error: { code: error.code, message: error.message },
      }
    }
    // A malformed `urlValue` (not a URL at all) is the only other possibility,
    // and it is a programming error here rather than user input.
    throw error
  }
}

/** The shareable URL for a recipe. Delegates entirely to `themeRecipeToUrl`. */
export function recipeToUrl(baseUrl: string, recipe: ThemeRecipeV1): string {
  return themeRecipeToUrl(baseUrl, recipe, THEME_URL_PARAM)
}

/**
 * Strip the theme parameter, so "reset" produces a clean link rather than one
 * carrying an encoded default that a reader would mistake for a choice.
 */
export function urlWithoutRecipe(baseUrl: string): string {
  const url = new URL(baseUrl)
  url.searchParams.delete(THEME_URL_PARAM)
  return url.toString()
}

export interface RecipeValidation {
  ok: boolean
  code?: string
  message?: string
  /** The normalized recipe when valid — canonical field and palette order. */
  normalized?: ThemeRecipeV1
}

/**
 * Validate through `normalizeThemeRecipe`, which is the same call the
 * serializer, the CSS expander and the URL encoder all make first.
 *
 * Using `normalizeThemeRecipe` rather than the `validateThemeRecipe` type guard
 * is deliberate: the guard answers yes/no, while normalize answers *why not*
 * with a code (`INVALID_RECIPE` / `UNSUPPORTED_VERSION` / `INVALID_ENCODING`).
 * A builder that could only say "invalid" would be a worse validator than the
 * one the package already ships, which is how second validators get written.
 */
export function validateRecipe(candidate: unknown): RecipeValidation {
  try {
    return { ok: true, normalized: normalizeThemeRecipe(candidate) }
  }
  catch (error) {
    if (error instanceof ThemeRecipeError)
      return { ok: false, code: error.code, message: error.message }
    return { ok: false, code: 'INVALID_RECIPE', message: String(error) }
  }
}

export interface SandboxThemePayload {
  variables: Record<string, string>
  attributes: Record<string, string>
}

/**
 * The `--dz-*` variables and the `data-*`/`dir` attributes a recipe implies, in
 * a form that can be posted into the preview sandbox.
 *
 * Produced by running **`applyThemeRecipe` itself** against a recording target
 * rather than by re-deriving either half. That matters more than it looks:
 * `applyThemeRecipe` sets `data-theme`, `data-theme-mode`, `data-density`,
 * `data-motion-preview` and `dir`, and a hand-written list here would be a
 * second, silently-diverging statement of the provider contract the first time
 * ADR-20 grows a sixth.
 */
export function sandboxPayload(
  recipe: ThemeRecipeV1,
  systemPrefersDark: boolean,
): SandboxThemePayload {
  const attributes: Record<string, string> = {}
  const target: ThemeRecipeApplyTarget = {
    style: { setProperty: () => {} },
    setAttribute: (name, value) => {
      attributes[name] = value
    },
  }
  const resolved = resolveThemeRecipeMode(recipe.mode as ThemeRecipeMode, systemPrefersDark)
  const variables = applyThemeRecipe(target, recipe, resolved)
  return { variables, attributes }
}

/**
 * The two copy-paste snippets a consumer needs, both derived from ThemeRecipe.
 *
 * `css` is what a consumer pastes into a stylesheet: the expanded custom
 * properties for the resolved mode, exactly as `themeRecipeToCssText` writes
 * them. `recipe` is the canonical JSON `serializeThemeRecipe` produces, field
 * and palette order fixed by the contract — which is what makes two people who
 * built the same theme produce the same bytes.
 */
export function consumerSnippets(
  recipe: ThemeRecipeV1,
  systemPrefersDark: boolean,
): { css: string, recipe: string } {
  const resolved = resolveThemeRecipeMode(recipe.mode as ThemeRecipeMode, systemPrefersDark)
  return {
    css: themeRecipeToCssText(recipe, resolved),
    recipe: serializeThemeRecipe(recipe, true),
  }
}
