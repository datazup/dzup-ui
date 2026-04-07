/**
 * Deprecation utility — Unit tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings, warnDeprecated } from './deprecation.ts'

describe('warnDeprecated', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('emits a console.warn with the correct message', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('OldComp', 'NewComp')
    expect(spy).toHaveBeenCalledWith(
      '[dzup-ui/compat] OldComp is deprecated. Use NewComp from @dzup-ui/core instead.',
    )
  })

  it('supports custom package name', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('OldComp', 'NewComp', '@dzup-ui/pro')
    expect(spy).toHaveBeenCalledWith(
      '[dzup-ui/compat] OldComp is deprecated. Use NewComp from @dzup-ui/pro instead.',
    )
  })

  it('only warns once per component name', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('DuplicateComp', 'NewComp')
    warnDeprecated('DuplicateComp', 'NewComp')
    warnDeprecated('DuplicateComp', 'NewComp')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('warns separately for different component names', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('CompA', 'NewA')
    warnDeprecated('CompB', 'NewB')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('resetDeprecationWarnings allows re-warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('ResetComp', 'NewComp')
    expect(spy).toHaveBeenCalledTimes(1)
    resetDeprecationWarnings()
    warnDeprecated('ResetComp', 'NewComp')
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
