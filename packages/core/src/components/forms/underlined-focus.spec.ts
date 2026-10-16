/**
 * The underlined field variant has one focus treatment across the form family
 * (UI-DZUP-UI-DESIGN-M-12). Before this spec the select family swapped the
 * shared ring for a 1px bottom-border colour change, DzInput used a 2px border,
 * and Cascader/TimePicker kept the outline on mouse focus too. Every underlined
 * slot now carries `dz-focus-ring-underline` and nothing that competes with it.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inputWrapperVariants } from '../inputs/DzInput.variants.ts'
import { textareaVariants } from '../inputs/DzTextarea.variants.ts'
import { cascaderVariants } from './DzCascader.variants.ts'
import { comboboxVariants } from './DzCombobox.variants.ts'
import { datePickerVariants } from './DzDatePicker.variants.ts'
import { dateRangePickerVariants } from './DzDateRangePicker.variants.ts'
import { mentionVariants } from './DzMention.variants.ts'
import { multiSelectVariants } from './DzMultiSelect.variants.ts'
import { selectVariants } from './DzSelect.variants.ts'
import { tagsInputVariants } from './DzTagsInput.variants.ts'
import { timePickerVariants } from './DzTimePicker.variants.ts'
import { treeSelectVariants } from './DzTreeSelect.variants.ts'

const UNDERLINE = 'dz-focus-ring-underline'

/** The class string of the slot that carries the underline, per component. */
const underlinedSlots: Record<string, (variant: 'outline' | 'underlined') => string> = {
  DzSelect: variant => selectVariants({ variant }).trigger(),
  DzDatePicker: variant => datePickerVariants({ variant }).trigger(),
  DzDateRangePicker: variant => dateRangePickerVariants({ variant }).trigger(),
  DzTreeSelect: variant => treeSelectVariants({ variant }).trigger(),
  DzCascader: variant => cascaderVariants({ variant }).trigger(),
  DzTimePicker: variant => timePickerVariants({ variant }).trigger(),
  DzCombobox: variant => comboboxVariants({ variant }).root(),
  DzMultiSelect: variant => multiSelectVariants({ variant }).root(),
  DzTagsInput: variant => tagsInputVariants({ variant }).field(),
  DzInput: variant => inputWrapperVariants({ variant }),
  DzTextarea: variant => textareaVariants({ variant }),
  DzMention: variant => mentionVariants({ variant }).control(),
}

describe('underlined variant focus treatment', () => {
  it.each(Object.entries(underlinedSlots))('%s underlined carries the shared underline focus class', (_name, slot) => {
    const classes = slot('underlined').split(/\s+/)
    expect(classes).toContain(UNDERLINE)
    // No per-component focus override may compete with the shared class.
    expect(classes.filter(cls => /^(?:focus|focus-visible|focus-within):(?:border|outline)/.test(cls))).toEqual([])
  })

  it.each(Object.entries(underlinedSlots))('%s outline variant does not carry the underline class', (_name, slot) => {
    expect(slot('outline').split(/\s+/)).not.toContain(UNDERLINE)
  })

  it('base.css defines the class once, for field and shell, with a forced-colors-visible outline', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../styles/base.css'), 'utf8')
    const rules = css.match(/\.dz-focus-ring-underline[^{]*\{[^}]*\}/g) ?? []
    expect(rules).toHaveLength(1)
    const [rule] = rules
    expect(rule).toContain(':focus-visible')
    expect(rule).toContain(':has(:focus-visible)')
    expect(rule).toContain('border-bottom-color: var(--dz-input-focus-ring-color)')
    expect(rule).toMatch(/outline:\s*var\(--dz-input-focus-ring-width\) solid transparent/)
    // Declared after the input rings, so it replaces their outline on underlined fields.
    expect(css.indexOf('.dz-focus-ring-underline:is(')).toBeGreaterThan(css.indexOf('.dz-focus-within-ring-input:focus-within {'))
  })
})
