/**
 * Anatomy conformance for rendered DOM (TASK-OSS-P3-02, ADR-19).
 *
 * Re-exported here so a consumer needs one import to test a dzup-ui component:
 * the DOM installer below and the anatomy assertion are the same job.
 */
export type { AnatomyCheckOptions, AnatomyTarget, CheckableAnatomy } from './anatomy.js'
export { checkAnatomy, expectAnatomy } from './anatomy.js'

/**
 * Right-to-left conformance (TASK-OSS-P4-05).
 *
 * `expectRtl` is source-level and runs anywhere. `expectRtlComputed` needs an
 * engine that does layout and **throws rather than passing** under jsdom, so a
 * suite cannot go green on a claim it never checked.
 */
export type { CheckableRtl, RtlTarget } from './rtl.js'
export { checkRtl, expectRtl, expectRtlComputed, forwardArrow } from './rtl.js'

/**
 * Install the DOM affordances used by dzup-ui's Reka UI primitives.
 *
 * The installer is intentionally framework- and runner-independent. Consumers
 * can call it from Vitest, Jest, or another jsdom-compatible setup file. Native
 * browser implementations are never replaced.
 *
 * @returns an idempotent cleanup function that restores only properties added
 * by this invocation.
 */
export function installDzupUiDomTestEnvironment(): () => void {
  const restorers: Array<() => void> = []
  const animationFrameTimers = new Map<number, ReturnType<typeof setTimeout>>()
  let nextAnimationFrameId = 1

  function defineIfMissing(target: object, key: PropertyKey, value: unknown): void {
    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    const current = Reflect.get(target, key) as unknown
    if (typeof current !== 'undefined')
      return

    Object.defineProperty(target, key, {
      configurable: true,
      writable: true,
      value,
    })

    restorers.push(() => {
      if (descriptor !== undefined)
        Object.defineProperty(target, key, descriptor)
      else
        Reflect.deleteProperty(target, key)
    })
  }

  class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  defineIfMissing(globalThis, 'ResizeObserver', ResizeObserverStub)
  defineIfMissing(
    globalThis,
    'requestAnimationFrame',
    (callback: FrameRequestCallback): number => {
      const id = nextAnimationFrameId++
      const timer = setTimeout(() => {
        animationFrameTimers.delete(id)
        callback(typeof performance === 'undefined' ? Date.now() : performance.now())
      }, 0)
      animationFrameTimers.set(id, timer)
      return id
    },
  )
  defineIfMissing(globalThis, 'cancelAnimationFrame', (id: number): void => {
    const timer = animationFrameTimers.get(id)
    if (timer !== undefined)
      clearTimeout(timer)
    animationFrameTimers.delete(id)
  })

  restorers.push(() => {
    for (const timer of animationFrameTimers.values())
      clearTimeout(timer)
    animationFrameTimers.clear()
  })

  if (typeof Element !== 'undefined') {
    defineIfMissing(Element.prototype, 'scrollIntoView', (): void => {})
    defineIfMissing(Element.prototype, 'hasPointerCapture', (): boolean => {
      return false
    })
    defineIfMissing(Element.prototype, 'setPointerCapture', (): void => {})
    defineIfMissing(Element.prototype, 'releasePointerCapture', (): void => {})
  }

  let cleanedUp = false
  return () => {
    if (cleanedUp)
      return
    cleanedUp = true
    for (const restore of restorers.reverse())
      restore()
  }
}

/**
 * The security-fixture corpus schema (TASK-N1-O5).
 *
 * **Types only from this barrel.** The loader reads JSON from disk with
 * `node:fs`, and `@dzup-ui/testing` is imported from setup files that a
 * consumer may bundle for a browser runner; a Node built-in in the barrel would
 * make that a build error for everyone rather than only for the callers that
 * want fixture data. Import the runtime from the subpath instead:
 *
 * ```ts
 * import { fixturesForSink, payloadOf } from '@dzup-ui/testing/security-corpus'
 * ```
 *
 * The schema is shared by design with `ui/dzup-ui-pro`'s QUAL-04
 * (TASK-N1-P1): its sink registry names a `SecuritySink` per entry and reads
 * the required outcome for that sink out of these same fixture files.
 */
export type {
  CorpusViolation,
  NeutralizationOutcome,
  SecurityCategory,
  SecurityCorpusFile,
  SecurityFixture,
  SecuritySink,
} from './security-corpus.js'
