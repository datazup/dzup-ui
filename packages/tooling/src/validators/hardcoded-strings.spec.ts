import { describe, expect, it } from 'vitest'
import { applyRatchets, checkHardcodedStrings, checkSource, isAllowed, RATCHET_CEILINGS } from './hardcoded-strings.ts'

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

  it('ignores a bound aria-label that is a catalog lookup', () => {
    expect(checkSource('X.vue', vue('', '  <button :aria-label="dzMessages.clear" />'))).toEqual([])
    expect(checkSource('X.vue', vue('', '  <button :aria-label="dzMessages[\'clear\']" />'))).toEqual([])
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

/* eslint-disable no-template-curly-in-string -- the sources under test are Vue templates holding JS template literals */
describe('bound aria-label with language in it (UI-DZUP-UI-CODE-M-12)', () => {
  it('flags a template literal whose static text has words', () => {
    // The DzMultiSelect / DzChip / DzTag shape the old rule waved through.
    const found = checkSource('X.vue', vue('', '  <button :aria-label="`Remove ${label}`" />'))
    expect(found).toEqual([
      expect.objectContaining({ rule: 'bound-literal-aria-label', value: '`Remove ${label}`', line: 6 }),
    ])
  })

  it('flags an English string fallback in a bound expression', () => {
    const found = checkSource('X.vue', vue('', '  <nav :aria-label="ariaLabel ?? \'Progress steps\'" />'))
    expect(found.map(v => v.value)).toEqual(['Progress steps'])
    const both = checkSource('X.vue', vue('', '  <b :aria-label="open ? \'Collapse row\' : \'Expand row\'" />'))
    expect(both.map(v => v.value)).toEqual(['Collapse row', 'Expand row'])
  })

  it('ignores a template literal that is only interpolations and punctuation', () => {
    expect(checkSource('X.vue', vue('', '  <span :aria-label="`${role} – ${status}`" />'))).toEqual([])
  })

  it('honours the escape hatch on the same line', () => {
    const source = vue('', '  <b :aria-label="`Remove ${x}`" /> <!-- hardcoded-string-ok: test -->')
    expect(checkSource('X.vue', source)).toEqual([])
  })
})

/* eslint-enable no-template-curly-in-string */

describe('literal text in an empty state (UI-DZUP-UI-CODE-M-12)', () => {
  it('flags fallback text inside <slot name="empty">', () => {
    const found = checkSource('X.vue', vue('', '  <slot name="empty">\n    No options available\n  </slot>'))
    expect(found).toEqual([
      expect.objectContaining({ rule: 'literal-empty-state', value: 'No options available', line: 7 }),
    ])
  })

  it('flags text in ComboboxEmpty and data-part="empty" elements', () => {
    const found = checkSource('X.vue', vue('', [
      '  <ComboboxEmpty data-part="empty">No results found.</ComboboxEmpty>',
      '  <li v-if="none" data-part="empty" class="x">No items</li>',
    ].join('\n')))
    expect(found.map(v => v.value)).toEqual(['No results found.', 'No items'])
  })

  it('flags an English string inside an interpolation in an empty slot', () => {
    const found = checkSource('X.vue', vue('', '  <slot name="empty">{{ active ? noResultsText : \'No options available\' }}</slot>'))
    expect(found.map(v => v.value)).toEqual(['No options available'])
  })

  it('ignores an empty state that renders a catalog message', () => {
    expect(checkSource('X.vue', vue('', '  <slot name="empty">{{ resolvedEmptyText }}</slot>'))).toEqual([])
    expect(checkSource('X.vue', vue('', '  <div data-part="empty">\n    <slot name="empty" />\n  </div>'))).toEqual([])
  })
})

describe('ratchet', () => {
  const v = (rule: 'static-aria-label' | 'bound-literal-aria-label') =>
    ({ file: 'X.vue', line: 1, rule, value: 'x' })

  it('fails unratcheted rules outright and ratcheted rules only above the ceiling', () => {
    const at = applyRatchets([v('static-aria-label'), v('bound-literal-aria-label')], { 'bound-literal-aria-label': 1 })
    expect(at.failing.map(f => f.rule)).toEqual(['static-aria-label'])
    expect(at.ratchets).toEqual([{ rule: 'bound-literal-aria-label', count: 1, ceiling: 1 }])
    const above = applyRatchets([v('bound-literal-aria-label'), v('bound-literal-aria-label')], { 'bound-literal-aria-label': 1 })
    expect(above.failing).toHaveLength(2)
  })

  it('reports the real packages/core debt at exactly its pinned ceilings', () => {
    // Both directions matter: a rise is new debt, a fall must lower the pin.
    const { failing, ratchets } = applyRatchets(checkHardcodedStrings())
    expect(failing).toEqual([])
    for (const r of ratchets)
      expect(r.count, r.rule).toBe(RATCHET_CEILINGS[r.rule])
    expect(ratchets.find(r => r.rule === 'bound-literal-aria-label')!.count).toBeGreaterThan(0)
    expect(ratchets.find(r => r.rule === 'literal-empty-state')!.count).toBeGreaterThan(0)
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
