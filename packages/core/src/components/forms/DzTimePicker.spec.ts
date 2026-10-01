import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzTimePicker — Unit / behavior tests.
 *
 * Dropdown time picker (Reka UI Popover). The popover content is rendered via
 * a portal; tests stub `PopoverPortal` so the panel renders inline, then open
 * the picker by clicking the trigger.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { anatomy as timePickerAnatomy } from './DzTimePicker.anatomy.ts'
import DzTimePicker from './DzTimePicker.vue'

/** Stub the portal so popover content renders inline (not teleported). */
const InlinePortal = { template: '<div><slot /></div>' }

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(DzTimePicker, {
    props,
    global: { stubs: { PopoverPortal: InlinePortal } },
    attachTo: document.body,
  })
}

function mountRealPicker(props: Record<string, unknown> = {}) {
  return mount(DzTimePicker, { props, attachTo: document.body })
}

/** Open the popover by clicking the trigger button. */
async function open(wrapper: ReturnType<typeof mountPicker>) {
  await wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
}

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). Each of the five `describe`
 * blocks below used to carry its own `document.body` wipe — five copies of a hook that
 * detached the markup and left the picker mounted with its popover listeners live.
 * One `enableAutoUnmount` replaces all five and actually unmounts.
 */
enableAutoUnmount(afterEach)

describe('dzTimePicker — Trigger', () => {
  it('renders a trigger button', () => {
    const wrapper = mountPicker()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows the placeholder while empty', () => {
    const wrapper = mountPicker({ placeholder: 'Select time' })
    expect(wrapper.text()).toContain('Select time')
  })

  it('uses the placeholder to name a standalone combobox trigger', () => {
    const wrapper = mountPicker({ placeholder: 'Pick a time' })
    expect(wrapper.get('[role="combobox"]').attributes('aria-label')).toBe('Pick a time')
  })

  it('prefers explicit ARIA labelling over the standalone placeholder fallback', () => {
    const labelled = mountPicker({ placeholder: 'Pick a time', ariaLabel: 'Meeting time' })
    expect(labelled.get('[role="combobox"]').attributes('aria-label')).toBe('Meeting time')

    const labelledBy = mountPicker({ placeholder: 'Pick a time', ariaLabelledby: 'time-label' })
    const trigger = labelledBy.get('[role="combobox"]')
    expect(trigger.attributes('aria-label')).toBeUndefined()
    expect(trigger.attributes('aria-labelledby')).toBe('time-label')
  })

  it('displays a bound 24-hour value', () => {
    const wrapper = mountPicker({ modelValue: '14:30', hour12: false })
    expect(wrapper.text()).toContain('14')
    expect(wrapper.text()).toContain('30')
  })

  it('displays a bound value in 12-hour format with meridiem', () => {
    const wrapper = mountPicker({ modelValue: '14:30', hour12: true })
    expect(wrapper.text()).toContain('PM')
  })

  it('applies size variant classes', () => {
    const wrapper = mountPicker({ size: 'lg' })
    expect(wrapper.html()).toContain('dz-input-lg-height')
  })

  it('applies the filled variant', () => {
    const wrapper = mountPicker({ variant: 'filled' })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('marks the trigger disabled', () => {
    const wrapper = mountPicker({ disabled: true })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('applies invalid styling', () => {
    const wrapper = mountPicker({ invalid: true })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountPicker({})
    const wrapper2 = mount(DzTimePicker, {
      attrs: { class: 'my-time' },
      global: { stubs: { PopoverPortal: InlinePortal } },
    })
    expect(wrapper2.html()).toContain('my-time')
    wrapper.unmount()
  })

  it('renders the clock indicator by default and hides it when disabled', () => {
    expect(mountPicker().find('svg').exists()).toBe(true)
    expect(mountPicker({ indicator: false }).findAll('svg').length).toBe(0)
  })

  it('reflects the required prop via aria-required', () => {
    const wrapper = mountPicker({ required: true })
    const trigger = wrapper.get('[role="combobox"]')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('aria-required')).toBe('true')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
  })

  it('renders a hidden form input carrying the value', () => {
    const wrapper = mountPicker({ name: 'meeting', modelValue: '08:15' })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('meeting')
    expect((hidden.element as HTMLInputElement).value).toBe('08:15')
  })

  it('renders an inline error linked via aria-describedby', () => {
    const wrapper = mountPicker({ error: 'Time required' })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.text()).toContain('Time required')
    const errorId = errorEl.attributes('id')!
    expect(wrapper.find(`[role="combobox"][aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})

describe('dzTimePicker — Cleaner', () => {
  it('shows the cleaner only when a value is set', () => {
    expect(mountPicker().find('[aria-label="Clear time"]').exists()).toBe(false)
    expect(mountPicker({ modelValue: '10:00' }).find('[aria-label="Clear time"]').exists()).toBe(true)
  })

  it('renders the cleaner as a sibling button, never inside the combobox trigger', () => {
    const wrapper = mountPicker({ modelValue: '10:00' })
    const trigger = wrapper.get('[role="combobox"]')
    const cleaner = wrapper.get('button[aria-label="Clear time"]')

    expect(trigger.element.contains(cleaner.element)).toBe(false)
    expect(trigger.find('button, [role="button"]').exists()).toBe(false)
  })

  it('clears the value and emits clear + change on cleaner click', async () => {
    const wrapper = mountPicker({ modelValue: '10:00' })
    await wrapper.find('[aria-label="Clear time"]').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual([''])
    expect(wrapper.emitted('open')).toBeFalsy()
    expect(document.activeElement).toBe(wrapper.get('[role="combobox"]').element)
  })

  it('hides the cleaner when cleaner=false', () => {
    const wrapper = mountPicker({ modelValue: '10:00', cleaner: false })
    expect(wrapper.find('[aria-label="Clear time"]').exists()).toBe(false)
  })
})

describe('dzTimePicker — Popover (roll layout)', () => {
  it('emits open when the trigger is clicked', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('renders the real Reka popover inline when portalDisabled is true', async () => {
    const wrapper = mountRealPicker({ portalDisabled: true })
    await open(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="listbox"][aria-label="Hours"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mountRealPicker()
    await open(wrapper)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(document.body.querySelector('[role="listbox"][aria-label="Hours"]')).not.toBeNull()
    expect(wrapper.find('[role="listbox"][aria-label="Hours"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders hour and minute columns when open', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    expect(wrapper.find('[role="listbox"][aria-label="Hours"]').exists()).toBe(true)
    expect(wrapper.find('[role="listbox"][aria-label="Minutes"]').exists()).toBe(true)
  })

  it('renders a seconds column when seconds is enabled', async () => {
    const wrapper = mountPicker({ seconds: true })
    await open(wrapper)
    expect(wrapper.find('[role="listbox"][aria-label="Seconds"]').exists()).toBe(true)
  })

  it('renders an AM/PM column when hour12 is enabled', async () => {
    const wrapper = mountPicker({ hour12: true })
    await open(wrapper)
    expect(wrapper.find('[role="listbox"][aria-label="AM/PM"]').exists()).toBe(true)
  })

  it('steps the minute options', async () => {
    const wrapper = mountPicker({ step: 15 })
    await open(wrapper)
    const minutes = wrapper.find('[role="listbox"][aria-label="Minutes"]').findAll('button')
    expect(minutes.length).toBe(4) // 00, 15, 30, 45
  })

  it('commits immediately (footer=false) when hour and minute are picked', async () => {
    const wrapper = mountPicker({ footer: false, step: 30, hour12: false })
    await open(wrapper)
    const hours = wrapper.find('[role="listbox"][aria-label="Hours"]').findAll('button')
    await hours[9]!.trigger('click') // 24h hour "09"
    const minutes = wrapper.find('[role="listbox"][aria-label="Minutes"]').findAll('button')
    await minutes[1]!.trigger('click') // "30"
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual(['09:30'])
    expect(wrapper.emitted('change')).toBeTruthy()
  })

  it('stages selection behind the footer and commits only on confirm', async () => {
    const wrapper = mountPicker({ footer: true, step: 30, hour12: false })
    await open(wrapper)
    const hours = wrapper.find('[role="listbox"][aria-label="Hours"]').findAll('button')
    await hours[8]!.trigger('click') // "08"
    const minutes = wrapper.find('[role="listbox"][aria-label="Minutes"]').findAll('button')
    await minutes[0]!.trigger('click') // "00"
    // Nothing committed yet.
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    // Confirm.
    const footerButtons = wrapper.findAll('button').filter(b => b.text() === 'OK')
    await footerButtons[0]!.trigger('click')
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual(['08:00'])
  })

  it('disables out-of-range hours via min/max', async () => {
    const wrapper = mountPicker({ min: '09:00', max: '17:00', hour12: false })
    await open(wrapper)
    const hours = wrapper.find('[role="listbox"][aria-label="Hours"]').findAll('button')
    // 08:xx is fully before 09:00 → disabled.
    expect(hours[8]!.attributes('disabled')).toBeDefined()
    // 10:xx is within range → enabled.
    expect(hours[10]!.attributes('disabled')).toBeUndefined()
  })
})

describe('dzTimePicker — Popover (select layout)', () => {
  it('renders native selects', async () => {
    const wrapper = mountPicker({ selection: 'select' })
    await open(wrapper)
    expect(wrapper.find('select[aria-label="Select hours"]').exists()).toBe(true)
    expect(wrapper.find('select[aria-label="Select minutes"]').exists()).toBe(true)
  })

  it('commits via select change when footer=false', async () => {
    const wrapper = mountPicker({ selection: 'select', footer: false, hour12: false })
    await open(wrapper)
    await wrapper.find('select[aria-label="Select hours"]').setValue('11')
    await wrapper.find('select[aria-label="Select minutes"]').setValue('45')
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual(['11:45'])
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F3`. Its words: the declared `Enter` IS
// backed (the trigger is a real button), "so the list opens; nothing moves the
// highlight once it is open". Both halves of the combobox contract are asserted.
// ---------------------------------------------------------------------------

describe('dzTimePicker — APG combobox keyboard', () => {
  /** Enabled option buttons of one named roll column, in DOM order. */
  function columnOptions(wrapper: ReturnType<typeof mountPicker>, label: string) {
    return wrapper
      .get(`[role="listbox"][aria-label="${label}"]`)
      .findAll('button:not([disabled])')
  }

  it('opens the list on ArrowDown from the trigger, and on ArrowUp', async () => {
    const down = mountPicker()
    await down.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' })
    await down.vm.$nextTick()
    expect(down.emitted('open')).toBeTruthy()
    expect(down.find('[role="listbox"][aria-label="Hours"]').exists()).toBe(true)

    const up = mountPicker()
    await up.get('[role="combobox"]').trigger('keydown', { key: 'ArrowUp' })
    await up.vm.$nextTick()
    expect(up.emitted('open')).toBeTruthy()
  })

  it('does not open a disabled picker from the keyboard', async () => {
    const wrapper = mountPicker({ disabled: true })
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    wrapper.get('[role="combobox"]').element.dispatchEvent(event)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('open')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)
  })

  it('moves the highlight down and up inside the hours column once open', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    const hours = columnOptions(wrapper, 'Hours')
    const column = wrapper.get('[role="listbox"][aria-label="Hours"]')
    ;(hours[0]!.element as HTMLElement).focus()

    await column.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(hours[1]!.element)

    await column.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(hours[0]!.element)
  })

  it('moves to the first and last option of the column on Home and End', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    const hours = columnOptions(wrapper, 'Hours')
    const column = wrapper.get('[role="listbox"][aria-label="Hours"]')

    await column.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(hours.at(-1)!.element)
    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('23')

    await column.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(hours[0]!.element)
    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('00')
  })

  it('keeps each unit column separate — End in Hours does not land in Minutes', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    const hoursColumn = wrapper.get('[role="listbox"][aria-label="Hours"]')
    const minutesColumn = wrapper.get('[role="listbox"][aria-label="Minutes"]')

    await hoursColumn.trigger('keydown', { key: 'End' })

    expect(hoursColumn.element.contains(document.activeElement)).toBe(true)
    expect(minutesColumn.element.contains(document.activeElement)).toBe(false)
  })

  it('does not wrap past the ends of a column', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    const hours = columnOptions(wrapper, 'Hours')
    const column = wrapper.get('[role="listbox"][aria-label="Hours"]')

    await column.trigger('keydown', { key: 'End' })
    await column.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(hours.at(-1)!.element)

    await column.trigger('keydown', { key: 'Home' })
    await column.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(hours[0]!.element)
  })

  it('skips an out-of-range hour rather than parking focus on it', async () => {
    const wrapper = mountPicker({ min: '09:00', max: '17:00' })
    await open(wrapper)
    const column = wrapper.get('[role="listbox"][aria-label="Hours"]')

    await column.trigger('keydown', { key: 'Home' })

    // 00 is out of bounds and rendered `disabled`; the first reachable hour is 09.
    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('09')
    expect((document.activeElement as HTMLElement).hasAttribute('disabled')).toBe(false)
  })

  it('consumes all four navigation keys inside a column', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    const column = wrapper.get('[role="listbox"][aria-label="Hours"]')

    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      column.element.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was not consumed`).toBe(true)
    }
  })

  it('conforms to its declared keyboard contract with the panel open', async () => {
    const wrapper = mountPicker()
    await open(wrapper)
    // `when: 'list open'` is two words, so it is read as free text rather than as
    // a part name — no `conditions` to admit.
    expectKeyboardContract(wrapper, timePickerAnatomy, {})
  })
})
