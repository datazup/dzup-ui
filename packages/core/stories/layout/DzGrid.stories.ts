import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzGrid } from '../../src/components/layout'
import { darkModeDecorator, RESPONSIVE_VIEWPORTS } from '../_shared'

/**
 * DzGrid is a CSS Grid layout component with responsive column support.
 *
 * It supports fixed column counts (1-6, 12), responsive column objects
 * with per-breakpoint values, configurable gap sizes, and explicit row counts.
 */
const meta = {
  title: 'Core/Layout/DzGrid',
  component: DzGrid,
  tags: ['autodocs', 'status:stable'],
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
  return `<div class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4 rounded text-center font-medium">${n}</div>`
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const gridContainer = canvasElement.querySelector('div')
    await expect(gridContainer).toBeInTheDocument()
    const item1 = canvas.getByText('1')
    await expect(item1).toBeInTheDocument()
    const item6 = canvas.getByText('6')
    await expect(item6).toBeInTheDocument()
  },
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
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">cols={{ c }}</p>
          <DzGrid :cols="c" gap="sm">
            <div v-for="i in c" :key="i"
              class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-3 rounded text-center">
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
          <p class="text-xs text-[var(--dz-muted-foreground)] mb-2">gap="{{ g }}"</p>
          <DzGrid :cols="4" :gap="g">
            <div v-for="i in 4" :key="i"
              class="bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)] text-sm p-3 rounded text-center">
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Resize the viewport: 1 col on mobile, 2 on sm, 3 on md, 4 on lg.
        </p>
        <DzGrid :cols="{ sm: 2, md: 3, lg: 4 }" gap="md">
          <div v-for="i in 8" :key="i"
            class="bg-[var(--dz-colors-purple-100)] text-[var(--dz-colors-purple-800)] text-sm p-4 rounded text-center">
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
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzGrid },
    template: `
      <DzGrid :cols="3" gap="md">
        <div v-for="i in 6" :key="i"
          class="bg-[var(--dz-colors-neutral-700)] text-[var(--dz-colors-neutral-200)] text-sm p-4 rounded text-center">
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
          class="border border-[var(--dz-border)] rounded-lg p-5 space-y-2">
          <div class="h-32 bg-[var(--dz-muted)] rounded" />
          <h3 class="font-semibold">Card Title {{ i }}</h3>
          <p class="text-sm text-[var(--dz-muted-foreground)]">Brief description of the card content goes here.</p>
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
        <div class="bg-[var(--dz-card)] border border-[var(--dz-border)] rounded-lg p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">Revenue</p>
          <p class="text-2xl font-bold">$24,500</p>
        </div>
        <div class="bg-[var(--dz-card)] border border-[var(--dz-border)] rounded-lg p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">Users</p>
          <p class="text-2xl font-bold">1,234</p>
        </div>
        <div class="bg-[var(--dz-card)] border border-[var(--dz-border)] rounded-lg p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">Orders</p>
          <p class="text-2xl font-bold">567</p>
        </div>
        <div class="bg-[var(--dz-card)] border border-[var(--dz-border)] rounded-lg p-4">
          <p class="text-sm text-[var(--dz-muted-foreground)]">Growth</p>
          <p class="text-2xl font-bold text-[var(--dz-success-muted-foreground)]">+12.5%</p>
        </div>
      </DzGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Responsive (TASK-7.D) — same responsive grid previewed at three breakpoints.
// Switch the active viewport from the toolbar, or open each named story.
// ---------------------------------------------------------------------------

function responsiveGrid() {
  return {
    components: { DzGrid },
    template: `
      <div class="space-y-2">
        <p class="text-xs text-[var(--dz-muted-foreground)]">
          cols={ sm: 2, md: 3, lg: 4 } — 1 column on mobile, 2 from sm, 3 from md, 4 from lg.
        </p>
        <DzGrid :cols="{ sm: 2, md: 3, lg: 4 }" gap="md">
          <div v-for="i in 8" :key="i"
            class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4 rounded text-center">
            Item {{ i }}
          </div>
        </DzGrid>
      </div>
    `,
  }
}

const responsiveParameters = {
  viewport: { options: RESPONSIVE_VIEWPORTS },
  layout: 'fullscreen',
} as const

export const ResponsiveMobile: Story = {
  name: 'Responsive: Mobile',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'mobile' } },
  render: responsiveGrid,
}

export const ResponsiveTablet: Story = {
  name: 'Responsive: Tablet',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'tablet' } },
  render: responsiveGrid,
}

export const ResponsiveDesktop: Story = {
  name: 'Responsive: Desktop',
  parameters: responsiveParameters,
  globals: { viewport: { value: 'desktop' } },
  render: responsiveGrid,
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Grid can render as a list element for semantic markup.</p>
        <DzGrid as="ul" :cols="3" gap="md" aria-label="Feature list">
          <li class="bg-[var(--dz-primary-muted)] p-4 rounded text-sm">Feature A</li>
          <li class="bg-[var(--dz-primary-muted)] p-4 rounded text-sm">Feature B</li>
          <li class="bg-[var(--dz-primary-muted)] p-4 rounded text-sm">Feature C</li>
        </DzGrid>
      </div>
    `,
  }),
}
