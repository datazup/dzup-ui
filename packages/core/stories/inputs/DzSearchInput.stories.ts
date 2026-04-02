import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import { DzSearchInput } from '../../src/components/inputs'

/**
 * DzSearchInput is a search-specific input with a built-in search icon,
 * clearable behavior, and Enter key submission.
 *
 * It supports three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, a suffix slot, and emits `search` on Enter and `clear` on
 * the clear button click.
 */
const meta = {
  title: 'Core/Inputs/DzSearchInput',
  component: DzSearchInput,
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
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Semantic color tone',
      table: { category: 'Appearance' },
    },
    // Behavior
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      table: { category: 'Behavior' },
    },
    clearable: {
      control: 'boolean',
      description: 'Whether to show the clear button when input has value',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only state -- visible but not editable',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    // State / Validation
    invalid: {
      control: 'boolean',
      description: 'Whether the field value is invalid',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'text',
      description: 'Error message to display',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Unique element ID',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label (defaults to "Search")',
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
    variant: 'outline',
    size: 'md',
    placeholder: 'Search...',
    clearable: true,
    disabled: false,
    readonly: false,
    loading: false,
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof DzSearchInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSearchInput },
    setup() {
      return { args }
    },
    template: '<DzSearchInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput variant="outline" placeholder="Outline search..." />
        <DzSearchInput variant="filled" placeholder="Filled search..." />
        <DzSearchInput variant="underlined" placeholder="Underlined search..." />
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
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput size="xs" placeholder="Search xs..." />
        <DzSearchInput size="sm" placeholder="Search sm..." />
        <DzSearchInput size="md" placeholder="Search md..." />
        <DzSearchInput size="lg" placeholder="Search lg..." />
        <DzSearchInput size="xl" placeholder="Search xl..." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Clearable vs Non-Clearable
// ---------------------------------------------------------------------------

export const ClearableComparison: Story = {
  name: 'Clearable vs Non-Clearable',
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput clearable model-value="Clearable search" />
        <DzSearchInput :clearable="false" model-value="Non-clearable search" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Suffix Slot
// ---------------------------------------------------------------------------

export const WithSuffix: Story = {
  name: 'With Suffix Slot',
  render: () => ({
    components: { DzSearchInput, DzButton },
    template: `
      <DzSearchInput placeholder="Search products..." class="max-w-sm">
        <template #suffix>
          <DzButton size="xs" variant="ghost" tone="primary">Go</DzButton>
        </template>
      </DzSearchInput>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput placeholder="Default state" />
        <DzSearchInput disabled placeholder="Disabled state" />
        <DzSearchInput readonly model-value="read-only search term" />
        <DzSearchInput loading placeholder="Searching..." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search disabled',
  },
  render: args => ({
    components: { DzSearchInput },
    setup() {
      return { args }
    },
    template: '<DzSearchInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput invalid placeholder="Invalid search" />
        <DzSearchInput error="Search query too short" model-value="ab" />
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
    components: { DzSearchInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzSearchInput variant="outline" placeholder="Search in dark mode..." />
        <DzSearchInput variant="filled" placeholder="Filled search in dark mode..." />
        <DzSearchInput variant="underlined" placeholder="Underlined search in dark mode..." />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Search + Events
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSearchInput },
    data() {
      return { query: '', lastSearch: '', clearCount: 0 }
    },
    methods: {
      handleSearch(value: string) {
        this.lastSearch = value
      },
      handleClear() {
        this.clearCount++
      },
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <DzSearchInput
          v-model="query"
          placeholder="Type and press Enter..."
          @search="handleSearch"
          @clear="handleClear"
        />
        <div class="text-sm text-gray-500 space-y-1">
          <p>Current: <code class="bg-gray-100 px-1 rounded">{{ query || '(empty)' }}</code></p>
          <p>Last search: <code class="bg-gray-100 px-1 rounded">{{ lastSearch || '(none)' }}</code></p>
          <p>Clear count: {{ clearCount }}</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Search Semantics',
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">
          DzSearchInput uses type="search" and defaults aria-label to "Search".
          The clear button has aria-label="Clear search". Press Enter to submit.
        </p>
        <DzSearchInput placeholder="Search users..." aria-label="Search users" />
        <DzSearchInput placeholder="Search products..." aria-label="Search products" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Navbar Search
// ---------------------------------------------------------------------------

export const RealWorldNavbarSearch: Story = {
  name: 'Real World: Navbar Search',
  render: () => ({
    components: { DzSearchInput },
    template: `
      <div class="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
        <span class="font-semibold text-sm">MyApp</span>
        <DzSearchInput variant="filled" size="sm" placeholder="Search anything..." class="flex-1 max-w-md" />
        <span class="text-sm text-gray-400">user@example.com</span>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Data Table Filter
// ---------------------------------------------------------------------------

export const RealWorldDataTableFilter: Story = {
  name: 'Real World: Data Table Filter',
  render: () => ({
    components: { DzSearchInput },
    data() {
      return {
        query: '',
        items: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Davis'],
      }
    },
    computed: {
      filtered(): string[] {
        if (!this.query)
          return this.items
        const q = this.query.toLowerCase()
        return this.items.filter((item: string) => item.toLowerCase().includes(q))
      },
    },
    template: `
      <div class="max-w-sm space-y-3">
        <DzSearchInput v-model="query" placeholder="Filter names..." size="sm" />
        <ul class="space-y-1">
          <li v-for="item in filtered" :key="item" class="text-sm py-1 px-2 rounded hover:bg-gray-50">
            {{ item }}
          </li>
          <li v-if="filtered.length === 0" class="text-sm text-gray-400 py-1 px-2">
            No results found.
          </li>
        </ul>
      </div>
    `,
  }),
}
