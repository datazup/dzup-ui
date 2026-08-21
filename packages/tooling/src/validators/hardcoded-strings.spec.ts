import { describe, expect, it } from 'vitest'
import { checkSource, isAllowed } from './hardcoded-strings.ts'

/**
 * Specs for the hard-coded string validator (TASK-OSS-P4-03).
 *
 * The rules are exercised against hand-written sources rather than against the
 * repository, so that a spec keeps meaning something after the catalog rollout
 * makes every real file clean. The interesting cases are the ones the validator
 * must NOT flag — a gate that fires on documentation or on `%` teaches people
 * to disable it.
 */

function vue(script: string, template: string): string {
  return `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n${template}\n</template>\n`
}

describe('static aria-label', () => {
  it('flags a literal accessible name in the template', () => {
    const source = vue('', '  <button aria-label="Clear input" />')
    const found = checkSource('X.vue', source)
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ rule: 'static-aria-label', value: 'Clear input' })
  })

  it('ignores a bound aria-label', () => {
    // `:aria-label` resolves to something the component chose — which, after
    // this packet, is a catalog lookup.
    expect(checkSource('X.vue', vue('', '  <button :aria-label="dzMessages.clear" />'))).toEqual([])
  })

  it('ignores an aria-label inside a JSDoc @example', () => {
    // The rule that cost this packet an inventory pass: scanning whole files
    // swept up 11 documentation strings across 9 components. A validator that
    // flagged those would teach people to stop writing examples.
    const source = vue(
      '/**\n * @example\n * ```vue\n * <DzIconButton aria-label="Delete" />\n * ```\n */\nconst a = 1',
      '  <button :aria-label="label" />',
    )
    expect(checkSource('X.vue', source)).toEqual([])
  })

  it('ignores a value with no letters in it', () => {
    expect(checkSource('X.vue', vue('', '  <button aria-label="—" />'))).toEqual([])
  })
})

describe('literal prop defaults', () => {
  const script = (body: string) =>
    `const props = withDefaults(defineProps<P>(), {\n${body}\n})`

  it('flags a user-visible prop default', () => {
    const found = checkSource('X.vue', vue(script('  noResultsText: \'No results found\','), '  <div />'))
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ rule: 'literal-prop-default', value: 'No results found' })
  })

  it('flags every user-visible suffix the catalog covers', () => {
    const found = checkSource('X.vue', vue(script(
      '  emptyMessage: \'No options\',\n  filterPlaceholder: \'Search\',\n  ariaLabel: \'Pagination\',\n'
      + '  headerTitle: \'Details\',\n  fieldHint: \'Required\',\n  helpDescription: \'More\',',
    ), '  <div />'))
    expect(found.map(v => v.value).sort()).toEqual(
      ['Details', 'More', 'No options', 'Pagination', 'Required', 'Search'],
    )
  })

  it('ignores a prop that is not user-visible', () => {
    // `storageKey`, `attribute`, `name` — strings a component uses, not strings
    // it shows. Widening the suffix list to "any string prop" would flag every
    // one of them.
    const found = checkSource('X.vue', vue(script(
      '  storageKey: \'dz-theme\',\n  attribute: \'data-theme\',\n  type: \'button\',',
    ), '  <div />'))
    expect(found).toEqual([])
  })

  it('ignores units, symbols and format tokens', () => {
    const found = checkSource('X.vue', vue(script(
      '  separatorText: \' / \',\n  suffixLabel: \'%\',\n  currencyLabel: \'USD\',',
    ), '  <div />'))
    expect(found).toEqual([])
  })

  it('ignores an undefined default', () => {
    expect(checkSource('X.vue', vue(script('  noResultsText: undefined,'), '  <div />'))).toEqual([])
  })
})

describe('the escape hatch', () => {
  it('accepts a marker on the same line', () => {
    const source = vue(
      'const props = withDefaults(defineProps<P>(), {\n  cancelText: \'Cancel\', // hardcoded-string-ok: reason\n})',
      '  <div />',
    )
    expect(checkSource('X.vue', source)).toEqual([])
  })

  it('accepts a marker anywhere in the comment block above', () => {
    // The real case is six lines of justification; one line above is not enough
    // room to say anything worth accepting.
    const source = vue(
      'const props = withDefaults(defineProps<P>(), {\n'
      + '  // hardcoded-string-ok: never rendered — the element that would carry\n'
      + '  // it is aria-hidden, so no assistive technology can reach the value\n'
      + '  // and translating it would translate something nobody hears.\n'
      + '  dragHandleLabel: \'Drag to reorder\',\n})',
      '  <div />',
    )
    expect(checkSource('X.vue', source)).toEqual([])
  })

  it('does not let a marker leak past a non-comment line', () => {
    // Otherwise one exemption near the top of a block would silence the rest of
    // it, which is how an allowlist stops describing anything.
    const source = vue(
      'const props = withDefaults(defineProps<P>(), {\n'
      + '  // hardcoded-string-ok: applies to the line below only\n'
      + '  cancelText: \'Cancel\',\n'
      + '  confirmText: \'Confirm\',\n})',
      '  <div />',
    )
    const found = checkSource('X.vue', source)
    expect(found.map(v => v.value)).toEqual(['Confirm'])
  })

  it('isAllowed stops at the first non-comment line', () => {
    const source = '// hardcoded-string-ok: x\nconst a = 1\nconst b = 2'
    expect(isAllowed(source, 1)).toBe(true)
    expect(isAllowed(source, 2)).toBe(true)
    expect(isAllowed(source, 3)).toBe(false)
  })
})
