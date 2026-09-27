/**
 * The long-task lane (TASK-R2-O7, doc 06 §Performance).
 *
 * A scripted interaction per Tier C component, timed step by step, recording
 * **how many steps exceeded the 50 ms responsiveness budget**. See
 * `src/perf/long-task.ts` for why the metric is a count rather than a duration
 * and why it is not `PerformanceObserver`.
 *
 * The script is deliberately the same for every component — focus, three
 * ArrowDowns, Enter, Escape — rather than bespoke per component. A per-component
 * script would measure twenty-two different things and the numbers could not be
 * compared; this one measures the same thing twenty-two times, which is what a
 * budget needs. Keys are dispatched into the mount container (and, for a fully
 * teleported component, into the portal) and allowed to bubble, so a component
 * that binds at any level in its own tree receives them.
 *
 * **The seeded failure** is a component whose keydown handler blocks for 120 ms.
 * A long-task detector that has stopped detecting reports zero for everything,
 * which looks exactly like a responsive catalogue.
 */

import process from 'node:process'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { judge, note, record, reportHarness } from '../src/perf/lane-report.ts'
import { describeLongTasks, LONG_TASK_MS, longTaskRecorder } from '../src/perf/long-task.ts'
import { TIER_FIXTURES, withOwnedContainer } from '../src/perf/tier-fixtures.ts'

/** Scripted interactions per measurement. */
const ITERATIONS = Number(process.env.DZUP_PERF_LONGTASK_ITERATIONS ?? 3)

reportHarness()

/**
 * Send one key to the most plausible recipient inside `host`.
 *
 * The host is the **container**, not `wrapper.element`. `DzTour` renders its
 * whole UI through a teleport and its root vnode is a comment node, so
 * `wrapper.element.querySelector` is not a function — the first run of this
 * lane failed on exactly that. Searching the container also finds nothing for a
 * fully teleported component, so `document.body` is the second place to look:
 * the portal is where an overlay's keyboard handling actually lives.
 */
function press(host: HTMLElement, key: string): void {
  const selector = 'input, textarea, button, [tabindex], [role="listbox"], [role="dialog"]'
  const target = (host.querySelector(selector)
    ?? document.body.querySelector(selector)
    ?? host) as HTMLElement
  target.focus?.()
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
}

describe('long-task detector (seeded failure)', () => {
  it('catches a handler that blocks past the budget', async () => {
    const Blocking = defineComponent({
      name: 'SeededLongTask',
      setup() {
        function onKeydown(): void {
          const until = performance.now() + LONG_TASK_MS * 2.4
          // A busy wait is the honest seed: a `setTimeout` would yield, which is
          // the opposite of what a long task does to the main thread.
          while (performance.now() < until) { /* block */ }
        }
        return () => h('div', { tabindex: 0, onKeydown }, 'blocking')
      },
    })

    const recorder = longTaskRecorder()
    await withOwnedContainer(async (container) => {
      const wrapper = mount(Blocking, { attachTo: container })
      await recorder.step('key:ArrowDown', async () => {
        press(container, 'ArrowDown')
        await nextTick()
      })
      wrapper.unmount()
    })

    const report = recorder.report()
    expect(report.over.length, describeLongTasks(report)).toBeGreaterThanOrEqual(1)
  })

  it('reports nothing for a handler that returns immediately', async () => {
    const Fast = defineComponent({
      name: 'SeededFast',
      setup: () => () => h('div', { tabindex: 0, onKeydown: () => {} }, 'fast'),
    })

    const recorder = longTaskRecorder()
    await withOwnedContainer(async (container) => {
      const wrapper = mount(Fast, { attachTo: container })
      await recorder.step('key:ArrowDown', async () => {
        press(container, 'ArrowDown')
        await nextTick()
      })
      wrapper.unmount()
    })

    expect(recorder.report().over).toHaveLength(0)
  })
})

describe('tier C/D long-task lane', () => {
  for (const fixture of TIER_FIXTURES) {
    it(`${fixture.component} runs no task over ${LONG_TASK_MS}ms`, async () => {
      const component = await fixture.load()
      const counts: number[] = []
      const worstMs: number[] = []
      let lastDetail = ''

      for (let i = 0; i < ITERATIONS; i++) {
        const recorder = longTaskRecorder()
        await withOwnedContainer(async (container) => {
          const wrapper = await recorder.step('mount', async () => {
            const mounted = mount(component, {
              props: fixture.props(),
              slots: fixture.slots?.(),
              attachTo: container,
            })
            await nextTick()
            return mounted
          })

          for (const key of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'Enter', 'Escape']) {
            await recorder.step(`key:${key}`, async () => {
              press(container, key)
              await nextTick()
            })
          }

          await recorder.step('unmount', async () => {
            wrapper.unmount()
            await nextTick()
          })
        })

        const report = recorder.report()
        counts.push(report.over.length)
        worstMs.push(report.worst?.ms ?? 0)
        lastDetail = describeLongTasks(report)
      }

      note(`${fixture.component}: ${lastDetail}`)

      const countId = `longtask:${fixture.component}:over-${LONG_TASK_MS}ms`
      const worstId = `longtask:${fixture.component}:worst-span`
      const countVerdict = judge(countId, record(countId, counts), 'count')
      // The worst span is recorded but never gated: it is a wall-clock number
      // on a shared machine, which is the measurement this repository already
      // has 9 recorded `variance-exceeds-signal` verdicts about. It is here so
      // a reader can see *how far* over the budget a breach went, which the
      // count alone cannot say.
      judge(worstId, record(worstId, worstMs), 'ms')

      expect(countVerdict.fail ? countVerdict.message : '', countVerdict.message).toBe('')
    })
  }
})
