import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzDataView } from '../../src/components/data'

/**
 * DzDataView renders a collection of records as either a vertical list or a
 * responsive card grid, with an optional layout toggle, built-in client-side
 * sorting, and paging via DzPagination.
 *
 * It is pure presentation over `items` (no fetching) and fills the space
 * between DzList (simple) and DzDataGrid (tabular) — product catalogs,
 * galleries, and dashboards. Each record is rendered through the `#item` slot,
 * which receives `{ item, index, layout }` for full control of the cell.
 */
const meta = {
  title: 'Core/Data/DzDataView',
  component: DzDataView,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['list', 'grid'],
      description: 'Active display layout',
      table: { category: 'Behavior', defaultValue: { summary: 'list' } },
    },
    layoutToggle: {
      control: 'boolean',
      description: 'Render the list/grid segmented toggle',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    paginator: {
      control: 'boolean',
      description: 'Enable the built-in paginator',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    rows: {
      control: { type: 'number', min: 1 },
      description: 'Records per page when paginated',
      table: { category: 'Behavior', defaultValue: { summary: '12' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — renders skeleton placeholders',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents layout/sort/paging interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    layout: 'list',
    size: 'md',
  },
} satisfies Meta<typeof DzDataView>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface Product {
  id: number
  name: string
  category: string
  price: number
}

const products: Product[] = [
  { id: 1, name: 'Aurora Headphones', category: 'Audio', price: 199 },
  { id: 2, name: 'Lumen Desk Lamp', category: 'Home', price: 49 },
  { id: 3, name: 'Nimbus Backpack', category: 'Travel', price: 89 },
  { id: 4, name: 'Pulse Smartwatch', category: 'Wearables', price: 249 },
  { id: 5, name: 'Cobalt Keyboard', category: 'Computing', price: 129 },
  { id: 6, name: 'Vega Webcam', category: 'Computing', price: 79 },
  { id: 7, name: 'Solis Power Bank', category: 'Travel', price: 39 },
  { id: 8, name: 'Echo Bluetooth Speaker', category: 'Audio', price: 59 },
]

const cardTemplate = `
  <div
    class="flex h-full flex-col gap-1 rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-surface)] p-4"
  >
    <span class="text-xs uppercase tracking-wide text-[var(--dz-muted-foreground)]">{{ item.category }}</span>
    <span class="font-medium">{{ item.name }}</span>
    <span class="mt-auto text-[var(--dz-primary)] font-semibold">\${{ item.price }}</span>
  </div>
`

const rowTemplate = `
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-col">
      <span class="font-medium">{{ item.name }}</span>
      <span class="text-xs text-[var(--dz-muted-foreground)]">{{ item.category }}</span>
    </div>
    <span class="text-[var(--dz-primary)] font-semibold">\${{ item.price }}</span>
  </div>
`

const sortOptions = [
  { label: 'Name (A → Z)', field: 'name', order: 1 },
  { label: 'Price (low → high)', field: 'price', order: 1 },
  { label: 'Price (high → low)', field: 'price', order: -1 },
]

// ---------------------------------------------------------------------------
// List layout
// ---------------------------------------------------------------------------

export const ListLayout: Story = {
  args: { layout: 'list' },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args, products }),
    template: `
      <DzDataView v-bind="args" :items="products" data-key="id">
        <template #item="{ item }">${rowTemplate}</template>
      </DzDataView>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Grid layout
// ---------------------------------------------------------------------------

export const GridLayout: Story = {
  args: { layout: 'grid' },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args, products }),
    template: `
      <DzDataView v-bind="args" :items="products" data-key="id" :cols="{ sm: 1, md: 2, lg: 4 }" gap="md">
        <template #item="{ item }">${cardTemplate}</template>
      </DzDataView>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Layout toggle (list ⇄ grid)
// ---------------------------------------------------------------------------

export const WithLayoutToggle: Story = {
  name: 'With Layout Toggle',
  args: { layoutToggle: true },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args, products }),
    data: () => ({ layout: 'grid' }),
    template: `
      <DzDataView
        v-bind="args"
        v-model:layout="layout"
        :items="products"
        data-key="id"
        :cols="{ sm: 1, md: 2, lg: 4 }"
      >
        <template #header><h3 class="font-medium">Products</h3></template>
        <template #item="{ item, layout }">
          <template v-if="layout === 'grid'">${cardTemplate}</template>
          <template v-else>${rowTemplate}</template>
        </template>
      </DzDataView>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Layout toggle buttons should be present (grid / list).
    // The toggle renders as buttons with aria-pressed, not radio inputs.
    const listBtn = canvas.getByRole('button', { name: /list/i })
    const gridBtn = canvas.getByRole('button', { name: /grid/i })
    await expect(listBtn).toBeInTheDocument()
    await expect(gridBtn).toBeInTheDocument()

    // Click list toggle — layout switches.
    await userEvent.click(listBtn)
    await waitFor(() => expect(listBtn).toHaveAttribute('aria-pressed', 'true'))

    // Switch back to grid.
    await userEvent.click(gridBtn)
    await waitFor(() => expect(gridBtn).toHaveAttribute('aria-pressed', 'true'))
  },
}

// ---------------------------------------------------------------------------
// Paginated
// ---------------------------------------------------------------------------

export const Paginated: Story = {
  args: { layout: 'grid', paginator: true, rows: 4 },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args, products }),
    data: () => ({ first: 0 }),
    template: `
      <DzDataView
        v-bind="args"
        v-model:first="first"
        :items="products"
        data-key="id"
        :cols="{ sm: 1, md: 2, lg: 4 }"
      >
        <template #item="{ item }">${cardTemplate}</template>
      </DzDataView>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Sortable
// ---------------------------------------------------------------------------

export const Sortable: Story = {
  args: { layout: 'grid' },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args, products, sortOptions }),
    template: `
      <DzDataView
        v-bind="args"
        :items="products"
        data-key="id"
        :sort-options="sortOptions"
        :cols="{ sm: 1, md: 2, lg: 4 }"
      >
        <template #header><h3 class="font-medium">Catalog</h3></template>
        <template #item="{ item }">${cardTemplate}</template>
      </DzDataView>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: { layout: 'grid', loading: true, loadingRows: 8 },
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args }),
    template: `
      <DzDataView v-bind="args" :items="[]" :cols="{ sm: 1, md: 2, lg: 4 }">
        <template #item="{ item }">${cardTemplate}</template>
      </DzDataView>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

export const Empty: Story = {
  render: (args) => ({
    components: { DzDataView },
    setup: () => ({ args }),
    template: `
      <DzDataView
        v-bind="args"
        :items="[]"
        empty-title="No products found"
        empty-description="Try adjusting your filters to see more results."
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzDataView },
    setup: () => ({ products }),
    template: `
      <DzDataView :items="products" data-key="id" layout-toggle :cols="{ sm: 1, md: 2, lg: 4 }">
        <template #item="{ item, layout }">
          <template v-if="layout === 'grid'">${cardTemplate}</template>
          <template v-else>${rowTemplate}</template>
        </template>
      </DzDataView>
    `,
  }),
}
