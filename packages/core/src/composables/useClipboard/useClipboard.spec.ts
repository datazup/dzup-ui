/**
 * useClipboard — Unit tests.
 */
import type { UseClipboardReturn } from './useClipboard.ts'

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { defineComponent } from 'vue'
import { useClipboard } from './useClipboard.ts'

/** Helper component that mounts the composable in a real lifecycle */
function createWrapper(options?: { resetDelay?: number }) {
  let composable!: UseClipboardReturn

  const wrapper = mount(
    defineComponent({
      setup() {
        composable = useClipboard(options)
        return {}
      },
      template: '<div />',
    }),
    { attachTo: document.body },
  )

  return { wrapper, composable }
}

describe('useClipboard', () => {
  it('copies text using navigator.clipboard.writeText', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper()

    await composable.copy('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(composable.copied.value).toBe(true)

    wrapper.unmount()
  })

  it('auto-resets copied state after resetDelay', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper({ resetDelay: 500 })

    await composable.copy('test')
    expect(composable.copied.value).toBe(true)

    vi.advanceTimersByTime(499)
    expect(composable.copied.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(composable.copied.value).toBe(false)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('uses default resetDelay of 2000ms', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper()

    await composable.copy('test')
    expect(composable.copied.value).toBe(true)

    vi.advanceTimersByTime(1999)
    expect(composable.copied.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(composable.copied.value).toBe(false)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('reports isSupported as true when clipboard API exists', () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } })

    const { wrapper, composable } = createWrapper()
    expect(composable.isSupported.value).toBe(true)

    wrapper.unmount()
  })

  it('falls back to execCommand when clipboard API is unavailable', async () => {
    // Save original and replace with a non-functional clipboard
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { /* no writeText */ },
      writable: true,
      configurable: true,
    })

    const execCommand = vi.fn().mockReturnValue(true)
    document.execCommand = execCommand

    const { wrapper, composable } = createWrapper()

    expect(composable.isSupported.value).toBe(false)
    await composable.copy('fallback text')

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(composable.copied.value).toBe(true)

    // Restore
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
    wrapper.unmount()
  })

  it('sets copied to false when copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper()

    await composable.copy('fail')
    expect(composable.copied.value).toBe(false)

    wrapper.unmount()
  })

  it('clears timeout on unmount to avoid leaks', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper({ resetDelay: 5000 })

    await composable.copy('hello')
    expect(composable.copied.value).toBe(true)

    // Unmount before the reset fires
    wrapper.unmount()

    // Advance past the delay — copied should remain true (no reset ran)
    vi.advanceTimersByTime(6000)
    expect(composable.copied.value).toBe(true)

    vi.useRealTimers()
  })

  it('resets previous timeout when copy is called again', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const { wrapper, composable } = createWrapper({ resetDelay: 1000 })

    await composable.copy('first')
    vi.advanceTimersByTime(800)
    expect(composable.copied.value).toBe(true)

    // Copy again — this should reset the timer
    await composable.copy('second')
    vi.advanceTimersByTime(800)
    expect(composable.copied.value).toBe(true)

    vi.advanceTimersByTime(200)
    expect(composable.copied.value).toBe(false)

    wrapper.unmount()
    vi.useRealTimers()
  })
})
