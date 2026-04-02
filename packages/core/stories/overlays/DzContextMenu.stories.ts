import type { Meta, StoryObj } from '@storybook/vue3'
import {
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
} from '../../src/components/overlays'

/**
 * DzContextMenu is a compound right-click menu built on Reka UI ContextMenu (ADR-07).
 *
 * It renders a floating menu on right-click (contextmenu event) of the trigger area.
 * Supports four placement sides, alignments, separators, and disabled items.
 * Unlike DzDropdownMenu, it does not use v-model:open -- it opens on right-click only.
 */
const meta = {
  title: 'Core/Overlays/DzContextMenu',
  component: DzContextMenu,
  subcomponents: {
    DzContextMenuTrigger,
    DzContextMenuContent,
    DzContextMenuItem,
    DzContextMenuSeparator,
  },
  tags: ['autodocs'],
  argTypes: {
    // Behavior
    modal: {
      control: 'boolean',
      description: 'Whether the context menu is modal (traps focus)',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof DzContextMenu>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: args => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    setup() {
      return { args }
    },
    template: `
      <DzContextMenu v-bind="args">
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-gray-500 select-none">
            Right-click anywhere in this area
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem>Edit</DzContextMenuItem>
          <DzContextMenuItem>Duplicate</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Archive</DzContextMenuItem>
          <DzContextMenuItem>Delete</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Disabled Items
// ---------------------------------------------------------------------------

export const WithDisabledItems: Story = {
  name: 'With Disabled Items',
  render: () => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-gray-500 select-none">
            Right-click to see disabled items
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem>Copy</DzContextMenuItem>
          <DzContextMenuItem>Cut</DzContextMenuItem>
          <DzContextMenuItem disabled>Paste (clipboard empty)</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Select All</DzContextMenuItem>
          <DzContextMenuItem disabled>Undo (nothing to undo)</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// With Separator Groups
// ---------------------------------------------------------------------------

export const WithSeparatorGroups: Story = {
  name: 'With Separator Groups',
  render: () => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-gray-500 select-none">
            Right-click for grouped menu
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem>New File</DzContextMenuItem>
          <DzContextMenuItem>New Folder</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Rename</DzContextMenuItem>
          <DzContextMenuItem>Move To...</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Download</DzContextMenuItem>
          <DzContextMenuItem>Share</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Delete</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Interactive: Event Handling
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    data() {
      return { lastAction: 'None', actionCount: 0 }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm">Last action: <strong>{{ lastAction }}</strong> ({{ actionCount }} total)</p>
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-gray-500 select-none">
              Right-click to select an action
            </div>
          </DzContextMenuTrigger>
          <DzContextMenuContent>
            <DzContextMenuItem @select="lastAction = 'Edit'; actionCount++">Edit</DzContextMenuItem>
            <DzContextMenuItem @select="lastAction = 'Duplicate'; actionCount++">Duplicate</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem @select="lastAction = 'Archive'; actionCount++">Archive</DzContextMenuItem>
            <DzContextMenuItem @select="lastAction = 'Delete'; actionCount++">Delete</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>
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
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center text-sm text-gray-400 select-none">
            Right-click in dark mode
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem>Edit</DzContextMenuItem>
          <DzContextMenuItem>Duplicate</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Delete</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: Keyboard Navigation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: Keyboard Navigation',
  render: () => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Right-click the area to open. Use ArrowUp/ArrowDown to navigate items.
          Press Enter to select, Escape to close. Disabled items are skipped.
        </p>
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-gray-500 select-none">
              Right-click for accessible menu
            </div>
          </DzContextMenuTrigger>
          <DzContextMenuContent aria-label="File actions">
            <DzContextMenuItem>Copy</DzContextMenuItem>
            <DzContextMenuItem>Cut</DzContextMenuItem>
            <DzContextMenuItem disabled>Paste (disabled)</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem>Select All</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Real World: File Explorer
// ---------------------------------------------------------------------------

export const RealWorldFileExplorer: Story = {
  name: 'Real World: File Explorer',
  render: () => ({
    components: { DzContextMenu, DzContextMenuTrigger, DzContextMenuContent, DzContextMenuItem, DzContextMenuSeparator },
    data() {
      return {
        files: [
          { name: 'Documents', type: 'folder' },
          { name: 'report.pdf', type: 'file' },
          { name: 'image.png', type: 'file' },
          { name: 'notes.txt', type: 'file' },
        ],
      }
    },
    template: `
      <div class="space-y-1 max-w-sm">
        <DzContextMenu v-for="file in files" :key="file.name">
          <DzContextMenuTrigger>
            <div class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-default select-none text-sm">
              <span>{{ file.type === 'folder' ? '&#128193;' : '&#128196;' }}</span>
              <span>{{ file.name }}</span>
            </div>
          </DzContextMenuTrigger>
          <DzContextMenuContent>
            <DzContextMenuItem>Open</DzContextMenuItem>
            <DzContextMenuItem>Rename</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem>Copy</DzContextMenuItem>
            <DzContextMenuItem>Move To...</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem>Download</DzContextMenuItem>
            <DzContextMenuItem>Share</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem>Delete</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>
      </div>
    `,
  }),
}
