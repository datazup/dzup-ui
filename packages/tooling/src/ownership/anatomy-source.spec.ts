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
    // `DzOptionsState`, not `DzCard`: the anatomy rollout reaches a new family
    // every packet, so any component picked for "has no declaration" is a
    // fixture with an expiry date — `DzCard` was this example until TASK-R5-O2
    // declared the cards family and turned this assertion red. `DzOptionsState`
    // is the one component in the catalogue whose declaration is BLOCKED, on
    // the S1-D4 disposition, so it is the stable choice; when S1-D4 is taken
    // and it gains one, this line moves with it deliberately.
    const result = readAnatomyFor(`${ROOT}/packages/core/src/components/forms/DzOptionsState.vue`)

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

/**
 * The keyboard contract (TASK-R5-O5).
 *
 * The rows this parser reads are published as the keyboard table on 144
 * documentation pages — the section an accessibility buyer reads first. A
 * half-read table is worse than the "not yet derived" sentence it replaces,
 * because it reads as complete. Every shape that must be read, and every shape
 * that must be REFUSED, is pinned here.
 */
describe('keyboard contract', () => {
  function parse(fields: string) {
    return parseAnatomySource(
      `export const anatomy = {\n  parts: ['root'],\n  states: [],\n  componentTokens: [],\n${fields}\n  riskTier: 'B',\n} as const satisfies ComponentAnatomy\n`,
      'test.anatomy.ts',
    )
  }

  it('reads an explicit none as a claim, not as an absence', () => {
    const result = parse(`  keyboard: 'none',`)
    expect(result.problems).toEqual([])
    expect(result.anatomy?.keyboard).toBe('none')
  })

  it('leaves keyboard undefined when the component declares none at all', () => {
    // 'none' and absent are DIFFERENT facts: one is a claim that the component
    // has no keyboard behaviour, the other is that nobody has written it down.
    // The docs ratchet counts the second and publishes the first.
    expect(parse('').anatomy?.keyboard).toBeUndefined()
  })

  it('does NOT mistake rtl.keyboard for the top-level keyboard contract', () => {
    // The defect this parser shipped with for one edit: `rtl: { mirrors:
    // 'layout', keyboard: 'none' }` contains the literal `, keyboard: 'none'`,
    // so a non-depth-aware field lookup read EVERY rtl-declaring component as
    // claiming it has no keyboard behaviour — a wrong table on every page.
    const result = parse(
      `  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },\n`
      + `  keyboard: [{ key: 'ArrowRight', action: 'Move to the next tab.', rtl: 'mirrored' }],`,
    )
    expect(result.problems).toEqual([])
    expect(result.anatomy?.keyboard).toEqual([
      { key: 'ArrowRight', action: 'Move to the next tab.', rtl: 'mirrored' },
    ])
  })

  it('reads every field of a binding', () => {
    const result = parse(
      `  keyboard: [\n`
      + `    { key: 'ArrowDown', modifiers: ['Alt'], when: 'trigger', action: 'Open the list.', wcag: ['2.1.1'], apg: 'combobox' },\n`
      + `  ],`,
    )
    expect(result.problems).toEqual([])
    expect(result.anatomy?.keyboard).toEqual([{
      key: 'ArrowDown',
      modifiers: ['Alt'],
      when: 'trigger',
      action: 'Open the list.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    }])
  })

  it('keeps the declared row order — a keyboard table is not alphabetical', () => {
    const result = parse(
      `  keyboard: [\n`
      + `    { key: 'Enter', action: 'Activate.' },\n`
      + `    { key: 'ArrowDown', action: 'Move down.' },\n`
      + `  ],`,
    )
    expect((result.anatomy?.keyboard as { key: string }[]).map(b => b.key))
      .toEqual(['Enter', 'ArrowDown'])
  })

  it('reads an action containing an escaped apostrophe without truncating it', () => {
    // Keyboard actions are prose. `[^']*` stops at the apostrophe and would
    // publish "Move to the list" where the contract says "Move to the list's
    // first item" — a sentence that is wrong rather than merely short.
    const result = parse(
      `  keyboard: [{ key: 'Home', action: 'Move to the list\\'s first item.' }],`,
    )
    expect(result.problems).toEqual([])
    expect((result.anatomy?.keyboard as { action: string }[])[0].action)
      .toBe('Move to the list\'s first item.')
  })

  it('reads an action containing a comma without ending the value early', () => {
    const result = parse(
      `  keyboard: [{ key: 'Escape', action: 'Close the dialog, returning focus to the trigger.' }],`,
    )
    expect((result.anatomy?.keyboard as { action: string }[])[0].action)
      .toBe('Close the dialog, returning focus to the trigger.')
  })

  it('refuses a binding with no action — a key whose effect is unstated is not a contract', () => {
    const result = parse(`  keyboard: [{ key: 'Enter' }],`)
    expect(result.anatomy).toBeUndefined()
    expect(result.problems.join(' ')).toContain('no `action`')
  })

  it('refuses a binding with no key', () => {
    const result = parse(`  keyboard: [{ action: 'Does something.' }],`)
    expect(result.problems.join(' ')).toContain('no `key`')
  })

  it('refuses an empty array, which is not the same claim as none', () => {
    const result = parse(`  keyboard: [],`)
    expect(result.problems.join(' ')).toContain('not a claim')
  })

  it('refuses a modifier that is not KeyboardEvent spelling', () => {
    const result = parse(
      `  keyboard: [{ key: 'k', modifiers: ['Cmd'], action: 'Open the palette.' }],`,
    )
    expect(result.problems.join(' ')).toContain('Cmd')
  })

  it('refuses an rtl value outside mirrored/fixed', () => {
    const result = parse(
      `  keyboard: [{ key: 'ArrowLeft', action: 'Move left.', rtl: 'swap' }],`,
    )
    expect(result.problems.join(' ')).toContain('expected \'mirrored\' or \'fixed\'')
  })

  it('refuses a mirrored binding on a component whose rtl says the arrows do not swap', () => {
    // Two declarations in the same file contradicting each other. The three-axis
    // rtl contract exists to make exactly this visible.
    const result = parse(
      `  rtl: { mirrors: 'layout', keyboard: 'none' },\n`
      + `  keyboard: [{ key: 'ArrowLeft', action: 'Move left.', rtl: 'mirrored' }],`,
    )
    expect(result.anatomy).toBeUndefined()
    expect(result.problems.join(' ')).toContain('cannot both be right')
  })

  it('refuses a keyboard value that is neither none nor an array', () => {
    const result = parse(`  keyboard: 'some',`)
    expect(result.problems.join(' ')).toContain('expected \'none\' or an array')
  })
})

/**
 * The fallthrough contract (TASK-R5-O6, owner decisions D24 and D26).
 *
 * The field answers "where does a consumer's `class` actually land?", which had
 * no machine-readable answer anywhere before this task. Absent is the honest
 * common case; present means the component is multi-root, re-points `class` at
 * an inner part, or renders nothing of its own and delegates.
 */
describe('fallthrough contract', () => {
  function parse(fields: string) {
    return parseAnatomySource(
      `export const anatomy = {
  parts: ['root', 'control'],
  states: [],
  componentTokens: [],
${fields}
  riskTier: 'B',
} as const satisfies ComponentAnatomy
`,
      'test.anatomy.ts',
    )
  }

  it('leaves it undefined when the component declares none', () => {
    // Absent is the ordinary case — one root, attributes reach it — and must not
    // be invented as `{ target: 'root' }`, which would put a needless note on
    // every documentation page.
    expect(parse(`  recipes: ['size'],`).anatomy?.fallthrough).toBeUndefined()
  })

  it('reads a plain target', () => {
    expect(parse(`  fallthrough: { target: 'control' },`).anatomy?.fallthrough)
      .toEqual({ target: 'control' })
  })

  it('reads a delegate alongside the target (D26)', () => {
    expect(
      parse(`  fallthrough: { target: 'root', delegatesTo: 'DzCombobox' },`).anatomy?.fallthrough,
    ).toEqual({ target: 'root', delegatesTo: 'DzCombobox' })
  })

  it(`reads 'none' as the renderless claim`, () => {
    expect(parse(`  fallthrough: { target: 'none' },`).anatomy?.fallthrough)
      .toEqual({ target: 'none' })
  })

  it('survives a multi-line declaration with a prose reason', () => {
    // The real shape. A `reason` is prose containing commas, quotes and
    // backticks, and it is deliberately NOT carried into the manifest — but it
    // must not break the read of the fields that are.
    const result = parse(
      `  fallthrough: {
`
      + `    target: 'control',
`
      + `    reason:
`
      + `      'D24: \`$attrs\` binds to SliderRoot (\`control\`), not the labelled wrapper, '
`
      + `      + 'so a width you pass applies there.',
`
      + `  },`,
    )
    expect(result.anatomy?.fallthrough).toEqual({ target: 'control' })
  })

  it('refuses a declaration with no target', () => {
    const result = parse(`  fallthrough: { reason: 'it goes somewhere, we think' },`)
    expect(result.problems.join(' ')).toContain('no `target`')
  })

  it('refuses a non-object declaration', () => {
    const result = parse(`  fallthrough: 'control',`)
    expect(result.problems.join(' ')).toContain('expected an object literal')
  })

  it('does NOT mistake a nested target for the top-level field', () => {
    // The F-2 failure mode from TASK-R5-O5, guarded for the new field: the
    // depth-aware `fieldValue` must not read a `target:` that belongs to some
    // other nested object.
    const result = parse(
      `  rtl: { mirrors: 'layout', keyboard: 'none' },
`
      + `  fallthrough: { target: 'control' },`,
    )
    expect(result.anatomy?.fallthrough).toEqual({ target: 'control' })
    expect(result.anatomy?.rtl).toEqual({ mirrors: 'layout', keyboard: 'none' })
  })
})
