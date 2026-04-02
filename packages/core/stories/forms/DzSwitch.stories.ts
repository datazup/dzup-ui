import type { Meta, StoryObj } from '@storybook/vue3'
import { DzSwitch } from '../../src/components/forms'

/**
 * DzSwitch is a toggle switch component built on Reka UI SwitchRoot.
 *
 * It supports five sizes, disabled state, and a label slot.
 * Uses `defineModel<boolean>()` for v-model binding.
 */
const meta = {
  title: 'Core/Forms/DzSwitch',
  component: DzSwitch,
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
    name: {
      control: 'text',
      description: 'Form field name',
      table: { category: 'Behavior' },
    },
    required: {
      control: 'boolean',
      description: 'Whether the switch is required',
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
  },
} satisfies Meta<typeof DzSwitch>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzSwitch },
    setup() {
      return { args }
    },
    template: '<DzSwitch v-bind="args">Enable notifications</DzSwitch>',
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzSwitch },
    template: `
      <div class="space-y-4">
        <DzSwitch size="xs">Extra Small</DzSwitch>
        <DzSwitch size="sm">Small</DzSwitch>
        <DzSwitch size="md">Medium</DzSwitch>
        <DzSwitch size="lg">Large</DzSwitch>
        <DzSwitch size="xl">Extra Large</DzSwitch>
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
    components: { DzSwitch },
    setup() {
      return { args }
    },
    template: '<DzSwitch v-bind="args">Disabled switch</DzSwitch>',
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzSwitch },
    template: `
      <div class="space-y-4">
        <DzSwitch>Off</DzSwitch>
        <DzSwitch :model-value="true">On</DzSwitch>
        <DzSwitch disabled>Disabled off</DzSwitch>
        <DzSwitch disabled :model-value="true">Disabled on</DzSwitch>
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
    components: { DzSwitch },
    template: `
      <div class="space-y-4">
        <DzSwitch>Off</DzSwitch>
        <DzSwitch :model-value="true">On</DzSwitch>
        <DzSwitch disabled>Disabled</DzSwitch>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzSwitch },
    data() {
      return { enabled: false }
    },
    template: `
      <div class="space-y-4">
        <DzSwitch v-model="enabled">Dark mode</DzSwitch>
        <p class="text-sm text-gray-500">State: <strong>{{ enabled ? 'ON' : 'OFF' }}</strong></p>
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
    components: { DzSwitch },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab to focus, Space or Enter to toggle.</p>
        <DzSwitch aria-label="Wi-Fi toggle">Wi-Fi</DzSwitch>
        <DzSwitch aria-label="Bluetooth toggle">Bluetooth</DzSwitch>
        <DzSwitch aria-label="Airplane mode toggle">Airplane Mode</DzSwitch>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Settings Panel
// ---------------------------------------------------------------------------

export const RealWorldSettings: Story = {
  name: 'Real World: Settings Panel',
  render: () => ({
    components: { DzSwitch },
    data() {
      return {
        email: true,
        push: false,
        marketing: false,
      }
    },
    template: `
      <div class="max-w-sm space-y-1">
        <h3 class="text-base font-semibold mb-3">Notification Settings</h3>
        <div class="divide-y">
          <div class="py-3">
            <DzSwitch v-model="email">Email notifications</DzSwitch>
          </div>
          <div class="py-3">
            <DzSwitch v-model="push">Push notifications</DzSwitch>
          </div>
          <div class="py-3">
            <DzSwitch v-model="marketing">Marketing emails</DzSwitch>
          </div>
        </div>
      </div>
    `,
  }),
}
