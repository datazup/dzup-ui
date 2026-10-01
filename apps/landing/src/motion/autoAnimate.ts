import type {
  AnimationController,
  AutoAnimateOptions,
  AutoAnimationPlugin,
} from '@formkit/auto-animate'
import type { Directive, Ref } from 'vue'
import baseAutoAnimate from '@formkit/auto-animate'
import { onMounted, ref, watchEffect } from 'vue'

/**
 * AutoAnimate with a teardown that actually tears down (RESIDUAL-18, `D155`/F4).
 *
 * `@formkit/auto-animate` registers a *cold poll* for the parent it is given and
 * for each of its direct children, so that a fast scroll which outruns the
 * IntersectionObserver still ends with correct coordinates. The registration is
 * two-stage (`index.mjs:159`):
 *
 * ```js
 * function poll(el) {
 *   setTimeout(() => {                                       // ← stage 1: untracked
 *     intervals.set(el, setInterval(() => lowPriority(updatePos…), 2000))
 *   }, Math.round(2000 * Math.random()))                     // ← stage 2: tracked, too late
 * }
 * ```
 *
 * `controller.destroy()` can reach **neither** stage reliably:
 *
 * - The stage-1 `setTimeout` id is never stored anywhere, so `destroy()` cannot
 *   cancel it. A frame scheduled up to two seconds after mount therefore still
 *   installs a 2 s interval *after* the element has been destroyed, and that
 *   interval is in no map any caller can see.
 * - The stage-2 `setInterval` id is stored per node, and `destroy()` clears it by
 *   walking `parent.children` — which no longer contains a child that was removed
 *   before teardown (`cleanUp()` at `index.mjs:499` deletes a removed node's
 *   coords, siblings, animations and IntersectionObserver, but **not** its
 *   interval).
 *
 * So every mount of an auto-animated list leaks one 2 s polling interval per node,
 * for the lifetime of the document, each tick calling `getBoundingClientRect()` on
 * a detached element. On `/animations` — `AnimationsPage.vue`'s bento, `v-auto-animate`
 * over the whole catalogue — that is one interval per card plus one for the grid.
 *
 * In a browser the leak is invisible: nothing tears the page down under it. Under
 * `yarn test` the file's jsdom environment **is** torn down, `requestAnimationFrame`
 * stops existing, and `lowPriority()` (`index.mjs:168` — jsdom has no
 * `requestIdleCallback`, so it takes the rAF branch) raises
 * `ReferenceError: requestAnimationFrame is not defined` from a Node timer with no
 * test to attach it to. Vitest reports those as `Unhandled Errors` and exits 1 on a
 * suite where nothing failed, or exits 0 when the ticks happen to land before
 * teardown — which is what made `yarn test`'s exit code depend on machine load.
 *
 * **The fix owns the timers at the only place that can see both stages.** For the
 * duration of the single synchronous `autoAnimate()` call — and `poll()` is invoked
 * synchronously, from `forEach(el, updatePos, poll, …)` at `index.mjs:689`, which is
 * the module's *only* call site — `globalThis.setTimeout` is wrapped so every
 * stage-1 id is recorded, and each recorded callback is itself run with
 * `globalThis.setInterval` wrapped so the stage-2 id it installs is recorded too.
 * `destroy()` then cancels both sets after delegating to the library's own
 * `destroy()`. Both wrappers restore the value they replaced (not a pristine one)
 * in a `finally`, so an outer instrumentation — a test harness, an APM agent — keeps
 * its place in the chain, and neither wrapper is installed for longer than one
 * synchronous call or one timer callback.
 *
 * This is a real fix, not a test accommodation: the leak is a leak in a browser too.
 * It lives here rather than in a spec so that every consumer of `../motion` gets it —
 * the barrel re-exports `vAutoAnimate` / `useAutoAnimate` from this module instead of
 * straight from npm, and the registry item for `auto-animate-list` bundles this file
 * so a copied-out snippet inherits the same teardown.
 *
 * Reported upstream as a library defect; until it is fixed upstream this wrapper is
 * the boundary we control.
 */

/** Whatever the ambient scheduler hands back — `number` in the DOM, `Timeout` in Node. */
type TimerId = ReturnType<typeof setTimeout>

/** The one shape auto-animate ever schedules: a function, a delay, no extra args. */
type Scheduler = (handler: () => void, ms?: number) => TimerId

/** Every timer one `autoAnimate()` registration is responsible for. */
interface TrackedTimers {
  /** Stage-1 `poll()` timeouts — one per node, none of them known to the library. */
  readonly timeouts: Set<TimerId>
  /** Stage-2 poll intervals, captured as the stage-1 callback installs them. */
  readonly intervals: Set<TimerId>
}

/**
 * Run `body` with `globalThis.setInterval` wrapped so every interval it starts is
 * recorded in `tracked`. Used around a stage-1 poll callback, which is the only
 * moment auto-animate creates an interval.
 */
function recordingIntervals(tracked: TrackedTimers, body: () => void): void {
  const replaced = globalThis.setInterval
  const schedule = replaced as unknown as Scheduler
  globalThis.setInterval = ((handler: () => void, ms?: number): TimerId => {
    const id = schedule(handler, ms)
    tracked.intervals.add(id)
    return id
  }) as unknown as typeof globalThis.setInterval
  try {
    body()
  }
  finally {
    globalThis.setInterval = replaced
  }
}

/**
 * Register `el` with AutoAnimate, returning a controller whose `destroy()` leaves
 * no timer behind. Signature-compatible with the library's default export.
 */
export function autoAnimate(
  el: HTMLElement,
  config?: Partial<AutoAnimateOptions> | AutoAnimationPlugin,
): AnimationController {
  const tracked: TrackedTimers = { timeouts: new Set(), intervals: new Set() }

  const replaced = globalThis.setTimeout
  const schedule = replaced as unknown as Scheduler
  globalThis.setTimeout = ((handler: () => void, ms?: number): TimerId => {
    const id = schedule(() => {
      recordingIntervals(tracked, handler)
    }, ms)
    tracked.timeouts.add(id)
    return id
  }) as unknown as typeof globalThis.setTimeout

  let controller: AnimationController
  try {
    controller = baseAutoAnimate(el, config)
  }
  finally {
    // Restored even if registration throws: a leaked wrapper on the global
    // scheduler would outlive this element and attribute other code's timers here.
    globalThis.setTimeout = replaced
  }

  return Object.freeze({
    parent: controller.parent,
    enable: () => controller.enable(),
    disable: () => controller.disable(),
    isEnabled: () => controller.isEnabled(),
    destroy: () => {
      // The library first, so it cancels the animations and observers it owns;
      // then the poll timers it has no handle on.
      controller.destroy?.()
      for (const id of tracked.timeouts)
        clearTimeout(id)
      for (const id of tracked.intervals)
        clearInterval(id)
      tracked.timeouts.clear()
      tracked.intervals.clear()
    },
  })
}

/**
 * Controllers by host element. A WeakMap rather than the library's
 * `Object.defineProperty(el, '__aa_ctl', …)`: the directive's own bookkeeping has
 * no business being an enumerable-adjacent property on a DOM node a consumer may
 * inspect, and a WeakMap cannot survive the element it keys.
 */
const controllers = new WeakMap<HTMLElement, AnimationController>()

/**
 * `v-auto-animate`, over {@link autoAnimate}. Same binding shape as the library's
 * directive (an options object or a plugin, or nothing), and the same empty
 * `getSSRProps` so a server render emits no attribute for it.
 */
export const vAutoAnimate: Directive<
  HTMLElement,
  Partial<AutoAnimateOptions> | AutoAnimationPlugin | undefined
> = {
  mounted(el, binding) {
    controllers.set(el, autoAnimate(el, binding.value))
  },
  unmounted(el) {
    controllers.get(el)?.destroy?.()
    controllers.delete(el)
  },
  getSSRProps: () => ({}),
}

/**
 * `useAutoAnimate`, over {@link autoAnimate}.
 *
 * Two corrections to the library's Vue adapter beyond the timer fix:
 *
 * - Its `watchEffect` re-registers whenever the template ref changes but never
 *   destroys the controller for the element it just left, so a host swap leaks a
 *   whole registration. Here the effect's own `onCleanup` destroys the controller
 *   it created — which also covers unmount, because an effect created inside
 *   `onMounted` belongs to the component's scope and is stopped with it.
 * - The returned ref is typed `Ref<T | undefined>`, not `Ref<T>`. It *is* undefined
 *   until the element mounts, and a consumer that is told otherwise writes
 *   `listRef.value.something` and finds out at runtime.
 */
export function useAutoAnimate<T extends HTMLElement = HTMLElement>(
  options?: Partial<AutoAnimateOptions> | AutoAnimationPlugin,
): [Ref<T | undefined>, (enabled: boolean) => void] {
  const element = ref<T>() as Ref<T | undefined>
  let controller: AnimationController | undefined

  function setEnabled(enabled: boolean): void {
    if (!controller)
      return
    if (enabled)
      controller.enable()
    else
      controller.disable()
  }

  onMounted(() => {
    watchEffect((onCleanup) => {
      const host = element.value
      if (!(host instanceof HTMLElement))
        return
      const registration = autoAnimate(host, options)
      controller = registration
      onCleanup(() => {
        registration.destroy?.()
        if (controller === registration)
          controller = undefined
      })
    })
  })

  return [element, setEnabled]
}
