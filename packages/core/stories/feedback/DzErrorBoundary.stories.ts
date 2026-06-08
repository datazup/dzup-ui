import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { expect, userEvent, within } from 'storybook/test'
import { defineComponent, h, ref } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzAlert, DzErrorBoundary, DzResult } from '../../src/components/feedback'

/**
 * DzErrorBoundary catches render and lifecycle errors thrown by its descendants
 * (via Vue's `onErrorCaptured`) and renders a `#fallback` slot instead of letting
 * the error crash the whole app.
 *
 * The fallback slot receives `{ error, reset }` — call `reset()` to clear the
 * captured error and re-render the default slot. The component also exposes
 * `reset()` via a template ref, and accepts an `onError` callback for logging.
 *
 * > Note: an error boundary only catches errors thrown **below** it in the tree.
 * > If the failing child still throws after `reset()`, fix the underlying state
 * > first (the stories below toggle the failure off before resetting).
 */

/**
 * A child that throws during render when `explode` is true. Used to demonstrate
 * the boundary catching a synchronous render error.
 */
const Bomb = defineComponent({
  name: 'Bomb',
  props: { explode: { type: Boolean, default: false } },
  setup(props) {
    return () => {
      if (props.explode)
        throw new Error('Bomb exploded: failed to render child component.')
      return h('div', { class: 'rounded-md border border-[var(--dz-border)] p-4 text-sm' }, 'Child rendered successfully — no error.')
    }
  },
})

const meta = {
  title: 'Core/Feedback/DzErrorBoundary',
  component: DzErrorBoundary,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Behavior
    onError: {
      control: false,
      description: 'Callback invoked when an error is captured: (err, instance, info) => void',
      table: { category: 'Behavior' },
    },
    // Accessibility (documented; the fallback content owns the live region)
    default: {
      control: false,
      description: 'The protected content. Errors thrown here are caught.',
      table: { category: 'Slots' },
    },
    fallback: {
      control: false,
      description: 'Rendered on error. Receives `{ error, reset }`.',
      table: { category: 'Slots' },
    },
  },
} satisfies Meta<typeof DzErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default — caught-error fallback
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Caught Error Fallback',
  render: () => ({
    components: { DzErrorBoundary, DzAlert, DzButton, Bomb },
    setup() {
      const explode = ref(false)
      return { explode }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzErrorBoundary>
          <Bomb :explode="explode" />
          <template #fallback="{ error }">
            <DzAlert tone="danger" variant="subtle" title="Something went wrong">
              {{ error.message }}
            </DzAlert>
          </template>
        </DzErrorBoundary>
        <DzButton tone="danger" variant="outline" size="sm" @click="explode = true">
          Trigger error
        </DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Retry action
// ---------------------------------------------------------------------------

export const WithRetry: Story = {
  name: 'Retry Action',
  render: () => ({
    components: { DzErrorBoundary, DzResult, DzButton, Bomb },
    setup() {
      const explode = ref(false)
      return { explode }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzErrorBoundary>
          <Bomb :explode="explode" />
          <template #fallback="{ error, reset }">
            <DzResult status="error" title="Render failed" :description="error.message">
              <template #actions>
                <DzButton tone="primary" size="sm" @click="explode = false; reset()">
                  Retry
                </DzButton>
              </template>
            </DzResult>
          </template>
        </DzErrorBoundary>
        <DzButton tone="danger" variant="outline" size="sm" @click="explode = true">
          Trigger error
        </DzButton>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom fallback slot
// ---------------------------------------------------------------------------

export const CustomFallback: Story = {
  name: 'Custom Fallback Slot',
  render: () => ({
    components: { DzErrorBoundary, DzButton, Bomb },
    setup() {
      const explode = ref(true)
      return { explode }
    },
    template: `
      <DzErrorBoundary class="block max-w-md">
        <Bomb :explode="explode" />
        <template #fallback="{ error, reset }">
          <div
            role="alert"
            class="flex items-start gap-3 rounded-lg border border-[var(--dz-danger)] bg-[var(--dz-danger-subtle,var(--dz-muted))] p-4"
          >
            <span class="text-xl" aria-hidden="true">&#128165;</span>
            <div class="space-y-2 text-sm">
              <p class="font-medium text-[var(--dz-danger)]">Custom fallback UI</p>
              <p class="text-[var(--dz-muted-foreground)]">{{ error.message }}</p>
              <DzButton size="xs" variant="outline" @click="explode = false; reset()">Dismiss</DzButton>
            </div>
          </div>
        </template>
      </DzErrorBoundary>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Nested boundaries — inner catches without taking down the outer
// ---------------------------------------------------------------------------

export const Nested: Story = {
  name: 'Nested Boundaries',
  render: () => ({
    components: { DzErrorBoundary, DzAlert, DzButton, Bomb },
    setup() {
      const explode = ref(false)
      return { explode }
    },
    template: `
      <DzErrorBoundary>
        <div class="space-y-4 max-w-lg">
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            The outer region stays alive; only the inner boundary swaps to its fallback.
          </p>
          <div class="rounded-md border border-[var(--dz-border)] p-4 space-y-3">
            <p class="text-sm font-medium">Outer region (always rendered)</p>
            <DzErrorBoundary>
              <Bomb :explode="explode" />
              <template #fallback="{ error }">
                <DzAlert tone="danger" variant="subtle" title="Inner widget failed">
                  {{ error.message }}
                </DzAlert>
              </template>
            </DzErrorBoundary>
          </div>
          <DzButton tone="danger" variant="outline" size="sm" @click="explode = true">
            Break inner widget
          </DzButton>
        </div>
        <template #fallback="{ error }">
          <DzAlert tone="danger" title="Outer boundary caught it">{{ error.message }}</DzAlert>
        </template>
      </DzErrorBoundary>
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
    components: { DzErrorBoundary, DzResult, DzButton, Bomb },
    setup() {
      const explode = ref(true)
      return { explode }
    },
    template: `
      <DzErrorBoundary class="block max-w-md">
        <Bomb :explode="explode" />
        <template #fallback="{ error, reset }">
          <DzResult status="error" title="Render failed" :description="error.message">
            <template #actions>
              <DzButton tone="primary" size="sm" @click="explode = false; reset()">Retry</DzButton>
            </template>
          </DzResult>
        </template>
      </DzErrorBoundary>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive play() — trigger → fallback → retry → recovered
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Catch & Recover',
  render: () => ({
    components: { DzErrorBoundary, DzAlert, DzButton, Bomb },
    setup() {
      const explode = ref(false)
      return { explode }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzErrorBoundary>
          <Bomb :explode="explode" />
          <template #fallback="{ error, reset }">
            <DzAlert tone="danger" variant="subtle" title="Something went wrong">
              {{ error.message }}
              <template #actions>
                <button class="text-sm font-medium underline" @click="explode = false; reset()">Retry</button>
              </template>
            </DzAlert>
          </template>
        </DzErrorBoundary>
        <button class="text-sm font-medium underline" @click="explode = true">Trigger error</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initially the child renders successfully.
    await expect(canvas.getByText(/child rendered successfully/i)).toBeInTheDocument()

    // Trigger the error → the boundary swaps to the fallback.
    await userEvent.click(canvas.getByRole('button', { name: /trigger error/i }))
    await expect(await canvas.findByText(/bomb exploded/i)).toBeInTheDocument()

    // Retry resets the failing state and the child renders again.
    await userEvent.click(canvas.getByRole('button', { name: /retry/i }))
    await expect(await canvas.findByText(/child rendered successfully/i)).toBeInTheDocument()
  },
}
