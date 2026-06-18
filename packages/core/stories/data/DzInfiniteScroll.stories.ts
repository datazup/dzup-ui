import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { darkModeDecorator } from '../_shared'
import { DzInfiniteScroll } from '../../src/components/data'

/**
 * DzInfiniteScroll is an IntersectionObserver-based "load more" wrapper. The
 * default slot holds the already-rendered items; a sentinel is rendered beside
 * them and emits `load-more` as it scrolls into view, guarded so it fires once
 * per intersection until the parent flips `loading` back off.
 *
 * It standardises the scroll-driven paging pattern — getting the edge cases
 * right (no firing during load, an explicit end state, error retry) — and pairs
 * with DzList, DzDataView, and DzTable. Use `direction="up"` for reverse/chat
 * lists that page towards the top.
 */
const meta = {
  title: 'Core/Data/DzInfiniteScroll',
  component: DzInfiniteScroll,
  tags: ['autodocs', 'status:experimental'],
  decorators: [darkModeDecorator],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'A page load is in flight — suppresses further triggers',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    hasMore: {
      control: 'boolean',
      description: 'More items remain to be loaded',
      table: { category: 'State', defaultValue: { summary: 'true' } },
    },
    error: {
      control: 'boolean',
      description: 'The last load failed — renders the error slot with retry',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the loader entirely',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    distance: {
      control: { type: 'number', min: 0 },
      description: 'Distance (px) ahead of the sentinel at which loading begins',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    direction: {
      control: 'inline-radio',
      options: ['down', 'up'],
      description: 'Paging direction — "down" for feeds, "up" for chat lists',
      table: { category: 'Behavior', defaultValue: { summary: 'down' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size — scales the status-row spacing',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
  args: {
    hasMore: true,
    direction: 'down',
    distance: 0,
    size: 'md',
  },
} satisfies Meta<typeof DzInfiniteScroll>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Sample feed helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE = 8
const TOTAL = 32

function makePage(start: number, count: number): Array<{ id: number, title: string }> {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: `Item #${start + i + 1}`,
  }))
}

const rowClass
  = 'flex items-center gap-3 rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] '
    + 'bg-[var(--dz-surface)] px-4 py-3 text-[var(--dz-foreground)]'

// ---------------------------------------------------------------------------
// Basic feed — loads the next page on scroll until exhausted
// ---------------------------------------------------------------------------

export const BasicFeed: Story = {
  render: () => ({
    components: { DzInfiniteScroll },
    setup() {
      const rows = ref(makePage(0, PAGE_SIZE))
      const loading = ref(false)
      const hasMore = ref(true)

      function fetchNext() {
        loading.value = true
        // Simulate a network round-trip.
        setTimeout(() => {
          const next = makePage(rows.value.length, PAGE_SIZE)
          rows.value = [...rows.value, ...next]
          hasMore.value = rows.value.length < TOTAL
          loading.value = false
        }, 600)
      }

      return { rows, loading, hasMore, fetchNext, rowClass }
    },
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <DzInfiniteScroll
          :loading="loading"
          :has-more="hasMore"
          :distance="120"
          aria-label="Activity feed"
          @load-more="fetchNext"
        >
          <ul class="flex flex-col gap-2">
            <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
          </ul>
        </DzInfiniteScroll>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// End state — a short, fully-loaded list shows the "end of results" message
// ---------------------------------------------------------------------------

export const EndState: Story = {
  args: { hasMore: false },
  render: args => ({
    components: { DzInfiniteScroll },
    setup: () => ({ args, rows: makePage(0, 4), rowClass }),
    template: `
      <div class="p-4">
        <DzInfiniteScroll v-bind="args" aria-label="Completed feed">
          <ul class="flex flex-col gap-2">
            <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
          </ul>
        </DzInfiniteScroll>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Error + retry — a failed load surfaces a retry control
// ---------------------------------------------------------------------------

export const ErrorRetry: Story = {
  render: () => ({
    components: { DzInfiniteScroll },
    setup() {
      const rows = ref(makePage(0, PAGE_SIZE))
      const loading = ref(false)
      const hasMore = ref(true)
      const error = ref(false)
      // Fail the first attempt, succeed on retry.
      let shouldFail = true

      function fetchNext() {
        loading.value = true
        error.value = false
        setTimeout(() => {
          loading.value = false
          if (shouldFail) {
            shouldFail = false
            error.value = true
            return
          }
          rows.value = [...rows.value, ...makePage(rows.value.length, PAGE_SIZE)]
          hasMore.value = rows.value.length < TOTAL
        }, 500)
      }

      return { rows, loading, hasMore, error, fetchNext, rowClass }
    },
    template: `
      <div class="h-[420px] overflow-auto p-4">
        <DzInfiniteScroll
          :loading="loading"
          :has-more="hasMore"
          :error="error"
          :distance="120"
          aria-label="Feed with retry"
          @load-more="fetchNext"
          @retry="fetchNext"
        >
          <ul class="flex flex-col gap-2">
            <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
          </ul>
        </DzInfiniteScroll>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Reverse / chat — pages towards the top with direction="up"
// ---------------------------------------------------------------------------

export const ReverseChat: Story = {
  name: 'Reverse Chat',
  render: () => ({
    components: { DzInfiniteScroll },
    setup() {
      const rows = ref(makePage(0, PAGE_SIZE).reverse())
      const loading = ref(false)
      const hasMore = ref(true)

      function fetchOlder() {
        loading.value = true
        setTimeout(() => {
          const older = makePage(rows.value.length, PAGE_SIZE).reverse()
          rows.value = [...older, ...rows.value]
          hasMore.value = rows.value.length < TOTAL
          loading.value = false
        }, 600)
      }

      return { rows, loading, hasMore, fetchOlder, rowClass }
    },
    template: `
      <div class="flex h-[420px] flex-col-reverse overflow-auto p-4">
        <DzInfiniteScroll
          :loading="loading"
          :has-more="hasMore"
          :distance="120"
          direction="up"
          aria-label="Chat history"
          @load-more="fetchOlder"
        >
          <ul class="flex flex-col gap-2">
            <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
          </ul>
        </DzInfiniteScroll>
      </div>
    `,
  }),
}
