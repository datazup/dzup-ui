import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import type { DateRangeValue } from '../../src/components/forms'
import { DzDateRangePicker } from '../../src/components/forms'

/**
 * DzDateRangePicker allows users to select a start and end date range.
 *
 * Built on Reka UI DateRangePicker primitives and @internationalized/date.
 * The model value is a `DateRangeValue` object with `start` and `end` ISO strings.
 */
const meta = {
  title: 'Core/Forms/DzDateRangePicker',
  component: DzDateRangePicker,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style variant',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no range is selected',
      table: { category: 'Behavior' },
    },
    min: {
      control: 'text',
      description: 'Minimum selectable date (ISO 8601)',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'text',
      description: 'Maximum selectable date (ISO 8601)',
      table: { category: 'Behavior' },
    },
    locale: {
      control: 'text',
      description: 'Locale for date formatting (BCP 47)',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    // State
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    error: {
      control: 'text',
      description: 'Error message text',
      table: { category: 'State' },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    placeholder: 'Select date range...',
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzDateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzDateRangePicker },
    setup() {
      return { args }
    },
    template: '<DzDateRangePicker v-bind="args" class="max-w-sm" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const iframeBody = within(canvasElement.ownerDocument.body)

    // The calendar trigger button opens the range picker overlay.
    const trigger = canvas.getByRole('button', { name: /open date range picker/i })
    expect(trigger).toBeInTheDocument()

    // Click the trigger to open the calendar.
    await userEvent.click(trigger)

    // At least one calendar grid (month view) must become visible (portalled to iframe body).
    await waitFor(() => expect(iframeBody.getAllByRole('grid').length).toBeGreaterThanOrEqual(1), {
      timeout: 3000,
    })

    // Day cells are rendered as gridcells.
    await waitFor(() => expect(iframeBody.getAllByRole('gridcell').length).toBeGreaterThan(0))
  },
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzDateRangePicker variant="outline" placeholder="Outline" />
        <DzDateRangePicker variant="filled" placeholder="Filled" />
        <DzDateRangePicker variant="underlined" placeholder="Underlined" />
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
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzDateRangePicker size="xs" placeholder="Extra Small" />
        <DzDateRangePicker size="sm" placeholder="Small" />
        <DzDateRangePicker size="md" placeholder="Medium" />
        <DzDateRangePicker size="lg" placeholder="Large" />
        <DzDateRangePicker size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    components: { DzDateRangePicker },
    setup() {
      return { args }
    },
    template: '<DzDateRangePicker v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// With Constraints
// ---------------------------------------------------------------------------

export const WithConstraints: Story = {
  name: 'Min/Max Date Constraints',
  render: () => ({
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Only dates in Q1 2026 are selectable.</p>
        <DzDateRangePicker min="2026-01-01" max="2026-03-31" placeholder="Q1 2026 range" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'A valid date range is required',
  },
  render: (args) => ({
    components: { DzDateRangePicker },
    setup() {
      return { args }
    },
    template: '<DzDateRangePicker v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzDateRangePicker placeholder="Default" />
        <DzDateRangePicker placeholder="Disabled" disabled />
        <DzDateRangePicker placeholder="Invalid" invalid error="Required" />
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
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzDateRangePicker variant="outline" placeholder="Outline" />
        <DzDateRangePicker variant="filled" placeholder="Filled" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzDateRangePicker },
    data() {
      return { range: undefined as DateRangeValue | undefined }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzDateRangePicker v-model="range" placeholder="Pick a range" />
        <p class="text-sm text-gray-500">
          Selected: <strong>{{ range ? range.start + ' to ' + range.end : 'none' }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const iframeBody = within(canvasElement.ownerDocument.body)

    // Open the range picker via the trigger button.
    const trigger = canvas.getByRole('button', { name: /open date range picker/i })
    await userEvent.click(trigger)

    // Calendar grid must appear (portalled to iframe body).
    await waitFor(() => expect(iframeBody.getAllByRole('grid').length).toBeGreaterThanOrEqual(1), {
      timeout: 3000,
    })

    // Click day "10" as the start date — present in every month.
    const cells = iframeBody.getAllByRole('gridcell')
    const day10 = cells.find((el) => el.textContent?.trim() === '10')
    expect(day10).toBeDefined()
    if (day10) await userEvent.click(day10)

    // Click day "15" as the end date.
    const cells2 = iframeBody.getAllByRole('gridcell')
    const day15 = cells2.find((el) => el.textContent?.trim() === '15')
    expect(day15).toBeDefined()
    if (day15) await userEvent.click(day15)

    // After selecting both dates the output text should reflect the range.
    await waitFor(() =>
      expect(canvas.getByText(/selected:/i).closest('p')).not.toHaveTextContent('none'),
    )
  },
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzDateRangePicker },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Tab to focus, Enter to open, arrow keys to navigate, select start then end date.</p>
        <DzDateRangePicker placeholder="Keyboard navigable" aria-label="Booking date range" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Booking Period
// ---------------------------------------------------------------------------

export const RealWorldBooking: Story = {
  name: 'Real World: Hotel Booking',
  render: () => ({
    components: { DzDateRangePicker },
    template: `
      <div class="max-w-sm">
        <label class="block text-sm font-medium mb-1">Stay Dates</label>
        <DzDateRangePicker
          placeholder="Check-in - Check-out"
          min="2026-03-28"
          name="booking-dates"
          aria-label="Hotel stay dates"
        />
        <p class="text-xs text-gray-400 mt-1">Minimum stay: 1 night.</p>
      </div>
    `,
  }),
}
