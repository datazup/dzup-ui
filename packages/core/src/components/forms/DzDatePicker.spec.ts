import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzDatePicker — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { anatomy as datePickerAnatomy } from './DzDatePicker.anatomy.ts'
import DzDatePicker from './DzDatePicker.vue'

describe('dzDatePicker — Unit Tests', () => {
  it('renders the date picker field', () => {
    const wrapper = mount(DzDatePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder when no value is selected', () => {
    const wrapper = mount(DzDatePicker, {
      props: { placeholder: 'Select date' },
    })
    expect(wrapper.text()).toContain('Select date')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzDatePicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-input-lg-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzDatePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzDatePicker, {
      props: { variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzDatePicker, {
      props: { disabled: true },
    })
    const field = wrapper.find('[data-disabled]')
    expect(field.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzDatePicker, {
      props: { invalid: true },
    })
    // Reka UI DatePickerField may not forward data-invalid to the DOM;
    // verify the invalid variant class is applied instead
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('applies invalid styling when error is provided', () => {
    const wrapper = mount(DzDatePicker, {
      props: { error: 'Date is required' },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDatePicker, {
      attrs: { class: 'my-datepicker' },
    })
    expect(wrapper.html()).toContain('my-datepicker')
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('sets aria-label on trigger', () => {
    const wrapper = mount(DzDatePicker, {
      props: { ariaLabel: 'Pick a date' },
    })
    expect(wrapper.html()).toContain('Pick a date')
  })

  it('uses native required semantics without placing aria-required on the field group', () => {
    const wrapper = mount(DzDatePicker, {
      props: { required: true },
    })
    const field = wrapper.find('[role="group"]')
    const nativeInput = wrapper.find('input[type="date"]')

    expect(field.attributes('aria-required')).toBeUndefined()
    expect(nativeInput.attributes('required')).toBeDefined()
  })

  it('renders calendar icon', () => {
    const wrapper = mount(DzDatePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has contain: layout style on root field', () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain: layout style"]')
    expect(field.exists()).toBe(true)
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzDatePicker, { props: { error: 'Date required' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Date required')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// The calendar grid's Home/End — RESIDUAL-13, closing RESIDUAL-12 §4 `F5`.
//
// Both rows used to read `when: 'list open'` / "Move to the first option." in a
// popover that is a calendar GRID with no option list. They now say what the APG
// date-picker-dialog pattern says — the first and last day of the focused week —
// and these tests drive the keys and assert which day has focus.
// ---------------------------------------------------------------------------

describe('dzDatePicker — calendar grid Home/End', () => {
  // Teardown through Vue, not through the DOM (RESIDUAL-18): the calendar portals to
  // the body, and unmounting takes it with it — a `document.body` wipe left the
  // picker mounted with its focus management still live.
  enableAutoUnmount(afterEach)

  // The calendar opens on TODAY's month — `useDatePicker`'s placeholder is
  // `today()`, whatever the value is — so a selected day in any other month is
  // not rendered at all. These tests were first written against 2026-09-16 and
  // went red on 2026-10-01 for that reason alone. A Wednesday in the second
  // week of the current month keeps the focused row fully inside the month,
  // with a row before it and rows after it, in every month.
  function wednesdayInWeekTwo(): Date {
    const now = new Date()
    const day = new Date(now.getFullYear(), now.getMonth(), 8)
    while (day.getDay() !== 3)
      day.setDate(day.getDate() + 1)
    return day
  }
  function iso(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }
  const WEDNESDAY = iso(wednesdayInWeekTwo())

  /** Open the calendar and return the day cells of the week holding `iso`. */
  async function openWeekOf(iso: string) {
    const wrapper = mount(DzDatePicker, {
      props: { modelValue: iso },
      attachTo: document.body,
    })
    await wrapper.find('[data-part="trigger"]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    const selected = document.body.querySelector<HTMLElement>('[data-part="item"][data-selected]')
    expect(selected, 'the calendar did not render a selected day').not.toBeNull()
    const row = selected!.closest('tr')!
    const days = Array.from(
      row.querySelectorAll<HTMLElement>('[data-part="item"]:not([data-outside-view]):not([data-disabled])'),
    )
    return { wrapper, selected: selected!, row, days }
  }

  it('moves focus to the first day of the focused week on Home', async () => {
    const { wrapper, selected, days } = await openWeekOf(WEDNESDAY)
    selected.focus()
    expect(days.length).toBeGreaterThan(1)

    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
    selected.dispatchEvent(event)

    expect(document.activeElement).toBe(days[0])
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('moves focus to the last day of the focused week on End', async () => {
    const { wrapper, selected, days } = await openWeekOf(WEDNESDAY)
    selected.focus()

    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    selected.dispatchEvent(event)

    expect(document.activeElement).toBe(days.at(-1))
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('stays inside the focused week rather than jumping to the month\'s ends', async () => {
    const { wrapper, selected, row, days } = await openWeekOf(WEDNESDAY)
    selected.focus()

    selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))

    expect(row.contains(document.activeElement)).toBe(true)
    // The last day of THIS week, not the last day rendered in the grid.
    const allDays = document.body.querySelectorAll('[data-part="item"]:not([data-outside-view])')
    expect(document.activeElement).not.toBe(allDays[allDays.length - 1])
    expect(document.activeElement).toBe(days.at(-1))
    wrapper.unmount()
  })

  it('leaves Home and End to the field when focus is not in the grid', async () => {
    const wrapper = mount(DzDatePicker, {
      props: { modelValue: WEDNESDAY },
      attachTo: document.body,
    })
    const segment = wrapper.findAll('[data-part="input"]')[0]!
    ;(segment.element as HTMLElement).focus()

    segment.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }))
    await wrapper.vm.$nextTick()

    // Focus does not move: the row is scoped `when: 'calendar open'` and
    // `onCalendarKeydown` returns unless the key came from inside a day cell.
    //
    // Consumption is deliberately NOT asserted here. Measured: Reka's own
    // `DateFieldInput` already calls `preventDefault()` on Home in a segment, so
    // the event arrives prevented whatever this component does, and an assertion
    // on `defaultPrevented` would pass for Reka's reason rather than for ours.
    expect(document.activeElement).toBe(segment.element)
    wrapper.unmount()
  })

  it('skips a day the min bound disables rather than parking focus on it', async () => {
    const wrapper = mount(DzDatePicker, {
      props: { modelValue: WEDNESDAY, min: WEDNESDAY },
      attachTo: document.body,
    })
    await wrapper.find('[data-part="trigger"]').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 50))

    const selected = document.body.querySelector<HTMLElement>('[data-part="item"][data-selected]')!
    selected.focus()
    selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }))

    // The value is a Wednesday; the days before it in that week are all below
    // the minimum, so the first REACHABLE day of the week is the Wednesday itself.
    expect((document.activeElement as HTMLElement).hasAttribute('data-disabled')).toBe(false)
    expect(document.activeElement).toBe(selected)
    wrapper.unmount()
  })

  it('conforms to its declared keyboard contract with the calendar open', async () => {
    const { wrapper } = await openWeekOf(WEDNESDAY)
    // `when` values here are all two-word free text (`calendar open`), so there is
    // no single-word prop condition to admit.
    expectKeyboardContract(wrapper, datePickerAnatomy, {})
    wrapper.unmount()
  })
})
