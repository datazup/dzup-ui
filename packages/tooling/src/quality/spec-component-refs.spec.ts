/**
 * The structural citation rule (`D-RES02-2`, RESIDUAL-05).
 *
 * The whole point of this module is that a **comment cannot grant a citation**, so
 * that is the first thing asserted, in every shape the repository's spec files
 * actually take: a header sentence, a cross-reference to another spec, and a
 * "tested elsewhere" note. Then the three positive rules, so nobody can satisfy the
 * negative one by making the predicate always false — which is the failure mode of
 * every gate that is only tested for what it rejects.
 */

import { describe, expect, it } from 'vitest'
import { componentsLoadedBy, filesLoading, stripComments } from './spec-component-refs.ts'

/**
 * A lone dollar sign, concatenated into the fixtures that need one.
 *
 * The fixtures below are *source text about source text*, so several must contain a
 * literal template-interpolation opener. Typing one inside a quoted string trips
 * `no-template-curly-in-string`, and that rule reads the string's **value**, so a
 * unicode escape does not satisfy it either — only never putting the two characters
 * in one literal does. Here the opener is the subject under test, not a mistake.
 */
const DOLLAR = '$'

/** `import(`…/${family}/${name}.vue`)` — the dynamic loader two SSR specs use. */
const LOADER = [
  'async function load(family: string, name: string) {',
  `  return (await import(\`../../src/components/${DOLLAR}{family}/${DOLLAR}{name}.vue\`)).default`,
  '}',
].join('\n')

describe('stripComments', () => {
  it('removes a line comment but keeps the code after it', () => {
    expect(stripComments('const a = 1 // DzGhost\nconst b = 2')).toBe('const a = 1 \nconst b = 2')
  })

  it('removes a block comment, including a multi-line one', () => {
    expect(stripComments('a/* DzGhost\n * DzGhost again\n */b')).toBe('a b')
  })

  it('leaves a `//` that is inside a string literal alone', () => {
    const src = 'const url = \'https://example.com/DzGhost\''
    expect(stripComments(src)).toBe(src)
  })

  it('leaves a `/*` that is inside a string literal alone', () => {
    const src = 'const s = "/* DzGhost */"'
    expect(stripComments(src)).toBe(src)
  })

  it('leaves a template literal alone, including its interpolations', () => {
    expect(stripComments(LOADER)).toBe(LOADER)
  })

  it('does not mistake the contents of a regex literal for a comment', () => {
    const src = 'const re = /\\/\\/ DzGhost/'
    expect(stripComments(src)).toBe(src)
  })

  it('keeps an escaped quote from ending a string early', () => {
    const src = 'const s = \'it\\\'s // not a comment\''
    expect(stripComments(src)).toBe(src)
  })
})

describe('componentsLoadedBy — a comment grants nothing', () => {
  it('ignores a component named in a header comment', () => {
    const src = [
      '/**',
      ' * Accessibility tests for the forms family.',
      ' * Tests DzCombobox. DzGhost is deliberately not covered here.',
      ' */',
      'import DzCombobox from \'../../src/components/forms/DzCombobox.vue\'',
    ].join('\n')
    const loaded = componentsLoadedBy(src)
    expect(loaded.has('DzCombobox')).toBe(true)
    expect(loaded.has('DzGhost')).toBe(false)
  })

  it('ignores a "tested elsewhere" note — the shape that granted 7 of the 8 false citations', () => {
    const src = [
      '// Note: DzCheckbox, DzRadio, DzSwitch, DzSelect are tested in inputs.a11y.spec.ts.',
      'import DzSlider from \'../../src/components/forms/DzSlider.vue\'',
    ].join('\n')
    expect([...componentsLoadedBy(src)]).toEqual(['DzSlider'])
  })

  it('ignores a component named inside a line comment that quotes its file path', () => {
    const src = '// see ../../src/components/data/DzGhost.vue\nconst x = 1'
    expect(componentsLoadedBy(src).size).toBe(0)
  })
})

describe('componentsLoadedBy — the three rules that keep a real citation', () => {
  it('rule 1: a static default import of the component module', () => {
    const src = 'import DzButton from \'../../src/components/buttons/DzButton.vue\''
    expect(componentsLoadedBy(src).has('DzButton')).toBe(true)
  })

  it('rule 1: a dynamic import with a literal specifier, as the SSR specs write it', () => {
    const src = 'const C = (await import(\'../../src/components/buttons/DzButton.vue\')).default'
    expect(componentsLoadedBy(src).has('DzButton')).toBe(true)
  })

  it('rule 2: a named import from a components barrel', () => {
    const src = 'import { DzAlert, DzToast } from \'../../src/components/feedback\''
    const loaded = componentsLoadedBy(src)
    expect(loaded.has('DzAlert')).toBe(true)
    expect(loaded.has('DzToast')).toBe(true)
  })

  it('rule 2 does not fire for a barrel outside components/ or providers/', () => {
    const src = 'import { DzGhost } from \'../../src/utilities/cn.ts\''
    expect(componentsLoadedBy(src).has('DzGhost')).toBe(false)
  })

  it('a side-effect import does not let rule 2 reach a later statement\'s specifier', () => {
    const src = [
      'import \'./register-matchers.ts\'',
      'import { DzAlert } from \'../../src/components/feedback\'',
    ].join('\n')
    expect([...componentsLoadedBy(src)]).toEqual(['DzAlert'])
  })

  it('rule 3: a template-literal loader admits the names passed to it', () => {
    const src = `${LOADER}\nconst html = await ssrRender(await load('inputs', 'DzInput'))`
    expect(componentsLoadedBy(src).has('DzInput')).toBe(true)
  })

  it('rule 3 stays shut in a file with no template-literal loader', () => {
    const src = 'const label = \'DzInput\'\nexpect(label).toBe(\'DzInput\')'
    expect(componentsLoadedBy(src).has('DzInput')).toBe(false)
  })

  it('rule 3 still ignores a name that only appears in a comment', () => {
    const src = `// DzGhost is loaded by the other slice.\n${LOADER}\nawait load('inputs', 'DzInput')`
    const loaded = componentsLoadedBy(src)
    expect(loaded.has('DzInput')).toBe(true)
    expect(loaded.has('DzGhost')).toBe(false)
  })

  it('does not treat a non-component module basename as a component', () => {
    const src = 'import { renderToString } from \'@vue/server-renderer\'\nimport \'./register-matchers.ts\''
    expect(componentsLoadedBy(src).size).toBe(0)
  })
})

describe('filesLoading', () => {
  const files = [
    { path: '/repo/a.spec.ts', source: 'import DzButton from \'../../src/components/buttons/DzButton.vue\'' },
    { path: '/repo/b.spec.ts', source: '// DzButton is covered in a.spec.ts.\nconst x = 1' },
  ]
  const rel = (p: string): string => p.replace('/repo/', '')

  it('cites only the file that loads the component', () => {
    expect(filesLoading(files, 'DzButton', rel)).toEqual(['a.spec.ts'])
  })

  it('cites nothing for a component no file loads', () => {
    expect(filesLoading(files, 'DzGhost', rel)).toEqual([])
  })
})
