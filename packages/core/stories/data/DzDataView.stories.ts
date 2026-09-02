import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzDataView } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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

// ---------------------------------------------------------------------------
// States — ready / loading / empty / disabled (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The two states DzDataView declares (`loading`, `disabled`) plus the no-records
 * rendering, which a consumer has to handle whether or not it is a "state".
 *
 * The distinction that matters and is invisible in a screenshot: `loading`
 * replaces the record list with `aria-hidden` skeletons and announces "Loading
 * items" through the polite live region, while `disabled` keeps every record
 * rendered and readable and only takes the *controls* out of service. The play
 * function asserts both halves.
 */
export const States: Story = {
  render: () => ({
    components: { DzDataView },
    setup: () => ({ products, sortOptions }),
    template: `
      <div class="space-y-8">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Ready</p>
          <DzDataView
            :items="products.slice(0, 4)"
            data-key="id"
            layout="list"
            layout-toggle
            :sort-options="sortOptions"
            data-testid="dv-ready"
          >
            <template #item="{ item }">${rowTemplate}</template>
          </DzDataView>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Loading</p>
          <DzDataView
            loading
            :loading-rows="3"
            :items="products.slice(0, 4)"
            data-key="id"
            layout="list"
            data-testid="dv-loading"
          >
            <template #item="{ item }">${rowTemplate}</template>
          </DzDataView>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Disabled</p>
          <DzDataView
            disabled
            :items="products.slice(0, 4)"
            data-key="id"
            layout="list"
            layout-toggle
            paginator
            :rows="2"
            :sort-options="sortOptions"
            data-testid="dv-disabled"
          >
            <template #item="{ item }">${rowTemplate}</template>
          </DzDataView>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Empty</p>
          <DzDataView
            :items="[]"
            empty-title="No products found"
            empty-description="Try adjusting your filters to see more results."
            data-testid="dv-empty"
          />
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ready = canvas.getByTestId('dv-ready')
    const loading = canvas.getByTestId('dv-loading')
    const disabled = canvas.getByTestId('dv-disabled')
    const empty = canvas.getByTestId('dv-empty')

    // Ready: four records, live controls.
    await expect(within(ready).getAllByRole('listitem')).toHaveLength(4)
    await expect(within(ready).getByRole('combobox', { name: 'Sort by' })).toBeEnabled()

    // Loading: the list is replaced by aria-hidden skeletons, and the polite
    // live region says so — a busy view is announced, not silently blank.
    await expect(within(loading).queryByRole('list')).toBeNull()
    await expect(within(loading).queryAllByRole('listitem')).toHaveLength(0)
    await expect(loading.querySelector('[aria-live="polite"]')).toHaveTextContent('Loading items')

    // Disabled: the records stay readable — only the controls are switched off.
    await expect(within(disabled).getAllByRole('listitem')).toHaveLength(2)
    await expect(disabled).toHaveAttribute('data-disabled')
    await expect(within(disabled).getByRole('combobox', { name: 'Sort by' })).toBeDisabled()
    for (const toggle of within(disabled).getAllByRole('button', { name: /list|grid/i }))
      await expect(toggle).toBeDisabled()
    await expect(
      within(disabled).getByRole('button', { name: 'Go to next page' }),
    ).toBeDisabled()

    // Empty: no list, the empty copy instead, and the live region names it.
    await expect(within(empty).queryByRole('list')).toBeNull()
    await expect(
      within(empty).getByText('Try adjusting your filters to see more results.'),
    ).toBeVisible()
    await expect(empty.querySelector('[aria-live="polite"]')).toHaveTextContent('No products found')
  },
}

// ---------------------------------------------------------------------------
// Accessibility — list semantics + keyboard-only controls (tier C item)
// ---------------------------------------------------------------------------

/**
 * What a screen-reader user gets from DzDataView: a real `role="list"` of
 * `listitem`s whichever layout is active, named `Sort by` and `View layout`
 * controls, and a polite live region that reports the rendered window after
 * every layout, sort or page change.
 *
 * The play function reaches the layout toggle with Tab only, moves inside it
 * with the roving Arrow keys the APG toolbar pattern specifies, activates it
 * with Enter, and asserts the layout actually changed — no pointer is used.
 */
export const Accessibility: Story = {
  name: 'Accessibility: List Semantics & Keyboard',
  render: () => ({
    components: { DzDataView },
    setup: () => ({ products }),
    data: () => ({ layout: 'list' }),
    template: `
      <div class="space-y-3">
        <h3 id="dv-a11y-heading" class="text-sm font-semibold text-[var(--dz-foreground)]">
          Product catalog
        </h3>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab reaches the layout toggle; Arrow keys move between its options and
          Enter activates one. The rendered window is announced politely.
        </p>
        <DzDataView
          v-model:layout="layout"
          :items="products"
          data-key="id"
          layout-toggle
          :cols="{ sm: 1, md: 2, lg: 4 }"
          aria-labelledby="dv-a11y-heading"
          data-testid="dv-a11y"
        >
          <template #item="{ item, layout }">
            <template v-if="layout === 'grid'">${cardTemplate}</template>
            <template v-else>${rowTemplate}</template>
          </template>
        </DzDataView>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('dv-a11y')

    // The collection is exposed as a list, and the root borrows the heading as
    // its accessible name.
    await expect(root).toHaveAttribute('aria-labelledby', 'dv-a11y-heading')
    await expect(within(root).getByRole('list')).toBeInTheDocument()
    await expect(within(root).getAllByRole('listitem')).toHaveLength(products.length)

    // The controls are named, not just iconographic.
    const toggleGroup = within(root).getByRole('group', { name: 'View layout' })
    const listOption = within(toggleGroup).getByRole('button', { name: /list/i })
    const gridOption = within(toggleGroup).getByRole('button', { name: /grid/i })
    await expect(listOption).toHaveAttribute('aria-pressed', 'true')

    // The live region reports the rendered window.
    await expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent(
      `Showing ${products.length} items`,
    )

    // Keyboard-only: Tab into the roving toggle group…
    for (let i = 0; i < 8 && !toggleGroup.contains(document.activeElement); i++)
      await userEvent.tab()
    await expect(toggleGroup.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).toBe(listOption)

    // …Arrow to the next option, Enter to activate it.
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() => expect(document.activeElement).toBe(gridOption))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(gridOption).toHaveAttribute('aria-pressed', 'true'))

    // The layout really changed, and the list semantics survived it.
    await expect(root).toHaveAttribute('data-layout', 'grid')
    await expect(within(root).getByRole('list')).toBeInTheDocument()
    await expect(within(root).getAllByRole('listitem')).toHaveLength(products.length)
  },
}

// ---------------------------------------------------------------------------
// Real world — product catalog (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * The composition DzDataView exists for: a storefront catalog with a heading,
 * a result count, sorting, paging, and a card/row layout the shopper chooses —
 * every feature working against the same `items` array at once.
 *
 * A bare `ListLayout` story never shows that sorting re-orders the *paged*
 * window rather than only the visible page, which is what the play function
 * pins down.
 */
export const RealWorldCatalog: Story = {
  name: 'Real World: Product Catalog',
  render: () => ({
    components: { DzDataView },
    setup: () => ({ products, sortOptions }),
    data: () => ({ layout: 'grid', first: 0 }),
    template: `
      <div class="space-y-3">
        <DzDataView
          v-model:layout="layout"
          v-model:first="first"
          :items="products"
          data-key="id"
          layout-toggle
          paginator
          :rows="4"
          :sort-options="sortOptions"
          :cols="{ sm: 1, md: 2, lg: 4 }"
          data-testid="dv-catalog"
        >
          <template #header>
            <div>
              <h3 class="text-sm font-semibold text-[var(--dz-foreground)]">All products</h3>
              <p class="text-xs text-[var(--dz-muted-foreground)]">
                {{ products.length }} results
              </p>
            </div>
          </template>
          <template #item="{ item, layout }">
            <template v-if="layout === 'grid'">${cardTemplate}</template>
            <template v-else>${rowTemplate}</template>
          </template>
        </DzDataView>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByTestId('dv-catalog')
    const firstLabelOf = () => within(root).getAllByRole('listitem')[0]!.textContent ?? ''

    // Page one of the unsorted catalog.
    await expect(within(root).getAllByRole('listitem')).toHaveLength(4)
    await expect(firstLabelOf()).toContain('Aurora Headphones')
    await expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Showing 1 to 4 of 8 items',
    )

    // Sorting re-orders the whole collection, not just the visible page: the
    // cheapest product lives on page 2 before the sort and page 1 after it.
    const sort = within(root).getByRole('combobox', { name: 'Sort by' })
    await userEvent.selectOptions(sort, '1')
    await waitFor(() => expect(firstLabelOf()).toContain('Solis Power Bank'))

    // Paging moves the window and the announcement follows it.
    await userEvent.click(within(root).getByRole('button', { name: 'Go to next page' }))
    await waitFor(() =>
      expect(root.querySelector('[aria-live="polite"]')).toHaveTextContent(
        'Showing 5 to 8 of 8 items',
      ),
    )
    await expect(firstLabelOf()).toContain('Nimbus Backpack')

    // The shopper's layout choice survives sorting and paging.
    await userEvent.click(within(root).getByRole('button', { name: /list/i }))
    await waitFor(() => expect(root).toHaveAttribute('data-layout', 'list'))
    await expect(within(root).getAllByRole('listitem')).toHaveLength(4)
  },
}
