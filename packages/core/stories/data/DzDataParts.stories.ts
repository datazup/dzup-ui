import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
} from '../../src/components/data'
import {
  DzDataGrid,
  DzDataGridBody,
  DzDataGridHeader,
  DzDataGridPagination,
} from '../../src/components/data'
import {
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
} from '../../src/components/data'
import type { ColumnDef } from '../../src/components/data'

/**
 * Data family compound sub-parts anatomy reference.
 *
 * This story file documents three compound families and their sub-parts:
 *
 * **Accordion** (Reka UI ADR-07)
 * - `DzAccordion` — root (single / multiple mode)
 * - `DzAccordionItem` — individual item; owns the open/closed state
 * - `DzAccordionTrigger` — clickable header; toggles the item
 * - `DzAccordionContent` — animated panel revealed when item is open
 *
 * **DataGrid**
 * - `DzDataGrid` — root; owns column definitions, rows, pagination config
 * - `DzDataGridHeader` — sticky header row with sortable column heads
 * - `DzDataGridBody` — scrollable row area; renders cell slots
 * - `DzDataGridPagination` — page controls wired to DzDataGrid state
 *
 * **Table**
 * - `DzTable` — root semantic table with variant / density context
 * - `DzTableHeader` — `<thead>` wrapper
 * - `DzTableBody` — `<tbody>` wrapper
 * - `DzTableRow` — `<tr>`; supports selected state
 * - `DzTableCell` — `<td>` / `<th>`; supports header, align, colspan, rowspan
 */

// Use DzAccordionContent as the primary because it is the most leaf-like
// compound part and drives the panel open/close behaviour consumers see.
const meta = {
  title: 'Core/Data/DzDataParts',
  component: DzAccordionContent,
  subcomponents: {
    DzAccordion,
    DzAccordionItem,
    DzAccordionTrigger,
    DzDataGrid,
    DzDataGridBody,
    DzDataGridHeader,
    DzDataGridPagination,
    DzTable,
    DzTableBody,
    DzTableCell,
    DzTableHeader,
    DzTableRow,
  },
  tags: ['autodocs', 'status:stable'],
} satisfies Meta<typeof DzAccordionContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Accordion Anatomy
// ---------------------------------------------------------------------------

export const AccordionAnatomy: Story = {
  name: 'Accordion: Sub-Parts Anatomy',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    template: `
      <div class="space-y-6 max-w-md">
        <div class="space-y-1">
          <p class="text-sm font-semibold">Accordion sub-parts</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">
            DzAccordion owns mode (single / multiple). Each DzAccordionItem wraps a
            DzAccordionTrigger (the clickable header) and a DzAccordionContent (the
            animated panel). Context flows via DZ_ACCORDION_KEY.
          </p>
        </div>

        <DzAccordion type="single" collapsible class="border border-[var(--dz-border)] rounded-lg divide-y divide-[var(--dz-border)]">
          <DzAccordionItem value="what">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">
              What is DzAccordionItem?
            </DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">
              DzAccordionItem wraps a single accordion entry. It receives its open/closed
              state from DzAccordion via the injected context keyed by <code>value</code>.
            </DzAccordionContent>
          </DzAccordionItem>

          <DzAccordionItem value="trigger">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">
              What does DzAccordionTrigger do?
            </DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">
              DzAccordionTrigger is a <code>button</code> that toggles its parent
              DzAccordionItem. It renders a chevron icon that rotates when the item
              is open, and carries the correct ARIA attributes (aria-expanded,
              aria-controls).
            </DzAccordionContent>
          </DzAccordionItem>

          <DzAccordionItem value="content">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">
              How does DzAccordionContent animate?
            </DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">
              DzAccordionContent uses a CSS height transition keyed on
              <code>--reka-accordion-content-height</code> from Reka UI. The content
              panel is always rendered in the DOM (display:none only when closed) so
              search indexers can discover it.
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzAccordion</strong> — root; type="single" | "multiple", collapsible</p>
          <p><strong>DzAccordionItem</strong> — item wrapper; value prop is the identity key</p>
          <p><strong>DzAccordionTrigger</strong> — header button; toggles item, shows chevron</p>
          <p><strong>DzAccordionContent</strong> — animated panel; aria-labelledby wired automatically</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accordion: Multiple Mode
// ---------------------------------------------------------------------------

export const AccordionMultiple: Story = {
  name: 'Accordion: Multiple Mode',
  render: () => ({
    components: { DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent },
    setup() {
      const faqs = [
        {
          value: 'tokens',
          q: 'What are design tokens?',
          a: 'Design tokens are named values for colors, spacing, and typography that create a shared design vocabulary across code and design tools.',
        },
        {
          value: 'variants',
          q: 'What is tailwind-variants?',
          a: 'tailwind-variants (tv) is a library that composes Tailwind CSS class strings with variant support and automatic conflict resolution.',
        },
        {
          value: 'reka',
          q: 'Why Reka UI?',
          a: 'Reka UI provides headless, accessible primitives (ADR-07) so dzup-ui can focus on styling and API design rather than reimplementing focus management.',
        },
      ]
      return { faqs }
    },
    template: `
      <div class="max-w-md space-y-3">
        <p class="text-xs text-[var(--dz-muted-foreground)]">
          type="multiple" allows several items open simultaneously.
        </p>
        <DzAccordion type="multiple" class="border border-[var(--dz-border)] rounded-lg divide-y divide-[var(--dz-border)]">
          <DzAccordionItem v-for="faq in faqs" :key="faq.value" :value="faq.value">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">{{ faq.q }}</DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">{{ faq.a }}</DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// DataGrid Anatomy
// ---------------------------------------------------------------------------

export const DataGridAnatomy: Story = {
  name: 'DataGrid: Sub-Parts Anatomy',
  render: () => ({
    components: { DzDataGrid, DzDataGridHeader, DzDataGridBody, DzDataGridPagination },
    setup() {
      type Row = { id: number; name: string; role: string; status: string }
      const columns: ColumnDef<Row>[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
      ]
      const rows: Row[] = [
        { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
        { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active' },
        { id: 3, name: 'Carol White', role: 'PM', status: 'Away' },
        { id: 4, name: 'Dave Brown', role: 'Engineer', status: 'Inactive' },
        { id: 5, name: 'Eve Davis', role: 'QA', status: 'Active' },
      ]
      const pagination = { page: 1, pageSize: 3, total: rows.length }
      return { columns, rows, pagination }
    },
    template: `
      <div class="space-y-6 max-w-2xl">
        <div class="space-y-1">
          <p class="text-sm font-semibold">DataGrid sub-parts</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">
            DzDataGrid is the root that owns column defs, row data, and pagination.
            DzDataGridHeader renders sticky sortable column heads.
            DzDataGridBody renders the row area. DzDataGridPagination is wired to
            root state via DZ_DATA_GRID_KEY context.
          </p>
        </div>

        <DzDataGrid :columns="columns" :rows="rows" :data="rows" :pagination="pagination" aria-label="Team members">
          <DzDataGridHeader />
          <DzDataGridBody />
          <DzDataGridPagination />
        </DzDataGrid>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzDataGrid</strong> — root; owns columns, rows, sort, filter, pagination config</p>
          <p><strong>DzDataGridHeader</strong> — sticky thead; sortable column head cells</p>
          <p><strong>DzDataGridBody</strong> — scrollable tbody; renders cell slot per column</p>
          <p><strong>DzDataGridPagination</strong> — page controls; reads/writes page via injected context</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Table Anatomy
// ---------------------------------------------------------------------------

export const TableAnatomy: Story = {
  name: 'Table: Sub-Parts Anatomy',
  render: () => ({
    components: { DzTable, DzTableHeader, DzTableBody, DzTableRow, DzTableCell },
    template: `
      <div class="space-y-6 max-w-xl">
        <div class="space-y-1">
          <p class="text-sm font-semibold">Table sub-parts</p>
          <p class="text-xs text-[var(--dz-muted-foreground)]">
            DzTable is the root semantic table. Sub-parts map 1-to-1 to HTML table
            elements: DzTableHeader (thead), DzTableBody (tbody), DzTableRow (tr),
            DzTableCell (td / th). Context (variant, density, striped) flows from
            DzTable via DZ_TABLE_KEY.
          </p>
        </div>

        <DzTable variant="bordered" striped hoverable aria-label="Project overview">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>#</DzTableCell>
              <DzTableCell header>Project</DzTableCell>
              <DzTableCell header>Owner</DzTableCell>
              <DzTableCell header align="right">Progress</DzTableCell>
              <DzTableCell header align="center">Status</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in rows" :key="row.id" :selected="row.selected">
              <DzTableCell>{{ row.id }}</DzTableCell>
              <DzTableCell>{{ row.project }}</DzTableCell>
              <DzTableCell>{{ row.owner }}</DzTableCell>
              <DzTableCell align="right">{{ row.progress }}%</DzTableCell>
              <DzTableCell align="center">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :style="row.statusStyle"
                >{{ row.status }}</span>
              </DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>

        <div class="space-y-1 text-xs text-[var(--dz-muted-foreground)]">
          <p><strong>DzTable</strong> — root; variant (plain / bordered / striped), density, hoverable</p>
          <p><strong>DzTableHeader</strong> — thead wrapper; receives context from DzTable</p>
          <p><strong>DzTableBody</strong> — tbody wrapper; receives context from DzTable</p>
          <p><strong>DzTableRow</strong> — tr; selected prop highlights the row</p>
          <p><strong>DzTableCell</strong> — td/th; header, align, colspan, rowspan props</p>
        </div>
      </div>
    `,
    setup() {
      const rows = [
        {
          id: 1,
          project: 'Design System Core',
          owner: 'Alice',
          progress: 92,
          status: 'Active',
          selected: true,
          statusStyle: 'background: var(--dz-success); color: var(--dz-success-foreground);',
        },
        {
          id: 2,
          project: 'Token Migration',
          owner: 'Bob',
          progress: 64,
          status: 'In Progress',
          selected: false,
          statusStyle: 'background: var(--dz-primary); color: var(--dz-primary-foreground);',
        },
        {
          id: 3,
          project: 'Storybook Coverage',
          owner: 'Carol',
          progress: 41,
          status: 'Pending',
          selected: false,
          statusStyle: 'background: var(--dz-muted); color: var(--dz-muted-foreground);',
        },
        {
          id: 4,
          project: 'A11y Audit',
          owner: 'Dave',
          progress: 15,
          status: 'Blocked',
          selected: false,
          statusStyle: 'background: var(--dz-danger); color: var(--dz-danger-foreground);',
        },
      ]
      return { rows }
    },
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzAccordion,
      DzAccordionItem,
      DzAccordionTrigger,
      DzAccordionContent,
      DzTable,
      DzTableHeader,
      DzTableBody,
      DzTableRow,
      DzTableCell,
    },
    template: `
      <div class="space-y-8 max-w-lg">
        <DzAccordion type="single" collapsible class="border border-[var(--dz-border)] rounded-lg divide-y divide-[var(--dz-border)]">
          <DzAccordionItem value="dark1">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">Dark Accordion Item 1</DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">
              Token-driven colors adapt seamlessly to the dark theme.
            </DzAccordionContent>
          </DzAccordionItem>
          <DzAccordionItem value="dark2">
            <DzAccordionTrigger class="px-4 py-3 text-sm font-medium">Dark Accordion Item 2</DzAccordionTrigger>
            <DzAccordionContent class="px-4 pb-4 text-sm text-[var(--dz-muted-foreground)]">
              No hardcoded colors — every surface uses var(--dz-*) tokens.
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>

        <DzTable variant="bordered" striped aria-label="Dark mode table">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Name</DzTableCell>
              <DzTableCell header>Role</DzTableCell>
              <DzTableCell header align="right">Score</DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow>
              <DzTableCell>Alice</DzTableCell>
              <DzTableCell>Engineer</DzTableCell>
              <DzTableCell align="right">98</DzTableCell>
            </DzTableRow>
            <DzTableRow selected>
              <DzTableCell>Bob</DzTableCell>
              <DzTableCell>Designer</DzTableCell>
              <DzTableCell align="right">87</DzTableCell>
            </DzTableRow>
            <DzTableRow>
              <DzTableCell>Carol</DzTableCell>
              <DzTableCell>PM</DzTableCell>
              <DzTableCell align="right">74</DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </div>
    `,
  }),
}
