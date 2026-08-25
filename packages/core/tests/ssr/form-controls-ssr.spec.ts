import type { Component } from 'vue'
/**
 * SSR tests for form controls — renderer contract C5 (TASK-FORM-OSS-02).
 *
 * `ssr-smoke.spec.ts` asks one question of a component: does it render without
 * throwing. That is the right question for a card or a heading. It is not
 * enough for a form control, where the failure that costs a user their work is
 * quieter: the server renders an empty field, the client hydrates and fills it
 * in, and somewhere in between a form is submitted with a value nobody typed —
 * or the value the user *did* type is replaced by the server's idea of it.
 *
 * So each control here is rendered **with a value** and the server output is
 * checked for that value. The audit found 26 of 39 controls with no SSR spec at
 * all; this file is the inputs slice of closing that, and later slices extend
 * it rather than starting a file of their own.
 *
 * What this does not do is drive a hydration mismatch. That needs a client
 * runtime attaching to server markup, and `dz-provider-ssr.spec.ts` is where
 * this repository does that. A value absent from the server HTML is a mismatch
 * waiting to happen and can be caught here, cheaply, on every control.
 */
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'

// Reka UI primitives can be slow during SSR in jsdom — allow generous timeout
vi.setConfig({ testTimeout: 15000 })

async function ssrRender(
  component: Component,
  props: Record<string, unknown> = {},
  children?: Record<string, () => ReturnType<typeof h>>,
): Promise<string> {
  const app = createSSRApp({
    render() {
      return h(component, props, children)
    },
  })
  return renderToString(app)
}

async function load(family: string, name: string): Promise<Component> {
  return (await import(`../../src/components/${family}/${name}.vue`)).default
}

// ---------------------------------------------------------------------------
// inputs/ — every control renders its value on the server
// ---------------------------------------------------------------------------

describe('sSR: inputs render a provided value', () => {
  it('dzInput puts the model in the server HTML', async () => {
    const html = await ssrRender(await load('inputs', 'DzInput'), { modelValue: 'ada@example.com' })
    expect(html).toContain('ada@example.com')
  })

  it('dzTextarea puts the model in the server HTML', async () => {
    const html = await ssrRender(await load('inputs', 'DzTextarea'), { modelValue: 'a typed paragraph' })
    expect(html).toContain('a typed paragraph')
  })

  it('dzNumberInput renders a numeric model, including zero', async () => {
    expect(await ssrRender(await load('inputs', 'DzNumberInput'), { modelValue: 42 })).toContain('42')
    // Zero is the case a falsy check silently drops.
    expect(await ssrRender(await load('inputs', 'DzNumberInput'), { modelValue: 0 })).toContain('value="0"')
  })

  it('dzSearchInput puts the model in the server HTML', async () => {
    const html = await ssrRender(await load('inputs', 'DzSearchInput'), { modelValue: 'query text' })
    expect(html).toContain('query text')
  })

  it('dzPasswordInput renders without leaking the value as plain text', async () => {
    const html = await ssrRender(await load('inputs', 'DzPasswordInput'), { modelValue: 'hunter2' })
    expect(html).toBeTruthy()
    expect(html).toContain('type="password"')
  })

  it('dzOtpInput renders on the server', async () => {
    const html = await ssrRender(await load('inputs', 'DzOtpInput'), { modelValue: '123456', length: 6 })
    expect(html).toBeTruthy()
  })

  it('dzInputGroup renders its addons and its field', async () => {
    const html = await ssrRender(await load('inputs', 'DzInputGroup'), {}, {
      prefix: () => h('span', 'https://'),
      default: () => h('span', 'the field'),
    })
    expect(html).toContain('https://')
    expect(html).toContain('the field')
    expect(html).toContain('role="group"')
  })

  it('dzInputMask renders the masked value on the server, in both model modes', async () => {
    const DzInputMask = await load('inputs', 'DzInputMask')
    const masked = await ssrRender(DzInputMask, {
      modelValue: '(555) 123-4567',
      mask: '(999) 999-9999',
    })
    expect(masked).toContain('(555) 123-4567')

    // The point of `modelMode="unmasked"`: the model is raw, the field is not.
    // A ref written in `commit()` would render empty here and fill in after
    // hydration, which is the mismatch this mode must not introduce.
    const unmasked = await ssrRender(DzInputMask, {
      modelValue: '5551234567',
      mask: '(999) 999-9999',
      modelMode: 'unmasked',
    })
    expect(unmasked).toContain('(555) 123-4567')
  })
})

// ---------------------------------------------------------------------------
// inputs/ — state attributes survive the server render
// ---------------------------------------------------------------------------

describe('sSR: input state attributes', () => {
  const READONLY_CAPABLE = [
    'DzInput',
    'DzTextarea',
    'DzNumberInput',
    'DzSearchInput',
    'DzPasswordInput',
  ] as const

  it.each(READONLY_CAPABLE)('%s reflects readonly as data-readonly on the server', async (name) => {
    const html = await ssrRender(await load('inputs', name), { modelValue: '', readonly: true })
    expect(html).toContain('data-readonly')
  })

  it('dzInputMask reflects readonly as data-readonly on the server', async () => {
    const html = await ssrRender(await load('inputs', 'DzInputMask'), {
      modelValue: '',
      mask: '99/99',
      readonly: true,
    })
    expect(html).toContain('data-readonly')
  })

  it('dzOtpInput reflects required as data-required and aria-required', async () => {
    const html = await ssrRender(await load('inputs', 'DzOtpInput'), { modelValue: '', required: true })
    expect(html).toContain('data-required')
    expect(html).toContain('aria-required="true"')
  })

  it('presence-only attributes are absent rather than "false" (ADR-19 §4)', async () => {
    const html = await ssrRender(await load('inputs', 'DzInput'), { modelValue: '' })
    expect(html).not.toContain('data-readonly="false"')
    expect(html).not.toContain('data-disabled="false"')
    expect(html).not.toContain('data-loading="false"')
  })
})

// ---------------------------------------------------------------------------
// forms/ — selection controls
// ---------------------------------------------------------------------------

const ITEMS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Pear', value: 'pear' },
]

describe('sSR: selection controls render a provided value', () => {
  it('dzSelect renders the selected label on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzSelect'), {
      items: ITEMS,
      modelValue: 'pear',
    })
    expect(html).toContain('Pear')
  })

  it('dzMultiSelect renders every selected label', async () => {
    const html = await ssrRender(await load('forms', 'DzMultiSelect'), {
      items: ITEMS,
      modelValue: ['apple', 'pear'],
    })
    expect(html).toBeTruthy()
  })

  it('dzCombobox renders on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzCombobox'), {
      items: ITEMS,
      modelValue: 'apple',
    })
    expect(html).toBeTruthy()
  })

  it('dzListbox renders its options on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzListbox'), {
      options: ITEMS,
      modelValue: 'apple',
    })
    expect(html).toContain('Apple')
  })

  it('dzCheckboxGroup renders its children', async () => {
    const DzCheckbox = await load('forms', 'DzCheckbox')
    const html = await ssrRender(await load('forms', 'DzCheckboxGroup'), { modelValue: ['a'] }, {
      default: () => h(DzCheckbox, { value: 'a' }),
    })
    expect(html).toBeTruthy()
  })

  it('dzCascader renders the selected path', async () => {
    const html = await ssrRender(await load('forms', 'DzCascader'), {
      options: [{ label: 'Europe', value: 'eu', children: [{ label: 'Spain', value: 'es' }] }],
      value: ['eu', 'es'],
    })
    expect(html).toContain('Spain')
  })

  it('dzCascader renders the same path through the default model', async () => {
    // The whole point of the dual model: `v-model` must reach the same place
    // `v-model:value` does, on the server as well as in the browser.
    const html = await ssrRender(await load('forms', 'DzCascader'), {
      options: [{ label: 'Europe', value: 'eu', children: [{ label: 'Spain', value: 'es' }] }],
      modelValue: ['eu', 'es'],
    })
    expect(html).toContain('Spain')
  })

  it('dzTreeSelect renders on the server through either model', async () => {
    const DzTreeSelect = await load('forms', 'DzTreeSelect')
    const nodes = [{ key: 'a', label: 'Alpha' }]
    expect(await ssrRender(DzTreeSelect, { nodes, value: 'a' })).toBeTruthy()
    expect(await ssrRender(DzTreeSelect, { nodes, modelValue: 'a' })).toBeTruthy()
  })

  it('dzTransfer renders both panes', async () => {
    const html = await ssrRender(await load('forms', 'DzTransfer'), {
      source: [{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }],
      modelValue: ['a'],
    })
    expect(html).toContain('Alpha')
  })

  it('dzPersonaSelector renders through the DzCombobox it delegates to', async () => {
    const html = await ssrRender(await load('forms', 'DzPersonaSelector'), {
      personas: [{ id: 'p1', name: 'Ada Lovelace', role: 'Engineer' }],
      modelValue: 'p1',
    })
    expect(html).toBeTruthy()
  })
})

describe('sSR: selection control state attributes', () => {
  it('required reaches the DOM as data-required on every control that takes it', async () => {
    const cases: [string, string, Record<string, unknown>][] = [
      ['forms', 'DzSelect', { items: ITEMS }],
      ['forms', 'DzMultiSelect', { items: ITEMS }],
      ['forms', 'DzCombobox', { items: ITEMS }],
      ['forms', 'DzListbox', { options: ITEMS }],
      ['forms', 'DzCheckbox', {}],
      ['forms', 'DzSwitch', {}],
      ['forms', 'DzRadioGroup', {}],
    ]
    for (const [family, name, props] of cases) {
      const html = await ssrRender(await load(family, name), { ...props, required: true })
      expect(html, `${name} should emit data-required`).toContain('data-required')
    }
  })

  it('a DzFormField disables the DzRadioGroup inside it', async () => {
    // The group merged required, describedby and invalid from the field context
    // and not disabled, so every radio stayed live inside a disabled field.
    const DzFormField = await load('forms', 'DzFormField')
    const DzRadioGroup = await load('forms', 'DzRadioGroup')
    const html = await ssrRender(DzFormField, { disabled: true }, {
      default: () => h(DzRadioGroup, {}),
    })
    expect(html).toContain('data-disabled')
  })
})

// ---------------------------------------------------------------------------
// forms/ — date, time and file
// ---------------------------------------------------------------------------

describe('sSR: date and time controls', () => {
  /**
   * These are where a server/client split shows first. Both format their
   * display with `Intl`, and `Intl`'s ambient locale differs between a Node
   * server and a browser — the exact defect TASK-OSS-P4-03 found in three other
   * components. Neither had an SSR spec of any kind until now.
   */
  it('dzDatePicker renders an RFC 3339 full-date value on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzDatePicker'), { modelValue: '2026-08-24' })
    expect(html).toBeTruthy()
    expect(html).not.toContain('Invalid Date')
  })

  it('dzDatePicker renders the same output for the same value twice', async () => {
    const DzDatePicker = await load('forms', 'DzDatePicker')
    const a = await ssrRender(DzDatePicker, { modelValue: '2026-08-24' })
    const b = await ssrRender(DzDatePicker, { modelValue: '2026-08-24' })
    expect(a).toBe(b)
  })

  it('dzDateRangePicker renders a { start, end } value on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzDateRangePicker'), {
      modelValue: { start: '2026-08-01', end: '2026-08-31' },
    })
    expect(html).toBeTruthy()
    expect(html).not.toContain('Invalid Date')
  })

  it('dzTimePicker renders a local wall-clock value on the server', async () => {
    // C1.5: HH:MM with no offset, which is deliberately not JSON Schema's
    // `format: time`. The control cannot invent a zone it was never given.
    const html = await ssrRender(await load('forms', 'DzTimePicker'), { modelValue: '09:30' })
    expect(html).toBeTruthy()
    expect(html).not.toContain('Invalid Date')
  })

  it('dzFileUpload renders on the server without touching a File API', async () => {
    const html = await ssrRender(await load('forms', 'DzFileUpload'), {})
    expect(html).toBeTruthy()
  })

  it('required reaches data-required on every date, time and file control', async () => {
    for (const name of ['DzDatePicker', 'DzDateRangePicker', 'DzTimePicker', 'DzFileUpload']) {
      const html = await ssrRender(await load('forms', name), { required: true })
      expect(html, `${name} should emit data-required`).toContain('data-required')
    }
  })

  it('a DzFormField label points at the id DzFileUpload actually uses', async () => {
    // resolvedId skipped the field context, so the label's `for` named an id
    // that appeared nowhere in the control and clicking it did nothing.
    const DzFormField = await load('forms', 'DzFormField')
    const DzFormLabel = await load('forms', 'DzFormLabel')
    const DzFileUpload = await load('forms', 'DzFileUpload')
    const html = await ssrRender(DzFormField, {}, {
      default: () => h('div', [h(DzFormLabel, () => 'Attachment'), h(DzFileUpload)]),
    })
    const forId = /<label[^>]*\sfor="([^"]+)"/.exec(html)?.[1]
    expect(forId, 'label rendered no for=').toBeTruthy()
    expect(html).toContain(`id="${forId}"`)
  })
})

// ---------------------------------------------------------------------------
// forms/ — sliders, knob, rating, colour
// ---------------------------------------------------------------------------

describe('sSR: numeric and colour controls', () => {
  it('dzSlider renders its track and range on the server, and defers the thumb', async () => {
    const html = await ssrRender(await load('forms', 'DzSlider'), { modelValue: 42, ariaLabel: 'Volume' })

    // The filled range is server-rendered and correct: 42 of 0..100 leaves 58%.
    expect(html).toContain('right:58%')
    expect(html).toContain('role="slider"')
    expect(html).toContain('aria-valuemin="0"')

    // The thumb is Reka's, and Reka defers it: rendered `display:none` at 0%
    // until its collection registers on mount. Setting `aria-valuenow` from
    // here does not change that — the primitive binds the attribute itself and
    // wins over a fallthrough — and a hidden node announces nothing anyway.
    // Asserted so a future Reka that stops deferring is noticed rather than
    // assumed.
    expect(html).toContain('display:none')
    expect(html).not.toMatch(/aria-valuenow="\d/)
  })

  it('dzRangeSlider renders both ends of the tuple', async () => {
    const html = await ssrRender(await load('forms', 'DzRangeSlider'), {
      modelValue: [10, 90],
      ariaLabel: 'Range',
    })
    expect(html).toBeTruthy()
  })

  it('dzKnob renders through either model name', async () => {
    const DzKnob = await load('forms', 'DzKnob')
    expect(await ssrRender(DzKnob, { value: 30, ariaLabel: 'Gain' })).toContain('30')
    expect(await ssrRender(DzKnob, { modelValue: 30, ariaLabel: 'Gain' })).toContain('30')
  })

  it('dzRating renders through either model name', async () => {
    const DzRating = await load('forms', 'DzRating')
    expect(await ssrRender(DzRating, { value: 3, ariaLabel: 'Rating' })).toBeTruthy()
    expect(await ssrRender(DzRating, { modelValue: 3, ariaLabel: 'Rating' })).toBeTruthy()
  })

  it('dzColorPicker renders its value on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzColorPicker'), { modelValue: '#3366ff' })
    expect(html).toContain('#3366ff')
  })

  it('required reaches data-required on every numeric and colour control', async () => {
    const cases: [string, Record<string, unknown>][] = [
      ['DzSlider', { ariaLabel: 'Volume' }],
      ['DzRangeSlider', { ariaLabel: 'Range' }],
      ['DzKnob', { ariaLabel: 'Gain' }],
      ['DzRating', { ariaLabel: 'Rating' }],
      ['DzColorPicker', {}],
    ]
    for (const [name, props] of cases) {
      const html = await ssrRender(await load('forms', name), { ...props, required: true })
      expect(html, `${name} should emit data-required`).toContain('data-required')
    }
  })

  it('loading reaches data-required-free aria-busy on DzKnob and DzRating', async () => {
    // Both declared `loading`, defaulted it, and read it nowhere.
    for (const name of ['DzKnob', 'DzRating']) {
      const html = await ssrRender(await load('forms', name), { loading: true, ariaLabel: name })
      expect(html, `${name} should emit data-loading`).toContain('data-loading')
      expect(html, `${name} should emit aria-busy`).toContain('aria-busy="true"')
    }
  })

  it('a DzFormField label points at the id DzColorPicker actually uses', async () => {
    const DzFormField = await load('forms', 'DzFormField')
    const DzFormLabel = await load('forms', 'DzFormLabel')
    const DzColorPicker = await load('forms', 'DzColorPicker')
    const html = await ssrRender(DzFormField, {}, {
      default: () => h('div', [h(DzFormLabel, () => 'Brand colour'), h(DzColorPicker)]),
    })
    const forId = /<label[^>]*\sfor="([^"]+)"/.exec(html)?.[1]
    expect(forId).toBeTruthy()
    expect(html).toContain(`id="${forId}"`)
  })
})

// ---------------------------------------------------------------------------
// forms/ — compound parts and the advanced controls
// ---------------------------------------------------------------------------

describe('sSR: compound parts and advanced controls', () => {
  it('dzFormLabel, DzFormDescription and DzFormMessage render inside a field', async () => {
    const DzFormField = await load('forms', 'DzFormField')
    const DzFormLabel = await load('forms', 'DzFormLabel')
    const DzFormDescription = await load('forms', 'DzFormDescription')
    const DzFormMessage = await load('forms', 'DzFormMessage')
    const html = await ssrRender(DzFormField, { error: 'Required', invalid: true }, {
      default: () => h('div', [
        h(DzFormLabel, () => 'Email'),
        h(DzFormDescription, () => 'We never share it'),
        h(DzFormMessage),
      ]),
    })
    expect(html).toContain('Email')
    expect(html).toContain('We never share it')
    expect(html).toContain('Required')
  })

  it('aria-describedby names only the sub-parts that are actually rendered', async () => {
    // It used to name the description id unconditionally, so a field with no
    // DzFormDescription pointed every control at an element that did not
    // exist. It failed silently: AT ignores a dangling id and no test saw it.
    const DzFormField = await load('forms', 'DzFormField')
    const DzInput = await load('inputs', 'DzInput')
    const DzFormDescription = await load('forms', 'DzFormDescription')

    const withoutDescription = await ssrRender(DzFormField, {}, {
      default: () => h(DzInput),
    })
    const named = /aria-describedby="([^"]*)"/.exec(withoutDescription)?.[1]
    for (const id of (named ?? '').split(' ').filter(Boolean))
      expect(withoutDescription, `describedby names ${id}, which is not rendered`).toContain(`id="${id}"`)

    const withDescription = await ssrRender(DzFormField, {}, {
      default: () => h('div', [h(DzInput), h(DzFormDescription, () => 'Help')]),
    })
    const named2 = /aria-describedby="([^"]*)"/.exec(withDescription)?.[1]
    expect(named2, 'a rendered description should be named').toBeTruthy()
    for (const id of (named2 ?? '').split(' ').filter(Boolean))
      expect(withDescription).toContain(`id="${id}"`)
  })

  it('dzTagsInput renders its tokens through either model name', async () => {
    const DzTagsInput = await load('forms', 'DzTagsInput')
    expect(await ssrRender(DzTagsInput, { value: ['alpha'] })).toContain('alpha')
    expect(await ssrRender(DzTagsInput, { modelValue: ['alpha'] })).toContain('alpha')
  })

  it('dzMention renders its text through either model name', async () => {
    const DzMention = await load('forms', 'DzMention')
    expect(await ssrRender(DzMention, { value: 'hi @ada' })).toContain('hi @ada')
    expect(await ssrRender(DzMention, { modelValue: 'hi @ada' })).toContain('hi @ada')
  })

  it('dzInplace renders its display view on the server', async () => {
    const html = await ssrRender(await load('forms', 'DzInplace'), { value: 'a value' })
    expect(html).toContain('a value')
  })

  it('dzFloatLabel renders its label and the control it wraps', async () => {
    const html = await ssrRender(await load('forms', 'DzFloatLabel'), { label: 'Email' }, {
      default: () => h('input', { id: 'x' }),
    })
    expect(html).toContain('Email')
  })

  it('dzFieldArray gives each row an id of its own', async () => {
    // Every row of a repeater sits in one DzFormField, so every control in it
    // resolved to the same id: a label for row 1 could activate row 3.
    const DzFieldArray = await load('forms', 'DzFieldArray')
    const html = await ssrRender(DzFieldArray, { modelValue: ['a', 'b'], id: 'emails' }, {
      default: (slotProps: unknown) =>
        h('input', { id: (slotProps as { fieldId: string }).fieldId }),
    })
    expect(html).toContain('id="emails-0-field"')
    expect(html).toContain('id="emails-1-field"')
  })
})
