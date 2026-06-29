import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import {
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
} from '../../src/components/overlays'
import { darkModeDecorator } from '../_shared'

/**
 * DzContextMenuContent compound sub-parts: DzContextMenuTrigger, DzContextMenuItem,
 * DzContextMenuSeparator.
 *
 * DzContextMenuContent is the floating menu panel that appears on right-click of
 * the trigger zone. It receives `role="menu"` automatically from Reka UI ContextMenu
 * (ADR-07). All appearance tokens are inherited from the parent DzContextMenu context.
 *
 * Unlike DzDropdownMenu, DzContextMenu does NOT support v-model:open — it opens
 * exclusively on the contextmenu (right-click) event.
 */

const meta = {
  title: 'Core/Overlays/DzContextMenuParts',
  component: DzContextMenuContent,
  subcomponents: {
    DzContextMenuTrigger,
    DzContextMenuItem,
    DzContextMenuSeparator,
  },
  tags: ['autodocs', 'status:stable'],
} satisfies Meta<typeof DzContextMenuContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default: right-click trigger zone with items and separator
// ---------------------------------------------------------------------------

export const Default: Story = {
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
        <!-- DzContextMenuTrigger: the zone that listens for the right-click event -->
        <DzContextMenuTrigger>
          <div
            class="flex h-36 w-72 items-center justify-center rounded-lg border-2 border-dashed text-sm select-none"
            style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
          >
            Right-click here to open the menu
          </div>
        </DzContextMenuTrigger>

        <!-- DzContextMenuContent: the floating panel, portaled to document.body -->
        <DzContextMenuContent>
          <!-- DzContextMenuItem: individual selectable option -->
          <DzContextMenuItem>Open</DzContextMenuItem>
          <DzContextMenuItem>Rename</DzContextMenuItem>
          <DzContextMenuItem>Duplicate</DzContextMenuItem>

          <!-- DzContextMenuSeparator: visual divider between item groups -->
          <DzContextMenuSeparator />

          <DzContextMenuItem>Share</DzContextMenuItem>
          <DzContextMenuItem>Move to Trash</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Right-click the trigger zone to open the context menu
    const trigger = canvas.getByText(/right-click here to open the menu/i)
    await userEvent.pointer({ target: trigger, keys: '[MouseRight]' })

    // Menu panel is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('menu')).toBeVisible())

    // All five menu items must be present
    const items = screen.getAllByRole('menuitem')
    await expect(items.length).toBeGreaterThan(0)
    await expect(items.length).toBe(5)

    // Press Escape — menu should close
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

// ---------------------------------------------------------------------------
// Compound Composition: annotated anatomy of all sub-parts
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound: All Sub-Parts',
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
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzContextMenu is a compound component. All four sub-parts are shown here:
          <code>DzContextMenuTrigger</code>, <code>DzContextMenuContent</code>,
          <code>DzContextMenuItem</code>, and <code>DzContextMenuSeparator</code>.
          Right-click the zone below to open.
        </p>

        <!-- DzContextMenu: invisible root that manages open state and portal context -->
        <DzContextMenu>
          <!-- DzContextMenuTrigger: right-click target zone -->
          <DzContextMenuTrigger>
            <div
              class="flex h-36 w-72 items-center justify-center rounded-lg border-2 border-dashed text-sm select-none"
              style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
            >
              Right-click this area
            </div>
          </DzContextMenuTrigger>

          <!-- DzContextMenuContent: floating menu panel (role="menu") -->
          <DzContextMenuContent>
            <!-- DzContextMenuItem: individual menu action (role="menuitem") -->
            <DzContextMenuItem>Open (DzContextMenuItem)</DzContextMenuItem>
            <DzContextMenuItem>Rename</DzContextMenuItem>

            <!-- DzContextMenuSeparator: divides groups of related items -->
            <DzContextMenuSeparator />  <!-- DzContextMenuSeparator -->

            <DzContextMenuItem>Move to Trash</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>

        <!-- Anatomy map -->
        <div
          class="rounded border px-3 py-2 text-xs font-mono space-y-0.5 max-w-lg"
          style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
        >
          <p>&lt;DzContextMenu&gt;              <!-- root, manages open state --&gt;</p>
          <p class="pl-4">&lt;DzContextMenuTrigger&gt;    <!-- right-click zone --&gt;</p>
          <p class="pl-8">...trigger content...</p>
          <p class="pl-4">&lt;/DzContextMenuTrigger&gt;</p>
          <p class="pl-4">&lt;DzContextMenuContent&gt;   <!-- floating panel --&gt;</p>
          <p class="pl-8">&lt;DzContextMenuItem /&gt;    <!-- role="menuitem" --&gt;</p>
          <p class="pl-8">&lt;DzContextMenuSeparator /&gt; <!-- divider --&gt;</p>
          <p class="pl-8">&lt;DzContextMenuItem /&gt;</p>
          <p class="pl-4">&lt;/DzContextMenuContent&gt;</p>
          <p>&lt;/DzContextMenu&gt;</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Right-click the annotated trigger zone
    const trigger = canvas.getByText(/right-click this area/i)
    await userEvent.pointer({ target: trigger, keys: '[MouseRight]' })

    // Menu panel is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('menu')).toBeVisible())

    // Three DzContextMenuItems are rendered (Open, Rename, Move to Trash)
    const items = screen.getAllByRole('menuitem')
    await expect(items.length).toBe(3)

    // Escape closes the menu
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

// ---------------------------------------------------------------------------
// Accessibility: role=menu explanation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role=menu',
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
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzContextMenuContent receives <code>role="menu"</code> from Reka UI.
          Each <code>DzContextMenuItem</code> receives <code>role="menuitem"</code>.
          Arrow keys navigate between items; Enter or Space activates the focused item.
          Escape dismisses the menu and returns focus to the document.
          Right-click the zone below to verify keyboard navigation.
        </p>
        <DzContextMenu>
          <DzContextMenuTrigger>
            <div
              class="flex h-36 w-72 items-center justify-center rounded-lg border-2 border-dashed text-sm select-none"
              style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
            >
              Right-click to open accessible menu
            </div>
          </DzContextMenuTrigger>
          <DzContextMenuContent>
            <DzContextMenuItem>Cut</DzContextMenuItem>
            <DzContextMenuItem>Copy</DzContextMenuItem>
            <DzContextMenuItem>Paste</DzContextMenuItem>
            <DzContextMenuSeparator />
            <DzContextMenuItem>Select All</DzContextMenuItem>
          </DzContextMenuContent>
        </DzContextMenu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Right-click to open the accessible context menu
    const trigger = canvas.getByText(/right-click to open accessible menu/i)
    await userEvent.pointer({ target: trigger, keys: '[MouseRight]' })

    // Menu panel is portalled to document.body — use screen, not canvas.
    await waitFor(() => expect(screen.getByRole('menu')).toBeVisible())

    // Four items: Cut, Copy, Paste, Select All
    const items = screen.getAllByRole('menuitem')
    await expect(items.length).toBe(4)

    // Arrow-down navigates items (Reka UI manages highlight internally)
    await userEvent.keyboard('{ArrowDown}')

    // Escape dismisses and menu is no longer visible
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}
