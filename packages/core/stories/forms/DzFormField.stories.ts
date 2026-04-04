import type { Meta, StoryObj } from '@storybook/vue3'
import type { DzSelectItem } from '../../src/components/forms'
import {
  DzCheckbox,
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
  DzSelect,
} from '../../src/components/forms'

/**
 * DzFormField is a compound wrapper that provides form field context
 * (IDs, validation state) to child sub-parts via provide/inject (ADR-08).
 *
 * Sub-parts: DzFormLabel, DzFormDescription, DzFormMessage.
 * Used to compose form fields with consistent labeling, descriptions, and error messages.
 */
const meta = {
  title: 'Core/Forms/DzFormField',
  component: DzFormField,
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the field value is invalid',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'text',
      description: 'Error message to display in DzFormMessage',
      table: { category: 'State' },
    },
    id: {
      control: 'text',
      description: 'Custom ID prefix for the field and sub-parts',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    disabled: false,
    required: false,
    invalid: false,
  },
} satisfies Meta<typeof DzFormField>

export default meta
type Story = StoryObj<typeof meta>

const countryItems: DzSelectItem[] = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Germany', value: 'de' },
]

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { args, countryItems }
    },
    template: `
      <DzFormField v-bind="args" class="max-w-xs">
        <DzFormLabel>Country</DzFormLabel>
        <DzSelect :items="countryItems" placeholder="Select country..." />
        <DzFormDescription>Where you are primarily located.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Required
// ---------------------------------------------------------------------------

export const Required: Story = {
  args: { required: true },
  render: args => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { args, countryItems }
    },
    template: `
      <DzFormField v-bind="args" class="max-w-xs">
        <DzFormLabel>Country</DzFormLabel>
        <DzSelect :items="countryItems" placeholder="Select country..." />
        <DzFormDescription>This field is required.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  args: { disabled: true },
  render: args => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { args, countryItems }
    },
    template: `
      <DzFormField v-bind="args" class="max-w-xs">
        <DzFormLabel>Country</DzFormLabel>
        <DzSelect :items="countryItems" placeholder="Select country..." />
        <DzFormDescription>This field is currently disabled.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid / Error State
// ---------------------------------------------------------------------------

export const InvalidWithError: Story = {
  name: 'Invalid With Error',
  args: {
    invalid: true,
    error: 'Country selection is required.',
  },
  render: args => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { args, countryItems }
    },
    template: `
      <DzFormField v-bind="args" class="max-w-xs">
        <DzFormLabel>Country</DzFormLabel>
        <DzSelect :items="countryItems" placeholder="Select country..." />
        <DzFormDescription>Where you are primarily located.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States Side by Side
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { countryItems }
    },
    template: `
      <div class="space-y-8 max-w-xs">
        <DzFormField>
          <DzFormLabel>Default</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>Helper text here.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>

        <DzFormField required>
          <DzFormLabel>Required</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>This field is required.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>

        <DzFormField disabled>
          <DzFormLabel>Disabled</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>This field is disabled.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>

        <DzFormField invalid error="Please select a value.">
          <DzFormLabel>Invalid</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>Helper text here.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Checkbox
// ---------------------------------------------------------------------------

export const WithCheckbox: Story = {
  name: 'With Checkbox Control',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzCheckbox },
    template: `
      <DzFormField required class="max-w-md">
        <DzCheckbox>I agree to the Terms of Service</DzCheckbox>
        <DzFormDescription>You must accept before continuing.</DzFormDescription>
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
  decorators: [
    () => ({
      template: '<div data-theme="dark" class="bg-[var(--dz-colors-background)] p-8 rounded-lg"><story /></div>',
    }),
  ],
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { countryItems }
    },
    template: `
      <div class="space-y-8 max-w-xs">
        <DzFormField>
          <DzFormLabel>Default Field</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>Helper text.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>

        <DzFormField invalid error="Error in dark mode.">
          <DzFormLabel>Invalid Field</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormMessage />
        </DzFormField>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ID Linking',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      return { countryItems }
    },
    template: `
      <div class="space-y-4 max-w-xs">
        <p class="text-sm text-gray-500">
          DzFormField automatically generates matching IDs for the label (htmlFor),
          the control (id), description (aria-describedby), and message (aria-errormessage).
          Inspect the DOM to verify.
        </p>
        <DzFormField id="demo-field" invalid error="Something went wrong.">
          <DzFormLabel>Accessible Field</DzFormLabel>
          <DzSelect :items="countryItems" placeholder="Select..." />
          <DzFormDescription>This description is linked via aria-describedby.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Registration Form
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Responsive – Mobile
// ---------------------------------------------------------------------------

export const ResponsiveMobile: Story = {
  name: 'Responsive – Mobile',
  decorators: [
    () => ({ template: '<div style="max-width: 375px; overflow-x: auto;"><story /></div>' }),
  ],
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect },
    setup() {
      const items = [
        { value: 'option-a', label: 'Option A' },
        { value: 'option-b', label: 'Option B' },
        { value: 'option-c', label: 'Option C' },
      ]
      return { items }
    },
    data() {
      return { value: '' }
    },
    template: `
      <div class="space-y-4">
        <DzFormField required>
          <DzFormLabel>Category</DzFormLabel>
          <DzSelect :items="items" v-model="value" placeholder="Select..." />
          <DzFormDescription>Choose a category for your item.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>
      </div>
    `,
  }),
}

export const RealWorldRegistrationForm: Story = {
  name: 'Real World: Registration Form',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzSelect, DzCheckbox },
    setup() {
      return { countryItems }
    },
    data() {
      return {
        country: '',
        agreed: false,
      }
    },
    template: `
      <div class="max-w-sm space-y-6">
        <h2 class="text-lg font-semibold">Registration</h2>

        <DzFormField required>
          <DzFormLabel>Country</DzFormLabel>
          <DzSelect :items="countryItems" v-model="country" placeholder="Select your country..." />
          <DzFormDescription>We use this for tax and compliance.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>

        <DzFormField required>
          <DzCheckbox v-model="agreed">I accept the Terms of Service</DzCheckbox>
          <DzFormMessage />
        </DzFormField>

        <button
          :disabled="!country || !agreed"
          class="w-full px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
        >
          Register
        </button>
      </div>
    `,
  }),
}
