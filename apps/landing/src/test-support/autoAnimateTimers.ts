/**
 * Guard for @formkit/auto-animate's un-cancellable poll timers in jsdom specs.
 *
 * `AnimationsPage.vue` puts `v-auto-animate` on the bento, and auto-animate's
 * `poll()` leaves a 2 s `setInterval` per element that nothing can clear (the
 * full analysis is at the top of `pages/AnimationsPage.v2.spec.ts`, which keeps
 * its own copy because it also asserts on the tracked set). When a spec file's
 * jsdom environment is torn down, each surviving interval raises
 * `ReferenceError: requestAnimationFrame is not defined` from a Node timer — an
 * unhandled error that fails `yarn test` with every test passing. It depends on
 * how long the file runs, so it looks like a flake.
 *
 * Any spec that mounts the animations route through the router must call this
 * at module top level: it wraps the global schedulers for the file, tracks the
 * ids whose call stack passes through auto-animate, clears them after every
 * test and when the file ends, and restores the natives in `afterAll`.
 */
import { afterAll, afterEach, beforeAll } from 'vitest'

export function guardAutoAnimateTimers(): void {
  const timers = new Set<unknown>()
  const nativeSetTimeout = globalThis.setTimeout
  const nativeSetInterval = globalThis.setInterval

  const scheduledByAutoAnimate = (): boolean =>
    new Error('auto-animate timer probe').stack?.includes('auto-animate') === true

  const clear = (): void => {
    for (const id of timers) {
      clearTimeout(id as Parameters<typeof clearTimeout>[0])
      clearInterval(id as Parameters<typeof clearInterval>[0])
    }
    timers.clear()
  }

  beforeAll(() => {
    globalThis.setTimeout = ((handler: TimerHandler, ms?: number, ...args: unknown[]) => {
      const id = nativeSetTimeout(handler as () => void, ms, ...args)
      if (scheduledByAutoAnimate())
        timers.add(id)
      return id
    }) as unknown as typeof globalThis.setTimeout

    globalThis.setInterval = ((handler: TimerHandler, ms?: number, ...args: unknown[]) => {
      const id = nativeSetInterval(handler as () => void, ms, ...args)
      if (scheduledByAutoAnimate())
        timers.add(id)
      return id
    }) as unknown as typeof globalThis.setInterval
  })

  afterEach(clear)

  afterAll(() => {
    clear()
    globalThis.setTimeout = nativeSetTimeout
    globalThis.setInterval = nativeSetInterval
  })
}
