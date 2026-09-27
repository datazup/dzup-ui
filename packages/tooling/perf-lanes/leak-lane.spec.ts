/**
 * The mount/unmount leak lane (TASK-R2-O7, doc 06 §Performance).
 *
 * Fifty mount/unmount cycles per Tier C component, asserting that the counts of
 * listeners on surviving targets, undisconnected observers, portal nodes,
 * connected document nodes and outstanding intervals do not grow.
 *
 * **The tolerance is 0, and the policy says so without a special case.** A
 * recorded distribution of zeros has median 0 and σ 0, so the standing formula
 * `median + max(3σ, 5 %)` yields a threshold of exactly 0 and any growth is a
 * regression. That is why these metrics are recorded through the same
 * `Baseline` shape as a millisecond rather than as a bespoke assertion: one
 * policy, one file, one ratchet.
 *
 * **Teleport is not stubbed here**, unlike `perf-bench.spec.ts`. A stubbed
 * teleport renders in place, so a portal that is never torn down leaves nothing
 * in `document.body` to count — the lane would pass vacuously on precisely the
 * components it exists for.
 *
 * **The seeded failure** is the first test in the file. A leak detector that
 * has quietly stopped detecting reports zero growth for everything, which looks
 * exactly like twenty-two clean components. So a component that deliberately
 * leaks one `window` listener, one observer and one interval per mount must be
 * caught, unconditionally and with the gate off.
 */

import type { LeakCounts } from '../src/perf/leak-detector.ts'
import process from 'node:process'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, onMounted, onUnmounted } from 'vue'
import { judge, note, record, reportHarness } from '../src/perf/lane-report.ts'
import {
  countsByMetric,
  describeGrowth,
  LEAK_METRICS,
  measureLeak,
} from '../src/perf/leak-detector.ts'
import { TIER_FIXTURES, withOwnedContainer } from '../src/perf/tier-fixtures.ts'

/**
 * Cycles per measurement.
 *
 * Fifty because doc 06 says fifty, and because the shape of the failure needs
 * it: a leak of one handle per mount is one handle after one cycle, which is
 * indistinguishable from the process-lifetime state a first mount legitimately
 * installs. After fifty it is forty-nine, which is not.
 */
const CYCLES = Number(process.env.DZUP_PERF_LEAK_CYCLES ?? 50)

/**
 * Measurements per process.
 *
 * One, unlike the timing benchmarks' seven. A leak count is not a timing: the
 * fifty cycles *are* the repetition, and the ≥5 runs the variance policy
 * requires come from the five processes `yarn perf:capture` starts. Seven
 * measurements per process would be 7 × 50 × 22 mounts for no extra signal.
 */
const MEASUREMENTS = Number(process.env.DZUP_PERF_LEAK_MEASUREMENTS ?? 1)

reportHarness()

describe('leak detector (seeded failure)', () => {
  it('catches a component that leaks a listener, an observer and an interval', async () => {
    const Leaky = defineComponent({
      name: 'SeededLeak',
      setup() {
        onMounted(() => {
          window.addEventListener('resize', () => {})
          const observer = new ResizeObserver(() => {})
          observer.observe(document.body)
          setInterval(() => {}, 100_000)
          document.body.append(document.createElement('div'))
        })
        // No `onUnmounted`. That is the defect being seeded.
        return () => h('div', 'leaky')
      },
    })

    const { delta } = await measureLeak(async () => {
      await withOwnedContainer(async (container) => {
        const wrapper = mount(Leaky, { attachTo: container })
        await nextTick()
        wrapper.unmount()
      })
    }, 6)

    // Five cycles after the warm-up, one handle of each kind per cycle.
    expect(delta.listeners, describeGrowth(delta)).toBeGreaterThanOrEqual(5)
    expect(delta.observers, describeGrowth(delta)).toBeGreaterThanOrEqual(5)
    expect(delta.timers, describeGrowth(delta)).toBeGreaterThanOrEqual(5)
    expect(delta.portalNodes, describeGrowth(delta)).toBeGreaterThanOrEqual(5)
  })

  it('reports no growth for a component that cleans up', async () => {
    const Clean = defineComponent({
      name: 'SeededClean',
      setup() {
        const handler = (): void => {}
        let observer: ResizeObserver | undefined
        let timer: ReturnType<typeof setInterval> | undefined
        onMounted(() => {
          window.addEventListener('resize', handler)
          observer = new ResizeObserver(() => {})
          observer.observe(document.body)
          timer = setInterval(() => {}, 100_000)
        })
        onUnmounted(() => {
          window.removeEventListener('resize', handler)
          observer?.disconnect()
          if (timer !== undefined)
            clearInterval(timer)
        })
        return () => h('div', 'clean')
      },
    })

    const { delta } = await measureLeak(async () => {
      await withOwnedContainer(async (container) => {
        const wrapper = mount(Clean, { attachTo: container })
        await nextTick()
        wrapper.unmount()
      })
    }, 6)

    expect(describeGrowth(delta)).toBe('no growth')
  })
})

describe('tier C/D mount-unmount leak lane', () => {
  for (const fixture of TIER_FIXTURES) {
    it(`${fixture.component} holds nothing across ${CYCLES} cycles`, async () => {
      const component = await fixture.load()

      const samples: Record<string, number[]> = Object.fromEntries(
        LEAK_METRICS.map(metric => [metric, [] as number[]]),
      )

      let last: LeakCounts | undefined
      for (let i = 0; i < MEASUREMENTS; i++) {
        const { delta } = await measureLeak(async () => {
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
        }, CYCLES)
        last = delta
        for (const [metric, value] of Object.entries(countsByMetric(delta)))
          samples[metric]!.push(value)
      }

      note(`${fixture.component}: ${describeGrowth(last!)} over ${CYCLES - 1} counted cycles`)

      const failures: string[] = []
      for (const metric of LEAK_METRICS) {
        const id = `leak:${fixture.component}:${metric}-${CYCLES}`
        const verdict = judge(id, record(id, samples[metric]!), 'count')
        if (verdict.fail)
          failures.push(verdict.message)
      }

      expect(failures.join('\n'), failures.join('\n')).toBe('')
    })
  }
})
