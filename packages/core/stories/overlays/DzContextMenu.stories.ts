import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import {
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
} from '../../src/components/overlays'
import { a11yError, darkModeDecorator } from '../_shared'

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
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Overlays enforced (TASK-DS-13).
    ...a11yError,
  },
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
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    setup() {
      return { args }
    },
    template: `
      <DzContextMenu v-bind="args">
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    data() {
      return { lastAction: 'None', actionCount: 0 }
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm">Last action: <strong>{{ lastAction }}</strong> ({{ actionCount }} total)</p>
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    template: `
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="border-2 border-dashed border-[var(--dz-border)] rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Right-click the area to open. Use ArrowUp/ArrowDown to navigate items.
          Press Enter to select, Escape to close. Disabled items are skipped.
        </p>
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div class="border-2 border-dashed rounded-lg p-12 text-center text-sm text-[var(--dz-muted-foreground)] select-none">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const triggerArea = canvas.getByText(/right-click for accessible menu/i)

    // Right-click to open the context menu (portalled to document.body).
    await userEvent.pointer({ target: triggerArea, keys: '[MouseRight]' })
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()

    // Disabled item carries aria-disabled.
    const disabledItem = within(menu).getByRole('menuitem', { name: /paste \(disabled\)/i })
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true')

    // Escape dismisses the menu.
    await userEvent.keyboard('{Escape}')
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Real World: File Explorer
// ---------------------------------------------------------------------------

export const RealWorldFileExplorer: Story = {
  name: 'Real World: File Explorer',
  render: () => ({
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
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
            <div class="flex items-center gap-3 px-3 py-2 rounded hover:bg-[var(--dz-muted)] cursor-default select-none text-sm">
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

// ---------------------------------------------------------------------------
// States — closed / open / disabled item (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The states of a right-click menu: closed (nothing in the document — the panel
 * is portalled and unmounted, so it cannot be reached by Tab or read by a screen
 * reader), open, and `disabled` on an individual command.
 *
 * `disabled` is the state the component declares, and the contract this story
 * pins is that a disabled command stays **listed** — announced with
 * `aria-disabled` so the user learns the action exists and why it is
 * unavailable — while the roving highlight steps over it and selecting it does
 * nothing.
 */
export const States: Story = {
  render: () => ({
    components: {
      DzContextMenu,
      DzContextMenuTrigger,
      DzContextMenuContent,
      DzContextMenuItem,
      DzContextMenuSeparator,
    },
    data() {
      return { ran: 'nothing' }
    },
    template: `
      <div class="space-y-4">
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div class="select-none rounded-lg border-2 border-dashed p-12 text-center text-sm text-[var(--dz-muted-foreground)]">
              Right-click this area
            </div>
          </DzContextMenuTrigger>
          <DzContextMenuContent aria-label="Clipboard actions">
            <DzContextMenuItem @select="ran = 'Copy'">Copy</DzContextMenuItem>
            <DzContextMenuItem disabled @select="ran = 'Paste'">Paste (clipboard empty)</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem @select="ran = 'Select all'">Select all</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Ran: <strong data-testid="cm-ran">{{ ran }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const area = canvas.getByText(/right-click this area/i)

    // Closed: not hidden — absent.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    // Open on right-click, with a named menu.
    await userEvent.pointer({ target: area, keys: '[MouseRight]' })
    const menu = await screen.findByRole('menu')
    await expect(menu).toHaveAccessibleName('Clipboard actions')

    // Disabled: listed and announced, not removed.
    const paste = within(menu).getByRole('menuitem', { name: /paste \(clipboard empty\)/i })
    await expect(paste).toHaveAttribute('aria-disabled', 'true')
    await expect(paste).toHaveAttribute('data-disabled')
    await expect(within(menu).getByRole('menuitem', { name: /^copy$/i }))
      .not
      .toHaveAttribute('aria-disabled')

    // The roving highlight steps over the disabled command.
    await userEvent.keyboard('{ArrowDown}')
    await expect(paste).not.toHaveAttribute('data-highlighted')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: /select all/i }))
        .toHaveAttribute('data-highlighted'),
    )
    await expect(paste).not.toHaveAttribute('data-highlighted')

    // Enter runs the highlighted command and returns to the closed state.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await expect(canvas.getByTestId('cm-ran')).toHaveTextContent('Select all')
  },
}
