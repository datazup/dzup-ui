import type { Meta, StoryObj } from '@storybook/vue3'
import { DzTimePicker } from '../../src/components/forms'

/**
 * DzTimePicker allows users to select a time value.
 *
 * Built on Reka UI TimeFieldRoot. Supports min/max time constraints,
 * step intervals, 12/24-hour format, locale-aware formatting,
 * and all standard input variants and sizes.
 */
const meta = {
  title: 'Core/Forms/DzTimePicker',
  component: DzTimePicker,
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
      description: 'Placeholder text when no time is selected',
      table: { category: 'Behavior' },
    },
    min: {
      control: 'text',
      description: 'Minimum selectable time (HH:mm format)',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'text',
      description: 'Maximum selectable time (HH:mm format)',
      table: { category: 'Behavior' },
    },
    step: {
      control: 'number',
      description: 'Step interval in minutes',
      table: { category: 'Behavior' },
    },
    locale: {
      control: 'text',
      description: 'Locale for time formatting (BCP 47 tag)',
      table: { category: 'Behavior' },
    },
    hour12: {
      control: 'boolean',
      description: 'Use 12-hour format (default: follows locale)',
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
    placeholder: 'Select time...',
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzTimePicker>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzTimePicker },
    setup() {
      return { args }
    },
    template: '<DzTimePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker variant="outline" placeholder="Outline" />
        <DzTimePicker variant="filled" placeholder="Filled" />
        <DzTimePicker variant="underlined" placeholder="Underlined" />
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
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker size="xs" placeholder="Extra Small" />
        <DzTimePicker size="sm" placeholder="Small" />
        <DzTimePicker size="md" placeholder="Medium" />
        <DzTimePicker size="lg" placeholder="Large" />
        <DzTimePicker size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// 12-Hour Format
// ---------------------------------------------------------------------------

export const TwelveHourFormat: Story = {
  name: '12-Hour Format',
  render: () => ({
    components: { DzTimePicker },
    template: '<DzTimePicker :hour12="true" placeholder="12-hour format" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// 24-Hour Format
// ---------------------------------------------------------------------------

export const TwentyFourHourFormat: Story = {
  name: '24-Hour Format',
  render: () => ({
    components: { DzTimePicker },
    template: '<DzTimePicker :hour12="false" placeholder="24-hour format" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// With Time Constraints
// ---------------------------------------------------------------------------

export const WithConstraints: Story = {
  name: 'Business Hours Only',
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Only business hours (09:00 - 17:00) with 30-min intervals.</p>
        <DzTimePicker min="09:00" max="17:00" :step="30" placeholder="Business hours" />
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
    components: { DzTimePicker },
    setup() {
      return { args }
    },
    template: '<DzTimePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a valid time',
  },
  render: args => ({
    components: { DzTimePicker },
    setup() {
      return { args }
    },
    template: '<DzTimePicker v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker placeholder="Default" />
        <DzTimePicker placeholder="Disabled" disabled />
        <DzTimePicker placeholder="Invalid" invalid error="Required" />
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
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker variant="outline" placeholder="Outline" />
        <DzTimePicker variant="filled" placeholder="Filled" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzTimePicker },
    data() {
      return { time: '' }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker v-model="time" placeholder="Pick a time" />
        <p class="text-sm text-gray-500">Selected: <strong>{{ time || 'none' }}</strong></p>
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
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Tab to focus, type digits to enter time, arrow keys to increment/decrement fields.</p>
        <DzTimePicker placeholder="Keyboard navigable" aria-label="Meeting time" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Meeting Scheduler
// ---------------------------------------------------------------------------

export const RealWorldMeetingScheduler: Story = {
  name: 'Real World: Meeting Scheduler',
  render: () => ({
    components: { DzTimePicker },
    data() {
      return { startTime: '', endTime: '' }
    },
    template: `
      <div class="max-w-sm space-y-4">
        <h3 class="text-base font-semibold">Schedule Meeting</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Start</label>
            <DzTimePicker v-model="startTime" min="08:00" max="18:00" :step="15" placeholder="Start time" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">End</label>
            <DzTimePicker v-model="endTime" min="08:00" max="18:00" :step="15" placeholder="End time" />
          </div>
        </div>
      </div>
    `,
  }),
}
