import type { DzToastContext, ToastItem } from './DzToast.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzToast compound — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, inject, ref } from 'vue'
import { DZ_TOAST_KEY } from './DzToast.types.ts'
import DzToastProvider from './DzToastProvider.vue'
import DzToastViewport from './DzToastViewport.vue'

describe('dzToastProvider — Unit Tests', () => {
  it('renders children in default slot', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: '<div class="child">Hello</div>' },
    })
    expect(wrapper.find('.child').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello')
  })

  it('accepts duration prop', () => {
    const wrapper = mount(DzToastProvider, {
      props: { duration: 3000 },
      slots: { default: '<div>Test</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts maxToasts prop', () => {
    const wrapper = mount(DzToastProvider, {
      props: { maxToasts: 3 },
      slots: { default: '<div>Test</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('provides toast context to children', () => {
    let capturedContext: DzToastContext | null = null

    const ContextReader = defineComponent({
      setup() {
        const ctx = inject(DZ_TOAST_KEY, null)
        capturedContext = ctx
        return {}
      },
      render() {
        return h('div', 'reader')
      },
    })

    mount(DzToastProvider, {
      slots: {
        default: () => h(ContextReader),
      },
    })

    expect(capturedContext).not.toBeNull()
    expect(typeof capturedContext!.add).toBe('function')
    expect(typeof capturedContext!.remove).toBe('function')
    expect(typeof capturedContext!.clear).toBe('function')
  })
})

describe('dzToastViewport — Unit Tests', () => {
  it('renders within provider context', () => {
    const wrapper = mount(DzToastProvider, {
      slots: {
        default: () => h(DzToastViewport),
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class', () => {
    const wrapper = mount(DzToastProvider, {
      slots: {
        default: () => h(DzToastViewport, { class: 'my-viewport' }),
      },
    })
    expect(wrapper.html()).toContain('my-viewport')
  })
})

describe('dzToast types — ToastItem interface', () => {
  it('has required id and title fields', () => {
    const item: ToastItem = {
      id: 'test-1',
      title: 'Hello',
    }
    expect(item.id).toBe('test-1')
    expect(item.title).toBe('Hello')
  })

  it('supports optional fields', () => {
    const item: ToastItem = {
      id: 'test-2',
      title: 'Test',
      description: 'Description',
      tone: 'success',
      duration: 5000,
      actionLabel: 'Undo',
      onAction: () => {},
    }
    expect(item.description).toBe('Description')
    expect(item.tone).toBe('success')
    expect(item.duration).toBe(5000)
    expect(item.actionLabel).toBe('Undo')
    expect(typeof item.onAction).toBe('function')
  })
})

describe('dzToastContext — context operations', () => {
  it('can add and remove toasts via context', () => {
    const toasts = ref<ToastItem[]>([])
    let counter = 0

    const context: DzToastContext = {
      toasts,
      add: (toast) => {
        const id = `toast-${++counter}`
        toasts.value = [{ ...toast, id }, ...toasts.value]
        return id
      },
      remove: (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      },
      clear: () => {
        toasts.value = []
      },
    }

    const id = context.add({ title: 'Hello', tone: 'primary' })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.title).toBe('Hello')

    context.remove(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('can clear all toasts', () => {
    const toasts = ref<ToastItem[]>([])
    let counter = 0

    const context: DzToastContext = {
      toasts,
      add: (toast) => {
        const id = `toast-${++counter}`
        toasts.value = [{ ...toast, id }, ...toasts.value]
        return id
      },
      remove: (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      },
      clear: () => {
        toasts.value = []
      },
    }

    context.add({ title: 'Toast 1' })
    context.add({ title: 'Toast 2' })
    expect(toasts.value).toHaveLength(2)

    context.clear()
    expect(toasts.value).toHaveLength(0)
  })

  it('respects maxToasts limit in provider', () => {
    let capturedContext: DzToastContext | null = null

    const ContextReader = defineComponent({
      setup() {
        const ctx = inject(DZ_TOAST_KEY, null)
        capturedContext = ctx
        return {}
      },
      render() {
        return h('div', 'reader')
      },
    })

    mount(DzToastProvider, {
      props: { maxToasts: 2 },
      slots: {
        default: () => h(ContextReader),
      },
    })

    capturedContext!.add({ title: 'Toast 1' })
    capturedContext!.add({ title: 'Toast 2' })
    capturedContext!.add({ title: 'Toast 3' })

    // Only 2 should remain (maxToasts=2)
    expect(capturedContext!.toasts.value.length).toBeLessThanOrEqual(2)
  })
})
