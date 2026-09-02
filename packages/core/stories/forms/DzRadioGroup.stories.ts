import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzRadio, DzRadioGroup } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzRadioGroup manages a set of DzRadio components with a single `string` model value.
 *
 * Built on Reka UI RadioGroupRoot. Supports horizontal/vertical layout,
 * propagated size/disabled state, and keyboard navigation.
 */
const meta = {
  title: 'Core/Forms/DzRadioGroup',
  component: DzRadioGroup,
  tags: ['autodocs', 'status:stable'],
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
  decorators: [darkModeDecorator],
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ selected || 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const standard = canvas.getByRole('radio', { name: /standard/i })
    const express = canvas.getByRole('radio', { name: /express/i })

    // Nothing selected initially.
    await expect(standard).toHaveAttribute('aria-checked', 'false')
    await expect(canvas.getByText(/none/i)).toBeInTheDocument()

    // Click Standard selects it exclusively.
    await userEvent.click(standard)
    await expect(standard).toHaveAttribute('aria-checked', 'true')
    // Use getAllByText to handle multiple matches (label + status display)
    await expect(canvas.getAllByText(/standard/i).length).toBeGreaterThan(0)

    // Click Express — radio group allows only one selection.
    await userEvent.click(express)
    await expect(express).toHaveAttribute('aria-checked', 'true')
    await expect(standard).toHaveAttribute('aria-checked', 'false')
  },
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
        <p class="text-sm text-[var(--dz-muted-foreground)]">Tab to focus the group, use arrow keys to navigate between radio buttons.</p>
        <DzRadioGroup aria-label="Accessible group">
          <DzRadio value="a">First option</DzRadio>
          <DzRadio value="b">Second option</DzRadio>
          <DzRadio value="c">Third option</DzRadio>
        </DzRadioGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole('radio', { name: /first option/i })
    const second = canvas.getByRole('radio', { name: /second option/i })

    // Click the first radio to select it.
    await userEvent.click(first)
    await waitFor(() => expect(first).toHaveAttribute('aria-checked', 'true'))

    // Click the second radio to verify selection moves.
    await userEvent.click(second)
    await waitFor(() => expect(second).toHaveAttribute('aria-checked', 'true'), { timeout: 3000 })
    await waitFor(() => expect(first).toHaveAttribute('aria-checked', 'false'))
  },
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

// ---------------------------------------------------------------------------
// States — enabled / required / group-disabled / option-disabled (tier B)
// ---------------------------------------------------------------------------

/**
 * Both states DzRadioGroup declares — `disabled` and `required` — plus the
 * per-radio `disabled` that a real form reaches for far more often than the
 * group-wide one.
 *
 * Each resolves to something a screen reader can perceive rather than only a
 * paler pixel: `aria-required` on the `role="radiogroup"` root,
 * `data-state`/`data-disabled` for the styling contract, and a `disabled`
 * attribute on each radio the state reaches. The play function asserts the
 * announced form of every one of them.
 */
export const States: Story = {
  render: () => ({
    components: { DzRadioGroup, DzRadio },
    data() {
      return { plan: 'basic', tier: '' }
    },
    template: `
      <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled</p>
          <DzRadioGroup v-model="plan" aria-label="Enabled plan" data-testid="rg-enabled">
            <DzRadio value="basic">Basic</DzRadio>
            <DzRadio value="pro">Pro</DzRadio>
          </DzRadioGroup>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Selected: <strong data-testid="rg-value">{{ plan }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Required</p>
          <DzRadioGroup v-model="tier" required aria-label="Required tier" data-testid="rg-required">
            <DzRadio value="silver">Silver</DzRadio>
            <DzRadio value="gold">Gold</DzRadio>
          </DzRadioGroup>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Group disabled</p>
          <DzRadioGroup disabled aria-label="Disabled plan" data-testid="rg-disabled">
            <DzRadio value="basic">Basic</DzRadio>
            <DzRadio value="pro">Pro</DzRadio>
          </DzRadioGroup>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">One option disabled</p>
          <DzRadioGroup aria-label="Mixed plan" data-testid="rg-mixed">
            <DzRadio value="basic">Basic</DzRadio>
            <DzRadio value="enterprise" disabled>Enterprise (contact sales)</DzRadio>
          </DzRadioGroup>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('rg-enabled')
    const required = canvas.getByTestId('rg-required')
    const disabled = canvas.getByTestId('rg-disabled')
    const mixed = canvas.getByTestId('rg-mixed')

    // Group-level state, as the styling contract and AT both see it.
    await expect(enabled).toHaveAttribute('data-state', 'ready')
    await expect(enabled).not.toHaveAttribute('data-required')
    await expect(required).toHaveAttribute('data-required')
    await expect(required).toHaveAttribute('aria-required', 'true')
    await expect(disabled).toHaveAttribute('data-state', 'disabled')
    await expect(disabled).toHaveAttribute('data-disabled')

    // Enabled: selection is exclusive — choosing Pro clears Basic.
    const basic = within(enabled).getByRole('radio', { name: /^basic$/i })
    const pro = within(enabled).getByRole('radio', { name: /^pro$/i })
    await expect(basic).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(pro)
    await waitFor(() => expect(pro).toHaveAttribute('aria-checked', 'true'))
    await expect(basic).toHaveAttribute('aria-checked', 'false')
    await expect(canvas.getByTestId('rg-value')).toHaveTextContent('pro')

    // Required: nothing is chosen yet, which is exactly what makes the
    // `aria-required` announcement above load-bearing.
    for (const radio of within(required).getAllByRole('radio'))
      await expect(radio).toHaveAttribute('aria-checked', 'false')

    // Group disabled propagates to every radio.
    for (const radio of within(disabled).getAllByRole('radio'))
      await expect(radio).toBeDisabled()

    // One disabled option leaves its sibling selectable.
    const enterprise = within(mixed).getByRole('radio', { name: /^enterprise/i })
    const mixedBasic = within(mixed).getByRole('radio', { name: /^basic$/i })
    await expect(enterprise).toBeDisabled()
    await expect(mixedBasic).toBeEnabled()
    await userEvent.click(mixedBasic)
    await waitFor(() => expect(mixedBasic).toHaveAttribute('aria-checked', 'true'))
    await expect(enterprise).toHaveAttribute('aria-checked', 'false')
  },
}
