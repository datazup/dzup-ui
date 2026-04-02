import type { Meta, StoryObj } from '@storybook/vue3'
import { DzButton } from '../../src/components/buttons'
import {
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
} from '../../src/components/overlays'

/**
 * DzDropdownMenu is a compound dropdown menu built on Reka UI DropdownMenu (ADR-07).
 *
 * It renders a floating menu of selectable items when triggered. Supports four placement
 * sides (`top`, `right`, `bottom`, `left`), three alignments, separator dividers, and
 * disabled items. Open state is controlled via `v-model:open` (ADR-16).
 */
const meta = {
  title: 'Core/Overlays/DzDropdownMenu',
  component: DzDropdownMenu,
  subcomponents: {
    DzDropdownMenuTrigger,
    DzDropdownMenuContent,
    DzDropdownMenuItem,
    DzDropdownMenuSeparator,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modal: {
      control: 'boolean',
      description: 'Whether the dropdown is modal (traps focus)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Default open state (uncontrolled)',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state via v-model:open',
      table: { category: 'Behavior' },
    },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof DzDropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    setup() {
      return { args }
    },
    template: `
      <div class="flex justify-center py-8">
        <DzDropdownMenu v-bind="args">
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline">Options</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
            <DzDropdownMenuItem>Duplicate</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Archive</DzDropdownMenuItem>
            <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// All Sides
// ---------------------------------------------------------------------------

export const AllSides: Story = {
  name: 'Side Gallery',
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzButton },
    template: `
      <div class="flex flex-wrap gap-8 items-center justify-center py-24">
        <DzDropdownMenu v-for="side in ['top', 'right', 'bottom', 'left']" :key="side">
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline">{{ side.charAt(0).toUpperCase() + side.slice(1) }}</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent :side="side">
            <DzDropdownMenuItem>Action One</DzDropdownMenuItem>
            <DzDropdownMenuItem>Action Two</DzDropdownMenuItem>
            <DzDropdownMenuItem>Action Three</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Disabled Items
// ---------------------------------------------------------------------------

export const WithDisabledItems: Story = {
  name: 'With Disabled Items',
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    template: `
      <div class="flex justify-center py-8">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline">Actions</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
            <DzDropdownMenuItem disabled>Move (no permission)</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Copy</DzDropdownMenuItem>
            <DzDropdownMenuItem disabled>Delete (locked)</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Separator Groups
// ---------------------------------------------------------------------------

export const WithSeparatorGroups: Story = {
  name: 'With Separator Groups',
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    template: `
      <div class="flex justify-center py-8">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline">File Menu</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem>New File</DzDropdownMenuItem>
            <DzDropdownMenuItem>Open File</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Save</DzDropdownMenuItem>
            <DzDropdownMenuItem>Save As...</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Export as PDF</DzDropdownMenuItem>
            <DzDropdownMenuItem>Print</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Event Handling
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    data() {
      return { lastAction: 'None' }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm">Last action: <strong>{{ lastAction }}</strong></p>
        <div class="flex justify-center">
          <DzDropdownMenu>
            <DzDropdownMenuTrigger as-child>
              <DzButton variant="outline">Actions</DzButton>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent>
              <DzDropdownMenuItem @select="lastAction = 'Edit'">Edit</DzDropdownMenuItem>
              <DzDropdownMenuItem @select="lastAction = 'Duplicate'">Duplicate</DzDropdownMenuItem>
              <DzDropdownMenuSeparator />
              <DzDropdownMenuItem @select="lastAction = 'Archive'">Archive</DzDropdownMenuItem>
              <DzDropdownMenuItem @select="lastAction = 'Delete'">Delete</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        </div>
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
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    template: `
      <div class="flex justify-center py-8">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <DzButton>Dark Mode Menu</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
            <DzDropdownMenuItem>Duplicate</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Keyboard Navigation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Click the trigger or press Enter/Space to open. Use ArrowUp/ArrowDown to navigate items.
          Press Enter to select, Escape to close. Disabled items are skipped during navigation.
        </p>
        <div class="flex justify-center py-8">
          <DzDropdownMenu>
            <DzDropdownMenuTrigger as-child>
              <DzButton aria-label="Open actions menu">Actions</DzButton>
            </DzDropdownMenuTrigger>
            <DzDropdownMenuContent aria-label="Action items">
              <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
              <DzDropdownMenuItem disabled>Move (disabled)</DzDropdownMenuItem>
              <DzDropdownMenuItem>Duplicate</DzDropdownMenuItem>
              <DzDropdownMenuSeparator />
              <DzDropdownMenuItem>Delete</DzDropdownMenuItem>
            </DzDropdownMenuContent>
          </DzDropdownMenu>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: User Account Menu
// ---------------------------------------------------------------------------

export const RealWorldAccountMenu: Story = {
  name: 'Real World: User Account Menu',
  render: () => ({
    components: { DzDropdownMenu, DzDropdownMenuTrigger, DzDropdownMenuContent, DzDropdownMenuItem, DzDropdownMenuSeparator, DzButton },
    template: `
      <div class="flex justify-end py-4 px-4">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <button class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50">
              <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">J</span>
              John Doe
            </button>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent align="end">
            <DzDropdownMenuItem>Profile</DzDropdownMenuItem>
            <DzDropdownMenuItem>Settings</DzDropdownMenuItem>
            <DzDropdownMenuItem>Billing</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Help &amp; Support</DzDropdownMenuItem>
            <DzDropdownMenuItem>Keyboard Shortcuts</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Log Out</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
}
