import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzMeterGroup } from '../../src/components/feedback'

/**
 * DzMeterGroup displays multiple proportional values in a single bar with a
 * legend — storage used by type, budget allocation, or token usage by model.
 *
 * Each segment is colored via semantic tone tokens (no raw colors), sized by
 * its share of `max` (defaults to the sum of all values), and exposed to
 * assistive tech via `role="meter"`. The legend ties color ↔ label so meaning
 * is never color-only.
 */
const meta = {
  title: 'Core/Feedback/DzMeterGroup',
  component: DzMeterGroup,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    // Appearance
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Track orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Track thickness',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    showLegend: {
      control: 'boolean',
      description: 'Whether to render the legend',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    // Behavior
    values: {
      control: 'object',
      description: 'Ordered list of segments ({ label, value, tone?, color?, icon? })',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'number',
      description: 'Maximum value of the whole (defaults to sum of values)',
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
      description: 'Accessible label for the meter group',
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
    orientation: 'horizontal',
    size: 'md',
    showLegend: true,
    values: [
      { label: 'Images', value: 30, tone: 'primary' },
      { label: 'Documents', value: 20, tone: 'info' },
      { label: 'Free', value: 50, tone: 'neutral' },
    ],
  },
} satisfies Meta<typeof DzMeterGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzMeterGroup },
    setup() {
      return { args }
    },
    template: '<DzMeterGroup v-bind="args" class="max-w-md" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meters = canvas.getAllByRole('meter')
    await expect(meters.length).toBeGreaterThan(0)
    for (const meter of meters) {
      await expect(meter).toHaveAttribute('aria-valuenow')
      await expect(meter).toHaveAttribute('aria-valuemin', '0')
      await expect(meter).toHaveAttribute('aria-valuemax')
    }
  },
}

// ---------------------------------------------------------------------------
// Storage Breakdown
// ---------------------------------------------------------------------------

export const StorageBreakdown: Story = {
  name: 'Storage Breakdown',
  render: () => ({
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'Photos', value: 42, tone: 'primary' as const },
        { label: 'Videos', value: 28, tone: 'info' as const },
        { label: 'Documents', value: 12, tone: 'success' as const },
        { label: 'Apps', value: 8, tone: 'warning' as const },
        { label: 'Free', value: 38, tone: 'neutral' as const },
      ]
      return { values }
    },
    template: `
      <div class="max-w-md space-y-2">
        <DzMeterGroup :values="values" :max="128" aria-label="Disk usage by type">
          <template #label="{ total, max }">
            <div class="flex justify-between text-sm font-medium">
              <span>Storage</span>
              <span class="text-[var(--dz-muted-foreground)]">{{ total }} GB of {{ max }} GB</span>
            </div>
          </template>
        </DzMeterGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => ({
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'Compute', value: 45, tone: 'primary' as const },
        { label: 'Storage', value: 25, tone: 'info' as const },
        { label: 'Network', value: 15, tone: 'success' as const },
        { label: 'Remaining', value: 15, tone: 'neutral' as const },
      ]
      return { values }
    },
    template: `
      <div class="flex items-stretch gap-8">
        <DzMeterGroup
          :values="values"
          orientation="vertical"
          size="lg"
          aria-label="Budget allocation"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Legend
// ---------------------------------------------------------------------------

export const CustomLegend: Story = {
  name: 'Custom Legend',
  render: () => ({
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'Used', value: 68, tone: 'danger' as const },
        { label: 'Reserved', value: 12, tone: 'warning' as const },
        { label: 'Available', value: 20, tone: 'success' as const },
      ]
      return { values }
    },
    template: `
      <div class="max-w-md">
        <DzMeterGroup :values="values" :max="100" aria-label="Quota">
          <template #legend="{ segments }">
            <dl class="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div v-for="s in segments" :key="s.label" class="flex flex-col">
                <dt class="flex items-center gap-1.5 text-[var(--dz-muted-foreground)]">
                  <span
                    class="inline-block h-2 w-2 rounded-full"
                    :style="{ backgroundColor: s.resolvedColor }"
                  />
                  {{ s.label }}
                </dt>
                <dd class="font-semibold">{{ s.percentage }}%</dd>
              </div>
            </dl>
          </template>
        </DzMeterGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Token Usage (AI dashboard)
// ---------------------------------------------------------------------------

export const TokenUsage: Story = {
  name: 'Token Usage',
  render: () => ({
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'Opus', value: 1_240_000, tone: 'primary' as const },
        { label: 'Sonnet', value: 820_000, tone: 'info' as const },
        { label: 'Haiku', value: 310_000, tone: 'success' as const },
      ]
      const fmt = (n: number) => `${(n / 1_000_000).toFixed(2)}M`
      return { values, fmt }
    },
    template: `
      <div class="max-w-lg space-y-2">
        <DzMeterGroup :values="values" :max="3000000" aria-label="Token usage by model">
          <template #label="{ total, max }">
            <div class="flex justify-between text-sm font-medium">
              <span>Token usage</span>
              <span class="text-[var(--dz-muted-foreground)]">{{ fmt(total) }} / {{ fmt(max) }}</span>
            </div>
          </template>
          <template #legend="{ segments }">
            <ul class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <li v-for="s in segments" :key="s.label" class="inline-flex items-center gap-2">
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full"
                  :style="{ backgroundColor: s.resolvedColor }"
                />
                <span>{{ s.label }}</span>
                <span class="text-[var(--dz-muted-foreground)]">{{ fmt(s.value) }}</span>
              </li>
            </ul>
          </template>
        </DzMeterGroup>
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
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'A', value: 40, tone: 'primary' as const },
        { label: 'B', value: 30, tone: 'info' as const },
        { label: 'C', value: 30, tone: 'success' as const },
      ]
      return { values, sizes: ['xs', 'sm', 'md', 'lg', 'xl'] }
    },
    template: `
      <div class="max-w-md space-y-4">
        <div v-for="size in sizes" :key="size" class="space-y-1">
          <p class="text-xs uppercase text-[var(--dz-muted-foreground)]">{{ size }}</p>
          <DzMeterGroup :values="values" :size="size" :show-legend="false" />
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
    components: { DzMeterGroup },
    setup() {
      const values = [
        { label: 'Images', value: 30, tone: 'primary' as const },
        { label: 'Documents', value: 20, tone: 'info' as const },
        { label: 'Free', value: 50, tone: 'neutral' as const },
      ]
      return { values }
    },
    template: '<DzMeterGroup :values="values" class="max-w-md" />',
  }),
}
