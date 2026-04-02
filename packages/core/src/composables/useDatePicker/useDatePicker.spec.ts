/**
 * useDatePicker — Unit tests.
 */
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useDatePicker } from './useDatePicker.ts'

describe('useDatePicker', () => {
  it('converts ISO string to DateValue', () => {
    const modelValue = ref('2026-03-15')
    const { dateValue } = useDatePicker({ modelValue })
    expect(dateValue.value).toBeDefined()
    expect(dateValue.value?.year).toBe(2026)
    expect(dateValue.value?.month).toBe(3)
    expect(dateValue.value?.day).toBe(15)
  })

  it('returns undefined for empty string', () => {
    const modelValue = ref('')
    const { dateValue } = useDatePicker({ modelValue })
    expect(dateValue.value).toBeUndefined()
  })

  it('returns undefined for invalid date string', () => {
    const modelValue = ref('not-a-date')
    const { dateValue } = useDatePicker({ modelValue })
    expect(dateValue.value).toBeUndefined()
  })

  it('converts DateValue back to ISO string', () => {
    const modelValue = ref('2026-01-05')
    const { dateValue, toISOString } = useDatePicker({ modelValue })
    const result = toISOString(dateValue.value)
    expect(result).toBe('2026-01-05')
  })

  it('parses min value', () => {
    const modelValue = ref('')
    const min = ref('2026-01-01')
    const { minValue } = useDatePicker({ modelValue, min })
    expect(minValue.value).toBeDefined()
    expect(minValue.value?.year).toBe(2026)
    expect(minValue.value?.month).toBe(1)
    expect(minValue.value?.day).toBe(1)
  })

  it('parses max value', () => {
    const modelValue = ref('')
    const max = ref('2026-12-31')
    const { maxValue } = useDatePicker({ modelValue, max })
    expect(maxValue.value).toBeDefined()
    expect(maxValue.value?.year).toBe(2026)
    expect(maxValue.value?.month).toBe(12)
    expect(maxValue.value?.day).toBe(31)
  })

  it('returns undefined for undefined min/max', () => {
    const modelValue = ref('')
    const min = ref(undefined)
    const max = ref(undefined)
    const { minValue, maxValue } = useDatePicker({ modelValue, min, max })
    expect(minValue.value).toBeUndefined()
    expect(maxValue.value).toBeUndefined()
  })

  it('defaults locale to en-US', () => {
    const modelValue = ref('')
    const { resolvedLocale } = useDatePicker({ modelValue })
    expect(resolvedLocale.value).toBe('en-US')
  })

  it('respects custom locale', () => {
    const modelValue = ref('')
    const locale = ref('de-DE')
    const { resolvedLocale } = useDatePicker({ modelValue, locale })
    expect(resolvedLocale.value).toBe('de-DE')
  })

  it('provides a placeholder date (today)', () => {
    const modelValue = ref('')
    const { placeholderDate } = useDatePicker({ modelValue })
    expect(placeholderDate.value).toBeDefined()
    expect(placeholderDate.value.year).toBeGreaterThan(2020)
  })

  it('toISOString returns empty string for undefined', () => {
    const modelValue = ref('')
    const { toISOString } = useDatePicker({ modelValue })
    expect(toISOString(undefined)).toBe('')
  })

  it('fromISOString returns undefined for undefined', () => {
    const modelValue = ref('')
    const { fromISOString } = useDatePicker({ modelValue })
    expect(fromISOString(undefined)).toBeUndefined()
  })

  it('reacts to modelValue changes', () => {
    const modelValue = ref('2026-01-01')
    const { dateValue } = useDatePicker({ modelValue })
    expect(dateValue.value?.day).toBe(1)

    modelValue.value = '2026-06-15'
    expect(dateValue.value?.month).toBe(6)
    expect(dateValue.value?.day).toBe(15)
  })
})
