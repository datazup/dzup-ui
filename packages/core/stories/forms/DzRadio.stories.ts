import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzRadio, DzRadioGroup } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzRadio is a single radio option built on Reka UI RadioGroupItem.
 *
 * It must be used within a DzRadioGroup. Supports five sizes and disabled state.
 * See DzRadioGroup stories for full group usage.
 */
const meta = {
  title: 'Core/Forms/DzRadio',
  component: DzRadio,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Component size',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    // Behavior
    value: {
      control: 'text',
      description: 'The value of this radio option (required)',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state -- prevents interaction',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
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
    value: 'option-1',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof DzRadio>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (within a group)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => ({
    components: { DzRadio, DzRadioGroup },
    setup() {
      return { args }
    },
    template: `
      <DzRadioGroup aria-label="Demo">
        <DzRadio v-bind="args">Option 1</DzRadio>
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
    components: { DzRadio, DzRadioGroup },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzRadioGroup orientation="horizontal" aria-label="Size demo">
            <DzRadio :value="size + '-a'" :size="size">Option A</DzRadio>
            <DzRadio :value="size + '-b'" :size="size">Option B</DzRadio>
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
  render: () => ({
    components: { DzRadio, DzRadioGroup },
    template: `
      <DzRadioGroup aria-label="Disabled demo">
        <DzRadio value="a">Enabled option</DzRadio>
        <DzRadio value="b" disabled>Disabled option</DzRadio>
        <DzRadio value="c">Another enabled option</DzRadio>
      </DzRadioGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => ({
    components: { DzRadio, DzRadioGroup },
    template: `
      <DzRadioGroup model-value="selected" aria-label="States demo">
        <DzRadio value="unselected">Unselected</DzRadio>
        <DzRadio value="selected">Selected</DzRadio>
        <DzRadio value="disabled" disabled>Disabled</DzRadio>
      </DzRadioGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Reka RadioGroupRoot renders role="radiogroup"; items render role="radio".
    const group = canvas.getByRole('radiogroup', { name: /states demo/i })
    await expect(group).toBeVisible()

    // "Selected" is pre-checked via model-value.
    const selected = canvas.getByRole('radio', { name: /^selected$/i })
    await expect(selected).toHaveAttribute('aria-checked', 'true')

    const unselected = canvas.getByRole('radio', { name: /unselected/i })
    await expect(unselected).toHaveAttribute('aria-checked', 'false')

    // Clicking "Unselected" moves the selection.
    await userEvent.click(unselected)
    await waitFor(() => expect(unselected).toHaveAttribute('aria-checked', 'true'))
    await expect(selected).toHaveAttribute('aria-checked', 'false')

    // The disabled option cannot be selected — disabled buttons have pointer-events:none.
    const disabled = canvas.getByRole('radio', { name: /disabled/i })
    await expect(disabled).toBeDisabled()
    // Verify state without clicking (click is blocked by pointer-events:none)
    await expect(disabled).toHaveAttribute('aria-checked', 'false')
    await expect(unselected).toHaveAttribute('aria-checked', 'true')
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzRadio, DzRadioGroup },
    template: `
      <DzRadioGroup aria-label="Dark mode demo">
        <DzRadio value="a">Option A</DzRadio>
        <DzRadio value="b">Option B</DzRadio>
        <DzRadio value="c">Option C</DzRadio>
      </DzRadioGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzRadio, DzRadioGroup },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">Tab to focus the group, arrow keys to navigate between options.</p>
        <DzRadioGroup aria-label="Accessible radio group">
          <DzRadio value="a" aria-label="Option A">Option A</DzRadio>
          <DzRadio value="b" aria-label="Option B">Option B</DzRadio>
          <DzRadio value="c" aria-label="Option C">Option C</DzRadio>
        </DzRadioGroup>
      </div>
    `,
  }),
}
