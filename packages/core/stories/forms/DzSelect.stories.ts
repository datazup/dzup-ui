import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzSelectItem } from '../../src/components/forms'
import { DzSelect } from '../../src/components/forms'

const sampleItems: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
]

const itemsWithDisabled: DzSelectItem[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date', disabled: true },
  { label: 'Elderberry', value: 'elderberry' },
]

/**
 * DzSelect is a single-value dropdown select component built on Reka UI Select primitives.
 *
 * It supports three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, disabled state, validation, and custom item/trigger slots.
 */
const meta = {
  title: 'Core/Forms/DzSelect',
  component: DzSelect,
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
    items: {
      control: 'object',
      description: 'Available options for the select dropdown',
      table: { category: 'Behavior' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no value is selected',
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
    required: {
      control: 'boolean',
      description: 'Whether selection is required',
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
    ariaLabelledby: {
      control: 'text',
      description: 'ID of labelling element',
      table: { category: 'Accessibility' },
    },
    ariaDescribedby: {
      control: 'text',
      description: 'ID of describing element',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    items: sampleItems,
    placeholder: 'Select a fruit...',
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzSelect>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSelect },
    setup() {
      return { args }
    },
    template: '<DzSelect v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzSelect :items="items" variant="outline" placeholder="Outline" />
        <DzSelect :items="items" variant="filled" placeholder="Filled" />
        <DzSelect :items="items" variant="underlined" placeholder="Underlined" />
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
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzSelect :items="items" size="xs" placeholder="Extra Small" />
        <DzSelect :items="items" size="sm" placeholder="Small" />
        <DzSelect :items="items" size="md" placeholder="Medium" />
        <DzSelect :items="items" size="lg" placeholder="Large" />
        <DzSelect :items="items" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled State
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: args => ({
    components: { DzSelect },
    setup() {
      return { args }
    },
    template: '<DzSelect v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled Items
// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  name: 'Disabled Items',
  render: () => ({
    components: { DzSelect },
    setup() {
      return { items: itemsWithDisabled }
    },
    template: '<DzSelect :items="items" placeholder="Some items are disabled" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid / Error State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a value',
  },
  render: args => ({
    components: { DzSelect },
    setup() {
      return { args }
    },
    template: '<DzSelect v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// States Side by Side
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzSelect :items="items" placeholder="Default" />
        <DzSelect :items="items" placeholder="Disabled" disabled />
        <DzSelect :items="items" placeholder="Invalid" invalid error="Required field" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'Custom Slots',
  render: () => ({
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <DzSelect :items="items" placeholder="Choose fruit..." class="max-w-xs">
        <template #empty>
          <div class="p-4 text-center text-sm text-gray-400">No fruits available</div>
        </template>
      </DzSelect>
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
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzSelect :items="items" variant="outline" placeholder="Outline" />
        <DzSelect :items="items" variant="filled" placeholder="Filled" />
        <DzSelect :items="items" variant="underlined" placeholder="Underlined" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    data() {
      return { selected: '' }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzSelect :items="items" v-model="selected" placeholder="Pick a fruit..." />
        <p class="text-sm text-gray-500">Selected: <strong>{{ selected || 'none' }}</strong></p>
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
    components: { DzSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Tab to focus the select, use arrow keys to navigate, Enter to select.</p>
        <DzSelect :items="items" placeholder="Keyboard navigable" aria-label="Fruit selection" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Country Selector
// ---------------------------------------------------------------------------

export const RealWorldCountrySelector: Story = {
  name: 'Real World: Country Selector',
  render: () => ({
    components: { DzSelect },
    setup() {
      const countries: DzSelectItem[] = [
        { label: 'United States', value: 'us' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Canada', value: 'ca' },
        { label: 'Germany', value: 'de' },
        { label: 'France', value: 'fr' },
        { label: 'Japan', value: 'jp' },
        { label: 'Australia', value: 'au' },
      ]
      return { countries }
    },
    template: `
      <div class="max-w-xs">
        <label class="block text-sm font-medium mb-1">Country</label>
        <DzSelect :items="countries" placeholder="Select your country" name="country" />
      </div>
    `,
  }),
}
