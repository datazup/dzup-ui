/**
 * Tokens registry-item guard. Exercises the `tokens.css` → `cssVars` parser over
 * a fixture shaped like the real generated stylesheet — `@layer` wrapper, a
 * primitive `:root`, a `:root, [data-theme="light"]` semantic block, an explicit
 * `[data-theme="dark"]` block, and the nested
 * `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`
 * — so the light/dark attribution (and its brace-depth nesting) can't regress.
 */

import { describe, expect, it } from 'vitest'
import { REGISTRY_ITEM_SCHEMA } from './registryItem.ts'
import {
  DZUP_DARK_SELECTOR,
  DZUP_TOKEN_LAYER,
  parseTokenCssVars,
  TOKENS_ITEM_NAME,
  TOKENS_ITEM_TYPE,
  toTokensItem,
} from './tokensItem.ts'

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
    expect(Object.values(vars.light).every(v => !v.includes('/*'))).toBe(true)
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

  it('throws on a stylesheet that yields no dark tokens', () => {
    // A theme that installs one colour scheme is A4-F4 wearing another hat.
    // The parser is line-oriented (the generator emits one declaration per
    // line), so a light-only stylesheet has to be shaped like a real one.
    expect(() => toTokensItem(':root {\n  --dz-background: #ffffff;\n}\n'))
      .toThrow(/no dark-mode tokens/)
  })

  // ── A4-F4 (TASK-R1-O5) ────────────────────────────────────────────────────
  describe('the dark-scheme alias', () => {
    const layer = item.css[DZUP_TOKEN_LAYER] as Record<string, Record<string, string>>

    it('re-declares the dark scheme under dzup-ui\'s own selector', () => {
      // shadcn writes cssVars.dark under `.dark`; DzThemeProvider toggles
      // data-theme. Without this the install is inert under the library's own
      // dark mode — the whole of A4-F4.
      expect(layer[DZUP_DARK_SELECTOR]!['--dz-background']).toBe('oklch(0.15 0 0)')
      expect(layer[DZUP_DARK_SELECTOR]!['--dz-foreground']).toBe('#f8fafc')
    })

    it('restores the `--` prefix `cssVars` drops', () => {
      // `cssVars` keys are bare by shadcn convention; `css` is literal CSS, and
      // a custom property without its prefix is not one.
      expect(Object.keys(layer[DZUP_DARK_SELECTOR]!).every(k => k.startsWith('--'))).toBe(true)
      expect(Object.keys(item.cssVars.dark).every(k => !k.startsWith('--'))).toBe(true)
    })

    it('wraps the alias in the cascade layer ADR-19 gives the tokens', () => {
      expect(Object.keys(item.css)).toEqual([DZUP_TOKEN_LAYER])
      expect(DZUP_TOKEN_LAYER).toBe('@layer dz-tokens')
    })

    it('does not duplicate the light scheme', () => {
      // shadcn's `:root` write is already dzup-ui's light selector; duplicating
      // 673 tokens would add ~30 kB to every install and change nothing.
      expect(JSON.stringify(item.css)).not.toContain('data-theme="light"')
    })
  })
})
