import type { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/test'
import { DzButton } from '../../src/components/buttons'
import {
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogTitle,
  DzDialogTrigger,
} from '../../src/components/overlays'

/**
 * DzDialog is a compound modal overlay component built on Reka UI Dialog (ADR-07).
 *
 * It manages open state via `v-model:open` (ADR-16) and renders its children --
 * DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose --
 * in a portal with a backdrop overlay.
 *
 * Content supports five size variants: `sm`, `md`, `lg`, `xl`, `full`.
 */
const meta = {
  title: 'Core/Overlays/DzDialog',
  component: DzDialog,
  subcomponents: {
    DzDialogTrigger,
    DzDialogContent,
    DzDialogTitle,
    DzDialogDescription,
    DzDialogClose,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modal: {
      control: 'boolean',
      description: 'Whether the dialog is modal (traps focus, shows overlay)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof DzDialog>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    setup() {
      return { args }
    },
    template: `
      <DzDialog v-bind="args">
        <DzDialogTrigger as-child>
          <DzButton>Open Dialog</DzButton>
        </DzDialogTrigger>
        <DzDialogContent>
          <DzDialogTitle>Dialog Title</DzDialogTitle>
          <DzDialogDescription>This is a description of what this dialog is about.</DzDialogDescription>
          <div class="flex justify-end gap-3 mt-4">
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
}

// ---------------------------------------------------------------------------
// All Sizes
// ---------------------------------------------------------------------------

export const AllSizes: Story = {
  name: 'Size Gallery',
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <div class="flex flex-wrap gap-4 items-center">
        <DzDialog v-for="size in ['sm', 'md', 'lg', 'xl', 'full']" :key="size">
          <DzDialogTrigger as-child>
            <DzButton variant="outline">{{ size.toUpperCase() }}</DzButton>
          </DzDialogTrigger>
          <DzDialogContent :size="size">
            <DzDialogTitle>{{ size.toUpperCase() }} Dialog</DzDialogTitle>
            <DzDialogDescription>
              This dialog uses the "{{ size }}" size variant.
            </DzDialogDescription>
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
// With Long Content (Scrollable)
// ---------------------------------------------------------------------------

export const WithLongContent: Story = {
  name: 'With Long Content',
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton>Open Scrollable Dialog</DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="md">
          <DzDialogTitle>Terms of Service</DzDialogTitle>
          <DzDialogDescription>Please read the following terms carefully.</DzDialogDescription>
          <div class="space-y-4 mt-4 max-h-64 overflow-y-auto text-sm">
            <p v-for="i in 10" :key="i">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod,
              nisi vel consectetur interdum, nisl nunc egestas nisi, euismod aliquam
              nisl nunc egestas nisi. Paragraph {{ i }}.
            </p>
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <DzDialogClose as-child>
              <DzButton variant="outline" tone="neutral">Decline</DzButton>
            </DzDialogClose>
            <DzDialogClose as-child>
              <DzButton tone="primary">Accept</DzButton>
            </DzDialogClose>
          </div>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Slots (Custom Content)
// ---------------------------------------------------------------------------

export const WithSlots: Story = {
  name: 'With Custom Slot Content',
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton tone="danger">Delete Account</DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="sm">
          <div class="text-center space-y-3">
            <div class="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span class="text-red-600 text-xl">!</span>
            </div>
            <DzDialogTitle>Delete Account?</DzDialogTitle>
            <DzDialogDescription>
              This action is permanent and cannot be undone.
              All your data will be permanently removed.
            </DzDialogDescription>
          </div>
          <div class="flex gap-3 mt-6">
            <DzDialogClose as-child>
              <DzButton variant="outline" tone="neutral" class="flex-1">Cancel</DzButton>
            </DzDialogClose>
            <DzDialogClose as-child>
              <DzButton tone="danger" class="flex-1">Delete</DzButton>
            </DzDialogClose>
          </div>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Controlled Open
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    data() {
      return { isOpen: false, confirmed: false }
    },
    template: `
      <div class="space-y-4">
        <div class="flex gap-4 items-center">
          <DzButton @click="isOpen = true">Open Controlled Dialog</DzButton>
          <span class="text-sm">State: {{ isOpen ? 'Open' : 'Closed' }}</span>
          <span v-if="confirmed" class="text-sm text-green-600">Confirmed!</span>
        </div>
        <DzDialog v-model:open="isOpen">
          <DzDialogContent>
            <DzDialogTitle>Confirm Action</DzDialogTitle>
            <DzDialogDescription>Are you sure you want to proceed?</DzDialogDescription>
            <div class="flex justify-end gap-3 mt-4">
              <DzButton variant="outline" tone="neutral" @click="isOpen = false">Cancel</DzButton>
              <DzButton tone="primary" @click="confirmed = true; isOpen = false">Confirm</DzButton>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open controlled dialog/i })
    await userEvent.click(trigger)
  },
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
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton>Open in Dark Mode</DzButton>
        </DzDialogTrigger>
        <DzDialogContent>
          <DzDialogTitle>Dark Mode Dialog</DzDialogTitle>
          <DzDialogDescription>This dialog renders within a dark theme context.</DzDialogDescription>
          <DzDialogClose as-child>
            <DzButton variant="outline" tone="neutral" class="mt-4">Close</DzButton>
          </DzDialogClose>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Focus Management
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Focus Management',
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Open the dialog, then use Tab to navigate between buttons. Press Escape to close.
          Focus returns to the trigger after closing.
        </p>
        <DzDialog>
          <DzDialogTrigger as-child>
            <DzButton aria-label="Open accessible dialog">Open Dialog</DzButton>
          </DzDialogTrigger>
          <DzDialogContent aria-label="Confirmation dialog">
            <DzDialogTitle>Accessible Dialog</DzDialogTitle>
            <DzDialogDescription>
              Focus is trapped inside this dialog. Tab through the interactive elements.
              Press Escape or click the close button to dismiss.
            </DzDialogDescription>
            <div class="flex justify-end gap-3 mt-4">
              <DzDialogClose as-child>
                <DzButton variant="outline" tone="neutral">Cancel</DzButton>
              </DzDialogClose>
              <DzDialogClose as-child>
                <DzButton tone="primary">OK</DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Compound Composition: All Sub-Parts Annotated
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
        <p class="text-sm text-gray-500 max-w-md">
          DzDialog is a compound component. All five sub-parts are shown here:
          <code>DzDialogTrigger</code>, <code>DzDialogContent</code>,
          <code>DzDialogTitle</code>, <code>DzDialogDescription</code>, and
          <code>DzDialogClose</code>.
        </p>

        <!-- DzDialogTrigger: renders the element that opens the dialog -->
        <DzDialog>
          <DzDialogTrigger as-child>
            <!-- DzDialogTrigger: as-child delegates the open behavior to DzButton -->
            <DzButton tone="primary">Open (DzDialogTrigger)</DzButton>
          </DzDialogTrigger>

          <!-- DzDialogContent: the modal panel, portaled to body -->
          <DzDialogContent size="md">
            <!-- DzDialogTitle: required for accessibility (aria-labelledby) -->
            <DzDialogTitle>Compound Sub-Parts Demo</DzDialogTitle>

            <!-- DzDialogDescription: optional, linked via aria-describedby -->
            <DzDialogDescription>
              This dialog demonstrates every sub-part: Trigger, Content, Title,
              Description, and Close. Each part communicates via Reka UI Dialog
              context (ADR-07) and provides scoped IDs automatically.
            </DzDialogDescription>

            <div class="mt-4 rounded border p-3 text-xs font-mono space-y-1">
              <p>&lt;DzDialog&gt;</p>
              <p class="pl-4">&lt;DzDialogTrigger /&gt;</p>
              <p class="pl-4">&lt;DzDialogContent&gt;</p>
              <p class="pl-8">&lt;DzDialogTitle /&gt;</p>
              <p class="pl-8">&lt;DzDialogDescription /&gt;</p>
              <p class="pl-8">&lt;DzDialogClose /&gt;</p>
              <p class="pl-4">&lt;/DzDialogContent&gt;</p>
              <p>&lt;/DzDialog&gt;</p>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <!-- DzDialogClose: closes the dialog when activated -->
              <DzDialogClose as-child>
                <DzButton variant="outline" tone="neutral">
                  Close (DzDialogClose)
                </DzButton>
              </DzDialogClose>
            </div>
          </DzDialogContent>
        </DzDialog>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: Form Dialog
// ---------------------------------------------------------------------------

export const RealWorldFormDialog: Story = {
  name: 'Real World: Form Dialog',
  render: () => ({
    components: { DzDialog, DzDialogTrigger, DzDialogContent, DzDialogTitle, DzDialogDescription, DzDialogClose, DzButton },
    template: `
      <DzDialog>
        <DzDialogTrigger as-child>
          <DzButton tone="primary">Create New Item</DzButton>
        </DzDialogTrigger>
        <DzDialogContent size="lg">
          <DzDialogTitle>Create New Item</DzDialogTitle>
          <DzDialogDescription>Fill out the details below to create a new item.</DzDialogDescription>
          <form class="space-y-4 mt-4" @submit.prevent>
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input type="text" placeholder="Item name" class="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea placeholder="Describe the item..." class="w-full border rounded px-3 py-2 text-sm" rows="3" />
            </div>
            <div class="flex justify-end gap-3 pt-2 border-t">
              <DzDialogClose as-child>
                <DzButton variant="ghost" tone="neutral">Cancel</DzButton>
              </DzDialogClose>
              <DzButton type="submit" tone="primary">Create</DzButton>
            </div>
          </form>
        </DzDialogContent>
      </DzDialog>
    `,
  }),
}
