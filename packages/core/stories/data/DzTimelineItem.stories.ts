import type { Meta, StoryObj } from '@storybook/vue3'
import { DzTimeline, DzTimelineItem } from '../../src/components/data'

/**
 * DzTimelineItem is a compound sub-part of DzTimeline.
 *
 * Each item renders an indicator, optional status text, and content.
 * It receives size and orientation context from the parent DzTimeline
 * via inject (ADR-08). Items support per-item tone overrides and a
 * custom indicator slot for replacing the default dot.
 */

const meta = {
  title: 'Core/Data/DzTimelineItem',
  component: DzTimelineItem,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone for the item indicator',
      table: { category: 'Appearance' },
    },
    status: {
      control: 'text',
      description: 'Status text displayed alongside the item (e.g., date, time)',
      table: { category: 'Behavior' },
    },
  },
  decorators: [
    () => ({
      components: { DzTimeline },
      template: '<DzTimeline aria-label="Timeline context"><story /></DzTimeline>',
    }),
  ],
} satisfies Meta<typeof DzTimelineItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTimelineItem },
    setup() {
      return { args }
    },
    template: `
      <DzTimelineItem v-bind="args" status="Mar 15">
        Project milestone completed.
      </DzTimelineItem>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Tones
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'All Tones',
  decorators: [],
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline aria-label="Tone gallery">
        <DzTimelineItem tone="neutral" status="Neutral">Default neutral indicator.</DzTimelineItem>
        <DzTimelineItem tone="primary" status="Primary">Primary tone indicator.</DzTimelineItem>
        <DzTimelineItem tone="success" status="Success">Success tone indicator.</DzTimelineItem>
        <DzTimelineItem tone="warning" status="Warning">Warning tone indicator.</DzTimelineItem>
        <DzTimelineItem tone="danger" status="Danger">Danger tone indicator.</DzTimelineItem>
        <DzTimelineItem tone="info" status="Info">Info tone indicator.</DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Custom Indicator
// ---------------------------------------------------------------------------

export const WithCustomIndicator: Story = {
  name: 'With Custom Indicator Slot',
  decorators: [],
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline aria-label="Custom indicators">
        <DzTimelineItem status="Step 1">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">1</div>
          </template>
          First step with numbered indicator.
        </DzTimelineItem>
        <DzTimelineItem status="Step 2">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">2</div>
          </template>
          Second step with numbered indicator.
        </DzTimelineItem>
        <DzTimelineItem status="Step 3">
          <template #indicator>
            <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
          </template>
          Third step with numbered indicator.
        </DzTimelineItem>
      </DzTimeline>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Rich Content
// ---------------------------------------------------------------------------

export const RichContent: Story = {
  name: 'Rich Content Items',
  decorators: [],
  render: () => ({
    components: { DzTimeline, DzTimelineItem },
    template: `
      <DzTimeline aria-label="Activity log">
        <DzTimelineItem tone="success" status="10:23 AM">
          <p class="font-medium text-sm">Build Succeeded</p>
          <p class="text-xs text-gray-500 mt-1">Pipeline #42 completed in 3m 12s. All 120 tests passed.</p>
        </DzTimelineItem>
        <DzTimelineItem tone="danger" status="11:45 AM">
          <p class="font-medium text-sm">Deployment Failed</p>
          <p class="text-xs text-gray-500 mt-1">Staging environment returned HTTP 502 during health check.</p>
        </DzTimelineItem>
        <DzTimelineItem tone="info" status="1:00 PM">
          <p class="font-medium text-sm">PR #128 Merged</p>
          <p class="text-xs text-gray-500 mt-1">Alice merged "feat: add dark mode support" into main.</p>
        </DzTimelineItem>
      </DzTimeline>
    `,
  }),
}
