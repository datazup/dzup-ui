import { mount } from '@vue/test-utils'
/**
 * DzTimePicker — Unit / behavior tests.
 *
 * Dropdown time picker (Reka UI Popover). The popover content is rendered via
 * a portal; tests stub `PopoverPortal` so the panel renders inline, then open
 * the picker by clicking the trigger.
 */
import { afterEach, describe, expect, it } from 'vitest'
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

describe('dzTimePicker — Trigger', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a trigger button', () => {
    const wrapper = mountPicker()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('shows the placeholder while empty', () => {
    const wrapper = mountPicker({ placeholder: 'Select time' })
    expect(wrapper.text()).toContain('Select time')
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
    expect(wrapper.find('button').attributes('aria-required')).toBe('true')
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
    expect(wrapper.find(`[aria-describedby~="${errorId}"]`).exists()).toBe(true)
  })
})

describe('dzTimePicker — Cleaner', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the cleaner only when a value is set', () => {
    expect(mountPicker().find('[aria-label="Clear time"]').exists()).toBe(false)
    expect(mountPicker({ modelValue: '10:00' }).find('[aria-label="Clear time"]').exists()).toBe(true)
  })

  it('clears the value and emits clear + change on cleaner click', async () => {
    const wrapper = mountPicker({ modelValue: '10:00' })
    await wrapper.find('[aria-label="Clear time"]').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
    const updates = wrapper.emitted('update:modelValue')!
    expect(updates[updates.length - 1]).toEqual([''])
  })

  it('hides the cleaner when cleaner=false', () => {
    const wrapper = mountPicker({ modelValue: '10:00', cleaner: false })
    expect(wrapper.find('[aria-label="Clear time"]').exists()).toBe(false)
  })
})

describe('dzTimePicker — Popover (roll layout)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
  afterEach(() => {
    document.body.innerHTML = ''
  })

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
