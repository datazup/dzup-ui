import { describe, expect, it } from 'vitest'
import { checkDocSnippets, checkDocument, extractRegion } from './validate-doc-snippets.ts'

/** A fixture that really exists, so the marker resolves. */
const REAL_FIXTURE = 'packages/nuxt/test/fixtures/core-only/nuxt.config.ts'
const REAL_CONTENT = [
  'export default defineNuxtConfig({',
  '  modules: [\'@dzup-ui/nuxt\'],',
  '})',
].join('\n')

function doc(...lines: string[]): string {
  return lines.join('\n')
}

describe('extractRegion', () => {
  const source = doc(
    'const noise = 1',
    '// #region docs',
    'const shown = 2',
    '// #endregion',
    'const more = 3',
  )

  it('returns the lines between the delimiters', () => {
    expect(extractRegion(source, 'docs')).toBe('const shown = 2')
  })

  it('returns undefined for a region that is not there', () => {
    expect(extractRegion(source, 'missing')).toBeUndefined()
  })

  it('returns undefined for a region that is never closed', () => {
    expect(extractRegion('// #region docs\nconst x = 1', 'docs')).toBeUndefined()
  })
})

describe('checkDocument', () => {
  it('accepts a snippet that matches its fixture', () => {
    const source = doc(
      `<!-- fixture: ${REAL_FIXTURE} -->`,
      '',
      '```ts',
      REAL_CONTENT,
      '```',
    )
    expect(checkDocument('a.md', source)).toEqual([])
  })

  it('accepts the JSX comment form MDX requires', () => {
    const source = doc(
      `{/* fixture: ${REAL_FIXTURE} */}`,
      '',
      '```ts',
      REAL_CONTENT,
      '```',
    )
    expect(checkDocument('a.mdx', source)).toEqual([])
  })

  it('catches a snippet that has drifted from its fixture', () => {
    const source = doc(
      `<!-- fixture: ${REAL_FIXTURE} -->`,
      '```ts',
      'export default defineNuxtConfig({',
      '  modules: [\'@dzup-ui/nuxt\'],',
      '  dzupUi: { includePro: true },',
      '})',
      '```',
    )
    const violations = checkDocument('a.md', source)
    expect(violations).toHaveLength(1)
    expect(violations[0]?.reason).toContain('no longer matches its fixture')
  })

  it('ignores trailing whitespace, which is not drift', () => {
    const source = doc(
      `<!-- fixture: ${REAL_FIXTURE} -->`,
      '```ts',
      '',
      `${REAL_CONTENT}   `,
      '',
      '```',
    )
    expect(checkDocument('a.md', source)).toEqual([])
  })

  it('catches a marker whose fixture does not exist', () => {
    const source = doc(
      '<!-- fixture: packages/nuxt/test/fixtures/not-a-fixture/nuxt.config.ts -->',
      '```ts',
      'anything',
      '```',
    )
    expect(checkDocument('a.md', source)[0]?.reason).toContain('does not exist')
  })

  it('catches a marker with no code block after it', () => {
    const source = doc(`<!-- fixture: ${REAL_FIXTURE} -->`, 'Just prose.')
    expect(checkDocument('a.md', source)[0]?.reason).toContain('no fenced code block')
  })

  it('catches an unclosed code block', () => {
    const source = doc(`<!-- fixture: ${REAL_FIXTURE} -->`, '```ts', REAL_CONTENT)
    expect(checkDocument('a.md', source)[0]?.reason).toContain('never closed')
  })

  it('catches a region the fixture does not define', () => {
    const source = doc(`<!-- fixture: ${REAL_FIXTURE}#nope -->`, '```ts', 'x', '```')
    expect(checkDocument('a.md', source)[0]?.reason).toContain('#region nope')
  })

  it('leaves unmarked snippets alone', () => {
    // Not every code block is an install instruction, and demanding a fixture
    // for each one would make the gate unusable rather than trustworthy.
    expect(checkDocument('a.md', doc('```ts', 'const x = 1', '```'))).toEqual([])
  })

  it('reports the line the marker is on', () => {
    const source = doc('# Title', '', `<!-- fixture: ${REAL_FIXTURE} -->`, '```ts', 'wrong', '```')
    expect(checkDocument('a.md', source)[0]?.line).toBe(3)
  })
})

describe('the repository', () => {
  const { violations, checked } = checkDocSnippets()

  it('has every marked snippet matching its fixture', () => {
    const report = violations.map(v => `${v.file}:${v.line} ${v.reason}`).join('\n')
    expect(violations, report).toEqual([])
  })

  it('actually backs some install documentation with fixtures', () => {
    // A gate that checks nothing passes trivially. The install paths this
    // program repaired — Core-only, Core + Pro, prefix, CSS order, SSR — are
    // each documented from a fixture that gets built.
    expect(checked).toBeGreaterThanOrEqual(8)
  })
})
