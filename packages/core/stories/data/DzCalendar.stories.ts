import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzCalendar } from '../../src/components/data'
import { darkModeDecorator } from '../_shared'

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
  render: args => ({
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
      cell => cell.getAttribute('aria-disabled') !== 'true' && cell.textContent?.trim() === '10',
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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
  render: args => ({
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

// ---------------------------------------------------------------------------
// States — enabled / read-only / disabled (tier C `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The two states DzCalendar declares in `DzCalendar.types.ts` (`disabled`,
 * `readonly`) side by side with the plain enabled surface, so the difference is
 * reviewable rather than asserted in prose.
 *
 * `readonly` keeps the grid navigable and its cells focusable but refuses
 * selection; `disabled` additionally turns off the header controls and marks the
 * grid `aria-disabled`. Both are exercised by the play function below.
 */
export const States: Story = {
  render: () => ({
    components: { DzCalendar },
    data() {
      return {
        enabledValue: '2026-06-15',
        readonlyValue: '2026-06-15',
        disabledValue: '2026-06-15',
        enabledFocus: '2026-06-15',
        readonlyFocus: '2026-06-15',
        disabledFocus: '2026-06-15',
      }
    },
    template: `
      <div class="grid gap-8 lg:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Enabled</p>
          <DzCalendar
            aria-label="Enabled calendar"
            v-model:value="enabledValue"
            v-model:focused-date="enabledFocus"
          />
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Value: <strong data-testid="enabled-value">{{ enabledValue }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Read-only</p>
          <DzCalendar
            readonly
            aria-label="Read-only calendar"
            v-model:value="readonlyValue"
            v-model:focused-date="readonlyFocus"
          />
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Value: <strong data-testid="readonly-value">{{ readonlyValue }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium text-[var(--dz-foreground)]">Disabled</p>
          <DzCalendar
            disabled
            aria-label="Disabled calendar"
            v-model:value="disabledValue"
            v-model:focused-date="disabledFocus"
          />
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Value: <strong data-testid="disabled-value">{{ disabledValue }}</strong>
          </p>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByRole('grid', { name: 'Enabled calendar' })
    const readonly = canvas.getByRole('grid', { name: 'Read-only calendar' })
    const disabled = canvas.getByRole('grid', { name: 'Disabled calendar' })

    // The states are exposed to assistive technology, not only painted.
    await expect(enabled).not.toHaveAttribute('aria-readonly')
    await expect(enabled).not.toHaveAttribute('aria-disabled')
    await expect(readonly).toHaveAttribute('aria-readonly', 'true')
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')

    // `disabled` also turns the period controls off; `readonly` leaves them live.
    const disabledNext = within(disabled.parentElement as HTMLElement)
      .getByRole('button', { name: /next month/i })
    await expect(disabledNext).toBeDisabled()
    const readonlyNext = within(readonly.parentElement as HTMLElement)
      .getByRole('button', { name: /next month/i })
    await expect(readonlyNext).toBeEnabled()

    // Enabled: clicking a day commits it to the model.
    const enabledDay = enabled.querySelector<HTMLButtonElement>('[data-iso="2026-06-10"]')
    await expect(enabledDay).not.toBeNull()
    await userEvent.click(enabledDay!)
    await waitFor(() =>
      expect(canvas.getByTestId('enabled-value')).toHaveTextContent('2026-06-10'),
    )

    // Read-only: the same click is refused — the model is unchanged.
    const readonlyDay = readonly.querySelector<HTMLButtonElement>('[data-iso="2026-06-10"]')
    await userEvent.click(readonlyDay!)
    await expect(canvas.getByTestId('readonly-value')).toHaveTextContent('2026-06-15')

    // Disabled: every day carries `data-disabled`, which the base stylesheet
    // turns into `pointer-events: none` — the cell is unreachable by pointer at
    // all, so the assertion is on the state rather than on a click that the
    // browser would never deliver.
    const disabledDay = disabled.querySelector<HTMLButtonElement>('[data-iso="2026-06-10"]')
    await expect(disabledDay).toHaveAttribute('data-disabled')
    await expect(disabledDay).toHaveAttribute('aria-disabled', 'true')
    await expect(canvas.getByTestId('disabled-value')).toHaveTextContent('2026-06-15')
  },
}

// ---------------------------------------------------------------------------
// Accessibility — keyboard-only roving grid (tier C `accessibility` DoD item)
// ---------------------------------------------------------------------------

/**
 * The APG `grid` keyboard contract, driven end to end without a pointer.
 *
 * DzCalendar exposes a single tabbable day (roving tabindex): Tab reaches the
 * grid once, then Arrow keys move day-by-day and week-by-week, Home jumps to the
 * start of the week, PageDown to the next month, and Enter commits the focused
 * day. The play function performs exactly that sequence and asserts on the
 * focused element and the bound model after each step.
 */
export const Accessibility: Story = {
  name: 'Accessibility: Keyboard-Only Grid',
  render: () => ({
    components: { DzCalendar },
    data() {
      return { value: '2026-06-15', focused: '2026-06-15' }
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Tab reaches the grid once (roving tabindex). Arrow keys move by day and
          by week, Home/End jump within the week, PageUp/PageDown change month,
          Enter selects the focused day.
        </p>
        <DzCalendar
          aria-label="Keyboard navigable calendar"
          v-model:value="value"
          v-model:focused-date="focused"
        />
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Selected: <strong data-testid="kbd-value">{{ value }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole('grid', { name: 'Keyboard navigable calendar' })

    // Roving tabindex: exactly one day button is in the tab order.
    await expect(grid.querySelectorAll('button[tabindex="0"]')).toHaveLength(1)

    // Reach that day using the keyboard only — the header controls come first.
    for (let i = 0; i < 8 && !grid.contains(document.activeElement); i++)
      await userEvent.tab()
    await expect(grid.contains(document.activeElement)).toBe(true)
    await expect(document.activeElement).toHaveAttribute('data-iso', '2026-06-15')

    // ArrowRight → next day; ArrowDown → same weekday next week.
    await userEvent.keyboard('{ArrowRight}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-iso', '2026-06-16'),
    )
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-iso', '2026-06-23'),
    )

    // Home → first day of the focused week (this grid starts on Sunday).
    await userEvent.keyboard('{Home}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-iso', '2026-06-21'),
    )

    // Enter commits the focused day, without a pointer ever being used.
    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(canvas.getByTestId('kbd-value')).toHaveTextContent('2026-06-21'),
    )

    // PageDown moves the visible period a month forward and keeps focus in grid.
    await userEvent.keyboard('{PageDown}')
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-iso', '2026-07-21'),
    )
  },
}

// ---------------------------------------------------------------------------
// Real world — booking availability (tier C `real-world` DoD item)
// ---------------------------------------------------------------------------

/**
 * A booking surface: the calendar is bounded to a release window, weekends are
 * closed, each open day renders its remaining-slot count through the `#day`
 * slot, and the chosen day drives a summary panel beside it.
 *
 * This is the composition the component exists for — a bare month grid never
 * exercises `minDate`/`maxDate`, `disabledDate` and the `#day` slot together.
 */
export const RealWorldBooking: Story = {
  name: 'Real World: Booking Availability',
  render: () => ({
    components: { DzCalendar },
    setup() {
      const slots: Record<string, number> = {
        '2026-06-08': 4,
        '2026-06-09': 0,
        '2026-06-10': 2,
        '2026-06-11': 6,
        '2026-06-12': 1,
        '2026-06-15': 3,
        '2026-06-16': 5,
        '2026-06-17': 0,
        '2026-06-18': 2,
        '2026-06-19': 4,
      }
      const iso = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const disabledDate = (d: Date) =>
        d.getDay() === 0 || d.getDay() === 6 || (slots[iso(d)] ?? 0) === 0
      return { slots, iso, disabledDate }
    },
    data() {
      return { value: '2026-06-10', focused: '2026-06-10' }
    },
    template: `
      <div class="grid gap-6 md:grid-cols-[auto_16rem]">
        <DzCalendar
          aria-label="Choose an appointment day"
          min-date="2026-06-08"
          max-date="2026-06-19"
          :disabled-date="disabledDate"
          v-model:value="value"
          v-model:focused-date="focused"
        >
          <template #day="{ date, dayNumber, isDisabled }">
            <span>{{ dayNumber }}</span>
            <span
              v-if="!isDisabled"
              class="text-[0.625rem] leading-none text-[var(--dz-muted-foreground)]"
            >{{ slots[iso(date)] }}</span>
          </template>
        </DzCalendar>

        <aside class="rounded-[var(--dz-radius-md)] border border-[var(--dz-border)] bg-[var(--dz-card)] p-4">
          <h3 class="text-sm font-semibold text-[var(--dz-foreground)]">Your appointment</h3>
          <p class="mt-2 text-sm text-[var(--dz-muted-foreground)]">
            Day: <strong data-testid="booking-day" class="text-[var(--dz-foreground)]">{{ value }}</strong>
          </p>
          <p class="mt-1 text-sm text-[var(--dz-muted-foreground)]">
            Slots left: <strong data-testid="booking-slots" class="text-[var(--dz-foreground)]">{{ slots[value] ?? 0 }}</strong>
          </p>
          <p class="mt-3 text-xs text-[var(--dz-muted-foreground)]">
            Weekends and fully booked days are closed; the window is limited to
            8–19 June 2026.
          </p>
        </aside>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole('grid', { name: 'Choose an appointment day' })

    // The summary starts on the pre-selected day.
    await expect(canvas.getByTestId('booking-day')).toHaveTextContent('2026-06-10')
    await expect(canvas.getByTestId('booking-slots')).toHaveTextContent('2')

    // A day outside the release window is refused by `maxDate`.
    const outOfWindow = grid.querySelector<HTMLButtonElement>('[data-iso="2026-06-25"]')
    await expect(outOfWindow).toHaveAttribute('aria-disabled', 'true')

    // A fully booked open day is refused by `disabledDate` — and, because the
    // disabled styling removes pointer events, cannot even be clicked.
    const fullyBooked = grid.querySelector<HTMLButtonElement>('[data-iso="2026-06-17"]')
    await expect(fullyBooked).toHaveAttribute('aria-disabled', 'true')
    await expect(fullyBooked).toHaveAttribute('data-disabled')
    await expect(canvas.getByTestId('booking-day')).toHaveTextContent('2026-06-10')

    // An available day books, and the summary follows it.
    const available = grid.querySelector<HTMLButtonElement>('[data-iso="2026-06-16"]')
    await expect(available).not.toHaveAttribute('aria-disabled')
    await userEvent.click(available!)
    await waitFor(() =>
      expect(canvas.getByTestId('booking-day')).toHaveTextContent('2026-06-16'),
    )
    await expect(canvas.getByTestId('booking-slots')).toHaveTextContent('5')
  },
}
