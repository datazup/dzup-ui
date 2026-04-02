import type { Meta, StoryObj } from '@storybook/vue3'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-vue-next'
import { DzAlert } from '../../src/components/feedback'

/**
 * DzAlert displays contextual alert messages for user feedback.
 *
 * It supports four visual variants (`filled`, `outline`, `subtle`, `ghost`),
 * six semantic tones, optional icon, title, close button, and action slot.
 */
const meta = {
  title: 'Core/Feedback/DzAlert',
  component: DzAlert,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'subtle', 'ghost'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'subtle' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'info' } },
    },
    // Behavior
    closable: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    title: {
      control: 'text',
      description: 'Alert title text',
      table: { category: 'Behavior' },
    },
    icon: {
      control: false,
      description: 'Optional icon component to display',
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
    variant: 'subtle',
    tone: 'info',
    closable: false,
  },
} satisfies Meta<typeof DzAlert>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzAlert },
    setup() {
      return { args }
    },
    template: '<DzAlert v-bind="args">This is an informational alert message.</DzAlert>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzAlert },
    template: `
      <div class="space-y-4">
        <DzAlert variant="filled" tone="primary">Filled variant alert</DzAlert>
        <DzAlert variant="outline" tone="primary">Outline variant alert</DzAlert>
        <DzAlert variant="subtle" tone="primary">Subtle variant alert</DzAlert>
        <DzAlert variant="ghost" tone="primary">Ghost variant alert</DzAlert>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzAlert },
    template: `
      <div class="space-y-4">
        <DzAlert tone="neutral">Neutral tone alert</DzAlert>
        <DzAlert tone="primary">Primary tone alert</DzAlert>
        <DzAlert tone="success">Success tone alert</DzAlert>
        <DzAlert tone="warning">Warning tone alert</DzAlert>
        <DzAlert tone="danger">Danger tone alert</DzAlert>
        <DzAlert tone="info">Info tone alert</DzAlert>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Visual Matrix: Variant x Tone
// ---------------------------------------------------------------------------

export const VariantToneMatrix: Story = {
  name: 'Visual Matrix: Variant x Tone',
  render: () => ({
    components: { DzAlert },
    template: `
      <div class="space-y-6">
        <div v-for="variant in ['filled', 'outline', 'subtle', 'ghost']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">{{ variant }}</p>
          <div class="space-y-2">
            <DzAlert v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone" :variant="variant" :tone="tone">
              {{ variant }} / {{ tone }} alert message
            </DzAlert>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Title
// ---------------------------------------------------------------------------

export const WithTitle: Story = {
  name: 'With Title',
  render: () => ({
    components: { DzAlert },
    template: `
      <div class="space-y-4">
        <DzAlert tone="success" title="Changes saved">Your profile has been updated successfully.</DzAlert>
        <DzAlert tone="danger" title="Error occurred">Unable to process your request. Please try again later.</DzAlert>
        <DzAlert tone="warning" title="Heads up">Your trial period ends in 3 days.</DzAlert>
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
    components: { DzAlert, AlertCircle, CheckCircle, Info, AlertTriangle },
    template: `
      <div class="space-y-4">
        <DzAlert tone="info" title="Information" :icon="Info">Check out the new features in this release.</DzAlert>
        <DzAlert tone="success" title="Success" :icon="CheckCircle">Operation completed successfully.</DzAlert>
        <DzAlert tone="warning" title="Warning" :icon="AlertTriangle">Disk space is running low.</DzAlert>
        <DzAlert tone="danger" title="Error" :icon="AlertCircle">Failed to connect to the server.</DzAlert>
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
    title: 'Dismissable Alert',
    tone: 'warning',
  },
  render: args => ({
    components: { DzAlert },
    setup() {
      return { args }
    },
    template: '<DzAlert v-bind="args">Click the close button to dismiss this alert.</DzAlert>',
  }),
}

// ---------------------------------------------------------------------------
// With Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzAlert },
    template: `
      <DzAlert tone="danger" closable>
        <template #title>
          <span class="underline">Custom Title Slot</span>
        </template>
        <template #icon>
          <span class="text-xl">&#9888;</span>
        </template>
        This alert uses custom title and icon slots.
        <template #actions>
          <button class="text-sm font-medium underline">Retry</button>
          <button class="text-sm font-medium underline">Learn more</button>
        </template>
      </DzAlert>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Close Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzAlert },
    data() {
      return { closed: false }
    },
    template: `
      <div class="space-y-4">
        <DzAlert v-if="!closed" tone="info" closable title="Dismissable" @close="closed = true">
          Click close to dismiss. Then click "Show again" below.
        </DzAlert>
        <p v-if="closed" class="text-sm text-gray-500">Alert was dismissed.</p>
        <button v-if="closed" class="text-sm font-medium underline" @click="closed = false">Show again</button>
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
    components: { DzAlert },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Danger/warning alerts use role="alert" for urgent screen reader announcements.
          Other tones use aria-live="polite" for non-urgent updates.
        </p>
        <DzAlert tone="danger" title="Critical Error" aria-label="Critical application error">
          This alert uses role="alert" for immediate screen reader announcement.
        </DzAlert>
        <DzAlert tone="info" title="Update Available" aria-label="Software update notification">
          This alert uses aria-live="polite" for non-intrusive announcement.
        </DzAlert>
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
    components: { DzAlert },
    template: `
      <div class="space-y-4">
        <DzAlert variant="filled" tone="primary" title="Filled">Dark mode filled alert</DzAlert>
        <DzAlert variant="outline" tone="success" title="Outline">Dark mode outline alert</DzAlert>
        <DzAlert variant="subtle" tone="warning" title="Subtle">Dark mode subtle alert</DzAlert>
        <DzAlert variant="ghost" tone="danger" title="Ghost">Dark mode ghost alert</DzAlert>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: System Status Alerts
// ---------------------------------------------------------------------------

export const RealWorldSystemStatus: Story = {
  name: 'Real World: System Status',
  render: () => ({
    components: { DzAlert, CheckCircle, AlertTriangle, AlertCircle },
    template: `
      <div class="space-y-3 max-w-lg">
        <DzAlert tone="success" title="All Systems Operational" :icon="CheckCircle" />
        <DzAlert tone="warning" title="Scheduled Maintenance" :icon="AlertTriangle" closable>
          Maintenance window: March 29, 2:00 AM - 4:00 AM UTC.
        </DzAlert>
        <DzAlert tone="danger" title="Service Degradation" :icon="AlertCircle" closable>
          Some API endpoints are experiencing increased latency.
          <template #actions>
            <button class="text-sm font-medium underline">Status page</button>
          </template>
        </DzAlert>
      </div>
    `,
  }),
}
