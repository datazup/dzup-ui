import type { Meta, StoryObj } from '@storybook/vue3'
import type { ColumnDef } from '../../src/components/data'
import {
  DzDataGrid,
} from '../../src/components/data'

/**
 * DzDataGrid is the most complex core data component, providing
 * sortable columns, row selection, pagination, and density controls.
 *
 * It is a compound component composed of DzDataGridHeader, DzDataGridBody,
 * and DzDataGridPagination sub-parts that receive context via inject (ADR-08).
 */

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

const meta = {
  title: 'Core/Data/DzDataGrid',
  component: DzDataGrid,
  tags: ['autodocs'],
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
        <p class="text-sm text-gray-500">Selected: {{ selected.length }} row(s)</p>
      </div>
    `,
  }),
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
          <div class="text-center py-8 text-gray-500">
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
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
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
        <p class="text-sm text-gray-500">
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
          <span class="text-sm text-gray-500">{{ data.length }} employees</span>
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
