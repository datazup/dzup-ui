import type { Meta, StoryObj } from '@storybook/vue3'
import { DzRadio, DzRadioGroup } from '../../src/components/forms'

/**
 * DzRadioGroup manages a set of DzRadio components with a single `string` model value.
 *
 * Built on Reka UI RadioGroupRoot. Supports horizontal/vertical layout,
 * propagated size/disabled state, and keyboard navigation.
 */
const meta = {
  title: 'Core/Forms/DzRadioGroup',
  component: DzRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size propagated to all child radios',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
      table: { category: 'Appearance', defaultValue: { summary: 'vertical' } },
    },
    // Behavior
    disabled: {
      control: 'boolean',
      description: 'Disabled state propagated to all child radios',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    required: {
      control: 'boolean',
      description: 'Whether a selection is required',
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
      description: 'Accessible label for the group',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    size: 'md',
    orientation: 'vertical',
    disabled: false,
  },
} satisfies Meta<typeof DzRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzRadioGroup, DzRadio },
    setup() {
      return { args }
    },
    template: `
      <DzRadioGroup v-bind="args" aria-label="Fruit preference">
        <DzRadio value="apple">Apple</DzRadio>
        <DzRadio value="banana">Banana</DzRadio>
        <DzRadio value="cherry">Cherry</DzRadio>
      </DzRadioGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal Orientation
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: args => ({
    components: { DzRadioGroup, DzRadio },
    setup() {
      return { args }
    },
    template: `
      <DzRadioGroup v-bind="args" aria-label="Plan selection">
        <DzRadio value="free">Free</DzRadio>
        <DzRadio value="pro">Pro</DzRadio>
        <DzRadio value="enterprise">Enterprise</DzRadio>
      </DzRadioGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzRadioGroup, DzRadio },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzRadioGroup :size="size" orientation="horizontal" aria-label="Size demo">
            <DzRadio value="a">Option A</DzRadio>
            <DzRadio value="b">Option B</DzRadio>
            <DzRadio value="c">Option C</DzRadio>
          </DzRadioGroup>
        </div>
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
    components: { DzRadioGroup, DzRadio },
    setup() {
      return { args }
    },
    template: `
      <DzRadioGroup v-bind="args" aria-label="Disabled group">
        <DzRadio value="a">Option A</DzRadio>
        <DzRadio value="b">Option B</DzRadio>
        <DzRadio value="c">Option C</DzRadio>
      </DzRadioGroup>
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
    components: { DzRadioGroup, DzRadio },
    template: `
      <DzRadioGroup aria-label="Dark mode demo">
        <DzRadio value="a">Light</DzRadio>
        <DzRadio value="b">Dark</DzRadio>
        <DzRadio value="c">System</DzRadio>
      </DzRadioGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzRadioGroup, DzRadio },
    data() {
      return { selected: '' }
    },
    template: `
      <div class="space-y-4">
        <DzRadioGroup v-model="selected" aria-label="Shipping method">
          <DzRadio value="standard">Standard (5-7 days)</DzRadio>
          <DzRadio value="express">Express (2-3 days)</DzRadio>
          <DzRadio value="overnight">Overnight (next day)</DzRadio>
        </DzRadioGroup>
        <p class="text-sm text-gray-500">Selected: <strong>{{ selected || 'none' }}</strong></p>
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
    components: { DzRadioGroup, DzRadio },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab to focus the group, use arrow keys to navigate between radio buttons.</p>
        <DzRadioGroup aria-label="Accessible group">
          <DzRadio value="a">First option</DzRadio>
          <DzRadio value="b">Second option</DzRadio>
          <DzRadio value="c">Third option</DzRadio>
        </DzRadioGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Payment Method
// ---------------------------------------------------------------------------

export const RealWorldPaymentMethod: Story = {
  name: 'Real World: Payment Method',
  render: () => ({
    components: { DzRadioGroup, DzRadio },
    data() {
      return { method: 'card' }
    },
    template: `
      <div class="max-w-sm">
        <h3 class="text-base font-semibold mb-3">Payment Method</h3>
        <DzRadioGroup v-model="method" aria-label="Payment method" name="payment">
          <DzRadio value="card">Credit / Debit Card</DzRadio>
          <DzRadio value="paypal">PayPal</DzRadio>
          <DzRadio value="bank">Bank Transfer</DzRadio>
          <DzRadio value="crypto" disabled>Cryptocurrency (coming soon)</DzRadio>
        </DzRadioGroup>
      </div>
    `,
  }),
}
