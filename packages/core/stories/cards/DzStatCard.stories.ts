import type { Meta, StoryObj } from '@storybook/vue3'
import { Activity, DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-vue-next'
import { DzStatCard } from '../../src/components/cards'

/**
 * DzStatCard displays a key statistic or metric with an icon, value,
 * trend indicator, and description text. Commonly used on dashboards
 * and overview pages.
 */
const meta = {
  title: 'Core/Cards/DzStatCard',
  component: DzStatCard,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['elevated', 'outlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'elevated' } },
    },
    // Behavior
    title: {
      control: 'text',
      description: 'Stat label/title',
      table: { category: 'Behavior' },
    },
    value: {
      control: 'text',
      description: 'Primary value to display',
      table: { category: 'Behavior' },
    },
    description: {
      control: 'text',
      description: 'Additional description text',
      table: { category: 'Behavior' },
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction indicator',
      table: { category: 'Behavior' },
    },
    trendValue: {
      control: 'text',
      description: 'Trend value text (e.g., "+12%")',
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
    title: 'Revenue',
    value: '$12,450',
    variant: 'elevated',
  },
} satisfies Meta<typeof DzStatCard>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzStatCard },
    setup() {
      return { args }
    },
    template: '<DzStatCard v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzStatCard },
    template: `
      <div class="grid grid-cols-2 gap-4 max-w-lg">
        <DzStatCard variant="elevated" title="Elevated" value="$12,450" description="vs. last month" trend="up" trend-value="+12.5%" />
        <DzStatCard variant="outlined" title="Outlined" value="$12,450" description="vs. last month" trend="up" trend-value="+12.5%" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Trend Directions
// ---------------------------------------------------------------------------

export const AllTrends: Story = {
  name: 'Trend Directions',
  render: () => ({
    components: { DzStatCard },
    template: `
      <div class="grid grid-cols-3 gap-4 max-w-2xl">
        <DzStatCard title="Up Trend" value="$12,450" trend="up" trend-value="+12.5%" description="vs. last month" />
        <DzStatCard title="Down Trend" value="$8,230" trend="down" trend-value="-5.3%" description="vs. last month" />
        <DzStatCard title="Neutral" value="$10,100" trend="neutral" trend-value="0%" description="vs. last month" />
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
    components: { DzStatCard },
    setup() {
      return { DollarSign, Users, ShoppingCart }
    },
    template: `
      <div class="grid grid-cols-3 gap-4 max-w-2xl">
        <DzStatCard title="Revenue" value="$12,450" :icon="DollarSign" trend="up" trend-value="+12.5%" description="vs. last month" />
        <DzStatCard title="Users" value="2,340" :icon="Users" trend="up" trend-value="+8.1%" description="vs. last week" />
        <DzStatCard title="Orders" value="1,456" :icon="ShoppingCart" trend="down" trend-value="-3.2%" description="vs. last month" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Custom Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Slots',
  render: () => ({
    components: { DzStatCard },
    template: `
      <div class="max-w-xs">
        <DzStatCard title="Conversion Rate" value="4.6%">
          <template #icon>
            <div class="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </template>
          <template #value>
            <span class="text-3xl font-bold text-green-600">4.6%</span>
          </template>
          <template #footer>
            <span class="text-green-600 font-medium">+0.8%</span>
            <span> from last quarter</span>
          </template>
        </DzStatCard>
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
    components: { DzStatCard },
    setup() {
      return { DollarSign, Users, ShoppingCart }
    },
    template: `
      <div class="grid grid-cols-3 gap-4">
        <DzStatCard title="Revenue" value="$12,450" :icon="DollarSign" trend="up" trend-value="+12.5%" description="vs. last month" />
        <DzStatCard title="Users" value="2,340" :icon="Users" trend="up" trend-value="+8.1%" description="vs. last week" />
        <DzStatCard title="Orders" value="1,456" :icon="ShoppingCart" trend="down" trend-value="-3.2%" description="vs. last month" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Structure',
  render: () => ({
    components: { DzStatCard },
    setup() {
      return { DollarSign }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Icons use aria-hidden="true". Values and trend indicators are
          readable by screen readers. Each card can receive a unique ID.
        </p>
        <div class="max-w-xs">
          <DzStatCard
            id="revenue-stat"
            title="Revenue"
            value="$12,450"
            :icon="DollarSign"
            trend="up"
            trend-value="+12.5%"
            description="vs. last month"
          />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Dashboard Row
// ---------------------------------------------------------------------------

export const RealWorldDashboard: Story = {
  name: 'Real World: Dashboard KPI Row',
  render: () => ({
    components: { DzStatCard },
    setup() {
      return { DollarSign, Users, ShoppingCart, TrendingUp, Activity, Package }
    },
    template: `
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DzStatCard title="Revenue" value="$48,250" :icon="DollarSign" trend="up" trend-value="+14.2%" description="vs. last month" />
        <DzStatCard title="Active Users" value="12,340" :icon="Users" trend="up" trend-value="+8.1%" description="vs. last month" />
        <DzStatCard title="Orders" value="3,456" :icon="ShoppingCart" trend="down" trend-value="-3.2%" description="vs. last month" />
        <DzStatCard title="Growth" value="23.5%" :icon="TrendingUp" trend="up" trend-value="+2.1%" description="quarter-over-quarter" />
      </div>
    `,
  }),
}
