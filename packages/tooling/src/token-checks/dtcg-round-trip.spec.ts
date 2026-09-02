/**
 * Tests for the DTCG ⇄ CSS round-trip gate (TASK-N2-T1).
 *
 * The gate's own reading machinery is what these cover: the CSS scanner, the
 * cascade model, and the independent DTCG reader. They matter because the gate
 * is the only thing standing between a published interchange file and a
 * consumer building the wrong system — a reader that silently skipped a group,
 * or a CSS scanner that lost a declaration block, would make the gate green by
 * comparing nothing.
 *
 * The last test runs the real gate over the real package. That is the
 * assertion with teeth; the rest exist so a failure says *which part* broke.
 */

import { describe, expect, it } from 'vitest'

import {
  declarationsFromTokenMaps,
  parseCssDeclarations,
  readDtcgDocument,
  runRoundTrip,
} from './dtcg-round-trip.js'

const FIXTURE_CSS = `
/* a comment { with braces } and a --dz-decoy: value; inside */
@layer dz-tokens {

:root {
  --dz-colors-primary-500: oklch(0.550 0.2200 260.0);
  --dz-spacing-1_5: 0.375rem;
}

:root, [data-theme="light"] {
  --dz-primary: var(--dz-colors-primary-500);
}

[data-theme="dark"] {
  --dz-primary: var(--dz-colors-primary-400);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --dz-primary: var(--dz-colors-primary-400);
  }
}

:root {
  --dz-button-radius: var(--dz-radius-md);
}

} /* end @layer */

.not-a-token { color: red; }
`

describe('css scanner', () => {
  const declarations = parseCssDeclarations(FIXTURE_CSS)

  it('collects only custom properties, in source order', () => {
    expect(declarations.map(d => d.name)).toEqual([
      '--dz-colors-primary-500',
      '--dz-spacing-1_5',
      '--dz-primary',
      '--dz-primary',
      '--dz-primary',
      '--dz-button-radius',
    ])
    expect(declarations.map(d => d.order)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('ignores a decoy inside a comment', () => {
    expect(declarations.some(d => d.name === '--dz-decoy')).toBe(false)
  })

  it('records the selector each declaration sits under', () => {
    expect(declarations[0]?.selector).toBe(':root')
    expect(declarations[2]?.selector).toBe(':root, [data-theme="light"]')
    expect(declarations[3]?.selector).toBe('[data-theme="dark"]')
    expect(declarations[4]?.selector).toBe(':root:not([data-theme="light"])')
    // The component block is a SECOND `:root` — the collision that lets the
    // component tier out-cascade the dark theme.
    expect(declarations[5]?.selector).toBe(':root')
  })

  it('records the at-rule context, so the OS-dark block is distinguishable', () => {
    expect(declarations[3]?.atRules).toEqual(['@layer dz-tokens'])
    expect(declarations[4]?.atRules).toEqual(['@layer dz-tokens', '@media (prefers-color-scheme: dark)'])
  })
})

describe('declaration blocks reconstructed from the token maps', () => {
  const declarations = declarationsFromTokenMaps()

  it('emits the five blocks generate.ts writes, in that order', () => {
    const blocks: string[] = []
    let previous = ''
    for (const declaration of declarations) {
      const key = `${declaration.atRules.join('|')}::${declaration.selector}`
      if (key !== previous)
        blocks.push(key)
      previous = key
    }
    expect(blocks).toEqual([
      '@layer dz-tokens::' + ':root',
      '@layer dz-tokens::' + ':root, [data-theme="light"]',
      '@layer dz-tokens::' + '[data-theme="dark"]',
      '@layer dz-tokens|@media (prefers-color-scheme: dark)::' + ':root:not([data-theme="light"])',
      '@layer dz-tokens::' + ':root',
    ])
  })

  it('every declaration is a --dz-* custom property', () => {
    expect(declarations.length).toBeGreaterThan(600)
    expect(declarations.every(d => d.name.startsWith('--dz-'))).toBe(true)
  })
})

describe('dtcg reader', () => {
  it('inherits $type from the nearest ancestor group that declares one', () => {
    const { tokens, issues } = readDtcgDocument({
      colors: {
        $type: 'color',
        brand: { $value: { colorSpace: 'oklch', components: [0.5, 0.1, 200] } },
      },
    })
    expect(issues).toEqual([])
    expect(tokens.get('colors.brand')?.type).toBe('color')
  })

  it('reports a token whose $type cannot be resolved instead of guessing one', () => {
    const { tokens, issues } = readDtcgDocument({ loose: { $value: 12 } })
    expect(tokens.size).toBe(0)
    expect(issues).toHaveLength(1)
    expect(issues[0]?.check).toBe('dtcg-type')
    expect(issues[0]?.message).toContain('no $type')
  })

  it('rejects names the Format module forbids', () => {
    const { issues } = readDtcgDocument({
      '$bogus': { $type: 'number', $value: 1 },
      'has.dot': { $type: 'number', $value: 1 },
      'has{brace}': { $type: 'number', $value: 1 },
    })
    expect(issues.map(issue => issue.check)).toEqual(['dtcg-name', 'dtcg-name', 'dtcg-name'])
  })

  it('reads the dzup extension payload a token carries', () => {
    const { tokens } = readDtcgDocument({
      component: {
        card: {
          shadow: {
            $type: 'shadow',
            $value: '{primitive.shadow.md}',
            $deprecated: 'gone next major',
            $extensions: {
              'com.dzup': {
                cssVariable: '--dz-card-shadow',
                cssValue: 'var(--dz-shadow-md)',
                themeVarying: true,
              },
            },
          },
        },
      },
    })
    const token = tokens.get('component.card.shadow')
    expect(token?.cssVariable).toBe('--dz-card-shadow')
    expect(token?.declaredCssValue).toBe('var(--dz-shadow-md)')
    expect(token?.themeVarying).toBe(true)
    expect(token?.deprecated).toBe('gone next major')
  })

  it('treats a group as a group and does not mistake $description for a token', () => {
    const { tokens } = readDtcgDocument({
      primitive: {
        $description: 'a group, not a token',
        radius: { $type: 'dimension', md: { $value: { value: 0.5, unit: 'rem' } } },
      },
    })
    expect([...tokens.keys()]).toEqual(['primitive.radius.md'])
  })
})

describe('the gate over the real package', () => {
  const result = runRoundTrip()

  it('passes — every exported token resolves to the value tokens.css ships', () => {
    // A failure here prints the offending symbols; see the CLI output.
    expect(result.issues.map(issue => `${issue.check} ${issue.symbol}`)).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('actually compared something in both theme cascades', () => {
    // Guards the failure mode where the gate is green because it looked at
    // nothing. Both cascades must cover every declared custom property.
    expect(result.stats.cssNamesLight).toBeGreaterThan(600)
    expect(result.stats.cssNamesDark).toBe(result.stats.cssNamesLight)
    expect(result.stats.comparedLight).toBeGreaterThan(600)
    expect(result.stats.comparedDark).toBeGreaterThan(600)
    expect(result.stats.aliasesResolved).toBeGreaterThan(300)
    expect(result.stats.dtcgTokens).toBeGreaterThan(700)
  })

  it('covers every declared custom property as either a token or an untyped record', () => {
    // comparedLight counts typed tokens; the remainder must be accounted for by
    // the untyped set, never by silence.
    expect(result.stats.comparedLight).toBeLessThanOrEqual(result.stats.cssNamesLight)
    expect(result.stats.cssNamesLight - result.stats.comparedLight).toBeLessThanOrEqual(
      result.stats.untyped,
    )
  })
})
