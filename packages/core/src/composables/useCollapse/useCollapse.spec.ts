/**
 * useCollapse — Unit tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useCollapse } from './useCollapse.ts'

describe('useCollapse', () => {
  it('returns contentRef, contentStyle, and isAnimating', () => {
    const expanded = ref(false)
    const result = useCollapse({ expanded })

    expect(result.contentRef).toBeDefined()
    expect(result.contentStyle).toBeDefined()
    expect(result.isAnimating).toBeDefined()
  })

  it('starts with height 0px when collapsed', () => {
    const expanded = ref(false)
    const { contentStyle } = useCollapse({ expanded })

    expect(contentStyle.value.height).toBe('0px')
  })

  it('starts with height auto when expanded', () => {
    const expanded = ref(true)
    const { contentStyle } = useCollapse({ expanded })

    expect(contentStyle.value.height).toBe('auto')
  })

  it('sets overflow to hidden when collapsed', () => {
    const expanded = ref(false)
    const { contentStyle } = useCollapse({ expanded })

    expect(contentStyle.value.overflow).toBe('hidden')
  })

  it('uses custom duration in transition', () => {
    const expanded = ref(false)
    const { contentStyle } = useCollapse({ expanded, duration: 500 })

    expect(contentStyle.value.transition).toContain('500ms')
  })
})

describe('useCollapse — re-toggle inside the animation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays collapsed when collapsed again before the expand timer fires', async () => {
    const expanded = ref(false)
    const { contentRef, contentStyle, isAnimating } = useCollapse({ expanded, duration: 200 })
    contentRef.value = document.createElement('div')

    expanded.value = true
    await nextTick()
    await nextTick()
    vi.advanceTimersByTime(50)

    expanded.value = false
    await nextTick()
    await nextTick()
    vi.runAllTimers()
    await nextTick()

    expect(contentStyle.value.height).toBe('0px')
    expect(contentStyle.value.overflow).toBe('hidden')
    expect(isAnimating.value).toBe(false)
  })

  it('clears a pending timer when its scope is disposed', async () => {
    const scope = effectScope()
    const expanded = ref(false)
    const result = scope.run(() => useCollapse({ expanded, duration: 200 }))!
    result.contentRef.value = document.createElement('div')

    expanded.value = true
    await nextTick()
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)

    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
    expect(result.contentStyle.value.height).not.toBe('auto')
  })
})
