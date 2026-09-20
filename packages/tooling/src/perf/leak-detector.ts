/**
 * Mount/unmount leak accounting (TASK-R2-O7).
 *
 * Doc 06 §Performance asks for a leak budget, and a size budget cannot see the
 * failure it names: a component that registers a `resize` handler on `window`
 * and forgets to remove it ships the same bytes and mounts in the same
 * milliseconds as one that cleans up. Fifty mount/unmount cycles turn that into
 * a number — fifty listeners still attached to `window` where zero belong.
 *
 * **What is counted, and what "leak" means here.**
 *
 *   - `listeners` — registrations still outstanding on a target that *outlives
 *     the component*: `window`, `document`, or any node still `isConnected`
 *     when the cycle ends. A listener on a node that went away with the
 *     component is not a leak; the node is unreachable and so is the handler.
 *     Counting those would make every component look like it leaks and the
 *     lane would be switched off within a week.
 *   - `observers` — `ResizeObserver` / `MutationObserver` / `IntersectionObserver`
 *     instances constructed and never `disconnect()`ed. Note the environment:
 *     `@dzup-ui/testing`'s DOM environment installs a `ResizeObserver` **stub**
 *     whose `disconnect()` is a no-op, so without this wrapper an unreleased
 *     observer is invisible in jsdom. The wrapper counts the call, so a
 *     component that never calls it is visible even against the stub.
 *   - `portalNodes` — direct children of `document.body` that were not there
 *     before the cycles. This is why the lane mounts with **teleport unstubbed**
 *     while `perf-bench.spec.ts` stubs it: a stubbed teleport renders in place
 *     and a portal that is never torn down leaves nothing behind to count.
 *   - `documentNodes` — total elements under `document`. A coarse net that
 *     catches "the component left half its tree in the page" when the escapee
 *     is not a direct body child.
 *   - `timers` — outstanding `setInterval` handles. An interval that survives
 *     unmount is the leak that keeps a whole component graph alive, and it is
 *     invisible to every other counter here.
 *
 * **What is NOT counted, and must not be claimed.** *Detached* nodes — retained
 * by a closure but no longer in the document — are the classic browser leak and
 * they cannot be counted in jsdom. Deciding a node is retained requires a heap
 * snapshot with reachability (`HeapProfiler.takeHeapSnapshot` over CDP), which
 * needs a real browser. `documentNodes` is a *connected*-node count and is
 * named that way on purpose; the detached-node lane is a browser-lane item and
 * is recorded as such rather than approximated and called done.
 *
 * @module @dzup-ui/tooling/perf/leak-detector
 */

/** One accounting snapshot. Every field is a count; every correct value is 0. */
export interface LeakCounts {
  readonly listeners: number
  readonly observers: number
  readonly portalNodes: number
  readonly documentNodes: number
  readonly timers: number
}

/** The metric suffixes a leak baseline id uses, in a stable order. */
export const LEAK_METRICS = [
  'listeners',
  'observers',
  'portal-nodes',
  'document-nodes',
  'timers',
] as const

export type LeakMetric = (typeof LEAK_METRICS)[number]

/** `LeakCounts` keyed the way a metric id spells it. */
export function countsByMetric(counts: LeakCounts): Record<LeakMetric, number> {
  return {
    'listeners': counts.listeners,
    'observers': counts.observers,
    'portal-nodes': counts.portalNodes,
    'document-nodes': counts.documentNodes,
    'timers': counts.timers,
  }
}

/** The difference between two snapshots, field by field. */
export function growth(before: LeakCounts, after: LeakCounts): LeakCounts {
  return {
    listeners: after.listeners - before.listeners,
    observers: after.observers - before.observers,
    portalNodes: after.portalNodes - before.portalNodes,
    documentNodes: after.documentNodes - before.documentNodes,
    timers: after.timers - before.timers,
  }
}

/** Human-readable growth, for a failure message that names what grew. */
export function describeGrowth(delta: LeakCounts): string {
  const parts = Object.entries(countsByMetric(delta))
    .filter(([, value]) => value !== 0)
    .map(([name, value]) => `${name} ${value > 0 ? '+' : ''}${value}`)
  return parts.length === 0 ? 'no growth' : parts.join(', ')
}

interface ListenerRecord {
  readonly target: EventTarget
  readonly type: string
  readonly listener: unknown
  readonly capture: boolean
}

/**
 * The shape `Counted` extends below.
 *
 * `disconnect(): void` is a **method** signature, not a `disconnect: () => void`
 * property. The distinction is not cosmetic: a subclass that overrides a
 * property with a method is TS2425 ("defines instance member property … but
 * extended class defines it as instance member function"), which is exactly
 * what the property spelling produced here. The real `ResizeObserver` and its
 * two siblings declare `disconnect` on their prototypes, so the method
 * spelling is also the truthful one.
 */
interface ObserverInstance {
  disconnect: () => void
}

interface ObserverConstructor {
  new (...args: never[]): ObserverInstance
}

function captureOf(options: unknown): boolean {
  if (typeof options === 'boolean')
    return options
  if (typeof options === 'object' && options !== null && 'capture' in options)
    return Boolean((options as { capture?: unknown }).capture)
  return false
}

/**
 * A target that outlives the component being cycled.
 *
 * `window` and `document` always do. A `Node` does when it is still in the
 * document at snapshot time — which is the only moment the question can be
 * answered, because a node detached *during* the cycle was never a leak.
 */
function outlivesComponent(target: EventTarget): boolean {
  if (typeof Node !== 'undefined' && target instanceof Node)
    return target.isConnected
  // window, document, XHR, AbortSignal, MediaQueryList … — all long-lived
  // relative to a mount, so an outstanding registration on one is countable.
  return true
}

/**
 * Every distinct object that owns an `addEventListener` implementation.
 *
 * **Patching `EventTarget.prototype` alone is not enough here, and the first
 * run of this lane proved it**: the seeded leak registered fifty `resize`
 * handlers on `window` and the detector reported zero. Under vitest's jsdom
 * environment `globalThis.EventTarget` is not the constructor `window`
 * inherits from — the environment copies jsdom's globals onto a Node global
 * object that already has its own `EventTarget` — so a single-prototype patch
 * silently misses `window`, which is exactly where the leak class that matters
 * most lives.
 *
 * So the owners are *discovered* rather than named: walk the prototype chain of
 * a representative of each host interface and take whichever object actually
 * owns the method. Duplicates collapse through the `Set`.
 */
function listenerPrototypes(): Array<Record<string, unknown>> {
  const samples: unknown[] = [
    typeof globalThis === 'undefined' ? undefined : globalThis,
    typeof window === 'undefined' ? undefined : window,
    typeof document === 'undefined' ? undefined : document,
    typeof document === 'undefined' ? undefined : document.body,
  ]

  const owners = new Set<Record<string, unknown>>()
  for (const sample of samples) {
    if (sample === undefined || sample === null)
      continue
    let cursor: object | null = sample as object
    while (cursor !== null) {
      if (Object.prototype.hasOwnProperty.call(cursor, 'addEventListener')) {
        owners.add(cursor as Record<string, unknown>)
        break
      }
      cursor = Object.getPrototypeOf(cursor) as object | null
    }
  }
  return [...owners]
}

/** The instrumentation handle. Always `restore()` in a `finally`. */
export interface LeakAccounting {
  /** Count what is outstanding right now. */
  snapshot: () => LeakCounts
  /** Undo every patch. Idempotent. */
  restore: () => void
}

/**
 * Patch the global constructors and registration functions, and start counting.
 *
 * Deliberately global rather than per-wrapper: a component can register a
 * listener on `window` from a composable four layers down, and an instrument
 * that only saw the wrapper's own subtree would report zero for the leak class
 * that matters most.
 */
export function installLeakAccounting(): LeakAccounting {
  const records: ListenerRecord[] = []
  const liveObservers = new Set<object>()
  const liveIntervals = new Set<unknown>()
  const restorers: Array<() => void> = []

  // --- listeners -----------------------------------------------------------
  for (const proto of listenerPrototypes()) {
    const originalAdd = proto.addEventListener as EventTarget['addEventListener']
    const originalRemove = proto.removeEventListener as EventTarget['removeEventListener']

    proto.addEventListener = function patchedAdd(
      this: EventTarget,
      type: string,
      listener: unknown,
      options?: unknown,
    ): void {
      const capture = captureOf(options)
      // DOM semantics: registering the same (type, listener, capture) twice on
      // the same target is a no-op. Recording it twice would invent a leak.
      const already = records.some(r =>
        r.target === this && r.type === type && r.listener === listener && r.capture === capture)
      if (!already)
        records.push({ target: this, type, listener, capture })
      originalAdd.call(this, type, listener as EventListener, options as boolean)
    }

    proto.removeEventListener = function patchedRemove(
      this: EventTarget,
      type: string,
      listener: unknown,
      options?: unknown,
    ): void {
      const capture = captureOf(options)
      const index = records.findIndex(r =>
        r.target === this && r.type === type && r.listener === listener && r.capture === capture)
      if (index >= 0)
        records.splice(index, 1)
      originalRemove.call(this, type, listener as EventListener, options as boolean)
    }

    restorers.push(() => {
      proto.addEventListener = originalAdd
      proto.removeEventListener = originalRemove
    })
  }

  // --- observers -----------------------------------------------------------
  for (const name of ['ResizeObserver', 'MutationObserver', 'IntersectionObserver'] as const) {
    const original = (globalThis as Record<string, unknown>)[name] as
      | ObserverConstructor
      | undefined
    if (original === undefined)
      continue

    // A `construct` Proxy rather than `class Counted extends original`.
    //
    // The subclass spelling looks more natural and cannot be written here: an
    // `override disconnect(): void { … }` is a *method*, the base type declares
    // `disconnect` as a *property*, and TypeScript rejects the pair with TS2425
    // — while this repository's `ts/method-signature-style` rule forbids
    // declaring the base as a method to match. The two rules leave no legal
    // subclass, so the interception moves off the prototype chain and onto the
    // instance, where it is also the more faithful instrument: the proxy keeps
    // the real constructor's prototype, so `instanceof ResizeObserver` still
    // holds for a component that checks, and the own `disconnect` shadows the
    // prototype's for exactly as long as the instance lives.
    const Counted = new Proxy(original, {
      construct(target, args) {
        const instance = Reflect.construct(target, args) as ObserverInstance
        liveObservers.add(instance)
        const passThrough = instance.disconnect.bind(instance)
        instance.disconnect = (): void => {
          liveObservers.delete(instance)
          passThrough()
        }
        return instance
      },
    })

    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: Counted,
    })
    restorers.push(() => {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        writable: true,
        value: original,
      })
    })
  }

  // --- intervals -----------------------------------------------------------
  const originalSetInterval = globalThis.setInterval
  const originalClearInterval = globalThis.clearInterval
  ;(globalThis as { setInterval: unknown }).setInterval = function patchedSetInterval(
    ...args: Parameters<typeof setInterval>
  ) {
    const handle = originalSetInterval(...args)
    liveIntervals.add(handle)
    return handle
  }
  ;(globalThis as { clearInterval: unknown }).clearInterval = function patchedClearInterval(
    handle?: Parameters<typeof clearInterval>[0],
  ) {
    liveIntervals.delete(handle)
    return originalClearInterval(handle)
  }
  restorers.push(() => {
    ;(globalThis as { setInterval: unknown }).setInterval = originalSetInterval
    ;(globalThis as { clearInterval: unknown }).clearInterval = originalClearInterval
  })

  let restored = false

  return {
    snapshot(): LeakCounts {
      return {
        listeners: records.filter(r => outlivesComponent(r.target)).length,
        observers: liveObservers.size,
        portalNodes: typeof document === 'undefined' ? 0 : document.body.childNodes.length,
        documentNodes: typeof document === 'undefined'
          ? 0
          : document.getElementsByTagName('*').length,
        timers: liveIntervals.size,
      }
    },
    restore(): void {
      if (restored)
        return
      restored = true
      for (const restore of restorers.reverse())
        restore()
      for (const handle of liveIntervals)
        originalClearInterval(handle as Parameters<typeof clearInterval>[0])
      liveIntervals.clear()
      records.length = 0
      liveObservers.clear()
    },
  }
}

/**
 * Run `cycle` `times` times under accounting and report the growth.
 *
 * One warm-up cycle runs **before** the "before" snapshot and is excluded from
 * the count. The first mount of a Vue component legitimately installs
 * process-lifetime state — a `<style>` element, a singleton portal container, a
 * `matchMedia` listener owned by a provider — which is allocated once and
 * belongs to the process rather than to the instance. Counting it would report
 * a constant, non-growing offset as a leak on every component in the catalogue,
 * and a lane that cries wolf 22 times is a lane nobody reads. Growth *after*
 * the first cycle is the claim: 49 more mounts must cost nothing more.
 */
export async function measureLeak(
  cycle: () => void | Promise<void>,
  times: number,
): Promise<{ before: LeakCounts, after: LeakCounts, delta: LeakCounts }> {
  const accounting = installLeakAccounting()
  try {
    await cycle()
    const before = accounting.snapshot()
    for (let i = 1; i < times; i++)
      await cycle()
    const after = accounting.snapshot()
    return { before, after, delta: growth(before, after) }
  }
  finally {
    accounting.restore()
  }
}
