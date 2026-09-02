---
title: Theme builder
description: Build a dzup-ui theme by moving the ThemeRecipe axes, share it as a URL, and copy the CSS or the recipe object into your app.
outline: [2, 3]
---

# Theme builder

Every control below moves one axis of **`ThemeRecipeV1`**, the public,
framework-neutral theme contract that ships in `@dzup-ui/tokens`. The page
computes nothing of its own: validation, normalisation, CSS-variable expansion
and URL encoding are all calls into that package, so a theme you build here is
exactly the theme your application gets from the same recipe.

<ClientOnly>
  <DzThemeBuilder />
</ClientOnly>

## What a recipe is, and is not

`ThemeRecipeV1` stores **design intent**, not DOM state — nine fields, listed
here in the contract's own order:

| Field | Values | What it moves |
|---|---|---|
| `version` | `1` | Fail-closed. A recipe from a future version is rejected, never guessed at. |
| `preset` | `dzup` `emerald` `rose` `amber` `slate` `violet` `mono` `custom` | A starting point. Editing any axis sets it to `custom`, because the preset no longer describes the recipe. |
| `palettes` | 7 named ramps, each `{ hue, chroma }` | OKLCH ramp definitions. The 11 shades of each are generated, never stored. |
| `radius` | `0`–`2` | Multiplier over the radius scale. `none` and `full` are excluded — they are not lengths. |
| `shadow` | `0`–`2.5` | Multiplier over shadow **alpha**, not over blur or spread. |
| `density` | `compact` `cozy` `spacious` | Multiplier over the spacing scale. |
| `font` | `inter` `system` `geist` `rounded` `serif` `mono` | Sets `--dz-font-sans`. |
| `mode` | `light` `dark` `system` | Intent. `system` resolves against the reader's OS preference at apply time. |
| `direction` | `ltr` `rtl` | Sets `dir`. |
| `motion` | `normal` `reduced` | Sets `data-motion-preview`. |

Two things it deliberately does **not** carry: per-component tokens, and
arbitrary CSS. A recipe re-maps the token tiers `@dzup-ui/tokens` owns; it is
not an escape hatch into component internals. Those are the `ui` prop and the
`data-part` surface described in the
[styling contract](./styling-contract.md).

## The link is the theme

Pressing a control rewrites the page URL with a `?theme=` token — the recipe,
canonically serialised and base64url-encoded by
`themeRecipeToUrl`. Opening that link reproduces the theme; nothing is stored on
a server and nothing is stored in your browser.

If a link's token is truncated or corrupted — chat clients do this — the page
says so, with the code and message `ThemeRecipe` itself raised, and falls back
to the default. It does not repair the token: a repaired recipe would be design
intent nobody expressed.

## Taking it to your app

The two snippets at the bottom of the builder are the two supported routes.

- **CSS custom properties** — `themeRecipeToCssText(recipe, mode)`. Paste the
  `:root { … }` block after `@dzup-ui/tokens/css` and it wins by source order.
  This route needs no dzup code at runtime.
- **The recipe object** — `serializeThemeRecipe(recipe, true)`. Keep the JSON,
  hand it to `applyThemeRecipe(document.documentElement, recipe, mode)` at
  startup, and you can switch themes without a page load. This is the route that
  can also flip `dir` and the density attributes, because
  `applyThemeRecipe` sets them.

```ts
import { applyThemeRecipe, normalizeThemeRecipe, resolveThemeRecipeMode } from '@dzup-ui/tokens'
import recipeJson from './theme.json'

const recipe = normalizeThemeRecipe(recipeJson)
const mode = resolveThemeRecipeMode(
  recipe.mode,
  window.matchMedia('(prefers-color-scheme: dark)').matches,
)
applyThemeRecipe(document.documentElement, recipe, mode)
```

`normalizeThemeRecipe` is not optional politeness — it is the validator. It
throws `ThemeRecipeError` with `INVALID_RECIPE`, `UNSUPPORTED_VERSION` or
`INVALID_ENCODING` rather than returning a half-applied theme.

## What the preview is, and what it is not

The preview runs one component's **real Storybook story** inside the same
sandbox the [component playgrounds](/components/) use — the story file and line
range are printed on each component's own page. It is a rendering, on your
machine, of the tip of `main`.

It is **not** evidence. No result in this preview is a browser-support claim, an
accessibility result or a visual-regression baseline; what has and has not been
measured is published in full under [Evidence](/evidence/), including the 494
capability cells and all 534 assistive-technology cells that have never been
run.

The sandbox loads roughly 2 MB on demand and fetches Vue and the Tailwind
browser compiler from jsDelivr, so it needs network access. Nothing on this page
loads until you press a button.
