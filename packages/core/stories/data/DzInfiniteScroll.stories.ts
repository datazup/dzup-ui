import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzInfiniteScroll } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const items = canvas.getAllByRole('listitem')
    await expect(items.length).toBe(4)
    await expect(items[0]).toHaveTextContent('Item #1')
    await expect(items[3]).toHaveTextContent('Item #4')
    await expect(canvas.getByText('You\'ve reached the end.')).toBeInTheDocument()
  },
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

// ---------------------------------------------------------------------------
// States — idle / loading / error / end / disabled (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * Every lifecycle state DzInfiniteScroll declares, side by side, because the
 * component's whole value is in the edge cases rather than the happy path: the
 * three declared state props (`loading`, `error`, `disabled`) plus the
 * `hasMore: false` end state each render a different status row, announce a
 * different string through the polite live region, and — the part a screenshot
 * cannot show — decide whether the IntersectionObserver sentinel is mounted at
 * all.
 *
 * The play function asserts the sentinel, since "does not ask for another page
 * while one is in flight / after a failure / when disabled" is the contract.
 */
export const States: Story = {
  render: () => ({
    components: { DzInfiniteScroll },
    setup() {
      const retries = ref(0)
      return { rows: makePage(0, 2), rowClass, retries }
    },
    template: `
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="space-y-2">
          <p class="text-sm font-medium">Idle — more available</p>
          <DzInfiniteScroll has-more aria-label="Idle feed" data-testid="is-idle">
            <ul class="flex flex-col gap-2">
              <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
            </ul>
          </DzInfiniteScroll>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Loading</p>
          <DzInfiniteScroll loading has-more aria-label="Loading feed" data-testid="is-loading">
            <ul class="flex flex-col gap-2">
              <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
            </ul>
          </DzInfiniteScroll>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Error — retry offered</p>
          <DzInfiniteScroll
            error
            has-more
            aria-label="Failed feed"
            data-testid="is-error"
            @retry="retries++"
          >
            <ul class="flex flex-col gap-2">
              <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
            </ul>
          </DzInfiniteScroll>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            retry events: <strong data-testid="retry-count">{{ retries }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">End of results</p>
          <DzInfiniteScroll :has-more="false" aria-label="Exhausted feed" data-testid="is-end">
            <ul class="flex flex-col gap-2">
              <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
            </ul>
          </DzInfiniteScroll>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Disabled — paging switched off</p>
          <DzInfiniteScroll disabled has-more aria-label="Disabled feed" data-testid="is-disabled">
            <ul class="flex flex-col gap-2">
              <li v-for="row in rows" :key="row.id" :class="rowClass">{{ row.title }}</li>
            </ul>
          </DzInfiniteScroll>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sentinelOf = (el: HTMLElement) => el.querySelector('.dz-infinite-scroll-sentinel')
    const liveOf = (el: HTMLElement) => el.querySelector('[aria-live="polite"]')

    const idle = canvas.getByTestId('is-idle')
    const loading = canvas.getByTestId('is-loading')
    const errored = canvas.getByTestId('is-error')
    const end = canvas.getByTestId('is-end')
    const disabled = canvas.getByTestId('is-disabled')

    // Idle: not busy, silent live region, and the sentinel is armed.
    await expect(idle).not.toHaveAttribute('aria-busy')
    await expect(liveOf(idle)?.textContent).toBe('')
    await expect(sentinelOf(idle)).not.toBeNull()

    // Loading: busy and announced. The sentinel stays mounted — the guard that
    // stops a second request is `loading`, not unmounting the observer.
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(liveOf(loading)).toHaveTextContent('Loading more items')
    await expect(within(loading).getByText('Loading more…')).toBeVisible()
    await expect(sentinelOf(loading)).not.toBeNull()

    // Error: an assertive `role="alert"` row, a working Retry, and the sentinel
    // removed so scrolling cannot re-trigger the failing request.
    await expect(liveOf(errored)).toHaveTextContent('Failed to load more items')
    await expect(within(errored).getByRole('alert')).toBeVisible()
    await expect(sentinelOf(errored)).toBeNull()
    await userEvent.click(within(errored).getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(canvas.getByTestId('retry-count')).toHaveTextContent('1'))

    // End: announced, and the sentinel is gone so no further page is requested.
    await expect(liveOf(end)).toHaveTextContent('End of results')
    await expect(within(end).getByText(/reached the end/i)).toBeVisible()
    await expect(sentinelOf(end)).toBeNull()

    // Disabled: items still render, but paging is switched off entirely —
    // no status row, no announcement, no sentinel.
    await expect(disabled).toHaveAttribute('data-disabled')
    await expect(within(disabled).getAllByRole('listitem')).toHaveLength(2)
    await expect(liveOf(disabled)?.textContent).toBe('')
    await expect(sentinelOf(disabled)).toBeNull()
  },
}
