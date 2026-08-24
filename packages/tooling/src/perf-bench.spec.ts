import type { Distribution } from './perf/statistics.ts'
import { appendFileSync } from 'node:fs'
/**
 * Performance benchmarks for Tier C/D components (TASK-OSS-P5-05).
 *
 * **What changed, and why it had to.** Until this packet every assertion here
 * was one wall-clock average against a fixed 3,000 ms constant. That produced
 * two recorded flakes — `DzDataGrid with 100 rows` and, in the provider packet,
 * `DzMasonry` — which fail in a full run and pass in isolation, because a
 * benchmark competing with 429 other test files for CPU measures the scheduler
 * as much as it measures the component. Raising the constant would have bought
 * silence, not signal.
 *
 * So the shape is now: measure a distribution, compare its **median** against a
 * threshold **derived from a recorded distribution**, and when a metric has no
 * recorded baseline yet, report the numbers and pass. Capturing baselines is a
 * separate, deliberate act — `yarn perf:capture` — because a suite that wrote
 * its own baseline on every run would ratchet upward forever and call it a
 * budget.
 *
 * Usage:
 *   yarn test:perf                  # assert against packages/core/perf/baselines.json
 *   yarn perf:capture               # re-measure and write baselines (owner action)
 *
 * @module @dzup-ui/tooling/perf-bench
 */
import process from 'node:process'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { readBaselines } from './perf/read-baselines.ts'
import { isRegression, MEASURABLE_CV, describe as summarize } from './perf/statistics.ts'

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------

interface GridRow {
  id: number
  name: string
  email: string
  role: string
  status: string
}

function generateGridRows(count: number): GridRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
    status: i % 2 === 0 ? 'Active' : 'Inactive',
  }))
}

function generateGridColumns() {
  return [
    { field: 'id' as const, header: 'ID', sortable: true, width: 80 },
    { field: 'name' as const, header: 'Name', sortable: true },
    { field: 'email' as const, header: 'Email', sortable: true },
    { field: 'role' as const, header: 'Role', sortable: true },
    { field: 'status' as const, header: 'Status', sortable: true },
  ]
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

/**
 * Iterations per metric per process.
 *
 * Seven rather than five so `p95` has something to interpolate between and one
 * cold first mount cannot move the median. `yarn perf:capture` runs this whole
 * file several times over, so a recorded baseline sees cross-process variance
 * too — which is the variance the two flakes actually came from.
 */
const ITERATIONS = Number(process.env.DZUP_PERF_ITERATIONS ?? 7)

/** Set by `yarn perf:capture` to the file samples should be appended to. */
const CAPTURE_TO = process.env.DZUP_PERF_CAPTURE

const BASELINES = readBaselines()

async function measure(id: string, run: () => void | Promise<void>): Promise<Distribution> {
  const samples: number[] = []
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    await run()
    samples.push(performance.now() - start)
  }
  const distribution = summarize(samples)

  if (CAPTURE_TO !== undefined)
    appendFileSync(CAPTURE_TO, `${JSON.stringify({ id, samples })}\n`, 'utf8')

  return distribution
}

/**
 * Whether a **runtime** threshold is allowed to fail the build.
 *
 * Off by default, and that is a measurement rather than a preference.
 * `runtime:DzTable:mount-1000` was captured twice on this machine within
 * minutes — 1,344 ms once and 2,392 ms the other time, with per-capture `cv`
 * of 0.17 both times. Each capture is internally consistent and they disagree
 * by 78%, because the second shared the machine with a Storybook build. A 3σ
 * threshold derived from the quiet capture fails on the busy one while the
 * component is byte-for-byte identical.
 *
 * That is not a threshold problem to be tuned away: a wall-clock benchmark on a
 * shared developer machine measures the machine. The reassessment asks for
 * measurements "on declared hardware/browser profiles", and this flag is that
 * declaration — set it on a dedicated perf job, where the number means
 * something, and leave it off everywhere else.
 *
 * `size` baselines are unaffected. A gzipped byte count is deterministic, and
 * it gates always.
 */
const RUNTIME_GATE = process.env.DZUP_PERF_GATE === '1'

/**
 * Assert a distribution against its recorded baseline.
 *
 * Outcomes, and which of them can fail:
 *
 *  - **no baseline** — reported. The metric is new, or `perf:capture` has never
 *    run on this machine. Failing here would make adding a benchmark a
 *    breaking change.
 *  - **not yet measurable** — reported. The recorded distribution's spread
 *    swamped its signal, so there is no threshold to be under. This is the
 *    stop condition TASK-OSS-P5-05 names, surfaced rather than papered over.
 *  - **this run is too noisy** — reported. The fresh distribution proves
 *    nothing either way.
 *  - **regression** — reported always, and **failed only under
 *    {@link RUNTIME_GATE}**, with the whole distribution in the message so the
 *    next reader can see whether it is noise.
 */
function expectWithinBaseline(id: string, fresh: Distribution): void {
  const baseline = BASELINES.get(id)

  if (baseline === undefined) {
    report(`${id}: no baseline — ${format(fresh)}`)
    return
  }

  if (baseline.threshold === null) {
    report(`${id}: not yet measurable (${baseline.unmeasurable}) — ${format(fresh)}`)
    return
  }

  if (fresh.cv > MEASURABLE_CV) {
    report(
      `${id}: this run's own variance exceeds its signal (cv ${fresh.cv.toFixed(2)}), `
      + `so it proves nothing either way — ${format(fresh)}`,
    )
    return
  }

  const verdict = isRegression(fresh, baseline.threshold)
  report(
    `${id}: ${verdict.regression ? 'REGRESSION' : 'ok'} — ${verdict.detail}`
    + `${verdict.regression && !RUNTIME_GATE ? ' [reported; set DZUP_PERF_GATE=1 to gate]' : ''}`,
  )

  if (!RUNTIME_GATE)
    return

  expect(
    verdict.regression,
    `${id} regressed against the baseline recorded at `
    + `${baseline.sourceCommit.slice(0, 8)} on ${baseline.host.platform}/${baseline.host.arch} `
    + `with ${baseline.host.cpus} CPUs: ${verdict.detail}. `
    + `Threshold was ${baseline.thresholdFormula}.`,
  ).toBe(false)
}

function format(d: Distribution): string {
  return `median=${d.median.toFixed(2)}ms p95=${d.p95.toFixed(2)}ms `
    + `cv=${d.cv.toFixed(2)} n=${d.runs}`
}

function report(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`  ${message}`)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('performance Benchmarks', { timeout: 120_000 }, () => {
  // The dataset ladder TASK-OSS-P5-05 asks for. 1 row is the fixed cost of the
  // component; 100 and 1,000 are where per-row cost shows up, and the ratio
  // between them says whether it is linear.
  describe.each([1, 100, 1_000])('dzDataGrid with %i rows', (rows) => {
    it('mounts within its baseline', async () => {
      const { default: DzDataGrid } = await import(
        '@dzup-ui/core/components/data/DzDataGrid.vue'
      )
      const data = generateGridRows(rows)
      const columns = generateGridColumns()

      const distribution = await measure(`runtime:DzDataGrid:mount-${rows}`, () => {
        const wrapper = mount(DzDataGrid, {
          props: { data, columns, sortable: true, size: 'md' },
          global: { stubs: { teleport: true } },
        })
        wrapper.unmount()
      })

      expectWithinBaseline(`runtime:DzDataGrid:mount-${rows}`, distribution)
    })
  })

  describe.each([1, 100, 1_000])('dzTable with %i rows', (rows) => {
    it('mounts within its baseline', async () => {
      const { default: DzTable } = await import(
        '@dzup-ui/core/components/data/DzTable.vue'
      )
      const { default: DzTableBody } = await import(
        '@dzup-ui/core/components/data/DzTableBody.vue'
      )
      const { default: DzTableRow } = await import(
        '@dzup-ui/core/components/data/DzTableRow.vue'
      )
      const { default: DzTableCell } = await import(
        '@dzup-ui/core/components/data/DzTableCell.vue'
      )

      const data = generateGridRows(rows)
      const Host = defineComponent({
        setup() {
          return () =>
            h(DzTable, null, {
              default: () =>
                h(DzTableBody, null, {
                  default: () =>
                    data.map(row =>
                      h(DzTableRow, { key: row.id }, {
                        default: () => [
                          h(DzTableCell, null, { default: () => row.name }),
                          h(DzTableCell, null, { default: () => row.email }),
                          h(DzTableCell, null, { default: () => row.role }),
                        ],
                      }),
                    ),
                }),
            })
        },
      })

      const distribution = await measure(`runtime:DzTable:mount-${rows}`, () => {
        const wrapper = mount(Host, { global: { stubs: { teleport: true } } })
        wrapper.unmount()
      })

      expectWithinBaseline(`runtime:DzTable:mount-${rows}`, distribution)
    })
  })

  it('dzDialog opens and closes within its baseline', async () => {
    const { default: DzDialog } = await import(
      '@dzup-ui/core/components/overlays/DzDialog.vue'
    )
    const { default: DzDialogContent } = await import(
      '@dzup-ui/core/components/overlays/DzDialogContent.vue'
    )
    const { default: DzDialogTitle } = await import(
      '@dzup-ui/core/components/overlays/DzDialogTitle.vue'
    )

    const Host = defineComponent({
      props: { open: { type: Boolean, default: false } },
      setup(props) {
        return () =>
          h(DzDialog, { open: props.open, modal: true }, {
            default: () =>
              h(DzDialogContent, null, {
                default: () => h(DzDialogTitle, null, { default: () => 'Benchmark' }),
              }),
          })
      },
    })

    // The measured unit is one full open/close cycle, not a mount: a dialog's
    // cost is the focus trap and the scroll lock engaging and releasing, and a
    // mount with `open: false` never pays either.
    const distribution = await measure('runtime:DzDialog:open-close', async () => {
      const wrapper = mount(Host, {
        props: { open: false },
        global: { stubs: { teleport: true } },
      })
      await wrapper.setProps({ open: true })
      await nextTick()
      await wrapper.setProps({ open: false })
      await nextTick()
      wrapper.unmount()
    })

    expectWithinBaseline('runtime:DzDialog:open-close', distribution)
  })

  it('dzListbox keyboard navigation stays within its baseline', async () => {
    const { default: DzListbox } = await import(
      '@dzup-ui/core/components/forms/DzListbox.vue'
    )

    const options = Array.from({ length: 200 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
    }))

    // Ten ArrowDown presses over 200 options: the cost that shows up as a
    // sluggish list is per-keystroke, and a mount measurement never sees it.
    const distribution = await measure('runtime:DzListbox:arrow-down-10', async () => {
      const wrapper = mount(DzListbox, {
        props: { options },
        attachTo: document.body,
        global: { stubs: { teleport: true } },
      })
      const root = wrapper.element as HTMLElement
      for (let i = 0; i < 10; i++) {
        root.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        )
        await nextTick()
      }
      wrapper.unmount()
    })

    expectWithinBaseline('runtime:DzListbox:arrow-down-10', distribution)
  })

  it('dzAccordion with 20 items mounts within its baseline', async () => {
    const { default: DzAccordion } = await import(
      '@dzup-ui/core/components/data/DzAccordion.vue'
    )
    const { default: DzAccordionItem } = await import(
      '@dzup-ui/core/components/data/DzAccordionItem.vue'
    )
    const { default: DzAccordionTrigger } = await import(
      '@dzup-ui/core/components/data/DzAccordionTrigger.vue'
    )
    const { default: DzAccordionContent } = await import(
      '@dzup-ui/core/components/data/DzAccordionContent.vue'
    )

    const items = Array.from({ length: 20 }, (_, i) => ({
      value: `item-${i}`,
      label: `Accordion Item ${i + 1}`,
      content: `Content for item ${i + 1}. `.repeat(5),
    }))

    const Host = defineComponent({
      setup() {
        return () =>
          h(
            DzAccordion,
            { type: 'single' as const, collapsible: true },
            {
              default: () =>
                items.map(item =>
                  h(DzAccordionItem, { value: item.value, key: item.value }, {
                    default: () => [
                      h(DzAccordionTrigger, null, { default: () => item.label }),
                      h(DzAccordionContent, null, { default: () => item.content }),
                    ],
                  }),
                ),
            },
          )
      },
    })

    const distribution = await measure('runtime:DzAccordion:mount-20', () => {
      const wrapper = mount(Host, { global: { stubs: { teleport: true } } })
      wrapper.unmount()
    })

    expectWithinBaseline('runtime:DzAccordion:mount-20', distribution)
  })

  it('dzFileUpload with 50 selected files renders within its baseline', async () => {
    // The catalog's only Tier D component, so the capability-matrix gate wants
    // a baseline for it. The scenario is the file *list*, not the empty drop
    // zone: an empty control is three elements and measures nothing, and the
    // list is the part that grows with what a person selected.
    const { default: DzFileUpload } = await import(
      '@dzup-ui/core/components/forms/DzFileUpload.vue'
    )

    const files = Array.from(
      { length: 50 },
      (_, i) => new File([new Uint8Array(16)], `document-${i}.pdf`, { type: 'application/pdf' }),
    )

    const distribution = await measure('runtime:DzFileUpload:list-50', () => {
      const wrapper = mount(DzFileUpload, {
        props: { modelValue: files, multiple: true, accept: '.pdf' },
        global: { stubs: { teleport: true } },
      })
      wrapper.unmount()
    })

    expectWithinBaseline('runtime:DzFileUpload:list-50', distribution)
  })

  it('dzTabs with 10 tabs mounts within its baseline', async () => {
    const { default: DzTabs } = await import(
      '@dzup-ui/core/components/navigation/DzTabs.vue'
    )
    const { default: DzTabList } = await import(
      '@dzup-ui/core/components/navigation/DzTabList.vue'
    )
    const { default: DzTabTrigger } = await import(
      '@dzup-ui/core/components/navigation/DzTabTrigger.vue'
    )
    const { default: DzTabContent } = await import(
      '@dzup-ui/core/components/navigation/DzTabContent.vue'
    )

    const tabs = Array.from({ length: 10 }, (_, i) => ({
      value: `tab-${i}`,
      label: `Tab ${i + 1}`,
      content: `Panel content for tab ${i + 1}`,
    }))

    const Host = defineComponent({
      setup() {
        return () =>
          h(
            DzTabs,
            { modelValue: 'tab-0' },
            {
              default: () => [
                h(DzTabList, null, {
                  default: () =>
                    tabs.map(tab =>
                      h(DzTabTrigger, { value: tab.value, key: tab.value }, {
                        default: () => tab.label,
                      }),
                    ),
                }),
                ...tabs.map(tab =>
                  h(DzTabContent, { value: tab.value, key: tab.value }, {
                    default: () => tab.content,
                  }),
                ),
              ],
            },
          )
      },
    })

    const distribution = await measure('runtime:DzTabs:mount-10', () => {
      const wrapper = mount(Host, { global: { stubs: { teleport: true } } })
      wrapper.unmount()
    })

    expectWithinBaseline('runtime:DzTabs:mount-10', distribution)
  })
})
