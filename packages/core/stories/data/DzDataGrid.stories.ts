import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { ColumnDef } from '../../src/components/data'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzDataGrid,
} from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface Employee {
  id: number
  name: string
  role: string
  department: string
  salary: number
  status: string
}

const sampleData: Employee[] = [
  { id: 1, name: 'Alice Johnson', role: 'Engineer', department: 'Engineering', salary: 120000, status: 'Active' },
  { id: 2, name: 'Bob Smith', role: 'Designer', department: 'Design', salary: 95000, status: 'Active' },
  { id: 3, name: 'Charlie Lee', role: 'PM', department: 'Product', salary: 110000, status: 'On Leave' },
  { id: 4, name: 'Diana Chen', role: 'Engineer', department: 'Engineering', salary: 130000, status: 'Active' },
  { id: 5, name: 'Ethan Brown', role: 'Analyst', department: 'Data', salary: 90000, status: 'Active' },
  { id: 6, name: 'Fiona Davis', role: 'Designer', department: 'Design', salary: 98000, status: 'Active' },
  { id: 7, name: 'George Wilson', role: 'Engineer', department: 'Engineering', salary: 115000, status: 'Inactive' },
  { id: 8, name: 'Hannah White', role: 'PM', department: 'Product', salary: 105000, status: 'Active' },
]

const columns: ColumnDef<Employee>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'role', header: 'Role', sortable: true },
  { field: 'department', header: 'Department', sortable: true },
  { field: 'salary', header: 'Salary', sortable: true, align: 'right' },
  { field: 'status', header: 'Status' },
]

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/**
 * DzDataGrid is the most complex core data component, providing
 * sortable columns, row selection, pagination, and density controls.
 *
 * It is a compound component composed of DzDataGridHeader, DzDataGridBody,
 * and DzDataGridPagination sub-parts that receive context via inject (ADR-08).
 */
const meta = {
  title: 'Core/Data/DzDataGrid',
  component: DzDataGrid,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Behavior
    loading: {
      control: 'boolean',
      description: 'Loading state -- shows loading indicator',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    sortable: {
      control: 'boolean',
      description: 'Whether sorting is enabled on the grid',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    selectable: {
      control: 'select',
      options: [false, true, 'single', 'multiple'],
      description: 'Row selection mode',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    pagination: {
      control: 'boolean',
      description: 'Whether pagination is enabled',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Appearance
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
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the data grid',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    data: sampleData,
    columns,
    size: 'md',
    density: 'default',
    loading: false,
    sortable: false,
    selectable: false,
    pagination: false,
  },
} satisfies Meta<typeof DzDataGrid>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzDataGrid },
    setup() {
      return { args }
    },
    template: '<DzDataGrid v-bind="args" aria-label="Employee list" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData.slice(0, 3), columns }
    },
    template: `
      <div class="space-y-8">
        <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']" :key="s">
          <p class="text-sm font-medium mb-2 capitalize">size: {{ s }}</p>
          <DzDataGrid :data="data" :columns="columns" :size="s" :aria-label="'Employees ' + s" />
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
    components: { DzDataGrid },
    setup() {
      return { data: sampleData.slice(0, 4), columns }
    },
    template: `
      <div class="space-y-8">
        <div v-for="d in ['compact', 'default', 'comfortable']" :key="d">
          <p class="text-sm font-medium mb-2 capitalize">density: {{ d }}</p>
          <DzDataGrid :data="data" :columns="columns" :density="d" :aria-label="'Employees ' + d" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Sorting
// ---------------------------------------------------------------------------

export const WithSorting: Story = {
  name: 'With Sorting',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData, columns }
    },
    template: `
      <DzDataGrid :data="data" :columns="columns" sortable aria-label="Sortable employee list" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nameHeader = canvas.getByRole('columnheader', { name: /name/i })

    // Sortable, unsorted columns advertise aria-sort="none".
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none')

    // First activation sorts ascending, second toggles to descending.
    await userEvent.click(nameHeader)
    await waitFor(() => expect(nameHeader).toHaveAttribute('aria-sort', 'ascending'))
    await userEvent.click(nameHeader)
    await waitFor(() => expect(nameHeader).toHaveAttribute('aria-sort', 'descending'))
  },
}

// ---------------------------------------------------------------------------
// With Selection
// ---------------------------------------------------------------------------

export const WithSelection: Story = {
  name: 'With Row Selection',
  render: () => ({
    components: { DzDataGrid },
    data() {
      return {
        data: sampleData,
        columns,
        selected: [] as Employee[],
      }
    },
    template: `
      <div class="space-y-4">
        <DzDataGrid
          :data="data"
          :columns="columns"
          selectable="multiple"
          :selected-rows="selected"
          row-key="id"
          aria-label="Selectable employee list"
          @update:selected-rows="selected = $event"
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: {{ selected.length }} row(s)</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText(/selected: 0 row\(s\)/i)).toBeInTheDocument()

    // The header "select all" checkbox toggles every row at once.
    const selectAll = canvas.getByRole('checkbox', { name: /select all rows/i })
    await userEvent.click(selectAll)

    await waitFor(() =>
      expect(canvas.getByText(/selected: 8 row\(s\)/i)).toBeInTheDocument(),
    )
  },
}

// ---------------------------------------------------------------------------
// With Pagination
// ---------------------------------------------------------------------------

export const WithPagination: Story = {
  name: 'With Pagination',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData, columns }
    },
    template: `
      <DzDataGrid
        :data="data"
        :columns="columns"
        :pagination="{ pageSize: 4, pageSizeOptions: [4, 8, 16] }"
        aria-label="Paginated employee list"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Page 1 shows the first four rows; row 5 (Ethan Brown) is on page 2.
    await expect(canvas.getByText('Alice Johnson')).toBeInTheDocument()
    await expect(canvas.queryByText('Ethan Brown')).not.toBeInTheDocument()

    // Advancing to the next page reveals the later rows.
    await userEvent.click(canvas.getByRole('button', { name: /next page/i }))
    await waitFor(() => expect(canvas.getByText('Ethan Brown')).toBeInTheDocument())
    await expect(canvas.queryByText('Alice Johnson')).not.toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Loading State
// ---------------------------------------------------------------------------

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: args => ({
    components: { DzDataGrid },
    setup() {
      return { args }
    },
    template: '<DzDataGrid v-bind="args" aria-label="Loading employee list" />',
  }),
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

export const Empty: Story = {
  name: 'Empty State',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { columns }
    },
    template: `
      <DzDataGrid :data="[]" :columns="columns" aria-label="Empty employee list">
        <template #empty>
          <div class="text-center py-8 text-[var(--dz-muted-foreground)]">
            No employees found. Try adjusting your filters.
          </div>
        </template>
      </DzDataGrid>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [
    darkModeDecorator,
  ],
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData.slice(0, 4), columns }
    },
    template: `
      <DzDataGrid :data="data" :columns="columns" sortable aria-label="Dark mode employee list" />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData.slice(0, 4), columns }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Use Tab to navigate into the grid. Arrow keys move between cells.
          Enter or Space activates sort headers. Sortable columns are announced to screen readers.
        </p>
        <DzDataGrid
          :data="data"
          :columns="columns"
          sortable
          selectable="multiple"
          row-key="id"
          aria-label="Accessible employee data grid"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Team Dashboard
// ---------------------------------------------------------------------------

export const RealWorldTeamDashboard: Story = {
  name: 'Real World: Team Dashboard',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData, columns }
    },
    template: `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Team Members</h2>
          <span class="text-sm text-[var(--dz-muted-foreground)]">{{ data.length }} employees</span>
        </div>
        <DzDataGrid
          :data="data"
          :columns="columns"
          sortable
          selectable="multiple"
          :pagination="{ pageSize: 5, pageSizeOptions: [5, 10, 25] }"
          density="comfortable"
          row-key="id"
          aria-label="Team members data grid"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Compact Report
// ---------------------------------------------------------------------------

export const RealWorldCompactReport: Story = {
  name: 'Real World: Compact Report',
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { data: sampleData, columns }
    },
    template: `
      <DzDataGrid
        :data="data"
        :columns="columns"
        density="compact"
        size="sm"
        sortable
        aria-label="Compact employee report"
      />
    `,
  }),
}

// ---------------------------------------------------------------------------
// Performance: large dataset
// ---------------------------------------------------------------------------

const roles = ['Engineer', 'Designer', 'PM', 'Analyst', 'Support'] as const
const departments = ['Engineering', 'Design', 'Product', 'Data', 'Success'] as const
const statuses = ['Active', 'On Leave', 'Inactive'] as const

/**
 * 1,000 synthetic rows — exercises sorting + pagination at scale.
 *
 * TASK-X.7 (perf budget): generated lazily inside a story `loader` rather than
 * at module scope, so the 1k-row build cost is paid only when this story is
 * actually viewed — not on every import of this file (e.g. when rendering the
 * lightweight `Default`/`With Sorting` stories or the autodocs page).
 */
function makeLargeData(): Employee[] {
  return Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${String(i + 1).padStart(4, '0')}`,
    role: roles[i % roles.length],
    department: departments[i % departments.length],
    salary: 80000 + (i % 60) * 1000,
    status: statuses[i % statuses.length],
  }))
}

export const PerformanceLargeDataset: Story = {
  name: 'Performance: 1,000 Rows',
  parameters: {
    docs: {
      description: {
        story:
          'Sorting and pagination over a 1,000-row dataset. Pagination keeps the DOM '
          + 'small (one page rendered at a time) while sorting operates on the full set. '
          + 'The dataset is built in a lazy `loader` so the cost is only paid when this '
          + 'story is viewed (TASK-X.7).',
      },
    },
  },
  loaders: [async () => ({ largeData: makeLargeData() })],
  render: (_args, { loaded }) => ({
    components: { DzDataGrid },
    setup() {
      return { data: loaded.largeData, columns }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">{{ data.length.toLocaleString() }} rows · sortable · paginated</p>
        <DzDataGrid
          :data="data"
          :columns="columns"
          sortable
          density="compact"
          size="sm"
          :pagination="{ pageSize: 25, pageSizeOptions: [25, 50, 100] }"
          aria-label="Large employee dataset"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — ready / loading / empty (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `loading` is the state DzDataGrid declares, and it is not a decoration: while
 * it is set the root reports `aria-busy="true"` and `data-state="loading"`, and
 * the `role="grid"` table is **replaced** by the loading slot rather than
 * overlaid — so assistive technology sees a busy region with no grid inside it,
 * not a stale grid.
 *
 * Shown beside the ready grid and the no-rows case so the three renderings that
 * a consumer must handle are visible together.
 */
export const States: Story = {
  render: () => ({
    components: { DzDataGrid },
    setup() {
      return { columns, sampleData }
    },
    template: `
      <div class="space-y-8">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Ready</p>
          <DzDataGrid
            :data="sampleData.slice(0, 3)"
            :columns="columns"
            aria-label="Ready employee grid"
            data-testid="grid-ready"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Loading</p>
          <DzDataGrid
            loading
            :data="sampleData.slice(0, 3)"
            :columns="columns"
            aria-label="Loading employee grid"
            data-testid="grid-loading"
          />
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Empty</p>
          <DzDataGrid
            :data="[]"
            :columns="columns"
            aria-label="Empty employee grid"
            data-testid="grid-empty"
          >
            <template #empty>
              <div class="py-6 text-center text-[var(--dz-muted-foreground)]">
                No employees match the current filter.
              </div>
            </template>
          </DzDataGrid>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const ready = canvas.getByTestId('grid-ready')
    const loading = canvas.getByTestId('grid-loading')
    const empty = canvas.getByTestId('grid-empty')

    // Ready: not busy, and the grid is really there with its header + 3 rows.
    await expect(ready).toHaveAttribute('data-state', 'ready')
    await expect(ready).not.toHaveAttribute('aria-busy')
    const readyGrid = within(ready).getByRole('grid')
    await expect(within(readyGrid).getAllByRole('row')).toHaveLength(4)

    // Loading: busy, and the grid is replaced rather than left stale underneath.
    await expect(loading).toHaveAttribute('data-state', 'loading')
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(loading).toHaveAttribute('data-loading')
    await expect(within(loading).queryByRole('grid')).toBeNull()

    // Empty: not busy, no grid, and the consumer's empty slot is what shows.
    await expect(empty).toHaveAttribute('data-state', 'ready')
    await expect(within(empty).queryByRole('grid')).toBeNull()
    await expect(within(empty).getByText(/no employees match/i)).toBeVisible()
  },
}
