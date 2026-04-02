import type { Meta, StoryObj } from '@storybook/vue3'
import { DzTimeline, DzTimelineItem } from '../../src/components/data'

/**
 * DzTimeline displays a chronological sequence of events with an
 * indicator line and per-item content.
 *
 * It supports vertical and horizontal orientations, per-item tone overrides,
 * and a custom indicator slot for each timeline item.
 * Context is provided via inject (ADR-08).
 */

const meta = {
  title: 'Core/Data/DzTimeline',
  component: DzTimeline,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Default semantic color tone for indicators',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
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
  },
  args: {
    size: 'md',
    tone: 'neutral',
    orientation: 'vertical',
  },
} satisfies Meta<typeof DzTimeline>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTimeline, DzTimelineItem },
    setup() {
      return { args }
    },
    template: `
      <DzTimeline v-bind="args" aria-label="Project timeline">
        <DzTimelineItem status="Jan 2026">
          Project kickoff and requirements gathering.
        </DzTimelineItem>
        <DzTimelineItem status="Feb 2026">
          Design system and token architecture finalized.
        </DzTimelineItem>
        <DzTimelineItem status="Mar 2026">
          Core component library development begins.
        </DzTimelineItem>
        <DzTimelineItem status="Apr 2026">
          Beta release and community feedback.
        </DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <div class="space-y-8">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzTimeline :size="s" :aria-label="s + ' timeline'">
            <DzTimelineItem status="Step 1">First event</DzTimelineItem>
            <DzTimelineItem status="Step 2">Second event</DzTimelineItem>
            <DzTimelineItem status="Step 3">Third event</DzTimelineItem>
          </DzTimeline>
        </div>
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
    components: { DzTimeline, DzTimelineItem },
    template: `
      <div class="flex flex-wrap gap-8">
        <div v-for="t in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="t" class="w-56">
          <p class="text-sm font-medium mb-2 capitalize">{{ t }}</p>
          <DzTimeline :tone="t" :aria-label="t + ' timeline'">
            <DzTimelineItem status="Step 1">First event</DzTimelineItem>
            <DzTimelineItem status="Step 2">Second event</DzTimelineItem>
            <DzTimelineItem status="Step 3">Third event</DzTimelineItem>
          </DzTimeline>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Per-Item Tones
// ---------------------------------------------------------------------------

export const PerItemTones: Story = {
  name: 'Per-Item Tones',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline aria-label="Status timeline">
        <DzTimelineItem tone="success" status="Completed">
          Requirements approved by stakeholders.
        </DzTimelineItem>
        <DzTimelineItem tone="success" status="Completed">
          Design mockups delivered and reviewed.
        </DzTimelineItem>
        <DzTimelineItem tone="warning" status="In Progress">
          Frontend development underway.
        </DzTimelineItem>
        <DzTimelineItem tone="neutral" status="Pending">
          Testing and QA review.
        </DzTimelineItem>
        <DzTimelineItem tone="neutral" status="Pending">
          Production deployment.
        </DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal Orientation
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  name: 'Horizontal Orientation',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline orientation="horizontal" aria-label="Horizontal timeline">
        <DzTimelineItem status="Q1">Planning</DzTimelineItem>
        <DzTimelineItem status="Q2">Development</DzTimelineItem>
        <DzTimelineItem status="Q3">Testing</DzTimelineItem>
        <DzTimelineItem status="Q4">Launch</DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Custom Indicator Slot
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Indicator Slot',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline aria-label="Timeline with custom indicators">
        <DzTimelineItem status="10:00 AM">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">1</div>
          </template>
          Morning standup meeting.
        </DzTimelineItem>
        <DzTimelineItem status="2:00 PM">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">2</div>
          </template>
          Sprint planning session.
        </DzTimelineItem>
        <DzTimelineItem status="4:30 PM">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
          </template>
          Code review and merge.
        </DzTimelineItem>
      </DzTimeline>
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
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline tone="primary" aria-label="Dark mode timeline">
        <DzTimelineItem status="Jan">Foundation phase completed.</DzTimelineItem>
        <DzTimelineItem status="Feb">Core components built.</DzTimelineItem>
        <DzTimelineItem status="Mar">Pro components released.</DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Structure',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzTimeline renders as a semantic list element. Each DzTimelineItem
          is a list item with status as a time element. Screen readers announce
          each item with its status and content in sequence. The indicator
          is decorative and hidden from assistive technology.
        </p>
        <DzTimeline aria-label="Accessible order timeline">
          <DzTimelineItem tone="success" status="Mar 15, 2026">
            Order placed and confirmed.
          </DzTimelineItem>
          <DzTimelineItem tone="success" status="Mar 16, 2026">
            Payment processed successfully.
          </DzTimelineItem>
          <DzTimelineItem tone="info" status="Mar 17, 2026">
            Shipped via express delivery.
          </DzTimelineItem>
          <DzTimelineItem tone="neutral" status="Mar 20, 2026">
            Estimated delivery.
          </DzTimelineItem>
        </DzTimeline>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Order Tracking
// ---------------------------------------------------------------------------

export const RealWorldOrderTracking: Story = {
  name: 'Real World: Order Tracking',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <div class="max-w-md">
        <h3 class="text-lg font-semibold mb-4">Order #12345 Tracking</h3>
        <DzTimeline aria-label="Order tracking">
          <DzTimelineItem tone="success" status="Mar 15, 10:23 AM">
            <p class="font-medium text-sm">Order Confirmed</p>
            <p class="text-xs text-gray-500">Your order has been received and is being processed.</p>
          </DzTimelineItem>
          <DzTimelineItem tone="success" status="Mar 15, 2:45 PM">
            <p class="font-medium text-sm">Payment Verified</p>
            <p class="text-xs text-gray-500">Payment of $129.99 processed successfully.</p>
          </DzTimelineItem>
          <DzTimelineItem tone="success" status="Mar 16, 9:00 AM">
            <p class="font-medium text-sm">Shipped</p>
            <p class="text-xs text-gray-500">Package dispatched via FedEx. Tracking: FX789012.</p>
          </DzTimelineItem>
          <DzTimelineItem tone="info" status="Mar 17, 3:15 PM">
            <p class="font-medium text-sm">In Transit</p>
            <p class="text-xs text-gray-500">Package is at the regional distribution center.</p>
          </DzTimelineItem>
          <DzTimelineItem tone="neutral" status="Mar 19 (est.)">
            <p class="font-medium text-sm">Delivery</p>
            <p class="text-xs text-gray-500">Expected delivery to your address.</p>
          </DzTimelineItem>
        </DzTimeline>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Changelog
// ---------------------------------------------------------------------------

export const RealWorldChangelog: Story = {
  name: 'Real World: Release Changelog',
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <div class="max-w-lg">
        <h3 class="text-lg font-semibold mb-4">Release History</h3>
        <DzTimeline tone="primary" aria-label="Release changelog">
          <DzTimelineItem status="v1.3.0">
            <p class="font-medium text-sm">Added DzDataGrid component</p>
            <p class="text-xs text-gray-500">Sortable columns, row selection, and pagination support.</p>
          </DzTimelineItem>
          <DzTimelineItem status="v1.2.0">
            <p class="font-medium text-sm">New Accordion & Tree components</p>
            <p class="text-xs text-gray-500">Built on Reka UI primitives with full keyboard navigation.</p>
          </DzTimelineItem>
          <DzTimelineItem status="v1.1.0">
            <p class="font-medium text-sm">Dark mode support</p>
            <p class="text-xs text-gray-500">FOUC-free theme switching with localStorage persistence.</p>
          </DzTimelineItem>
          <DzTimelineItem status="v1.0.0">
            <p class="font-medium text-sm">Initial release</p>
            <p class="text-xs text-gray-500">Core button, card, input, and layout components.</p>
          </DzTimelineItem>
        </DzTimeline>
      </div>
    `,
  }),
}
