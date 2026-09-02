import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Copy, Image, Link, Pencil, Plus, Share2, Sparkles, Trash2 } from 'lucide-vue-next'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { DzFab, DzSpeedDial } from '../../src/components/buttons'
import { a11yError, darkModeDecorator } from '../_shared'

/**
 * **DzSpeedDial** is a floating action button (DzFab) that fans out a set of
 * secondary actions — linearly or along an arc — in one of four directions.
 * Each action is a circular icon button labelled by a tooltip.
 *
 * Use it for a persistent primary action (compose, add, ask AI) that can also
 * branch into a few related shortcuts.
 *
 * Status: **experimental**.
 */
const meta = {
  title: 'Core/Buttons/DzSpeedDial',
  component: DzSpeedDial,
  tags: ['autodocs', 'status:experimental'],
  parameters: {
    // Buttons audits clean at 0 findings — enforced (TASK-DS-13).
    ...a11yError,
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
      description: 'Direction the actions expand toward',
      table: { category: 'Geometry', defaultValue: { summary: 'up' } },
    },
    type: {
      control: 'inline-radio',
      options: ['linear', 'radial'],
      description: 'Straight line or arc layout',
      table: { category: 'Geometry', defaultValue: { summary: 'linear' } },
    },
    radius: {
      control: { type: 'range', min: 64, max: 180, step: 4 },
      description: 'Arc radius (px) for radial layout',
      table: { category: 'Geometry', defaultValue: { summary: '112' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Trigger size (also scales the actions)',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Trigger color tone',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['solid', 'outline', 'ghost'],
      description: 'Trigger visual variant',
      table: { category: 'Appearance', defaultValue: { summary: 'solid' } },
    },
    openOnHover: {
      control: 'boolean',
      description: 'Also open on pointer hover',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the whole control',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the trigger (REQUIRED)',
      table: { category: 'Accessibility' },
    },
  },
  args: {
    ariaLabel: 'Quick actions',
    direction: 'up',
    type: 'linear',
    size: 'md',
    tone: 'primary',
    variant: 'solid',
    openOnHover: false,
    disabled: false,
    items: [
      { icon: Pencil, label: 'Edit' },
      { icon: Share2, label: 'Share' },
      { icon: Copy, label: 'Duplicate' },
      { icon: Trash2, label: 'Delete', tone: 'danger' },
    ],
  },
} satisfies Meta<typeof DzSpeedDial>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Fab — the underlying floating action button on its own
// ---------------------------------------------------------------------------

export const Fab: Story = {
  name: 'DzFab (standalone)',
  render: () => ({
    components: { DzFab },
    setup() {
      return { Plus, Sparkles }
    },
    template: `
      <div class="flex flex-wrap items-center gap-6 p-8">
        <div class="text-center">
          <DzFab :icon="Plus" aria-label="Add" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">solid / primary</p>
        </div>
        <div class="text-center">
          <DzFab :icon="Sparkles" aria-label="Ask AI" tone="info" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">info</p>
        </div>
        <div class="text-center">
          <DzFab :icon="Plus" aria-label="Add" variant="outline" tone="neutral" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">outline</p>
        </div>
        <div class="text-center">
          <DzFab :icon="Plus" aria-label="Add" size="sm" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">sm</p>
        </div>
        <div class="text-center">
          <DzFab :icon="Plus" aria-label="Add" size="xl" />
          <p class="text-xs mt-2 text-[var(--dz-muted-foreground)]">xl</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Linear, expanding upward (the canonical pattern)
// ---------------------------------------------------------------------------

export const LinearUp: Story = {
  name: 'Linear (up)',
  render: args => ({
    components: { DzSpeedDial },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    // Generous top padding so the upward fan-out has room in the canvas.
    template: `
      <div class="flex items-end justify-center" style="height: 320px;">
        <DzSpeedDial v-bind="args" v-model:open="open" />
      </div>
    `,
  }),
  args: {
    direction: 'up',
    type: 'linear',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The trigger FAB should be present and labelled.
    const trigger = canvas.getByRole('button', { name: /quick actions/i })
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click to open — action items fan out.
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

    // Click again to close.
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  },
}

// ---------------------------------------------------------------------------
// Radial fan-out
// ---------------------------------------------------------------------------

export const Radial: Story = {
  name: 'Radial',
  render: args => ({
    components: { DzSpeedDial },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="flex items-center justify-center" style="height: 360px;">
        <DzSpeedDial v-bind="args" v-model:open="open" />
      </div>
    `,
  }),
  args: {
    direction: 'up',
    type: 'radial',
    radius: 120,
  },
}

// ---------------------------------------------------------------------------
// With labels — actions carry tooltips + meaningful icons
// ---------------------------------------------------------------------------

export const WithLabels: Story = {
  name: 'With Labels (tooltips)',
  render: args => ({
    components: { DzSpeedDial },
    setup() {
      const open = ref(true)
      const last = ref<string>('—')
      const items = [
        { icon: Link, label: 'Copy link', onClick: () => (last.value = 'Copy link') },
        { icon: Image, label: 'Add image', onClick: () => (last.value = 'Add image') },
        { icon: Share2, label: 'Share', onClick: () => (last.value = 'Share') },
      ]
      return { args, open, last, items }
    },
    template: `
      <div class="flex flex-col items-center gap-6" style="height: 340px; justify-content: flex-end;">
        <p class="text-sm text-[var(--dz-muted-foreground)]">Last action: <strong>{{ last }}</strong></p>
        <DzSpeedDial v-bind="args" :items="items" v-model:open="open" aria-label="Compose actions" />
      </div>
    `,
  }),
  args: {
    direction: 'up',
    type: 'linear',
  },
}

// ---------------------------------------------------------------------------
// Directions gallery
// ---------------------------------------------------------------------------

export const Directions: Story = {
  name: 'All Directions',
  render: () => ({
    components: { DzSpeedDial },
    setup() {
      const items = [
        { icon: Pencil, label: 'Edit' },
        { icon: Copy, label: 'Duplicate' },
        { icon: Trash2, label: 'Delete', tone: 'danger' as const },
      ]
      return { items }
    },
    template: `
      <div class="grid grid-cols-2 gap-16 place-items-center p-16" style="min-height: 420px;">
        <DzSpeedDial :items="items" direction="up" :open="true" aria-label="Up" />
        <DzSpeedDial :items="items" direction="down" :open="true" aria-label="Down" />
        <DzSpeedDial :items="items" direction="left" :open="true" aria-label="Left" />
        <DzSpeedDial :items="items" direction="right" :open="true" aria-label="Right" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Pinned to a corner (fixed positioning)
// ---------------------------------------------------------------------------

export const Pinned: Story = {
  name: 'Pinned (bottom-right)',
  render: args => ({
    components: { DzSpeedDial },
    setup() {
      const open = ref(false)
      return { args, open }
    },
    template: `
      <div class="relative border border-[var(--dz-border)] rounded-lg overflow-hidden" style="height: 420px; width: 100%;">
        <p class="p-4 text-sm text-[var(--dz-muted-foreground)]">Scroll-anchored content. The dial stays pinned bottom-right.</p>
        <DzSpeedDial v-bind="args" v-model:open="open" position="bottom-right" aria-label="Page actions" />
      </div>
    `,
  }),
  args: {
    direction: 'up',
    type: 'linear',
  },
}

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: { DzSpeedDial },
    setup() {
      const items = [
        { icon: Sparkles, label: 'Ask AI' },
        { icon: Pencil, label: 'Edit' },
        { icon: Share2, label: 'Share' },
      ]
      return { items }
    },
    template: `
      <div class="flex items-end justify-center" style="height: 320px;">
        <DzSpeedDial :items="items" :open="true" direction="up" aria-label="Actions" />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States — closed / open / item-disabled / disabled (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * `disabled` is the state DzSpeedDial declares, and the fan-out adds an
 * open/closed state on top of it that is part of the ARIA contract rather than
 * decoration: while closed, the `role="menu"` is `aria-hidden` and its actions
 * carry `tabindex="-1"` so they are neither announced nor tabbable; opening
 * flips both.
 *
 * A single action can also be disabled without touching the rest of the dial.
 * The play function asserts each of those, and that a disabled trigger never
 * expands.
 */
export const States: Story = {
  render: () => ({
    components: { DzSpeedDial },
    setup() {
      const items = [
        { icon: Pencil, label: 'Edit' },
        { icon: Copy, label: 'Duplicate' },
        { icon: Trash2, label: 'Delete', tone: 'danger' as const, disabled: true },
      ]
      return { items }
    },
    template: `
      <div class="grid grid-cols-3 place-items-end gap-8 p-8" style="min-height: 360px;">
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Closed</p>
          <DzSpeedDial :items="items" aria-label="Closed dial" data-testid="sd-closed" />
        </div>
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Open — one action disabled</p>
          <DzSpeedDial :items="items" :open="true" aria-label="Open dial" data-testid="sd-open" />
        </div>
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs text-[var(--dz-muted-foreground)]">Disabled</p>
          <DzSpeedDial :items="items" disabled aria-label="Disabled dial" data-testid="sd-disabled" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const closed = canvas.getByTestId('sd-closed')
    const open = canvas.getByTestId('sd-open')
    const disabledDial = canvas.getByTestId('sd-disabled')

    // Closed: the menu is hidden from AT and its actions are out of the tab
    // order — a fan-out that is only visually collapsed would fail both.
    const closedTrigger = within(closed).getByRole('button', { name: 'Closed dial' })
    await expect(closedTrigger).toHaveAttribute('aria-expanded', 'false')
    const closedMenu = closed.querySelector('[role="menu"]')!
    await expect(closedMenu).toHaveAttribute('aria-hidden', 'true')
    for (const action of closedMenu.querySelectorAll('button[data-index]'))
      await expect(action).toHaveAttribute('tabindex', '-1')

    // Open: the menu is exposed and every enabled action is tabbable.
    const openTrigger = within(open).getByRole('button', { name: 'Open dial' })
    await expect(openTrigger).toHaveAttribute('aria-expanded', 'true')
    const openMenu = open.querySelector('[role="menu"]')!
    await expect(openMenu).not.toHaveAttribute('aria-hidden')
    await expect(within(open).getByRole('menuitem', { name: 'Edit' }))
      .toHaveAttribute('tabindex', '0')

    // A single disabled action is out of service while its siblings are live.
    await expect(within(open).getByRole('menuitem', { name: 'Delete' })).toBeDisabled()
    await expect(within(open).getByRole('menuitem', { name: 'Duplicate' })).toBeEnabled()

    // Disabled dial: the trigger is disabled and can never expand.
    const disabledTrigger = within(disabledDial).getByRole('button', { name: 'Disabled dial' })
    await expect(disabledTrigger).toBeDisabled()
    await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false')

    // Opening the live dial really works, so the negatives above are measured
    // against a working baseline rather than asserted in isolation.
    await userEvent.click(closedTrigger)
    await waitFor(() => expect(closedTrigger).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.click(closedTrigger)
    await waitFor(() => expect(closedTrigger).toHaveAttribute('aria-expanded', 'false'))
  },
}
