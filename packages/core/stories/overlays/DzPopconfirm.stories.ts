import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import { expect, screen, userEvent, within } from 'storybook/test'
import { DzButton, DzIconButton } from '../../src/components/buttons'
import { DzPopconfirm } from '../../src/components/overlays'

/**
 * DzPopconfirm is a lightweight, anchored "are you sure?" popover for low-risk
 * destructive actions -- the standard pattern for deleting a row in a table or
 * toolbar, where a full modal (DzConfirmDialog) would be too heavy.
 *
 * It is built on the shared `useFloating` positioning primitive (ADR-07) so
 * anchoring and collision handling match DzPopover/DzTooltip. Open state is
 * controlled via `v-model:open` (ADR-16) with an uncontrolled fallback, so the
 * popover drives itself when the trigger is clicked. It renders a
 * `role="alertdialog"`, traps focus, focuses the confirm button on open, and
 * returns focus to the trigger on close.
 */
const meta = {
  title: 'Core/Overlays/DzPopconfirm',
  component: DzPopconfirm,
  tags: ['autodocs', 'status:experimental'],
  argTypes: {
    title: { control: 'text', description: 'Question rendered as the popover heading', table: { category: 'Content' } },
    description: { control: 'text', description: 'Optional supporting text below the title', table: { category: 'Content' } },
    confirmText: { control: 'text', description: 'Confirm button label', table: { category: 'Content', defaultValue: { summary: 'Confirm' } } },
    cancelText: { control: 'text', description: 'Cancel button label', table: { category: 'Content', defaultValue: { summary: 'Cancel' } } },
    tone: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Tone for the leading icon and confirm button',
      table: { category: 'Appearance', defaultValue: { summary: 'danger' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      description: 'Placement of the popover relative to the trigger',
      table: { category: 'Positioning', defaultValue: { summary: 'top' } },
    },
    loading: { control: 'boolean', description: 'Keeps the popover open with a confirm spinner during async work', table: { category: 'Behavior', defaultValue: { summary: 'false' } } },
    open: { control: 'boolean', description: 'Controlled open state via v-model:open', table: { category: 'Behavior' } },
    // The icon is a functional Vue component. Storybook's vue3 source generator
    // cannot serialise a raw component placed in `args`, so it is supplied via
    // the render closure (`:icon="..."`) instead and excluded from controls/source.
    icon: { control: false, table: { disable: true } },
    confirm: { action: 'confirm', description: 'User confirmed the action', table: { category: 'Events' } },
    cancel: { action: 'cancel', description: 'User dismissed the popover', table: { category: 'Events' } },
  },
  args: {
    title: 'Delete this run?',
    tone: 'danger',
    placement: 'top',
  },
} satisfies Meta<typeof DzPopconfirm>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzPopconfirm, DzButton },
    setup() {
      return { args }
    },
    template: `
      <div class="p-24 flex justify-center">
        <DzPopconfirm v-bind="args" @confirm="args.confirm" @cancel="args.cancel">
          <DzButton variant="outline">Delete run</DzButton>
        </DzPopconfirm>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Destructive delete (icon trigger + leading icon)
// ---------------------------------------------------------------------------

export const DestructiveDelete: Story = {
  args: {
    title: 'Delete this run?',
    description: 'This permanently removes the run and its artifacts. This cannot be undone.',
    confirmText: 'Delete',
  },
  render: args => ({
    components: { DzPopconfirm, DzIconButton },
    setup() {
      return { args, Trash2 }
    },
    template: `
      <div class="p-24 flex justify-center">
        <DzPopconfirm v-bind="args" :icon="Trash2" @confirm="args.confirm" @cancel="args.cancel">
          <DzIconButton :icon="Trash2" aria-label="Delete run" variant="ghost" tone="danger" />
        </DzPopconfirm>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Async confirm (loading until the promise settles)
// ---------------------------------------------------------------------------

export const AsyncConfirm: Story = {
  args: {
    title: 'Delete this run?',
    description: 'The confirm button stays in a loading state until the request settles.',
    confirmText: 'Delete',
  },
  render: args => ({
    components: { DzPopconfirm, DzButton },
    setup() {
      return { args, AlertTriangle }
    },
    data() {
      return { loading: false, deleted: false }
    },
    methods: {
      async onConfirm() {
        const self = this as unknown as { loading: boolean, deleted: boolean }
        self.loading = true
        await new Promise(resolve => setTimeout(resolve, 1200))
        self.loading = false
        self.deleted = true
      },
    },
    template: `
      <div class="p-24 flex flex-col items-center gap-3">
        <DzPopconfirm v-bind="args" :icon="AlertTriangle" :loading="loading" @confirm="onConfirm" @cancel="args.cancel">
          <DzButton variant="outline" tone="danger">Delete run</DzButton>
        </DzPopconfirm>
        <span v-if="deleted" class="text-sm text-[var(--dz-muted-foreground)]">Run deleted ✓</span>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Custom texts + non-destructive tone
// ---------------------------------------------------------------------------

export const CustomTexts: Story = {
  args: {
    title: 'Publish these changes?',
    description: 'Collaborators will be notified immediately.',
    confirmText: 'Publish now',
    cancelText: 'Not yet',
    tone: 'primary',
  },
  render: args => ({
    components: { DzPopconfirm, DzButton },
    setup() {
      return { args }
    },
    template: `
      <div class="p-24 flex justify-center">
        <DzPopconfirm v-bind="args" @confirm="args.confirm" @cancel="args.cancel">
          <DzButton tone="primary">Publish</DzButton>
        </DzPopconfirm>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Placement matrix
// ---------------------------------------------------------------------------

export const PlacementMatrix: Story = {
  render: () => ({
    components: { DzPopconfirm, DzButton },
    setup() {
      const placements = ['top', 'bottom', 'left', 'right'] as const
      return { placements }
    },
    template: `
      <div class="grid grid-cols-2 gap-16 place-items-center p-24">
        <DzPopconfirm
          v-for="p in placements"
          :key="p"
          :title="'Confirm (' + p + ')?'"
          :placement="p"
        >
          <DzButton variant="outline">{{ p }}</DzButton>
        </DzPopconfirm>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: open, confirm
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: args => ({
    components: { DzPopconfirm, DzButton },
    setup() {
      return { args }
    },
    data() {
      return { confirmed: false }
    },
    methods: {
      onConfirm() {
        ;(this as unknown as { confirmed: boolean }).confirmed = true
      },
    },
    template: `
      <div class="p-24 flex flex-col items-center gap-3">
        <DzPopconfirm v-bind="args" @confirm="onConfirm">
          <DzButton variant="outline" tone="danger">Delete run</DzButton>
        </DzPopconfirm>
        <span v-if="confirmed" class="text-sm">Confirmed ✓</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the popover — the panel is teleported to document.body.
    await userEvent.click(canvas.getByRole('button', { name: /delete run/i }))
    const dialog = await screen.findByRole('alertdialog')
    await expect(dialog).toHaveTextContent(/delete this run/i)

    // Confirm closes the popover and surfaces the confirmation note.
    await userEvent.click(screen.getByTestId('dz-popconfirm-confirm'))
    await expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await expect(canvas.getByText(/confirmed/i)).toBeInTheDocument()
  },
}
