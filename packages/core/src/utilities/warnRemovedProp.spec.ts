/**
 * Tests for the removed-prop dev warning (TASK-N5-02).
 *
 * What is worth asserting here is the *mechanism*, not the current list of
 * removed props — that list lives in `packages/core/tests/aria-prop-removals.spec.ts`
 * against the real components. Three things can quietly stop working:
 *
 *   1. the kebab spelling, which is the one a template actually produces;
 *   2. the once-per-session gate, which is what keeps a 500-row list from
 *      emitting 500 identical lines;
 *   3. the absence of a warning when nothing was passed, which is what stops a
 *      correct application from being told off on every render.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetRemovedPropWarnings, warnRemovedProps } from './warnRemovedProp.ts'

const REMOVED = {
  ariaInvalid: 'Put aria-invalid on the field.',
} as const

afterEach(() => {
  resetRemovedPropWarnings()
  vi.restoreAllMocks()
})

describe('warnRemovedProps', () => {
  it('says nothing when the removed prop was not passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzGrid', { class: 'x' }, REMOVED)
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns on the kebab-case attribute a template produces', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzGrid', { 'aria-invalid': 'true' }, REMOVED)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('DzGrid no longer accepts `ariaInvalid`')
    expect(warn.mock.calls[0]?.[0]).toContain('Put aria-invalid on the field.')
  })

  /**
   * The camelCase spelling is the one a consumer *migrating from the declared
   * prop* has already written, so warning only on kebab would leave exactly the
   * population this warning exists for in silence.
   */
  it('warns on the camelCase spelling the removed prop used to have', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzGrid', { ariaInvalid: true }, REMOVED)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('warns once per component and prop, however many instances render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (let i = 0; i < 50; i += 1)
      warnRemovedProps('DzGrid', { 'aria-invalid': 'true' }, REMOVED)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('keeps the per-component counters apart', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzGrid', { 'aria-invalid': 'true' }, REMOVED)
    warnRemovedProps('DzStack', { 'aria-invalid': 'true' }, REMOVED)
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('warns separately for each removed prop on one component', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzFloatLabel', { 'aria-label': 'a', 'aria-invalid': 'true' }, {
      ariaLabel: 'Put it on the control.',
      ariaLabelledby: 'Put it on the control.',
      ariaInvalid: 'Bind `invalid` on the control.',
    })
    expect(warn).toHaveBeenCalledTimes(2)
  })

  /**
   * The message has to say the value is now *rendered*, not merely rejected.
   * That is the part a reader cannot guess: the old behaviour swallowed the
   * binding, the new one lets it fall through onto the root element.
   */
  it('says the value now falls through to the root element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnRemovedProps('DzGrid', { 'aria-invalid': 'true' }, REMOVED)
    expect(warn.mock.calls[0]?.[0]).toContain('passed through to the root element')
    expect(warn.mock.calls[0]?.[0]).toContain('VERSIONING.md')
  })
})
