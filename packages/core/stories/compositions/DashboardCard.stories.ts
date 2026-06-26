import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Activity, DollarSign, Package, TrendingUp, Users } from 'lucide-vue-next'
import { expect, within } from 'storybook/test'
import { DzCard, DzCardBody, DzCardHeader, DzStatCard } from '../../src/components/cards'
import { DzGrid } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DashboardCard demonstrates how DzStatCard and DzCard compose with DzGrid
 * to form a dashboard statistics overview panel.
 *
 * This is a real-world composition pattern showing metric cards with trends,
 * responsive grid layout, and tonal differentiation for key indicators.
 */
const meta = {
  title: 'Core/Compositions/DashboardCard',
  component: undefined,
  tags: ['autodocs', 'composition'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Real-world composition: DzStatCard + DzCard + DzGrid forming a dashboard stats panel.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Dashboard Stats Grid
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Dashboard Stats Grid',
  render: () => ({
    components: { DzGrid, DzStatCard },
    setup() {
      return { DollarSign, Users, Package, TrendingUp, Activity }
    },
    template: `
      <div class="w-full max-w-5xl space-y-6">
        <h2 class="text-lg font-semibold">Overview</h2>
        <DzGrid :cols="4" gap="md">
          <DzStatCard
            title="Total Revenue"
            value="$48,295"
            :icon="DollarSign"
            trend="up"
            trend-value="+12.5%"
            description="vs last month"
          />
          <DzStatCard
            title="Active Users"
            value="3,842"
            :icon="Users"
            trend="up"
            trend-value="+8.1%"
            description="vs last month"
          />
          <DzStatCard
            title="Orders"
            value="1,203"
            :icon="Package"
            trend="down"
            trend-value="-3.2%"
            description="vs last month"
          />
          <DzStatCard
            title="Growth Rate"
            value="24.3%"
            :icon="TrendingUp"
            trend="up"
            trend-value="+5.0%"
            description="vs last month"
          />
        </DzGrid>
      </div>
    `,
  }),
  // Regression guard: DzStatCard takes `title`/`description`, not `label`/`trend-label`.
  // A wrong prop name renders an empty title, so assert the labels actually paint.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Total Revenue')).toBeInTheDocument()
    await expect(canvas.getByText('$48,295')).toBeInTheDocument()
    await expect(canvas.getByText('Growth Rate')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// With Activity Card
// ---------------------------------------------------------------------------

export const WithActivityCard: Story = {
  name: 'Stats + Activity Card',
  render: () => ({
    components: { DzGrid, DzStatCard, DzCard, DzCardHeader, DzCardBody },
    setup() {
      return { DollarSign, Users, Package, Activity }
    },
    template: `
      <div class="w-full max-w-5xl space-y-6">
        <DzGrid :cols="3" gap="md">
          <DzStatCard
            title="Total Revenue"
            value="$48,295"
            :icon="DollarSign"
            trend="up"
            trend-value="+12.5%"
          />
          <DzStatCard
            title="Active Users"
            value="3,842"
            :icon="Users"
            trend="up"
            trend-value="+8.1%"
          />
          <DzStatCard
            title="Orders"
            value="1,203"
            :icon="Package"
            trend="down"
            trend-value="-3.2%"
          />
        </DzGrid>

        <DzCard variant="outlined">
          <DzCardHeader>
            <h3 class="text-sm font-semibold">Recent Activity</h3>
          </DzCardHeader>
          <DzCardBody>
            <ul class="divide-y text-sm">
              <li class="py-2 flex justify-between">
                <span>Order #1042 placed by Alice</span>
                <span class="text-gray-400">2m ago</span>
              </li>
              <li class="py-2 flex justify-between">
                <span>New user registered: bob@example.com</span>
                <span class="text-gray-400">14m ago</span>
              </li>
              <li class="py-2 flex justify-between">
                <span>Payment received: $320.00</span>
                <span class="text-gray-400">1h ago</span>
              </li>
              <li class="py-2 flex justify-between">
                <span>Order #1041 shipped</span>
                <span class="text-gray-400">3h ago</span>
              </li>
            </ul>
          </DzCardBody>
        </DzCard>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// DarkMode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dashboard Stats – Dark Mode',
  decorators: [
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzGrid, DzStatCard },
    setup() {
      return { DollarSign, Users, Package, TrendingUp }
    },
    template: `
      <div class="w-full max-w-4xl space-y-4">
        <h2 class="text-lg font-semibold">Overview</h2>
        <DzGrid :cols="4" gap="md">
          <DzStatCard
            title="Total Revenue"
            value="$48,295"
            :icon="DollarSign"
            trend="up"
            trend-value="+12.5%"
          />
          <DzStatCard
            title="Active Users"
            value="3,842"
            :icon="Users"
            trend="up"
            trend-value="+8.1%"
          />
          <DzStatCard
            title="Orders"
            value="1,203"
            :icon="Package"
            trend="down"
            trend-value="-3.2%"
          />
          <DzStatCard
            title="Growth Rate"
            value="24.3%"
            :icon="TrendingUp"
            trend="up"
            trend-value="+5.0%"
          />
        </DzGrid>
      </div>
    `,
  }),
}
