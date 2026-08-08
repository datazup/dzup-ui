import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { DzComboboxItem, DzSelectItem } from '../../src/components/forms'
import { expect, screen, userEvent, within } from 'storybook/test'
import { DzCombobox } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

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
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the dropdown is open on initial mount (uncontrolled)',
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
    portalDisabled: {
      control: 'boolean',
      description: 'Render the options inline instead of teleporting them',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
    },
    portalDefer: {
      control: 'boolean',
      description: 'Defer portal target resolution until the application has mounted',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
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
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <DzCombobox v-bind="args" v-model="value" />
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Bound value: <strong>{{ value || 'none' }}</strong>
        </p>
        <p class="text-xs text-[var(--dz-muted-foreground)]">
          Type a city that is not in the list (e.g. "Boston") and the typed text
          becomes the value. With <code>allowCustomValue: false</code> the typed
          text only filters and is discarded unless you pick an option.
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Open by Default
// ---------------------------------------------------------------------------

export const OpenByDefault: Story = {
  name: 'Open by Default',
  args: {
    defaultOpen: true,
  },
  render: args => ({
    components: { DzCombobox },
    setup() {
      return { args }
    },
    template: '<div class="max-w-xs pb-72"><DzCombobox v-bind="args" /></div>',
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
          <div class="p-4 text-center text-sm text-[var(--dz-muted-foreground)]">No cities found. Try a different search.</div>
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
              <span class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--dz-muted)] text-xs font-semibold text-[var(--dz-foreground)]">
                {{ item.label.charAt(0) }}
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-medium text-[var(--dz-foreground)]">
                  {{ item.label }}
                  <span v-if="selected" class="ml-1 text-xs text-[var(--dz-info-muted-foreground)]">(selected)</span>
                </span>
                <span class="text-xs text-[var(--dz-muted-foreground)]">{{ item.raw.role }} · {{ item.raw.summary }}</span>
              </span>
            </div>
          </template>
        </DzCombobox>
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ selected || 'none' }}</strong></p>
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
    darkModeDecorator,
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ selected || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open and type-ahead filter the option list.
    const input = canvas.getByPlaceholderText(/search cities/i)
    await userEvent.click(input)
    await userEvent.type(input, 'Chi')

    // Filtered options render in a portal; select Chicago.
    const option = await screen.findByRole('option', { name: 'Chicago' })
    await userEvent.click(option)

    await expect(canvas.getByText(/selected:/i)).toHaveTextContent(/chi/i)
  },
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Tab to focus, type to filter, arrow keys to navigate results, Enter to select.</p>
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
