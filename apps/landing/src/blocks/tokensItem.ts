/**
 * Tokens → shadcn `registry:theme` shaping (docs requirement <registry>:
 * "…tokens (cssVars/tokens)").
 *
 * The `--dz-*` design tokens are the substrate every block and template is built
 * on. This module projects the generated `@dzup-ui/tokens` stylesheet
 * (`dist/tokens.css`) into a single canonical shadcn registry item so a consumer
 * can `npx shadcn@latest add <host>/r/tokens.json` and have the CLI write the
 * full light/dark token set into their project's CSS as `cssVars` — the shadcn
 * vehicle for design tokens.
 *
 * Runtime-free: the only input is the stylesheet TEXT (the build script reads the
 * file and passes it in), so this parses/shapes and nothing else — which also
 * lets the Vitest guard exercise it against a fixture.
 *
 * ── Spike note (Vue/dzup vs shadcn-React) ───────────────────────────────────
 * shadcn writes `cssVars.light` under `:root` and `cssVars.dark` under `.dark`.
 * dzup-ui's own runtime toggles dark via `[data-theme="dark"]`, so a consumer who
 * installs these tokens standalone drives them with shadcn's `.dark` convention
 * (or adds `@import '@dzup-ui/tokens/css'` for the native selectors). The token
 * values* are identical either way; only the activating selector differs. The
 * npm package (`@dzup-ui/tokens`) is listed in `dependencies` so the source of
 * truth stays installable.
 *
 * ── A4-F4, closed by TASK-R1-O5 ─────────────────────────────────────────────
 * The spike note above described the gap and left it open, and the registry
 * evaluation then measured what it costs: **0 `data-theme` and 0 `@layer` in the
 * 78.8 KB the CLI writes**. A consumer who installs this theme and drives dark
 * mode with dzup-ui's own runtime — the documented way, and the only way
 * `DzThemeProvider` offers — gets 673 light tokens and 123 dead ones. "The
 * consumer can use `.dark` instead" is a workaround the consumer has to be told
 * about, on a page that does not exist yet.
 *
 * So the item now also carries a `css` block, which is the schema's field for
 * CSS the `cssVars` shape cannot express:
 *
 *   - `[data-theme="dark"]` re-declares the dark scheme under the selector
 *     dzup-ui's runtime actually toggles, so both conventions work and neither
 *     is documentation-only;
 *   - the whole block sits in `@layer dz-tokens`, the layer ADR-19 gives the
 *     tokens. Unlayered declarations outrank every layer, so an alias written
 *     outside one would quietly beat the package's own stylesheet in a project
 *     that imports both — the opposite of what an override-by-contract system
 *     promises.
 *
 * Only the **dark** scheme is aliased, and deliberately: shadcn's `:root` write
 * is already the selector dzup-ui uses for light, so duplicating 673 light
 * tokens would add ~30 KB to every install and change nothing. `validate:registry`
 * holds all three properties — both schemes present, the dark alias, the layer.
 */

import type { RegistryDirectoryEntry } from './registryItem.ts'
import { REGISTRY_ITEM_SCHEMA } from './registryItem.ts'

/** The registry-item `type` for a token theme (shadcn taxonomy). */
export const TOKENS_ITEM_TYPE = 'registry:theme'

/** The registry item `name` — what `add <host>/r/tokens.json` resolves. */
export const TOKENS_ITEM_NAME = 'tokens'

/** The npm package that owns the tokens as source of truth. */
export const TOKENS_DEPENDENCIES = ['@dzup-ui/tokens'] as const

/** A `light`/`dark` map of custom-property name → value (shadcn `cssVars` shape). */
export interface CssVarBuckets {
  /** Applied under `:root` by the CLI — primitives + semantic-light + component. */
  light: Record<string, string>
  /** Applied under `.dark` by the CLI — the semantic-dark overrides. */
  dark: Record<string, string>
}

/** dzup-ui's own dark-scheme selector — what `DzThemeProvider` toggles. */
export const DZUP_DARK_SELECTOR = '[data-theme="dark"]'

/** The cascade layer ADR-19 gives the design tokens. */
export const DZUP_TOKEN_LAYER = '@layer dz-tokens'

/**
 * The shadcn `css` field: an at-rule or selector, to a declaration block or a
 * nested selector map. One level of nesting is all this item uses.
 */
export type RegistryCss = Record<string, Record<string, Record<string, string> | string>>

/** The `tokens.json` registry-item payload. */
export interface TokensRegistryItem {
  $schema: typeof REGISTRY_ITEM_SCHEMA
  name: typeof TOKENS_ITEM_NAME
  type: typeof TOKENS_ITEM_TYPE
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  cssVars: CssVarBuckets
  css: RegistryCss
}

/**
 * Which theme bucket a CSS selector contributes to, or `null` when it is a
 * wrapper (`@layer`, `@media`) or an unrecognised selector. Dark is matched
 * first because the `prefers-color-scheme` block nests a `:root:not(...)` that is
 * still a dark rule.
 */
function bucketFor(selector: string): keyof CssVarBuckets | null {
  if (/\[data-theme="dark"\]/.test(selector) || /:not\(\[data-theme="light"\]\)/.test(selector)) {
    return 'dark'
  }
  if (/:root/.test(selector) || /\[data-theme="light"\]/.test(selector))
    return 'light'
  return null
}

/**
 * Parse the generated `tokens.css` into light/dark `cssVars` buckets. A small
 * brace-depth state machine walks the file line-by-line (the generator emits one
 * declaration per line): each `{` pushes the selector's bucket (or `null` for
 * `@layer`/`@media` wrappers) and each `}` pops, so a declaration is attributed
 * to the nearest enclosing themed selector — correctly handling the
 * `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`
 * nesting. A later declaration for the same token in the same bucket wins
 * (semantic tiers override primitives), mirroring the cascade.
 */
export function parseTokenCssVars(cssText: string): CssVarBuckets {
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  const buckets = { light, dark }

  /** Bucket per open brace level; nearest non-null (from the top) wins. */
  const stack: Array<keyof CssVarBuckets | null> = []

  for (const rawLine of cssText.split('\n')) {
    // Drop trailing `/* … */` inline comments so a selector line still ends `{`.
    const line = rawLine.replace(/\/\*.*?\*\//g, '').trim()
    if (!line)
      continue

    if (line.startsWith('--')) {
      const match = /^--([\w-]+)\s*:\s*(\S.*?);?$/.exec(line)
      const name = match?.[1]
      const value = match?.[2]
      if (name && value !== undefined) {
        const current = [...stack].reverse().find((b): b is keyof CssVarBuckets => b !== null)
        if (current)
          buckets[current][`dz-${name.replace(/^dz-/, '')}`] = value.trim()
      }
      continue
    }

    if (line.endsWith('{')) {
      const selector = line.slice(0, -1).trim()
      stack.push(bucketFor(selector))
    }
    else if (line === '}') {
      stack.pop()
    }
  }

  return buckets
}

/**
 * The `css` block that makes an installed theme live under dzup-ui's own dark
 * mode, inside the layer ADR-19 gives the tokens (A4-F4).
 *
 * Written with the `--` prefix restored: `cssVars` keys are bare names because
 * that is the shape shadcn's CLI expects there, but `css` is literal CSS and a
 * custom property without its prefix is not one.
 */
export function darkSchemeAlias(cssVars: CssVarBuckets): RegistryCss {
  const declarations: Record<string, string> = {}
  for (const [name, value] of Object.entries(cssVars.dark))
    declarations[`--${name}`] = value
  return { [DZUP_TOKEN_LAYER]: { [DZUP_DARK_SELECTOR]: declarations } }
}

/**
 * Build the `tokens.json` registry item from the tokens stylesheet text. Throws
 * on an empty parse (a broken/renamed stylesheet) rather than shipping a theme
 * with no variables — and on an empty DARK parse, because a theme that installs
 * only one colour scheme is the A4-F4 defect in a different shape.
 */
export function toTokensItem(cssText: string): TokensRegistryItem {
  const cssVars = parseTokenCssVars(cssText)
  if (Object.keys(cssVars.light).length === 0) {
    throw new Error('parseTokenCssVars found no light-mode tokens — stylesheet shape changed?')
  }
  if (Object.keys(cssVars.dark).length === 0) {
    throw new Error('parseTokenCssVars found no dark-mode tokens — stylesheet shape changed?')
  }
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: TOKENS_ITEM_NAME,
    type: TOKENS_ITEM_TYPE,
    title: 'dzup-ui design tokens',
    description:
      'The full --dz-* OKLCH design-token set (primitive, semantic and component tiers) as light/dark cssVars — the theme every dzup-ui block and template is built on.',
    dependencies: [...TOKENS_DEPENDENCIES],
    registryDependencies: [],
    cssVars,
    css: darkSchemeAlias(cssVars),
  }
}

/** The tokens item as a lightweight index directory entry (drops `cssVars`). */
export function tokensDirectoryEntry(item: TokensRegistryItem): RegistryDirectoryEntry {
  return { name: item.name, type: item.type, title: item.title, description: item.description }
}
