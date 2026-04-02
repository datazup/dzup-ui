import type { Meta, StoryObj } from '@storybook/vue3'
import { DzResult } from '../../src/components/feedback'

/**
 * DzResult displays the outcome of an operation with a status icon,
 * title, description, and optional action buttons.
 *
 * It supports four statuses: `success`, `error`, `warning`, and `info`,
 * each rendering a distinct icon and color scheme.
 */
const meta = {
  title: 'Core/Feedback/DzResult',
  component: DzResult,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Status determines the icon and color',
      table: { category: 'Appearance' },
    },
    // Behavior
    title: {
      control: 'text',
      description: 'Title text',
      table: { category: 'Behavior' },
    },
    description: {
      control: 'text',
      description: 'Description text',
      table: { category: 'Behavior' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    status: 'success',
    title: 'Operation Successful',
    description: 'Your request has been processed.',
  },
} satisfies Meta<typeof DzResult>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzResult },
    setup() {
      return { args }
    },
    template: '<DzResult v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// All Statuses
// ---------------------------------------------------------------------------

export const AllStatuses: Story = {
  name: 'Status Gallery',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="grid grid-cols-2 gap-6 max-w-2xl">
        <DzResult status="success" title="Success" description="Payment processed successfully." />
        <DzResult status="error" title="Error" description="Failed to submit the form." />
        <DzResult status="warning" title="Warning" description="Your session is about to expire." />
        <DzResult status="info" title="Info" description="Your account has been updated." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Action Buttons
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: 'With Action Buttons',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="max-w-md">
        <DzResult status="success" title="Payment Successful" description="Your order #12345 has been placed.">
          <template #actions>
            <button class="px-4 py-2 text-sm font-medium border rounded">View Order</button>
            <button class="px-4 py-2 text-sm font-medium border rounded">Go Home</button>
          </template>
        </DzResult>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="max-w-md">
        <DzResult status="error" title="Submission Failed" description="We could not process your request.">
          <template #icon>
            <div class="text-6xl">&#10060;</div>
          </template>
          <div class="text-sm text-gray-500 mt-3 p-3 bg-gray-50 rounded">
            <p class="font-medium">Error details:</p>
            <code class="text-xs">ERR_NETWORK_TIMEOUT: Connection timed out after 30s</code>
          </div>
          <template #actions>
            <button class="px-4 py-2 text-sm font-medium border rounded">Retry</button>
            <button class="px-4 py-2 text-sm font-medium border rounded">Contact Support</button>
          </template>
        </DzResult>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzResult },
    data() {
      return { status: 'success' as 'success' | 'error' | 'warning' | 'info' }
    },
    template: `
      <div class="space-y-6">
        <div class="flex gap-3">
          <button v-for="s in ['success', 'error', 'warning', 'info']" :key="s"
            class="px-3 py-1.5 text-sm border rounded capitalize"
            :class="{ 'font-bold': status === s }"
            @click="status = s">
            {{ s }}
          </button>
        </div>
        <DzResult :status="status" :title="status + ' result'" description="Click buttons above to change status." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role="status"',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzResult uses role="status" and data-state for the current status.
          Screen readers announce the result when it appears dynamically.
        </p>
        <DzResult status="success" title="Verified" description="Your identity has been confirmed." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzResult },
    template: `
      <div class="grid grid-cols-2 gap-6 max-w-2xl">
        <DzResult status="success" title="Success" description="Operation completed." />
        <DzResult status="error" title="Error" description="Something went wrong." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Payment Confirmation
// ---------------------------------------------------------------------------

export const RealWorldPaymentConfirmation: Story = {
  name: 'Real World: Payment Confirmation',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="max-w-md border rounded-lg p-6">
        <DzResult
          status="success"
          title="Payment Received"
          description="Thank you! Your payment of $49.99 has been processed. A confirmation email will be sent shortly."
        >
          <template #actions>
            <button class="px-4 py-2 text-sm font-medium border rounded">Download Receipt</button>
            <button class="px-4 py-2 text-sm font-medium border rounded">Return to Dashboard</button>
          </template>
        </DzResult>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: 404 Not Found
// ---------------------------------------------------------------------------

export const RealWorldNotFound: Story = {
  name: 'Real World: 404 Not Found',
  render: () => ({
    components: { DzResult },
    template: `
      <div class="max-w-md">
        <DzResult
          status="warning"
          title="Page Not Found"
          description="The page you are looking for might have been removed or is temporarily unavailable."
        >
          <template #actions>
            <button class="px-4 py-2 text-sm font-medium border rounded">Go Home</button>
            <button class="px-4 py-2 text-sm font-medium border rounded">Contact Support</button>
          </template>
        </DzResult>
      </div>
    `,
  }),
}
