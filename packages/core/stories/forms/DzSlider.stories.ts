import type { Meta, StoryObj } from '@storybook/vue3'
import { DzSlider } from '../../src/components/forms'

/**
 * DzSlider is a single-thumb slider built on Reka UI Slider primitives.
 *
 * It supports five sizes, six semantic tones, min/max/step constraints,
 * horizontal/vertical orientation, and disabled state.
 */
const meta = {
  title: 'Core/Forms/DzSlider',
  component: DzSlider,
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
} satisfies Meta<typeof DzSlider>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSlider },
    setup() {
      return { args }
    },
    template: '<DzSlider v-bind="args" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzSlider :size="size" :model-value="50" />
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
    components: { DzSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']" :key="tone">
          <p class="text-sm font-medium mb-2 capitalize">{{ tone }}</p>
          <DzSlider :tone="tone" :model-value="60" />
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
    components: { DzSlider },
    data() {
      return { value: 50 }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzSlider v-model="value" :min="0" :max="100" :step="10" />
        <p class="text-sm text-gray-500">Value: <strong>{{ value }}</strong> (step: 10)</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => ({
    components: { DzSlider },
    template: `
      <div class="flex gap-8 h-48">
        <DzSlider orientation="vertical" :model-value="30" tone="primary" />
        <DzSlider orientation="vertical" :model-value="60" tone="success" />
        <DzSlider orientation="vertical" :model-value="80" tone="danger" />
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
    components: { DzSlider },
    setup() {
      return { args }
    },
    template: '<DzSlider v-bind="args" :model-value="40" class="max-w-sm" />',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <div>
          <p class="text-sm mb-1">Default</p>
          <DzSlider :model-value="50" />
        </div>
        <div>
          <p class="text-sm mb-1">Disabled</p>
          <DzSlider :model-value="50" disabled />
        </div>
        <div>
          <p class="text-sm mb-1">Invalid</p>
          <DzSlider :model-value="50" invalid />
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
    components: { DzSlider },
    template: `
      <div class="space-y-6 max-w-sm">
        <DzSlider :model-value="30" tone="primary" />
        <DzSlider :model-value="60" tone="success" />
        <DzSlider :model-value="80" tone="danger" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSlider },
    data() {
      return { volume: 50 }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <DzSlider v-model="volume" :min="0" :max="100" aria-label="Volume" />
        <p class="text-sm text-gray-500">Volume: <strong>{{ volume }}%</strong></p>
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
    components: { DzSlider },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">Tab to focus the thumb, arrow keys to adjust value.</p>
        <DzSlider aria-label="Brightness" :model-value="50" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Volume Control
// ---------------------------------------------------------------------------

export const RealWorldVolume: Story = {
  name: 'Real World: Volume Control',
  render: () => ({
    components: { DzSlider },
    data() {
      return { volume: 75 }
    },
    template: `
      <div class="max-w-xs">
        <label class="block text-sm font-medium mb-2">Volume</label>
        <DzSlider v-model="volume" :min="0" :max="100" tone="primary" aria-label="Volume" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>{{ volume }}%</span>
          <span>100%</span>
        </div>
      </div>
    `,
  }),
}
