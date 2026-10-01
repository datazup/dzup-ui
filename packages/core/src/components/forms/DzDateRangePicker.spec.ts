import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzDateRangePicker — Unit / behavior tests.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { anatomy as dateRangePickerAnatomy } from './DzDateRangePicker.anatomy.ts'
import DzDateRangePicker from './DzDateRangePicker.vue'

describe('dzDateRangePicker — Unit Tests', () => {
  it('renders the date range picker field', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder when no range is selected', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { placeholder: 'Select range' },
    })
    expect(wrapper.text()).toContain('Select range')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { size: 'sm' },
    })
    expect(wrapper.html()).toContain('dz-input-sm-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { disabled: true },
    })
    const field = wrapper.find('[data-disabled]')
    expect(field.exists()).toBe(true)
  })

  it('applies invalid styling when invalid', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { invalid: true },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDateRangePicker, {
      attrs: { class: 'my-range' },
    })
    expect(wrapper.html()).toContain('my-range')
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders calendar icon', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has contain: layout style on root field', () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain: layout style"]')
    expect(field.exists()).toBe(true)
  })

  it('shows separator between start and end fields', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: {
        'modelValue': { start: '2026-01-15', end: '2026-01-31' },
        'onUpdate:modelValue': () => {},
      },
    })
    expect(wrapper.text()).toContain('-')
  })

  it('renders an inline error message linked via aria-describedby', () => {
    const wrapper = mount(DzDateRangePicker, { props: { error: 'Range required' } })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Range required')
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// The calendar grid's Home/End — RESIDUAL-13, closing RESIDUAL-12 §4 `F5`. The
// same two rows as DzDatePicker's, corrected the same way and driven the same
// way; the argument is in `DzDatePicker.vue` beside the shared handler.
// ---------------------------------------------------------------------------

describe('dzDateRangePicker — calendar grid Home/End', () => {
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
  const FRIDAY = iso(new Date(wednesdayInWeekTwo().getTime() + 2 * 86_400_000))

  /** Open the calendar and return the day cells of the week holding the start. */
  async function openWeekOfStart() {
    const wrapper = mount(DzDateRangePicker, {
      props: { modelValue: { start: WEDNESDAY, end: FRIDAY } },
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
    const { wrapper, selected, days } = await openWeekOfStart()
    selected.focus()
    expect(days.length).toBeGreaterThan(1)

    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
    selected.dispatchEvent(event)

    expect(document.activeElement).toBe(days[0])
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('moves focus to the last day of the focused week on End', async () => {
    const { wrapper, selected, days } = await openWeekOfStart()
    selected.focus()

    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    selected.dispatchEvent(event)

    expect(document.activeElement).toBe(days.at(-1))
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('stays inside the focused week across a two-month grid', async () => {
    const { wrapper, selected, row, days } = await openWeekOfStart()
    selected.focus()

    selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))

    expect(row.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).toBe(days.at(-1))
    wrapper.unmount()
  })

  it('conforms to its declared keyboard contract with the calendar open', async () => {
    const { wrapper } = await openWeekOfStart()
    expectKeyboardContract(wrapper, dateRangePickerAnatomy, {})
    wrapper.unmount()
  })
})
