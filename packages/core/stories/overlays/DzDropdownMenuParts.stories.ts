import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { darkModeDecorator } from '../_shared'
import { DzButton } from '../../src/components/buttons'
import {
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
} from '../../src/components/overlays'

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
          class="rounded border px-3 py-2 text-xs font-mono space-y-0.5 max-w-lg"
          style="border-color: var(--dz-border); color: var(--dz-muted-foreground);"
        >
          <p>&lt;DzDropdownMenu&gt;                <!-- root, v-model:open --&gt;</p>
          <p class="pl-4">&lt;DzDropdownMenuTrigger /&gt;     <!-- click target --&gt;</p>
          <p class="pl-4">&lt;DzDropdownMenuContent&gt;       <!-- floating panel --&gt;</p>
          <p class="pl-8">&lt;DzDropdownMenuItem /&gt;        <!-- role="menuitem" --&gt;</p>
          <p class="pl-8">&lt;DzDropdownMenuSeparator /&gt;   <!-- divider --&gt;</p>
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
}
