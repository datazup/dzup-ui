/**
 * The memory lane (TASK-R2-O7, doc 06 §Performance).
 *
 * Heap bytes retained after the same mount/unmount cycle the leak lane runs,
 * with a forced collection on each side. The leak lane counts *handles*; this
 * counts *bytes*, and the two find different failures — a closure over a
 * thousand-row dataset held by a module-level cache registers no listener, no
 * observer and no portal node, and shows up only here.
 *
 * **Noisy by nature, and recorded as such.** A heap delta on a running V8 moves
 * with JIT state, with string interning, with whatever the previous spec left
 * behind. The variance policy handles that without a special case: a
 * distribution whose spread swamps its signal earns `null` and the metric reads
 * `not yet measurable` rather than publishing a threshold that fires at random.
 * That verdict is the honest outcome for this lane on a developer machine, and
 * it is the one nine of the eleven committed runtime metrics already carry.
 *
 * **The seeded failure** is a component that retains a megabyte per mount in a
 * module-level array. A heap lane that has stopped measuring reports ~0 for
 * everything, which looks exactly like a catalogue that retains nothing.
 */

import type { Component } from 'vue'
import type { TierFixture } from '../src/perf/tier-fixtures.ts'
import process from 'node:process'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { forceGc, formatBytes, measureHeap } from '../src/perf/heap.ts'
import { judge, note, record, reportHarness } from '../src/perf/lane-report.ts'
import { TIER_FIXTURES, withOwnedContainer } from '../src/perf/tier-fixtures.ts'

/** Cycles per measurement — fewer than the leak lane's 50: bytes accumulate. */
const CYCLES = Number(process.env.DZUP_PERF_MEMORY_CYCLES ?? 20)

/** Measurements per process. */
const ITERATIONS = Number(process.env.DZUP_PERF_MEMORY_ITERATIONS ?? 2)

reportHarness()

/**
 * Deliberate retention, module-level so nothing can collect it.
 *
 * **Objects, not a `Uint8Array`.** The first version of this seed retained
 * `new Uint8Array(1 MB)` per mount and the lane reported a *negative* delta:
 * a typed array's backing store is external memory, and `heapUsed` — the number
 * this lane records — does not count it. A seed that the instrument cannot see
 * would have certified a broken detector as working, which is the exact failure
 * the seeded checks exist to prevent. Plain objects live on the JS heap, which
 * is where a retained component graph lives too.
 */
const retained: Array<Array<Record<string, unknown>>> = []

/** ~1 MB of JS-heap objects. */
function heapBallast(): Array<Record<string, unknown>> {
  return Array.from({ length: 12_000 }, (_, i) => ({
    index: i,
    label: `retained row ${i}`,
    nested: { a: i, b: `${i}`, c: i % 2 === 0 },
  }))
}

describe('heap detector (seeded failure)', () => {
  it('catches a component that retains a megabyte per mount', async () => {
    const gc = await forceGc()
    if (gc === undefined) {
      note('heap: no collector available in this process — seeded check skipped, '
        + 'and every memory metric below is unrecorded for the same reason')
      return
    }

    const Retaining = defineComponent({
      name: 'SeededRetain',
      setup() {
        retained.push(heapBallast())
        return () => h('div', 'retaining')
      },
    })

    const before = retained.length
    const { deltaBytes } = await measureHeap(async () => {
      for (let i = 0; i < 4; i++) {
        await withOwnedContainer(async (container) => {
          const wrapper = mount(Retaining, { attachTo: container })
          await nextTick()
          wrapper.unmount()
        })
      }
    })

    expect(retained.length - before).toBe(4)
    expect(deltaBytes, `retained ${formatBytes(deltaBytes ?? 0)} for 4 MB deliberately held`)
      .toBeGreaterThan(3 * 1024 * 1024)
    retained.length = before
  })
})

/** Mount and unmount `component` `times` times, each in its own container. */
async function cycleOnce(
  component: Component,
  fixture: TierFixture,
  times: number,
): Promise<void> {
  for (let cycle = 0; cycle < times; cycle++) {
    await withOwnedContainer(async (container) => {
      const wrapper = mount(component, {
        props: fixture.props(),
        slots: fixture.slots?.(),
        attachTo: container,
      })
      await nextTick()
      wrapper.unmount()
      await nextTick()
    })
  }
}

describe('tier C/D memory lane', () => {
  for (const fixture of TIER_FIXTURES) {
    it(`${fixture.component} retains nothing measurable across ${CYCLES} cycles`, async () => {
      const component = await fixture.load()
      const samples: number[] = []

      // Warm up before measuring, for the same reason the leak lane discards
      // its first cycle — and here it is not a rounding difference. Measured
      // without a warm-up, this lane read `DzCommandPalette` at 12.17 MB and
      // `DzCalendar` at 2.21 MB over three cycles: those are one-time costs of
      // the first mount (template compilation, `tv()` recipe caches, the
      // component's module graph reaching steady state), not retention. A lane
      // that published them would have filed a leak defect against every heavy
      // component in the catalogue on its first run.
      await cycleOnce(component, fixture, 2)

      for (let i = 0; i < ITERATIONS; i++) {
        const { deltaBytes, collected } = await measureHeap(
          () => cycleOnce(component, fixture, CYCLES),
        )
        if (!collected || deltaBytes === undefined) {
          note(`${fixture.component}: heap unmeasured — no collector in this process`)
          return
        }
        samples.push(deltaBytes)
      }

      note(`${fixture.component}: ${samples.map(formatBytes).join(', ')} over ${CYCLES} cycles`)

      const id = `memory:${fixture.component}:heap-delta-${CYCLES}`
      const verdict = judge(id, record(id, samples), 'bytes')
      expect(verdict.fail ? verdict.message : '', verdict.message).toBe('')
    })
  }
})
