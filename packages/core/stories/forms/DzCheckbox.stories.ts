import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/test'
import { DzCheckbox } from '../../src/components/forms'

/**
 * DzCheckbox is a toggleable checkbox component built on Reka UI CheckboxRoot.
 *
 * It supports five sizes, indeterminate state, disabled state,
 * and integrates with DzCheckboxGroup for multi-value selection.
 */
const meta = {
  title: 'Core/Forms/DzCheckbox',
  component: DzCheckbox,
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
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate (mixed) state',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'String value for checkbox groups',
      table: { category: 'Behavior' },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
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
    indeterminate: false,
  },
} satisfies Meta<typeof DzCheckbox>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCheckbox },
    setup() {
      return { args }
    },
    template: '<DzCheckbox v-bind="args">Accept terms and conditions</DzCheckbox>',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCheckbox },
    template: `
      <div class="space-y-3">
        <DzCheckbox size="xs">Extra Small</DzCheckbox>
        <DzCheckbox size="sm">Small</DzCheckbox>
        <DzCheckbox size="md">Medium</DzCheckbox>
        <DzCheckbox size="lg">Large</DzCheckbox>
        <DzCheckbox size="xl">Extra Large</DzCheckbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled State
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzCheckbox },
    setup() {
      return { args }
    },
    template: '<DzCheckbox v-bind="args">Disabled checkbox</DzCheckbox>',
  }),
}

// ---------------------------------------------------------------------------
// Indeterminate State
// ---------------------------------------------------------------------------

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: args => ({
    components: { DzCheckbox },
    setup() {
      return { args }
    },
    template: '<DzCheckbox v-bind="args">Indeterminate</DzCheckbox>',
  }),
}

// ---------------------------------------------------------------------------
// States Side by Side
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzCheckbox },
    template: `
      <div class="space-y-3">
        <DzCheckbox>Unchecked</DzCheckbox>
        <DzCheckbox :model-value="true">Checked</DzCheckbox>
        <DzCheckbox indeterminate>Indeterminate</DzCheckbox>
        <DzCheckbox disabled>Disabled unchecked</DzCheckbox>
        <DzCheckbox disabled :model-value="true">Disabled checked</DzCheckbox>
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
    components: { DzCheckbox },
    template: `
      <div class="space-y-3">
        <DzCheckbox>Unchecked</DzCheckbox>
        <DzCheckbox :model-value="true">Checked</DzCheckbox>
        <DzCheckbox indeterminate>Indeterminate</DzCheckbox>
        <DzCheckbox disabled>Disabled</DzCheckbox>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCheckbox },
    data() {
      return { checked: false }
    },
    template: `
      <div class="space-y-4">
        <DzCheckbox v-model="checked">Toggle me</DzCheckbox>
        <p class="text-sm text-gray-500">Checked: <strong>{{ checked }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)
  },
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzCheckbox },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab through checkboxes, press Space to toggle.</p>
        <div class="space-y-2">
          <DzCheckbox aria-label="Option A">Option A</DzCheckbox>
          <DzCheckbox aria-label="Option B">Option B</DzCheckbox>
          <DzCheckbox aria-label="Option C">Option C</DzCheckbox>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Terms and Conditions
// ---------------------------------------------------------------------------

export const RealWorldTerms: Story = {
  name: 'Real World: Terms Agreement',
  render: () => ({
    components: { DzCheckbox },
    data() {
      return { agreed: false }
    },
    template: `
      <div class="max-w-md space-y-4">
        <DzCheckbox v-model="agreed" required>
          I agree to the <a href="#" class="underline text-blue-600">Terms of Service</a>
          and <a href="#" class="underline text-blue-600">Privacy Policy</a>
        </DzCheckbox>
        <button
          :disabled="!agreed"
          class="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    `,
  }),
}
