import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
/**
 * DzDateRangePicker — Unit / behavior tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { anatomy as dateRangePickerAnatomy } from './DzDateRangePicker.anatomy.ts'
import DzDateRangePicker from './DzDateRangePicker.vue'

/**
 * Wait for a condition rather than a fixed sleep (UI-DZUP-UI-TEST-M-03): portalled
 * content lands a tick or two after mount, and a loaded host makes any fixed
 * interval either too short or wasted.
 */
async function settle(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion, { timeout: 5000, interval: 10 })
}

describe('dzDateRangePicker — controlled and uncontrolled value ownership', () => {
  it.each([false, true])('range segment edit, controlled=%s', async (controlled) => {
    const wrapper = mount(DzDateRangePicker, { attachTo: document.body, props: { modelValue: { start: '2026-10-10', end: '2026-10-20' }, ...(controlled ? { 'onUpdate:modelValue': () => {} } : {}) } })
    const day = wrapper.findAll('[data-reka-date-field-segment="day"]')[0]!
    expect(day.exists()).toBe(true)
    await day.trigger('keydown', { key: 'ArrowUp' })
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ start: '2026-10-11', end: '2026-10-20' }])
    // The segment is an editable draft; parent acceptance and subsequent
    // replacement are measured separately from that draft.
    if (controlled)
      await wrapper.setProps({ modelValue: { start: '2026-10-11', end: '2026-10-20' } })
    expect(day.attributes('aria-valuenow')).toBe('11')
    await wrapper.setProps({ modelValue: { start: '2026-10-14', end: '2026-10-25' } })
    expect(day.attributes('aria-valuenow')).toBe('14')
    expect(wrapper.findAll('[data-reka-date-field-segment="day"]')[1]!.attributes('aria-valuenow')).toBe('25')
    wrapper.unmount()
  })
})

describe('dzDateRangePicker — Unit Tests', () => {
  it('renders the date range picker field', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('[class~="[contain:layout_style]"]').exists()).toBe(true)
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
    const field = wrapper.find('[class~="[contain:layout_style]"]')
    await field.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[class~="[contain:layout_style]"]')
    await field.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders calendar icon', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has contain: layout style on root field', () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[class~="[contain:layout_style]"]')
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
    await settle(() => expect(document.body.querySelector('[data-part="item"][data-selected]'), 'the calendar did not render a selected day').not.toBeNull())

    const selected = document.body.querySelector<HTMLElement>('[data-part="item"][data-selected]')
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

// DZUP-UI-R11-05B-20261006-C1: test the promised closed-calendar action.
describe('dzDateRangePicker — declared calendar opening', () => {
  it.fails('opens from the closed trigger using the declared downward arrow', async () => {
    const wrapper = mount(DzDateRangePicker, { attachTo: document.body })
    const trigger = wrapper.get('[data-part="trigger"]')
    await trigger.trigger('keydown', { key: dateRangePickerAnatomy.keyboard[0].key })
    // A known defect (it.fails): there is no condition to wait for, so drain the
    // queued work instead of sleeping a fixed interval.
    await flushPromises()
    try {
      expect(trigger.attributes('aria-expanded')).toBe('true')
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull()
    }
    finally {
      wrapper.unmount()
    }
  })
})
