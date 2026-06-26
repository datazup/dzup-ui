import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Activity, Bell, DollarSign, LayoutDashboard, Package, Settings, TrendingUp, Users } from 'lucide-vue-next'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import { DzButton } from '../../src/components/buttons'
import { DzCard, DzCardBody, DzCardHeader, DzStatCard } from '../../src/components/cards'
import { DzBadge } from '../../src/components/feedback'
import { DzAppShell, DzGrid } from '../../src/components/layout'
import { DzSidebar, DzSidebarFooter, DzSidebarHeader, DzSidebarItem, DzSidebarSection } from '../../src/components/navigation'
import { darkModeDecorator } from '../_shared'

/**
 * AppShellDashboard is the flagship layout composition: it wires the real
 * `DzAppShell` shell around a real `DzSidebar` navigation, a header with
 * sidebar-toggle + notification + user chrome, and a content area built from
 * `DzStatCard` + `DzGrid` + `DzCard`.
 *
 * Unlike the `DzAppShell` "Real World: Dashboard" story (which uses inline
 * styled `<div>`s to keep the layout primitive's docs self-contained), this
 * composition is assembled entirely from shipped dzup-ui components, showing
 * how the navigation, layout, card, and feedback families combine into a full
 * application screen. The sidebar collapse is interactive.
 */
const meta = {
  title: 'Core/Compositions/AppShellDashboard',
  component: undefined,
  tags: ['autodocs', 'composition', 'status:stable'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Flagship layout composition: DzAppShell + DzSidebar + DzStatCard + DzGrid + DzCard forming a full analytics dashboard with a collapsible sidebar.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const navItems = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'orders', label: 'Orders', icon: Package },
]

const stats = [
  { title: 'Total Revenue', value: '$48,295', icon: DollarSign, trend: 'up' as const, trendValue: '+12.5%', description: 'vs last month' },
  { title: 'Active Users', value: '3,842', icon: Users, trend: 'up' as const, trendValue: '+8.1%', description: 'vs last month' },
  { title: 'Orders', value: '1,203', icon: Package, trend: 'down' as const, trendValue: '-3.2%', description: 'vs last month' },
  { title: 'Growth Rate', value: '24.3%', icon: TrendingUp, trend: 'up' as const, trendValue: '+5.0%', description: 'vs last month' },
]

const activity = [
  { who: 'Alice Nguyen', what: 'placed order #1042', when: '2m ago' },
  { who: 'bob@example.com', what: 'registered a new account', when: '14m ago' },
  { who: 'Payment gateway', what: 'received $320.00', when: '1h ago' },
  { who: 'Fulfilment', what: 'shipped order #1041', when: '3h ago' },
]

const components = {
  DzAppShell,
  DzSidebar,
  DzSidebarHeader,
  DzSidebarSection,
  DzSidebarItem,
  DzSidebarFooter,
  DzGrid,
  DzStatCard,
  DzCard,
  DzCardHeader,
  DzCardBody,
  DzBadge,
  DzButton,
}

function useDashboard() {
  const collapsed = ref(false)
  const activeNav = ref('overview')
  return { collapsed, activeNav, navItems, stats, activity, Settings, Bell, Activity }
}

const template = `
  <DzAppShell aria-label="Analytics dashboard" style="height:38rem;">
    <template #sidebar>
      <DzSidebar :collapsed="collapsed" aria-label="Primary navigation">
        <DzSidebarHeader>
          <span style="font-weight:700;color:var(--dz-sidebar-foreground-hover);">{{ collapsed ? 'A' : 'Acme Inc.' }}</span>
        </DzSidebarHeader>
        <DzSidebarSection title="Workspace">
          <DzSidebarItem
            v-for="item in navItems"
            :key="item.key"
            :active="activeNav === item.key"
            :aria-label="item.label"
            @click="activeNav = item.key"
          >
            <template #icon><component :is="item.icon" :size="18" /></template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>
        <DzSidebarSection title="Account">
          <DzSidebarItem aria-label="Settings">
            <template #icon><component :is="Settings" :size="18" /></template>
            Settings
          </DzSidebarItem>
        </DzSidebarSection>
        <DzSidebarFooter>
          <span style="font-size:var(--dz-text-xs);color:var(--dz-sidebar-foreground);">v1.0.0</span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header-start>
      <DzButton
        variant="ghost"
        tone="neutral"
        size="sm"
        aria-label="Toggle sidebar"
        data-testid="toggle-sidebar"
        @click="collapsed = !collapsed"
      >☰</DzButton>
    </template>
    <template #header>
      <span style="color:var(--dz-foreground);font-weight:600;text-transform:capitalize;">{{ activeNav }}</span>
    </template>
    <template #header-end>
      <div style="display:flex;align-items:center;gap:var(--dz-spacing-3);">
        <DzBadge tone="success" variant="subtle">Live</DzBadge>
        <DzButton variant="ghost" tone="neutral" size="sm" aria-label="Notifications">
          <component :is="Bell" :size="18" />
        </DzButton>
        <div style="width:2rem;height:2rem;border-radius:9999px;background:var(--dz-primary);color:var(--dz-primary-foreground);display:flex;align-items:center;justify-content:center;font-size:var(--dz-text-sm);font-weight:600;">JD</div>
      </div>
    </template>

    <div style="padding:var(--dz-spacing-6);display:flex;flex-direction:column;gap:var(--dz-spacing-6);">
      <DzGrid cols="4" gap="md">
        <DzStatCard
          v-for="s in stats"
          :key="s.title"
          :title="s.title"
          :value="s.value"
          :icon="s.icon"
          :trend="s.trend"
          :trend-value="s.trendValue"
          :description="s.description"
        />
      </DzGrid>

      <DzCard variant="outlined">
        <DzCardHeader>
          <div style="display:flex;align-items:center;gap:var(--dz-spacing-2);">
            <component :is="Activity" :size="18" />
            <h3 style="font-size:var(--dz-text-sm);font-weight:600;margin:0;">Recent Activity</h3>
          </div>
        </DzCardHeader>
        <DzCardBody>
          <ul style="margin:0;padding:0;list-style:none;">
            <li
              v-for="(a, i) in activity"
              :key="i"
              style="display:flex;justify-content:space-between;gap:var(--dz-spacing-3);padding:var(--dz-spacing-2) 0;border-top:1px solid var(--dz-border);font-size:var(--dz-text-sm);"
            >
              <span><strong style="font-weight:600;">{{ a.who }}</strong> {{ a.what }}</span>
              <span style="color:var(--dz-muted-foreground);white-space:nowrap;">{{ a.when }}</span>
            </li>
          </ul>
        </DzCardBody>
      </DzCard>
    </div>
  </DzAppShell>
`

// ---------------------------------------------------------------------------
// Default — full dashboard with interactive sidebar collapse
// ---------------------------------------------------------------------------

export const Default: Story = {
  name: 'Dashboard',
  render: () => ({
    components,
    setup: useDashboard,
    template,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The stat cards paint (regression guard: DzStatCard takes title/value).
    await expect(canvas.getByText('Total Revenue')).toBeInTheDocument()
    await expect(canvas.getByText('$48,295')).toBeInTheDocument()

    // The sidebar labels are visible while expanded.
    await expect(canvas.getByText('Acme Inc.')).toBeInTheDocument()

    // Collapsing the sidebar swaps the header brand to the compact mark.
    const toggle = canvas.getByTestId('toggle-sidebar')
    await userEvent.click(toggle)
    await expect(canvas.getByText('A')).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dashboard – Dark Mode',
  parameters: { layout: 'fullscreen' },
  decorators: [darkModeDecorator],
  render: () => ({
    components,
    setup: useDashboard,
    template,
  }),
}
