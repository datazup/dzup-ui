import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { DzGrid, DzGridItem } from '../../src/components/layout'
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
    // A static template (no `${…}` interpolation), so component-meta can publish
    // it as paste-ready markup (TASK-R3-O3).
    template: `
      <DzGrid v-bind="args">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4 rounded text-center font-medium"
        >
          {{ n }}
        </div>
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
// Spanning items (DzGridItem, TASK-R3-O3 / decision D67)
// ---------------------------------------------------------------------------

/**
 * `DzGridItem` says how many columns a child occupies — a typed `span` instead
 * of a raw `col-span-*` class. The second grid is `dir="rtl"`: the same markup
 * fills from the inline-start (right) edge, with nothing to configure.
 */
export const SpanningItems: Story = {
  name: 'Spanning Items (DzGridItem)',
  render: () => ({
    components: { DzGrid, DzGridItem },
    template: `
      <div class="space-y-6">
        <DzGrid :cols="3" gap="md" data-testid="grid-ltr">
          <DzGridItem :span="2" data-testid="ltr-wide"
            class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4 rounded">span 2</DzGridItem>
          <DzGridItem data-testid="ltr-single"
            class="bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)] text-sm p-4 rounded">span 1</DzGridItem>
          <DzGridItem span="full"
            class="bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)] text-sm p-4 rounded">span full</DzGridItem>
        </DzGrid>
        <div dir="rtl">
          <DzGrid :cols="3" gap="md" data-testid="grid-rtl">
            <DzGridItem :span="2" data-testid="rtl-wide"
              class="bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)] text-sm p-4 rounded">span 2</DzGridItem>
            <DzGridItem data-testid="rtl-single"
              class="bg-[var(--dz-muted)] text-[var(--dz-muted-foreground)] text-sm p-4 rounded">span 1</DzGridItem>
          </DzGrid>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const wide = canvas.getByTestId('ltr-wide').getBoundingClientRect()
    const single = canvas.getByTestId('ltr-single').getBoundingClientRect()
    // Two columns plus a gap is wider than one and a half columns.
    await expect(wide.width).toBeGreaterThan(single.width * 1.5)
    // LTR: the wide item starts at the left.
    await expect(wide.left).toBeLessThan(single.left)
    // RTL: the same markup starts at the right.
    const rtlWide = canvas.getByTestId('rtl-wide').getBoundingClientRect()
    const rtlSingle = canvas.getByTestId('rtl-single').getBoundingClientRect()
    await expect(rtlWide.width).toBeGreaterThan(rtlSingle.width * 1.5)
    await expect(rtlWide.left).toBeGreaterThan(rtlSingle.left)
  },
}

// ---------------------------------------------------------------------------
// Form layout node (DzGridItem colSpan/rowSpan, TASK-S3-O2 / decision D-S3O2-1)
// ---------------------------------------------------------------------------

/**
 * A schema-driven form layout, rendered with **no class name anywhere**.
 *
 * The Form document's layout node carries `colSpan` and `rowSpan`
 * (`integer 1..12`), and `DzGridItem` now takes both under those exact names —
 * so a renderer forwards `node.layout` and needs no lookup table of its own.
 * `span` remains as an alias of `colSpan`; `colSpan` wins if both are passed and
 * dev mode says so.
 *
 * The tall item is the case that had no API before this change: a notes field
 * beside two stacked short fields is `rowSpan: 2`, and without the prop it could
 * only be written as a raw `row-span-2` — the persisted CSS the document format
 * forbids.
 *
 * The node order is what makes that shape: `notes` takes half the row and two
 * rows, so auto-placement puts `email` beside it and `phone` under `email`. A
 * `rowSpan` item that is the **sole** occupant of every track it spans is not
 * taller than a one-row sibling — both implicit tracks are content-sized, so CSS
 * grid distributes the item's own content across them — which is why the tall
 * item needs neighbours to be observably tall (RESIDUAL-04, 2026-09-25).
 */
export const FormLayoutNode: Story = {
  name: 'Form Layout Node (colSpan + rowSpan)',
  render: () => ({
    components: { DzGrid, DzGridItem },
    setup() {
      // Exactly the shape a form document hands a renderer.
      const nodes = [
        { id: 'first', label: 'First name', layout: { colSpan: 3 } },
        { id: 'last', label: 'Last name', layout: { colSpan: 3 } },
        // Rows 2–3, left half: the tall field, beside the two stacked short ones.
        { id: 'notes', label: 'Notes (tall)', layout: { colSpan: 3, rowSpan: 2 } },
        { id: 'email', label: 'Email', layout: { colSpan: 3 } },
        { id: 'phone', label: 'Phone', layout: { colSpan: 3 } },
        { id: 'summary', label: 'Summary (full width)', layout: { colSpan: 'full' as const } },
        // `colSpan: 6` of a `cols=6` grid and `colSpan: 'full'` are the same row.
        { id: 'total', label: 'Totals (colSpan 6 of 6)', layout: { colSpan: 6 } },
      ]
      return { nodes }
    },
    template: `
      <DzGrid :cols="6" gap="md" data-testid="form-grid">
        <DzGridItem
          v-for="node in nodes"
          :key="node.id"
          :col-span="node.layout.colSpan"
          :row-span="node.layout.rowSpan"
          :data-testid="'node-' + node.id"
          class="flex items-center justify-center rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-muted)] p-4 text-sm text-[var(--dz-muted-foreground)]"
        >
          {{ node.label }}
        </DzGridItem>
      </DzGrid>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const node = (id: string): HTMLElement => canvas.getByTestId(`node-${id}`)
    const box = (id: string): DOMRect => node(id).getBoundingClientRect()
    const notes = box('notes')
    const first = box('first')
    const email = box('email')
    const phone = box('phone')
    const summary = box('summary')
    const total = box('total')

    // `rowSpan: 2`, measured against siblings that share the tracks it spans.
    // `email` and `phone` are stacked — one track each — which is the premise:
    await expect(phone.top).toBeGreaterThanOrEqual(email.bottom)
    // …so the tall field covers both of their tracks plus the gap between them.
    await expect(notes.height).toBeGreaterThan(email.height * 1.5)
    await expect(Math.round(notes.top)).toBe(Math.round(email.top))
    await expect(Math.round(notes.bottom)).toBe(Math.round(phone.bottom))
    // And the span is two tracks in the resolved style, not merely a class name
    // in an attribute: a `row-span-2` the stylesheet never emitted reads `auto`.
    await expect(getComputedStyle(node('notes')).gridRowEnd).toBe('span 2')

    // colSpan — 3 of 6 is half the row; `6` of 6 and `'full'` are the whole row,
    // to the pixel, and both are wider than a half-row field.
    await expect(Math.round(notes.width)).toBe(Math.round(first.width))
    await expect(summary.width).toBeGreaterThan(first.width * 1.5)
    await expect(Math.round(total.width)).toBe(Math.round(summary.width))

    // The component produced the span classes from the typed props, so the
    // document never had to carry one.
    await expect(node('notes').className).toContain('col-span-3')
    await expect(node('notes').className).toContain('row-span-2')
    await expect(node('summary').className).toContain('col-span-full')
    await expect(node('total').className).toContain('col-span-6')
  },
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
