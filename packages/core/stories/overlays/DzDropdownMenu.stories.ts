import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { DzButton } from '../../src/components/buttons'
import {
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
} from '../../src/components/overlays'
import { a11yError, darkModeDecorator } from '../_shared'

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
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Overlays enforced (TASK-DS-13).
    ...a11yError,
  },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzButton,
    },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open the menu by clicking the trigger.
    await userEvent.click(canvas.getByRole('button', { name: /^actions$/i }))

    // Menu is portalled to body — find by role="menu".
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()

    // Click "Edit" and assert the lastAction text updates.
    await userEvent.click(within(menu).getByRole('menuitem', { name: /^edit$/i }))
    await expect(canvas.getByText(/edit/i)).toBeInTheDocument()

    // Menu closes after selection.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  },
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

export const DarkMode: Story = {
  name: 'Dark Mode Preview',
  decorators: [darkModeDecorator],
  render: () => ({
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
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
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
    template: `
      <div class="space-y-4">
        <p class="text-sm text-[var(--dz-muted-foreground)]">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open via click; Reka portals the menu to document.body.
    await userEvent.click(canvas.getByRole('button', { name: /open actions menu/i }))
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()

    // Disabled item is present but aria-disabled.
    const disabledItem = within(menu).getByRole('menuitem', { name: /move \(disabled\)/i })
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true')

    // Escape dismisses the menu and returns focus to the trigger.
    await userEvent.keyboard('{Escape}')
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: /open actions menu/i })).toHaveFocus()
  },
}

// ---------------------------------------------------------------------------
// Real World: User Account Menu
// ---------------------------------------------------------------------------

export const RealWorldAccountMenu: Story = {
  name: 'Real World: User Account Menu',
  render: () => ({
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
    template: `
      <div class="flex justify-end py-4 px-4">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <button class="flex items-center gap-2 rounded-full border border-[var(--dz-border)] px-3 py-1.5 text-sm hover:bg-[var(--dz-muted)]">
              <span class="w-6 h-6 rounded-full bg-[var(--dz-primary-muted)] flex items-center justify-center text-[var(--dz-primary-muted-foreground)] text-xs font-medium">J</span>
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

// ---------------------------------------------------------------------------
// States — closed / open / disabled item (tier B `states` DoD item)
// ---------------------------------------------------------------------------

/**
 * The three states a dropdown menu has: closed (the panel is unmounted, not
 * hidden), open (the trigger reports `aria-expanded` and a real `role="menu"`
 * exists), and `disabled` on an individual item.
 *
 * `disabled` is the state the component declares, and its contract is specific:
 * the item stays listed and announced with `aria-disabled` — so the user learns
 * the action exists but is unavailable — while the roving highlight steps over
 * it and activation does nothing. The play function drives all three.
 */
export const States: Story = {
  render: () => ({
    components: {
      DzDropdownMenu,
      DzDropdownMenuTrigger,
      DzDropdownMenuContent,
      DzDropdownMenuItem,
      DzDropdownMenuSeparator,
      DzButton,
    },
    data() {
      return { chosen: 'nothing' }
    },
    template: `
      <div class="flex flex-col items-center gap-4 py-8">
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <DzButton variant="outline">Row actions</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem @select="chosen = 'Edit'">Edit</DzDropdownMenuItem>
            <DzDropdownMenuItem disabled @select="chosen = 'Move'">Move (no permission)</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem @select="chosen = 'Duplicate'">Duplicate</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
        <p class="text-sm text-[var(--dz-muted-foreground)]">
          Chose: <strong data-testid="dm-chosen">{{ chosen }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /row actions/i })

    // Closed: the menu is not in the document, and the trigger says so.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    // Open: the trigger flips `aria-expanded` and a real `role="menu"` appears.
    await userEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    await expect(menu).toBeVisible()

    // Disabled: listed, announced, and flagged for the styling contract.
    const move = within(menu).getByRole('menuitem', { name: /move \(no permission\)/i })
    await expect(move).toHaveAttribute('aria-disabled', 'true')
    await expect(move).toHaveAttribute('data-disabled')

    // The roving highlight steps over it — ArrowDown twice reaches `Duplicate`,
    // never the disabled row between them.
    await userEvent.keyboard('{ArrowDown}')
    await expect(move).not.toHaveAttribute('data-highlighted')
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: /duplicate/i }))
        .toHaveAttribute('data-highlighted'),
    )
    await expect(move).not.toHaveAttribute('data-highlighted')

    // Activating the highlighted item closes the menu and reaches the page.
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await expect(canvas.getByTestId('dm-chosen')).toHaveTextContent('Duplicate')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}
