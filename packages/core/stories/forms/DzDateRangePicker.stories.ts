import type { Meta, StoryObj } from '@storybook/vue3'
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
  tags: ['autodocs'],
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
  render: args => ({
    components: { DzDateRangePicker },
    setup() {
      return { args }
    },
    template: '<DzDateRangePicker v-bind="args" class="max-w-sm" />',
  }),
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
  render: args => ({
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
  render: args => ({
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
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
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
