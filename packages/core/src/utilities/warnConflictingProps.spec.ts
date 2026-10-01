/**
 * Tests for the conflicting-prop dev warning (TASK-S3-O2).
 *
 * What is worth asserting here is the *mechanism*, not the current list of alias
 * pairs — that list is pinned per component (`DzGrid.formLayout.spec.ts` for
 * `DzGridItem`'s `span`/`colSpan`). Three things can quietly stop working:
 *
 *   1. the once-per-session gate, which is what keeps a 200-row grid from
 *      emitting 200 identical lines;
 *   2. silence when only one spelling was passed, which is what stops a correct
 *      application from being told off on every render;
 *   3. the `undefined`-only absence test — a `0`, `''` or `null` is a value a
 *      consumer may have meant, and treating it as absent would suppress the
 *      warning for exactly the ambiguous cases.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetConflictingPropWarnings, warnConflictingProps } from './warnConflictingProps.ts'

const GUIDANCE = 'Keep `colSpan`.'

afterEach(() => {
  resetConflictingPropWarnings()
  vi.restoreAllMocks()
})

describe('warnConflictingProps', () => {
  it('says nothing when only the winner was passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnConflictingProps('DzGridItem', ['colSpan', 6], ['span', undefined], GUIDANCE)
    expect(warn).not.toHaveBeenCalled()
  })

  it('says nothing when only the loser was passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnConflictingProps('DzGridItem', ['colSpan', undefined], ['span', 6], GUIDANCE)
    expect(warn).not.toHaveBeenCalled()
  })

  it('names both props, which one is used, and what to do', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnConflictingProps('DzGridItem', ['colSpan', 8], ['span', 3], GUIDANCE)
    expect(warn).toHaveBeenCalledTimes(1)
    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('DzGridItem received both `span` and `colSpan`')
    expect(message).toContain('`colSpan` is used and `span` is ignored')
    expect(message).toContain(GUIDANCE)
  })

  it('warns once per component and pair, however many instances render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (let i = 0; i < 50; i += 1)
      warnConflictingProps('DzGridItem', ['colSpan', 8], ['span', 3], GUIDANCE)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('keeps the per-component counters apart', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnConflictingProps('DzGridItem', ['colSpan', 8], ['span', 3], GUIDANCE)
    warnConflictingProps('DzSomethingElse', ['colSpan', 8], ['span', 3], GUIDANCE)
    expect(warn).toHaveBeenCalledTimes(2)
  })

  /**
   * A falsy-but-present value is the case a `!value` guard would silently drop,
   * and it is the one most likely to be a mistake — a computed span that came out
   * `0` beside an explicit one.
   */
  it('warns for a falsy value that is not `undefined`', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnConflictingProps('DzGridItem', ['colSpan', 8], ['span', 0], GUIDANCE)
    expect(warn).toHaveBeenCalledTimes(1)
    resetConflictingPropWarnings()
    warnConflictingProps('DzGridItem', ['colSpan', 8], ['span', null], GUIDANCE)
    expect(warn).toHaveBeenCalledTimes(2)
  })
})
