import type { Meta, StoryObj } from '@storybook/vue3'
import { DzList, DzListItem } from '../../src/components/data'

/**
 * DzList is a compound list component supporting three visual variants
 * (`plain`, `bordered`, `divided`), ordered/unordered rendering,
 * and interactive (clickable) items.
 *
 * DzList provides context to DzListItem children via inject (ADR-08).
 * Items support prefix/suffix slots for icons, badges, and actions.
 */

const meta = {
  title: 'Core/Data/DzList',
  component: DzList,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['plain', 'bordered', 'divided'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'plain' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    ordered: {
      control: 'boolean',
      description: 'Renders as an ordered list (ol instead of ul)',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    // Behavior
    interactive: {
      control: 'boolean',
      description: 'Whether list items are interactive (clickable)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
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
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'plain',
    size: 'md',
    ordered: false,
    interactive: false,
    loading: false,
  },
} satisfies Meta<typeof DzList>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzList, DzListItem },
    setup() {
      return { args }
    },
    template: `
      <DzList v-bind="args" aria-label="Fruits list">
        <DzListItem>Apples</DzListItem>
        <DzListItem>Bananas</DzListItem>
        <DzListItem>Cherries</DzListItem>
        <DzListItem>Dates</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <div class="flex flex-wrap gap-8">
        <div v-for="v in ['plain', 'bordered', 'divided']" :key="v" class="w-64">
          <p class="text-sm font-medium mb-2 capitalize">{{ v }}</p>
          <DzList :variant="v" :aria-label="v + ' list'">
            <DzListItem>First item</DzListItem>
            <DzListItem>Second item</DzListItem>
            <DzListItem>Third item</DzListItem>
          </DzList>
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
    components: { DzList, DzListItem },
    template: `
      <div class="space-y-6">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzList :size="s" variant="divided" :aria-label="s + ' list'">
            <DzListItem>First item</DzListItem>
            <DzListItem>Second item</DzListItem>
            <DzListItem>Third item</DzListItem>
          </DzList>
        </div>
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
    components: { DzList, DzListItem },
    template: `
      <div class="flex flex-wrap gap-6">
        <div v-for="t in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="t" class="w-56">
          <p class="text-sm font-medium mb-2 capitalize">{{ t }}</p>
          <DzList :tone="t" variant="bordered" :aria-label="t + ' list'">
            <DzListItem>First item</DzListItem>
            <DzListItem>Second item</DzListItem>
            <DzListItem>Third item</DzListItem>
          </DzList>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Ordered List
// ---------------------------------------------------------------------------

export const Ordered: Story = {
  name: 'Ordered List',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList ordered variant="divided" aria-label="Ordered steps">
        <DzListItem>Clone the repository</DzListItem>
        <DzListItem>Install dependencies</DzListItem>
        <DzListItem>Run the development server</DzListItem>
        <DzListItem>Open the browser</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive List
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzList, DzListItem },
    data() {
      return { selected: '' }
    },
    template: `
      <div class="space-y-3">
        <DzList interactive variant="bordered" aria-label="Selectable items">
          <DzListItem
            v-for="item in ['Dashboard', 'Settings', 'Profile', 'Notifications']"
            :key="item"
            :active="selected === item"
            @click="selected = item"
          >{{ item }}</DzListItem>
        </DzList>
        <p class="text-sm text-gray-500">Selected: {{ selected || 'none' }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix and Suffix Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Prefix & Suffix Slots',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList variant="divided" aria-label="Contact list">
        <DzListItem>
          <template #prefix>
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">AJ</div>
          </template>
          Alice Johnson
          <template #suffix>
            <span class="text-xs text-gray-400">Online</span>
          </template>
        </DzListItem>
        <DzListItem>
          <template #prefix>
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">BS</div>
          </template>
          Bob Smith
          <template #suffix>
            <span class="text-xs text-gray-400">Away</span>
          </template>
        </DzListItem>
        <DzListItem disabled>
          <template #prefix>
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-400">CL</div>
          </template>
          Charlie Lee
          <template #suffix>
            <span class="text-xs text-gray-400">Offline</span>
          </template>
        </DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Item Tones
// ---------------------------------------------------------------------------

export const ItemTones: Story = {
  name: 'Item-Level Tones',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList variant="divided" aria-label="Notifications">
        <DzListItem tone="success">Build succeeded</DzListItem>
        <DzListItem tone="warning">Disk space low</DzListItem>
        <DzListItem tone="danger">Deployment failed</DzListItem>
        <DzListItem tone="info">New version available</DzListItem>
        <DzListItem tone="primary">Feature request submitted</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Items
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  name: 'Disabled Items',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <DzList interactive variant="bordered" aria-label="Navigation with disabled items">
        <DzListItem>Dashboard</DzListItem>
        <DzListItem disabled>Analytics (Coming Soon)</DzListItem>
        <DzListItem>Settings</DzListItem>
        <DzListItem disabled>Admin Panel (No Access)</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: args => ({
    components: { DzList, DzListItem },
    setup() {
      return { args }
    },
    template: `
      <DzList v-bind="args" variant="divided" aria-label="Loading list">
        <DzListItem>Item 1</DzListItem>
        <DzListItem>Item 2</DzListItem>
        <DzListItem>Item 3</DzListItem>
      </DzList>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

export const Empty: Story = {
  name: 'Empty State',
  render: () => ({
    components: { DzList },
    template: `
      <DzList variant="bordered" aria-label="Empty list">
        <template #empty>
          <div class="text-center py-6 text-gray-500">
            No items yet. Add your first item to get started.
          </div>
        </template>
      </DzList>
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
    components: { DzList, DzListItem },
    template: `
      <div class="flex gap-8">
        <div class="w-64">
          <DzList variant="divided" aria-label="Dark mode list">
            <DzListItem>Dashboard</DzListItem>
            <DzListItem>Settings</DzListItem>
            <DzListItem>Profile</DzListItem>
          </DzList>
        </div>
        <div class="w-64">
          <DzList variant="bordered" interactive aria-label="Dark mode interactive list">
            <DzListItem active>Active Item</DzListItem>
            <DzListItem>Normal Item</DzListItem>
            <DzListItem disabled>Disabled Item</DzListItem>
          </DzList>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Interactive lists support keyboard navigation. Tab into the list,
          then use Arrow Up/Down to move between items. Enter or Space activates the focused item.
          Disabled items are skipped during keyboard navigation.
        </p>
        <DzList interactive variant="bordered" aria-label="Keyboard-navigable list">
          <DzListItem>First item (focusable)</DzListItem>
          <DzListItem disabled>Second item (disabled, skipped)</DzListItem>
          <DzListItem>Third item (focusable)</DzListItem>
          <DzListItem>Fourth item (focusable)</DzListItem>
        </DzList>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Menu
// ---------------------------------------------------------------------------

export const RealWorldSettingsMenu: Story = {
  name: 'Real World: Settings Menu',
  render: () => ({
    components: { DzList, DzListItem },
    data() {
      return { active: 'General' }
    },
    template: `
      <div class="max-w-xs">
        <DzList interactive variant="divided" aria-label="Settings navigation">
          <DzListItem
            v-for="section in ['General', 'Security', 'Notifications', 'Integrations', 'Billing']"
            :key="section"
            :active="active === section"
            @click="active = section"
          >
            <template #suffix>
              <span class="text-gray-400">&rsaquo;</span>
            </template>
            {{ section }}
          </DzListItem>
        </DzList>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Activity Feed
// ---------------------------------------------------------------------------

export const RealWorldActivityFeed: Story = {
  name: 'Real World: Activity Feed',
  render: () => ({
    components: { DzList, DzListItem },
    template: `
      <div class="max-w-md">
        <DzList variant="divided" aria-label="Recent activity">
          <DzListItem tone="success">
            <template #prefix>
              <div class="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
            </template>
            <div>
              <p class="text-sm font-medium">Build #42 passed</p>
              <p class="text-xs text-gray-400">2 minutes ago</p>
            </div>
          </DzListItem>
          <DzListItem tone="danger">
            <template #prefix>
              <div class="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
            </template>
            <div>
              <p class="text-sm font-medium">Deployment failed on staging</p>
              <p class="text-xs text-gray-400">15 minutes ago</p>
            </div>
          </DzListItem>
          <DzListItem tone="info">
            <template #prefix>
              <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
            </template>
            <div>
              <p class="text-sm font-medium">PR #128 merged by Alice</p>
              <p class="text-xs text-gray-400">1 hour ago</p>
            </div>
          </DzListItem>
        </DzList>
      </div>
    `,
  }),
}
