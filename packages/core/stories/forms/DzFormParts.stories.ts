import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzFormDescription,
  DzFormField,
  DzFormLabel,
  DzFormMessage,
} from '../../src/components/forms'
import { DzInput } from '../../src/components/inputs'

/**
 * DzFormField compound sub-parts: DzFormLabel, DzFormDescription, DzFormMessage.
 *
 * These sub-parts receive form field context (IDs, validation state) from
 * DzFormField via provide/inject. They automatically wire up aria-describedby
 * and aria-labelledby attributes for accessibility.
 *
 * - **DzFormLabel** -- renders a <label> connected to the field control
 * - **DzFormDescription** -- help text below the label, linked via aria-describedby
 * - **DzFormMessage** -- validation error or success message
 */

const meta = {
  title: 'Core/Forms/DzFormParts',
  component: DzFormField,
  subcomponents: {
    DzFormLabel,
    DzFormDescription,
    DzFormMessage,
  },
  tags: ['autodocs'],
  argTypes: {
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
  },
  args: {
    disabled: false,
    required: false,
    invalid: false,
  },
} satisfies Meta<typeof DzFormField>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: All parts together
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    setup() {
      return { args }
    },
    template: `
      <DzFormField v-bind="args" class="max-w-sm">
        <DzFormLabel>Email Address</DzFormLabel>
        <DzInput type="email" placeholder="you@example.com" />
        <DzFormDescription>We will never share your email with anyone.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Required Field
// ---------------------------------------------------------------------------

export const Required: Story = {
  name: 'Required Field',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    template: `
      <DzFormField required class="max-w-sm">
        <DzFormLabel>Username</DzFormLabel>
        <DzInput placeholder="Enter username" />
        <DzFormDescription>Choose a unique username for your account.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Invalid Field with Error
// ---------------------------------------------------------------------------

export const WithError: Story = {
  name: 'Invalid with Error Message',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    template: `
      <DzFormField invalid error="Email address is required" class="max-w-sm">
        <DzFormLabel>Email</DzFormLabel>
        <DzInput type="email" placeholder="you@example.com" />
        <DzFormDescription>Enter your work email address.</DzFormDescription>
        <DzFormMessage />
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Disabled Field
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  name: 'Disabled Field',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    template: `
      <DzFormField disabled class="max-w-sm">
        <DzFormLabel>Locked Field</DzFormLabel>
        <DzInput value="Cannot edit this" />
        <DzFormDescription>This field is managed by an administrator.</DzFormDescription>
      </DzFormField>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Multiple Fields
// ---------------------------------------------------------------------------

export const MultipleFields: Story = {
  name: 'Multiple Form Fields',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    template: `
      <div class="space-y-6 max-w-sm">
        <DzFormField required>
          <DzFormLabel>First Name</DzFormLabel>
          <DzInput placeholder="Alice" />
        </DzFormField>
        <DzFormField required>
          <DzFormLabel>Last Name</DzFormLabel>
          <DzInput placeholder="Johnson" />
        </DzFormField>
        <DzFormField invalid error="Please enter a valid email">
          <DzFormLabel>Email</DzFormLabel>
          <DzInput type="email" placeholder="alice@example.com" />
          <DzFormDescription>Work email preferred.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>
        <DzFormField>
          <DzFormLabel>Bio</DzFormLabel>
          <DzInput placeholder="Tell us about yourself" />
          <DzFormDescription>Optional. Max 200 characters.</DzFormDescription>
        </DzFormField>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: ARIA Wiring',
  render: () => ({
    components: { DzFormField, DzFormLabel, DzFormDescription, DzFormMessage, DzInput },
    template: `
      <div class="space-y-4 max-w-sm">
        <p class="text-sm text-gray-500">
          DzFormField automatically generates unique IDs and wires aria-labelledby,
          aria-describedby, and aria-errormessage across its children.
          DzFormLabel renders a label element. DzFormDescription and DzFormMessage
          are referenced by the input via aria-describedby.
        </p>
        <DzFormField required invalid error="This field is required">
          <DzFormLabel>Full Name</DzFormLabel>
          <DzInput placeholder="Enter your full name" />
          <DzFormDescription>As it appears on your ID.</DzFormDescription>
          <DzFormMessage />
        </DzFormField>
      </div>
    `,
  }),
}
