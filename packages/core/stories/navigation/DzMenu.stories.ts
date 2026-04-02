import type { Meta, StoryObj } from '@storybook/vue3'
import { BarChart3, Bell, FileText, Home, LogOut, Settings, Shield, Users } from 'lucide-vue-next'
import {
  DzMenu,
  DzMenuItem,
  DzMenuSeparator,
} from '../../src/components/navigation'

/**
 * DzMenu is a compound vertical navigation menu component.
 *
 * It supports five canonical sizes, a collapsible icon-only mode,
 * and provides size/collapsed context to children via inject (ADR-08).
 *
 * Compound children: `DzMenuItem`, `DzMenuSeparator`.
 */
const meta = {
  title: 'Core/Navigation/DzMenu',
  component: DzMenu,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    collapsed: {
      control: 'boolean',
      description: 'Collapse the menu to icon-only mode',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the nav element',
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
    size: 'md',
    collapsed: false,
  },
} satisfies Meta<typeof DzMenu>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users },
    setup() {
      return { args }
    },
    template: `
      <DzMenu v-bind="args" aria-label="Main navigation" class="w-64">
        <DzMenuItem active>
          <template #icon><Home class="h-4 w-4" /></template>
          Dashboard
        </DzMenuItem>
        <DzMenuItem>
          <template #icon><Users class="h-4 w-4" /></template>
          Users
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>
          <template #icon><Settings class="h-4 w-4" /></template>
          Settings
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings },
    template: `
      <div class="flex flex-wrap gap-8">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 uppercase">{{ size }}</p>
          <DzMenu :size="size" aria-label="Navigation" class="w-48">
            <DzMenuItem active>
              <template #icon><Home class="h-4 w-4" /></template>
              Home
            </DzMenuItem>
            <DzMenuItem>
              <template #icon><Settings class="h-4 w-4" /></template>
              Settings
            </DzMenuItem>
          </DzMenu>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Active and Disabled States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users, LogOut },
    template: `
      <DzMenu aria-label="Navigation" class="w-64">
        <DzMenuItem active>
          <template #icon><Home class="h-4 w-4" /></template>
          Active Item
        </DzMenuItem>
        <DzMenuItem>
          <template #icon><Users class="h-4 w-4" /></template>
          Normal Item
        </DzMenuItem>
        <DzMenuItem disabled>
          <template #icon><Settings class="h-4 w-4" /></template>
          Disabled Item
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>
          <template #icon><LogOut class="h-4 w-4" /></template>
          Logout
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Collapsed (Icon-Only)
// ---------------------------------------------------------------------------

export const Collapsed: Story = {
  name: 'Collapsed (Icon-Only)',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users, LogOut },
    template: `
      <DzMenu collapsed aria-label="Navigation">
        <DzMenuItem active aria-label="Dashboard">
          <template #icon><Home class="h-4 w-4" /></template>
          Dashboard
        </DzMenuItem>
        <DzMenuItem aria-label="Users">
          <template #icon><Users class="h-4 w-4" /></template>
          Users
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem aria-label="Settings">
          <template #icon><Settings class="h-4 w-4" /></template>
          Settings
        </DzMenuItem>
        <DzMenuItem aria-label="Logout">
          <template #icon><LogOut class="h-4 w-4" /></template>
          Logout
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Links (href)
// ---------------------------------------------------------------------------

export const WithLinks: Story = {
  name: 'With Links (href)',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, FileText, BarChart3 },
    template: `
      <DzMenu aria-label="Site navigation" class="w-64">
        <DzMenuItem href="/" active>
          <template #icon><Home class="h-4 w-4" /></template>
          Home
        </DzMenuItem>
        <DzMenuItem href="/reports">
          <template #icon><BarChart3 class="h-4 w-4" /></template>
          Reports
        </DzMenuItem>
        <DzMenuItem href="/documents">
          <template #icon><FileText class="h-4 w-4" /></template>
          Documents
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Icons
// ---------------------------------------------------------------------------

export const WithoutIcons: Story = {
  name: 'Without Icons',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    template: `
      <DzMenu aria-label="Navigation" class="w-64">
        <DzMenuItem active>Dashboard</DzMenuItem>
        <DzMenuItem>Analytics</DzMenuItem>
        <DzMenuItem>Reports</DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>Settings</DzMenuItem>
      </DzMenu>
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
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users, Bell, Shield },
    template: `
      <div class="flex gap-8">
        <DzMenu aria-label="Navigation" class="w-64">
          <DzMenuItem active>
            <template #icon><Home class="h-4 w-4" /></template>
            Dashboard
          </DzMenuItem>
          <DzMenuItem>
            <template #icon><Users class="h-4 w-4" /></template>
            Users
          </DzMenuItem>
          <DzMenuItem>
            <template #icon><Bell class="h-4 w-4" /></template>
            Notifications
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem>
            <template #icon><Shield class="h-4 w-4" /></template>
            Security
          </DzMenuItem>
          <DzMenuItem disabled>
            <template #icon><Settings class="h-4 w-4" /></template>
            Disabled
          </DzMenuItem>
        </DzMenu>
        <DzMenu collapsed aria-label="Collapsed navigation">
          <DzMenuItem active aria-label="Dashboard">
            <template #icon><Home class="h-4 w-4" /></template>
          </DzMenuItem>
          <DzMenuItem aria-label="Users">
            <template #icon><Users class="h-4 w-4" /></template>
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem aria-label="Settings">
            <template #icon><Settings class="h-4 w-4" /></template>
          </DzMenuItem>
        </DzMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users, LogOut },
    data() {
      return { activeItem: 'dashboard' }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Active: <code>{{ activeItem }}</code></p>
        <DzMenu aria-label="Navigation" class="w-64">
          <DzMenuItem :active="activeItem === 'dashboard'" @click="activeItem = 'dashboard'">
            <template #icon><Home class="h-4 w-4" /></template>
            Dashboard
          </DzMenuItem>
          <DzMenuItem :active="activeItem === 'users'" @click="activeItem = 'users'">
            <template #icon><Users class="h-4 w-4" /></template>
            Users
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem :active="activeItem === 'settings'" @click="activeItem = 'settings'">
            <template #icon><Settings class="h-4 w-4" /></template>
            Settings
          </DzMenuItem>
          <DzMenuItem @click="activeItem = 'logout'">
            <template #icon><LogOut class="h-4 w-4" /></template>
            Logout
          </DzMenuItem>
        </DzMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Settings, Users },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Tab through the menu items to see focus rings. Active items use
          <code>aria-current="page"</code>. Disabled items have <code>aria-disabled</code>.
        </p>
        <DzMenu aria-label="Accessible navigation" class="w-64">
          <DzMenuItem active>
            <template #icon><Home class="h-4 w-4" /></template>
            Active (aria-current)
          </DzMenuItem>
          <DzMenuItem>
            <template #icon><Users class="h-4 w-4" /></template>
            Focusable
          </DzMenuItem>
          <DzMenuItem disabled>
            <template #icon><Settings class="h-4 w-4" /></template>
            Disabled (aria-disabled)
          </DzMenuItem>
        </DzMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Sidebar Navigation
// ---------------------------------------------------------------------------

export const RealWorldSidebar: Story = {
  name: 'Real World: Sidebar Navigation',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator, Home, Users, BarChart3, FileText, Settings, Bell, LogOut },
    data() {
      return { active: 'dashboard' }
    },
    template: `
      <div class="w-64 border-r min-h-[400px] p-4">
        <div class="mb-6">
          <p class="text-sm font-bold">Acme Inc.</p>
          <p class="text-xs text-gray-500">Enterprise Dashboard</p>
        </div>
        <DzMenu aria-label="Main navigation">
          <DzMenuItem :active="active === 'dashboard'" @click="active = 'dashboard'">
            <template #icon><Home class="h-4 w-4" /></template>
            Dashboard
          </DzMenuItem>
          <DzMenuItem :active="active === 'analytics'" @click="active = 'analytics'">
            <template #icon><BarChart3 class="h-4 w-4" /></template>
            Analytics
          </DzMenuItem>
          <DzMenuItem :active="active === 'users'" @click="active = 'users'">
            <template #icon><Users class="h-4 w-4" /></template>
            Users
          </DzMenuItem>
          <DzMenuItem :active="active === 'documents'" @click="active = 'documents'">
            <template #icon><FileText class="h-4 w-4" /></template>
            Documents
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem :active="active === 'notifications'" @click="active = 'notifications'">
            <template #icon><Bell class="h-4 w-4" /></template>
            Notifications
          </DzMenuItem>
          <DzMenuItem :active="active === 'settings'" @click="active = 'settings'">
            <template #icon><Settings class="h-4 w-4" /></template>
            Settings
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem @click="active = 'logout'">
            <template #icon><LogOut class="h-4 w-4" /></template>
            Logout
          </DzMenuItem>
        </DzMenu>
      </div>
    `,
  }),
}
