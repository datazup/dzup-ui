/**
 * useCollapse — Unit tests.
 */
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
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
