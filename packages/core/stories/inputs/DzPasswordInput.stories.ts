import type { Meta, StoryObj } from '@storybook/vue3'
import { Lock, Shield } from 'lucide-vue-next'
import { DzPasswordInput } from '../../src/components/inputs'
import { DzIcon } from '../../src/components/media'

/**
 * DzPasswordInput is a password field with a built-in visibility toggle.
 *
 * Clicking the eye icon switches between masked (password) and plain text
 * display. Supports three visual variants (`outline`, `filled`, `underlined`),
 * five sizes, prefix slot, and full form-control contract compliance.
 */
const meta = {
  title: 'Core/Inputs/DzPasswordInput',
  component: DzPasswordInput,
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
    maxlength: {
      control: 'number',
      description: 'Maximum character length',
      table: { category: 'Behavior' },
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
    placeholder: 'Enter password...',
    disabled: false,
    readonly: false,
    loading: false,
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof DzPasswordInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzPasswordInput },
    setup() {
      return { args }
    },
    template: '<DzPasswordInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzPasswordInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput variant="outline" placeholder="Outline variant" />
        <DzPasswordInput variant="filled" placeholder="Filled variant" />
        <DzPasswordInput variant="underlined" placeholder="Underlined variant" />
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
    components: { DzPasswordInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput size="xs" placeholder="Extra Small (xs)" />
        <DzPasswordInput size="sm" placeholder="Small (sm)" />
        <DzPasswordInput size="md" placeholder="Medium (md)" />
        <DzPasswordInput size="lg" placeholder="Large (lg)" />
        <DzPasswordInput size="xl" placeholder="Extra Large (xl)" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Prefix Icon
// ---------------------------------------------------------------------------

export const WithPrefixIcon: Story = {
  name: 'With Prefix Icon',
  render: () => ({
    components: { DzPasswordInput, DzIcon },
    setup() { return { Lock, Shield } },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput placeholder="Password">
          <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
        </DzPasswordInput>
        <DzPasswordInput placeholder="API Secret">
          <template #prefix><DzIcon :icon="Shield" size="sm" /></template>
        </DzPasswordInput>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzPasswordInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput placeholder="Default state" />
        <DzPasswordInput disabled placeholder="Disabled state" />
        <DzPasswordInput readonly model-value="secretpassword" />
        <DzPasswordInput loading placeholder="Loading state" />
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
    placeholder: 'Disabled password input',
  },
  render: args => ({
    components: { DzPasswordInput },
    setup() {
      return { args }
    },
    template: '<DzPasswordInput v-bind="args" class="max-w-xs" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzPasswordInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput invalid placeholder="Invalid without message" />
        <DzPasswordInput error="Password is required" placeholder="Enter password" />
        <DzPasswordInput error="Must be at least 8 characters" model-value="short" />
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
    components: { DzPasswordInput },
    template: `
      <div class="flex flex-col gap-4 max-w-xs">
        <DzPasswordInput variant="outline" placeholder="Outline in dark mode" />
        <DzPasswordInput variant="filled" placeholder="Filled in dark mode" />
        <DzPasswordInput variant="underlined" placeholder="Underlined in dark mode" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Toggle Visibility
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzPasswordInput },
    data() {
      return { password: '' }
    },
    template: `
      <div class="space-y-3 max-w-xs">
        <p class="text-sm text-gray-500">Click the eye icon to toggle password visibility.</p>
        <DzPasswordInput v-model="password" placeholder="Type a password..." />
        <p class="text-sm text-gray-500">
          Value: <code class="bg-gray-100 px-1 rounded">{{ password || '(empty)' }}</code>
        </p>
        <p class="text-sm text-gray-500">Length: {{ password.length }}</p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Toggle & ARIA',
  render: () => ({
    components: { DzPasswordInput },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">
          The visibility toggle button has descriptive aria-label that changes between
          "Show password" and "Hide password". Error messages are linked via aria-describedby.
        </p>
        <DzPasswordInput aria-label="Password" placeholder="Enter your password" required />
        <DzPasswordInput aria-label="Confirm password" error="Passwords do not match" placeholder="Confirm password" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Change Password
// ---------------------------------------------------------------------------

export const RealWorldChangePassword: Story = {
  name: 'Real World: Change Password',
  render: () => ({
    components: { DzPasswordInput, DzIcon },
    setup() { return { Lock } },
    data() {
      return { current: '', newPass: '', confirm: '' }
    },
    computed: {
      confirmError(): string | undefined {
        if (this.confirm && this.confirm !== this.newPass) {
          return 'Passwords do not match'
        }
        return undefined
      },
      strengthError(): string | undefined {
        if (this.newPass && this.newPass.length < 8) {
          return 'Password must be at least 8 characters'
        }
        return undefined
      },
    },
    template: `
      <div class="max-w-sm space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Current Password</label>
          <DzPasswordInput v-model="current" placeholder="Enter current password">
            <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
          </DzPasswordInput>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">New Password</label>
          <DzPasswordInput v-model="newPass" :error="strengthError" placeholder="Enter new password">
            <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
          </DzPasswordInput>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirm New Password</label>
          <DzPasswordInput v-model="confirm" :error="confirmError" placeholder="Confirm new password">
            <template #prefix><DzIcon :icon="Lock" size="sm" /></template>
          </DzPasswordInput>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Sign Up
// ---------------------------------------------------------------------------

export const RealWorldSignUp: Story = {
  name: 'Real World: Sign Up Form',
  render: () => ({
    components: { DzPasswordInput },
    template: `
      <div class="max-w-xs space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Password <span class="text-red-500">*</span></label>
          <DzPasswordInput placeholder="Create a strong password" required />
          <p class="text-xs text-gray-400 mt-1">At least 8 characters with upper, lower, and a number.</p>
        </div>
      </div>
    `,
  }),
}
