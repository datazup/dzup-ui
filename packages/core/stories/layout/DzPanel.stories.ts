import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzPanel } from '../../src/components/layout'
import { darkModeDecorator } from '../_shared'

/**
 * DzPanel is a titled container with optional header actions and collapse.
 * It groups a form section or settings block under a titled, optionally-
 * collapsible frame — filling the gap between DzCard (no legend/collapse) and
 * DzAccordion (a multi-item group). The `legend` variant covers the classic
 * fieldset use case. Collapse reuses DzCollapse for the animation.
 */
const meta = {
  title: 'Core/Layout/DzPanel',
  component: DzPanel,
  tags: ['autodocs', 'status:beta'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'elevated', 'legend'],
      description: 'Surface treatment',
      table: { category: 'Appearance', defaultValue: { summary: 'outlined' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Header/body density',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Title accent color',
      table: { category: 'Appearance', defaultValue: { summary: 'neutral' } },
    },
    header: {
      control: 'text',
      description: 'Header title text',
      table: { category: 'Content' },
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the panel can be collapsed via its header toggle',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'fieldset'],
      description: 'Root HTML element',
      table: { category: 'Behavior', defaultValue: { summary: 'div' } },
    },
  },
  args: {
    header: 'Section title',
    variant: 'outlined',
    size: 'md',
    tone: 'neutral',
    collapsible: false,
  },
} satisfies Meta<typeof DzPanel>

export default meta
type Story = StoryObj<typeof meta>

const body = `
  <p class="text-sm text-[var(--dz-muted-foreground)]">
    Group related fields or settings under a single titled frame. The body
    accepts arbitrary content via the default slot.
  </p>
`

// ---------------------------------------------------------------------------
// Outlined
// ---------------------------------------------------------------------------

export const Outlined: Story = {
  args: { variant: 'outlined', header: 'Account' },
  render: args => ({
    components: { DzPanel },
    setup: () => ({ args }),
    template: `<DzPanel v-bind="args" class="max-w-md">${body}</DzPanel>`,
  }),
}

// ---------------------------------------------------------------------------
// Elevated
// ---------------------------------------------------------------------------

export const Elevated: Story = {
  args: { variant: 'elevated', header: 'Notifications' },
  render: args => ({
    components: { DzPanel },
    setup: () => ({ args }),
    template: `<DzPanel v-bind="args" class="max-w-md">${body}</DzPanel>`,
  }),
}

// ---------------------------------------------------------------------------
// Collapsible
// ---------------------------------------------------------------------------

export const Collapsible: Story = {
  args: { collapsible: true, header: 'Advanced options' },
  render: args => ({
    components: { DzPanel },
    setup() {
      const collapsed = ref(false)
      return { args, collapsed }
    },
    template: `
      <DzPanel v-bind="args" v-model:collapsed="collapsed" class="max-w-md">
        ${body}
      </DzPanel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The header is a real <button> exposing aria-expanded — starts expanded.
    const trigger = canvas.getByRole('button', { name: /advanced options/i })
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // aria-controls points at the collapsible region, which is visible.
    const regionId = trigger.getAttribute('aria-controls')
    await expect(regionId).toBeTruthy()
    const region = canvasElement.ownerDocument.getElementById(regionId!)
    await expect(region).toBeVisible()

    // Click the header — the panel collapses and aria-expanded flips to false.
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))

    // Click again — it re-expands.
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  },
}

// ---------------------------------------------------------------------------
// Legend (fieldset style)
// ---------------------------------------------------------------------------

export const LegendFieldset: Story = {
  name: 'Legend / Fieldset',
  args: { variant: 'legend', tone: 'primary', header: 'Shipping address', as: 'fieldset' },
  render: args => ({
    components: { DzPanel },
    setup: () => ({ args }),
    template: `
      <DzPanel v-bind="args" class="max-w-md">
        <div class="grid gap-2">
          <input class="dz-native-field-sm" placeholder="Street" />
          <input class="dz-native-field-sm" placeholder="City" />
        </div>
      </DzPanel>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Actions
// ---------------------------------------------------------------------------

export const WithActions: Story = {
  name: 'With Actions',
  args: { collapsible: true, header: 'Team members' },
  render: args => ({
    components: { DzPanel },
    setup() {
      const collapsed = ref(false)
      return { args, collapsed }
    },
    template: `
      <DzPanel v-bind="args" v-model:collapsed="collapsed" class="max-w-md">
        <template #actions>
          <button class="text-sm px-3 py-1 rounded bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]">
            Invite
          </button>
        </template>
        ${body}
      </DzPanel>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  args: { variant: 'elevated', collapsible: true, header: 'Preferences' },
  render: args => ({
    components: { DzPanel },
    setup: () => ({ args }),
    template: `<DzPanel v-bind="args" class="max-w-md">${body}</DzPanel>`,
  }),
}
