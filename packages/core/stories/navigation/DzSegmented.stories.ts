import type { Meta, StoryObj } from '@storybook/vue3'
import { AlignCenter, AlignLeft, AlignRight, LayoutGrid, List, Table2 } from 'lucide-vue-next'
import { DzSegmented } from '../../src/components/navigation'

/**
 * DzSegmented is a toggle-style segmented control built on Reka UI ToggleGroup.
 *
 * It supports five canonical sizes, disabled state (global and per-item),
 * v-model binding, and custom item rendering via a scoped slot.
 */
const meta = {
  title: 'Core/Navigation/DzSegmented',
  component: DzSegmented,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modelValue: {
      control: 'text',
      description: 'Active segment value (v-model)',
      table: { category: 'Behavior' },
    },
    items: {
      control: 'object',
      description: 'Items to render as segments',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents all interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
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
    size: 'md',
    disabled: false,
    items: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'table', label: 'Table' },
    ],
  },
} satisfies Meta<typeof DzSegmented>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSegmented },
    setup() {
      return { args }
    },
    data() {
      return { value: 'list' }
    },
    template: '<DzSegmented v-bind="args" v-model="value" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
        { value: 'c', label: 'Gamma' },
      ]
      return { items }
    },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 uppercase">{{ size }}</p>
          <DzSegmented :items="items" :size="size" model-value="a" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled (Global)
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
        { value: 'table', label: 'Table' },
      ]
      return { items }
    },
    template: '<DzSegmented :items="items" model-value="list" disabled />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled Item
// ---------------------------------------------------------------------------

export const DisabledItem: Story = {
  name: 'Disabled Item (Per-Item)',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid', disabled: true },
        { value: 'table', label: 'Table' },
      ]
      return { items }
    },
    template: '<DzSegmented :items="items" model-value="list" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
      ]
      const withDisabled = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B', disabled: true },
        { value: 'c', label: 'Option C' },
      ]
      return { items, withDisabled }
    },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Default</p>
          <DzSegmented :items="items" model-value="a" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">With disabled item</p>
          <DzSegmented :items="withDisabled" model-value="a" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Globally disabled</p>
          <DzSegmented :items="items" model-value="b" disabled />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Item Slot (Icons)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'Custom Item Slot (Icons)',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'list', label: 'List View' },
        { value: 'grid', label: 'Grid View' },
        { value: 'table', label: 'Table View' },
      ]
      const iconMap: Record<string, string> = {
        list: 'List',
        grid: 'LayoutGrid',
        table: 'Table2',
      }
      return { items, iconMap, List, LayoutGrid, Table2 }
    },
    data() {
      return { value: 'list' }
    },
    template: `
      <DzSegmented v-model="value" :items="items" aria-label="View mode">
        <template #item="{ item, active }">
          <span class="flex items-center gap-1.5">
            <List v-if="item.value === 'list'" class="h-4 w-4" />
            <LayoutGrid v-if="item.value === 'grid'" class="h-4 w-4" />
            <Table2 v-if="item.value === 'table'" class="h-4 w-4" />
            {{ item.label }}
          </span>
        </template>
      </DzSegmented>
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
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]
      return { items }
    },
    template: `
      <div class="space-y-6">
        <DzSegmented :items="items" model-value="week" />
        <DzSegmented :items="items" model-value="day" disabled />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
      ]
      return { items }
    },
    data() {
      return { value: 'week' }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Selected: <code>{{ value }}</code></p>
        <DzSegmented v-model="value" :items="items" @change="(v) => {}" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Toggle Group',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ]
      return { items }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          The segmented control uses Reka UI ToggleGroup, providing
          <code>role="group"</code> semantics. Each item has an <code>aria-label</code>
          matching its label. Use arrow keys to navigate between items.
        </p>
        <DzSegmented :items="items" model-value="center" aria-label="Text alignment" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: View Mode Switcher
// ---------------------------------------------------------------------------

export const RealWorldViewSwitcher: Story = {
  name: 'Real World: View Mode Switcher',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
        { value: 'table', label: 'Table' },
      ]
      return { items, List, LayoutGrid, Table2 }
    },
    data() {
      return { view: 'grid' }
    },
    template: `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Files</h3>
          <DzSegmented v-model="view" :items="items" size="sm" aria-label="View mode">
            <template #item="{ item, active }">
              <span class="flex items-center gap-1">
                <List v-if="item.value === 'list'" class="h-3.5 w-3.5" />
                <LayoutGrid v-if="item.value === 'grid'" class="h-3.5 w-3.5" />
                <Table2 v-if="item.value === 'table'" class="h-3.5 w-3.5" />
                {{ item.label }}
              </span>
            </template>
          </DzSegmented>
        </div>
        <div class="border rounded p-6 text-center text-sm text-gray-500">
          Showing {{ view }} view
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Calendar Range Picker
// ---------------------------------------------------------------------------

export const RealWorldCalendarRange: Story = {
  name: 'Real World: Calendar Range Picker',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: '1d', label: '1D' },
        { value: '1w', label: '1W' },
        { value: '1m', label: '1M' },
        { value: '3m', label: '3M' },
        { value: '1y', label: '1Y' },
        { value: 'all', label: 'All' },
      ]
      return { items }
    },
    data() {
      return { range: '1m' }
    },
    template: `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Revenue</h3>
          <DzSegmented v-model="range" :items="items" size="sm" aria-label="Time range" />
        </div>
        <div class="border rounded p-12 text-center text-sm text-gray-500">
          Chart for {{ range }} range
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Text Alignment
// ---------------------------------------------------------------------------

export const RealWorldTextAlignment: Story = {
  name: 'Real World: Text Alignment',
  render: () => ({
    components: { DzSegmented },
    setup() {
      const items = [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ]
      return { items, AlignLeft, AlignCenter, AlignRight }
    },
    data() {
      return { align: 'left' }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <DzSegmented v-model="align" :items="items" size="sm" aria-label="Text alignment">
          <template #item="{ item }">
            <AlignLeft v-if="item.value === 'left'" class="h-4 w-4" />
            <AlignCenter v-if="item.value === 'center'" class="h-4 w-4" />
            <AlignRight v-if="item.value === 'right'" class="h-4 w-4" />
          </template>
        </DzSegmented>
        <p :style="{ textAlign: align }" class="border rounded p-4 text-sm">
          This paragraph aligns to the selected direction.
        </p>
      </div>
    `,
  }),
}
