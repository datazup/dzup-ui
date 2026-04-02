import type { Meta, StoryObj } from '@storybook/vue3'
import { DzRangeSlider } from '../../src/components/forms'

/**
 * DzRangeSlider is a dual-thumb slider for selecting a numeric range.
 *
 * Built on Reka UI Slider with two thumbs. The model value is a `[number, number]` tuple.
 * Supports tones, sizes, orientation, and step constraints.
 */
const meta = {
  title: 'Core/Forms/DzRangeSlider',
  component: DzRangeSlider,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
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
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Slider orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'horizontal' } },
    },
    // Behavior
    min: {
      control: 'number',
      description: 'Minimum value',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      table: { category: 'Behavior', defaultValue: { summary: '100' } },
    },
    step: {
      control: 'number',
      description: 'Step increment',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
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
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    tone: 'primary',
    orientation: 'horizontal',
    disabled: false,
  },
} satisfies Meta<typeof DzRangeSlider>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzRangeSlider },
    setup() {
      return { args }
    },
    template: '<DzRangeSlider v-bind="args" :model-value="[25, 75]" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzRangeSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzRangeSlider :size="size" :model-value="[20, 80]" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tone Gallery
// ---------------------------------------------------------------------------

export const AllTones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzRangeSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone">
          <p class="text-sm font-medium mb-2 capitalize">{{ tone }}</p>
          <DzRangeSlider :tone="tone" :model-value="[30, 70]" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Steps
// ---------------------------------------------------------------------------

export const WithSteps: Story = {
  name: 'Step Increment (10)',
  render: () => ({
    components: { DzRangeSlider },
    data() {
      return { range: [20, 80] as [number, number] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzRangeSlider v-model="range" :min="0" :max="100" :step="10" />
        <p class="text-sm text-gray-500">Range: <strong>{{ range[0] }} - {{ range[1] }}</strong> (step: 10)</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => ({
    components: { DzRangeSlider },
    template: `
      <div class="flex gap-8 h-48">
        <DzRangeSlider orientation="vertical" :model-value="[20, 60]" tone="primary" />
        <DzRangeSlider orientation="vertical" :model-value="[30, 80]" tone="success" />
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
    components: { DzRangeSlider },
    setup() {
      return { args }
    },
    template: '<DzRangeSlider v-bind="args" :model-value="[25, 75]" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzRangeSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div>
          <p class="text-sm mb-1">Default</p>
          <DzRangeSlider :model-value="[25, 75]" />
        </div>
        <div>
          <p class="text-sm mb-1">Disabled</p>
          <DzRangeSlider :model-value="[25, 75]" disabled />
        </div>
        <div>
          <p class="text-sm mb-1">Invalid</p>
          <DzRangeSlider :model-value="[25, 75]" invalid />
        </div>
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
    components: { DzRangeSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <DzRangeSlider :model-value="[20, 60]" tone="primary" />
        <DzRangeSlider :model-value="[30, 80]" tone="success" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzRangeSlider },
    data() {
      return { range: [200, 800] as [number, number] }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzRangeSlider v-model="range" :min="0" :max="1000" :step="50" aria-label="Price range" />
        <p class="text-sm text-gray-500">Price: <strong>\${{ range[0] }} - \${{ range[1] }}</strong></p>
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
    components: { DzRangeSlider },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Tab to focus each thumb, arrow keys to adjust. Both thumbs are independently focusable.</p>
        <DzRangeSlider :model-value="[30, 70]" aria-label="Range selection" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Price Filter
// ---------------------------------------------------------------------------

export const RealWorldPriceFilter: Story = {
  name: 'Real World: Price Filter',
  render: () => ({
    components: { DzRangeSlider },
    data() {
      return { price: [50, 500] as [number, number] }
    },
    template: `
      <div class="max-w-sm">
        <label class="block text-sm font-medium mb-2">Price Range</label>
        <DzRangeSlider v-model="price" :min="0" :max="1000" :step="10" tone="primary" aria-label="Price filter" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>\${{ price[0] }}</span>
          <span>\${{ price[1] }}</span>
        </div>
      </div>
    `,
  }),
}
