/**
 * `motion/autoAnimate.ts` — the teardown contract (RESIDUAL-18).
 *
 * The defect this pins is not an assertion about markup, it is an assertion about
 * TIME: after the host element is unmounted, AutoAnimate must schedule no further
 * frame. `@formkit/auto-animate`'s own `destroy()` cannot promise that — its
 * `poll()` (`index.mjs:159`) schedules an untracked `setTimeout` which later installs
 * a 2 s `setInterval`, and `lowPriority()` (`index.mjs:168`) ends at
 * `requestAnimationFrame` because jsdom has no `requestIdleCallback`. Every leaked
 * interval therefore raises `ReferenceError: requestAnimationFrame is not defined`
 * once the file's jsdom environment is torn down — unhandled errors that made
 * `yarn test` exit 1 on a suite where nothing failed, and 0 on a quieter machine.
 *
 * Each test here is a PAIR: first that the poll machinery is genuinely armed in this
 * fixture (advance the clock while mounted → frames are requested), then that
 * teardown silences it (advance the clock after unmount → not one frame). Without
 * the first half the second would pass on a fixture where AutoAnimate never ran.
 */

import type { Ref } from 'vue'
import baseAutoAnimate from '@formkit/auto-animate'
import { mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, withDirectives } from 'vue'
import { autoAnimate, useAutoAnimate, vAutoAnimate } from './autoAnimate.ts'

/** How many rows the fixture list carries; `poll()` runs on the parent AND each. */
const ROWS = 6

beforeAll(() => {
  // AutoAnimate reads `(prefers-reduced-motion: reduce)` before it registers
  // anything, and jsdom implements no `matchMedia` at all. `matches: false` is the
  // case under test: a reduced-motion environment would make AutoAnimate register
  // NOTHING, and every assertion below would pass on an empty fixture.
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
  // AutoAnimate's `observePosition` constructs one per node. jsdom ships none, and
  // a missing global here surfaces as an unhandled ReferenceError inside a timer —
  // the very failure mode this file exists to rule out. The stub deliberately does
  // NOT fire: auto-animate's own callback ignores the first invocation anyway, and a
  // firing observer would re-enter `updatePos` and obscure what is being measured.
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/**
 * Count the frames AutoAnimate asks for, by replacing the scheduler `lowPriority`
 * reaches for. Returns a live counter and the restore.
 *
 * Both branches are instrumented: `lowPriority` prefers `requestIdleCallback` and
 * falls back to `requestAnimationFrame`, and which one exists depends on the
 * environment — jsdom has only the latter, but a fake-timer install could add the
 * former. Counting both means this probe measures "a frame was requested" rather
 * than "one particular global was called".
 */
function countFrames(): { readonly frames: () => number } {
  let frames = 0
  const spy = (): number => {
    frames += 1
    return 0
  }
  vi.stubGlobal('requestAnimationFrame', spy)
  if (typeof globalThis.requestIdleCallback === 'function')
    vi.stubGlobal('requestIdleCallback', spy)
  return { frames: () => frames }
}

/** A list with {@link ROWS} rows, auto-animated through the directive. */
const DirectiveHost = defineComponent({
  name: 'DirectiveHost',
  setup() {
    return () =>
      withDirectives(
        h(
          'ul',
          null,
          Array.from({ length: ROWS }, (_, i) => h('li', { key: i }, `row ${i}`)),
        ),
        [[vAutoAnimate]],
      )
  },
})

/** The same list, auto-animated through the composable. */
const ComposableHost = defineComponent({
  name: 'ComposableHost',
  setup() {
    const [listRef] = useAutoAnimate<HTMLUListElement>()
    return () =>
      h(
        'ul',
        { ref: listRef as unknown as Ref },
        Array.from({ length: ROWS }, (_, i) => h('li', { key: i }, `row ${i}`)),
      )
  },
})

describe('v-auto-animate teardown', () => {
  it('requests frames while mounted, and none at all after unmount', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DirectiveHost, { attachTo: document.body })
    await nextTick()

    // Armed: every `poll()` timeout fires within 2 s and installs a 2 s interval,
    // so five seconds of clock must produce frames.
    const mounted = countFrames()
    await vi.advanceTimersByTimeAsync(5000)
    expect(
      mounted.frames(),
      'the fixture never asked for a frame while mounted — AutoAnimate did not register, '
      + 'so the post-unmount half of this test would pass vacuously',
    ).toBeGreaterThan(0)

    wrapper.unmount()
    await nextTick()

    const torndown = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(
      torndown.frames(),
      'AutoAnimate requested a frame after its host was unmounted — this is the leak that '
      + 'raises "requestAnimationFrame is not defined" once jsdom is torn down',
    ).toBe(0)
  })

  it('cancels the interval a poll that had ALREADY fired installed', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DirectiveHost, { attachTo: document.body })
    await nextTick()

    // Past the whole 0–2000 ms poll window, so no stage-1 timeout is left pending and
    // every interval now exists in the library's own map. This is the half
    // `destroy()` is supposed to handle — and does, only for nodes still attached.
    await vi.advanceTimersByTimeAsync(2500)

    wrapper.unmount()
    await nextTick()

    const torndown = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(torndown.frames()).toBe(0)
  })

  it('cancels a detached row\'s interval, which the library\'s own destroy() walks past', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DirectiveHost, { attachTo: document.body })
    await nextTick()
    await vi.advanceTimersByTimeAsync(2500)

    // `destroy()` clears per-node intervals by walking `parent.children`, so a row
    // removed before teardown is never visited. Remove two by hand to reproduce
    // exactly what a filter change does to the /animations bento.
    const list = wrapper.element as HTMLUListElement
    list.children[0]?.remove()
    list.children[0]?.remove()
    expect(list.children).toHaveLength(ROWS - 2)

    wrapper.unmount()
    await nextTick()

    const torndown = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(
      torndown.frames(),
      'a row detached before teardown kept polling — its interval is in no map the '
      + 'library exposes, which is why the wrapper tracks them itself',
    ).toBe(0)
  })
})

describe('useAutoAnimate teardown', () => {
  it('requests frames while mounted, and none at all after unmount', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ComposableHost, { attachTo: document.body })
    await nextTick()

    const mounted = countFrames()
    await vi.advanceTimersByTimeAsync(5000)
    expect(mounted.frames()).toBeGreaterThan(0)

    wrapper.unmount()
    await nextTick()

    const torndown = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(torndown.frames()).toBe(0)
  })
})

describe('the wrapper is still needed', () => {
  /**
   * The guard on the fix: the UNWRAPPED library, destroyed exactly as its own docs
   * say, still asks for a frame afterwards. If this ever fails, `poll()` upstream
   * has started cancelling its own timers — the good outcome — and
   * `motion/autoAnimate.ts` can be reduced to a plain re-export again.
   *
   * The leak this test deliberately creates is safe only because it runs under fake
   * timers: `vi.useRealTimers()` in `afterEach` discards every pending fake timer, so
   * nothing here can survive into real time and fire after the environment is gone.
   */
  it('the unwrapped library still schedules a frame after its own destroy()', async () => {
    vi.useFakeTimers()
    const host = document.createElement('ul')
    for (let i = 0; i < ROWS; i += 1)
      host.append(document.createElement('li'))
    document.body.append(host)

    // Destroyed INSIDE the 0–2000 ms poll window, which is the shape of every real
    // test: a spec mounts, asserts and unmounts in milliseconds, so none of the
    // stage-1 timeouts has fired and `destroy()` has nothing to cancel. Each one
    // then installs a 2 s interval into a map no caller can reach any more.
    const controller = baseAutoAnimate(host)
    controller.destroy?.()
    host.remove()

    const afterDestroy = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(
      afterDestroy.frames(),
      'the upstream library no longer leaks its poll timers — check `poll()` in '
      + 'node_modules/@formkit/auto-animate/index.mjs; if it cancels its own intervals, '
      + 'motion/autoAnimate.ts can go back to being a re-export',
    ).toBeGreaterThan(0)
  })

  it('the wrapper closes exactly that case', async () => {
    vi.useFakeTimers()
    const host = document.createElement('ul')
    for (let i = 0; i < ROWS; i += 1)
      host.append(document.createElement('li'))
    document.body.append(host)

    const controller = autoAnimate(host)
    controller.destroy?.()
    host.remove()

    const afterDestroy = countFrames()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(afterDestroy.frames()).toBe(0)
  })
})

describe('the global scheduler is borrowed, never kept', () => {
  it('restores the setTimeout and setInterval it found, including a wrapper of its own', () => {
    const outerTimeout = globalThis.setTimeout
    const outerInterval = globalThis.setInterval
    const host = document.createElement('ul')
    host.append(document.createElement('li'))
    document.body.append(host)

    const controller = autoAnimate(host)
    expect(globalThis.setTimeout).toBe(outerTimeout)
    expect(globalThis.setInterval).toBe(outerInterval)

    controller.destroy?.()
    expect(globalThis.setTimeout).toBe(outerTimeout)
    expect(globalThis.setInterval).toBe(outerInterval)
    host.remove()
  })

  it('restores the scheduler even when registration throws', () => {
    const outerTimeout = globalThis.setTimeout
    // A plugin is invoked by the animation path, but a getter on the element's own
    // `children` is read synchronously by `forEach` during registration — the one
    // place a throw can land inside the patched window.
    const host = document.createElement('ul')
    Object.defineProperty(host, 'children', {
      get(): never {
        throw new Error('registration exploded')
      },
    })

    expect(() => autoAnimate(host)).toThrow('registration exploded')
    expect(globalThis.setTimeout).toBe(outerTimeout)
  })
})
