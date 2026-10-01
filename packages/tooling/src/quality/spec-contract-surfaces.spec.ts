/**
 * `spec-contract-surfaces.ts` — the `contract-spec` / `unit-spec` citation rule
 * (RESIDUAL-19), driven in both directions.
 *
 * Every fixture is reduced from a file that was on disk when the census ran, and
 * says which. The old predicate is reconstructed here as "the sidecar exists",
 * which is literally what the generator asked, so each demotion below is a case
 * the old rule credited.
 */
import { describe, expect, it } from 'vitest'
import { sidecarSpecCell } from './generate-capability-matrix.ts'
import {
  declaredMembers,
  hasBehaviour,
  liveSpec,
  missingContractSurfaces,
  surfacesOwed,
  unitSpecGap,
} from './spec-contract-surfaces.ts'

/** `DzCheckbox.types.ts`, reduced: one own event, one slot, props. */
const CHECKBOX_TYPES = [
  'export interface DzCheckboxProps extends BaseFormControlProps {',
  '  /** Size — the `{ size }` in this comment must not count as a body */',
  '  size?: CanonicalSize',
  '  indeterminate?: boolean',
  '}',
  'export interface DzCheckboxEmits extends BaseEvents {',
  '  change: [checked: boolean]',
  '}',
  'export interface DzCheckboxSlots {',
  '  default?: () => unknown',
  '}',
].join('\n')

const CHECKBOX_VUE = [
  '<script setup lang="ts">',
  'const model = defineModel<boolean>()',
  'const emit = defineEmits<DzCheckboxEmits>()',
  '</script>',
  '<template>',
  '  <!-- role="presentation" in a comment is not a declaration -->',
  '  <CheckboxRoot :aria-label="ariaLabel" @update:model-value="emit(\'change\', $event)">',
  '    <slot />',
  '  </CheckboxRoot>',
  '</template>',
].join('\n')

const CHECKBOX = { component: 'DzCheckbox', types: CHECKBOX_TYPES, vue: CHECKBOX_VUE }

/** `DzCheckbox.contract.spec.ts` as it stood: nine tests, no event, no ARIA. */
const PROPS_AND_SLOTS_ONLY = [
  'describe(\'dzCheckbox — Contract Spec v1\', () => {',
  '  it(\'renders with default props\', () => {',
  '    const wrapper = mount(DzCheckbox, { props: { size: \'md\' }, slots: { default: \'Accept\' } })',
  '    expect(wrapper.text()).toContain(\'Accept\')',
  '  })',
  '})',
].join('\n')

const ALL_FOUR = [
  'describe(\'dzCheckbox — Contract Spec v1\', () => {',
  '  it(\'emits change and forwards aria-label\', async () => {',
  '    const wrapper = mount(DzCheckbox, { props: { ariaLabel: \'Accept\' }, slots: { default: \'Accept\' } })',
  '    await wrapper.trigger(\'click\')',
  '    expect(wrapper.emitted(\'change\')).toHaveLength(1)',
  '    expect(wrapper.attributes(\'aria-label\')).toBe(\'Accept\')',
  '  })',
  '})',
].join('\n')

describe('declaredMembers', () => {
  it('counts a component\'s own members and keeps "absent" apart from "empty"', () => {
    expect(declaredMembers(CHECKBOX_TYPES, 'DzCheckboxEmits')).toBe(1)
    expect(declaredMembers(CHECKBOX_TYPES, 'DzCheckboxSlots')).toBe(1)
    expect(declaredMembers('export interface DzSpacerEmits {}', 'DzSpacerEmits')).toBe(0)
    expect(declaredMembers(CHECKBOX_TYPES, 'DzRadioEmits')).toBeUndefined()
  })

  it('does not read a longer name as the shorter one', () => {
    const source = 'export interface DzTreeItemEmits {\n  toggle: []\n}'
    expect(declaredMembers(source, 'DzTreeEmits')).toBeUndefined()
    expect(declaredMembers(source, 'DzTreeItemEmits')).toBe(1)
  })

  it('counts a call-signature emits interface', () => {
    const source = 'interface DzXEmits {\n  (e: \'change\', value: string): void\n  (e: \'blur\'): void\n}'
    expect(declaredMembers(source, 'DzXEmits')).toBe(2)
  })

  it('does not borrow the next interface\'s body for a bodiless alias', () => {
    const source = 'export type DzXSlots = SharedSlots\nexport interface DzXProps {\n  a?: string\n}'
    expect(declaredMembers(source, 'DzXSlots')).toBeUndefined()
  })
})

describe('surfacesOwed', () => {
  it('reads all four from the component\'s own files', () => {
    expect(surfacesOwed(CHECKBOX)).toEqual(['props', 'events', 'slots', 'aria'])
  })

  it('owes nothing the component does not declare', () => {
    expect(surfacesOwed({
      component: 'DzSpacer',
      types: 'export interface DzSpacerProps {\n  size?: string\n}',
      vue: '<template><div /></template>',
    })).toEqual(['props'])
  })

  it('does not owe ARIA for a commented-out attribute or a decorative aria-hidden', () => {
    const vue = '<template>\n  <!-- <div role="status" /> -->\n  <svg aria-hidden="true" />\n</template>'
    expect(surfacesOwed({ component: 'DzX', types: '', vue })).toEqual([])
  })

  it('does not owe ARIA for a word in the script block', () => {
    const vue = '<script setup lang="ts">\n/** role="combobox" trigger */\n</script>\n<template><div /></template>'
    expect(surfacesOwed({ component: 'DzX', types: '', vue })).toEqual([])
  })
})

describe('missingContractSurfaces', () => {
  it('names the owed surfaces a spec never touches — the DzCheckbox shape', () => {
    expect(missingContractSurfaces(CHECKBOX, PROPS_AND_SLOTS_ONLY)).toEqual(['events', 'aria'])
  })

  it('is empty when every owed surface is touched', () => {
    expect(missingContractSurfaces(CHECKBOX, ALL_FOUR)).toEqual([])
  })

  it('does not count a surface named only in a comment', () => {
    const spec = PROPS_AND_SLOTS_ONLY.replace(
      '    expect(',
      '    // wrapper.emitted(\'change\') and aria-label are covered elsewhere\n    expect(',
    )
    expect(missingContractSurfaces(CHECKBOX, spec)).toEqual(['events', 'aria'])
  })

  it('does not count a surface touched only by a skipped test', () => {
    const spec = ALL_FOUR.replace('it(\'emits', 'it.skip(\'emits')
      .replace('})\n})', '})\n  it(\'renders\', () => {\n    expect(mount(DzCheckbox, { props: {}, slots: { default: \'x\' } }).exists()).toBe(true)\n  })\n})')
    expect(missingContractSurfaces(CHECKBOX, spec)).toEqual(['events', 'aria'])
  })

  it('credits nothing to a spec with no live assertion at all', () => {
    const spec = 'it.todo(\'emits change\')\nit(\'mounts\', () => {\n  mount(DzCheckbox, { props: {}, slots: {} })\n})'
    expect(missingContractSurfaces(CHECKBOX, spec)).toEqual(['props', 'events', 'slots', 'aria'])
  })

  it('accepts a render-function mount — the DzRadio shape', () => {
    const radio = {
      component: 'DzRadio',
      types: 'export interface DzRadioProps {\n  value: string\n}\nexport interface DzRadioSlots {\n  default?: () => unknown\n}',
      vue: '<template><slot /></template>',
    }
    const spec = [
      'function mountRadio(radioProps = {}) {',
      '  return mount(defineComponent({',
      '    render: () => h(DzRadioGroup, { modelValue: \'\' }, {',
      '      default: () => h(DzRadio, { value: \'a\', ...radioProps }, { default: () => \'One\' }),',
      '    }),',
      '  }))',
      '}',
      'it(\'renders its label\', () => {',
      '  expect(mountRadio().text()).toContain(\'One\')',
      '})',
    ].join('\n')
    expect(missingContractSurfaces(radio, spec)).toEqual([])
  })

  it('accepts a listener prop, quoted or shorthand, as the events surface', () => {
    const quoted = PROPS_AND_SLOTS_ONLY.replace('props: { size: \'md\' }', 'props: { \'onUpdate:modelValue\': spy }')
    expect(missingContractSurfaces(CHECKBOX, quoted)).toEqual(['aria'])
    const shorthand = PROPS_AND_SLOTS_ONLY.replace('props: { size: \'md\' }', 'props: { onChange }')
    expect(missingContractSurfaces(CHECKBOX, shorthand)).toEqual(['aria'])
  })

  it('does not read another component\'s tag as this component\'s slot', () => {
    const group = {
      component: 'DzButton',
      types: 'export interface DzButtonSlots {\n  default?: () => unknown\n}',
      vue: '<template><button><slot /></button></template>',
    }
    const spec = 'it(\'x\', () => {\n  expect(mount({ template: \'<DzButtonGroup>a</DzButtonGroup><DzButton />\' }).exists()).toBe(true)\n})'
    expect(missingContractSurfaces(group, spec)).toEqual(['slots'])
    expect(missingContractSurfaces(group, spec.replace('<DzButton />', '<DzButton>Go</DzButton>'))).toEqual([])
  })

  /**
   * The limit RESIDUAL-17 §7 item 1 named, pinned rather than hidden: a text
   * predicate cannot tell an assertion from its negation. If this ever fails, the
   * predicate has learned to — and the module's docblock owes a rewrite.
   */
  it('cannot tell an assertion from its negation, and says so', () => {
    const spec = PROPS_AND_SLOTS_ONLY.replace(
      '    expect(wrapper.text())',
      '    expect(wrapper.emitted(\'change\')).toBeUndefined()\n    expect(wrapper.text())',
    )
    expect(missingContractSurfaces(CHECKBOX, spec)).toEqual(['aria'])
  })
})

describe('unitSpecGap', () => {
  /** `DzInput.spec.ts` as it stood: 23 render tests, the input never typed into. */
  const RENDER_ONLY = 'it(\'renders an <input>\', () => {\n  expect(mount(DzCheckbox).find(\'input\').exists()).toBe(true)\n})'

  it('asks for behaviour of a component that emits', () => {
    expect(hasBehaviour(CHECKBOX)).toBe(true)
    expect(unitSpecGap(CHECKBOX, RENDER_ONLY)).toBe('no-behaviour')
  })

  it('is satisfied by a drive or by an observed emit', () => {
    expect(unitSpecGap(CHECKBOX, RENDER_ONLY.replace('expect(', 'await w.trigger(\'click\')\n  expect('))).toBeUndefined()
    expect(unitSpecGap(CHECKBOX, RENDER_ONLY.replace('.find(\'input\').exists()', '.emitted(\'change\')'))).toBeUndefined()
  })

  it('does not ask for behaviour of a component with none', () => {
    const spacer = { component: 'DzSpacer', types: '', vue: '<script setup lang="ts">\n// defineEmits<X>() would go here\n</script>\n<template><div /></template>' }
    expect(hasBehaviour(spacer)).toBe(false)
    expect(unitSpecGap(spacer, RENDER_ONLY)).toBeUndefined()
  })

  it('reports a spec with no live assertion', () => {
    expect(unitSpecGap(CHECKBOX, 'it.skip(\'x\', () => {\n  expect(1).toBe(1)\n})')).toBe('no-live-assertion')
  })
})

describe('liveSpec', () => {
  it('blanks a skipped block and keeps the line count', () => {
    const source = 'it.skip(\'a\', () => {\n  expect(w.emitted(\'x\')).toBe(1)\n})\nit(\'b\', () => {\n  expect(1).toBe(1)\n})'
    const live = liveSpec(source)
    expect(live.asserting).toBe(1)
    expect(live.code).not.toContain('emitted')
    expect(live.code.split('\n')).toHaveLength(source.split('\n').length)
  })
})

describe('sidecarSpecCell', () => {
  const path = 'packages/core/src/components/forms/DzCheckbox.contract.spec.ts'

  it('demotes a contract spec that misses an owed surface — and still cites it', () => {
    const cell = sidecarSpecCell('contract-spec', CHECKBOX, path, PROPS_AND_SLOTS_ONLY)
    expect(cell.state).toBe('unrun')
    expect(cell.artifacts).toEqual([path])
    expect(cell.note).toContain('`events`, `aria`')
  })

  it('credits a contract spec that touches every owed surface, with no note', () => {
    expect(sidecarSpecCell('contract-spec', CHECKBOX, path, ALL_FOUR)).toEqual({ state: 'present', artifacts: [path] })
  })

  it('judges the two kinds by their own rule over the same file', () => {
    // Render-and-assert with props and slots: behaviour is missing for `unit-spec`,
    // and `events`/`aria` for `contract-spec`. One file, two different verdicts.
    expect(sidecarSpecCell('unit-spec', CHECKBOX, path, PROPS_AND_SLOTS_ONLY).note).toContain('no live test drives it')
    expect(sidecarSpecCell('unit-spec', CHECKBOX, path, ALL_FOUR)).toEqual({ state: 'present', artifacts: [path] })
  })
})
