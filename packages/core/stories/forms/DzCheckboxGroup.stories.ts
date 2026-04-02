import type { Meta, StoryObj } from '@storybook/vue3'
import { DzCheckbox, DzCheckboxGroup } from '../../src/components/forms'

/**
 * DzCheckboxGroup manages a set of DzCheckbox components with a shared `string[]` model.
 *
 * It provides context via typed injection (ADR-08) to propagate disabled/size state
 * and manages the selected values array.
 */
const meta = {
  title: 'Core/Forms/DzCheckboxGroup',
  component: DzCheckboxGroup,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size propagated to all child checkboxes',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state propagated to all child checkboxes',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the group',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    size: 'md',
    orientation: 'vertical',
    disabled: false,
  },
} satisfies Meta<typeof DzCheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Fruit preferences">
        <DzCheckbox value="apple">Apple</DzCheckbox>
        <DzCheckbox value="banana">Banana</DzCheckbox>
        <DzCheckbox value="cherry">Cherry</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal Orientation
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: args => ({
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Toppings">
        <DzCheckbox value="cheese">Cheese</DzCheckbox>
        <DzCheckbox value="pepperoni">Pepperoni</DzCheckbox>
        <DzCheckbox value="mushrooms">Mushrooms</DzCheckbox>
        <DzCheckbox value="olives">Olives</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzCheckboxGroup :size="size" orientation="horizontal" aria-label="Size demo">
            <DzCheckbox value="a">Option A</DzCheckbox>
            <DzCheckbox value="b">Option B</DzCheckbox>
            <DzCheckbox value="c">Option C</DzCheckbox>
          </DzCheckboxGroup>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled State
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Disabled group">
        <DzCheckbox value="a">Option A</DzCheckbox>
        <DzCheckbox value="b">Option B</DzCheckbox>
        <DzCheckbox value="c">Option C</DzCheckbox>
      </DzCheckboxGroup>
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
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <DzCheckboxGroup aria-label="Dark mode demo">
        <DzCheckbox value="a">Option A</DzCheckbox>
        <DzCheckbox value="b">Option B</DzCheckbox>
        <DzCheckbox value="c">Option C</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    data() {
      return { selected: [] as string[] }
    },
    template: `
      <div class="space-y-4">
        <DzCheckboxGroup v-model="selected" aria-label="Notification prefs">
          <DzCheckbox value="email">Email</DzCheckbox>
          <DzCheckbox value="sms">SMS</DzCheckbox>
          <DzCheckbox value="push">Push Notification</DzCheckbox>
          <DzCheckbox value="in-app">In-App</DzCheckbox>
        </DzCheckboxGroup>
        <p class="text-sm text-gray-500">Selected: <strong>{{ selected.length ? selected.join(', ') : 'none' }}</strong></p>
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
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab through the group, Space to toggle individual checkboxes.</p>
        <DzCheckboxGroup aria-label="Accessible group" role="group">
          <DzCheckbox value="a" aria-label="Option A">Option A</DzCheckbox>
          <DzCheckbox value="b" aria-label="Option B">Option B</DzCheckbox>
          <DzCheckbox value="c" aria-label="Option C">Option C</DzCheckbox>
        </DzCheckboxGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Notification Preferences
// ---------------------------------------------------------------------------

export const RealWorldNotifications: Story = {
  name: 'Real World: Notification Preferences',
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    data() {
      return { channels: ['email'] }
    },
    template: `
      <div class="max-w-md">
        <h3 class="text-base font-semibold mb-1">Notification Channels</h3>
        <p class="text-sm text-gray-500 mb-3">Choose how you want to be notified.</p>
        <DzCheckboxGroup v-model="channels" aria-label="Notification channels">
          <DzCheckbox value="email">Email notifications</DzCheckbox>
          <DzCheckbox value="sms">SMS alerts</DzCheckbox>
          <DzCheckbox value="push">Push notifications</DzCheckbox>
          <DzCheckbox value="slack">Slack integration</DzCheckbox>
        </DzCheckboxGroup>
      </div>
    `,
  }),
}
