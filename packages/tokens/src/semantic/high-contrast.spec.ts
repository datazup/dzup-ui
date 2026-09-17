import { describe, expect, it } from 'vitest'

import { DARK_SEMANTIC_TOKENS } from './dark.js'
import {
  GUARANTEED_SYSTEM_PAIRS,
  HIGH_CONTRAST_CEILINGS,
  HIGH_CONTRAST_PAIRS,
  HIGH_CONTRAST_ROLE_RULES,
  HIGH_CONTRAST_SEMANTIC_TOKENS,
  HIGH_CONTRAST_SYSTEM_COLORS,
} from './high-contrast.js'
import { LIGHT_SEMANTIC_TOKENS } from './light.js'

/**
 * TASK-R5-O7. The high-contrast cascade is DERIVED from the light key set, so
 * most of what could go wrong is a role rule that matches the wrong names —
 * which is what these assertions are for, not the plumbing.
 */
describe('high-contrast semantic tokens', () => {
  it('declares exactly the same ABI names as light and dark', () => {
    const light = Object.keys(LIGHT_SEMANTIC_TOKENS).sort()
    const dark = Object.keys(DARK_SEMANTIC_TOKENS).sort()
    const highContrast = Object.keys(HIGH_CONTRAST_SEMANTIC_TOKENS).sort()

    // The requirement is "the same token ids as light/dark" — a third cascade
    // missing a name is a token that silently keeps its light value.
    expect(highContrast).toEqual(light)
    expect(highContrast).toEqual(dark)
    expect(highContrast).toHaveLength(115)
  })

  it('values every token with a system colour, or a declared ceiling literal', () => {
    const literals: string[] = []
    for (const [name, value] of Object.entries(HIGH_CONTRAST_SEMANTIC_TOKENS)) {
      if (HIGH_CONTRAST_SYSTEM_COLORS.includes(value))
        continue
      // A non-keyword is only legitimate when it is the light literal kept
      // deliberately, which is ceiling HC-1.
      expect(value, `${name} must keep its light literal or use a system colour`)
        .toBe(LIGHT_SEMANTIC_TOKENS[name])
      literals.push(name)
    }
    expect(literals.sort()).toEqual(['--dz-overlay-bg', '--dz-scrim'])
  })

  it('never uses a system colour outside the supported set', () => {
    // The role table is the only place a keyword is written. A typo there would
    // otherwise ship as an invalid colour that silently drops the declaration.
    for (const rule of HIGH_CONTRAST_ROLE_RULES) {
      if (rule.value === null)
        continue
      expect(HIGH_CONTRAST_SYSTEM_COLORS, rule.reason).toContain(rule.value)
    }
  })

  it('keeps every background/foreground pair an OS-guaranteed pair', () => {
    // The point of system keywords is the OS promise, and the promise is
    // pair-wise: ButtonText on Canvas is a coincidence of the default desktop
    // theme, not a guarantee. This caught --dz-accent-foreground.
    for (const { background, foreground } of HIGH_CONTRAST_PAIRS) {
      const bg = HIGH_CONTRAST_SEMANTIC_TOKENS[background]
      const fg = HIGH_CONTRAST_SEMANTIC_TOKENS[foreground]
      expect(bg, `${background} is not declared`).toBeDefined()
      expect(fg, `${foreground} is not declared`).toBeDefined()
      expect(
        GUARANTEED_SYSTEM_PAIRS[bg as string],
        `${foreground} (${fg}) on ${background} (${bg}) is not an OS-guaranteed pair`,
      ).toBe(fg)
    }
  })

  it('reserves GrayText for the WCAG-exempt and platform-greyed roles only', () => {
    // Ceiling HC-4. GrayText is ~3.95:1 on a white Canvas; in a contrast theme
    // it must never land on body text.
    const grey = Object.entries(HIGH_CONTRAST_SEMANTIC_TOKENS)
      .filter(([, value]) => value === 'GrayText')
      .map(([name]) => name)
      .sort()
    expect(grey).toEqual([
      '--dz-codeblock-line-number',
      '--dz-disabled-foreground',
      '--dz-input-placeholder',
    ])
    expect(HIGH_CONTRAST_SEMANTIC_TOKENS['--dz-muted-foreground']).toBe('CanvasText')
  })

  it('collapses the categorical roles recorded in ceiling HC-2', () => {
    const categorical = Object.keys(HIGH_CONTRAST_SEMANTIC_TOKENS).filter(
      name => /^--dz-(?:chart-|status-|progress-)/.test(name),
    )
    expect(categorical).toHaveLength(18)
    for (const name of categorical) {
      expect(HIGH_CONTRAST_SEMANTIC_TOKENS[name], name).toBe('CanvasText')
    }
  })

  it('leaves a token with no role rule unmatched, so the build throws', () => {
    // The safety property this module exists for: a NEW semantic token must not
    // silently inherit a role. Proving the fall-through is reachable is the
    // only way to know the throw in buildHighContrastTokens() can ever fire —
    // a rule table ending in a catch-all would pass every other test here.
    const invented = '--dz-brand-new-role-nobody-mapped'
    const matched = HIGH_CONTRAST_ROLE_RULES.find(rule => rule.pattern.test(invented))
    expect(matched).toBeUndefined()
  })

  it('documents every ceiling it claims', () => {
    expect(HIGH_CONTRAST_CEILINGS.map(ceiling => ceiling.id)).toEqual([
      'HC-1',
      'HC-2',
      'HC-3',
      'HC-4',
      'HC-5',
      'HC-6',
    ])
    for (const ceiling of HIGH_CONTRAST_CEILINGS) {
      expect(ceiling.note.length, ceiling.id).toBeGreaterThan(80)
    }
  })
})
