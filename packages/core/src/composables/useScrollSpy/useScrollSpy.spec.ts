/**
 * useScrollSpy — Unit tests (mocked IntersectionObserver).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollSpy } from './useScrollSpy.ts'

let ioCallback: ((entries: Array<{ target: Element, isIntersecting: boolean }>) => void) | null = null
let lastOptions: IntersectionObserverInit | undefined

class IOStub {
  constructor(
    cb: (entries: Array<{ target: Element, isIntersecting: boolean }>) => void,
    options?: IntersectionObserverInit,
  ) {
    ioCallback = cb
    lastOptions = options
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] { return [] }
}

function intersect(id: string, isIntersecting: boolean): void {
  ioCallback?.([{ target: document.getElementById(id)!, isIntersecting }])
}

/** Mount a host component that exposes the composable's `activeId`. */
function mountSpy(ids: string[], offsetTop = 0) {
  const onActiveChange = vi.fn()
  const Host = defineComponent({
    setup() {
      const { activeId } = useScrollSpy({
        targetIds: ref(ids),
        offsetTop: ref(offsetTop),
        onActiveChange,
      })
      return { activeId }
    },
    template: '<div>{{ activeId }}</div>',
  })
  const wrapper = mount(Host)
  return { wrapper, onActiveChange }
}

beforeEach(() => {
  ioCallback = null
  lastOptions = undefined
  vi.stubGlobal('IntersectionObserver', IOStub)
  for (const id of ['a', 'b', 'c']) {
    const el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
  }
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('useScrollSpy', () => {
  it('reports the topmost intersecting target in list order', () => {
    const { wrapper, onActiveChange } = mountSpy(['a', 'b', 'c'])

    intersect('b', true)
    expect(wrapper.vm.activeId).toBe('b')
    expect(onActiveChange).toHaveBeenCalledWith('b')

    // 'a' is earlier in list order, so it wins over 'b' when both intersect.
    intersect('a', true)
    expect(wrapper.vm.activeId).toBe('a')
  })

  it('keeps the last active id when nothing intersects (no flicker)', () => {
    const { wrapper } = mountSpy(['a', 'b', 'c'])

    intersect('a', true)
    expect(wrapper.vm.activeId).toBe('a')

    intersect('a', false)
    // Between sections — active stays put rather than resetting to null.
    expect(wrapper.vm.activeId).toBe('a')
  })

  it('applies offsetTop to the observer rootMargin', () => {
    mountSpy(['a'], 80)
    expect(lastOptions?.rootMargin).toBe('-80px 0px -70% 0px')
  })
})
