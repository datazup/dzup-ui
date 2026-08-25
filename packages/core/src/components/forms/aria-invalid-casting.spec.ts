/**
 * Does an unset `ariaInvalid` prop reach the template as `undefined`?
 *
 * It matters more than it looks. `BaseAccessibilityProps.ariaInvalid` is typed
 * `boolean | 'grammar' | 'spelling'`, so Vue may declare it a Boolean prop —
 * and a Boolean prop that is not passed arrives as `false`, not `undefined`.
 *
 * Every form control resolves invalid state as
 * `ariaInvalid ?? (resolvedInvalid || undefined)`. `??` only falls through on
 * `null`/`undefined`. If the cast made it `false`, the fallback would never run
 * and the control would announce `aria-invalid="false"` on a field its own
 * `invalid` prop says is invalid — silently, on every control, with no test
 * failing.
 *
 * **It does not.** A union prop type (`boolean | 'grammar' | 'spelling'`)
 * compiles to `[Boolean, String]`, and Vue only applies the absent-means-false
 * cast when `Boolean` is the sole or first-winning type. The `??` chains are
 * safe, and this spec is what says so rather than a comment claiming it.
 *
 * Written after a one-line `:aria-invalid="ariaInvalid"` on `DzInputGroup` —
 * where the prop stands alone with no `??` — shipped `aria-invalid="false"`,
 * and only a contract assertion caught it.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzCheckbox from './DzCheckbox.vue'
import DzCombobox from './DzCombobox.vue'
import DzDatePicker from './DzDatePicker.vue'
import DzMultiSelect from './DzMultiSelect.vue'
import DzRadioGroup from './DzRadioGroup.vue'
import DzSelect from './DzSelect.vue'
import DzSlider from './DzSlider.vue'
import DzSwitch from './DzSwitch.vue'

const ITEMS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Pear', value: 'pear' },
]

/**
 * Controls whose own `invalid` prop drives the announcement.
 *
 * The option-bearing ones are given options on purpose. Mounted without them,
 * `DzSelect` throws on `filteredItems.length` — `items` is a required prop with
 * no default, so an absent one reaches the template as `undefined` rather than
 * degrading to the "No options available" state the template already renders
 * two lines further down. Vue warns about the missing prop; the crash is what
 * happens next. Noted for the selection slice, not worked around here.
 */
const WITH_INVALID_PROP = [
  ['DzSelect', DzSelect, { items: ITEMS }],
  ['DzMultiSelect', DzMultiSelect, { items: ITEMS }],
  ['DzCombobox', DzCombobox, { items: ITEMS }],
  ['DzDatePicker', DzDatePicker, {}],
  ['DzSlider', DzSlider, { ariaLabel: 'Volume' }],
] as const

/**
 * Controls that have **no `invalid` prop**, only `ariaInvalid` and the field
 * context.
 *
 * This is an API asymmetry rather than a bug: they extend
 * `BaseAccessibilityProps` without `BaseValidationProps`, so
 * `<DzCheckbox invalid />` sets an unknown attribute and does nothing, while
 * `<DzSelect invalid />` works. A renderer must know which kind it is holding —
 * which is exactly the per-control special case the renderer contract exists to
 * remove. Recorded as a C3 item for the selection slice; asserted here so the
 * current behaviour is written down rather than assumed.
 */
const ARIA_ONLY = [
  ['DzSwitch', DzSwitch, {}],
  ['DzCheckbox', DzCheckbox, {}],
  ['DzRadioGroup', DzRadioGroup, {}],
] as const

const ALL = [...WITH_INVALID_PROP, ...ARIA_ONLY]

describe('aria-invalid is never announced as the string "false"', () => {
  it.each(ALL)('%s omits aria-invalid when nothing says it is invalid', (_name, component, props) => {
    const wrapper = mount(component, { props: { ...props } })
    expect(wrapper.html()).not.toContain('aria-invalid="false"')
  })

  it.each(ALL)('%s announces aria-invalid="true" when the ariaInvalid prop is set', (_name, component, props) => {
    const wrapper = mount(component, { props: { ...props, ariaInvalid: true } })
    expect(wrapper.html()).toContain('aria-invalid="true"')
  })
})

describe('the invalid prop reaches aria-invalid where the control declares one', () => {
  it.each(WITH_INVALID_PROP)('%s announces aria-invalid="true" for invalid', (_name, component, props) => {
    const wrapper = mount(component, { props: { ...props, invalid: true } })
    expect(wrapper.html()).toContain('aria-invalid="true"')
  })

  it.each(ARIA_ONLY)('%s has no invalid prop, so invalid alone changes nothing', (_name, component, props) => {
    const wrapper = mount(component, { props: { ...props, invalid: true } })
    expect(wrapper.html()).not.toContain('aria-invalid="true"')
  })
})
