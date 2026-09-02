import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import {
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableFooter,
  DzTableHeader,
  DzTableRow,
} from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

/**
 * DzTable is a simple semantic table wrapper with styling.
 * For advanced features (sorting, pagination, selection), use DzDataGrid.
 *
 * It is a compound component with DzTableHeader, DzTableBody, DzTableRow,
 * and DzTableCell sub-parts that receive context via inject (ADR-08).
 */

const meta = {
  title: 'Core/Data/DzTable',
  component: DzTable,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'striped'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'select',
      options: ['compact', 'default', 'comfortable'],
      description: 'Row density',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    striped: {
      control: 'boolean',
      description: 'Whether rows have striped backgrounds',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    hoverable: {
      control: 'boolean',
      description: 'Whether rows are hoverable',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    // Behavior
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
      description: 'Accessible label for the table',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    density: 'default',
    striped: false,
    hoverable: false,
    loading: false,
  },
} satisfies Meta<typeof DzTable>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    setup() {
      return { args }
    },
    template: `
      <DzTable v-bind="args" aria-label="User accounts">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Email</DzTableCell>
            <DzTableCell header align="right">Balance</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice Johnson</DzTableCell>
            <DzTableCell>alice@example.com</DzTableCell>
            <DzTableCell align="right">$1,200.00</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob Smith</DzTableCell>
            <DzTableCell>bob@example.com</DzTableCell>
            <DzTableCell align="right">$850.50</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Charlie Lee</DzTableCell>
            <DzTableCell>charlie@example.com</DzTableCell>
            <DzTableCell align="right">$2,340.75</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  args: {
    hoverable: true,
  },

  name: 'Variant Gallery',

  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-8">
        <div v-for="v in ['default', 'bordered', 'striped']" :key="v">
          <p class="text-sm font-medium mb-2 capitalize">variant: {{ v }}</p>
          <DzTable :variant="v" :aria-label="v + ' table'">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Name</DzTableCell>
                <DzTableCell header>Role</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>Alice</DzTableCell>
                <DzTableCell>Engineer</DzTableCell>
              </DzTableRow>
              <DzTableRow>
                <DzTableCell>Bob</DzTableCell>
                <DzTableCell>Designer</DzTableCell>
              </DzTableRow>
              <DzTableRow>
                <DzTableCell>Charlie</DzTableCell>
                <DzTableCell>PM</DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
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
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-8">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzTable :size="s" variant="bordered" :aria-label="s + ' table'">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Name</DzTableCell>
                <DzTableCell header>Role</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>Alice</DzTableCell>
                <DzTableCell>Engineer</DzTableCell>
              </DzTableRow>
              <DzTableRow>
                <DzTableCell>Bob</DzTableCell>
                <DzTableCell>Designer</DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Density Gallery
// ---------------------------------------------------------------------------

export const AllDensities: Story = {
  name: 'Density Gallery',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-8">
        <div v-for="d in ['compact', 'default', 'comfortable']" :key="d">
          <p class="text-sm font-medium mb-2 capitalize">density: {{ d }}</p>
          <DzTable :density="d" variant="bordered" :aria-label="d + ' table'">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Name</DzTableCell>
                <DzTableCell header>Role</DzTableCell>
                <DzTableCell header>Status</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>Alice</DzTableCell>
                <DzTableCell>Engineer</DzTableCell>
                <DzTableCell>Active</DzTableCell>
              </DzTableRow>
              <DzTableRow>
                <DzTableCell>Bob</DzTableCell>
                <DzTableCell>Designer</DzTableCell>
                <DzTableCell>Active</DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Striped & Hoverable
// ---------------------------------------------------------------------------

export const StripedHoverable: Story = {
  name: 'Striped & Hoverable',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable striped hoverable aria-label="Striped hoverable table">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Department</DzTableCell>
            <DzTableCell header align="right">Salary</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice Johnson</DzTableCell>
            <DzTableCell>Engineering</DzTableCell>
            <DzTableCell align="right">$120,000</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob Smith</DzTableCell>
            <DzTableCell>Design</DzTableCell>
            <DzTableCell align="right">$95,000</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Charlie Lee</DzTableCell>
            <DzTableCell>Product</DzTableCell>
            <DzTableCell align="right">$110,000</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Diana Chen</DzTableCell>
            <DzTableCell>Engineering</DzTableCell>
            <DzTableCell align="right">$130,000</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Selected Row
// ---------------------------------------------------------------------------

export const SelectedRow: Story = {
  name: 'With Selected Row',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable hoverable aria-label="Table with selected row">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Role</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice</DzTableCell>
            <DzTableCell>Engineer</DzTableCell>
          </DzTableRow>
          <DzTableRow selected>
            <DzTableCell>Bob</DzTableCell>
            <DzTableCell>Designer</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Charlie</DzTableCell>
            <DzTableCell>PM</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
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
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    setup() {
      return { args }
    },
    template: `
      <DzTable v-bind="args" aria-label="Loading table">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Role</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice</DzTableCell>
            <DzTableCell>Engineer</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Caption
// ---------------------------------------------------------------------------

export const WithCaption: Story = {
  name: 'With Caption Slot',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Table with caption">
        <template #caption>
          <caption class="text-sm text-[var(--dz-muted-foreground)] mb-2">Table 1: Quarterly Revenue by Region</caption>
        </template>
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Region</DzTableCell>
            <DzTableCell header align="right">Q1</DzTableCell>
            <DzTableCell header align="right">Q2</DzTableCell>
            <DzTableCell header align="right">Q3</DzTableCell>
            <DzTableCell header align="right">Q4</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>North America</DzTableCell>
            <DzTableCell align="right">$1.2M</DzTableCell>
            <DzTableCell align="right">$1.4M</DzTableCell>
            <DzTableCell align="right">$1.3M</DzTableCell>
            <DzTableCell align="right">$1.6M</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Europe</DzTableCell>
            <DzTableCell align="right">$0.9M</DzTableCell>
            <DzTableCell align="right">$1.0M</DzTableCell>
            <DzTableCell align="right">$1.1M</DzTableCell>
            <DzTableCell align="right">$1.2M</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Colspan/Rowspan
// ---------------------------------------------------------------------------

export const WithSpans: Story = {
  name: 'With Colspan & Rowspan',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Table with spans">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header :colspan="2" align="center">Contact</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell header></DzTableCell>
            <DzTableCell header>Email</DzTableCell>
            <DzTableCell header>Phone</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice</DzTableCell>
            <DzTableCell>alice@example.com</DzTableCell>
            <DzTableCell>555-0101</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob</DzTableCell>
            <DzTableCell>bob@example.com</DzTableCell>
            <DzTableCell>555-0102</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
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
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" striped hoverable aria-label="Dark mode table">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Role</DzTableCell>
            <DzTableCell header align="right">Salary</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice</DzTableCell>
            <DzTableCell>Engineer</DzTableCell>
            <DzTableCell align="right">$120k</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob</DzTableCell>
            <DzTableCell>Designer</DzTableCell>
            <DzTableCell align="right">$95k</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Charlie</DzTableCell>
            <DzTableCell>PM</DzTableCell>
            <DzTableCell align="right">$110k</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Semantic Table',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          DzTable renders semantic HTML table elements (table, thead, tbody, tr, th, td).
          The header prop on DzTableCell renders th with appropriate scope attributes.
          Screen readers announce header-cell associations for each data cell.
        </p>
        <DzTable variant="bordered" aria-label="Accessible table with proper header scope">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Product</DzTableCell>
              <DzTableCell header align="right">Price</DzTableCell>
              <DzTableCell header align="right">Stock</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow>
              <DzTableCell>Widget A</DzTableCell>
              <DzTableCell align="right">$9.99</DzTableCell>
              <DzTableCell align="right">142</DzTableCell>
            </DzTableRow>
            <DzTableRow>
              <DzTableCell>Widget B</DzTableCell>
              <DzTableCell align="right">$14.99</DzTableCell>
              <DzTableCell align="right">58</DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Renders a real <table> with an accessible name.
    const table = canvas.getByRole('table', { name: /accessible table/i })
    await expect(table).toBeInTheDocument()

    // Header cells are <th scope="col"> so screen readers associate columns.
    const headers = canvas.getAllByRole('columnheader')
    await expect(headers).toHaveLength(3)
    for (const th of headers) {
      await expect(th).toHaveAttribute('scope', 'col')
    }

    // Two data rows are present in addition to the header row.
    await expect(canvas.getAllByRole('row')).toHaveLength(3)
  },
}

// ---------------------------------------------------------------------------
// Sticky Header (scrolling body)
// ---------------------------------------------------------------------------

const stickyRows = Array.from({ length: 12 }, (_, i) => ({
  name: `Employee ${i + 1}`,
  role: ['Engineer', 'Designer', 'PM', 'Analyst'][i % 4],
  status: ['Active', 'On Leave', 'Inactive'][i % 3],
}))

export const StickyHeader: Story = {
  name: 'Sticky Header',
  parameters: {
    docs: {
      description: {
        story:
          'DzTable’s root is a scroll container. Give the header cells '
          + '`sticky top-0` (plus a background) and constrain the table height to '
          + 'keep column headers visible while the body scrolls.',
      },
    },
  },
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    setup() {
      // Inline styles guarantee the scroll bound + sticky positioning regardless
      // of the Tailwind utility build; the classes show the real-world pattern.
      const headerStyle = 'position: sticky; top: 0; z-index: 10; background: var(--dz-background)'
      return { rows: stickyRows, headerStyle }
    },
    template: `
      <DzTable variant="bordered" hoverable style="max-height: 16rem" aria-label="Scrollable table with sticky header">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header :style="headerStyle">Name</DzTableCell>
            <DzTableCell header :style="headerStyle">Role</DzTableCell>
            <DzTableCell header :style="headerStyle">Status</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow v-for="row in rows" :key="row.name">
            <DzTableCell>{{ row.name }}</DzTableCell>
            <DzTableCell>{{ row.role }}</DzTableCell>
            <DzTableCell>{{ row.status }}</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The header cells are position: sticky so they stay pinned on scroll.
    const firstHeader = canvas.getAllByRole('columnheader')[0]
    await expect(getComputedStyle(firstHeader).position).toBe('sticky')

    // The DzTable root is the scroll container (overflow-auto) — it scrolls.
    const scroller = canvas.getByRole('table').parentElement as HTMLElement
    scroller.scrollTop = 200
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0))
    // Header remains rendered after scrolling.
    await expect(canvas.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Responsive – Mobile
// ---------------------------------------------------------------------------

export const ResponsiveMobile: Story = {
  name: 'Responsive – Mobile',
  decorators: [
    () => ({ template: '<div style="max-width: 375px; overflow-x: auto;"><story /></div>' }),
  ],
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" size="sm" aria-label="Mobile responsive table">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Role</DzTableCell>
            <DzTableCell header align="right">Salary</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice Johnson</DzTableCell>
            <DzTableCell>Engineer</DzTableCell>
            <DzTableCell align="right">$120k</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob Smith</DzTableCell>
            <DzTableCell>Designer</DzTableCell>
            <DzTableCell align="right">$95k</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Charlie Lee</DzTableCell>
            <DzTableCell>PM</DzTableCell>
            <DzTableCell align="right">$110k</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Invoice Line Items
// ---------------------------------------------------------------------------

export const RealWorldInvoice: Story = {
  name: 'Real World: Invoice Line Items',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="max-w-2xl">
        <DzTable variant="bordered" density="compact" aria-label="Invoice line items">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Description</DzTableCell>
              <DzTableCell header align="right">Qty</DzTableCell>
              <DzTableCell header align="right">Unit Price</DzTableCell>
              <DzTableCell header align="right">Amount</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow>
              <DzTableCell>Web Design Services</DzTableCell>
              <DzTableCell align="right">40</DzTableCell>
              <DzTableCell align="right">$75.00</DzTableCell>
              <DzTableCell align="right">$3,000.00</DzTableCell>
            </DzTableRow>
            <DzTableRow>
              <DzTableCell>Development Hours</DzTableCell>
              <DzTableCell align="right">80</DzTableCell>
              <DzTableCell align="right">$125.00</DzTableCell>
              <DzTableCell align="right">$10,000.00</DzTableCell>
            </DzTableRow>
            <DzTableRow>
              <DzTableCell>Hosting (Annual)</DzTableCell>
              <DzTableCell align="right">1</DzTableCell>
              <DzTableCell align="right">$300.00</DzTableCell>
              <DzTableCell align="right">$300.00</DzTableCell>
            </DzTableRow>
            <DzTableRow>
              <DzTableCell :colspan="3"><strong>Total</strong></DzTableCell>
              <DzTableCell align="right"><strong>$13,300.00</strong></DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Column Pinning
// ---------------------------------------------------------------------------

/**
 * Pin columns to the left or right edge with `pin="left" | "right"` on every
 * cell in the column. Stack multiple pinned columns by giving each a cumulative
 * `pinOffset` (px). Mark the last pinned-left / first pinned-right column with
 * `pinBoundary` to render the edge shadow. Scroll the table horizontally to see
 * the pinned columns stay in place.
 */
export const ColumnPinning: Story = {
  name: 'Column Pinning',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    setup() {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const rows = [
        { name: 'Revenue', total: '$1.2M' },
        { name: 'Expenses', total: '$0.8M' },
        { name: 'Profit', total: '$0.4M' },
      ]
      return { months, rows }
    },
    template: `
      <div style="max-width: 640px">
        <DzTable variant="bordered" hoverable aria-label="Pinned columns demo">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header pin="left" :pin-offset="0" pin-boundary>Metric</DzTableCell>
              <DzTableCell header v-for="m in months" :key="m" align="right">{{ m }}</DzTableCell>
              <DzTableCell header pin="right" :pin-offset="0" pin-boundary align="right">Total</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in rows" :key="row.name">
              <DzTableCell pin="left" :pin-offset="0" pin-boundary>{{ row.name }}</DzTableCell>
              <DzTableCell v-for="m in months" :key="m" align="right">$—</DzTableCell>
              <DzTableCell pin="right" :pin-offset="0" pin-boundary align="right">{{ row.total }}</DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Column Resizing
// ---------------------------------------------------------------------------

/**
 * Give a header cell `resizable` + a stable `colId` to render a drag handle at
 * its right edge. Drag (or focus the handle and press Arrow Left / Right) to
 * change the width; body cells sharing the same `colId` follow. Minimum width is
 * controlled by the `--dz-table-col-min-width` token (fallback 48px).
 */
export const ColumnResizing: Story = {
  name: 'Column Resizing',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Resizable columns demo">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header resizable col-id="name">Name</DzTableCell>
            <DzTableCell header resizable col-id="role">Role</DzTableCell>
            <DzTableCell header resizable col-id="email">Email</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell col-id="name">Alice Johnson</DzTableCell>
            <DzTableCell col-id="role">Engineer</DzTableCell>
            <DzTableCell col-id="email">alice@example.com</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell col-id="name">Bob Smith</DzTableCell>
            <DzTableCell col-id="role">Designer</DzTableCell>
            <DzTableCell col-id="email">bob@example.com</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Virtual Scroll
// ---------------------------------------------------------------------------

/**
 * Set `virtual-scroll` with a fixed `row-height` (px) and a bounded `max-height`
 * to window-render very large datasets. Only the visible rows plus an overscan
 * buffer are mounted; spacer rows preserve the scrollbar geometry. Here 10,000
 * rows render smoothly.
 */
export const VirtualScroll: Story = {
  name: 'Virtual Scroll',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    setup() {
      const data = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }))
      return { data }
    },
    template: `
      <DzTable
        virtual-scroll
        :row-height="44"
        max-height="360px"
        variant="bordered"
        hoverable
        aria-label="10,000 rows, virtualized"
      >
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>#</DzTableCell>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Email</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow v-for="row in data" :key="row.id" style="height: 44px">
            <DzTableCell>{{ row.id + 1 }}</DzTableCell>
            <DzTableCell>{{ row.name }}</DzTableCell>
            <DzTableCell>{{ row.email }}</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — ready / loading / selected row (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * DzTable is one of the nine components that declare an ADR-19 anatomy, so its
 * states are part of a published contract rather than an implementation detail:
 * `data-state` on `[data-part="root"]` is `ready` or `loading`, and a selected
 * row stamps `data-state="selected"` on `[data-part="row"]`.
 *
 * Consumers style against exactly those selectors, so the play function asserts
 * the declared parts and states rather than the classes that happen to render
 * them — this is the story a theme author checks the contract against.
 *
 * It also pins the part of `loading` that is easy to get wrong: `DzTableBody`
 * **replaces** its rows with `aria-hidden` skeletons, so the accessibility tree
 * is left holding a busy table and its header rather than the previous page's
 * values.
 */
export const States: Story = {
  render: () => ({
    components: {
      DzTable,
      DzTableHeader,
      DzTableBody,
      DzTableFooter,
      DzTableRow,
      DzTableCell,
    },
    template: `
      <div class="space-y-8">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Ready — with a selected row</p>
          <DzTable variant="bordered" hoverable aria-label="Ready invoice table" data-testid="tbl-ready">
            <template #caption>Open invoices</template>
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Invoice</DzTableCell>
                <DzTableCell header align="right">Amount</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>INV-1001</DzTableCell>
                <DzTableCell align="right">$1,200.00</DzTableCell>
              </DzTableRow>
              <DzTableRow selected>
                <DzTableCell>INV-1002</DzTableCell>
                <DzTableCell align="right">$850.50</DzTableCell>
              </DzTableRow>
            </DzTableBody>
            <DzTableFooter>
              <DzTableRow>
                <DzTableCell header>Total</DzTableCell>
                <DzTableCell align="right">$2,050.50</DzTableCell>
              </DzTableRow>
            </DzTableFooter>
          </DzTable>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Loading</p>
          <DzTable loading variant="bordered" aria-label="Loading invoice table" data-testid="tbl-loading">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header>Invoice</DzTableCell>
                <DzTableCell header align="right">Amount</DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow>
                <DzTableCell>INV-1001</DzTableCell>
                <DzTableCell align="right">$1,200.00</DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ready = canvas.getByTestId('tbl-ready')
    const loading = canvas.getByTestId('tbl-loading')

    // The declared anatomy parts are all present on the ready table.
    await expect(ready).toHaveAttribute('data-part', 'root')
    for (const part of ['content', 'title', 'header', 'body', 'row', 'cell', 'footer'])
      await expect(ready.querySelector(`[data-part="${part}"]`)).not.toBeNull()

    // `ready` state: not busy, no loading marker.
    await expect(ready).toHaveAttribute('data-state', 'ready')
    await expect(ready).not.toHaveAttribute('data-loading')
    await expect(within(ready).getByRole('table')).not.toHaveAttribute('aria-busy')

    // Exactly one row carries the declared `selected` state, and it is the
    // second body row — the state lives on `[data-part="row"]`, not on a class.
    const selectedRows = ready.querySelectorAll('[data-part="row"][data-state="selected"]')
    await expect(selectedRows).toHaveLength(1)
    await expect(selectedRows[0]).toHaveTextContent('INV-1002')

    // `loading` state: the root flips and the table reports itself busy.
    await expect(loading).toHaveAttribute('data-state', 'loading')
    await expect(loading).toHaveAttribute('data-loading')
    await expect(within(loading).getByRole('table')).toHaveAttribute('aria-busy', 'true')

    // …and the body is swapped for `aria-hidden` skeleton rows rather than
    // leaving stale data behind: the only row left in the accessibility tree is
    // the header, so a screen reader hears a busy table, not last page's values.
    await expect(within(loading).getAllByRole('row')).toHaveLength(1)
    await expect(loading.querySelectorAll('[data-part="row"]')).toHaveLength(1)
    await expect(
      loading.querySelectorAll('tbody tr[aria-hidden="true"]').length,
    ).toBeGreaterThan(0)
    await expect(within(loading).queryByText('INV-1001')).toBeNull()
  },
}
