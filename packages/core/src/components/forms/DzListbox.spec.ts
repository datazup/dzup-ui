import type { DzListboxOption } from './DzListbox.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzListbox — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzListbox from './DzListbox.vue'

const options: DzListboxOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
]

type Wrapper = ReturnType<typeof mount>

function optionByLabel(wrapper: Wrapper, label: string) {
  return wrapper.findAll('[role="option"]').find(o => o.text().includes(label))!
}

/** Returns the argument list of the most recently emitted `event`. */
function lastArgs(wrapper: Wrapper, event: string): unknown[] {
  const events = wrapper.emitted(event) as unknown[][] | undefined
  const arr = events ?? []
  const last = arr.length ? arr[arr.length - 1] : undefined
  return (last as unknown[] | undefined) ?? []
}

describe('dzListbox — behavior', () => {
  // ── Single selection ──

  it('selects a value on click (single mode)', async () => {
    const wrapper = mount(DzListbox, { props: { options } })
    await optionByLabel(wrapper, 'Banana').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual('banana')
  })

  it('emits change and select on selection', async () => {
    const wrapper = mount(DzListbox, { props: { options } })
    await optionByLabel(wrapper, 'Apple').trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('reflects a single selected value with aria-selected', () => {
    const wrapper = mount(DzListbox, { props: { options, modelValue: 'cherry' } })
    expect(optionByLabel(wrapper, 'Cherry').attributes('aria-selected')).toBe('true')
    expect(optionByLabel(wrapper, 'Apple').attributes('aria-selected')).toBe('false')
  })

  // ── Multiple selection ──

  it('emits an array in multiple mode', async () => {
    const wrapper = mount(DzListbox, {
      props: { options, multiple: true, modelValue: ['apple'] },
    })
    await optionByLabel(wrapper, 'Banana').trigger('click')
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual(['apple', 'banana'])
  })

  it('toggles an already-selected value off in multiple mode', async () => {
    const wrapper = mount(DzListbox, {
      props: { options, multiple: true, modelValue: ['apple', 'banana'] },
    })
    await optionByLabel(wrapper, 'Apple').trigger('click')
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual(['banana'])
  })

  // ── Range selection ──

  it('range-selects with Shift+click in multiple mode', async () => {
    const wrapper = mount(DzListbox, { props: { options, multiple: true } })
    // Establish an anchor with a normal click on the first option.
    await optionByLabel(wrapper, 'Apple').trigger('click')
    await wrapper.setProps({ modelValue: ['apple'] })
    // Shift+click the fourth option to select the contiguous range.
    await optionByLabel(wrapper, 'Date').trigger('click', { shiftKey: true })
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual([
      'apple',
      'banana',
      'cherry',
      'date',
    ])
  })

  it('does not range-select in single mode', async () => {
    const wrapper = mount(DzListbox, { props: { options, modelValue: 'apple' } })
    await optionByLabel(wrapper, 'Date').trigger('click', { shiftKey: true })
    // Single mode falls through to a normal selection of the clicked value.
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual('date')
  })

  // ── Filter ──

  it('narrows visible options to the filter query', async () => {
    const wrapper = mount(DzListbox, { props: { options, filter: true } })
    await wrapper.find('input').setValue('ap')
    const visible = wrapper.findAll('[role="option"]')
    expect(visible).toHaveLength(1)
    expect(visible[0]?.text()).toContain('Apple')
  })

  it('emits filter event with the query', async () => {
    const wrapper = mount(DzListbox, { props: { options, filter: true } })
    await wrapper.find('input').setValue('ban')
    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(lastArgs(wrapper, 'filter')[0]).toEqual('ban')
  })

  it('shows the empty message when the filter matches nothing', async () => {
    const wrapper = mount(DzListbox, {
      props: { options, filter: true, emptyMessage: 'No matches' },
    })
    await wrapper.find('input').setValue('zzzz')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('No matches')
  })

  // ── Disabled options ──

  it('marks disabled options and does not select them', async () => {
    const withDisabled: DzListboxOption[] = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana', disabled: true },
    ]
    const wrapper = mount(DzListbox, { props: { options: withDisabled } })
    const banana = optionByLabel(wrapper, 'Banana')
    expect(banana.attributes('data-disabled')).toBe('')
    await banana.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  // ── Arbitrary objects ──

  it('resolves arbitrary objects via optionLabel/optionValue', async () => {
    const cities = [
      { name: 'Paris', code: 'PAR' },
      { name: 'Tokyo', code: 'TYO' },
    ]
    const wrapper = mount(DzListbox, {
      props: { options: cities, optionLabel: 'name', optionValue: 'code' },
    })
    expect(wrapper.text()).toContain('Paris')
    await optionByLabel(wrapper, 'Tokyo').trigger('click')
    expect(lastArgs(wrapper, 'update:modelValue')[0]).toEqual('TYO')
  })

  // ── Grouping ──

  it('renders group labels when optionGroup is set', () => {
    const grouped = [
      { label: 'Apple', value: 'apple', kind: 'Fruit' },
      { label: 'Carrot', value: 'carrot', kind: 'Veg' },
    ]
    const wrapper = mount(DzListbox, {
      props: { options: grouped, optionGroup: 'kind' },
    })
    expect(wrapper.text()).toContain('Fruit')
    expect(wrapper.text()).toContain('Veg')
  })

  // ── Sizes / a11y ──

  it('applies size classes', () => {
    const wrapper = mount(DzListbox, { props: { options, size: 'lg' } })
    expect(wrapper.html()).toContain('dz-text-base')
  })

  it('does not throw on keyboard navigation keys', async () => {
    const wrapper = mount(DzListbox, { props: { options, multiple: true } })
    const listbox = wrapper.find('[role="listbox"]')
    await expect(
      listbox.trigger('keydown', { key: 'ArrowDown', shiftKey: true }),
    ).resolves.not.toThrow()
  })

  it('renders an icon component when provided', () => {
    const IconStub = { name: 'IconStub', template: '<svg data-icon="true" />' }
    const withIcon: DzListboxOption[] = [
      { label: 'Apple', value: 'apple', icon: IconStub },
    ]
    const wrapper = mount(DzListbox, { props: { options: withIcon } })
    expect(wrapper.find('[data-icon="true"]').exists()).toBe(true)
  })

  it('shows check indicators for selected options when checkmark is on', () => {
    const wrapper = mount(DzListbox, {
      props: { options, multiple: true, checkmark: true, modelValue: ['apple'] },
    })
    // The selected Apple option should contain the check indicator markup.
    expect(optionByLabel(wrapper, 'Apple').find('svg').exists()).toBe(true)
  })
})
