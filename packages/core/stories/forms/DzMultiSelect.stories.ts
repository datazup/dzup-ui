import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzSelectItem } from '../../src/components/forms'
import { DzMultiSelect } from '../../src/components/forms'

const sampleItems: DzSelectItem[] = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' },
  { label: 'Preact', value: 'preact' },
]

/**
 * DzMultiSelect allows users to select multiple values from a dropdown.
 *
 * Built on Reka UI Combobox in multiple mode. Supports tags, max selections,
 * custom item rendering, and all standard input variants.
 */
const meta = {
  title: 'Core/Forms/DzMultiSelect',
  component: DzMultiSelect,
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
      description: 'Available options',
      table: { category: 'Behavior' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no values are selected',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    maxSelections: {
      control: 'number',
      description: 'Maximum number of items that can be selected',
      table: { category: 'Behavior' },
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
  },
  args: {
    items: sampleItems,
    placeholder: 'Select frameworks...',
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzMultiSelect>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzMultiSelect },
    setup() {
      return { args }
    },
    template: '<DzMultiSelect v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzMultiSelect :items="items" variant="outline" placeholder="Outline" />
        <DzMultiSelect :items="items" variant="filled" placeholder="Filled" />
        <DzMultiSelect :items="items" variant="underlined" placeholder="Underlined" />
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
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzMultiSelect :items="items" size="xs" placeholder="Extra Small" />
        <DzMultiSelect :items="items" size="sm" placeholder="Small" />
        <DzMultiSelect :items="items" size="md" placeholder="Medium" />
        <DzMultiSelect :items="items" size="lg" placeholder="Large" />
        <DzMultiSelect :items="items" size="xl" placeholder="Extra Large" />
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
    components: { DzMultiSelect },
    setup() {
      return { args }
    },
    template: '<DzMultiSelect v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Max Selections
// ---------------------------------------------------------------------------

export const MaxSelections: Story = {
  name: 'Max Selections (3)',
  args: {
    maxSelections: 3,
    placeholder: 'Pick up to 3...',
  },
  render: args => ({
    components: { DzMultiSelect },
    setup() {
      return { args }
    },
    template: '<DzMultiSelect v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'At least one framework is required',
  },
  render: args => ({
    components: { DzMultiSelect },
    setup() {
      return { args }
    },
    template: '<DzMultiSelect v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzMultiSelect :items="items" placeholder="Default" />
        <DzMultiSelect :items="items" placeholder="Disabled" disabled />
        <DzMultiSelect :items="items" placeholder="Invalid" invalid error="Required" />
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
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzMultiSelect :items="items" variant="outline" placeholder="Outline" />
        <DzMultiSelect :items="items" variant="filled" placeholder="Filled" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    data() {
      return { selected: [] as string[] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzMultiSelect :items="items" v-model="selected" placeholder="Choose frameworks..." />
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
    components: { DzMultiSelect },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Tab to focus, type to filter, arrow keys to navigate, Enter to select, Backspace to remove last tag.</p>
        <DzMultiSelect :items="items" placeholder="Keyboard navigable" aria-label="Framework selection" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Tag Picker
// ---------------------------------------------------------------------------

export const RealWorldTagPicker: Story = {
  name: 'Real World: Tag Picker',
  render: () => ({
    components: { DzMultiSelect },
    setup() {
      const tags: DzSelectItem[] = [
        { label: 'Bug', value: 'bug' },
        { label: 'Feature', value: 'feature' },
        { label: 'Enhancement', value: 'enhancement' },
        { label: 'Documentation', value: 'docs' },
        { label: 'Performance', value: 'perf' },
        { label: 'Security', value: 'security' },
      ]
      return { tags }
    },
    template: `
      <div class="max-w-sm">
        <label class="block text-sm font-medium mb-1">Issue Labels</label>
        <DzMultiSelect :items="tags" placeholder="Add labels..." :maxSelections="5" />
      </div>
    `,
  }),
}
