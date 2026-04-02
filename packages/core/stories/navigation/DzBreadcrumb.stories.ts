import type { Meta, StoryObj } from '@storybook/vue3'
import { ChevronRight } from 'lucide-vue-next'
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzBreadcrumbSeparator,
} from '../../src/components/navigation'

/**
 * DzBreadcrumb is a compound breadcrumb navigation component built from scratch.
 *
 * It renders a semantic `<nav>` with an ordered list for accessible breadcrumb trails.
 * Separator context is provided to children via inject (ADR-08).
 *
 * Compound children: `DzBreadcrumbItem`, `DzBreadcrumbSeparator`.
 */
const meta = {
  title: 'Core/Navigation/DzBreadcrumb',
  component: DzBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    separator: {
      control: 'text',
      description: 'Separator character displayed between breadcrumb items',
      table: { category: 'Behavior', defaultValue: { summary: '/' } },
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
      table: { category: 'Accessibility', defaultValue: { summary: 'Breadcrumb' } },
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
    separator: '/',
  },
} satisfies Meta<typeof DzBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    setup() {
      return { args }
    },
    template: `
      <DzBreadcrumb v-bind="args">
        <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem current>Widget Pro</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Separators
// ---------------------------------------------------------------------------

export const CustomSeparators: Story = {
  name: 'Custom Separators',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Default separator (/)</p>
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/docs">Docs</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem current>Guide</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Arrow separator (>)</p>
          <DzBreadcrumb separator=">">
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/docs">Docs</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem current>Guide</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Pipe separator (|)</p>
          <DzBreadcrumb separator="|">
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/docs">Docs</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem current>Guide</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Per-separator override</p>
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator separator="~" />
            <DzBreadcrumbItem href="/docs">Docs</DzBreadcrumbItem>
            <DzBreadcrumbSeparator separator="~" />
            <DzBreadcrumbItem current>Guide</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Icon Separator (Slot)
// ---------------------------------------------------------------------------

export const IconSeparator: Story = {
  name: 'Icon Separator (Slot)',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator, ChevronRight },
    template: `
      <DzBreadcrumb>
        <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
        <DzBreadcrumbSeparator>
          <ChevronRight class="h-3.5 w-3.5" />
        </DzBreadcrumbSeparator>
        <DzBreadcrumbItem href="/components">Components</DzBreadcrumbItem>
        <DzBreadcrumbSeparator>
          <ChevronRight class="h-3.5 w-3.5" />
        </DzBreadcrumbSeparator>
        <DzBreadcrumbItem current>Breadcrumb</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Item
// ---------------------------------------------------------------------------

export const DisabledItem: Story = {
  name: 'Disabled Item',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <DzBreadcrumb>
        <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem href="/archive" disabled>Archive (disabled)</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem current>Document</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Link items</p>
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Current page (non-link)</p>
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem current>Current</DzBreadcrumbItem>
          </DzBreadcrumb>
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Disabled item</p>
          <DzBreadcrumb>
            <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
            <DzBreadcrumbSeparator />
            <DzBreadcrumbItem disabled>Disabled</DzBreadcrumbItem>
          </DzBreadcrumb>
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
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator, ChevronRight },
    template: `
      <div class="space-y-6">
        <DzBreadcrumb>
          <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/settings">Settings</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem current>Profile</DzBreadcrumbItem>
        </DzBreadcrumb>
        <DzBreadcrumb>
          <DzBreadcrumbItem href="/">Home</DzBreadcrumbItem>
          <DzBreadcrumbSeparator>
            <ChevronRight class="h-3.5 w-3.5" />
          </DzBreadcrumbSeparator>
          <DzBreadcrumbItem href="/products">Products</DzBreadcrumbItem>
          <DzBreadcrumbSeparator>
            <ChevronRight class="h-3.5 w-3.5" />
          </DzBreadcrumbSeparator>
          <DzBreadcrumbItem current>Widget</DzBreadcrumbItem>
        </DzBreadcrumb>
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
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The breadcrumb renders as a <code>&lt;nav&gt;</code> with <code>aria-label="Breadcrumb"</code>,
          containing an ordered list. The current page has <code>aria-current="page"</code>.
          Separators are marked <code>aria-hidden="true"</code>.
        </p>
        <DzBreadcrumb aria-label="File navigation">
          <DzBreadcrumbItem href="/">Root</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/documents">Documents</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem href="/documents/reports">Reports</DzBreadcrumbItem>
          <DzBreadcrumbSeparator />
          <DzBreadcrumbItem current>Q4 Summary</DzBreadcrumbItem>
        </DzBreadcrumb>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: E-Commerce Category Trail
// ---------------------------------------------------------------------------

export const RealWorldEcommerce: Story = {
  name: 'Real World: E-Commerce Category Trail',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator, ChevronRight },
    template: `
      <DzBreadcrumb aria-label="Product navigation">
        <DzBreadcrumbItem href="/">Shop</DzBreadcrumbItem>
        <DzBreadcrumbSeparator>
          <ChevronRight class="h-3.5 w-3.5" />
        </DzBreadcrumbSeparator>
        <DzBreadcrumbItem href="/electronics">Electronics</DzBreadcrumbItem>
        <DzBreadcrumbSeparator>
          <ChevronRight class="h-3.5 w-3.5" />
        </DzBreadcrumbSeparator>
        <DzBreadcrumbItem href="/electronics/laptops">Laptops</DzBreadcrumbItem>
        <DzBreadcrumbSeparator>
          <ChevronRight class="h-3.5 w-3.5" />
        </DzBreadcrumbSeparator>
        <DzBreadcrumbItem current>MacBook Pro 16"</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Admin Dashboard
// ---------------------------------------------------------------------------

export const RealWorldAdminDashboard: Story = {
  name: 'Real World: Admin Dashboard',
  render: () => ({
    components: { DzBreadcrumb, DzBreadcrumbItem, DzBreadcrumbSeparator },
    template: `
      <DzBreadcrumb separator="/">
        <DzBreadcrumbItem href="/admin">Dashboard</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem href="/admin/users">Users</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem href="/admin/users/42">John Doe</DzBreadcrumbItem>
        <DzBreadcrumbSeparator />
        <DzBreadcrumbItem current>Edit Profile</DzBreadcrumbItem>
      </DzBreadcrumb>
    `,
  }),
}
