import type { DzToastContext, ToastItem } from '../../components/feedback/DzToast.types.ts'
import { mount } from '@vue/test-utils'
/**
 * useToast — Unit tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { DZ_TOAST_KEY } from '../../components/feedback/DzToast.types.ts'
import { useToast } from './useToast.ts'

/** Create a mock toast context */
function createMockContext(): DzToastContext {
  const toasts = ref<ToastItem[]>([])
  let counter = 0

  return {
    toasts,
    add: vi.fn((toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${++counter}`
      toasts.value = [{ ...toast, id }, ...toasts.value]
      return id
    }),
    remove: vi.fn((id: string) => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }),
    clear: vi.fn(() => {
      toasts.value = []
    }),
  }
}

describe('useToast', () => {
  it('returns toast, dismiss, and clear functions', () => {
    const mockContext = createMockContext()

    const TestComponent = defineComponent({
      setup() {
        const result = useToast()
        return { result }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent, {
      global: {
        provide: {
          [DZ_TOAST_KEY as symbol]: mockContext,
        },
      },
    })

    const { result } = wrapper.vm
    expect(typeof result.toast).toBe('function')
    expect(typeof result.dismiss).toBe('function')
    expect(typeof result.clear).toBe('function')
  })

  it('toast() calls context.add', () => {
    const mockContext = createMockContext()

    const TestComponent = defineComponent({
      setup() {
        const { toast } = useToast()
        const id = toast({ title: 'Test', tone: 'success' })
        return { id }
      },
      render() {
        return h('div')
      },
    })

    mount(TestComponent, {
      global: {
        provide: {
          [DZ_TOAST_KEY as symbol]: mockContext,
        },
      },
    })

    expect(mockContext.add).toHaveBeenCalledWith({
      title: 'Test',
      tone: 'success',
    })
  })

  it('dismiss() calls context.remove', () => {
    const mockContext = createMockContext()

    const TestComponent = defineComponent({
      setup() {
        const { toast, dismiss } = useToast()
        const id = toast({ title: 'Test' })
        dismiss(id)
        return {}
      },
      render() {
        return h('div')
      },
    })

    mount(TestComponent, {
      global: {
        provide: {
          [DZ_TOAST_KEY as symbol]: mockContext,
        },
      },
    })

    expect(mockContext.remove).toHaveBeenCalled()
  })

  it('clear() calls context.clear', () => {
    const mockContext = createMockContext()

    const TestComponent = defineComponent({
      setup() {
        const { toast, clear } = useToast()
        toast({ title: 'Test 1' })
        toast({ title: 'Test 2' })
        clear()
        return {}
      },
      render() {
        return h('div')
      },
    })

    mount(TestComponent, {
      global: {
        provide: {
          [DZ_TOAST_KEY as symbol]: mockContext,
        },
      },
    })

    expect(mockContext.clear).toHaveBeenCalled()
  })

  it('returns empty string when no context (graceful fallback)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const TestComponent = defineComponent({
      setup() {
        const { toast } = useToast()
        const id = toast({ title: 'Orphan toast' })
        return { id }
      },
      render() {
        return h('div')
      },
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.id).toBe('')

    warnSpy.mockRestore()
  })
})
