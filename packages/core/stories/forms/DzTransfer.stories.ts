import type { Meta, StoryObj } from '@storybook/vue3'
import type { TransferItem } from '../../src/components/forms'
import { DzTransfer } from '../../src/components/forms'

const sampleSource: TransferItem[] = [
  { key: '1', label: 'JavaScript' },
  { key: '2', label: 'TypeScript' },
  { key: '3', label: 'Python' },
  { key: '4', label: 'Rust' },
  { key: '5', label: 'Go' },
  { key: '6', label: 'Java' },
  { key: '7', label: 'C#', disabled: true },
  { key: '8', label: 'Ruby' },
]

/**
 * DzTransfer is a dual-list transfer component for moving items between source and target.
 *
 * Built from scratch (no Reka UI primitive). Supports searchable lists,
 * disabled items, custom item rendering, and five sizes.
 */
const meta = {
  title: 'Core/Forms/DzTransfer',
  component: DzTransfer,
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
    source: {
      control: 'object',
      description: 'All available source items',
      table: { category: 'Behavior' },
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search filtering in both lists',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder for search inputs',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // State
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    error: {
      control: 'text',
      description: 'Error message text',
      table: { category: 'State' },
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
  },
  args: {
    source: sampleSource,
    size: 'md',
    disabled: false,
    searchable: false,
  },
} satisfies Meta<typeof DzTransfer>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTransfer },
    setup() {
      return { args }
    },
    template: '<DzTransfer v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzTransfer },
    setup() {
      const small: TransferItem[] = [
        { key: '1', label: 'Item A' },
        { key: '2', label: 'Item B' },
        { key: '3', label: 'Item C' },
      ]
      return { small }
    },
    template: `
      <div class="space-y-8">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzTransfer :source="small" :size="size" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Searchable
// ---------------------------------------------------------------------------

export const Searchable: Story = {
  args: {
    searchable: true,
    searchPlaceholder: 'Filter...',
  },
  render: args => ({
    components: { DzTransfer },
    setup() {
      return { args }
    },
    template: '<DzTransfer v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzTransfer },
    setup() {
      return { args }
    },
    template: '<DzTransfer v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// With Disabled Items
// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  name: 'Disabled Items',
  render: () => ({
    components: { DzTransfer },
    setup() {
      return { source: sampleSource }
    },
    template: `
      <div>
        <p class="text-sm text-gray-500 mb-3">C# is disabled and cannot be transferred.</p>
        <DzTransfer :source="source" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select at least one item',
  },
  render: args => ({
    components: { DzTransfer },
    setup() {
      return { args }
    },
    template: '<DzTransfer v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzTransfer },
    setup() {
      const items: TransferItem[] = [
        { key: '1', label: 'Item A' },
        { key: '2', label: 'Item B' },
        { key: '3', label: 'Item C' },
      ]
      return { items }
    },
    template: `
      <div class="space-y-8">
        <div>
          <p class="text-sm mb-1">Default</p>
          <DzTransfer :source="items" />
        </div>
        <div>
          <p class="text-sm mb-1">Disabled</p>
          <DzTransfer :source="items" disabled />
        </div>
        <div>
          <p class="text-sm mb-1">Invalid</p>
          <DzTransfer :source="items" invalid error="Required" />
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
    components: { DzTransfer },
    setup() {
      return { source: sampleSource }
    },
    template: '<DzTransfer :source="source" searchable />',
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzTransfer },
    setup() {
      return { source: sampleSource }
    },
    data() {
      return { selected: [] as string[] }
    },
    template: `
      <div class="space-y-4">
        <DzTransfer :source="source" v-model="selected" searchable searchPlaceholder="Search..." />
        <p class="text-sm text-gray-500">
          Selected keys: <strong>{{ selected.length ? selected.join(', ') : 'none' }}</strong>
        </p>
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
    components: { DzTransfer },
    setup() {
      return { source: sampleSource }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab to navigate between lists and transfer buttons. Space/Enter to select items and trigger transfers.</p>
        <DzTransfer :source="source" aria-label="Language selection transfer" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Permission Assignment
// ---------------------------------------------------------------------------

export const RealWorldPermissions: Story = {
  name: 'Real World: Permission Assignment',
  render: () => ({
    components: { DzTransfer },
    setup() {
      const permissions: TransferItem[] = [
        { key: 'read', label: 'Read' },
        { key: 'write', label: 'Write' },
        { key: 'delete', label: 'Delete' },
        { key: 'admin', label: 'Admin' },
        { key: 'export', label: 'Export Data' },
        { key: 'import', label: 'Import Data' },
        { key: 'audit', label: 'View Audit Log' },
        { key: 'settings', label: 'Manage Settings' },
      ]
      return { permissions }
    },
    template: `
      <div>
        <h3 class="text-base font-semibold mb-3">Role Permissions</h3>
        <DzTransfer :source="permissions" searchable searchPlaceholder="Filter permissions..." aria-label="Role permissions" />
      </div>
    `,
  }),
}
