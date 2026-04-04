import type { Meta, StoryObj } from '@storybook/vue3'
import { BarChart3, Home, LogOut, Settings, Shield, Users } from 'lucide-vue-next'
import {
  DzMenu,
  DzMenuItem,
  DzMenuSeparator,
} from '../../src/components/navigation'

/**
 * DzMenu compound sub-parts: DzMenuItem and DzMenuSeparator.
 *
 * DzMenuItem is a clickable navigation item that supports active/disabled states,
 * an icon slot, and optional href for link rendering. DzMenuSeparator is a
 * visual divider between menu groups.
 *
 * Both receive size and collapsed context from DzMenu via inject (ADR-08).
 */

const meta = {
  title: 'Core/Navigation/DzMenuParts',
  component: DzMenuItem,
  subcomponents: { DzMenuSeparator },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Whether this item is currently active/selected',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether this item is disabled',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    href: {
      control: 'text',
      description: 'URL to navigate to (renders as <a>)',
      table: { category: 'Behavior' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
} satisfies Meta<typeof DzMenuItem>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Items in context
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    setup() { return { Home, Settings, Users } },
    template: `
      <DzMenu class="w-56" aria-label="Main navigation">
        <DzMenuItem active>
          <template #icon><Home class="w-4 h-4" /></template>
          Dashboard
        </DzMenuItem>
        <DzMenuItem>
          <template #icon><Users class="w-4 h-4" /></template>
          Team
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>
          <template #icon><Settings class="w-4 h-4" /></template>
          Settings
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive Selection
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive Selection',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    setup() { return { Home, Users, BarChart3, Settings, Shield, LogOut } },
    data() {
      return { active: 'dashboard' }
    },
    template: `
      <div class="flex gap-8">
        <DzMenu class="w-56" aria-label="App navigation">
          <DzMenuItem :active="active === 'dashboard'" @click="active = 'dashboard'">
            <template #icon><Home class="w-4 h-4" /></template>
            Dashboard
          </DzMenuItem>
          <DzMenuItem :active="active === 'team'" @click="active = 'team'">
            <template #icon><Users class="w-4 h-4" /></template>
            Team
          </DzMenuItem>
          <DzMenuItem :active="active === 'analytics'" @click="active = 'analytics'">
            <template #icon><BarChart3 class="w-4 h-4" /></template>
            Analytics
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem :active="active === 'settings'" @click="active = 'settings'">
            <template #icon><Settings class="w-4 h-4" /></template>
            Settings
          </DzMenuItem>
          <DzMenuItem :active="active === 'security'" @click="active = 'security'">
            <template #icon><Shield class="w-4 h-4" /></template>
            Security
          </DzMenuItem>
          <DzMenuSeparator />
          <DzMenuItem disabled>
            <template #icon><LogOut class="w-4 h-4" /></template>
            Sign Out
          </DzMenuItem>
        </DzMenu>
        <p class="text-sm text-gray-500">Active: {{ active }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Items
// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  name: 'Disabled Items',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    setup() { return { Home, Settings, Shield } },
    template: `
      <DzMenu class="w-56" aria-label="Menu with disabled items">
        <DzMenuItem active>
          <template #icon><Home class="w-4 h-4" /></template>
          Dashboard
        </DzMenuItem>
        <DzMenuItem disabled>
          <template #icon><Shield class="w-4 h-4" /></template>
          Admin (No Access)
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>
          <template #icon><Settings class="w-4 h-4" /></template>
          Settings
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Collapsed Mode (Icon Only)
// ---------------------------------------------------------------------------

export const CollapsedMode: Story = {
  name: 'Collapsed Mode (Icon Only)',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    setup() { return { Home, Users, Settings } },
    template: `
      <DzMenu collapsed class="w-12" aria-label="Collapsed navigation">
        <DzMenuItem active>
          <template #icon><Home class="w-4 h-4" /></template>
          Dashboard
        </DzMenuItem>
        <DzMenuItem>
          <template #icon><Users class="w-4 h-4" /></template>
          Team
        </DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>
          <template #icon><Settings class="w-4 h-4" /></template>
          Settings
        </DzMenuItem>
      </DzMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Separator Usage
// ---------------------------------------------------------------------------

export const SeparatorUsage: Story = {
  name: 'Separator Between Groups',
  render: () => ({
    components: { DzMenu, DzMenuItem, DzMenuSeparator },
    template: `
      <DzMenu class="w-56" aria-label="Grouped menu">
        <DzMenuItem active>Home</DzMenuItem>
        <DzMenuItem>Profile</DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>Projects</DzMenuItem>
        <DzMenuItem>Tasks</DzMenuItem>
        <DzMenuSeparator />
        <DzMenuItem>Help</DzMenuItem>
        <DzMenuItem>About</DzMenuItem>
      </DzMenu>
    `,
  }),
}
