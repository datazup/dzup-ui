import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import { DzCalendar } from '../../src/components/data'

/**
 * DzCalendar is a full-surface month/week calendar for date selection and
 * day-cell content (events, counts, badges).
 *
 * It reuses the same `@internationalized/date` math that powers DzDatePicker,
 * adds single / multiple / range selection, a roving-tabindex `role="grid"`,
 * and a `#day` slot for rendering content inside each cell.
 */
const meta = {
  title: 'Core/Data/DzCalendar',
  component: DzCalendar,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
      description: 'Selection mode',
      table: { category: 'Behavior', defaultValue: { summary: 'single' } },
    },
    view: {
      control: 'select',
      options: ['month', 'week'],
      description: 'View granularity',
      table: { category: 'Behavior', defaultValue: { summary: 'month' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    firstDayOfWeek: {
      control: { type: 'number', min: 0, max: 6 },
      description: 'First day of the week (0 = Sunday … 6 = Saturday)',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    minDate: {
      control: 'text',
      description: 'Minimum selectable date (ISO 8601 string)',
      table: { category: 'Behavior' },
    },
    maxDate: {
      control: 'text',
      description: 'Maximum selectable date (ISO 8601 string)',
      table: { category: 'Behavior' },
    },
    locale: {
      control: 'text',
      description: 'Locale for formatting (BCP 47 tag)',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents all interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only -- navigable but not selectable',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    mode: 'single',
    view: 'month',
    size: 'md',
    firstDayOfWeek: 0,
  },
} satisfies Meta<typeof DzCalendar>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Month
// ---------------------------------------------------------------------------

export const Month: Story = {
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      return { args }
    },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `
      <div class="space-y-3">
        <DzCalendar v-bind="args" v-model:value="value" v-model:focusedDate="focused" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ value || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The calendar grid should be present.
    const grid = canvas.getByRole('grid')
    await expect(grid).toBeVisible()

    // Navigate to next month via the next button.
    const nextBtn = canvas.getByRole('button', { name: /next/i })
    await userEvent.click(nextBtn)

    // Grid is still rendered after navigation.
    await waitFor(() => expect(canvas.getByRole('grid')).toBeVisible())

    // Navigate back to previous month.
    const prevBtn = canvas.getByRole('button', { name: /prev/i })
    await userEvent.click(prevBtn)
    await waitFor(() => expect(canvas.getByRole('grid')).toBeVisible())

    // Click a day cell to select it — day 10 is always present in a month grid.
    const dayCells = canvas.getAllByRole('gridcell')
    const clickable = dayCells.find(
      (cell) => cell.getAttribute('aria-disabled') !== 'true' && cell.textContent?.trim() === '10',
    )
    if (clickable) {
      await userEvent.click(clickable)
      await waitFor(() => expect(canvas.getByText(/selected:/i)).toBeInTheDocument())
    }
  },
}

// ---------------------------------------------------------------------------
// Week
// ---------------------------------------------------------------------------

export const Week: Story = {
  args: { view: 'week' },
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      return { args }
    },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `<DzCalendar v-bind="args" v-model:value="value" v-model:focusedDate="focused" />`,
  }),
}

// ---------------------------------------------------------------------------
// Range Selection
// ---------------------------------------------------------------------------

export const RangeSelection: Story = {
  name: 'Range Selection',
  args: { mode: 'range' },
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      return { args }
    },
    data() {
      return { value: { start: '2026-06-10', end: '2026-06-18' }, focused: '2026-06-15' }
    },
    template: `
      <div class="space-y-3">
        <DzCalendar v-bind="args" v-model:value="value" v-model:focusedDate="focused" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Range: <strong>{{ value.start || '—' }}</strong> → <strong>{{ value.end || '—' }}</strong>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Event Dots (#day slot)
// ---------------------------------------------------------------------------

export const WithEventDots: Story = {
  name: 'With Event Dots',
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      const events = new Set(['2026-06-04', '2026-06-12', '2026-06-12', '2026-06-21', '2026-06-25'])
      const iso = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { args, events, iso }
    },
    data() {
      return { value: '2026-06-12', focused: '2026-06-15' }
    },
    template: `
      <DzCalendar v-bind="args" v-model:value="value" v-model:focusedDate="focused">
        <template #day="{ date, dayNumber, isSelected }">
          <span>{{ dayNumber }}</span>
          <span
            v-if="events.has(iso(date))"
            class="mt-0.5 h-1 w-1 rounded-full"
            :class="isSelected ? 'bg-[var(--dz-primary-foreground)]' : 'bg-[var(--dz-primary)]'"
          />
        </template>
      </DzCalendar>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Dates
// ---------------------------------------------------------------------------

export const DisabledDates: Story = {
  name: 'Disabled Dates (weekends)',
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      const disabledDate = (d: Date) => d.getDay() === 0 || d.getDay() === 6
      return { args, disabledDate }
    },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Weekends are not selectable.</p>
        <DzCalendar v-bind="args" :disabled-date="disabledDate" v-model:value="value" v-model:focusedDate="focused" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Min / Max
// ---------------------------------------------------------------------------

export const MinMax: Story = {
  name: 'Min / Max Constraints',
  args: { minDate: '2026-06-08', maxDate: '2026-06-22' },
  render: (args) => ({
    components: { DzCalendar },
    setup() {
      return { args }
    },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Only Jun 8–22, 2026 are selectable.</p>
        <DzCalendar v-bind="args" v-model:value="value" v-model:focusedDate="focused" />
      </div>
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
    components: { DzCalendar },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `<DzCalendar v-model:value="value" v-model:focusedDate="focused" />`,
  }),
}
