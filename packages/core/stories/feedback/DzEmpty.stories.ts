import type { Meta, StoryObj } from '@storybook/vue3'
import { FileX, FolderOpen, Inbox, Search } from 'lucide-vue-next'
import { DzEmpty } from '../../src/components/feedback'

/**
 * DzEmpty displays an empty state placeholder when content is unavailable
 * or a list has no items.
 *
 * It supports title, description, icon props, and slots for custom content,
 * custom icon, and action buttons.
 */
const meta = {
  title: 'Core/Feedback/DzEmpty',
  component: DzEmpty,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    title: {
      control: 'text',
      description: 'Title text for the empty state',
      table: { category: 'Behavior' },
    },
    description: {
      control: 'text',
      description: 'Description text for additional context',
      table: { category: 'Behavior' },
    },
    icon: {
      control: false,
      description: 'Icon component to display',
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
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
} satisfies Meta<typeof DzEmpty>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzEmpty },
    setup() {
      return { args }
    },
    template: '<DzEmpty v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// With Icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  name: 'With Icon',
  render: () => ({
    components: { DzEmpty },
    setup() { return { Search, Inbox, FileX } },
    template: `
      <div class="space-y-8">
        <DzEmpty title="No search results" description="Try different keywords." :icon="Search" />
        <DzEmpty title="Inbox empty" description="You're all caught up." :icon="Inbox" />
        <DzEmpty title="No files" description="Upload your first file to get started." :icon="FileX" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Actions
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: 'With Action Buttons',
  render: () => ({
    components: { DzEmpty },
    setup() { return { Search } },
    template: `
      <DzEmpty title="No results found" description="Try adjusting your search criteria." :icon="Search">
        <template #actions>
          <button class="px-4 py-2 text-sm font-medium border rounded">Clear Filters</button>
          <button class="px-4 py-2 text-sm font-medium border rounded">Browse All</button>
        </template>
      </DzEmpty>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Slots',
  render: () => ({
    components: { DzEmpty },
    template: `
      <DzEmpty>
        <template #icon>
          <div class="text-6xl">&#128269;</div>
        </template>
        <div class="space-y-2 text-center">
          <h3 class="text-lg font-semibold">Custom slot content</h3>
          <p class="text-sm text-gray-500">The default slot overrides title/description/icon entirely.</p>
        </div>
        <template #actions>
          <button class="px-4 py-2 text-sm font-medium border rounded">Action</button>
        </template>
      </DzEmpty>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzEmpty },
    setup() { return { FolderOpen } },
    data() {
      return { items: [] as string[] }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <div class="flex gap-3">
          <button class="px-3 py-1.5 text-sm border rounded" @click="items.push('Item ' + (items.length + 1))">Add Item</button>
          <button class="px-3 py-1.5 text-sm border rounded" @click="items = []">Clear All</button>
        </div>
        <div class="border rounded p-4 min-h-[200px]">
          <ul v-if="items.length" class="space-y-2">
            <li v-for="item in items" :key="item" class="text-sm p-2 border rounded">{{ item }}</li>
          </ul>
          <DzEmpty
            v-else
            title="No items yet"
            description="Click 'Add Item' to get started."
            :icon="FolderOpen"
          />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role="status"',
  render: () => ({
    components: { DzEmpty },
    setup() { return { Inbox } },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzEmpty uses role="status" to announce the empty state to screen readers.
          This ensures dynamic changes (e.g., filtering to zero results) are
          communicated to assistive technology.
        </p>
        <DzEmpty title="No messages" description="Your inbox is empty." :icon="Inbox" />
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
    components: { DzEmpty },
    setup() { return { Search } },
    template: `
      <DzEmpty title="No results" description="Try a different search term." :icon="Search">
        <template #actions>
          <button class="px-4 py-2 text-sm font-medium border rounded">Clear Search</button>
        </template>
      </DzEmpty>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Empty Table
// ---------------------------------------------------------------------------

export const RealWorldEmptyTable: Story = {
  name: 'Real World: Empty Table',
  render: () => ({
    components: { DzEmpty },
    setup() { return { FileX } },
    template: `
      <div class="border rounded max-w-lg">
        <div class="flex items-center justify-between p-3 border-b bg-gray-50 text-sm font-medium">
          <span>Name</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        <div class="py-8">
          <DzEmpty
            title="No records found"
            description="There are no entries matching your criteria."
            :icon="FileX"
          >
            <template #actions>
              <button class="px-3 py-1.5 text-sm font-medium border rounded">Create New</button>
            </template>
          </DzEmpty>
        </div>
      </div>
    `,
  }),
}
