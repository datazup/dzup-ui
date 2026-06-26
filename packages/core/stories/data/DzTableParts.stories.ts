import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
} from '../../src/components/data'

/**
 * DzTable compound sub-parts: DzTableHeader, DzTableBody, DzTableRow, DzTableCell.
 *
 * These sub-parts receive context (size, density, striped, hoverable) from the
 * DzTable root via inject (ADR-08). DzTableCell supports header mode, alignment,
 * colspan, and rowspan props for full semantic table construction.
 */

const meta = {
  title: 'Core/Data/DzTableParts',
  component: DzTableCell,
  subcomponents: {
    DzTableHeader,
    DzTableBody,
    DzTableRow,
  },
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    header: {
      control: 'boolean',
      description: 'Renders as <th> instead of <td>',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment within the cell',
      table: { category: 'Appearance', defaultValue: { summary: 'left' } },
    },
    colspan: {
      control: 'number',
      description: 'Column span for this cell',
      table: { category: 'Behavior' },
    },
    rowspan: {
      control: 'number',
      description: 'Row span for this cell',
      table: { category: 'Behavior' },
    },
  },
} satisfies Meta<typeof DzTableCell>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: Sub-parts in context
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Team members">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Name</DzTableCell>
            <DzTableCell header>Role</DzTableCell>
            <DzTableCell header align="right">Hours</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>Alice</DzTableCell>
            <DzTableCell>Engineer</DzTableCell>
            <DzTableCell align="right">40</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>Bob</DzTableCell>
            <DzTableCell>Designer</DzTableCell>
            <DzTableCell align="right">36</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table')
    await expect(table).toBeInTheDocument()
    const headers = canvas.getAllByRole('columnheader')
    await expect(headers).toHaveLength(3)
    const rows = canvas.getAllByRole('row')
    // 1 header row + 2 body rows
    await expect(rows.length).toBeGreaterThanOrEqual(3)
    await expect(canvas.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Cell Alignment Variations
// ---------------------------------------------------------------------------

export const CellAlignment: Story = {
  name: 'Cell Alignment',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Alignment demo">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header align="left">Left</DzTableCell>
            <DzTableCell header align="center">Center</DzTableCell>
            <DzTableCell header align="right">Right</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell align="left">Left-aligned content</DzTableCell>
            <DzTableCell align="center">Center-aligned content</DzTableCell>
            <DzTableCell align="right">Right-aligned content</DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table')
    await expect(table).toBeInTheDocument()
    const headers = canvas.getAllByRole('columnheader')
    await expect(headers).toHaveLength(3)
    const leftHeader = canvas.getByRole('columnheader', { name: /left/i })
    await expect(leftHeader).toHaveClass('text-left')
    const centerHeader = canvas.getByRole('columnheader', { name: /center/i })
    await expect(centerHeader).toHaveClass('text-center')
    const rightHeader = canvas.getByRole('columnheader', { name: /right/i })
    await expect(rightHeader).toHaveClass('text-right')
  },
}

// ---------------------------------------------------------------------------
// Row Selection State
// ---------------------------------------------------------------------------

export const RowSelection: Story = {
  name: 'Row Selected State',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    data() {
      return { selectedRow: 1 }
    },
    template: `
      <div class="space-y-3">
        <DzTable hoverable variant="bordered" aria-label="Selectable rows">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>ID</DzTableCell>
              <DzTableCell header>Name</DzTableCell>
              <DzTableCell header>Status</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow
              v-for="(row, i) in [{id: 1, name: 'Alice', status: 'Active'}, {id: 2, name: 'Bob', status: 'Inactive'}, {id: 3, name: 'Charlie', status: 'Active'}]"
              :key="row.id"
              :selected="selectedRow === i"
              style="cursor: pointer"
              @click="selectedRow = i"
            >
              <DzTableCell>{{ row.id }}</DzTableCell>
              <DzTableCell>{{ row.name }}</DzTableCell>
              <DzTableCell>{{ row.status }}</DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
        <p class="text-sm text-gray-500">Click a row to select it. Selected index: {{ selectedRow }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole('table')
    await expect(table).toBeInTheDocument()
    // Initial state: row at index 1 (Bob) is selected
    const rows = canvas.getAllByRole('row')
    // rows[0] = header row, rows[1..3] = body rows
    await expect(rows[2]).toHaveAttribute('aria-selected', 'true')
    // Click the first body row (Alice) and verify selection moves
    await userEvent.click(rows[1])
    await waitFor(() => expect(rows[1]).toHaveAttribute('aria-selected', 'true'))
    await expect(rows[2]).not.toHaveAttribute('aria-selected', 'true')
  },
}

// ---------------------------------------------------------------------------
// Complex Spans
// ---------------------------------------------------------------------------

export const ComplexSpans: Story = {
  name: 'Complex Colspan & Rowspan',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <DzTable variant="bordered" aria-label="Schedule with spans">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>Time</DzTableCell>
            <DzTableCell header>Monday</DzTableCell>
            <DzTableCell header>Tuesday</DzTableCell>
            <DzTableCell header>Wednesday</DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow>
            <DzTableCell>9:00 AM</DzTableCell>
            <DzTableCell :rowspan="2">Team Standup</DzTableCell>
            <DzTableCell>Code Review</DzTableCell>
            <DzTableCell>Sprint Planning</DzTableCell>
          </DzTableRow>
          <DzTableRow>
            <DzTableCell>10:00 AM</DzTableCell>
            <DzTableCell :colspan="2" align="center">Workshop Session</DzTableCell>
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
  name: 'Accessibility: Header Scope',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          DzTableCell with header=true renders a th element with scope="col".
          Screen readers use these scope attributes to associate data cells with
          their column headers. DzTableRow with selected highlights the active row.
        </p>
        <DzTable variant="bordered" aria-label="Accessible data table">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Product</DzTableCell>
              <DzTableCell header align="right">Price</DzTableCell>
              <DzTableCell header align="right">Qty</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow>
              <DzTableCell>Widget A</DzTableCell>
              <DzTableCell align="right">$9.99</DzTableCell>
              <DzTableCell align="right">142</DzTableCell>
            </DzTableRow>
            <DzTableRow selected>
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
    const table = canvas.getByRole('table')
    await expect(table).toBeInTheDocument()
    // All column headers must carry scope="col"
    const headers = canvas.getAllByRole('columnheader')
    await expect(headers).toHaveLength(3)
    for (const th of headers) {
      await expect(th).toHaveAttribute('scope', 'col')
    }
    // The pre-selected row (Widget B) carries aria-selected="true"
    const rows = canvas.getAllByRole('row')
    // rows[0] = header row, rows[1] = Widget A, rows[2] = Widget B (selected)
    await expect(rows[2]).toHaveAttribute('aria-selected', 'true')
    await expect(rows[1]).not.toHaveAttribute('aria-selected', 'true')
  },
}
