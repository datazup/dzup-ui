/**
 * Value codecs — unit tests (TASK-FORM-OSS-03).
 *
 * These functions are small and their failure modes are all one of two things:
 * a truthiness check that swallows `false` or `0`, and a `Date` standing in for
 * a calendar day. Most of what follows is those two cases, from as many angles
 * as they occur in a real form.
 *
 * The round-trip property test at the end is the one that would catch a codec
 * nobody thought about: whatever the controls emit has to survive being written
 * to a document and read back.
 */

import { describe, expect, it } from 'vitest'
import {
  emptyValueFor,
  fromIsoDate,
  fromIsoTime,
  isEmptyValue,
  isFileRef,
  isJsonSerializable,
  toFileRef,
  toIsoDate,
  toIsoTime,
  toNumberValue,
} from './form-value'

describe('emptyValueFor', () => {
  it('gives every kind a typed empty, so toControl is total', () => {
    expect(emptyValueFor('string')).toBe('')
    expect(emptyValueFor('date')).toBe('')
    expect(emptyValueFor('time')).toBe('')
    expect(emptyValueFor('boolean')).toBe(false)
    expect(emptyValueFor('array')).toEqual([])
    expect(emptyValueFor('files')).toEqual([])
    expect(emptyValueFor('object')).toEqual({})
    expect(emptyValueFor('file')).toBeNull()
  })

  it('makes number the exception, because absent is what an empty number means', () => {
    // Spec 04: an empty number input "removes the property by default rather
    // than producing NaN". `undefined` is what removal looks like from Vue.
    expect(emptyValueFor('number')).toBeUndefined()
  })

  it('returns a fresh container each time, so two fields cannot share one', () => {
    const a = emptyValueFor('array') as unknown[]
    const b = emptyValueFor('array') as unknown[]
    a.push(1)
    expect(b).toEqual([])
  })
})

describe('isEmptyValue', () => {
  it('treats false and zero as values, not as absence', () => {
    // The whole point. An unchecked box and a missing box are different answers
    // to a mandatory question, and so are "zero" and "left blank".
    expect(isEmptyValue(false)).toBe(false)
    expect(isEmptyValue(0)).toBe(false)
    expect(isEmptyValue(-0)).toBe(false)
  })

  it('treats undefined, null, the empty string and empty containers as empty', () => {
    expect(isEmptyValue(undefined)).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue([])).toBe(true)
    expect(isEmptyValue({})).toBe(true)
  })

  it('does not treat whitespace as empty — that is a validator\'s decision', () => {
    expect(isEmptyValue(' ')).toBe(false)
  })
})

describe('toNumberValue', () => {
  it('never returns NaN', () => {
    for (const input of ['', '-', '.', 'abc', '1e', 'NaN', Number.NaN, {}, [], null])
      expect(Number.isNaN(toNumberValue(input) as number)).toBe(false)
  })

  it('parses what a number field can contain', () => {
    expect(toNumberValue('42')).toBe(42)
    expect(toNumberValue(' 42 ')).toBe(42)
    expect(toNumberValue('-1.5')).toBe(-1.5)
    expect(toNumberValue('1e3')).toBe(1000)
    expect(toNumberValue(0)).toBe(0)
  })

  it('returns undefined rather than guessing at partial input', () => {
    expect(toNumberValue('-')).toBeUndefined()
    expect(toNumberValue('1e')).toBeUndefined()
    expect(toNumberValue('')).toBeUndefined()
  })

  it('rejects infinities, which serialize to null', () => {
    expect(toNumberValue(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(toNumberValue('Infinity')).toBeUndefined()
  })
})

describe('toIsoDate / fromIsoDate', () => {
  it('formats parts as RFC 3339 full-date', () => {
    expect(toIsoDate({ year: 2026, month: 8, day: 24 })).toBe('2026-08-24')
    expect(toIsoDate({ year: 2026, month: 1, day: 1 })).toBe('2026-01-01')
    expect(toIsoDate({ year: 5, month: 3, day: 9 })).toBe('0005-03-09')
  })

  it('round-trips', () => {
    for (const parts of [
      { year: 2026, month: 8, day: 24 },
      { year: 2024, month: 2, day: 29 },
      { year: 1999, month: 12, day: 31 },
    ])
      expect(fromIsoDate(toIsoDate(parts))).toEqual(parts)
  })

  it('rejects a day that does not exist, however well-formed the string', () => {
    expect(fromIsoDate('2026-02-30')).toBeNull()
    expect(fromIsoDate('2026-13-01')).toBeNull()
    expect(fromIsoDate('2026-00-01')).toBeNull()
    expect(fromIsoDate('2023-02-29')).toBeNull()
    // …and accepts the leap day that does.
    expect(fromIsoDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 })
  })

  it('rejects anything that is not the profile', () => {
    for (const value of ['2026-8-24', '24/08/2026', '2026-08-24T00:00:00Z', ''])
      expect(fromIsoDate(value)).toBeNull()
  })

  it('formats nothing for parts that are not a date', () => {
    expect(toIsoDate({ year: 2026, month: 13, day: 1 })).toBe('')
    expect(toIsoDate({ year: 2026, month: 2, day: 30 })).toBe('')
    expect(toIsoDate({ year: 2026.5, month: 1, day: 1 })).toBe('')
  })

  it('does not go through a Date, so no offset can move the day', () => {
    // `new Date('2026-08-24')` is midnight UTC and formats as the 23rd in any
    // negative offset. A calendar date is not an instant, and this is the bug
    // that shape produces.
    expect(toIsoDate({ year: 2026, month: 8, day: 24 })).toBe('2026-08-24')
    expect(fromIsoDate('2026-08-24')).toEqual({ year: 2026, month: 8, day: 24 })
  })
})

describe('toIsoTime / fromIsoTime', () => {
  it('formats HH:MM, and HH:MM:SS when seconds are given', () => {
    expect(toIsoTime({ hour: 9, minute: 5 })).toBe('09:05')
    expect(toIsoTime({ hour: 23, minute: 59, second: 59 })).toBe('23:59:59')
    expect(toIsoTime({ hour: 0, minute: 0 })).toBe('00:00')
  })

  it('carries no offset, which is the documented profile', () => {
    // C1.5: partial-time, not JSON Schema `format: time`. A control that was
    // never given a zone cannot invent one.
    expect(toIsoTime({ hour: 9, minute: 30 })).not.toMatch(/[Z+-]/)
  })

  it('round-trips both widths', () => {
    expect(fromIsoTime(toIsoTime({ hour: 9, minute: 5 }))).toEqual({ hour: 9, minute: 5 })
    expect(fromIsoTime(toIsoTime({ hour: 9, minute: 5, second: 3 })))
      .toEqual({ hour: 9, minute: 5, second: 3 })
  })

  it('rejects out-of-range and malformed times', () => {
    for (const value of ['24:00', '12:60', '9:05', '12', '', '12:00:60'])
      expect(fromIsoTime(value)).toBeNull()
    expect(toIsoTime({ hour: 24, minute: 0 })).toBe('')
    expect(toIsoTime({ hour: 1, minute: 0, second: 60 })).toBe('')
  })
})

describe('toFileRef / isFileRef', () => {
  const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })

  it('describes a File without carrying it', () => {
    const ref = toFileRef(file, 'f1')
    expect(ref).toEqual({
      id: 'f1',
      name: 'notes.txt',
      size: file.size,
      type: 'text/plain',
      status: 'pending',
    })
    expect(Object.values(ref)).not.toContain(file)
  })

  it('starts pending, so the row renders before the upload finishes', () => {
    expect(toFileRef(file, 'f1').status).toBe('pending')
    expect(toFileRef(file, 'f1', 'uploaded').status).toBe('uploaded')
  })

  it('reports an unknown type as empty rather than guessing from the name', () => {
    const unknown = new File([''], 'thing.dat')
    expect(toFileRef(unknown, 'f2').type).toBe('')
  })

  it('recognises a reference and refuses a File', () => {
    expect(isFileRef(toFileRef(file, 'f1'))).toBe(true)
    expect(isFileRef(file)).toBe(false)
    expect(isFileRef(null)).toBe(false)
    expect(isFileRef({ id: 'x', name: 'n', size: 1, type: 't', status: 'nope' })).toBe(false)
  })
})

describe('isJsonSerializable', () => {
  it('accepts everything a form document can hold', () => {
    for (const value of ['', 'text', 0, -1.5, true, false, null, undefined, [], {}, [1, 'a', null], { a: { b: [1] } }])
      expect(isJsonSerializable(value), String(value)).toBe(true)
  })

  it('rejects the things that get lost on the way to a document', () => {
    expect(isJsonSerializable(new File([''], 'x'))).toBe(false)
    expect(isJsonSerializable(new Date())).toBe(false)
    expect(isJsonSerializable(new Map())).toBe(false)
    expect(isJsonSerializable(new Set())).toBe(false)
    expect(isJsonSerializable(() => {})).toBe(false)
    expect(isJsonSerializable(Number.NaN)).toBe(false)
    expect(isJsonSerializable([new Date()])).toBe(false)
  })
})

describe('every empty value survives a JSON round trip', () => {
  const KINDS = ['string', 'number', 'boolean', 'array', 'object', 'date', 'time', 'file', 'files'] as const

  it.each(KINDS)('%s', (kind) => {
    const empty = emptyValueFor(kind)
    expect(isJsonSerializable(empty)).toBe(true)
    // `undefined` is absence and JSON has no word for it — which is the point:
    // the property is removed rather than written as something else.
    const roundTripped = JSON.parse(JSON.stringify({ v: empty })) as { v?: unknown }
    if (empty === undefined)
      expect('v' in roundTripped).toBe(false)
    else
      expect(roundTripped.v).toEqual(empty)
  })

  /**
   * The two functions are not inverses, and `boolean` is where that shows.
   *
   * `emptyValueFor('boolean')` is `false` because that is what an unchecked box
   * holds — and `isEmptyValue(false)` is `false` because an unchecked box has
   * answered*. C1.7 is exactly this distinction: `false` is a value, absence
   * is not, and a control must not emit one where it means the other.
   *
   * Written as an assertion rather than a comment because the obvious
   * "everything empty reports empty" invariant is wrong, and the next person to
   * assume it will write it as a test.
   */
  it('reports every kind\'s empty value as empty, except boolean, where false is an answer', () => {
    for (const kind of KINDS) {
      if (kind === 'boolean')
        continue
      expect(isEmptyValue(emptyValueFor(kind)), kind).toBe(true)
    }
    expect(emptyValueFor('boolean')).toBe(false)
    expect(isEmptyValue(false)).toBe(false)
  })
})
