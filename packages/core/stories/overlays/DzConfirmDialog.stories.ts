import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { DzButton } from '../../src/components/buttons'
import { DzConfirmDialog } from '../../src/components/overlays'
import { a11yError, darkModeDecorator } from '../_shared'

/**
 * DzConfirmDialog is a pre-composed confirmation dialog built on top of the
 * DzDialog compound components (ADR-07).
 *
 * It collapses the common confirm/cancel pattern into a single declarative
 * component: pass a `title` + `message`, listen for `@confirm` / `@cancel`,
 * and control visibility via `v-model:open` (ADR-16). The `danger` variant
 * swaps the icon and confirm-button tone for destructive actions, and `loading`
 * keeps the dialog open with a busy confirm button while an async action runs.
 *
 * Because it has no built-in trigger, you own the open state — every story
 * below wires a launcher button to `v-model:open`.
 */
const meta = {
  title: 'Core/Overlays/DzConfirmDialog',
  component: DzConfirmDialog,
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Overlays enforced (TASK-DS-13).
    ...a11yError,
  },
  argTypes: {
    // Appearance
    variant: {
      control: 'inline-radio',
      options: ['default', 'danger'],
      description:
        'Visual variant — `danger` styles the icon + confirm button for destructive actions',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the underlying dialog content panel',
      table: { category: 'Appearance', defaultValue: { summary: 'sm' } },
    },
    // Behavior
    title: {
      control: 'text',
      description: 'Title text displayed in the dialog header (required)',
      table: { category: 'Behavior' },
    },
    message: {
      control: 'text',
      description: 'Message text displayed below the title (overridable via default slot)',
      table: { category: 'Behavior' },
    },
    confirmLabel: {
      control: 'text',
      description: 'Label for the confirm action button',
      table: { category: 'Behavior', defaultValue: { summary: 'Confirm' } },
    },
    cancelLabel: {
      control: 'text',
      description: 'Label for the cancel action button',
      table: { category: 'Behavior', defaultValue: { summary: 'Cancel' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    // State
    loading: {
      control: 'boolean',
      description: 'Keeps the dialog open with a busy confirm button while an async action runs',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    // Accessibility
    id: {
      control: 'text',
      description: 'Optional id attribute applied to the dialog content',
      table: { category: 'Accessibility' },
    },
    // Events
    //
    // Documented for autodocs only -- NOT wired via `action` argTypes. An
    // `action` would inject a function-valued arg that `v-bind="args"` spreads
    // as a `confirm`/`cancel` attribute, which then serializes the function
    // source onto the dialog DOM node. Every story listens via `@confirm` /
    // `@cancel` instead.
    confirm: {
      control: false,
      description: 'Emitted when the user activates the confirm button',
      table: { category: 'Events' },
    },
    cancel: {
      control: false,
      description: 'Emitted when the user cancels (cancel button, Escape, or outside click)',
      table: { category: 'Events' },
    },
  },
  args: {
    title: 'Confirm action?',
    message: 'Are you sure you want to proceed with this action?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'default',
    loading: false,
    size: 'sm',
  },
} satisfies Meta<typeof DzConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default (controls-driven)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzConfirmDialog, DzButton },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false, outcome: '' }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Confirm Dialog</DzButton>
          <span v-if="outcome" class="text-sm">Outcome: <strong>{{ outcome }}</strong></span>
        </div>
        <DzConfirmDialog
          v-bind="args"
          v-model:open="isOpen"
          @confirm="outcome = 'confirmed'; isOpen = false"
          @cancel="outcome = 'cancelled'"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Variant Gallery (default / danger)
// ---------------------------------------------------------------------------

export const VariantGallery: Story = {
  name: 'Variant Gallery',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { defaultOpen: false, dangerOpen: false }
    },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzButton variant="outline" @click="defaultOpen = true">Default Variant</DzButton>
        <DzButton tone="danger" @click="dangerOpen = true">Danger Variant</DzButton>

        <DzConfirmDialog
          v-model:open="defaultOpen"
          title="Publish changes?"
          message="Your changes will be visible to all team members immediately."
          confirm-label="Publish"
          @confirm="defaultOpen = false"
          @cancel="defaultOpen = false"
        />
        <DzConfirmDialog
          v-model:open="dangerOpen"
          variant="danger"
          title="Delete workspace?"
          message="This permanently removes the workspace and all of its data. This action cannot be undone."
          confirm-label="Delete"
          @confirm="dangerOpen = false"
          @cancel="dangerOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Danger: Destructive Confirm
// ---------------------------------------------------------------------------

export const DangerConfirm: Story = {
  name: 'Danger: Destructive Confirm',
  args: {
    variant: 'danger',
    title: 'Delete 3 items?',
    message: 'The selected items will be permanently deleted. This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
  },
  render: args => ({
    components: { DzConfirmDialog, DzButton },
    setup() {
      return { args }
    },
    data() {
      return { isOpen: false, deleted: false }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton tone="danger" @click="isOpen = true; deleted = false">Delete Items</DzButton>
          <span v-if="deleted" class="text-sm text-[var(--dz-danger-muted-foreground)]">Items deleted.</span>
        </div>
        <DzConfirmDialog
          v-bind="args"
          v-model:open="isOpen"
          @confirm="deleted = true; isOpen = false"
          @cancel="isOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// States: Async Loading Confirm
// ---------------------------------------------------------------------------

export const AsyncLoading: Story = {
  name: 'States: Async Confirm (Loading)',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false, loading: false, saved: false }
    },
    methods: {
      async handleConfirm() {
        this.loading = true
        // Simulate an async request — dialog stays open with a busy button.
        await new Promise(resolve => setTimeout(resolve, 1200))
        this.loading = false
        this.saved = true
        this.isOpen = false
      },
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true; saved = false">Save Changes</DzButton>
          <span v-if="saved" class="text-sm text-[var(--dz-success-muted-foreground)]">Saved!</span>
        </div>
        <DzConfirmDialog
          v-model:open="isOpen"
          title="Save changes?"
          message="Your changes will be written to the server."
          confirm-label="Save"
          :loading="loading"
          @confirm="handleConfirm"
          @cancel="isOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Custom Slots (icon + body)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Slot Content',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <DzButton variant="outline" @click="isOpen = true">Sign out everywhere</DzButton>
        <DzConfirmDialog
          v-model:open="isOpen"
          title="Sign out of all devices?"
          confirm-label="Sign out"
          @confirm="isOpen = false"
          @cancel="isOpen = false"
        >
          <template #icon>
            <span class="text-2xl" aria-hidden="true">&#128274;</span>
          </template>
          <div class="text-center text-sm text-[var(--dz-muted-foreground)] space-y-2">
            <p>You'll be signed out of <strong>4 active sessions</strong>:</p>
            <ul class="text-xs">
              <li>MacBook Pro · San Francisco</li>
              <li>iPhone 15 · San Francisco</li>
              <li>Chrome on Windows · Remote</li>
              <li>iPad · Unknown location</li>
            </ul>
          </div>
        </DzConfirmDialog>
      </div>
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
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div>
        <DzButton @click="isOpen = true">Open in Dark Mode</DzButton>
        <DzConfirmDialog
          v-model:open="isOpen"
          variant="danger"
          title="Discard draft?"
          message="Your unsaved draft will be discarded."
          confirm-label="Discard"
          @confirm="isOpen = false"
          @cancel="isOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Labelled Dialog
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Labelled Dialog',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)] max-w-md">
          The dialog uses <code>role="dialog"</code> with <code>aria-modal="true"</code>,
          and its title/message are wired to <code>aria-labelledby</code> /
          <code>aria-describedby</code>. Focus is trapped while open; Escape or an
          outside click emits <code>cancel</code> and returns focus to the trigger.
        </p>
        <DzButton aria-label="Open archive confirmation" @click="isOpen = true">Archive project</DzButton>
        <DzConfirmDialog
          v-model:open="isOpen"
          title="Archive this project?"
          message="Archived projects are hidden from the dashboard but can be restored later."
          confirm-label="Archive"
          @confirm="isOpen = false"
          @cancel="isOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Unsaved Changes Guard
// ---------------------------------------------------------------------------

export const RealWorldUnsavedChanges: Story = {
  name: 'Real World: Unsaved Changes Guard',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false, navigated: false }
    },
    template: `
      <div class="space-y-4 max-w-md">
        <div class="rounded-lg border border-[var(--dz-border)] p-4 space-y-2">
          <label for="uc-article-title" class="block text-sm font-medium">Article title</label>
          <input id="uc-article-title" type="text" value="Draft: untitled" class="w-full border border-[var(--dz-border)] rounded px-3 py-2 text-sm" />
          <p class="text-xs text-[var(--dz-warning-muted-foreground)]">You have unsaved changes.</p>
        </div>
        <div class="flex gap-3 items-center">
          <DzButton variant="outline" tone="neutral" @click="isOpen = true">Leave page</DzButton>
          <span v-if="navigated" class="text-sm text-[var(--dz-muted-foreground)]">Navigated away.</span>
        </div>
        <DzConfirmDialog
          v-model:open="isOpen"
          variant="danger"
          title="Leave without saving?"
          message="You have unsaved changes that will be lost if you leave this page."
          confirm-label="Leave"
          cancel-label="Stay"
          @confirm="navigated = true; isOpen = false"
          @cancel="isOpen = false"
        />
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Confirm Flow (play)
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive: Confirm Flow',
  render: () => ({
    components: { DzConfirmDialog, DzButton },
    data() {
      return { isOpen: false, outcome: '' }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Confirm</DzButton>
          <span data-testid="outcome" class="text-sm">Outcome: <strong>{{ outcome || 'none' }}</strong></span>
        </div>
        <DzConfirmDialog
          v-model:open="isOpen"
          title="Confirm this action?"
          message="Clicking confirm fires the @confirm handler."
          @confirm="outcome = 'confirmed'; isOpen = false"
          @cancel="outcome = 'cancelled'; isOpen = false"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the dialog.
    await userEvent.click(canvas.getByRole('button', { name: /open confirm/i }))

    // Dialog content is portalled to document.body — assert modal semantics.
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    // waitFor to allow dialog enter animation to complete before querying text.
    await waitFor(() => expect(within(dialog).getByText(/confirm this action\?/i)).toBeVisible())

    // Activate the confirm button and assert the handler fired + dialog closed.
    await userEvent.click(screen.getByTestId('confirm-dialog-confirm'))
    await expect(canvas.getByTestId('outcome')).toHaveTextContent(/confirmed/i)
    // waitFor to allow exit animation to complete before asserting removal.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
  },
}
