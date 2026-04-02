import type { Meta, StoryObj } from '@storybook/vue3'
import { DzBadge } from '../../src/components/feedback'

/**
 * DzBadge is a compact label for status indicators, counts, or categories.
 *
 * It supports three variants (`solid`, `outline`, `subtle`),
 * six semantic tones, and three sizes (`sm`, `md`, `lg`).
 */
const meta = {
  title: 'Core/Feedback/DzBadge',
  component: DzBadge,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
  args: {
    variant: 'solid',
    tone: 'neutral',
    size: 'md',
  },
} satisfies Meta<typeof DzBadge>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzBadge },
    setup() {
      return { args }
    },
    template: '<DzBadge v-bind="args">Badge</DzBadge>',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzBadge variant="solid">Solid</DzBadge>
        <DzBadge variant="outline">Outline</DzBadge>
        <DzBadge variant="subtle">Subtle</DzBadge>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="flex items-center gap-4">
        <DzBadge size="sm">Small</DzBadge>
        <DzBadge size="md">Medium</DzBadge>
        <DzBadge size="lg">Large</DzBadge>
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
    components: { DzBadge },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzBadge tone="neutral">Neutral</DzBadge>
        <DzBadge tone="primary">Primary</DzBadge>
        <DzBadge tone="success">Success</DzBadge>
        <DzBadge tone="warning">Warning</DzBadge>
        <DzBadge tone="danger">Danger</DzBadge>
        <DzBadge tone="info">Info</DzBadge>
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
    components: { DzBadge },
    template: `
      <div class="space-y-6">
        <div v-for="variant in ['solid', 'outline', 'subtle']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">{{ variant }}</p>
          <div class="flex flex-wrap gap-3 items-center">
            <DzBadge :variant="variant" tone="neutral">Neutral</DzBadge>
            <DzBadge :variant="variant" tone="primary">Primary</DzBadge>
            <DzBadge :variant="variant" tone="success">Success</DzBadge>
            <DzBadge :variant="variant" tone="warning">Warning</DzBadge>
            <DzBadge :variant="variant" tone="danger">Danger</DzBadge>
            <DzBadge :variant="variant" tone="info">Info</DzBadge>
          </div>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (numeric counts)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzBadge tone="danger">99+</DzBadge>
        <DzBadge tone="primary" variant="outline">NEW</DzBadge>
        <DzBadge tone="success" variant="subtle">
          <span class="flex items-center gap-1">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-current" />
            Online
          </span>
        </DzBadge>
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
    components: { DzBadge },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzBadge variant="solid" tone="primary">Solid</DzBadge>
        <DzBadge variant="outline" tone="success">Outline</DzBadge>
        <DzBadge variant="subtle" tone="danger">Subtle</DzBadge>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Usage',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Badges render as &lt;span&gt; elements. Use aria-label on a parent when
          the badge conveys important status information.
        </p>
        <div class="flex gap-4 items-center">
          <span aria-label="3 unread notifications">
            Notifications <DzBadge tone="danger" size="sm">3</DzBadge>
          </span>
          <span aria-label="Status: Active">
            Status <DzBadge tone="success">Active</DzBadge>
          </span>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzBadge },
    data() {
      return { count: 0 }
    },
    template: `
      <div class="flex items-center gap-4">
        <button class="text-sm font-medium underline" @click="count++">Add notification</button>
        <button class="text-sm font-medium underline" @click="count = 0">Clear</button>
        <DzBadge tone="danger" :variant="count > 0 ? 'solid' : 'outline'">
          {{ count > 0 ? count : '--' }}
        </DzBadge>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Status Labels
// ---------------------------------------------------------------------------

export const RealWorldStatusLabels: Story = {
  name: 'Real World: Status Labels',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="space-y-3 max-w-md">
        <div class="flex justify-between items-center p-3 border rounded">
          <span class="text-sm">Payment #1234</span>
          <DzBadge tone="success" size="sm">Paid</DzBadge>
        </div>
        <div class="flex justify-between items-center p-3 border rounded">
          <span class="text-sm">Payment #1235</span>
          <DzBadge tone="warning" size="sm">Pending</DzBadge>
        </div>
        <div class="flex justify-between items-center p-3 border rounded">
          <span class="text-sm">Payment #1236</span>
          <DzBadge tone="danger" size="sm">Failed</DzBadge>
        </div>
        <div class="flex justify-between items-center p-3 border rounded">
          <span class="text-sm">Payment #1237</span>
          <DzBadge tone="info" size="sm" variant="outline">Refunded</DzBadge>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Tag Cloud
// ---------------------------------------------------------------------------

export const RealWorldTagCloud: Story = {
  name: 'Real World: Tag Cloud',
  render: () => ({
    components: { DzBadge },
    template: `
      <div class="flex flex-wrap gap-2">
        <DzBadge variant="subtle" tone="primary">Vue 3</DzBadge>
        <DzBadge variant="subtle" tone="info">TypeScript</DzBadge>
        <DzBadge variant="subtle" tone="success">Tailwind</DzBadge>
        <DzBadge variant="subtle" tone="warning">Storybook</DzBadge>
        <DzBadge variant="subtle" tone="neutral">Vitest</DzBadge>
        <DzBadge variant="subtle" tone="danger">Critical</DzBadge>
      </div>
    `,
  }),
}
