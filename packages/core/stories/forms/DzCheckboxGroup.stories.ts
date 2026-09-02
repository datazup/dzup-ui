import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { DzCheckbox, DzCheckboxGroup } from '../../src/components/forms'
import { darkModeDecorator } from '../_shared'

/**
 * DzCheckboxGroup manages a set of DzCheckbox components with a shared `string[]` model.
 *
 * It provides context via typed injection (ADR-08) to propagate disabled/size state
 * and manages the selected values array.
 */
const meta = {
  title: 'Core/Forms/DzCheckboxGroup',
  component: DzCheckboxGroup,
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    // Appearance
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size propagated to all child checkboxes',
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
      description: 'Disabled state propagated to all child checkboxes',
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
      description: 'Accessible label for the group',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    size: 'md',
    orientation: 'vertical',
    disabled: false,
  },
} satisfies Meta<typeof DzCheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Fruit preferences">
        <DzCheckbox value="apple">Apple</DzCheckbox>
        <DzCheckbox value="banana">Banana</DzCheckbox>
        <DzCheckbox value="cherry">Cherry</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Horizontal Orientation
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: args => ({
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Toppings">
        <DzCheckbox value="cheese">Cheese</DzCheckbox>
        <DzCheckbox value="pepperoni">Pepperoni</DzCheckbox>
        <DzCheckbox value="mushrooms">Mushrooms</DzCheckbox>
        <DzCheckbox value="olives">Olives</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Size Gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <div class="space-y-6">
        <div v-for="size in ['xs', 'sm', 'md', 'lg', 'xl']" :key="size">
          <p class="text-sm font-medium mb-2 capitalize">{{ size }}</p>
          <DzCheckboxGroup :size="size" orientation="horizontal" aria-label="Size demo">
            <DzCheckbox value="a">Option A</DzCheckbox>
            <DzCheckbox value="b">Option B</DzCheckbox>
            <DzCheckbox value="c">Option C</DzCheckbox>
          </DzCheckboxGroup>
        </div>
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
    components: { DzCheckboxGroup, DzCheckbox },
    setup() {
      return { args }
    },
    template: `
      <DzCheckboxGroup v-bind="args" aria-label="Disabled group">
        <DzCheckbox value="a">Option A</DzCheckbox>
        <DzCheckbox value="b">Option B</DzCheckbox>
        <DzCheckbox value="c">Option C</DzCheckbox>
      </DzCheckboxGroup>
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
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <DzCheckboxGroup aria-label="Dark mode demo">
        <DzCheckbox value="a">Option A</DzCheckbox>
        <DzCheckbox value="b">Option B</DzCheckbox>
        <DzCheckbox value="c">Option C</DzCheckbox>
      </DzCheckboxGroup>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    data() {
      return { selected: [] as string[] }
    },
    template: `
      <div class="space-y-4">
        <DzCheckboxGroup v-model="selected" aria-label="Notification prefs">
          <DzCheckbox value="email">Email</DzCheckbox>
          <DzCheckbox value="sms">SMS</DzCheckbox>
          <DzCheckbox value="push">Push Notification</DzCheckbox>
          <DzCheckbox value="in-app">In-App</DzCheckbox>
        </DzCheckboxGroup>
        <p class="text-sm text-[var(--dz-muted-foreground)]">Selected: <strong>{{ selected.length ? selected.join(', ') : 'none' }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const email = canvas.getByRole('checkbox', { name: /^email$/i })
    const sms = canvas.getByRole('checkbox', { name: /^sms$/i })

    // Nothing selected initially.
    await expect(email).toHaveAttribute('aria-checked', 'false')
    await expect(canvas.getByText(/none/i)).toBeInTheDocument()

    // Clicking Email checks it and updates the model text.
    await userEvent.click(email)
    await expect(email).toHaveAttribute('aria-checked', 'true')
    // Use getAllByText to handle multiple matches (label + status display)
    await expect(canvas.getAllByText(/email/i).length).toBeGreaterThan(0)

    // Clicking SMS adds a second selection independently.
    await userEvent.click(sms)
    await expect(sms).toHaveAttribute('aria-checked', 'true')

    // Clicking Email again unchecks it (toggle off).
    await userEvent.click(email)
    await expect(email).toHaveAttribute('aria-checked', 'false')
  },
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus States',
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Tab through the group, Space to toggle individual checkboxes.</p>
        <DzCheckboxGroup aria-label="Accessible group" role="group">
          <DzCheckbox value="a" aria-label="Option A">Option A</DzCheckbox>
          <DzCheckbox value="b" aria-label="Option B">Option B</DzCheckbox>
          <DzCheckbox value="c" aria-label="Option C">Option C</DzCheckbox>
        </DzCheckboxGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const optionA = canvas.getByRole('checkbox', { name: /option a/i })
    const optionB = canvas.getByRole('checkbox', { name: /option b/i })

    // Space key toggles a focused checkbox.
    optionA.focus()
    await userEvent.keyboard(' ')
    await expect(optionA).toHaveAttribute('aria-checked', 'true')

    // Tab moves focus to next checkbox; Space toggles it.
    await userEvent.tab()
    await expect(optionB).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(optionB).toHaveAttribute('aria-checked', 'true')

    // Checkboxes are independent — A stays checked after B is checked.
    await expect(optionA).toHaveAttribute('aria-checked', 'true')
  },
}

// ---------------------------------------------------------------------------
// Real World: Notification Preferences
// ---------------------------------------------------------------------------

export const RealWorldNotifications: Story = {
  name: 'Real World: Notification Preferences',
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    data() {
      return { channels: ['email'] }
    },
    template: `
      <div class="max-w-md">
        <h3 class="text-base font-semibold mb-1">Notification Channels</h3>
        <p class="text-sm text-[var(--dz-muted-foreground)] mb-3">Choose how you want to be notified.</p>
        <DzCheckboxGroup v-model="channels" aria-label="Notification channels">
          <DzCheckbox value="email">Email notifications</DzCheckbox>
          <DzCheckbox value="sms">SMS alerts</DzCheckbox>
          <DzCheckbox value="push">Push notifications</DzCheckbox>
          <DzCheckbox value="slack">Slack integration</DzCheckbox>
        </DzCheckboxGroup>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — enabled / group-disabled / one-box-disabled (tier B `states` item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the state DzCheckboxGroup declares, and its whole point is that
 * it *propagates*: setting it on the group disables every DzCheckbox inside
 * through the injected context (ADR-08), while a single box can also opt out on
 * its own without touching its siblings.
 *
 * The group also exposes the resolved state as `data-state`/`data-disabled` on
 * its `role="group"` root so a consumer can style the whole cluster. The play
 * function asserts propagation in both directions rather than showing a greyed
 * screenshot.
 */
export const States: Story = {
  render: () => ({
    components: { DzCheckboxGroup, DzCheckbox },
    data() {
      return { enabled: ['apple'] as string[], mixed: [] as string[] }
    },
    template: `
      <div class="grid gap-8 md:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-medium">Enabled</p>
          <DzCheckboxGroup
            v-model="enabled"
            aria-label="Enabled preferences"
            data-testid="cbg-enabled"
          >
            <DzCheckbox value="apple">Apple</DzCheckbox>
            <DzCheckbox value="banana">Banana</DzCheckbox>
          </DzCheckboxGroup>
          <p class="text-sm text-[var(--dz-muted-foreground)]">
            Selected: <strong data-testid="cbg-value">{{ enabled.join(', ') || 'none' }}</strong>
          </p>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">Group disabled</p>
          <DzCheckboxGroup
            disabled
            aria-label="Disabled preferences"
            data-testid="cbg-disabled"
          >
            <DzCheckbox value="cherry">Cherry</DzCheckbox>
            <DzCheckbox value="date">Date</DzCheckbox>
          </DzCheckboxGroup>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-medium">One box disabled</p>
          <DzCheckboxGroup
            v-model="mixed"
            aria-label="Mixed preferences"
            data-testid="cbg-mixed"
          >
            <DzCheckbox value="elderberry">Elderberry</DzCheckbox>
            <DzCheckbox value="fig" disabled>Fig (out of stock)</DzCheckbox>
          </DzCheckboxGroup>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const enabled = canvas.getByTestId('cbg-enabled')
    const disabled = canvas.getByTestId('cbg-disabled')
    const mixed = canvas.getByTestId('cbg-mixed')

    // Group-level state is exposed on the `role="group"` root.
    await expect(enabled).toHaveAttribute('role', 'group')
    await expect(enabled).toHaveAttribute('data-state', 'ready')
    await expect(disabled).toHaveAttribute('data-state', 'disabled')
    await expect(disabled).toHaveAttribute('data-disabled')

    // Enabled: the pre-checked box reports it, and toggling reaches the model.
    const apple = within(enabled).getByRole('checkbox', { name: /^apple$/i })
    const banana = within(enabled).getByRole('checkbox', { name: /^banana$/i })
    await expect(apple).toHaveAttribute('aria-checked', 'true')
    await expect(banana).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(banana)
    await waitFor(() =>
      expect(canvas.getByTestId('cbg-value')).toHaveTextContent('apple, banana'),
    )

    // Group disabled propagates to every child through the injected context.
    for (const name of [/^cherry$/i, /^date$/i]) {
      const box = within(disabled).getByRole('checkbox', { name })
      await expect(box).toBeDisabled()
      await expect(box).toHaveAttribute('data-disabled')
    }

    // A single disabled box leaves its sibling live.
    const fig = within(mixed).getByRole('checkbox', { name: /^fig/i })
    const elderberry = within(mixed).getByRole('checkbox', { name: /^elderberry$/i })
    await expect(fig).toBeDisabled()
    await expect(elderberry).toBeEnabled()
    await userEvent.click(elderberry)
    await waitFor(() => expect(elderberry).toHaveAttribute('aria-checked', 'true'))
    await expect(fig).toHaveAttribute('aria-checked', 'false')
  },
}
