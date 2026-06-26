import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { DzTimePicker } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzTimePicker is a dropdown time picker (CoreUI-style).
 *
 * Clicking the trigger opens a popover with selectable hour / minute /
 * (optional) second and AM/PM columns. Two layouts are supported: a scrollable
 * `roll` wheel (default) and native `select` dropdowns. Supports min/max
 * constraints, step intervals, 12/24-hour format, locale-aware display, a
 * clear button, a clock indicator, and a Cancel/Confirm footer.
 *
 * `v-model` is the canonical 24-hour `HH:mm` (or `HH:mm:ss` when `seconds`).
 */
const meta = {
  title: 'Core/Forms/DzTimePicker',
  component: DzTimePicker,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    variant: {
      control: 'select',
      options: ['outline', 'filled', 'underlined'],
      description: 'Visual style of the trigger',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    selection: {
      control: 'inline-radio',
      options: ['roll', 'select'],
      description: 'Popover selection layout',
      table: { category: 'Appearance', defaultValue: { summary: 'roll' } },
    },
    // Behavior
    placeholder: {
      control: 'text',
      description: 'Trigger placeholder when no time is selected',
      table: { category: 'Behavior', defaultValue: { summary: 'Select time' } },
    },
    seconds: {
      control: 'boolean',
      description: 'Show a seconds column (value becomes HH:mm:ss)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    hour12: {
      control: 'boolean',
      description: 'Use 12-hour format with AM/PM (default: follows locale)',
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
      description: 'Minute step interval',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    secondStep: {
      control: 'number',
      description: 'Second step interval (when seconds enabled)',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
    },
    locale: {
      control: 'text',
      description: 'Locale for time display (BCP 47 tag)',
      table: { category: 'Behavior' },
    },
    footer: {
      control: 'boolean',
      description: 'Show Cancel/Confirm footer. When false, picks apply immediately',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    cleaner: {
      control: 'boolean',
      description: 'Show the clear button when a value is set',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    indicator: {
      control: 'boolean',
      description: 'Show the clock indicator icon',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    confirmText: {
      control: 'text',
      description: 'Confirm button label',
      table: { category: 'Behavior', defaultValue: { summary: 'OK' } },
    },
    cancelText: {
      control: 'text',
      description: 'Cancel button label',
      table: { category: 'Behavior', defaultValue: { summary: 'Cancel' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction',
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
    placeholder: 'Select time',
    variant: 'outline',
    size: 'md',
    selection: 'roll',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The trigger is a button with aria-haspopup; clicking it opens the popover
    const trigger = canvas.getByRole('button', { name: /select time/i })
    expect(trigger).toBeVisible()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('listbox', { name: /hours/i })).toBeVisible())
    // Minutes column is also present
    expect(screen.getByRole('listbox', { name: /minutes/i })).toBeVisible()
    // The trigger should now report expanded state
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  },
}

// ---------------------------------------------------------------------------
// Roll vs Select layout
// ---------------------------------------------------------------------------

export const SelectionLayouts: Story = {
  name: 'Roll vs Select Layout',
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="flex gap-8 max-w-md">
        <div class="flex-1 space-y-2">
          <p class="text-sm font-medium">Roll (wheel)</p>
          <DzTimePicker selection="roll" placeholder="Roll" />
        </div>
        <div class="flex-1 space-y-2">
          <p class="text-sm font-medium">Select (dropdowns)</p>
          <DzTimePicker selection="select" placeholder="Select" />
        </div>
      </div>
    `,
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
  name: '12-Hour Format (AM/PM)',
  render: () => ({
    components: { DzTimePicker },
    data() {
      return { time: '13:45' }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <DzTimePicker v-model="time" :hour12="true" placeholder="12-hour" />
        <p class="text-sm text-gray-500">Value (24h): <strong>{{ time || 'none' }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Seconds
// ---------------------------------------------------------------------------

export const WithSeconds: Story = {
  name: 'With Seconds',
  render: () => ({
    components: { DzTimePicker },
    data() {
      return { time: '' }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <DzTimePicker v-model="time" seconds placeholder="HH:mm:ss" />
        <p class="text-sm text-gray-500">Value: <strong>{{ time || 'none' }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Constraints
// ---------------------------------------------------------------------------

export const WithConstraints: Story = {
  name: 'Business Hours Only',
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Only business hours (09:00 - 17:00) with 30-min steps. Out-of-range options are disabled.</p>
        <DzTimePicker min="09:00" max="17:00" :step="30" placeholder="Business hours" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Immediate (no footer)
// ---------------------------------------------------------------------------

export const NoFooter: Story = {
  name: 'Immediate (no footer)',
  render: () => ({
    components: { DzTimePicker },
    data() {
      return { time: '' }
    },
    template: `
      <div class="space-y-2 max-w-xs">
        <p class="text-sm text-gray-500">Selections apply immediately, without Cancel/OK.</p>
        <DzTimePicker v-model="time" :footer="false" :step="15" placeholder="Pick a time" />
        <p class="text-sm text-gray-500">Value: <strong>{{ time || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a time/i })
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('listbox', { name: /hours/i })).toBeVisible())
    // No Cancel/OK footer buttons when footer=false
    expect(screen.queryByRole('button', { name: /ok/i })).toBeNull()
    // Click the "09" hour option; step=15 so minutes are 00, 15, 30, 45
    const hourListbox = screen.getByRole('listbox', { name: /hours/i })
    const hour9 = within(hourListbox).getByText('09')
    await userEvent.click(hour9)
    // After selecting an hour the minute column is visible and the hour is marked selected
    await waitFor(() => expect(hour9).toHaveAttribute('aria-selected', 'true'))
    // Minute column is present
    expect(screen.getByRole('listbox', { name: /minutes/i })).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// Minimal trigger (no indicator / no cleaner)
// ---------------------------------------------------------------------------

export const MinimalTrigger: Story = {
  name: 'No Indicator / No Cleaner',
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker :indicator="false" placeholder="No indicator" />
        <DzTimePicker :cleaner="false" model-value="12:00" />
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
    template: '<DzTimePicker v-bind="args" model-value="10:30" class="max-w-xs" />',
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
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzTimePicker },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzTimePicker variant="outline" placeholder="Outline" />
        <DzTimePicker variant="filled" model-value="14:30" :hour12="true" />
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a time/i })
    await userEvent.click(trigger)
    // Popover is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('listbox', { name: /hours/i })).toBeVisible())
    // Select hour 14 and minute 30
    const hourListbox = screen.getByRole('listbox', { name: /hours/i })
    await userEvent.click(within(hourListbox).getByText('14'))
    await waitFor(() =>
      expect(within(hourListbox).getByText('14')).toHaveAttribute('aria-selected', 'true'),
    )
    const minuteListbox = screen.getByRole('listbox', { name: /minutes/i })
    await userEvent.click(within(minuteListbox).getByText('30'))
    // Confirm via the OK footer button — it's inside the portalled popover
    const okButton = screen.getByRole('button', { name: /ok/i })
    await userEvent.click(okButton)
    // Panel closes after confirm
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  },
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
