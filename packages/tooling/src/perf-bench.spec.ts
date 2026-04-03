import { mount } from '@vue/test-utils'
/**
 * Performance benchmarks for complex components.
 *
 * Measures mount time for data-heavy components to establish baselines.
 * Each benchmark runs 5 iterations and reports the average.
 *
 * Usage: npx vitest run packages/tooling/src/perf-bench.spec.ts
 *
 * @module @dzup-ui/tooling/perf-bench
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

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
// Benchmark helpers
// ---------------------------------------------------------------------------

const ITERATIONS = 5

/** Mount threshold in ms — simple components */
const SIMPLE_THRESHOLD_MS = 100

/** Mount threshold in ms — complex compound components */
const COMPLEX_THRESHOLD_MS = 500

interface BenchResult {
  times: number[]
  average: number
  min: number
  max: number
}

async function benchmark(
  mountFn: () => ReturnType<typeof mount>,
): Promise<BenchResult> {
  const times: number[] = []

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    const wrapper = mountFn()
    const elapsed = performance.now() - start
    times.push(elapsed)
    wrapper.unmount()
  }

  const average = times.reduce((a, b) => a + b, 0) / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)

  return { times, average, min, max }
}

function logResult(name: string, result: BenchResult): void {
  console.log(
    `  ${name}: avg=${result.average.toFixed(2)}ms `
    + `min=${result.min.toFixed(2)}ms max=${result.max.toFixed(2)}ms`,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('performance Benchmarks', { timeout: 30_000 }, () => {
  it('dzDataGrid with 100 rows x 5 columns mounts under threshold', async () => {
    const { default: DzDataGrid } = await import(
      '@dzup-ui/core/components/data/DzDataGrid.vue'
    )

    const rows = generateGridRows(100)
    const columns = generateGridColumns()

    const result = await benchmark(() =>
      mount(DzDataGrid, {
        props: {
          data: rows,
          columns,
          sortable: true,
          size: 'md',
        },
        global: { stubs: { teleport: true } },
      }),
    )

    logResult('DzDataGrid (100x5)', result)
    expect(result.average).toBeLessThan(COMPLEX_THRESHOLD_MS)
  })

  it('dzAccordion with 20 items mounts under threshold', async () => {
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

    // Wrap in a host component so we can render 20 items in slots
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

    const result = await benchmark(() =>
      mount(Host, { global: { stubs: { teleport: true } } }),
    )

    logResult('DzAccordion (20 items)', result)
    expect(result.average).toBeLessThan(SIMPLE_THRESHOLD_MS)
  })

  it('dzTabs with 10 tabs mounts under threshold', async () => {
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

    const result = await benchmark(() =>
      mount(Host, { global: { stubs: { teleport: true } } }),
    )

    logResult('DzTabs (10 tabs)', result)
    expect(result.average).toBeLessThan(COMPLEX_THRESHOLD_MS)
  })
})
