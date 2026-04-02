// token-check-disable-file — color picker stories legitimately use raw color values as test data
import type { Meta, StoryObj } from '@storybook/vue3'
import { DzColorPicker } from '../../src/components/forms'

const brandPresets = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#000000',
]

/**
 * DzColorPicker allows users to select a color via a visual picker panel with optional presets.
 *
 * Built from scratch with a Popover for the color panel.
 * Supports preset swatches, hex/rgb text input, and five sizes.
 */
const meta = {
  title: 'Core/Forms/DzColorPicker',
  component: DzColorPicker,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    presets: {
      control: 'object',
      description: 'Preset color swatches to display',
      table: { category: 'Behavior' },
    },
    showInput: {
      control: 'boolean',
      description: 'Show hex/rgb text input',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
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
    size: 'md',
    disabled: false,
    showInput: true,
    presets: brandPresets,
  },
} satisfies Meta<typeof DzColorPicker>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzColorPicker },
    setup() {
      return { args }
    },
    template: '<DzColorPicker v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    template: `
      <div class="flex items-end gap-6">
        <DzColorPicker size="xs" :presets="presets" />
        <DzColorPicker size="sm" :presets="presets" />
        <DzColorPicker size="md" :presets="presets" />
        <DzColorPicker size="lg" :presets="presets" />
        <DzColorPicker size="xl" :presets="presets" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Without Presets
// ---------------------------------------------------------------------------

export const WithoutPresets: Story = {
  name: 'Without Presets',
  render: () => ({
    components: { DzColorPicker },
    template: '<DzColorPicker :presets="[]" />',
  }),
}

// ---------------------------------------------------------------------------
// Without Text Input
// ---------------------------------------------------------------------------

export const WithoutInput: Story = {
  name: 'Without Text Input',
  render: () => ({
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    template: '<DzColorPicker :presets="presets" :showInput="false" />',
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzColorPicker },
    setup() {
      return { args }
    },
    template: '<DzColorPicker v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid State
// ---------------------------------------------------------------------------

export const InvalidState: Story = {
  name: 'Invalid State',
  args: {
    invalid: true,
    error: 'Please select a valid color',
  },
  render: args => ({
    components: { DzColorPicker },
    setup() {
      return { args }
    },
    template: '<DzColorPicker v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    template: `
      <div class="flex gap-6 items-start">
        <div class="text-center">
          <DzColorPicker :presets="presets" />
          <p class="text-xs text-gray-400 mt-1">Default</p>
        </div>
        <div class="text-center">
          <DzColorPicker :presets="presets" disabled />
          <p class="text-xs text-gray-400 mt-1">Disabled</p>
        </div>
        <div class="text-center">
          <DzColorPicker :presets="presets" invalid />
          <p class="text-xs text-gray-400 mt-1">Invalid</p>
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
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    template: '<DzColorPicker :presets="presets" />',
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    data() {
      return { color: '#3b82f6' }
    },
    template: `
      <div class="space-y-4">
        <DzColorPicker v-model="color" :presets="presets" />
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded border" :style="{ backgroundColor: color }" />
          <p class="text-sm text-gray-500">Selected: <strong>{{ color }}</strong></p>
        </div>
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
    components: { DzColorPicker },
    setup() {
      return { presets: brandPresets }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab to focus trigger, Enter to open, arrow keys in color area, Tab through presets.</p>
        <DzColorPicker :presets="presets" aria-label="Brand color" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Brand Color Selection
// ---------------------------------------------------------------------------

export const RealWorldBrandColor: Story = {
  name: 'Real World: Brand Color',
  render: () => ({
    components: { DzColorPicker },
    data() {
      return { brandColor: '#3b82f6' }
    },
    template: `
      <div class="max-w-xs">
        <label class="block text-sm font-medium mb-1">Brand Primary Color</label>
        <DzColorPicker
          v-model="brandColor"
          :presets="['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']"
          name="brand-color"
          aria-label="Brand primary color"
        />
        <p class="text-xs text-gray-400 mt-1">Used for buttons, links, and accents across your site.</p>
      </div>
    `,
  }),
}
