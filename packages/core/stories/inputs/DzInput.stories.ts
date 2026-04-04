import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/test'
import { Lock, Mail, Search, User } from 'lucide-vue-next'
import { DzInput } from '../../src/components/inputs'
import { DzIcon } from '../../src/components/media'

/**
 * DzInput is the foundational text input component.
 *
 * It supports three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, six tones, prefix/suffix slots, clearable behavior,
 * and full form-control contract compliance (disabled, readonly, loading,
 * invalid, error message, ARIA attributes).
 */
const meta = {
  title: 'Core/Inputs/DzInput',
  component: DzInput,
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'url', 'tel', 'search'],
      description: 'HTML input type attribute',
      table: { category: 'Behavior', defaultValue: { summary: 'text' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the input is empty',
      table: { category: 'Behavior' },
    },
    maxlength: {
      control: 'number',
      description: 'Maximum number of characters allowed',
      table: { category: 'Behavior' },
    },
    clearable: {
      control: 'boolean',
      description: 'Whether the input shows a clear button when non-empty',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // Behavior
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
      description: 'Loading state -- shows loading indicator',
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
    placeholder: 'Enter text...',
    disabled: false,
    readonly: false,
    loading: false,
    invalid: false,
    required: false,
    clearable: false,
  },
} satisfies Meta<typeof DzInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzInput },
    setup() {
      return { args }
    },
    template: '<DzInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput variant="outline" placeholder="Outline variant" />
        <DzInput variant="filled" placeholder="Filled variant" />
        <DzInput variant="underlined" placeholder="Underlined variant" />
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
    components: { DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput size="xs" placeholder="Extra Small (xs)" />
        <DzInput size="sm" placeholder="Small (sm)" />
        <DzInput size="md" placeholder="Medium (md)" />
        <DzInput size="lg" placeholder="Large (lg)" />
        <DzInput size="xl" placeholder="Extra Large (xl)" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Clearable
// ---------------------------------------------------------------------------

export const Clearable: Story = {
  args: {
    clearable: true,
    placeholder: 'Type something, then clear it...',
  },
  render: args => ({
    components: { DzInput },
    setup() {
      return { args }
    },
    template: '<DzInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// States (disabled, readonly, loading)
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput placeholder="Default state" />
        <DzInput disabled placeholder="Disabled state" />
        <DzInput readonly model-value="Read-only value" />
        <DzInput loading placeholder="Loading state" />
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
    placeholder: 'Disabled input',
  },
  render: args => ({
    components: { DzInput },
    setup() {
      return { args }
    },
    template: '<DzInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput invalid placeholder="Invalid without message" />
        <DzInput error="Email address is required" placeholder="user@example.com" />
        <DzInput error="Must be at least 3 characters" model-value="ab" />
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
    components: { DzInput, DzIcon },
    setup() { return { Mail, User } },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput placeholder="Email address">
          <template #prefix><DzIcon :icon="Mail" size="sm" /></template>
        </DzInput>
        <DzInput placeholder="Username">
          <template #prefix><DzIcon :icon="User" size="sm" /></template>
        </DzInput>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Suffix Slot
// ---------------------------------------------------------------------------

export const WithSuffixIcon: Story = {
  name: 'With Suffix Icon',
  render: () => ({
    components: { DzInput, DzIcon },
    setup() { return { Search } },
    template: `
      <DzInput placeholder="Search..." class="max-w-xs">
        <template #suffix><DzIcon :icon="Search" size="sm" /></template>
      </DzInput>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix and Suffix
// ---------------------------------------------------------------------------

export const WithPrefixAndSuffix: Story = {
  name: 'With Prefix and Suffix',
  render: () => ({
    components: { DzInput, DzIcon },
    setup() { return { Lock, Search } },
    template: `
      <DzInput placeholder="Secure search" class="max-w-xs">
        <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
        <template #suffix><DzIcon :icon="Search" size="sm" /></template>
      </DzInput>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Visual Matrix: Variant x Size
// ---------------------------------------------------------------------------

export const VariantSizeMatrix: Story = {
  name: 'Visual Matrix: Variant x Size',
  render: () => ({
    components: { DzInput },
    template: `
      <div class="space-y-6">
        <div v-for="variant in ['outline', 'filled', 'underlined']" :key="variant">
          <p class="text-sm font-medium mb-2 capitalize">{{ variant }}</p>
          <div class="flex flex-col gap-3 max-w-xs">
            <DzInput :variant="variant" size="xs" :placeholder="variant + ' xs'" />
            <DzInput :variant="variant" size="sm" :placeholder="variant + ' sm'" />
            <DzInput :variant="variant" size="md" :placeholder="variant + ' md'" />
            <DzInput :variant="variant" size="lg" :placeholder="variant + ' lg'" />
            <DzInput :variant="variant" size="xl" :placeholder="variant + ' xl'" />
          </div>
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
    components: { DzInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzInput variant="outline" placeholder="Outline in dark mode" />
        <DzInput variant="filled" placeholder="Filled in dark mode" />
        <DzInput variant="underlined" placeholder="Underlined in dark mode" />
        <DzInput error="Error message in dark mode" placeholder="Invalid input" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: v-model binding
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzInput },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <DzInput v-model="value" placeholder="Type something..." clearable />
        <p class="text-sm text-gray-500">
          Value: <code class="bg-gray-100 px-1 rounded">{{ value || '(empty)' }}</code>
        </p>
        <p class="text-sm text-gray-500">
          Length: {{ value.length }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.type(input, 'Hello, Storybook!')
  },
}

// ---------------------------------------------------------------------------
// Accessibility: Focus States
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus & ARIA',
  render: () => ({
    components: { DzInput },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">Tab through the inputs to see focus rings. Error messages are linked via aria-describedby.</p>
        <DzInput aria-label="First name" placeholder="First name" required />
        <DzInput aria-label="Last name" placeholder="Last name" required />
        <DzInput aria-label="Email" placeholder="Email" error="Please enter a valid email" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Login Form
// ---------------------------------------------------------------------------

export const RealWorldLoginForm: Story = {
  name: 'Real World: Login Form',
  render: () => ({
    components: { DzInput, DzIcon },
    setup() { return { Mail, Lock } },
    template: `
      <div class="space-y-4 max-w-sm">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <DzInput type="email" placeholder="you@example.com">
            <template #prefix><DzIcon :icon="Mail" size="sm" /></template>
          </DzInput>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <DzInput type="password" placeholder="Enter password">
            <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
          </DzInput>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Validation Feedback
// ---------------------------------------------------------------------------

export const RealWorldValidation: Story = {
  name: 'Real World: Validation Feedback',
  render: () => ({
    components: { DzInput },
    data() {
      return { email: 'invalid-email' }
    },
    template: `
      <div class="space-y-4 max-w-sm">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <DzInput
            v-model="email"
            type="email"
            :error="email && !email.includes('@') ? 'Please enter a valid email address' : undefined"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Username (required)</label>
          <DzInput required error="Username is required" placeholder="Choose a username" />
        </div>
      </div>
    `,
  }),
}
