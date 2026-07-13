/**
 * Tests for the DESIGN.md emitter (design-emit.ts).
 *
 * The emitter is a pure projection of the token maps, so these tests use small
 * hand-built fixtures for deterministic assertions plus one round-trip against
 * the real token maps to guard against missing placeholders / thrown errors.
 */

import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  BUTTON_TOKENS,
  CARD_TOKENS,
} from './component/index.js'
import { catalogCounts } from './design-md.js'
import {
  buildBreakpoints,
  buildCatalog,
  buildColors,
  buildComponents,
  buildLayers,
  buildMotion,
  buildOverview,
  buildSpacing,
  COMPONENT_COUNT_RULE,
  CURATED_COLOR_ROLES,
  CURATED_COMPONENT_FAMILIES,
  type DesignMdInput,
  DOCUMENTED_COUNT_RULE,
  emitDesignMd,
  PLACEHOLDERS,
  resolveColor,
} from './design-emit.js'
import { BREAKPOINTS } from './primitives/breakpoints.js'
import { generateColorCssVars } from './primitives/colors.js'
import { DURATIONS, EASINGS } from './primitives/transitions.js'
import { Z_INDEX_SCALE } from './primitives/z-index.js'
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
} from './primitives/typography.js'
import { RADIUS_SCALE } from './primitives/radius.js'
import { SHADOW_SCALE, SHADOW_SCALE_DARK } from './primitives/shadows.js'
import { SPACING_SCALE } from './primitives/spacing.js'
import { DARK_SEMANTIC_TOKENS } from './semantic/dark.js'
import { LIGHT_SEMANTIC_TOKENS } from './semantic/light.js'

// --------------------------------------------------------------------------
// Fixtures
// --------------------------------------------------------------------------

const narrativeWithAllPlaceholders = Object.values(PLACEHOLDERS).join('\n\n')

function makeInput(overrides: Partial<DesignMdInput> = {}): DesignMdInput {
  return {
    name: 'test-ui',
    packageScope: '@test-ui',
    description: 'Desc with "quotes" and \\ backslash',
    narrative: narrativeWithAllPlaceholders,
    primitiveColors: {
      '--dz-colors-primary-500': 'oklch(0.55 0.22 260)',
      '--dz-colors-neutral-100': 'oklch(0.93 0.002 260)',
      '--dz-colors-neutral-900': 'oklch(0.23 0.005 260)',
    },
    lightSemantic: {
      '--dz-background': 'var(--dz-colors-neutral-100)',
      '--dz-foreground': 'var(--dz-colors-neutral-900)',
      '--dz-primary': 'var(--dz-colors-primary-500)',
      // chains through another semantic role before hitting a primitive
      '--dz-accent': 'var(--dz-background)',
      '--dz-surface': 'oklch(1 0 0)',
    },
    darkSemantic: {
      '--dz-background': 'var(--dz-colors-neutral-900)',
      '--dz-foreground': 'var(--dz-colors-neutral-100)',
      '--dz-primary': 'var(--dz-colors-primary-500)',
      '--dz-accent': 'var(--dz-background)',
      '--dz-surface': 'oklch(0.23 0.005 260)',
    },
    fontFamilies: { sans: 'Inter, sans-serif' },
    fontSizes: { xs: '0.75rem', base: '1rem' },
    fontWeights: { normal: '400', bold: '700' },
    lineHeights: { normal: '1.5' },
    letterSpacings: { normal: '0em' },
    spacing: { 0: '0px', 2: '0.5rem', 0.5: '0.125rem', 1: '0.25rem' },
    radius: { sm: '0.25rem', full: '9999px' },
    shadows: { none: 'none', xs: '0 1px 2px oklch(0 0 0 / 0.06)' },
    shadowsDark: { none: 'none', xs: '0 1px 2px oklch(0 0 0 / 0.20)' },
    durations: { fast: '150ms', slow: '300ms' },
    easings: { 'default': 'cubic-bezier(0.4, 0, 0.2, 1)', 'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)' },
    transitions: { fast: 'var(--dz-duration-fast) var(--dz-ease-default)' },
    // deliberately unsorted — the builders must order by value, not key order
    zIndex: { modal: '1050', base: '0', dropdown: '1000' },
    breakpoints: { lg: '1024px', sm: '640px' },
    componentTokens: {
      button: { '--dz-button-radius': 'a', '--dz-button-height': 'b' },
      card: { '--dz-card-radius': 'c' },
    },
    catalog: { components: 205, documented: 139, blocks: 87, templates: 44 },
    ...overrides,
  }
}

// --------------------------------------------------------------------------
// resolveColor
// --------------------------------------------------------------------------

describe('resolveColor', () => {
  const primitives = {
    '--dz-colors-primary-500': 'oklch(0.55 0.22 260)',
    '--dz-colors-neutral-100': 'oklch(0.93 0.002 260)',
  }

  it('resolves a primitive var reference to its concrete value', () => {
    expect(resolveColor('var(--dz-colors-primary-500)', { primitives, semantic: {} }))
      .toBe('oklch(0.55 0.22 260)')
  })

  it('follows a semantic → semantic → primitive chain', () => {
    const semantic = {
      '--dz-background': 'var(--dz-colors-neutral-100)',
      '--dz-accent': 'var(--dz-background)',
    }
    expect(resolveColor('var(--dz-accent)', { primitives, semantic }))
      .toBe('oklch(0.93 0.002 260)')
  })

  it('passes literal oklch values through unchanged', () => {
    expect(resolveColor('oklch(1 0 0)', { primitives, semantic: {} })).toBe('oklch(1 0 0)')
  })

  it('tolerates whitespace inside var()', () => {
    expect(resolveColor('var( --dz-colors-primary-500 )', { primitives, semantic: {} }))
      .toBe('oklch(0.55 0.22 260)')
  })

  it('returns the reference verbatim when unresolvable', () => {
    expect(resolveColor('var(--dz-nope)', { primitives: {}, semantic: {} }))
      .toBe('var(--dz-nope)')
  })

  it('guards against reference cycles without throwing', () => {
    const semantic = {
      '--dz-a': 'var(--dz-b)',
      '--dz-b': 'var(--dz-a)',
    }
    const out = resolveColor('var(--dz-a)', { primitives: {}, semantic })
    expect(out).toMatch(/^var\(--dz-[ab]\)$/)
  })
})

// --------------------------------------------------------------------------
// Section builders
// --------------------------------------------------------------------------

describe('buildColors', () => {
  it('emits resolved light + dark OKLCH for present roles', () => {
    const table = buildColors(makeInput())
    expect(table).toContain('`--dz-primary`')
    expect(table).toContain('`oklch(0.55 0.22 260)`')
    // accent chains background → neutral-100 in light, neutral-900 in dark
    expect(table).toContain('`oklch(0.93 0.002 260)`')
    expect(table).toContain('`oklch(0.23 0.005 260)`')
  })

  it('skips roles that are absent from the semantic map', () => {
    const table = buildColors(makeInput())
    // `info` is a curated role but not in the fixture — must not appear
    expect(table).not.toContain('`--dz-info`')
  })

  it('falls back to the light value when a role has no dark override', () => {
    const input = makeInput({
      darkSemantic: { '--dz-primary': 'var(--dz-colors-primary-500)' },
    })
    const table = buildColors(input)
    // background exists in light only → dark cell reuses the light value
    expect(table).toContain('`--dz-background`')
  })
})

describe('buildSpacing', () => {
  it('sorts steps numerically (fractional steps interleaved)', () => {
    const out = buildSpacing(makeInput())
    const i0 = out.indexOf('`0`')
    const iHalf = out.indexOf('`0.5`')
    const i1 = out.indexOf('`1`')
    const i2 = out.indexOf('`2`')
    expect(i0).toBeGreaterThanOrEqual(0)
    expect(i0).toBeLessThan(iHalf)
    expect(iHalf).toBeLessThan(i1)
    expect(i1).toBeLessThan(i2)
  })
})

describe('buildOverview', () => {
  it('counts palettes, semantic roles and component families', () => {
    const out = buildOverview(makeInput())
    expect(out).toContain('**Color palettes:** 2')
    expect(out).toContain('**Semantic roles:** 5')
    // family count is the fixed curated list; token count sums the fixture maps
    expect(out).toContain(`**Component token families:** ${String(CURATED_COMPONENT_FAMILIES.length)}`)
    expect(out).toContain('(3 tokens)')
  })

  it('counts the motion, layer and breakpoint families from their sources', () => {
    const out = buildOverview(makeInput())
    expect(out).toContain('**Motion:** 2 durations · 2 easing curves')
    expect(out).toContain('**layers:** 3')
    expect(out).toContain('**breakpoints:** 2')
  })
})

describe('buildCatalog', () => {
  it('renders the glob-derived counts, never a literal', () => {
    const out = buildCatalog(makeInput({ catalog: { components: 3, documented: 2, blocks: 2, templates: 1 } }))
    expect(out).toBe('3 components (2 with a dedicated docs page), 2 blocks, 1 full-page templates')
  })

  it('tracks the catalog input, so a new component changes the published number', () => {
    const before = buildCatalog(makeInput({ catalog: { components: 205, documented: 139, blocks: 87, templates: 44 } }))
    const after = buildCatalog(makeInput({ catalog: { components: 206, documented: 140, blocks: 87, templates: 44 } }))
    expect(before).toContain('205 components (139 with')
    expect(after).toContain('206 components (140 with')
  })

  it('never emits a bare number — every count carries its rule', () => {
    const overview = buildOverview(makeInput())
    expect(overview).toContain(COMPONENT_COUNT_RULE)
    expect(overview).toContain(DOCUMENTED_COUNT_RULE)
  })
})

describe('catalogCounts (filesystem-derived)', () => {
  it('counts the real .vue files on disk', () => {
    const counts = catalogCounts()
    expect(counts.components).toBeGreaterThan(150)
    expect(counts.blocks).toBeGreaterThan(50)
    expect(counts.templates).toBeGreaterThan(20)
  })

  it('agrees with an independent walk of packages/core/src/components', () => {
    const dir = resolve(import.meta.dirname, '..', '..', 'core', 'src', 'components')
    const actual = readdirSync(dir, { recursive: true, encoding: 'utf-8' }).filter(f =>
      f.endsWith('.vue'),
    ).length
    expect(catalogCounts().components).toBe(actual)
  })

  it('counts fewer documented components than exported .vue files', () => {
    // Sub-parts are documented through their parent, so `documented` must be a
    // strict subset. If these ever converge, one of the two rules broke.
    const { components, documented } = catalogCounts()
    expect(documented).toBeGreaterThan(0)
    expect(documented).toBeLessThan(components)
  })
})

describe('buildMotion', () => {
  it('renders every duration and easing from the real token source', () => {
    const out = buildMotion(makeInput({ durations: DURATIONS, easings: EASINGS }))
    for (const [step, value] of Object.entries(DURATIONS)) {
      expect(out, `duration \`${step}\` is emitted`).toContain(`\`--dz-duration-${step}\``)
      expect(out).toContain(value)
    }
    for (const [step, value] of Object.entries(EASINGS)) {
      expect(out, `easing \`${step}\` is emitted`).toContain(`\`--dz-ease-${step}\``)
      expect(out).toContain(`\`${value}\``)
    }
  })

  it('derives the advertised duration range from the tokens, not from prose', () => {
    const out = buildMotion(makeInput({ durations: DURATIONS, easings: EASINGS }))
    // 150ms (fast) → 500ms (slower). The narrative used to claim "150–300 ms".
    expect(out).toContain('**150–500 ms**')
  })

  it('throws when an easing has no documented usage rule', () => {
    const input = makeInput({ easings: { ...EASINGS, spring: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' } })
    expect(() => buildMotion(input)).toThrow(/no usage rule for easing `spring`/)
  })
})

describe('buildLayers', () => {
  it('renders every layer from the real token source', () => {
    const out = buildLayers(makeInput({ zIndex: Z_INDEX_SCALE }))
    for (const [step, value] of Object.entries(Z_INDEX_SCALE)) {
      expect(out, `layer \`${step}\` is emitted`).toContain(`\`--dz-z-${step}\``)
      expect(out).toContain(`| ${value} |`)
    }
  })

  it('orders layers lowest → highest by value, not by key order', () => {
    const out = buildLayers(makeInput())
    expect(out.indexOf('--dz-z-base')).toBeLessThan(out.indexOf('--dz-z-dropdown'))
    expect(out.indexOf('--dz-z-dropdown')).toBeLessThan(out.indexOf('--dz-z-modal'))
  })

  it('throws when a layer has no documented occupant', () => {
    const input = makeInput({ zIndex: { ...Z_INDEX_SCALE, 'command-palette': '1090' } })
    expect(() => buildLayers(input)).toThrow(/no usage entry for layer `command-palette`/)
  })
})

describe('buildBreakpoints', () => {
  it('renders every breakpoint from the real token source, ascending', () => {
    const out = buildBreakpoints(makeInput({ breakpoints: BREAKPOINTS }))
    for (const [step, value] of Object.entries(BREAKPOINTS)) {
      expect(out, `breakpoint \`${step}\` is emitted`).toContain(`\`--dz-breakpoint-${step}\``)
      expect(out).toContain(`\`${value}\``)
    }
    expect(out.indexOf('breakpoint-sm')).toBeLessThan(out.indexOf('breakpoint-2xl'))
  })

  it('states the mobile-first authoring rule', () => {
    const out = buildBreakpoints(makeInput({ breakpoints: BREAKPOINTS }))
    expect(out).toContain('Mobile-first')
    expect(out).toContain('min-width')
  })
})

describe('buildComponents', () => {
  it('reports the real token count for each curated family', () => {
    const input = makeInput({
      componentTokens: { button: BUTTON_TOKENS, card: CARD_TOKENS },
    })
    const out = buildComponents(input)
    expect(out).toContain(`| ${String(Object.keys(BUTTON_TOKENS).length)} |`)
    expect(out).toContain(`| ${String(Object.keys(CARD_TOKENS).length)} |`)
  })

  it('renders a row for every curated family (0 when tokens absent)', () => {
    const out = buildComponents(makeInput({ componentTokens: {} }))
    for (const { family } of CURATED_COMPONENT_FAMILIES) {
      expect(out).toContain(`\`--dz-${family}-*\``)
    }
  })
})

// --------------------------------------------------------------------------
// emitDesignMd
// --------------------------------------------------------------------------

describe('emitDesignMd', () => {
  it('produces front matter, banner, and replaces every placeholder', () => {
    const out = emitDesignMd(makeInput())
    expect(out.startsWith('---\n')).toBe(true)
    expect(out).toContain('name: test-ui')
    expect(out).toContain('DO NOT EDIT MANUALLY')
    // no placeholder survives into the final document
    expect(out).not.toContain('<!-- dz:')
  })

  it('quotes and escapes YAML scalars safely', () => {
    const out = emitDesignMd(makeInput())
    expect(out).toContain('description: "Desc with \\"quotes\\" and \\\\ backslash"')
  })

  it('throws when the narrative is missing a placeholder', () => {
    const input = makeInput({ narrative: '# Title\nno placeholders here' })
    expect(() => emitDesignMd(input)).toThrow(/missing the <!-- dz:overview -->/)
  })

  it('round-trips against the real token maps with no leftover placeholders', () => {
    const input: DesignMdInput = {
      name: 'dzup-ui',
      packageScope: '@dzup-ui',
      description: 'real',
      narrative: narrativeWithAllPlaceholders,
      primitiveColors: generateColorCssVars(),
      lightSemantic: LIGHT_SEMANTIC_TOKENS,
      darkSemantic: DARK_SEMANTIC_TOKENS,
      fontFamilies: FONT_FAMILIES,
      fontSizes: FONT_SIZES,
      fontWeights: FONT_WEIGHTS,
      lineHeights: LINE_HEIGHTS,
      letterSpacings: LETTER_SPACINGS,
      spacing: SPACING_SCALE as unknown as Record<string, string>,
      radius: RADIUS_SCALE,
      shadows: SHADOW_SCALE,
      shadowsDark: SHADOW_SCALE_DARK,
      durations: DURATIONS,
      easings: EASINGS,
      transitions: { fast: 'var(--dz-duration-fast) var(--dz-ease-default)' },
      zIndex: Z_INDEX_SCALE,
      breakpoints: BREAKPOINTS,
      componentTokens: { button: BUTTON_TOKENS, card: CARD_TOKENS },
      catalog: catalogCounts(),
    }
    const out = emitDesignMd(input)
    expect(out).not.toContain('<!-- dz:')
    // every documented color role that exists resolves to a concrete value
    // (no unresolved var() leaks into the Colors table)
    const colorsSection = out.slice(out.indexOf('| Role |'))
    for (const { role } of CURATED_COLOR_ROLES) {
      if (LIGHT_SEMANTIC_TOKENS[`--dz-${role}`] !== undefined) {
        expect(colorsSection).toContain(`\`--dz-${role}\``)
      }
    }
    expect(colorsSection).not.toMatch(/\| `var\(/)
  })
})
