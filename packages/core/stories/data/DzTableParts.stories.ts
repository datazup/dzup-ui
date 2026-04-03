import type { Meta, StoryObj } from '@storybook/vue3'
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
  tags: ['autodocs'],
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
}
