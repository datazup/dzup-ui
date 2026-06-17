import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Heart } from 'lucide-vue-next'
import { expect, userEvent, within } from 'storybook/test'
import { darkModeDecorator } from '../_shared'
import {
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzRating,
} from '../../src/components/forms'

/**
 * DzRating is a star/icon rating input implemented as a single
 * `role="slider"` widget, so it is keyboard-operable and composes with
 * DzFormField for validation.
 *
 * It supports five sizes, six semantic tones (defaulting to the classic gold
 * `warning` star), half-step selection, click-to-clear, and custom icons.
 */
const meta = {
  title: 'Core/Forms/DzRating',
  component: DzRating,
  tags: ['autodocs', 'status:experimental'],
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
      description: 'Filled-star color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'warning' } },
    },
    // Behavior
    count: {
      control: 'number',
      description: 'Number of rating items',
      table: { category: 'Behavior', defaultValue: { summary: '5' } },
    },
    allowHalf: {
      control: 'boolean',
      description: 'Allow half-step (0.5) selection',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Click the selected value to reset to 0',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction and focus',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only -- display-only but focusable for screen readers',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // State
    invalid: {
      control: 'boolean',
      description: 'Invalid validation state',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: { category: 'State' },
    },
    error: {
      control: 'text',
      description: 'Inline error message',
      table: { category: 'State' },
    },
    // Accessibility
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    count: 5,
    size: 'md',
    tone: 'warning',
    allowHalf: false,
    allowClear: false,
    disabled: false,
    readonly: false,
  },
} satisfies Meta<typeof DzRating>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzRating },
    setup() {
      return { args }
    },
    data() {
      return { score: 3 }
    },
    template: `
      <div class="space-y-3">
        <DzRating v-bind="args" v-model:value="score" aria-label="Rating" />
        <p class="text-sm text-gray-500">Value: <strong>{{ score }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Half Stars
// ---------------------------------------------------------------------------

export const HalfStars: Story = {
  name: 'Half Stars',
  args: { allowHalf: true },
  render: args => ({
    components: { DzRating },
    setup() {
      return { args }
    },
    data() {
      return { score: 2.5 }
    },
    template: `
      <div class="space-y-3">
        <DzRating v-bind="args" v-model:value="score" aria-label="Rating" />
        <p class="text-sm text-gray-500">Value: <strong>{{ score }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Read Only
// ---------------------------------------------------------------------------

export const ReadOnly: Story = {
  name: 'Read Only',
  args: { readonly: true },
  render: args => ({
    components: { DzRating },
    setup() {
      return { args }
    },
    template: `<DzRating v-bind="args" :value="4" aria-label="Average rating" />`,
  }),
}

// ---------------------------------------------------------------------------
// Sizes matrix
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: 'Size Matrix',
  render: () => ({
    components: { DzRating },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex items-center gap-4">
          <span class="w-8 text-sm font-medium capitalize">{{ size }}</span>
          <DzRating :size="size" :value="3" aria-label="Rating" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Tones
// ---------------------------------------------------------------------------

export const Tones: Story = {
  name: 'Tone Gallery',
  render: () => ({
    components: { DzRating },
    template: `
      <div class="space-y-4">
        <div
          v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']"
          :key="tone"
          class="flex items-center gap-4"
        >
          <span class="w-16 text-sm font-medium capitalize">{{ tone }}</span>
          <DzRating :tone="tone" :value="4" aria-label="Rating" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom Icon
// ---------------------------------------------------------------------------

export const CustomIcon: Story = {
  name: 'Custom Icon',
  render: () => ({
    components: { DzRating },
    setup() {
      return { Heart }
    },
    data() {
      return { score: 3 }
    },
    template: `
      <div class="space-y-3">
        <DzRating v-model:value="score" :icon="Heart" tone="danger" aria-label="Favorites" />
        <p class="text-sm text-gray-500">Value: <strong>{{ score }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// In DzFormField
// ---------------------------------------------------------------------------

export const InFormField: Story = {
  name: 'In DzFormField',
  render: () => ({
    components: { DzRating, DzFormField, DzFormLabel, DzFormDescription, DzFormMessage },
    data() {
      return { score: 0 }
    },
    computed: {
      error(): string {
        return (this as unknown as { score: number }).score === 0 ? 'A rating is required' : ''
      },
    },
    template: `
      <DzFormField required :invalid="!!error" :error="error" class="max-w-sm">
        <DzFormLabel>Rate your experience</DzFormLabel>
        <DzFormDescription>Tap a star to score from 1 to 5.</DzFormDescription>
        <DzRating v-model:value="score" allow-clear />
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzRating },
    template: `
      <div class="space-y-4">
        <DzRating :value="3" tone="warning" aria-label="Rating" />
        <DzRating :value="4" tone="primary" aria-label="Rating" />
        <DzRating :value="2.5" allow-half tone="success" aria-label="Rating" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive (keyboard)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzRating },
    data() {
      return { score: 2 }
    },
    template: `
      <div class="space-y-3">
        <DzRating v-model:value="score" aria-label="Quality" />
        <p class="text-sm text-gray-500">Value: <strong>{{ score }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')
    await expect(slider).toHaveAttribute('aria-valuenow', '2')

    slider.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(slider).toHaveAttribute('aria-valuenow', '3')

    await userEvent.keyboard('{Home}')
    await expect(slider).toHaveAttribute('aria-valuenow', '0')

    await userEvent.keyboard('{End}')
    await expect(slider).toHaveAttribute('aria-valuenow', '5')
  },
}
