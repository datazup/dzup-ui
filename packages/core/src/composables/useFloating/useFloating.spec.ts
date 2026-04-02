import {
  flip as mockFlip,
  offset as mockOffset,
  shift as mockShift,
  useFloating as mockUseFloatingUI,
} from '@floating-ui/vue'
/**
 * useFloating — Unit tests.
 *
 * These tests verify the composable API shape and default behavior.
 * Since @floating-ui/vue depends on browser layout APIs not available
 * in jsdom, we mock the library and validate our wrapper logic.
 */
import { describe, expect, it, vi } from 'vitest'

import { ref } from 'vue'
import { useFloating } from './useFloating.ts'

// Mock @floating-ui/vue before importing the composable
vi.mock('@floating-ui/vue', () => ({
  useFloating: vi.fn((_reference, _floating, options) => ({
    floatingStyles: ref({ position: 'absolute', top: '0px', left: '0px' }),
    placement: ref(options?.placement ?? 'bottom'),
    update: vi.fn(),
  })),
  offset: vi.fn((value: number) => ({ name: 'offset', options: value })),
  flip: vi.fn(() => ({ name: 'flip' })),
  shift: vi.fn(() => ({ name: 'shift' })),
}))

describe('useFloating', () => {
  it('returns referenceRef, floatingRef, floatingStyles, placement, and update', () => {
    const result = useFloating()

    expect(result.referenceRef).toBeDefined()
    expect(result.floatingRef).toBeDefined()
    expect(result.floatingStyles).toBeDefined()
    expect(result.placement).toBeDefined()
    expect(typeof result.update).toBe('function')
  })

  it('initializes refs as null', () => {
    const result = useFloating()

    expect(result.referenceRef.value).toBeNull()
    expect(result.floatingRef.value).toBeNull()
  })

  it('uses default placement of bottom', () => {
    const result = useFloating()

    expect(result.placement.value).toBe('bottom')
  })

  it('passes custom placement to @floating-ui/vue', () => {
    useFloating({ placement: 'top-start' })

    expect(mockUseFloatingUI).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ placement: 'top-start' }),
    )
  })

  it('applies offset middleware with default value of 8', () => {
    useFloating()

    expect(mockOffset).toHaveBeenCalledWith(8)
  })

  it('applies offset middleware with custom value', () => {
    useFloating({ offset: 16 })

    expect(mockOffset).toHaveBeenCalledWith(16)
  })

  it('includes flip middleware by default', () => {
    useFloating()

    expect(mockFlip).toHaveBeenCalled()
  })

  it('excludes flip middleware when flip is false', () => {
    vi.mocked(mockFlip).mockClear()
    vi.mocked(mockUseFloatingUI).mockClear()

    useFloating({ flip: false })

    // flip should not be called for this invocation
    // But since we mock at module level, we check the middleware passed
    const call = vi.mocked(mockUseFloatingUI).mock.calls[0]
    const middlewareArg = call?.[2]?.middleware as Array<{ name: string }>
    const hasFlip = middlewareArg?.some(m => m.name === 'flip')
    expect(hasFlip).toBe(false)
  })

  it('includes shift middleware by default', () => {
    useFloating()

    expect(mockShift).toHaveBeenCalled()
  })

  it('excludes shift middleware when shift is false', () => {
    vi.mocked(mockShift).mockClear()
    vi.mocked(mockUseFloatingUI).mockClear()

    useFloating({ shift: false })

    const call = vi.mocked(mockUseFloatingUI).mock.calls[0]
    const middlewareArg = call?.[2]?.middleware as Array<{ name: string }>
    const hasShift = middlewareArg?.some(m => m.name === 'shift')
    expect(hasShift).toBe(false)
  })

  it('returns computed floatingStyles as Record<string, string>', () => {
    const result = useFloating()

    const styles = result.floatingStyles.value
    expect(typeof styles).toBe('object')
    expect(typeof styles.position).toBe('string')
  })

  it('uses default options when called with no arguments', () => {
    expect(() => useFloating()).not.toThrow()
  })
})
