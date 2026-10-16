/**
 * Deprecation utility — Unit tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isDevEnv, resetDeprecationWarnings, warnDeprecated } from './deprecation.ts'

describe('warnDeprecated', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    // The guard reads `process.env.NODE_ENV`, which survives the lib build;
    // stubbing `DEV` only ever covered the source (UI-DZUP-UI-CODE-M-17).
    vi.stubEnv('NODE_ENV', 'development')
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
    warnDeprecated('OldComp', 'NewComp', '@dzup-ui-pro/pro')
    expect(spy).toHaveBeenCalledWith(
      '[dzup-ui/compat] OldComp is deprecated. Use NewComp from @dzup-ui-pro/pro instead.',
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

  it('is silent when the consumer builds for production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(isDevEnv()).toBe(false)
    warnDeprecated('ProdComp', 'NewComp')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not depend on import.meta.env.DEV, which the lib build hard-codes to false', () => {
    vi.stubEnv('DEV', false)
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnDeprecated('LibBuildComp', 'NewComp')
    expect(spy).toHaveBeenCalledTimes(1)
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
