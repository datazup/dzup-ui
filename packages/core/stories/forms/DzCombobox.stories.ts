import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzComboboxItem, DzSelectItem } from '../../src/components/forms'
import { DzCombobox } from '../../src/components/forms'

const sampleItems: DzSelectItem[] = [
  { label: 'New York', value: 'nyc' },
  { label: 'Los Angeles', value: 'la' },
  { label: 'Chicago', value: 'chi' },
  { label: 'Houston', value: 'hou' },
  { label: 'Phoenix', value: 'phx' },
  { label: 'Philadelphia', value: 'phl' },
  { label: 'San Antonio', value: 'sat' },
  { label: 'San Diego', value: 'sd' },
  { label: 'Dallas', value: 'dal' },
  { label: 'San Jose', value: 'sj' },
]

/**
 * DzCombobox is a searchable select component built on Reka UI ComboboxRoot.
 *
 * It provides type-ahead filtering, custom item rendering, optional custom value entry,
 * and all standard input variants and sizes.
 */
const meta = {
  title: 'Core/Forms/DzCombobox',
  component: DzCombobox,
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
      description: 'Placeholder text for the search input',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    allowCustomValue: {
      control: 'boolean',
      description: 'Allow typing a custom value not in the items list',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state instead of the item list',
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
    items: sampleItems,
    placeholder: 'Search cities...',
    variant: 'outline',
    size: 'md',
    disabled: false,
    allowCustomValue: false,
  },
} satisfies Meta<typeof DzCombobox>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<DzCombobox v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCombobox :items="items" variant="outline" placeholder="Outline" />
        <DzCombobox :items="items" variant="filled" placeholder="Filled" />
        <DzCombobox :items="items" variant="underlined" placeholder="Underlined" />
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
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCombobox :items="items" size="xs" placeholder="Extra Small" />
        <DzCombobox :items="items" size="sm" placeholder="Small" />
        <DzCombobox :items="items" size="md" placeholder="Medium" />
        <DzCombobox :items="items" size="lg" placeholder="Large" />
        <DzCombobox :items="items" size="xl" placeholder="Extra Large" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Allow Custom Value
// ---------------------------------------------------------------------------

export const AllowCustomValue: Story = {
  name: 'Allow Custom Value',
  args: {
    allowCustomValue: true,
    placeholder: 'Type or search...',
  },
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<DzCombobox v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<DzCombobox v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a city',
  },
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<DzCombobox v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCombobox :items="items" placeholder="Default" />
        <DzCombobox :items="items" placeholder="Disabled" disabled />
        <DzCombobox :items="items" placeholder="Invalid" invalid error="Required" />
      </div>
    `,
  }),
}

export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    loading: true,
    loadingText: 'Loading options…',
  },
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<DzCombobox v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// With Slots
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'Custom Slots',
  render: () => ({
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <DzCombobox :items="items" placeholder="Search cities..." class="max-w-xs">
        <template #empty>
          <div class="p-4 text-center text-sm text-gray-400">No cities found. Try a different search.</div>
        </template>
      </DzCombobox>
    `,
  }),
}

export const RichObjects: Story = {
  name: 'Rich Objects',
  render: () => ({
    components: { DzCombobox },
    setup() {
      const people: DzComboboxItem[] = [
        { id: 'p1', name: 'Annie Case', role: 'Planner', summary: 'Breaks work into subtasks' },
        { id: 'p2', name: 'John Smith', role: 'Reviewer', summary: 'Checks correctness and risks' },
        { id: 'p3', name: 'Rita Chen', role: 'Engineer', summary: 'Executes implementation tasks' },
      ]
      return { people }
    },
    data() {
      return { selected: 'p2' }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzCombobox
          v-model="selected"
          :items="people"
          :get-item-value="(item) => item.id"
          :get-item-label="(item) => item.name"
          placeholder="Assign a collaborator"
        >
          <template #item="{ item, selected }">
            <div class="flex items-start gap-3 pl-6">
              <span class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {{ item.label.charAt(0) }}
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-medium text-slate-900">
                  {{ item.label }}
                  <span v-if="selected" class="ml-1 text-xs text-sky-600">(selected)</span>
                </span>
                <span class="text-xs text-slate-500">{{ item.raw.role }} · {{ item.raw.summary }}</span>
              </span>
            </div>
          </template>
        </DzCombobox>
        <p class="text-sm text-gray-500">Selected: <strong>{{ selected || 'none' }}</strong></p>
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
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCombobox :items="items" variant="outline" placeholder="Outline" />
        <DzCombobox :items="items" variant="filled" placeholder="Filled" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    data() {
      return { selected: '' }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <DzCombobox :items="items" v-model="selected" placeholder="Search cities..." />
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
    components: { DzCombobox },
    setup() {
      return { items: sampleItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Tab to focus, type to filter, arrow keys to navigate results, Enter to select.</p>
        <DzCombobox :items="items" placeholder="Keyboard navigable" aria-label="City search" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: User Search
// ---------------------------------------------------------------------------

export const RealWorldUserSearch: Story = {
  name: 'Real World: User Search',
  render: () => ({
    components: { DzCombobox },
    setup() {
      const users: DzSelectItem[] = [
        { label: 'Alice Johnson', value: 'alice' },
        { label: 'Bob Smith', value: 'bob' },
        { label: 'Carol Williams', value: 'carol' },
        { label: 'David Brown', value: 'david' },
        { label: 'Eva Martinez', value: 'eva' },
      ]
      return { users }
    },
    template: `
      <div class="max-w-xs">
        <label class="block text-sm font-medium mb-1">Assign To</label>
        <DzCombobox :items="users" placeholder="Search team members..." name="assignee" aria-label="Assignee" />
      </div>
    `,
  }),
}
