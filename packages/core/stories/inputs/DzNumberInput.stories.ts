import type { Meta, StoryObj } from '@storybook/vue3'
import { DollarSign, Hash } from 'lucide-vue-next'
import { DzNumberInput } from '../../src/components/inputs'
import { DzIcon } from '../../src/components/media'

/**
 * DzNumberInput is a numeric input with increment/decrement buttons.
 *
 * Supports min/max value clamping, configurable step, keyboard arrow key
 * interaction, three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, and full form-control contract compliance.
 */
const meta = {
  title: 'Core/Inputs/DzNumberInput',
  component: DzNumberInput,
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
      description: 'Placeholder text shown when empty',
      table: { category: 'Behavior' },
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value',
      table: { category: 'Behavior' },
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value',
      table: { category: 'Behavior' },
    },
    step: {
      control: 'number',
      description: 'Step increment for +/- buttons and arrow keys',
      table: { category: 'Behavior', defaultValue: { summary: '1' } },
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
    variant: 'outline',
    size: 'md',
    step: 1,
    disabled: false,
    readonly: false,
    loading: false,
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof DzNumberInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzNumberInput },
    setup() {
      return { args }
    },
    template: '<DzNumberInput v-bind="args" class="max-w-[200px]" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput variant="outline" placeholder="Outline" />
        <DzNumberInput variant="filled" placeholder="Filled" />
        <DzNumberInput variant="underlined" placeholder="Underlined" />
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
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput size="xs" placeholder="XS" />
        <DzNumberInput size="sm" placeholder="SM" />
        <DzNumberInput size="md" placeholder="MD" />
        <DzNumberInput size="lg" placeholder="LG" />
        <DzNumberInput size="xl" placeholder="XL" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Min / Max / Step
// ---------------------------------------------------------------------------

export const MinMaxStep: Story = {
  name: 'Min, Max, and Step',
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <div>
          <label class="block text-sm font-medium mb-1">Quantity (0-10, step 1)</label>
          <DzNumberInput :min="0" :max="10" :step="1" :model-value="5" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Price (step 0.01)</label>
          <DzNumberInput :min="0" :step="0.01" placeholder="0.00" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Percentage (0-100, step 5)</label>
          <DzNumberInput :min="0" :max="100" :step="5" :model-value="50" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Slot
// ---------------------------------------------------------------------------

export const WithPrefixIcon: Story = {
  name: 'With Prefix Icon',
  render: () => ({
    components: { DzNumberInput, DzIcon, DollarSign, Hash },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput :min="0" :step="0.01" placeholder="0.00">
          <template #prefix><DzIcon :icon="DollarSign" size="sm" /></template>
        </DzNumberInput>
        <DzNumberInput :min="1" placeholder="Count">
          <template #prefix><DzIcon :icon="Hash" size="sm" /></template>
        </DzNumberInput>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput placeholder="Default" />
        <DzNumberInput disabled :model-value="42" />
        <DzNumberInput readonly :model-value="99" />
        <DzNumberInput loading placeholder="Loading" />
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
  },
  render: args => ({
    components: { DzNumberInput },
    setup() {
      return { args }
    },
    template: '<DzNumberInput v-bind="args" :model-value="42" class="max-w-[200px]" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput invalid placeholder="Invalid" />
        <DzNumberInput error="Value is required" placeholder="Enter a number" />
        <DzNumberInput error="Must be between 1 and 100" :model-value="150" :min="1" :max="100" />
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
    components: { DzNumberInput },
    template: `
      <div class="flex flex-col gap-4 max-w-[200px]">
        <DzNumberInput variant="outline" :model-value="10" />
        <DzNumberInput variant="filled" :model-value="20" />
        <DzNumberInput variant="underlined" :model-value="30" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: v-model binding
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzNumberInput },
    data() {
      return { value: 0 }
    },
    template: `
      <div class="space-y-3 max-w-[200px]">
        <DzNumberInput v-model="value" :min="0" :max="100" :step="1" />
        <p class="text-sm text-gray-500">
          Value: <code class="bg-gray-100 px-1 rounded">{{ value ?? '(undefined)' }}</code>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard & ARIA',
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="space-y-4 max-w-[200px]">
        <p class="text-sm text-gray-500">Use Arrow Up/Down keys to increment/decrement. The component uses role="spinbutton" with aria-valuemin, aria-valuemax, and aria-valuenow.</p>
        <DzNumberInput
          aria-label="Quantity"
          :min="0"
          :max="10"
          :step="1"
          :model-value="5"
        />
        <DzNumberInput
          aria-label="Price"
          error="Price is required"
          :min="0"
          :step="0.01"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Quantity Selector
// ---------------------------------------------------------------------------

export const RealWorldQuantitySelector: Story = {
  name: 'Real World: Quantity Selector',
  render: () => ({
    components: { DzNumberInput },
    data() {
      return { quantity: 1 }
    },
    template: `
      <div class="flex items-center gap-4 max-w-sm">
        <div class="flex-1">
          <p class="font-medium">Wireless Headphones</p>
          <p class="text-sm text-gray-500">$129.99 each</p>
        </div>
        <DzNumberInput v-model="quantity" :min="1" :max="10" size="sm" class="w-[120px]" />
        <p class="text-sm font-medium w-20 text-right">\${{ ((quantity ?? 0) * 129.99).toFixed(2) }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Form
// ---------------------------------------------------------------------------

export const RealWorldSettingsForm: Story = {
  name: 'Real World: Settings Form',
  render: () => ({
    components: { DzNumberInput },
    template: `
      <div class="max-w-sm space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Max retries</label>
          <DzNumberInput :min="0" :max="10" :step="1" :model-value="3" class="w-[180px]" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Timeout (seconds)</label>
          <DzNumberInput :min="1" :max="300" :step="5" :model-value="30" class="w-[180px]" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Cache TTL (minutes)</label>
          <DzNumberInput :min="0" :max="1440" :step="15" :model-value="60" class="w-[180px]" />
        </div>
      </div>
    `,
  }),
}
