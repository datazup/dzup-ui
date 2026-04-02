import type { Meta, StoryObj } from '@storybook/vue3'
import { DzOtpInput } from '../../src/components/inputs'

/**
 * DzOtpInput is a one-time password / PIN input component built on Reka UI
 * PinInput primitives (ADR-07).
 *
 * It renders a series of individual digit/character inputs that auto-advance
 * on entry. Supports numeric or text mode, masked display, configurable
 * length, five sizes, and emits `complete` when all digits are filled.
 */
const meta = {
  title: 'Core/Inputs/DzOtpInput',
  component: DzOtpInput,
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
    length: {
      control: { type: 'number', min: 3, max: 8, step: 1 },
      description: 'Number of input digits',
      table: { category: 'Behavior', defaultValue: { summary: '6' } },
    },
    type: {
      control: 'select',
      options: ['number', 'text'],
      description: 'Input type: number-only or any text',
      table: { category: 'Behavior', defaultValue: { summary: 'number' } },
    },
    mask: {
      control: 'boolean',
      description: 'Mask input values (like a password field)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
    length: 6,
    type: 'number',
    mask: false,
    disabled: false,
    size: 'md',
    invalid: false,
    required: false,
  },
} satisfies Meta<typeof DzOtpInput>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzOtpInput },
    setup() {
      return { args }
    },
    template: '<DzOtpInput v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Extra Small (xs)</p>
          <DzOtpInput size="xs" :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Small (sm)</p>
          <DzOtpInput size="sm" :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Medium (md)</p>
          <DzOtpInput size="md" :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Large (lg)</p>
          <DzOtpInput size="lg" :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Extra Large (xl)</p>
          <DzOtpInput size="xl" :length="6" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Length Variations
// ---------------------------------------------------------------------------

export const LengthVariations: Story = {
  name: 'Length Variations',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">4-digit PIN</p>
          <DzOtpInput :length="4" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">6-digit OTP (default)</p>
          <DzOtpInput :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">8-digit code</p>
          <DzOtpInput :length="8" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Numeric vs Text
// ---------------------------------------------------------------------------

export const InputTypes: Story = {
  name: 'Numeric vs Text',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Numeric only</p>
          <DzOtpInput type="number" :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Alphanumeric (text)</p>
          <DzOtpInput type="text" :length="6" />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Masked Input
// ---------------------------------------------------------------------------

export const Masked: Story = {
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Normal (visible digits)</p>
          <DzOtpInput :length="4" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Masked (hidden digits)</p>
          <DzOtpInput :length="4" mask />
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <p class="text-sm font-medium mb-2">Default</p>
          <DzOtpInput :length="6" />
        </div>
        <div>
          <p class="text-sm font-medium mb-2">Disabled</p>
          <DzOtpInput :length="6" disabled />
        </div>
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
    components: { DzOtpInput },
    setup() {
      return { args }
    },
    template: '<DzOtpInput v-bind="args" />',
  }),
}

// ---------------------------------------------------------------------------
// Invalid & Error
// ---------------------------------------------------------------------------

export const Invalid: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <div>
          <DzOtpInput invalid :length="6" />
        </div>
        <div>
          <DzOtpInput error="Invalid verification code" :length="6" />
        </div>
        <div>
          <DzOtpInput error="Code has expired -- request a new one" :length="6" />
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
    components: { DzOtpInput },
    template: `
      <div class="space-y-6">
        <DzOtpInput :length="6" />
        <DzOtpInput :length="4" mask />
        <DzOtpInput :length="6" error="Invalid code" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Complete Event
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzOtpInput },
    data() {
      return { value: '', completed: false, completedValue: '' }
    },
    methods: {
      handleComplete(val: string) {
        this.completed = true
        this.completedValue = val
      },
    },
    template: `
      <div class="space-y-3">
        <p class="text-sm text-gray-500">Type a 6-digit code. The "complete" event fires when all digits are filled.</p>
        <DzOtpInput v-model="value" :length="6" @complete="handleComplete" />
        <div class="text-sm text-gray-500 space-y-1">
          <p>Value: <code class="bg-gray-100 px-1 rounded">{{ value || '(empty)' }}</code></p>
          <p>Completed: <code class="bg-gray-100 px-1 rounded">{{ completed ? completedValue : 'No' }}</code></p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Tab to focus the first cell. Type a digit to advance to the next cell.
          Backspace moves back. Paste a full code to auto-fill all cells.
          Built on Reka UI PinInput for robust keyboard and screen reader support.
        </p>
        <DzOtpInput aria-label="Verification code" :length="6" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Email Verification
// ---------------------------------------------------------------------------

export const RealWorldEmailVerification: Story = {
  name: 'Real World: Email Verification',
  render: () => ({
    components: { DzOtpInput },
    data() {
      return { code: '', verified: false }
    },
    methods: {
      handleComplete(val: string) {
        this.verified = val === '123456'
      },
    },
    template: `
      <div class="max-w-sm text-center space-y-4">
        <div>
          <p class="font-semibold text-lg">Verify your email</p>
          <p class="text-sm text-gray-500 mt-1">
            We sent a 6-digit code to user@example.com
          </p>
        </div>
        <DzOtpInput
          v-model="code"
          :length="6"
          :error="code.length === 6 && !verified ? 'Incorrect code. Try 123456.' : undefined"
          @complete="handleComplete"
        />
        <div v-if="verified" class="text-sm text-green-600 font-medium">
          Email verified successfully!
        </div>
        <p class="text-xs text-gray-400">
          Didn't receive the code? <a href="#" class="text-blue-500 underline">Resend</a>
        </p>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: PIN Entry
// ---------------------------------------------------------------------------

export const RealWorldPinEntry: Story = {
  name: 'Real World: PIN Entry',
  render: () => ({
    components: { DzOtpInput },
    template: `
      <div class="max-w-xs text-center space-y-4">
        <p class="font-semibold">Enter your PIN</p>
        <DzOtpInput :length="4" type="number" mask aria-label="PIN" />
        <p class="text-xs text-gray-400">Your 4-digit security PIN</p>
      </div>
    `,
  }),
}
