import { describe, expect, it } from 'vitest'
import {
  anatomyBlock,
  parseAnatomySource,
  readAnatomyFor,
  referencedComponentTokens,
  stripComments,
} from './anatomy-source.ts'
import { ROOT } from './generate-ownership-manifest.ts'

/**
 * Specs for the anatomy source reader (TASK-OSS-P3-02).
 *
 * The parser is the one part of this packet that could be quietly wrong: it
 * reads a TypeScript literal without a TypeScript parser, so every shape a
 * component author will plausibly write is pinned here, and so is every shape
 * it must refuse rather than half-read.
 */

const MINIMAL = `
export const anatomy = {
  parts: ['root'],
  states: [],
  componentTokens: [],
  riskTier: 'C',
} as const satisfies ComponentAnatomy
`

function parse(source: string): ReturnType<typeof parseAnatomySource> {
  return parseAnatomySource(source, 'Dz.anatomy.ts')
}

describe('stripComments', () => {
  it('removes a line comment', () => {
    expect(stripComments('a // note\nb')).toBe('a \nb')
  })

  it('removes a block comment, including a JSDoc block', () => {
    expect(stripComments('/** doc */\nvalue').trim()).toBe('value')
  })

  it('leaves a URL in a string alone', () => {
    // `https://…` is the classic false positive for a naive line-comment strip.
    expect(stripComments(`const a = 'https://example.com'`)).toContain('https://example.com')
  })
})

describe('anatomyBlock', () => {
  it('returns the object body', () => {
    expect(anatomyBlock(MINIMAL)).toContain(`parts: ['root']`)
  })

  it('matches braces rather than stopping at the first one', () => {
    const source = `export const anatomy = { parts: ['root'], meta: { a: 1 }, riskTier: 'C' } as const`
    expect(anatomyBlock(source)).toContain('riskTier')
  })

  it('stops at the end of the anatomy, not the end of the file', () => {
    const source = `${MINIMAL}\nexport const other = { parts: ['nope'] }`
    expect(anatomyBlock(source)).not.toContain('nope')
  })

  it('returns undefined when the file declares no anatomy', () => {
    expect(anatomyBlock('export const variants = tv({})')).toBeUndefined()
  })
})

describe('parseAnatomySource', () => {
  it('reads the minimal declaration', () => {
    const { anatomy, problems } = parse(MINIMAL)

    expect(problems).toEqual([])
    expect(anatomy).toEqual({
      parts: ['root'],
      states: [],
      componentTokens: [],
      riskTier: 'C',
    })
  })

  it('reads every optional field when present', () => {
    const { anatomy } = parse(`
      export const anatomy = {
        parts: ['root', 'item'],
        optionalParts: ['item'],
        states: ['open', 'closed'],
        componentTokens: ['--dz-x-bg', '--dz-x-fg'],
        recipes: ['size', 'tone'],
        globalDefaults: ['density'],
        riskTier: 'B',
      } as const satisfies ComponentAnatomy
    `)

    expect(anatomy).toEqual({
      parts: ['root', 'item'],
      optionalParts: ['item'],
      states: ['open', 'closed'],
      componentTokens: ['--dz-x-bg', '--dz-x-fg'],
      recipes: ['size', 'tone'],
      globalDefaults: ['density'],
      riskTier: 'B',
    })
  })

  it('reads parts: none', () => {
    expect(parse(MINIMAL.replace(`parts: ['root']`, `parts: 'none'`)).anatomy?.parts).toBe('none')
  })

  it('is not confused by comments between fields', () => {
    const { anatomy, problems } = parse(`
      export const anatomy = {
        // the only node
        parts: ['root'],
        /** none today */
        states: [],
        componentTokens: [],
        riskTier: 'D',
      } as const satisfies ComponentAnatomy
    `)

    expect(problems).toEqual([])
    expect(anatomy?.parts).toEqual(['root'])
  })

  it('reads a multi-line array', () => {
    const { anatomy } = parse(`
      export const anatomy = {
        parts: [
          'root',
          'trigger',
        ],
        states: [],
        componentTokens: [],
        riskTier: 'A',
      } as const satisfies ComponentAnatomy
    `)

    expect(anatomy?.parts).toEqual(['root', 'trigger'])
  })

  it('accepts double-quoted values', () => {
    expect(parse(MINIMAL.replaceAll('\'', '"')).anatomy?.parts).toEqual(['root'])
  })

  it('reports a file with no anatomy export rather than returning an empty one', () => {
    const { anatomy, problems } = parse('export const variants = tv({})')

    expect(anatomy).toBeUndefined()
    expect(problems[0]).toContain('exports no')
  })

  it('reports a missing parts field instead of assuming none', () => {
    // The difference between "renderless" and "nobody declared it" is the whole
    // point of the field; defaulting either way would erase it.
    const { problems } = parse(MINIMAL.replace(`parts: ['root'],`, ''))

    expect(problems[0]).toContain('declares no `parts`')
  })

  it('reports a missing states array', () => {
    expect(parse(MINIMAL.replace('states: [],', '')).problems[0]).toContain('`states`')
  })

  it('reports a missing componentTokens array', () => {
    expect(parse(MINIMAL.replace('componentTokens: [],', '')).problems[0]).toContain('`componentTokens`')
  })

  it('reports an unknown risk tier', () => {
    expect(parse(MINIMAL.replace(`riskTier: 'C'`, `riskTier: 'S'`)).problems[0]).toContain('riskTier')
  })

  it('reports parts written as something other than an array or none', () => {
    const { problems } = parse(MINIMAL.replace(`parts: ['root']`, 'parts: PART_NAMES'))

    expect(problems[0]).toContain('neither an array literal nor')
  })

  it('reports an optional part that is not a part', () => {
    // Nothing else can catch this: `expectAnatomy` only ever sees parts that
    // exist, so a typo'd optional part is silently never looked for.
    const { anatomy, problems } = parse(`
      export const anatomy = {
        parts: ['root'],
        optionalParts: ['spinnner'],
        states: [],
        componentTokens: [],
        riskTier: 'C',
      } as const satisfies ComponentAnatomy
    `)

    expect(anatomy).toBeUndefined()
    expect(problems[0]).toContain('spinnner')
  })
})

describe('readAnatomyFor', () => {
  it('returns nothing, and no problem, for a component with no declaration', () => {
    const result = readAnatomyFor(`${ROOT}/packages/core/src/components/cards/DzCard.vue`)

    expect(result.anatomy).toBeUndefined()
    expect(result.problems).toEqual([])
  })

  it('reads the DzButton declaration from disk', () => {
    const result = readAnatomyFor(`${ROOT}/packages/core/src/components/buttons/DzButton.vue`)

    expect(result.problems).toEqual([])
    expect(result.anatomy?.parts).toEqual(['root', 'spinner'])
    // 'B', not 'A': TASK-OSS-P5-01 corrected the RiskTier scale, which
    // TASK-OSS-P3-02 had introduced inverted. A button is an interactive
    // primitive; 'A' is now presentational.
    expect(result.anatomy?.riskTier).toBe('B')
    expect(result.file).toContain('DzButton.anatomy.ts')
  })
})

describe('referencedComponentTokens', () => {
  const button = `${ROOT}/packages/core/src/components/buttons/DzButton.vue`

  it('finds the tokens DzButton actually reads', () => {
    const tokens = referencedComponentTokens(button, 'DzButton')

    // The one a Playwright fixture guessed wrong, and the reason this exists.
    expect(tokens).toContain('--dz-button-radius')
    expect(tokens).toContain('--dz-button-disabled-opacity')
    expect(tokens.length).toBeGreaterThan(20)
  })

  it('ignores global semantic tokens, which are the theme not the component', () => {
    const tokens = referencedComponentTokens(button, 'DzButton')

    expect(tokens.some(token => token.startsWith('--dz-primary'))).toBe(false)
    expect(tokens.some(token => token.startsWith('--dz-radius'))).toBe(false)
  })

  it('does not report the bare prefix an interpolation leaves behind', () => {
    // `--dz-button-${size}-height` scans as `--dz-button-`, which is not a
    // token anyone can set.
    expect(referencedComponentTokens(button, 'DzButton')).not.toContain('--dz-button-')
  })

  it('derives the family from the component name, including compound names', () => {
    const table = `${ROOT}/packages/core/src/components/data/DzTable.vue`
    expect(referencedComponentTokens(table, 'DzTable').every(t => t.startsWith('--dz-table-'))).toBe(true)
  })

  it('returns nothing for a component with no files of its own', () => {
    expect(referencedComponentTokens(`${ROOT}/packages/core/src/components/x/DzNope.vue`, 'DzNope'))
      .toEqual([])
  })

  it('agrees with what DzButton declares — the check that closes the loop', () => {
    const declared = readAnatomyFor(button).anatomy?.componentTokens ?? []
    const referenced = referencedComponentTokens(button, 'DzButton')

    expect(referenced.filter(token => !declared.includes(token))).toEqual([])
  })
})
