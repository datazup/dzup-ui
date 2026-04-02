import type { Meta, StoryObj } from '@storybook/vue3'
import { DzGrid } from '../../src/components/layout'

/**
 * DzGrid is a CSS Grid layout component with responsive column support.
 *
 * It supports fixed column counts (1-6, 12), responsive column objects
 * with per-breakpoint values, configurable gap sizes, and explicit row counts.
 */
const meta = {
  title: 'Core/Layout/DzGrid',
  component: DzGrid,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    cols: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 12],
      description: 'Number of columns (or a responsive object)',
      table: { category: 'Appearance', defaultValue: { summary: '1' } },
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    rows: {
      control: 'number',
      description: 'Explicit number of grid rows',
      table: { category: 'Appearance' },
    },
    // Behavior
    as: {
      control: 'select',
      options: ['div', 'section', 'main', 'ul', 'ol'],
      description: 'HTML element to render as',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
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
    cols: 3,
    gap: 'md',
  },
} satisfies Meta<typeof DzGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Reusable grid item helper */
function gridItem(n: number) {
  return `<div class="bg-blue-100 text-blue-800 text-sm p-4 rounded text-center font-medium">${n}</div>`
}

function gridItems(count: number) {
  return Array.from({ length: count }, (_, i) => gridItem(i + 1)).join('\n        ')
}

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzGrid },
    setup() {
      return { args }
    },
    template: `
      <DzGrid v-bind="args">
        ${gridItems(6)}
      </DzGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Column Gallery
// ---------------------------------------------------------------------------

export const AllColumns: Story = {
  name: 'Column Gallery',
  render: () => ({
    components: { DzGrid },
    template: `
      <div class="space-y-6">
        <div v-for="c in [1, 2, 3, 4, 6, 12]" :key="c">
          <p class="text-xs text-gray-500 mb-2">cols={{ c }}</p>
          <DzGrid :cols="c" gap="sm">
            <div v-for="i in c" :key="i"
              class="bg-blue-100 text-blue-800 text-sm p-3 rounded text-center">
              {{ i }}
            </div>
          </DzGrid>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Gap Gallery
// ---------------------------------------------------------------------------

export const AllGaps: Story = {
  name: 'Gap Gallery',
  render: () => ({
    components: { DzGrid },
    template: `
      <div class="space-y-6">
        <div v-for="g in ['none', 'xs', 'sm', 'md', 'lg', 'xl']" :key="g">
          <p class="text-xs text-gray-500 mb-2">gap="{{ g }}"</p>
          <DzGrid :cols="4" :gap="g">
            <div v-for="i in 4" :key="i"
              class="bg-green-100 text-green-800 text-sm p-3 rounded text-center">
              {{ i }}
            </div>
          </DzGrid>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Responsive Columns
// ---------------------------------------------------------------------------

export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  render: () => ({
    components: { DzGrid },
    template: `
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          Resize the viewport: 1 col on mobile, 2 on sm, 3 on md, 4 on lg.
        </p>
        <DzGrid :cols="{ sm: 2, md: 3, lg: 4 }" gap="md">
          <div v-for="i in 8" :key="i"
            class="bg-purple-100 text-purple-800 text-sm p-4 rounded text-center">
            Item {{ i }}
          </div>
        </DzGrid>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Explicit Rows
// ---------------------------------------------------------------------------

export const ExplicitRows: Story = {
  name: 'Explicit Rows',
  args: {
    cols: 3,
    rows: 2,
    gap: 'md',
  },
  render: args => ({
    components: { DzGrid },
    setup() {
      return { args }
    },
    template: `
      <DzGrid v-bind="args">
        ${gridItems(6)}
      </DzGrid>
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
    components: { DzGrid },
    template: `
      <DzGrid :cols="3" gap="md">
        <div v-for="i in 6" :key="i"
          class="bg-gray-700 text-gray-200 text-sm p-4 rounded text-center">
          Item {{ i }}
        </div>
      </DzGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Card Grid
// ---------------------------------------------------------------------------

export const RealWorldCardGrid: Story = {
  name: 'Real World: Card Grid',
  render: () => ({
    components: { DzGrid },
    template: `
      <DzGrid :cols="{ sm: 1, md: 2, lg: 3 }" gap="lg">
        <div v-for="i in 6" :key="i"
          class="border border-gray-200 rounded-lg p-5 space-y-2">
          <div class="h-32 bg-gray-100 rounded" />
          <h3 class="font-semibold">Card Title {{ i }}</h3>
          <p class="text-sm text-gray-500">Brief description of the card content goes here.</p>
        </div>
      </DzGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Dashboard Stats
// ---------------------------------------------------------------------------

export const RealWorldDashboardStats: Story = {
  name: 'Real World: Dashboard Stats',
  render: () => ({
    components: { DzGrid },
    template: `
      <DzGrid :cols="4" gap="md">
        <div class="bg-white border rounded-lg p-4">
          <p class="text-sm text-gray-500">Revenue</p>
          <p class="text-2xl font-bold">$24,500</p>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <p class="text-sm text-gray-500">Users</p>
          <p class="text-2xl font-bold">1,234</p>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <p class="text-sm text-gray-500">Orders</p>
          <p class="text-2xl font-bold">567</p>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <p class="text-sm text-gray-500">Growth</p>
          <p class="text-2xl font-bold text-green-600">+12.5%</p>
        </div>
      </DzGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Grid',
  render: () => ({
    components: { DzGrid },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Grid can render as a list element for semantic markup.</p>
        <DzGrid as="ul" :cols="3" gap="md" aria-label="Feature list">
          <li class="bg-blue-50 p-4 rounded text-sm">Feature A</li>
          <li class="bg-blue-50 p-4 rounded text-sm">Feature B</li>
          <li class="bg-blue-50 p-4 rounded text-sm">Feature C</li>
        </DzGrid>
      </div>
    `,
  }),
}
