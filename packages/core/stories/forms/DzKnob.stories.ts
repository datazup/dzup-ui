import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzKnob,
} from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzKnob is a rotary numeric input rendered as an SVG circular dial, implemented
 * as a single `role="slider"` widget. It is keyboard-operable, pointer-
 * draggable, and composes with DzFormField for validation.
 *
 * A muted range arc spans a 270° gauge; a tone-colored value arc fills it in
 * proportion to the value. It supports five sizes, six semantic tones, custom
 * bounds and step, and a `valueTemplate` for the centered label.
 */
const meta = {
  title: 'Core/Forms/DzKnob',
  component: DzKnob,
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
      description: 'Value arc color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    strokeWidth: {
      control: { type: 'range', min: 2, max: 20, step: 1 },
      description: 'Arc stroke width (viewBox units)',
      table: { category: 'Appearance', defaultValue: { summary: '8' } },
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
    valueTemplate: {
      control: 'text',
      description: 'Label template; `{value}` is interpolated',
      table: { category: 'Behavior', defaultValue: { summary: '{value}' } },
    },
    showValue: {
      control: 'boolean',
      description: 'Show the centered value label',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
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
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    tone: 'primary',
    strokeWidth: 8,
    valueTemplate: '{value}%',
    showValue: true,
    disabled: false,
    readonly: false,
  },
} satisfies Meta<typeof DzKnob>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzKnob },
    setup() {
      return { args }
    },
    data() {
      return { level: 60 }
    },
    template: `
      <div class="flex flex-col items-center gap-3">
        <DzKnob v-bind="args" v-model:value="level" aria-label="Level" />
        <p class="text-sm text-gray-500">Value: <strong>{{ level }}</strong></p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Stepped
// ---------------------------------------------------------------------------

export const Stepped: Story = {
  name: 'Stepped',
  args: { min: 0, max: 50, step: 5, valueTemplate: '{value}' },
  render: args => ({
    components: { DzKnob },
    setup() {
      return { args }
    },
    data() {
      return { level: 25 }
    },
    template: `
      <div class="flex flex-col items-center gap-3">
        <DzKnob v-bind="args" v-model:value="level" aria-label="Steps" />
        <p class="text-sm text-gray-500">Value: <strong>{{ level }}</strong> (step 5)</p>
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
    components: { DzKnob },
    template: `
      <div class="flex flex-wrap items-center gap-6">
        <div
          v-for="tone in ['neutral', 'primary', 'success', 'warning', 'danger', 'info']"
          :key="tone"
          class="flex flex-col items-center gap-2"
        >
          <DzKnob :tone="tone" :value="70" value-template="{value}%" aria-label="Level" />
          <span class="text-xs font-medium capitalize">{{ tone }}</span>
        </div>
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
    components: { DzKnob },
    setup() {
      return { args }
    },
    template: `<DzKnob v-bind="args" :value="80" value-template="{value}%" aria-label="CPU usage" />`,
  }),
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  name: 'Size Matrix',
  render: () => ({
    components: { DzKnob },
    template: `
      <div class="flex flex-wrap items-end gap-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size" class="flex flex-col items-center gap-2">
          <DzKnob :size="size" :value="65" value-template="{value}%" aria-label="Level" />
          <span class="text-xs font-medium capitalize">{{ size }}</span>
        </div>
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
    components: { DzKnob, DzFormField, DzFormLabel, DzFormDescription, DzFormMessage },
    data() {
      return { gain: 0 }
    },
    computed: {
      error(): string {
        return (this as unknown as { gain: number }).gain === 0 ? 'Set a gain above zero' : ''
      },
    },
    template: `
      <DzFormField required :invalid="!!error" :error="error" class="max-w-sm">
        <DzFormLabel>Output gain</DzFormLabel>
        <DzFormDescription>Drag the dial or use the arrow keys.</DzFormDescription>
        <DzKnob v-model:value="gain" tone="success" value-template="{value}%" />
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
    components: { DzKnob },
    template: `
      <div class="flex flex-wrap items-center gap-6">
        <DzKnob :value="70" tone="primary" value-template="{value}%" aria-label="Level" />
        <DzKnob :value="40" tone="success" value-template="{value}%" aria-label="Level" />
        <DzKnob :value="90" tone="danger" value-template="{value}%" aria-label="Level" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive (keyboard)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzKnob },
    data() {
      return { level: 50 }
    },
    template: `
      <div class="flex flex-col items-center gap-3">
        <DzKnob v-model:value="level" value-template="{value}%" aria-label="Level" />
        <p class="text-sm text-gray-500">Value: <strong>{{ level }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')
    await expect(slider).toHaveAttribute('aria-valuenow', '50')

    slider.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(slider).toHaveAttribute('aria-valuenow', '51')

    await userEvent.keyboard('{Home}')
    await expect(slider).toHaveAttribute('aria-valuenow', '0')

    await userEvent.keyboard('{End}')
    await expect(slider).toHaveAttribute('aria-valuenow', '100')
  },
}
