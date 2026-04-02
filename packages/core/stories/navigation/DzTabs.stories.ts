import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
} from '../../src/components/navigation'

/**
 * DzTabs is a compound tabbed-interface component built on Reka UI primitives.
 *
 * It supports three visual variants (`line`, `enclosed`, `pills`),
 * five canonical sizes, horizontal/vertical orientation,
 * and automatic or manual activation modes.
 *
 * Compound children: `DzTabList`, `DzTabTrigger`, `DzTabContent`.
 */
const meta = {
  title: 'Core/Navigation/DzTabs',
  component: DzTabs,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['line', 'enclosed', 'pills'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'line' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    // Behavior
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
      description: 'Tab activation mode: automatic (on focus) or manual (on click)',
      table: { category: 'Behavior', defaultValue: { summary: 'automatic' } },
    },
    modelValue: {
      control: 'text',
      description: 'Active tab value (v-model)',
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
    variant: 'line',
    size: 'md',
    orientation: 'horizontal',
    activationMode: 'automatic',
  },
} satisfies Meta<typeof DzTabs>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    setup() {
      return { args }
    },
    template: `
      <DzTabs v-bind="args" model-value="account">
        <DzTabList>
          <DzTabTrigger value="account">Account</DzTabTrigger>
          <DzTabTrigger value="password">Password</DzTabTrigger>
          <DzTabTrigger value="notifications">Notifications</DzTabTrigger>
        </DzTabList>
        <DzTabContent value="account">
          <p class="p-4 text-sm">Manage your account settings and preferences.</p>
        </DzTabContent>
        <DzTabContent value="password">
          <p class="p-4 text-sm">Change your password and security settings.</p>
        </DzTabContent>
        <DzTabContent value="notifications">
          <p class="p-4 text-sm">Configure notification preferences.</p>
        </DzTabContent>
      </DzTabs>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-8">
        <div v-for="variant in ['line', 'enclosed', 'pills']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">{{ variant }}</p>
          <DzTabs :variant="variant" model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">Overview</DzTabTrigger>
              <DzTabTrigger value="tab2">Details</DzTabTrigger>
              <DzTabTrigger value="tab3">Settings</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">
              <p class="p-4 text-sm">Overview content for {{ variant }} variant.</p>
            </DzTabContent>
            <DzTabContent value="tab2">
              <p class="p-4 text-sm">Details content for {{ variant }} variant.</p>
            </DzTabContent>
            <DzTabContent value="tab3">
              <p class="p-4 text-sm">Settings content for {{ variant }} variant.</p>
            </DzTabContent>
          </DzTabs>
        </div>
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
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-8">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 uppercase">{{ size }}</p>
          <DzTabs :size="size" model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">First</DzTabTrigger>
              <DzTabTrigger value="tab2">Second</DzTabTrigger>
              <DzTabTrigger value="tab3">Third</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">
              <p class="p-4 text-sm">Content at size {{ size }}.</p>
            </DzTabContent>
          </DzTabs>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical Orientation
// ---------------------------------------------------------------------------

export const VerticalOrientation: Story = {
  name: 'Vertical Orientation',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-8">
        <div v-for="variant in ['line', 'enclosed', 'pills']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">Vertical {{ variant }}</p>
          <DzTabs :variant="variant" orientation="vertical" model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">General</DzTabTrigger>
              <DzTabTrigger value="tab2">Privacy</DzTabTrigger>
              <DzTabTrigger value="tab3">Advanced</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">
              <p class="p-4 text-sm">General settings panel.</p>
            </DzTabContent>
            <DzTabContent value="tab2">
              <p class="p-4 text-sm">Privacy settings panel.</p>
            </DzTabContent>
            <DzTabContent value="tab3">
              <p class="p-4 text-sm">Advanced settings panel.</p>
            </DzTabContent>
          </DzTabs>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Tab
// ---------------------------------------------------------------------------

export const DisabledTab: Story = {
  name: 'Disabled Tab',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <DzTabs model-value="tab1">
        <DzTabList>
          <DzTabTrigger value="tab1">Active</DzTabTrigger>
          <DzTabTrigger value="tab2" disabled>Disabled</DzTabTrigger>
          <DzTabTrigger value="tab3">Available</DzTabTrigger>
        </DzTabList>
        <DzTabContent value="tab1">
          <p class="p-4 text-sm">The second tab is disabled and cannot be selected.</p>
        </DzTabContent>
        <DzTabContent value="tab3">
          <p class="p-4 text-sm">Third tab content.</p>
        </DzTabContent>
      </DzTabs>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-sm font-medium mb-2">Default (all enabled)</p>
          <DzTabs model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
              <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
            </DzTabList>
          </DzTabs>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">With disabled tabs</p>
          <DzTabs model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">Enabled</DzTabTrigger>
              <DzTabTrigger value="tab2" disabled>Disabled</DzTabTrigger>
              <DzTabTrigger value="tab3">Enabled</DzTabTrigger>
            </DzTabList>
          </DzTabs>
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
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-8">
        <div v-for="variant in ['line', 'enclosed', 'pills']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize text-[var(--dz-foreground)]">{{ variant }}</p>
          <DzTabs :variant="variant" model-value="tab1">
            <DzTabList>
              <DzTabTrigger value="tab1">Overview</DzTabTrigger>
              <DzTabTrigger value="tab2">Details</DzTabTrigger>
              <DzTabTrigger value="tab3" disabled>Disabled</DzTabTrigger>
            </DzTabList>
            <DzTabContent value="tab1">
              <p class="p-4 text-sm text-[var(--dz-foreground)]">Dark mode {{ variant }} content.</p>
            </DzTabContent>
          </DzTabs>
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
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    data() {
      return { activeTab: 'tab1' }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Active tab: <code>{{ activeTab }}</code></p>
        <DzTabs v-model="activeTab" @change="(v) => {}">
          <DzTabList>
            <DzTabTrigger value="tab1">Account</DzTabTrigger>
            <DzTabTrigger value="tab2">Billing</DzTabTrigger>
            <DzTabTrigger value="tab3">Team</DzTabTrigger>
          </DzTabList>
          <DzTabContent value="tab1">
            <p class="p-4 text-sm">Account settings and profile information.</p>
          </DzTabContent>
          <DzTabContent value="tab2">
            <p class="p-4 text-sm">Billing history and payment methods.</p>
          </DzTabContent>
          <DzTabContent value="tab3">
            <p class="p-4 text-sm">Team members and role management.</p>
          </DzTabContent>
        </DzTabs>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Keyboard Navigation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Use <kbd class="px-1 py-0.5 rounded border text-xs">Arrow Left</kbd> /
          <kbd class="px-1 py-0.5 rounded border text-xs">Arrow Right</kbd> to navigate tabs.
          <kbd class="px-1 py-0.5 rounded border text-xs">Tab</kbd> moves focus into content.
        </p>
        <DzTabs model-value="tab1" aria-label="Keyboard navigation demo">
          <DzTabList>
            <DzTabTrigger value="tab1">First</DzTabTrigger>
            <DzTabTrigger value="tab2">Second</DzTabTrigger>
            <DzTabTrigger value="tab3" disabled>Disabled</DzTabTrigger>
            <DzTabTrigger value="tab4">Fourth</DzTabTrigger>
          </DzTabList>
          <DzTabContent value="tab1">
            <p class="p-4 text-sm">Focus the tab list, then arrow-key between triggers. Disabled tabs are skipped.</p>
          </DzTabContent>
          <DzTabContent value="tab2">
            <p class="p-4 text-sm">Second panel content.</p>
          </DzTabContent>
          <DzTabContent value="tab4">
            <p class="p-4 text-sm">Fourth panel content.</p>
          </DzTabContent>
        </DzTabs>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Page
// ---------------------------------------------------------------------------

export const RealWorldSettingsPage: Story = {
  name: 'Real World: Settings Page',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="max-w-2xl">
        <h2 class="text-lg font-semibold mb-4">Settings</h2>
        <DzTabs variant="enclosed" model-value="general">
          <DzTabList>
            <DzTabTrigger value="general">General</DzTabTrigger>
            <DzTabTrigger value="security">Security</DzTabTrigger>
            <DzTabTrigger value="integrations">Integrations</DzTabTrigger>
            <DzTabTrigger value="billing">Billing</DzTabTrigger>
          </DzTabList>
          <DzTabContent value="general">
            <div class="p-4 space-y-3 text-sm">
              <p class="font-medium">General Settings</p>
              <p>Configure your application name, timezone, and language preferences.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="security">
            <div class="p-4 space-y-3 text-sm">
              <p class="font-medium">Security Settings</p>
              <p>Two-factor authentication, session management, and API keys.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="integrations">
            <div class="p-4 space-y-3 text-sm">
              <p class="font-medium">Integrations</p>
              <p>Connect third-party services and manage webhooks.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="billing">
            <div class="p-4 space-y-3 text-sm">
              <p class="font-medium">Billing</p>
              <p>Manage your subscription, payment methods, and invoices.</p>
            </div>
          </DzTabContent>
        </DzTabs>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Vertical Sidebar Navigation
// ---------------------------------------------------------------------------

export const RealWorldVerticalSidebar: Story = {
  name: 'Real World: Vertical Sidebar Navigation',
  render: () => ({
    components: { DzTabs, DzTabList, DzTabTrigger, DzTabContent },
    template: `
      <div class="max-w-3xl border rounded-lg overflow-hidden">
        <DzTabs variant="pills" orientation="vertical" model-value="profile" class="min-h-[300px]">
          <DzTabList class="w-48 p-4 border-r bg-[var(--dz-muted)]">
            <DzTabTrigger value="profile">Profile</DzTabTrigger>
            <DzTabTrigger value="appearance">Appearance</DzTabTrigger>
            <DzTabTrigger value="notifications">Notifications</DzTabTrigger>
            <DzTabTrigger value="advanced">Advanced</DzTabTrigger>
          </DzTabList>
          <DzTabContent value="profile">
            <div class="p-6 text-sm">
              <h3 class="font-semibold mb-2">Profile Settings</h3>
              <p>Update your name, email, and avatar.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="appearance">
            <div class="p-6 text-sm">
              <h3 class="font-semibold mb-2">Appearance</h3>
              <p>Theme, density, and font preferences.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="notifications">
            <div class="p-6 text-sm">
              <h3 class="font-semibold mb-2">Notifications</h3>
              <p>Email, push, and in-app notification settings.</p>
            </div>
          </DzTabContent>
          <DzTabContent value="advanced">
            <div class="p-6 text-sm">
              <h3 class="font-semibold mb-2">Advanced</h3>
              <p>Developer options and experimental features.</p>
            </div>
          </DzTabContent>
        </DzTabs>
      </div>
    `,
  }),
}
