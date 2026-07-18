/**
 * The Storybook manager's brand palette must still match the design tokens
 * (TASK-FREE-17).
 *
 * `apps/storybook/.storybook/manager.ts` cannot read `--dz-*`: the manager chrome
 * renders outside the preview iframe, so its colours are hex literals copied from
 * the token ramp. The copies are necessary. Nothing enforced that they were still
 * CORRECT, and the instruction to keep them in sync lived only in a comment — so
 * `neutral.600` sat at `#717171` (a flat grey) against a token that resolves to
 * `#585b60` (the hue-260 tinted grey), as the manager's light-mode `barTextColor`,
 * for months.
 *
 * This recomputes every literal from `packages/tokens/dist/tokens.css` and fails
 * on a mismatch, so moving the ramp now fails here instead of silently leaving the
 * chrome behind.
 *
 * The comparison is EXACT, not tolerant: the OKLCH → sRGB conversion reproduces
 * the ramp's hexes to the byte, so a tolerance would only hide real drift.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PAPER, TOKEN_BACKED_COLORS } from '../../../../apps/storybook/.storybook/brandPalette.ts'
import { oklchToHex } from './oklch-contrast.ts'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const TOKENS_CSS = resolve(REPO_ROOT, 'packages', 'tokens', 'dist', 'tokens.css')

/**
 * Read a custom property from the token CSS. Scans the PRIMITIVE ramp only — the
 * `--dz-colors-*` block is theme-independent, unlike the semantic tokens, which
 * are redeclared under `[data-theme="dark"]` and so have no single value.
 */
function tokenValue(css: string, name: string): string | undefined {
  const match = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))
  return match?.[1]?.trim()
}

describe('storybook manager brand palette', () => {
  const css = readFileSync(TOKENS_CSS, 'utf8')

  it('reads the generated token stylesheet', () => {
    expect(css).toContain('--dz-colors-primary-500')
  })

  it.each(TOKEN_BACKED_COLORS)('$name mirrors $token', ({ hex, token }) => {
    const value = tokenValue(css, token)
    expect(value, `${token} is not defined in tokens.css`).toBeDefined()

    const expected = oklchToHex(value!)
    expect(expected, `${token} = "${value}" is not a parseable oklch() value`).not.toBeNull()

    expect(hex).toBe(expected)
  })

  it('only claims tokens that exist', () => {
    const missing = TOKEN_BACKED_COLORS.filter(c => tokenValue(css, c.token) === undefined)
    expect(missing.map(c => c.token)).toEqual([])
  })

  it('keeps every literal lowercase and full-length, so comparison is textual', () => {
    for (const { name, hex } of TOKEN_BACKED_COLORS)
      expect(hex, `${name} must be a lowercase #rrggbb literal`).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('exempts only pure white, which has no token behind it', () => {
    // `#ffffff` is the manager's light-mode paper and the logo badge's ink. The
    // nearest token (`--dz-background`) is theme-scoped and goes near-black in
    // dark mode, so it is the wrong source for both. Asserted here so the
    // exemption stays a deliberate, visible decision rather than an oversight.
    expect(PAPER).toBe('#ffffff')
    expect(TOKEN_BACKED_COLORS.map(c => c.hex)).not.toContain(PAPER)
  })
})
