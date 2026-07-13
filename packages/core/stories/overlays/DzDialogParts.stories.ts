import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { DzButton } from '../../src/components/buttons'
import {
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogOverlay,
  DzDialogTitle,
  DzDialogTrigger,
} from '../../src/components/overlays'
import { darkModeDecorator } from '../_shared'

/**
 * DzDialogContent compound sub-parts: DzDialogTitle, DzDialogDescription,
 * DzDialogClose, DzDialogTrigger, DzDialogOverlay.
 *
 * DzDialogContent is the primary visible panel rendered inside a DzDialog portal.
 * It supports five size variants (sm, md, lg, xl, full) and is always paired with
 * DzDialogTitle for an accessible aria-labelledby label.
 *
 * Built on Reka UI Dialog primitives (ADR-07). Focus is trapped inside the panel
 * when open; Escape dismisses it and focus returns to the trigger.
 */

const meta = {
  title: 'Core/Overlays/DzDialogParts',
  component: DzDialogContent,
  subcomponents: {
    DzDialogTitle,
    DzDialogDescription,
    DzDialogClose,
    DzDialogTrigger,
    DzDialogOverlay,
  },
  tags: ['autodocs', 'status:stable'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Width variant of the dialog content panel',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
  },
} satisfies Meta<typeof DzDialogContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: opens a right-side-aligned md dialog
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => ({
    components: {
      DzDialog,
      DzDialogTrigger,
      DzDialogContent,
      DzDialogTitle,
      DzDialogDescription,
      DzDialogClose,
      DzButton,
    },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton>Open Dialog</DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="md">
          <DzDialogTitle>Dialog Title</DzDialogTitle>
          <DzDialogDescription>This is a description of what this dialog is about.</DzDialogDescription>
          <div class="mt-4 space-y-3 text-sm" style="color: var(--dz-foreground);">
            <p>Dialog body content goes here. This panel is rendered in a portal with a backdrop overlay.</p>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <DzDialogClose as-child>
              <DzButton variant="outline" tone="neutral">Cancel</DzButton>
            </DzDialogClose>
            <DzDialogClose as-child>
              <DzButton tone="primary">Confirm</DzButton>
            </DzDialogClose>
          </div>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the dialog via the trigger.
    await userEvent.click(canvas.getByRole('button', { name: /open dialog/i }))

    // Dialog is portalled to document.body — role="dialog" with aria-modal.
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAccessibleName()
    // Use waitFor to ensure dialog is open and content is visible.
    await waitFor(() => expect(within(dialog).getByText(/dialog body content/i)).toBeVisible())

    // DzDialogClose via Cancel closes the dialog.
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }))
    // waitFor to allow exit animation to complete before asserting removal.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
  },
}

// ---------------------------------------------------------------------------
// All Sizes: size gallery
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: {
      DzDialog,
      DzDialogTrigger,
      DzDialogContent,
      DzDialogTitle,
      DzDialogDescription,
      DzDialogClose,
      DzButton,
    },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzDialog v-for="size in ['sm', 'md', 'lg', 'xl', 'full']" :key="size">
          <DzDialogTrigger as-child>
            <DzButton variant="outline">{{ size.toUpperCase() }}</DzButton>
          </DzDialogTrigger>
          <DzDialogContent :size="size">
            <DzDialogTitle>{{ size.toUpperCase() }} Dialog</DzDialogTitle>
            <DzDialogDescription>This dialog uses the "{{ size }}" size variant of DzDialogContent.</DzDialogDescription>
            <DzDialogClose as-child>
              <DzButton variant="outline" tone="neutral" class="mt-4">Close</DzButton>
            </DzDialogClose>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Compound Composition: annotated anatomy showing all 6 sub-parts
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound: All Sub-Parts',
  render: () => ({
    components: {
      DzDialog,
      DzDialogTrigger,
      DzDialogContent,
      DzDialogTitle,
      DzDialogDescription,
      DzDialogClose,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzDialog is a compound component. All six sub-parts are shown here:
          <code>DzDialogTrigger</code>, <code>DzDialogContent</code>,
          <code>DzDialogOverlay</code> (rendered automatically inside DzDialogContent),
          <code>DzDialogTitle</code>, <code>DzDialogDescription</code>, and
          <code>DzDialogClose</code>.
        </p>

        <!-- DzDialog: invisible root that manages open state and portal context -->
        <DzDialog>
          <!-- DzDialogTrigger: the element that opens the dialog; as-child delegates to DzButton -->
          <DzDialogTrigger as-child>
            <DzButton tone="primary">Open (DzDialogTrigger)</DzButton>
          </DzDialogTrigger>

          <!-- DzDialogContent: the modal panel portaled to document.body -->
          <!-- DzDialogOverlay: backdrop scrim, rendered inside DzDialogContent -->
          <DzDialogContent size="md">
            <!-- DzDialogTitle: required for accessibility (wires aria-labelledby) -->
            <DzDialogTitle>Compound Sub-Parts Demo</DzDialogTitle>

            <!-- DzDialogDescription: optional, wires aria-describedby -->
            <DzDialogDescription>
              Every sub-part communicates through Reka UI Dialog context (ADR-07).
              Scoped IDs for aria-labelledby and aria-describedby are generated
              automatically — no manual wiring needed.
            </DzDialogDescription>

            <!-- Anatomy map -->
            <div
              class="mt-4 rounded border border-[var(--dz-border)] px-3 py-2 text-xs font-mono space-y-0.5"
              style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
            >
              <p>&lt;DzDialog&gt;                  <!-- root, manages open state --&gt;</p>
              <p class="pl-4">&lt;DzDialogTrigger /&gt;      <!-- opens dialog --&gt;</p>
              <p class="pl-4">&lt;DzDialogContent&gt;        <!-- modal panel + portal --&gt;</p>
              <p class="pl-8">&lt;DzDialogOverlay /&gt;      <!-- backdrop scrim --&gt;</p>
              <p class="pl-8">&lt;DzDialogTitle /&gt;        <!-- aria-labelledby --&gt;</p>
              <p class="pl-8">&lt;DzDialogDescription /&gt;  <!-- aria-describedby --&gt;</p>
              <p class="pl-8">&lt;DzDialogClose /&gt;        <!-- closes dialog --&gt;</p>
              <p class="pl-4">&lt;/DzDialogContent&gt;</p>
              <p>&lt;/DzDialog&gt;</p>
            </div>

            <div class="flex justify-end mt-4">
              <!-- DzDialogClose: closes the dialog when activated -->
              <DzDialogClose as-child>
                <DzButton variant="outline" tone="neutral">Close (DzDialogClose)</DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: aria-labelledby / aria-describedby explanation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: aria-labelledby + aria-describedby',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzDialog,
      DzDialogTrigger,
      DzDialogContent,
      DzDialogTitle,
      DzDialogDescription,
      DzDialogClose,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzDialogContent receives <code>role="dialog"</code> and <code>aria-modal="true"</code>
          from Reka UI. <code>DzDialogTitle</code> wires <code>aria-labelledby</code> and
          <code>DzDialogDescription</code> wires <code>aria-describedby</code> — both use
          auto-generated IDs so no manual attribute wiring is required.
          Focus is trapped inside the panel; pressing Escape closes the dialog and
          returns focus to the trigger element.
        </p>
        <DzDialog>
          <DzDialogTrigger as-child>
            <DzButton>Open Accessible Dialog</DzButton>
          </DzDialogTrigger>
          <DzDialogContent size="sm">
            <DzDialogTitle>Accessible Dialog</DzDialogTitle>
            <DzDialogDescription>
              Tab through the buttons below. Press Escape to close.
              Verify with a screen reader: the dialog title is announced on open.
            </DzDialogDescription>
            <div class="flex gap-3 justify-end mt-4">
              <DzDialogClose as-child>
                <DzButton variant="outline" tone="neutral">Cancel</DzButton>
              </DzDialogClose>
              <DzDialogClose as-child>
                <DzButton tone="primary">Confirm</DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open accessible dialog/i })

    await userEvent.click(trigger)

    // aria-labelledby is auto-wired — dialog must have an accessible name.
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAccessibleName('Accessible Dialog')

    // aria-describedby is also wired to DzDialogDescription.
    await expect(dialog).toHaveAccessibleDescription()

    // Escape closes the dialog and focus returns to the trigger.
    await userEvent.keyboard('{Escape}')
    // waitFor to allow exit animation to complete before asserting removal.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 2000,
    })
    await expect(trigger).toHaveFocus()
  },
}
