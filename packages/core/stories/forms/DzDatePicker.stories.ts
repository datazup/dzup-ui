import type { Meta, StoryObj } from '@storybook/vue3'
import { DzDatePicker } from '../../src/components/forms'

/**
 * DzDatePicker is a date selection component built on Reka UI DatePicker primitives
 * and @internationalized/date for locale-aware formatting.
 *
 * It supports three input variants, five sizes, min/max date constraints,
 * locale-aware formatting, and custom trigger slots.
 */
const meta = {
  title: 'Core/Forms/DzDatePicker',
  component: DzDatePicker,
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
      description: 'Placeholder text when no date is selected',
      table: { category: 'Behavior' },
    },
    min: {
      control: 'text',
      description: 'Minimum selectable date (ISO 8601 string)',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'text',
      description: 'Maximum selectable date (ISO 8601 string)',
      table: { category: 'Behavior' },
    },
    locale: {
      control: 'text',
      description: 'Locale for date formatting (BCP 47 tag)',
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
    placeholder: 'Select a date...',
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzDatePicker>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzDatePicker },
    setup() {
      return { args }
    },
    template: '<DzDatePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker variant="outline" placeholder="Outline" />
        <DzDatePicker variant="filled" placeholder="Filled" />
        <DzDatePicker variant="underlined" placeholder="Underlined" />
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
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker size="xs" placeholder="Extra Small" />
        <DzDatePicker size="sm" placeholder="Small" />
        <DzDatePicker size="md" placeholder="Medium" />
        <DzDatePicker size="lg" placeholder="Large" />
        <DzDatePicker size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Date Constraints
// ---------------------------------------------------------------------------

export const WithConstraints: Story = {
  name: 'Min/Max Date Constraints',
  render: () => ({
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Only dates in 2026 are selectable.</p>
        <DzDatePicker min="2026-01-01" max="2026-12-31" placeholder="Pick a date in 2026" />
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
    components: { DzDatePicker },
    setup() {
      return { args }
    },
    template: '<DzDatePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'A valid date is required',
  },
  render: args => ({
    components: { DzDatePicker },
    setup() {
      return { args }
    },
    template: '<DzDatePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker placeholder="Default" />
        <DzDatePicker placeholder="Disabled" disabled />
        <DzDatePicker placeholder="Invalid" invalid error="Required" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

export const LocaleFormatting: Story = {
  name: 'Locale Formatting',
  render: () => ({
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker locale="en-US" placeholder="English (US)" />
        <DzDatePicker locale="de-DE" placeholder="German" />
        <DzDatePicker locale="ja-JP" placeholder="Japanese" />
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
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker variant="outline" placeholder="Outline" />
        <DzDatePicker variant="filled" placeholder="Filled" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzDatePicker },
    data() {
      return { date: '' }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzDatePicker v-model="date" placeholder="Pick a date" />
        <p class="text-sm text-gray-500">Selected: <strong>{{ date || 'none' }}</strong></p>
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
    components: { DzDatePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Tab to focus, Enter/Space to open calendar, arrow keys to navigate dates.</p>
        <DzDatePicker placeholder="Keyboard navigable" aria-label="Appointment date" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Birth Date
// ---------------------------------------------------------------------------

export const RealWorldBirthDate: Story = {
  name: 'Real World: Birth Date',
  render: () => ({
    components: { DzDatePicker },
    template: `
      <div class="max-w-xs">
        <label class="block text-sm font-medium mb-1">Date of Birth</label>
        <DzDatePicker
          placeholder="MM/DD/YYYY"
          max="2008-01-01"
          name="dob"
          required
          aria-label="Date of birth"
        />
        <p class="text-xs text-gray-400 mt-1">You must be at least 18 years old.</p>
      </div>
    `,
  }),
}
