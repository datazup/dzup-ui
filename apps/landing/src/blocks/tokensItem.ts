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
 * Build the `tokens.json` registry item from the tokens stylesheet text. Throws
 * on an empty parse (a broken/renamed stylesheet) rather than shipping a theme
 * with no variables.
 */
export function toTokensItem(cssText: string): TokensRegistryItem {
  const cssVars = parseTokenCssVars(cssText)
  if (Object.keys(cssVars.light).length === 0) {
    throw new Error('parseTokenCssVars found no light-mode tokens — stylesheet shape changed?')
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
  }
}

/** The tokens item as a lightweight index directory entry (drops `cssVars`). */
export function tokensDirectoryEntry(item: TokensRegistryItem): RegistryDirectoryEntry {
  return { name: item.name, type: item.type, title: item.title, description: item.description }
}
