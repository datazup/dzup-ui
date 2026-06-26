import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { defineComponent, h, ref } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzAlert, DzAsyncBoundary, DzResult, DzSkeleton, DzSpinner } from '../../src/components/feedback'
import { darkModeDecorator } from '../_shared'

/**
 * DzAsyncBoundary wraps `<Suspense>` to coordinate the **pending → resolved →
 * error** lifecycle of an async child (a component with an `async setup()`).
 *
 * - While the child's promise is pending, the `#loading` slot renders (defaults
 *   to `DzSpinner`).
 * - On resolve, the `#default` slot renders.
 * - On rejection (or a thrown render error), the `#error` slot renders with
 *   `{ error, reset }`.
 *
 * An optional `timeout` prop emits a `timeout` event if the pending state lasts
 * too long. `reset()` is also exposed via a template ref.
 */

/** Resolves after `delay` ms, then renders its content. */
function makeAsyncChild(delay: number, label: string) {
  return defineComponent({
    name: 'AsyncChild',
    async setup() {
      await new Promise(resolve => setTimeout(resolve, delay))
      return () => h('div', { class: 'rounded-md border border-[var(--dz-border)] p-4 text-sm' }, label)
    },
  })
}

/** Rejects after `delay` ms to exercise the error slot. */
function makeAsyncError(delay: number, message: string) {
  return defineComponent({
    name: 'AsyncError',
    async setup() {
      await new Promise((_resolve, reject) => setTimeout(() => reject(new Error(message)), delay))
      return () => h('div')
    },
  })
}

const meta = {
  title: 'Core/Feedback/DzAsyncBoundary',
  component: DzAsyncBoundary,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Behavior
    timeout: {
      control: 'number',
      description: 'Emit `timeout` if the pending state lasts longer than this (ms)',
      table: { category: 'Behavior' },
    },
    delay: {
      control: 'number',
      description: 'Delay before showing the loading fallback (ms, passed to Suspense)',
      table: { category: 'Behavior' },
    },
    onError: {
      control: false,
      description: 'Callback invoked when an error is captured: (err, instance, info) => void',
      table: { category: 'Behavior' },
    },
    // Slots
    default: {
      control: false,
      description: 'The async content (a component with `async setup()`).',
      table: { category: 'Slots' },
    },
    loading: {
      control: false,
      description: 'Pending fallback. Defaults to `DzSpinner`.',
      table: { category: 'Slots' },
    },
    error: {
      control: false,
      description: 'Error fallback. Receives `{ error, reset }`.',
      table: { category: 'Slots' },
    },
  },
} satisfies Meta<typeof DzAsyncBoundary>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — spinner fallback → resolved
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Pending → Resolved',
  render: () => ({
    components: { DzAsyncBoundary, AsyncChild: makeAsyncChild(1500, 'Data loaded successfully.') },
    template: `
      <div class="max-w-md min-h-[80px] flex items-center">
        <DzAsyncBoundary>
          <AsyncChild />
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Skeleton loading fallback
// ---------------------------------------------------------------------------

export const SkeletonFallback: Story = {
  name: 'Skeleton Loading Fallback',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzSkeleton,
      AsyncChild: makeAsyncChild(2000, 'Profile loaded.'),
    },
    template: `
      <div class="max-w-md">
        <DzAsyncBoundary>
          <AsyncChild />
          <template #loading>
            <div class="flex items-center gap-3">
              <DzSkeleton style="width: 48px; height: 48px; border-radius: 50%" />
              <div class="space-y-2 flex-1">
                <DzSkeleton style="width: 60%; height: 14px" />
                <DzSkeleton style="width: 40%; height: 12px" />
              </div>
            </div>
          </template>
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

export const ErrorState: Story = {
  name: 'Error State',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzAlert,
      AsyncError: makeAsyncError(1000, 'Failed to fetch resource (500).'),
    },
    template: `
      <div class="max-w-md min-h-[80px] flex items-center">
        <DzAsyncBoundary>
          <AsyncError />
          <template #error="{ error }">
            <DzAlert tone="danger" variant="subtle" title="Request failed" class="w-full">
              {{ error.message }}
            </DzAlert>
          </template>
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom spinner fallback (sizes)
// ---------------------------------------------------------------------------

export const CustomSpinner: Story = {
  name: 'Custom Spinner Fallback',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzSpinner,
      AsyncChild: makeAsyncChild(2000, 'Ready.'),
    },
    template: `
      <div class="max-w-md min-h-[80px] flex items-center">
        <DzAsyncBoundary>
          <AsyncChild />
          <template #loading>
            <div class="flex items-center gap-2 text-sm text-[var(--dz-muted-foreground)]">
              <DzSpinner size="sm" />
              <span>Loading data…</span>
            </div>
          </template>
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Busy State',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzSpinner,
      AsyncChild: makeAsyncChild(2000, 'Content available.'),
    },
    template: `
      <div class="space-y-4 max-w-md">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Wrap the boundary in a container with <code>aria-busy</code> bound to the
          pending state, and give the loading region an accessible label so screen
          readers announce that content is loading.
        </p>
        <div aria-busy="true" aria-live="polite">
          <DzAsyncBoundary>
            <AsyncChild />
            <template #loading>
              <div class="flex items-center gap-2 text-sm" role="status" aria-label="Loading content">
                <DzSpinner size="sm" />
                <span>Loading…</span>
              </div>
            </template>
          </DzAsyncBoundary>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzResult,
      AsyncError: makeAsyncError(800, 'Connection lost.'),
    },
    template: `
      <div class="max-w-md min-h-[120px] flex items-center">
        <DzAsyncBoundary>
          <AsyncError />
          <template #error="{ error }">
            <DzResult status="error" title="Load failed" :description="error.message" class="w-full" />
          </template>
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: lazy panel
// ---------------------------------------------------------------------------

export const RealWorldLazyPanel: Story = {
  name: 'Real World: Lazy Panel',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzSkeleton,
      LazyPanel: makeAsyncChild(1800, 'Dashboard widgets loaded from the API.'),
    },
    template: `
      <div class="max-w-lg rounded-lg border border-[var(--dz-border)] p-4">
        <p class="mb-3 text-sm font-medium">Analytics</p>
        <DzAsyncBoundary>
          <LazyPanel />
          <template #loading>
            <div class="space-y-2">
              <DzSkeleton style="width: 100%; height: 16px" />
              <DzSkeleton style="width: 80%; height: 16px" />
              <DzSkeleton style="width: 90%; height: 16px" />
            </div>
          </template>
        </DzAsyncBoundary>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — observe pending then resolved
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Load Flow',
  render: () => ({
    components: {
      DzAsyncBoundary,
      DzButton,
      DzSpinner,
    },
    setup() {
      // `mounted` keys the boundary so "Reload" re-runs the async child.
      const key = ref(0)
      const AsyncChild = makeAsyncChild(800, 'Loaded!')
      return { key, AsyncChild, reload: () => (key.value += 1) }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <div class="min-h-[60px] flex items-center">
          <DzAsyncBoundary :key="key">
            <component :is="AsyncChild" />
            <template #loading>
              <div class="flex items-center gap-2 text-sm" role="status" aria-label="Loading">
                <DzSpinner size="sm" /><span>Loading…</span>
              </div>
            </template>
          </DzAsyncBoundary>
        </div>
        <DzButton size="sm" variant="outline" @click="reload">Reload</DzButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The async child resolves after ~800ms; findByText retries until it appears.
    await expect(await canvas.findByText(/loaded!/i)).toBeInTheDocument()

    // Reload re-mounts the boundary; the resolved content returns afterwards.
    await userEvent.click(canvas.getByRole('button', { name: /reload/i }))
    await expect(await canvas.findByText(/loaded!/i)).toBeInTheDocument()
  },
}
