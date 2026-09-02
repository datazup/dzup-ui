/**
 * Specs for the pure half of the extraction layer (TASK-N2-A2).
 *
 * The `vue-component-meta` half needs a full TypeScript program and is exercised
 * end-to-end by `validators/component-meta.spec.ts`'s real-repository case. What
 * is driven here is everything a wrong answer in would silently corrupt the
 * published artifact: type normalization (determinism), the unresolved-type
 * definition (the number D1 is told to trust), and the story parser (the source
 * of every published example).
 *
 * @module @dzup-ui/tooling/meta/extract-component-meta.spec
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import ts from 'typescript'
import { afterAll, describe, expect, it } from 'vitest'
import {
  componentDescription,
  contractTaxonomies,
  isUnresolvedType,
  normalizeType,
  parseStories,
  pickPrimaryStory,
  repoRelative,
} from './extract-component-meta.ts'

const dir = mkdtempSync(join(tmpdir(), 'dzup-meta-spec-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

function storiesFile(name: string, body: string): string {
  const path = join(dir, name)
  writeFileSync(path, body, 'utf8')
  return path
}

describe('normalizeType', () => {
  it('rewrites an absolute import() path to a repo-relative one', () => {
    const abs = join(process.cwd(), 'packages/core/src/x.ts').replace(/\\/g, '/')
    expect(normalizeType(`import("${abs}").Foo`)).toBe('import("packages/core/src/x.ts").Foo')
  })

  it('leaves a type with no import() untouched', () => {
    expect(normalizeType('ButtonVariant | undefined')).toBe('ButtonVariant | undefined')
  })

  it('leaves an import() outside the repo alone rather than mangling it', () => {
    expect(normalizeType('import("/elsewhere/x.d.ts").T')).toBe('import("/elsewhere/x.d.ts").T')
  })

  it('normalizes every occurrence, not only the first', () => {
    const abs = process.cwd().replace(/\\/g, '/')
    const out = normalizeType(`import("${abs}/a.ts").A | import("${abs}/b.ts").B`)
    expect(out).toBe('import("a.ts").A | import("b.ts").B')
  })
})

describe('isUnresolvedType', () => {
  it('calls empty, bare any, __VLS_ leakage and import() references unresolved', () => {
    expect(isUnresolvedType('')).toBe(true)
    expect(isUnresolvedType('   ')).toBe(true)
    expect(isUnresolvedType('any')).toBe(true)
    expect(isUnresolvedType('__VLS_Props')).toBe(true)
    expect(isUnresolvedType('import("packages/core/src/x.ts").Foo')).toBe(true)
  })

  it('does NOT call a resolved type unresolved just because it contains the word unknown', () => {
    // The loose version of this check reported 7 false positives on the real
    // catalog. These are fully resolved and a docs renderer can print them.
    expect(isUnresolvedType('Record<string, unknown>')).toBe(false)
    expect(isUnresolvedType('TreeNode<unknown>[]')).toBe(false)
    expect(isUnresolvedType('((err: unknown) => void) | undefined')).toBe(false)
    expect(isUnresolvedType('boolean | undefined')).toBe(false)
    expect(isUnresolvedType('any[]')).toBe(false)
  })
})

describe('repoRelative', () => {
  it('returns forward-slashed repo-relative paths', () => {
    expect(repoRelative(join(process.cwd(), 'packages/core/src/a.ts'))).toBe('packages/core/src/a.ts')
  })
})

describe('parseStories', () => {
  it('extracts the title, every exported story, its lines and its verbatim source', () => {
    const file = storiesFile('basic.stories.ts', [
      `import type { Meta, StoryObj } from '@storybook/vue3-vite'`,
      ``,
      `const meta = { title: 'Core/Buttons/DzButton', component: DzButton }`,
      `export default meta`,
      `type Story = StoryObj<typeof meta>`,
      ``,
      `export const Default: Story = {`,
      `  render: () => ({ components: { DzButton }, template: '<DzButton>Hi</DzButton>' }),`,
      `}`,
      ``,
      `export const Gallery: Story = {`,
      `  name: 'Variant Gallery',`,
      `  render: () => ({ components: { DzButton }, template: \`<DzButton variant="ghost" />\` }),`,
      `}`,
      ``,
    ].join('\n'))
    const parsed = parseStories(file)
    expect(parsed.titlePath).toBe('Core/Buttons/DzButton')
    expect(parsed.stories.map(s => s.id)).toEqual(['Default', 'Gallery'])
    expect(parsed.stories[0]!.lines).toEqual([7, 9])
    expect(parsed.stories[0]!.source.startsWith('export const Default: Story = {')).toBe(true)
    expect(parsed.stories[0]!.template).toBe('<DzButton>Hi</DzButton>')
    expect(parsed.stories[1]!.name).toBe('Variant Gallery')
    expect(parsed.stories[1]!.template).toBe('<DzButton variant="ghost" />')
  })

  it('keeps the JSDoc above a story inside the verbatim slice', () => {
    const file = storiesFile('jsdoc.stories.ts', [
      `const meta = { title: 'X' }`,
      `/** The canonical example. */`,
      `export const Default = { render: () => ({ template: '<X />' }) }`,
      ``,
    ].join('\n'))
    const parsed = parseStories(file)
    expect(parsed.stories[0]!.source).toContain('/** The canonical example. */')
  })

  it('omits a template that is not a static literal instead of emitting an interpolated one', () => {
    const file = storiesFile('dynamic.stories.ts', [
      `const meta = { title: 'X' }`,
      `const size = 'md'`,
      // eslint-disable-next-line no-template-curly-in-string -- the point of the case
      'export const Default = { render: () => ({ template: `<X size="${size}" />` }) }',
      ``,
    ].join('\n'))
    const parsed = parseStories(file)
    expect(parsed.stories[0]!.template).toBeUndefined()
    // …but the SOURCE is still published, so the story is still answerable.
    expect(parsed.stories[0]!.source).toContain('export const Default')
  })

  it('does not mistake a non-exported const, `meta`, or a non-object export for a story', () => {
    const file = storiesFile('noise.stories.ts', [
      `const meta = { title: 'X' }`,
      `const helper = { not: 'a story' }`,
      `export default meta`,
      `export const decorators = []`,
      `export const Default = { render: () => ({ template: '<X />' }) }`,
      ``,
    ].join('\n'))
    expect(parseStories(file).stories.map(s => s.id)).toEqual(['Default'])
  })

  it('returns no title when the file declares none', () => {
    const file = storiesFile('untitled.stories.ts', `export const Default = { render: () => ({}) }\n`)
    expect(parseStories(file).titlePath).toBeUndefined()
  })

  it('normalises CRLF so line numbers and slices match on either platform', () => {
    const file = storiesFile('crlf.stories.ts', 'const meta = { title: \'X\' }\r\nexport const Default = { a: 1 }\r\n')
    const parsed = parseStories(file)
    expect(parsed.stories[0]!.lines).toEqual([2, 2])
    expect(parsed.stories[0]!.source).not.toContain('\r')
  })
})

describe('pickPrimaryStory', () => {
  const story = (id: string) => ({ id, lines: [1, 2] as [number, number], source: id })

  it('prefers Default over anything else', () => {
    expect(pickPrimaryStory([story('Zebra'), story('Default'), story('Basic')])?.id).toBe('Default')
  })

  it('walks the preference list in order', () => {
    expect(pickPrimaryStory([story('Zebra'), story('Playground'), story('Basic')])?.id).toBe('Basic')
    expect(pickPrimaryStory([story('Zebra'), story('Playground')])?.id).toBe('Playground')
  })

  it('falls back to file order, which is deterministic', () => {
    expect(pickPrimaryStory([story('Zebra'), story('Aardvark')])?.id).toBe('Zebra')
  })

  it('returns undefined for a file with no stories — an absent example, never a fabricated one', () => {
    expect(pickPrimaryStory([])).toBeUndefined()
  })
})

// ── TASK-N2-A3 additions ────────────────────────────────────────────────────

describe('componentDescription (TASK-N2-A3)', () => {
  const vue = (name: string, body: string): string => {
    const path = join(dir, `${name}.vue`)
    writeFileSync(path, body, 'utf8')
    return path
  }

  it('reads the lead line of a `/** … */` header in <script setup>', () => {
    const p = vue('DzThing', '<script setup lang="ts">\n/**\n * DzThing — Primary thing component.\n *\n * @example\n */\n</script>')
    expect(componentDescription(p, 'DzThing')).toEqual({
      description: 'Primary thing component.',
      descriptionSource: 'sfc-header',
    })
  })

  it('reads the `<!-- … -->` SFC-comment dialect the providers/ family uses', () => {
    const p = vue('DzProviderish', '<!--\n  DzProviderish — one root component for every concern.\n-->\n<script setup lang="ts">\n</script>')
    expect(componentDescription(p, 'DzProviderish').description)
      .toBe('one root component for every concern.')
  })

  it('requires the lead line to name THIS component', () => {
    // The generator this replaced matched a bare `Dz\w+`, so a header that
    // merely mentioned another component supplied its description.
    const p = vue('DzOther', '<script setup lang="ts">\n/**\n * DzSomethingElse — not this component.\n */\n</script>')
    expect(componentDescription(p, 'DzOther')).toEqual({ description: '', descriptionSource: 'none' })
  })

  it('never infers a description from the name', () => {
    const p = vue('DzBare', '<script setup lang="ts">\nconst x = 1\n</script>')
    expect(componentDescription(p, 'DzBare')).toEqual({ description: '', descriptionSource: 'none' })
  })

  it('returns an absence rather than throwing for a missing file', () => {
    expect(componentDescription(join(dir, 'nope.vue'), 'DzNope').descriptionSource).toBe('none')
  })

  it('collapses internal whitespace so the line is safe in a markdown bullet', () => {
    const p = vue('DzWrapped', '<script setup lang="ts">\n/**\n * DzWrapped —   spaced    out.\n */\n</script>')
    expect(componentDescription(p, 'DzWrapped').description).toBe('spaced out.')
  })
})

describe('contractTaxonomies (TASK-N2-A3)', () => {
  /** A stand-in program holding one source file at a chosen path. */
  const programWith = (fileName: string, source: string): ts.Program => ({
    getSourceFiles: () => [ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true)],
  } as unknown as ts.Program)

  it('collects exported string-literal unions and ignores everything else', () => {
    const program = programWith('packages/contracts/src/tax.types.ts', [
      'export type ButtonVariant = \'solid\' | \'outline\'',
      'type NotExported = \'a\' | \'b\'',
      'export type Mixed = \'a\' | number',
      'export type Ref = ButtonVariant',
      'export type Empty = string',
    ].join('\n'))
    expect(contractTaxonomies(program)).toEqual({ ButtonVariant: ['solid', 'outline'] })
  })

  it('sorts by alias name, so the artifact is deterministic', () => {
    const program = programWith('packages/contracts/src/tax.types.ts', [
      'export type Zeta = \'z\'',
      'export type Alpha = \'a\'',
    ].join('\n'))
    expect(Object.keys(contractTaxonomies(program))).toEqual(['Alpha', 'Zeta'])
  })

  it('ignores sources outside packages/contracts/src', () => {
    expect(contractTaxonomies(programWith('packages/core/src/x.ts', 'export type A = \'a\''))).toEqual({})
  })
})
