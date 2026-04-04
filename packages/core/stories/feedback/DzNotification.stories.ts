import type { Meta, StoryObj } from '@storybook/vue3'
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info } from 'lucide-vue-next'
import { DzNotification } from '../../src/components/feedback'

/**
 * DzNotification displays a persistent notification message.
 *
 * Unlike DzToast (ephemeral, provider-managed), DzNotification is a standalone
 * component that persists until explicitly dismissed. It supports six semantic
 * tones, optional icon, close button, auto-dismiss duration, and action slots.
 */
const meta = {
  title: 'Core/Feedback/DzNotification',
  component: DzNotification,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    // Behavior
    title: {
      control: 'text',
      description: 'Notification title',
      table: { category: 'Behavior' },
    },
    description: {
      control: 'text',
      description: 'Optional description text',
      table: { category: 'Behavior' },
    },
    closable: {
      control: 'boolean',
      description: 'Whether the notification can be dismissed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    duration: {
      control: 'number',
      description: 'Auto-dismiss duration in ms (0 = persistent)',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    icon: {
      control: false,
      description: 'Optional icon component',
      table: { category: 'Behavior' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
    ariaLabelledby: {
      control: 'text',
      description: 'ID of labelling element',
      table: { category: 'Accessibility' },
    },
    ariaDescribedby: {
      control: 'text',
      description: 'ID of describing element',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    title: 'Notification Title',
    description: 'This is a notification message.',
    tone: 'neutral',
    closable: false,
    duration: 0,
  },
} satisfies Meta<typeof DzNotification>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzNotification },
    setup() {
      return { args }
    },
    template: '<DzNotification v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzNotification },
    template: `
      <div class="space-y-4 max-w-md">
        <DzNotification tone="neutral" title="Neutral" description="A neutral notification." />
        <DzNotification tone="primary" title="Primary" description="A primary notification." />
        <DzNotification tone="success" title="Success" description="Operation completed successfully." />
        <DzNotification tone="warning" title="Warning" description="Proceed with caution." />
        <DzNotification tone="danger" title="Danger" description="Something went wrong." />
        <DzNotification tone="info" title="Info" description="Here is some useful information." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  name: 'With Icon',
  render: () => ({
    components: { DzNotification },
    setup() { return { CheckCircle, AlertTriangle, AlertCircle, Info } },
    template: `
      <div class="space-y-4 max-w-md">
        <DzNotification tone="success" title="Saved" description="Your changes have been saved." :icon="CheckCircle" closable />
        <DzNotification tone="warning" title="Low Storage" description="You have used 90% of your storage." :icon="AlertTriangle" closable />
        <DzNotification tone="danger" title="Connection Lost" description="Unable to reach the server." :icon="AlertCircle" closable />
        <DzNotification tone="info" title="Update Available" description="Version 2.0 is now available." :icon="Info" closable />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Closable
// ---------------------------------------------------------------------------

export const Closable: Story = {
  args: {
    closable: true,
    title: 'Dismissable Notification',
    description: 'Click the close button to dismiss.',
    tone: 'info',
  },
  render: args => ({
    components: { DzNotification },
    setup() {
      return { args }
    },
    template: '<div class="max-w-md"><DzNotification v-bind="args" /></div>',
  }),
}

// ---------------------------------------------------------------------------
// With Actions
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzNotification },
    setup() { return { Bell } },
    template: `
      <div class="max-w-md">
        <DzNotification tone="primary" title="New message" closable :icon="Bell">
          You have a new message from the support team regarding your recent ticket.
          <template #actions>
            <button class="px-3 py-1 text-sm font-medium border rounded">View</button>
            <button class="px-3 py-1 text-sm font-medium border rounded">Dismiss</button>
          </template>
        </DzNotification>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Auto-dismiss
// ---------------------------------------------------------------------------

export const AutoDismiss: Story = {
  name: 'Auto-dismiss (5s)',
  render: () => ({
    components: { DzNotification },
    setup() { return { CheckCircle } },
    data() {
      return { key: 0 }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <button class="text-sm font-medium underline" @click="key++">Show notification</button>
        <DzNotification
          :key="key"
          tone="success"
          title="Auto-dismiss"
          description="This notification will disappear in 5 seconds."
          :icon="CheckCircle"
          :duration="5000"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Close Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzNotification },
    data() {
      return { closed: false, key: 0 }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzNotification
          v-if="!closed"
          :key="key"
          tone="warning"
          title="Attention Required"
          description="Your account verification is pending."
          closable
          @close="closed = true"
        />
        <div v-if="closed" class="space-y-2">
          <p class="text-sm text-gray-500">Notification was dismissed.</p>
          <button class="text-sm font-medium underline" @click="closed = false; key++">Show again</button>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA Roles',
  render: () => ({
    components: { DzNotification },
    template: `
      <div class="space-y-4 max-w-md">
        <p class="text-sm text-gray-500">
          Danger/warning notifications use role="alert" with aria-live="assertive"
          for immediate announcement. Other tones use role="status" with
          aria-live="polite" for non-intrusive updates.
        </p>
        <DzNotification tone="danger" title="Urgent" description="Uses role='alert' (assertive)." closable />
        <DzNotification tone="info" title="Informational" description="Uses role='status' (polite)." closable />
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
    components: { DzNotification },
    setup() { return { CheckCircle, AlertCircle } },
    template: `
      <div class="space-y-4 max-w-md">
        <DzNotification tone="success" title="Success" description="Changes saved." :icon="CheckCircle" closable />
        <DzNotification tone="danger" title="Error" description="Connection failed." :icon="AlertCircle" closable />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: System Notifications Stack
// ---------------------------------------------------------------------------

export const RealWorldNotificationStack: Story = {
  name: 'Real World: Notification Stack',
  render: () => ({
    components: { DzNotification },
    setup() { return { CheckCircle, AlertTriangle, Info } },
    template: `
      <div class="space-y-3 max-w-md">
        <DzNotification
          tone="success"
          title="Deployment Complete"
          description="v2.1.0 has been deployed to production."
          :icon="CheckCircle"
          closable
        />
        <DzNotification
          tone="warning"
          title="Certificate Expiring"
          description="Your SSL certificate expires in 7 days."
          :icon="AlertTriangle"
          closable
        >
          <template #actions>
            <button class="px-3 py-1 text-sm font-medium border rounded">Renew Now</button>
          </template>
        </DzNotification>
        <DzNotification
          tone="info"
          title="Scheduled Maintenance"
          description="System maintenance planned for Sunday 2 AM UTC."
          :icon="Info"
          closable
        />
      </div>
    `,
  }),
}
