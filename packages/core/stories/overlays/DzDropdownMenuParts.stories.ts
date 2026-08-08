import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
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
 * DzDropdownMenuContent compound sub-parts: DzDropdownMenuTrigger, DzDropdownMenuItem,
 * DzDropdownMenuSeparator.
 *
 * DzDropdownMenuContent is the floating panel rendered when the trigger is activated
 * (click or keyboard). It receives `role="menu"` automatically from Reka UI DropdownMenu
 * (ADR-07). Open state is controlled via `v-model:open` on the root DzDropdownMenu.
 *
 * Unlike DzContextMenu, DzDropdownMenu responds to explicit click (not right-click).
 */

const meta = {
  title: 'Core/Overlays/DzDropdownMenuParts',
  component: DzDropdownMenuContent,
  subcomponents: {
    DzDropdownMenuTrigger,
    DzDropdownMenuItem,
    DzDropdownMenuSeparator,
  },
  tags: ['autodocs', 'status:stable'],
  parameters: {
    // Overlays enforced (TASK-DS-13).
    ...a11yError,
  },
  argTypes: {
    portalDisabled: {
      control: 'boolean',
      description: 'Render the menu inline instead of teleporting it',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
    },
    portalDefer: {
      control: 'boolean',
      description: 'Defer portal target resolution until the application has mounted',
      table: { category: 'Portal', defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof DzDropdownMenuContent>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
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
      <DzDropdownMenu>
        <!-- DzDropdownMenuTrigger: the element that opens the menu on click -->
        <DzDropdownMenuTrigger as-child>
          <DzButton variant="outline">Options</DzButton>
        </DzDropdownMenuTrigger>

        <!-- DzDropdownMenuContent: the floating panel portaled to document.body -->
        <DzDropdownMenuContent>
          <!-- DzDropdownMenuItem: individual selectable option -->
          <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
          <DzDropdownMenuItem>Duplicate</DzDropdownMenuItem>
          <DzDropdownMenuItem>Archive</DzDropdownMenuItem>

          <!-- DzDropdownMenuSeparator: visual divider between item groups -->
          <DzDropdownMenuSeparator />

          <DzDropdownMenuItem>Move to Trash</DzDropdownMenuItem>
        </DzDropdownMenuContent>
      </DzDropdownMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /options/i })

    // Menu is closed initially
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Click trigger to open menu
    await userEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

    // Menu panel is portaled to document.body — query from there
    const body = within(document.body)
    const menu = body.getByRole('menu')
    await expect(menu).toBeVisible()

    // All menu items are present
    const items = body.getAllByRole('menuitem')
    await expect(items.length).toBeGreaterThan(0)

    // Escape dismisses the menu
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  },
}

// ---------------------------------------------------------------------------
// Compound Composition: annotated anatomy of all sub-parts
// ---------------------------------------------------------------------------

export const CompoundComposition: Story = {
  name: 'Compound: All Sub-Parts',
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
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzDropdownMenu is a compound component. All four sub-parts are shown here:
          <code>DzDropdownMenuTrigger</code>, <code>DzDropdownMenuContent</code>,
          <code>DzDropdownMenuItem</code>, and <code>DzDropdownMenuSeparator</code>.
        </p>

        <!-- DzDropdownMenu: invisible root that manages open state and portal context -->
        <DzDropdownMenu>
          <!-- DzDropdownMenuTrigger: click target; as-child delegates to DzButton -->
          <DzDropdownMenuTrigger as-child>
            <DzButton tone="primary">Open (DzDropdownMenuTrigger)</DzButton>
          </DzDropdownMenuTrigger>

          <!-- DzDropdownMenuContent: floating menu panel (role="menu") -->
          <DzDropdownMenuContent>
            <!-- DzDropdownMenuItem: individual menu action (role="menuitem") -->
            <DzDropdownMenuItem>Edit (DzDropdownMenuItem)</DzDropdownMenuItem>
            <DzDropdownMenuItem>Duplicate</DzDropdownMenuItem>

            <!-- DzDropdownMenuSeparator: divides groups of related items -->
            <DzDropdownMenuSeparator />  <!-- DzDropdownMenuSeparator -->

            <DzDropdownMenuItem>Move to Trash</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>

        <!-- Anatomy map -->
        <div
          class="rounded border border-[var(--dz-border)] px-3 py-2 text-xs font-mono space-y-0.5 max-w-lg"
          style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
        >
          <p>&lt;DzDropdownMenu&gt;                &lt;!-- root, v-model:open --&gt;</p>
          <p class="pl-4">&lt;DzDropdownMenuTrigger /&gt;     &lt;!-- click target --&gt;</p>
          <p class="pl-4">&lt;DzDropdownMenuContent&gt;       &lt;!-- floating panel --&gt;</p>
          <p class="pl-8">&lt;DzDropdownMenuItem /&gt;        &lt;!-- role="menuitem" --&gt;</p>
          <p class="pl-8">&lt;DzDropdownMenuSeparator /&gt;   &lt;!-- divider --&gt;</p>
          <p class="pl-8">&lt;DzDropdownMenuItem /&gt;</p>
          <p class="pl-4">&lt;/DzDropdownMenuContent&gt;</p>
          <p>&lt;/DzDropdownMenu&gt;</p>
        </div>
      </div>
    `,
  }),
}

// ---------------------------------------------------------------------------
// Accessibility: role=menu explanation
// ---------------------------------------------------------------------------

export const Accessibility: Story = {
  name: 'Accessibility: role=menu',
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
      <div class="space-y-4">
        <p class="text-sm max-w-lg" style="color: var(--dz-muted-foreground);">
          DzDropdownMenuContent receives <code>role="menu"</code> from Reka UI.
          Each <code>DzDropdownMenuItem</code> receives <code>role="menuitem"</code>.
          Arrow keys navigate between items; Enter or Space activates the focused item.
          Escape dismisses the menu; focus returns to the trigger element.
          The trigger button exposes <code>aria-haspopup="menu"</code> and
          <code>aria-expanded</code> toggled by Reka UI automatically.
        </p>
        <DzDropdownMenu>
          <DzDropdownMenuTrigger as-child>
            <DzButton>Open Accessible Menu</DzButton>
          </DzDropdownMenuTrigger>
          <DzDropdownMenuContent>
            <DzDropdownMenuItem>Profile</DzDropdownMenuItem>
            <DzDropdownMenuItem>Settings</DzDropdownMenuItem>
            <DzDropdownMenuSeparator />
            <DzDropdownMenuItem>Sign out</DzDropdownMenuItem>
          </DzDropdownMenuContent>
        </DzDropdownMenu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /open accessible menu/i })

    // Trigger exposes aria-haspopup="menu"
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

    // Tab to trigger and open with Enter key
    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

    const body = within(document.body)
    const menu = body.getByRole('menu')
    await expect(menu).toBeVisible()

    // Arrow-down moves focus through menu items
    await userEvent.keyboard('{ArrowDown}')
    const items = body.getAllByRole('menuitem')
    await expect(items.length).toBeGreaterThan(0)

    // Escape closes the menu and returns focus to the trigger
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  },
}
