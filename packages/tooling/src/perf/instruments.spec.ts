/**
 * Unit tests for the four perf instruments (TASK-R2-O7).
 *
 * The lanes themselves live outside `yarn test` — they mount the catalogue
 * hundreds of times and belong to `yarn test:perf`. The *instruments* belong
 * here: a detector that has silently stopped detecting reports a clean
 * catalogue, and the only cheap way to know it is still working is to drive it
 * against a known input on every run, exactly as `statistics.spec.ts` does for
 * the threshold policy.
 */

import { describe, expect, it } from 'vitest'
import { compareHarness, harnessConfigHash, harnessFiles, vitestVersion } from './harness-hash.ts'
import { forceGc, formatBytes, measureHeap } from './heap.ts'
import {
  countsByMetric,
  describeGrowth,
  growth,
  installLeakAccounting,
  LEAK_METRICS,
  measureLeak,
} from './leak-detector.ts'
import { describeLongTasks, LONG_TASK_MS, longTaskRecorder } from './long-task.ts'
import { fixtureFor, TIER_FIXTURES, withOwnedContainer } from './tier-fixtures.ts'

describe('leak accounting', () => {
  it('counts a listener left on window and forgets one that was removed', () => {
    const accounting = installLeakAccounting()
    try {
      const before = accounting.snapshot()
      const kept = (): void => {}
      const removed = (): void => {}
      window.addEventListener('resize', kept)
      window.addEventListener('scroll', removed)
      window.removeEventListener('scroll', removed)
      expect(accounting.snapshot().listeners - before.listeners).toBe(1)
      window.removeEventListener('resize', kept)
      expect(accounting.snapshot().listeners - before.listeners).toBe(0)
    }
    finally {
      accounting.restore()
    }
  })

  it('does not double-count a duplicate registration, as the DOM does not', () => {
    const accounting = installLeakAccounting()
    try {
      const before = accounting.snapshot().listeners
      const listener = (): void => {}
      window.addEventListener('resize', listener)
      window.addEventListener('resize', listener)
      expect(accounting.snapshot().listeners - before).toBe(1)
      window.removeEventListener('resize', listener)
      expect(accounting.snapshot().listeners - before).toBe(0)
    }
    finally {
      accounting.restore()
    }
  })

  it('ignores a listener on a node that left the document with its component', () => {
    const accounting = installLeakAccounting()
    try {
      const before = accounting.snapshot().listeners
      const node = document.createElement('div')
      document.body.append(node)
      node.addEventListener('click', () => {})
      expect(accounting.snapshot().listeners - before).toBe(1)
      // The node goes away with the component; the handler is unreachable, so
      // it is not a leak and must stop being counted.
      node.remove()
      expect(accounting.snapshot().listeners - before).toBe(0)
    }
    finally {
      accounting.restore()
    }
  })

  it('counts an observer that is never disconnected', () => {
    const accounting = installLeakAccounting()
    try {
      const before = accounting.snapshot().observers
      const observer = new ResizeObserver(() => {})
      expect(accounting.snapshot().observers - before).toBe(1)
      observer.disconnect()
      expect(accounting.snapshot().observers - before).toBe(0)
    }
    finally {
      accounting.restore()
    }
  })

  it('counts an interval that is never cleared, and clears it on restore', () => {
    const accounting = installLeakAccounting()
    const before = accounting.snapshot().timers
    setInterval(() => {}, 100_000)
    expect(accounting.snapshot().timers - before).toBe(1)
    accounting.restore()
    expect(accounting.snapshot().timers).toBe(0)
  })

  it('restores every patched global', () => {
    const originalAdd = window.addEventListener
    const originalObserver = globalThis.ResizeObserver
    const originalInterval = globalThis.setInterval
    const accounting = installLeakAccounting()
    expect(window.addEventListener).not.toBe(originalAdd)
    accounting.restore()
    accounting.restore() // idempotent
    expect(window.addEventListener).toBe(originalAdd)
    expect(globalThis.ResizeObserver).toBe(originalObserver)
    expect(globalThis.setInterval).toBe(originalInterval)
  })

  it('discards the first cycle so process-lifetime state is not a leak', async () => {
    let mounts = 0
    const { delta } = await measureLeak(() => {
      mounts += 1
      if (mounts === 1)
        window.addEventListener('resize', () => {})
    }, 5)
    expect(mounts).toBe(5)
    expect(delta.listeners).toBe(0)
  })

  it('reports growth that happens on every cycle', async () => {
    const { delta } = await measureLeak(() => {
      window.addEventListener('resize', () => {})
    }, 5)
    expect(delta.listeners).toBe(4)
    expect(describeGrowth(delta)).toContain('listeners +4')
  })

  it('names every metric and spells no growth', () => {
    const zero = { listeners: 0, observers: 0, portalNodes: 0, documentNodes: 0, timers: 0 }
    expect(Object.keys(countsByMetric(zero))).toEqual([...LEAK_METRICS])
    expect(describeGrowth(growth(zero, zero))).toBe('no growth')
    expect(describeGrowth(growth(zero, { ...zero, observers: -2 }))).toBe('observers -2')
  })
})

describe('long-task accounting', () => {
  it('counts only the spans over the budget and names the worst', async () => {
    const recorder = longTaskRecorder()
    await recorder.step('fast', () => {})
    await recorder.step('slow', () => {
      const until = performance.now() + LONG_TASK_MS * 1.5
      while (performance.now() < until) { /* block */ }
    })
    const report = recorder.report()
    expect(report.spans).toHaveLength(2)
    expect(report.over.map(span => span.label)).toEqual(['slow'])
    expect(report.worst?.label).toBe('slow')
    expect(report.totalMs).toBeGreaterThan(LONG_TASK_MS)
    expect(describeLongTasks(report)).toContain('1 over 50ms')
  })

  it('times a step even when it throws, and re-throws', async () => {
    const recorder = longTaskRecorder()
    await expect(recorder.step('boom', () => {
      throw new Error('boom')
    })).rejects.toThrow('boom')
    expect(recorder.report().spans.map(s => s.label)).toEqual(['boom'])
  })

  it('says so when nothing ran', () => {
    expect(describeLongTasks(longTaskRecorder().report())).toBe('no steps recorded')
  })

  it('reports the worst span when nothing breached', async () => {
    const recorder = longTaskRecorder()
    await recorder.step('quick', () => {})
    expect(describeLongTasks(recorder.report())).toContain('0 over 50ms')
  })
})

describe('heap accounting', () => {
  it('resolves a collector without --expose-gc, or says it could not', async () => {
    const gc = await forceGc()
    // Both outcomes are legitimate; what is not legitimate is a silent zero.
    expect(gc === undefined || typeof gc === 'function').toBe(true)
  })

  it('measures a retained allocation', async () => {
    const gc = await forceGc()
    if (gc === undefined)
      return
    const held: Array<Record<string, unknown>> = []
    const { deltaBytes, collected } = await measureHeap(() => {
      for (let i = 0; i < 20_000; i++)
        held.push({ i, label: `row ${i}` })
    })
    expect(collected).toBe(true)
    expect(deltaBytes).toBeGreaterThan(200_000)
    held.length = 0
  })

  it('formats bytes at each scale, negatives included', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(-2048)).toBe('-2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
  })
})

describe('harness identity (D90)', () => {
  it('hashes the harness sources and excludes the baselines it describes', () => {
    const files = harnessFiles()
    expect(files).toContain('packages/tooling/src/perf-bench.spec.ts')
    expect(files).toContain('packages/tooling/src/perf/harness-hash.ts')
    expect(files).toContain('packages/tooling/perf-lanes/leak-lane.spec.ts')
    expect(files).toContain('vitest.config.ts')
    // A hash a file records about itself could never be verified.
    expect(files).not.toContain('packages/core/perf/baselines.json')
    expect(files).toEqual([...files].sort())
  })

  it('is stable across calls and 64 hex characters', () => {
    const first = harnessConfigHash()
    const second = harnessConfigHash()
    expect(first.configHash).toBe(second.configHash)
    expect(first.configHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('reads the installed runner version', () => {
    expect(vitestVersion()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('distinguishes unrecorded, matching and drifted instruments', () => {
    const current = { configHash: 'a'.repeat(64), vitest: '3.2.6' }
    expect(compareHarness(undefined, current).state).toBe('unrecorded')
    expect(compareHarness(current, current).state).toBe('match')

    const drifted = compareHarness({ configHash: 'b'.repeat(64), vitest: '4.1.11' }, current)
    expect(drifted.state).toBe('drifted')
    expect(drifted.state === 'drifted' && drifted.detail).toContain('vitest 4.1.11 → 3.2.6')
  })
})

describe('mount container', () => {
  it('removes its container even when the body already had children', async () => {
    const before = document.body.childNodes.length
    await withOwnedContainer(async (container) => {
      expect(container.isConnected).toBe(true)
      expect(document.body.childNodes.length).toBe(before + 1)
    })
    expect(document.body.childNodes.length).toBe(before)
  })

  it('removes its container when the callback rejects', async () => {
    const before = document.body.childNodes.length
    await expect(withOwnedContainer(async () => {
      throw new Error('boom')
    })).rejects.toThrow('boom')
    expect(document.body.childNodes.length).toBe(before)
  })
})

describe('fixture table', () => {
  it('resolves by name and refuses an unknown one', () => {
    expect(fixtureFor('DzTree')?.tier).toBe('C')
    expect(fixtureFor('DzNotAComponent')).toBeUndefined()
  })

  it('gives every fixture fresh props, never a shared object', () => {
    for (const fixture of TIER_FIXTURES)
      expect(fixture.props()).not.toBe(fixture.props())
  })
})
