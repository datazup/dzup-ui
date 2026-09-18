import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import DzTimePicker from '../components/forms/DzTimePicker.vue'
import { createDzFormats } from '../composables/provider/useDzFormats.ts'
import { formatAbsoluteTime } from '../composables/useRelativeTime/useRelativeTime.ts'
import DzProvider from '../providers/DzProvider.vue'

/**
 * Instant vs plain semantics (TASK-R5-O4; the table is in
 * `packages/core/docs/i18n.md`).
 *
 * The rule under test: a host's `formats.date.timeZone` moves **instants** and
 * never **plain** values. The zones are chosen to be far from any CI runner's
 * own — UTC+14 and UTC−11 — so a wall-clock value that leaked through a zone
 * cannot pass by coincidence.
 */

const InlinePortal = { template: '<div><slot /></div>' }

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

function pickerIn(timeZone: string | undefined, modelValue: string) {
  return mount(DzProvider, {
    props: timeZone === undefined ? {} : { formats: { date: { timeZone } } },
    slots: { default: () => h(DzTimePicker, { modelValue, hour12: false }) },
    global: { stubs: { PopoverPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('plain time — DzTimePicker', () => {
  it.each(['Pacific/Kiritimati', 'Pacific/Pago_Pago', 'UTC'])(
    'renders 09:05 as 09:05 under a host timeZone of %s',
    (timeZone) => {
      const wrapper = pickerIn(timeZone, '09:05')
      expect(wrapper.find('button').text()).toContain('09:05')
      wrapper.unmount()
    },
  )

  it('renders the same with no host zone at all', () => {
    const wrapper = pickerIn(undefined, '23:59')
    expect(wrapper.find('button').text()).toContain('23:59')
    wrapper.unmount()
  })
})

describe('instant — DzRelativeTime absolute text', () => {
  it('does move with the host timeZone, because an instant has no wall clock of its own', () => {
    const instant = '2026-06-14T12:00:00.000Z'
    const locale = ref('en-GB')
    const kiritimati = formatAbsoluteTime(instant, undefined, createDzFormats(locale, { date: { timeZone: 'Pacific/Kiritimati' } }))
    const pagoPago = formatAbsoluteTime(instant, undefined, createDzFormats(locale, { date: { timeZone: 'Pacific/Pago_Pago' } }))
    expect(kiritimati).toContain('15 June 2026')
    expect(pagoPago).toContain('14 June 2026')
    expect(kiritimati).not.toBe(pagoPago)
  })
})
