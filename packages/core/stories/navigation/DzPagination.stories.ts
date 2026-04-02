import type { Meta, StoryObj } from '@storybook/vue3'
import { DzPagination } from '../../src/components/navigation'

/**
 * DzPagination provides page navigation using Reka UI Pagination primitives.
 *
 * It supports five canonical sizes, first/last edge buttons, configurable sibling counts,
 * disabled state, and v-model binding for the current page.
 */
const meta = {
  title: 'Core/Navigation/DzPagination',
  component: DzPagination,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modelValue: {
      control: 'number',
      description: 'Current page (v-model)',
      table: { category: 'Behavior' },
    },
    total: {
      control: 'number',
      description: 'Total number of items',
      table: { category: 'Behavior' },
    },
    pageSize: {
      control: 'number',
      description: 'Number of items per page',
      table: { category: 'Behavior', defaultValue: { summary: '10' } },
    },
    siblingCount: {
      control: 'number',
      description: 'Number of visible page numbers around the current page',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    showEdges: {
      control: 'boolean',
      description: 'Whether to show first/last page buttons',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
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
      table: { category: 'Accessibility', defaultValue: { summary: 'Pagination' } },
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
    total: 100,
    pageSize: 10,
    siblingCount: 1,
    showEdges: false,
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzPagination>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzPagination },
    setup() {
      return { args }
    },
    data() {
      return { page: 1 }
    },
    template: '<DzPagination v-bind="args" v-model="page" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzPagination },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 uppercase">{{ size }}</p>
          <DzPagination :total="100" :size="size" :model-value="3" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Edge Buttons
// ---------------------------------------------------------------------------

export const WithEdgeButtons: Story = {
  name: 'With First/Last Buttons',
  render: () => ({
    components: { DzPagination },
    data() {
      return { page: 5 }
    },
    template: `
      <DzPagination v-model="page" :total="200" :page-size="10" show-edges />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Sibling Counts
// ---------------------------------------------------------------------------

export const SiblingCounts: Story = {
  name: 'Different Sibling Counts',
  render: () => ({
    components: { DzPagination },
    template: `
      <div class="space-y-6">
        <div v-for="count in [0, 1, 2, 3]" :key="count">
          <p class="text-sm font-medium mb-2">siblingCount={{ count }}</p>
          <DzPagination :total="200" :page-size="10" :sibling-count="count" :model-value="10" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    total: 100,
  },
  render: args => ({
    components: { DzPagination },
    setup() {
      return { args }
    },
    template: '<DzPagination v-bind="args" :model-value="3" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzPagination },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Default</p>
          <DzPagination :total="100" :model-value="1" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Middle page</p>
          <DzPagination :total="100" :model-value="5" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Last page</p>
          <DzPagination :total="100" :model-value="10" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Disabled</p>
          <DzPagination :total="100" :model-value="3" disabled />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Few Pages
// ---------------------------------------------------------------------------

export const FewPages: Story = {
  name: 'Few Pages (No Ellipsis)',
  render: () => ({
    components: { DzPagination },
    data() {
      return { page: 1 }
    },
    template: '<DzPagination v-model="page" :total="30" :page-size="10" />',
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
    components: { DzPagination },
    template: `
      <div class="space-y-6">
        <DzPagination :total="100" :model-value="5" />
        <DzPagination :total="200" :model-value="10" show-edges />
        <DzPagination :total="100" :model-value="3" disabled />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzPagination },
    data() {
      return { page: 1 }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Current page: <code>{{ page }}</code></p>
        <DzPagination v-model="page" :total="200" :page-size="10" show-edges />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Navigation',
  render: () => ({
    components: { DzPagination },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The pagination renders inside a <code>&lt;nav&gt;</code> with <code>aria-label="Pagination"</code>.
          Each page button uses <code>aria-current="page"</code> for the active page.
          First/last/prev/next buttons have descriptive aria-labels.
        </p>
        <DzPagination
          :total="100"
          :model-value="5"
          show-edges
          aria-label="Search results pagination"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Table Pagination
// ---------------------------------------------------------------------------

export const RealWorldTablePagination: Story = {
  name: 'Real World: Table Pagination',
  render: () => ({
    components: { DzPagination },
    data() {
      return { page: 1, total: 247, pageSize: 25 }
    },
    template: `
      <div class="space-y-4">
        <div class="border rounded p-4 text-sm text-gray-500">
          Showing {{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, total) }} of {{ total }} results
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">{{ Math.ceil(total / pageSize) }} pages</p>
          <DzPagination v-model="page" :total="total" :page-size="pageSize" show-edges />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Blog Post Navigation
// ---------------------------------------------------------------------------

export const RealWorldBlogNavigation: Story = {
  name: 'Real World: Blog Navigation',
  render: () => ({
    components: { DzPagination },
    data() {
      return { page: 1 }
    },
    template: `
      <div class="max-w-md mx-auto text-center space-y-4">
        <h3 class="text-lg font-semibold">Latest Articles</h3>
        <p class="text-sm text-gray-500">Page {{ page }} of 12</p>
        <DzPagination v-model="page" :total="120" :page-size="10" size="sm" />
      </div>
    `,
  }),
}
