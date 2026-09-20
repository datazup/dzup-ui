/**
 * Heap accounting (TASK-R2-O7).
 *
 * The third lane doc 06 §Performance asks for. The leak lane counts *handles* —
 * listeners, observers, portal nodes — and a component can hold megabytes
 * without holding one of those: a closure over a 1,000-row dataset retained by
 * a module-level cache registers nothing and grows forever.
 *
 * **Forced collection, and why it is worth the trouble.** `heapUsed` without a
 * preceding collection measures garbage as much as retention, and the
 * difference is far larger than the signal. Node exposes `global.gc` only under
 * `--expose-gc`, which the vitest workers are not started with, so this module
 * turns the flag on at runtime through `v8.setFlagsFromString` and compiles a
 * reference to `gc` in a fresh context. That is a supported Node path, and it
 * is preferable to adding `--expose-gc` to the repository's `NODE_OPTIONS`:
 * that would change the garbage-collector configuration of **every** spec in
 * the 534-file suite, i.e. change the thing the runtime baselines measure, to
 * serve one lane.
 *
 * When the flag cannot be set the lane says so and records nothing, rather than
 * publishing a delta that is mostly uncollected garbage. A metric that is
 * sometimes meaningful and never says which is worse than an absent one.
 *
 * @module @dzup-ui/tooling/perf/heap
 */

import process from 'node:process'

type Collector = () => void

let resolved: Collector | undefined | null = null

/**
 * A function that forces a full collection, or `undefined`.
 *
 * Resolved once per process: `setFlagsFromString` is cheap but not free, and
 * the answer cannot change within a process.
 */
export async function forceGc(): Promise<Collector | undefined> {
  if (resolved !== null)
    return resolved ?? undefined

  const existing = (globalThis as { gc?: Collector }).gc
  if (typeof existing === 'function') {
    resolved = existing
    return resolved
  }

  try {
    const v8 = await import('node:v8')
    const vm = await import('node:vm')
    v8.setFlagsFromString('--expose_gc')
    const collector = vm.runInNewContext('gc') as Collector | undefined
    // Leave the flag off again: an exposed `gc` is a global other specs in the
    // same worker could reach, and this module is not entitled to change the
    // environment they run in beyond the moment it needs.
    v8.setFlagsFromString('--no-expose_gc')
    resolved = typeof collector === 'function' ? collector : undefined
  }
  catch {
    resolved = undefined
  }
  return resolved ?? undefined
}

export interface HeapMeasurement {
  /** `heapUsed` delta in bytes, or `undefined` when no collector was available. */
  readonly deltaBytes: number | undefined
  readonly beforeBytes: number
  readonly afterBytes: number
  readonly collected: boolean
}

/**
 * Measure the heap retained across `work`.
 *
 * Two collections on each side, not one: V8's mark-sweep leaves objects that
 * only become unreachable *because of* the first pass, and a single collection
 * routinely reports tens of kilobytes that a second one reclaims. Two is where
 * the reading stops moving on this catalogue.
 */
export async function measureHeap(
  work: () => void | Promise<void>,
): Promise<HeapMeasurement> {
  const gc = await forceGc()
  const settle = async (): Promise<void> => {
    if (gc === undefined)
      return
    gc()
    await new Promise(resolve => setTimeout(resolve, 0))
    gc()
  }

  await settle()
  const beforeBytes = process.memoryUsage().heapUsed
  await work()
  await settle()
  const afterBytes = process.memoryUsage().heapUsed

  return {
    deltaBytes: gc === undefined ? undefined : afterBytes - beforeBytes,
    beforeBytes,
    afterBytes,
    collected: gc !== undefined,
  }
}

/** Bytes as a reader can act on them. */
export function formatBytes(bytes: number): string {
  const sign = bytes < 0 ? '-' : ''
  const absolute = Math.abs(bytes)
  if (absolute < 1024)
    return `${sign}${absolute} B`
  if (absolute < 1024 * 1024)
    return `${sign}${(absolute / 1024).toFixed(1)} KB`
  return `${sign}${(absolute / (1024 * 1024)).toFixed(2)} MB`
}
