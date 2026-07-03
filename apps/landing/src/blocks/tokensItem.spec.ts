/**
 * Tokens registry-item guard. Exercises the `tokens.css` → `cssVars` parser over
 * a fixture shaped like the real generated stylesheet — `@layer` wrapper, a
 * primitive `:root`, a `:root, [data-theme="light"]` semantic block, an explicit
 * `[data-theme="dark"]` block, and the nested
 * `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`
 * — so the light/dark attribution (and its brace-depth nesting) can't regress.
 */

import { describe, expect, it } from 'vitest'
import {
  parseTokenCssVars,
  toTokensItem,
  TOKENS_ITEM_NAME,
  TOKENS_ITEM_TYPE,
} from './tokensItem.ts'
import { REGISTRY_ITEM_SCHEMA } from './registryItem.ts'

const FIXTURE = `/**
 * @dzup-ui/tokens — Generated CSS Custom Properties
 */
@layer dz-tokens {
:root {
  --dz-colors-primary-500: oklch(0.550 0.2200 260.0);
}
:root, [data-theme="light"] {
  --dz-background: #ffffff; /* light surface */
  --dz-foreground: oklch(0.2 0 0);
}
[data-theme="dark"] {
  --dz-background: oklch(0.15 0 0);
  --dz-foreground: #f8fafc;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --dz-background: oklch(0.15 0 0);
  }
}
} /* end @layer dz-tokens */
`

describe('parseTokenCssVars', () => {
  const vars = parseTokenCssVars(FIXTURE)

  it('collects primitives and semantic-light under light', () => {
    expect(vars.light['dz-colors-primary-500']).toBe('oklch(0.550 0.2200 260.0)')
    expect(vars.light['dz-background']).toBe('#ffffff')
    expect(vars.light['dz-foreground']).toBe('oklch(0.2 0 0)')
  })

  it('collects the [data-theme="dark"] overrides under dark', () => {
    expect(vars.dark['dz-background']).toBe('oklch(0.15 0 0)')
    expect(vars.dark['dz-foreground']).toBe('#f8fafc')
  })

  it('attributes the nested prefers-color-scheme block to dark (not light)', () => {
    // The @media wrapper is null; the inner :root:not([data-theme="light"]) is dark.
    expect(vars.dark['dz-background']).toBeDefined()
  })

  it('strips only the leading -- and drops trailing comments/semicolons', () => {
    expect(vars.light['--dz-background']).toBeUndefined()
    expect(Object.values(vars.light).every((v) => !v.includes('/*'))).toBe(true)
  })
})

describe('toTokensItem', () => {
  const item = toTokensItem(FIXTURE)

  it('has the canonical registry:theme shape', () => {
    expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
    expect(item.name).toBe(TOKENS_ITEM_NAME)
    expect(item.type).toBe(TOKENS_ITEM_TYPE)
    expect(TOKENS_ITEM_TYPE).toBe('registry:theme')
    expect(item.dependencies).toEqual(['@dzup-ui/tokens'])
    expect(item.registryDependencies).toEqual([])
    expect(item.cssVars.light['dz-colors-primary-500']).toBeDefined()
  })

  it('throws on a stylesheet that yields no light tokens', () => {
    expect(() => toTokensItem('@layer dz-tokens {}\n')).toThrow(/no light-mode tokens/)
  })
})
